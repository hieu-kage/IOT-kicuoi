from typing import List
from fastapi import WebSocket
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.main_loop = None

    def set_loop(self, loop):
        self.main_loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] New connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket] Connection closed. Total: {len(self.active_connections)}")

    def broadcast_threadsafe(self, message: dict):
        """Hàm an toàn để gọi từ thread khác (như MQTT)"""
        if self.main_loop:
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.main_loop)

    async def broadcast(self, message: dict):
        """Gửi dữ liệu tới tất cả các client đang kết nối (Async)"""
        if not self.active_connections:
            return
            
        print(f"[WebSocket] Broadcasting: {message.get('type')}")
        message_str = json.dumps(message)
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                print(f"[WebSocket] Send failed: {e}")
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()
