"""
FILE: schemas/device.py
MÔ TẢ: 
    Định nghĩa các schema Pydantic/SQLModel (DTO) liên quan đến thiết bị và lịch sử hoạt động.
"""     
from sqlmodel import SQLModel
from typing import Optional, List
from datetime import datetime

class ActionLogSearchRequest(SQLModel):
    device_status: Optional[str] = None
    q: Optional[str] = None
    sort_type: Optional[str] = "desc"
    page: int = 1
    page_size: int = 10

class ActionLogResponse(SQLModel):
    id: int
    created_at: datetime
    device_code: Optional[str] = None
    device_name: Optional[str] = None
    device_type: Optional[str] = None
