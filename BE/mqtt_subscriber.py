"""
FILE: mqtt_subscriber.py
MÔ TẢ:
    Background task để lắng nghe dữ liệu từ ESP qua MQTT.
    - Cập nhật liên tục LATEST_SENSOR_DATA trên RAM (phục vụ /latest API).
    - Lưu vào PostgreSQL DB cứ mỗi SENSOR_SAVE_INTERVAL giây (phục vụ biểu đồ).
"""
import os
import json
import time
import threading
import paho.mqtt.client as mqtt
import asyncio
from dotenv import load_dotenv
from database import engine
from socket_manager import manager
from sqlmodel import Session, select
from models.sensor import SensorLog,Sensor
from models.device import ActionLog

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USER   = os.getenv("MQTT_USER", "")
MQTT_PASS   = os.getenv("MQTT_PASS", "")

SENSOR_TOPIC = "iot/data-sensor"
DEVICE_STATUS_TOPIC = "iot/control_respone"
SAVE_INTERVAL = int(os.getenv("SENSOR_SAVE_INTERVAL", "2"))


LATEST_SENSOR_DATA = {
    "temperature": None,
    "humidity": None,
    "light": None,
    "timestamp": None
}

last_db_save_time = 0

def on_connect(client, userdata, flags, rc):
    print(f"[MQTT Subscriber] Connected with result code {rc}")
    client.subscribe(SENSOR_TOPIC)
    client.subscribe(DEVICE_STATUS_TOPIC)
    print(f"[MQTT Subscriber] Subscribed to {SENSOR_TOPIC} and {DEVICE_STATUS_TOPIC}")

def handle_control_response(payload: str):
    """Xử lý phản hồi từ ESP32 khi có lệnh bật/tắt thiết bị"""
    payload_clean = payload.strip()
    print(f"[MQTT Subscriber] Received control response: '{payload_clean}'")

    new_status = None
    try:
        data = json.loads(payload_clean)
        status_val = data.get("status")
        if status_val in ["ON", "OFF"]:
            new_status = status_val
    except:
        if payload_clean == "Success":
            pass

    try:
        with Session(engine) as db:
            log = db.exec(
                select(ActionLog)
                .where(ActionLog.device_status == "Waiting")
                .order_by(ActionLog.created_at.desc())
            ).first()

            if not log:
                print(f"[MQTT Subscriber] Received '{payload_clean}', but no 'Waiting' log found in DB.")
                return

            if new_status:
                log.device_status = new_status
            elif payload_clean == "Success":
                new_status = "ON" if "On" in log.action else "OFF"
                log.device_status = new_status
            else:
                log.device_status = "Fail"

            db.add(log)
            db.commit()
            db.refresh(log)
            
            from models.device import Device
            device = db.get(Device, log.device_id)
            manager.broadcast_threadsafe({
                "type": "device_update",
                "data": {
                    "device_code": device.device_code if device else "UNKNOWN",
                    "device_status": log.device_status,
                    "last_action": log.action
                }
            })
            print(f"[MQTT Subscriber] Updated ActionLog {log.id} to {log.device_status} and broadcasted.")
    except Exception as e:
        print(f"[MQTT Subscriber] Error handling control response: {e}")

def on_message(client, userdata, msg):
    global last_db_save_time, LATEST_SENSOR_DATA
    try:
        payload = msg.payload.decode("utf-8")
        
        if msg.topic == DEVICE_STATUS_TOPIC:
            handle_control_response(payload)
            return
            
        data = json.loads(payload)
        
        temp = data.get("temp")
        hum = data.get("hum")
        light = data.get("lux")
        
        if temp is None or hum is None or light is None:
            return

        # 1. Update in-memory cache instantly
        LATEST_SENSOR_DATA["temperature"] = float(temp)
        LATEST_SENSOR_DATA["humidity"] = float(hum)
        LATEST_SENSOR_DATA["light"] = float(light)
        LATEST_SENSOR_DATA["timestamp"] = time.time()

        # Broadcast sensor data to WebSockets
        manager.broadcast_threadsafe({
            "type": "sensor_update",
            "data": {
                "temperature": {"value": float(temp), "unit": "°C"},
                "humidity": {"value": float(hum), "unit": "%"},
                "light": {"value": float(light), "unit": " Lux"}
            }
        })

        # 2. Throttle DB saving
        current_time = time.time()
        if (current_time - last_db_save_time) >= SAVE_INTERVAL:
            last_db_save_time = current_time
            save_to_db(temp, hum, light)

    except Exception as e:
        print(f"[MQTT Subscriber] Error parsing message: {e}")

def save_to_db(temp, hum, lux):
    """Lưu 3 bản ghi SensorLog riêng biệt (temp, hum, lux) vào DB."""
    from sqlmodel import select
    from models.sensor import Sensor
    sensor_values = [
        ("temp", float(temp)),
        ("hum",  float(hum)),
        ("light",  float(lux)),
    ]
    try:
        with Session(engine) as db:
            for prefix, value in sensor_values:
                sensor = db.exec(
                    select(Sensor).where(Sensor.sensor_code.like(f"{prefix}%"))
                ).first()
                if not sensor:
                    print(f"[MQTT Subscriber] Không tìm thấy sensor với prefix '{prefix}', bỏ qua.")
                    continue
                log = SensorLog(sensor_id=sensor.id, value=value)
                db.add(log)
            db.commit()
            print(f"[MQTT Subscriber] Saved to DB: temp={temp}, hum={hum}, lux={lux}")
    except Exception as e:
        print(f"[MQTT Subscriber] DB Save Error: {e}")

def start_mqtt_subscriber(loop=None):
    """Starts the MQTT loop in a background thread."""
    client = mqtt.Client()
    
    if MQTT_USER:
        client.username_pw_set(MQTT_USER, MQTT_PASS)
        
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Run in a background thread so it doesn't block FastAPI
        thread = threading.Thread(target=client.loop_forever, daemon=True)
        thread.start()
        print("[MQTT Subscriber] Background thread started.")
    except Exception as e:
        print(f"[MQTT Subscriber] Failed to connect: {e}")

