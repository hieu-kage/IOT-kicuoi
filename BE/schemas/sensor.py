"""
FILE: schemas/sensor.py
MÔ TẢ: 
    Định nghĩa các schema Pydantic/SQLModel (DTO) để kiểm tra dữ liệu yêu cầu/phản hồi API.
    Các schema này được tách biệt khỏi các model cơ sở dữ liệu để kiểm soát việc tuần tự hóa (serialization).

CÁC SCHEMA:
    - DashboardStats: 
        Cấu trúc phản hồi cho /api/sensor-data/latest (chứa thông tin nhiệt độ, độ ẩm, ánh sáng).
    
    - DashboardChartData: 
        Cấu trúc phản hồi cho /api/sensor-data/chart (chứa nhãn và các điểm dữ liệu).
"""     
from sqlmodel import SQLModel
from typing import Optional, List
from datetime import datetime

class DashboardStatItem(SQLModel):
    value: float
    unit: str
    trend: Optional[str] = None 

class DashboardStats(SQLModel):
    temperature: Optional[DashboardStatItem] = None
    humidity: Optional[DashboardStatItem] = None
    light: Optional[DashboardStatItem] = None

class ChartDataPoint(SQLModel):
    timestamp: datetime
    value: float

class DashboardChartData(SQLModel):
    label: str
    data: List[ChartDataPoint]

class SensorLogSearchRequest(SQLModel):
    q: Optional[str] = None
    type: Optional[str] = None
    sort_type: Optional[str] = "desc"
    page: int = 1
    page_size: int = 10

class SensorLogResponse(SQLModel):
    id: int
    sensor_id: int
    value: float
    created_at: datetime
    sensor_name: Optional[str] = None

