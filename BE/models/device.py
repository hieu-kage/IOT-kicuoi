"""
FILE: models/device.py
MÔ TẢ: 
    Định nghĩa các thực thể cơ sở dữ liệu SQLModel cho Thiết bị có thể điều khiển (Device).

CÁC MODEL:
    - Device:
        Đại diện cho một thiết bị có thể điều khiển (ví dụ: Đèn, Quạt).
        Các trường: id, device_code, name, type, description.
        
    - ActionLog:
        Ghi lại lịch sử các hành động được thực hiện trên thiết bị (ví dụ: 'Bật', 'Tắt').
        Các trường: id, device_id, action, device_status, created_at.
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from utils.time_utils import get_vietnam_time

class DeviceBase(SQLModel):
    device_code: str = Field(unique=True, index=True)
    name: str
    type: str 
    description: Optional[str] = None

class Device(DeviceBase, table=True):
    __tablename__ = "devices"
    id: Optional[int] = Field(default=None, primary_key=True)
    action_logs: List["ActionLog"] = Relationship(back_populates="device")

class ActionLogBase(SQLModel):
    action: str 
    device_status: Optional[str] = None 
    created_at: datetime = Field(default_factory=get_vietnam_time)

class ActionLog(ActionLogBase, table=True):
    __tablename__ = "action_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: Optional[int] = Field(default=None, foreign_key="devices.id")
    
    device: Optional[Device] = Relationship(back_populates="action_logs")
