"""
FILE: routes/device_routes.py
MÔ TẢ: 
    Định nghĩa các API endpoint để truy cập dữ liệu liên quan đến thiết bị.

CÁC ROUTE:
    - GET  /api/device-data/devices       : Lấy tất cả thiết bị + trạng thái mới nhất
    - POST /api/device-data/toggle/{code} : Bật/Tắt thiết bị, gửi lệnh qua MQTT
    - POST /api/device-data/search        : Tìm kiếm lịch sử thiết bị
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_db
from schemas.device import ActionLogSearchRequest
from controllers import device_controller

router = APIRouter(
    prefix="/api/device-data",
    tags=["device-data"]
)

@router.get("/devices")
def get_devices(db: Session = Depends(get_db)):
    """Get all devices with latest status."""
    return device_controller.get_devices_with_status(db)

@router.post("/control/{device_code}")
def control_device(
    device_code: str, 
    db: Session = Depends(get_db)
):
    """
    Control device ON/OFF with Acknowledge Loop.
    Holds the request for up to 5 seconds waiting for MQTT confirmation.
    """
    return device_controller.control_device(device_code, db)

@router.post("/search")
def search_logs(request: ActionLogSearchRequest, db: Session = Depends(get_db)):
    """Search device logs with filters (device code, name, action, status)."""
    return device_controller.search_device_logs(db, request)
