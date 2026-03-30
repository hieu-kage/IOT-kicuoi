import contextlib

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from database import create_db_and_tables
from routes import sensor_routes, device_routes
from socket_manager import manager
from mqtt_subscriber import start_mqtt_subscriber

# Global loop to allow MQTT thread to broadcast to WebSockets
loop = None

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global loop
    loop = asyncio.get_running_loop()
    manager.set_loop(loop)
    # Khởi tạo DB nếu chưa có
    create_db_and_tables()
    # Chạy MQTT Subscriber ngầm dưới background, truyền loop vào
    start_mqtt_subscriber(loop)
    yield

app = FastAPI(title="IoT System Manager API", lifespan=lifespan)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Giữ kết nối mở, có thể nhận heartbeats nếu cần
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        manager.disconnect(websocket)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor_routes.router)
app.include_router(device_routes.router)

@app.get("/")
async def root():
    return {"message": "IoT System Manager API is running"}
