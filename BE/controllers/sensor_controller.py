"""
FILE: controllers/sensor_controller.py
MÔ TẢ: 
    Module Controller xử lý logic nghiệp vụ cho việc truy xuất dữ liệu cảm biến.

CÁC HÀM:
    - get_dashboard_stats(db: Session) -> DashboardStats:
        Lấy nhật ký cảm biến gần nhất cho các loại cảm biến cụ thể (Nhiệt độ, Độ ẩm, Ánh sáng)
        để hiển thị lên các thẻ thống kê trên dashboard.
        Ưu tiên đọc từ cache MQTT real-time, fallback về truy vấn database nếu chưa có dữ liệu MQTT.
        
    - get_dashboard_chart(db: Session, time_range: str) -> List[DashboardChartData]:
        Lấy lịch sử nhật ký cảm biến được lọc theo khoảng thời gian (ví dụ: '1h', '5h', '24h')
        và định dạng lại để hiển thị trên biểu đồ dashboard.

    - search_sensor_logs(db: Session, request: SensorLogSearchRequest) -> dict:
        Tìm kiếm và lọc nhật ký cảm biến theo các tiêu chí: mã cảm biến (sensor_code),
        giờ/phút/giây (hour, minute, second). Hỗ trợ sắp xếp (asc/desc) và phân trang
        (page, page_size). Trả về danh sách log kèm tổng số bản ghi và tổng số trang.
"""
from sqlmodel import Session, select
from sqlalchemy import desc, extract, func,or_
from typing import List
from models.sensor import Sensor, SensorLog
from schemas.sensor import DashboardStats, DashboardStatItem, DashboardChartData, ChartDataPoint, SensorLogSearchRequest, SensorLogResponse
from utils.time_utils import get_vietnam_time
from datetime import datetime, timedelta
import re
import math

def get_dashboard_stats(db: Session):
    stats = {}

    try:
        from mqtt_subscriber import LATEST_SENSOR_DATA
        if LATEST_SENSOR_DATA["timestamp"] is not None:
            stats["temperature"] = {"value": LATEST_SENSOR_DATA["temperature"], "unit": "°C"}
            stats["humidity"] = {"value": LATEST_SENSOR_DATA["humidity"], "unit": "%"}
            stats["light"] = {"value": LATEST_SENSOR_DATA["light"], "unit": " Lux"}
            return stats
    except ImportError:
        pass

    mapping = [("temperature", "temp"), ("humidity", "hum"), ("light", "light")]
    
    for key, prefix in mapping:
        statement = select(Sensor).where(Sensor.sensor_code.like(f"{prefix}%"))
        sensor = db.exec(statement).first()
        
        if not sensor:
            stats[key] = None
            continue
            
        log_statement = select(SensorLog).where(SensorLog.sensor_id == sensor.id).order_by(SensorLog.created_at.desc())
        latest_log = db.exec(log_statement).first()
        
        if not latest_log:
            stats[key] = None
            continue
            
        stats[key] = {
            "value": latest_log.value,
            "unit": sensor.unit
        }
        
    return stats

def get_dashboard_chart(db: Session, time_range: str) -> List[DashboardChartData]:
    now = get_vietnam_time()
    if time_range == "5h":
        start_time = now - timedelta(hours=5)
    elif time_range == "24h":
        start_time = now - timedelta(hours=24)
    else: 
        start_time = now - timedelta(hours=1)

    sensor_types = ["temp", "hum", "light"]
    result = []

    for s_type in sensor_types:
        statement = select(Sensor).where(Sensor.sensor_code.like(f"{s_type}%"))
        sensor = db.exec(statement).first()
        print(f"Processing sensor type '{s_type}' with sensor: {sensor}")
        if sensor:
            log_statement = select(SensorLog).where(
                SensorLog.sensor_id == sensor.id,
                SensorLog.created_at >= start_time
            ).order_by(SensorLog.created_at.asc())
            
            logs = db.exec(log_statement).all()

            data_points = [ChartDataPoint(timestamp=log.created_at, value=log.value) for log in logs]
            result.append(DashboardChartData(label=sensor.name, data=data_points))
    
    return result


def search_sensor_logs(db: Session, request: SensorLogSearchRequest):
    query = select(SensorLog, Sensor).join(Sensor)
    count_query = select(func.count()).select_from(SensorLog).join(Sensor)

    filters = []

    if request.q:
        import re
        from sqlalchemy import or_, extract, cast, String
        val = request.q.strip()

        time_match = re.search(r'(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?', val)
        date_match = re.search(r'(\d{1,2})/(\d{1,2})(?:/(\d{4}))?', val)
        h_match = re.search(r'(\d+)\s*h', val.lower())
        m_match = re.search(r'(\d+)\s*p', val.lower())
        s_match = re.search(r'(\d+)\s*s', val.lower())

        is_temporal = time_match or date_match or h_match or m_match or s_match

        if is_temporal:
            if time_match:
                filters.append(extract('hour', SensorLog.created_at) == int(time_match.group(1)))
                filters.append(extract('minute', SensorLog.created_at) == int(time_match.group(2)))
                if time_match.group(3):
                    filters.append(func.floor(extract('second', SensorLog.created_at)) == int(time_match.group(3)))
            if date_match:
                filters.append(extract('day', SensorLog.created_at) == int(date_match.group(1)))
                filters.append(extract('month', SensorLog.created_at) == int(date_match.group(2)))
                if date_match.group(3):
                    filters.append(extract('year', SensorLog.created_at) == int(date_match.group(3)))
            
            if h_match:
                filters.append(extract('hour', SensorLog.created_at) == int(h_match.group(1)))
            if m_match:
                filters.append(extract('minute', SensorLog.created_at) == int(m_match.group(1)))
            if s_match:
                filters.append(extract('second', SensorLog.created_at) == int(s_match.group(1)))
        else:
            # Tìm kiếm theo mã sensor, tên, hoặc giá trị
            filters.append(or_(
                Sensor.sensor_code.ilike(f"%{val}%"),
                Sensor.name.ilike(f"%{val}%"),
                cast(SensorLog.value, String).ilike(f"%{val}%")
            ))

    if request.type:
        filters.append(Sensor.sensor_code.ilike(f"{request.type}%"))


    # 3. Áp dụng TẤT CẢ filters vào cả query data và query count
    if filters:
        query = query.where(*filters)
        count_query = count_query.where(*filters)

    if request.sort_type == "asc":
        query = query.order_by(SensorLog.created_at.asc())
    else:
        query = query.order_by(SensorLog.created_at.desc())

    total = db.exec(count_query).one()

    limit = request.page_size
    offset = (request.page - 1) * limit
    query = query.limit(limit).offset(offset)

    results = db.exec(query).all()

    data = []
    for log, sensor in results:
        data.append(SensorLogResponse(
            id=log.id,
            sensor_id=log.sensor_id,
            value=log.value,
            created_at=log.created_at,
            sensor_name=sensor.name
        ))

    total_pages = math.ceil(total / limit) if limit > 0 else 0

    return {
        "data": data,
        "total": total,
        "page": request.page,
        "page_size": limit,
        "total_pages": total_pages
    }