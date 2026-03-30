"""
FILE: routes/sensor_routes.py
MÔ TẢ: 
    Định nghĩa các API endpoint để truy cập dữ liệu liên quan đến cảm biến.

CÁC ROUTE:
    - GET /api/sensor-data/latest:
        API để lấy thống kê cảm biến mới nhất (Nhiệt độ, Độ ẩm, Ánh sáng).
        Gọi hàm: sensor_controller.get_dashboard_stats
        
    - GET /api/sensor-data/chart:
        API để lấy dữ liệu biểu đồ cho cảm biến dựa trên khoảng thời gian.
        Query Params: range (1h, 24h, 7d)
        Gọi hàm: sensor_controller.get_dashboard_chart
"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import List
from database import get_db
from schemas.sensor import DashboardStats, DashboardChartData, SensorLogSearchRequest, SensorLogResponse
from controllers import sensor_controller

router = APIRouter(
    prefix="/api/sensor-data",
    tags=["sensor-data"]
)

@router.get("/latest", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    """
    Get latest environment stats (Temperature, Humidity, Light)
    """
    return sensor_controller.get_dashboard_stats(db)

@router.get("/chart", response_model=List[DashboardChartData])
def get_chart_data(
    range: str = Query("24h", regex="^(1h|5h|24h)$"), 
    db: Session = Depends(get_db)
):
    """
    Get chart data for sensors based on time range.
    """
    return sensor_controller.get_dashboard_chart(db, range)

@router.post("/search")
def search_logs(
    request: SensorLogSearchRequest, 
    db: Session = Depends(get_db)
):
    """
    Search sensor logs with filters (time components, range, value, sensor type)
    """
    return sensor_controller.search_sensor_logs(db, request)
