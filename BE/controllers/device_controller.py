"""
FILE: controllers/device_controller.py
MÔ TẢ: 
    Module Controller xử lý logic nghiệp vụ cho việc truy xuất dữ liệu thiết bị.
"""
from sqlmodel import Session, select
from sqlalchemy import func,or_,extract
from fastapi import HTTPException
from models.device import Device, ActionLog
from schemas.device import ActionLogSearchRequest, ActionLogResponse
from utils.time_utils import get_vietnam_time
from mqtt_client import publish_command
from socket_manager import manager
import time
import math

DEVICE_LED_MAP = {
    "LIGHT_01": "red",
    "FAN_01":   "green",
    "DEHUM_01": "yellow",
}

def control_device(device_code: str, db: Session):
    """
    Bật / Tắt thiết bị:
    - Xác định trạng thái hiện tại từ ActionLog mới nhất
    - Gửi lệnh MQTT đảo ngược trạng thái (red:on / red:off...)
    - Lưu ActionLog mới vào DB
    """
    device = db.exec(select(Device).where(Device.device_code == device_code)).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device '{device_code}' not found")

    led = DEVICE_LED_MAP.get(device_code)
    if not led:
        raise HTTPException(status_code=400, detail=f"No LED mapping for device '{device_code}'")

    latest_log = db.exec(
        select(ActionLog)
        .where(ActionLog.device_id == device.id)
        .order_by(ActionLog.created_at.desc())
    ).first()

    current_status = latest_log.device_status if latest_log else "OFF"
    actual_status = current_status if current_status in ["ON", "OFF"] else "OFF"
    new_status = "OFF" if actual_status == "ON" else "ON"
    action_label = "Turn On" if new_status == "ON" else "Turn Off"
    mqtt_cmd = f"{led}:{'on' if new_status == 'ON' else 'off'}"

    log = ActionLog(
        device_id=device.id,
        action=action_label,
        device_status="Waiting",
        created_at=get_vietnam_time(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Broadcast "Waiting" status to WebSockets
    manager.broadcast_threadsafe({
        "type": "device_update",
        "data": {
            "device_code": device_code,
            "device_status": "Waiting",
            "last_action": action_label
        }
    })

    try:
        publish_command(mqtt_cmd)
        print(f"[Device Controller] Sent command: {mqtt_cmd} for ActionLog {log.id}")
    except Exception as e:
        log.device_status = "Fail"
        db.add(log)
        db.commit()
        raise HTTPException(status_code=503, detail=f"MQTT publish failed: {str(e)}")

    timeout = 10.0 # Tăng timeout lên 10s cho chắc chắn
    start_time = time.time()
    while time.time() - start_time < timeout:
        db.refresh(log) # Lấy dữ liệu mới nhất từ DB (mới update bởi subscriber thread)
        
        if log.device_status != "Waiting":
            return {
                "device_code": device_code,
                "action": log.action,
                "device_status": log.device_status,
                "mqtt_command": mqtt_cmd,
            }
        time.sleep(0.5)

    # Nếu quá timeout mà vẫn Waiting, revert trạng thái cũ
    revert_log = ActionLog(
        device_id=device.id,
        action="Timeout Revert",
        device_status=actual_status,
        created_at=get_vietnam_time()
    )
    db.add(revert_log)
    db.commit()

    # Broadcast để UI hết hiện "Waiting"
    manager.broadcast_threadsafe({
        "type": "device_update",
        "data": {
            "device_code": device_code,
            "device_status": actual_status,
            "last_action": "Timeout Revert"
        }
    })

    raise HTTPException(status_code=504, detail="Phần cứng không phản hồi kịp (Timeout)")

def get_devices_with_status(db: Session):
    devices = db.exec(select(Device)).all()
    result = []
    for device in devices:
        latest_log = db.exec(
            select(ActionLog)
            .where(ActionLog.device_id == device.id)
            .order_by(ActionLog.created_at.desc())
        ).first()
        result.append({
            "id": device.id,
            "device_code": device.device_code,
            "name": device.name,
            "type": device.type,
            "description": device.description,
            "device_status": latest_log.device_status if latest_log else "OFF",
            "last_action": latest_log.action if latest_log else None,
        })
    return result


def search_device_logs(db: Session, request: ActionLogSearchRequest):
    query = select(ActionLog, Device).join(Device)
    count_query = select(func.count()).select_from(ActionLog).join(Device)

    filters = []

    # 1. Xử lý logic tìm kiếm tổng hợp (q)
    if request.q:
        import re
        from sqlalchemy import or_, extract
        val = request.q.strip()

        # Regex cho định dạng Giờ:Phút:Giây (21:12:42)
        time_match = re.search(r'(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?', val)
        # Regex cho định dạng Ngày/Tháng/Năm (26/3/2026)
        date_match = re.search(r'(\d{1,2})/(\d{1,2})(?:/(\d{4}))?', val)
        # Regex cho các token lẻ (16h, 30p, 12s)
        h_match = re.search(r'(\d+)\s*h', val.lower())
        m_match = re.search(r'(\d+)\s*p', val.lower())
        s_match = re.search(r'(\d+)\s*s', val.lower())

        is_temporal = time_match or date_match or h_match or m_match or s_match

        if is_temporal:
            if time_match:
                filters.append(extract('hour', ActionLog.created_at) == int(time_match.group(1)))
                filters.append(extract('minute', ActionLog.created_at) == int(time_match.group(2)))
                if time_match.group(3):
                    filters.append(func.floor(extract('second', ActionLog.created_at)) == int(time_match.group(3)))
            if date_match:
                filters.append(extract('day', ActionLog.created_at) == int(date_match.group(1)))
                filters.append(extract('month', ActionLog.created_at) == int(date_match.group(2)))
                if date_match.group(3):
                    filters.append(extract('year', ActionLog.created_at) == int(date_match.group(3)))
            
            if h_match:
                filters.append(extract('hour', ActionLog.created_at) == int(h_match.group(1)))
            if m_match:
                filters.append(extract('minute', ActionLog.created_at) == int(m_match.group(1)))
            if s_match:
                filters.append(extract('second', ActionLog.created_at) == int(s_match.group(1)))
        else:
            filters.append(or_(
                Device.device_code.ilike(f"%{val}%"),
                Device.name.ilike(f"%{val}%"),
                Device.type.ilike(f"%{val}%"),
                ActionLog.action.ilike(f"%{val}%"),
                ActionLog.device_status.ilike(f"%{val}%")
            ))

    if request.type:
        filters.append(Device.type == request.type)
    if filters:
        query = query.where(*filters)
        count_query = count_query.where(*filters)

    if request.sort_type == "asc":
        query = query.order_by(ActionLog.created_at.asc())
    else:
        query = query.order_by(ActionLog.created_at.desc())

    # 5. Thực thi query đếm tổng số lượng bản ghi
    total = db.exec(count_query).one()

    # 6. Xử lý phân trang
    limit = request.page_size
    offset = (request.page - 1) * limit
    query = query.limit(limit).offset(offset)
    
    # 7. Thực thi query lấy dữ liệu
    results = db.exec(query).all()

    # 8. Format dữ liệu trả về
    data = []
    for log, device in results:
        data.append(ActionLogResponse(
            id=log.id,
            device_id=log.device_id,
            action=log.action,
            device_status=log.device_status,
            created_at=log.created_at,
            device_code=device.device_code,
            device_name=device.name,
            device_type=device.type
        ))

    total_pages = math.ceil(total / limit) if limit > 0 else 0

    return {
        "data": data,
        "total": total,
        "page": request.page,
        "page_size": limit,
        "total_pages": total_pages
    }