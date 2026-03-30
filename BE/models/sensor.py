"""
FILE: models/sensor.py
MÔ TẢ: 
    Định nghĩa các thực thể cơ sở dữ liệu SQLModel cho Cảm biến (Sensor).

CÁC MOEL:
    - Sensor:
        Đại diện cho một thiết bị cảm biến vật lý (ví dụ: 'temp_01').
        Các trường: id, sensor_code, name, unit.
        
    - SensorLog:
        Đại diện cho một lần đọc dữ liệu từ cảm biến tại một thời điểm cụ thể.
        Các trường: id, sensor_id, value, created_at.
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from utils.time_utils import get_vietnam_time

class SensorBase(SQLModel):
    sensor_code: str = Field(unique=True, index=True)
    name: str
    unit: Optional[str] = None

class Sensor(SensorBase, table=True):
    __tablename__ = "sensors"
    id: Optional[int] = Field(default=None, primary_key=True)
    
    logs: List["SensorLog"] = Relationship(back_populates="sensor")

class SensorLogBase(SQLModel):
    value: float
    created_at: datetime = Field(default_factory=get_vietnam_time)

class SensorLog(SensorLogBase, table=True):
    __tablename__ = "sensor_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    sensor_id: Optional[int] = Field(default=None, foreign_key="sensors.id")
    sensor: Optional[Sensor] = Relationship(back_populates="logs")


