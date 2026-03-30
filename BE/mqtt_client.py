"""
FILE: mqtt_client.py
MÔ TẢ:
    Module publish lệnh MQTT tới broker (Mosquitto).
    Dùng để điều khiển LED trên ESP32 qua topic esp/control_led.
"""
import os
import paho.mqtt.publish as publish
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USER   = os.getenv("MQTT_USER", "")
MQTT_PASS   = os.getenv("MQTT_PASS", "")

CONTROL_TOPIC = "iot/control"

def publish_command(command: str):
    """
    Gửi một lệnh điều khiển tới ESP32 qua MQTT.
    Ví dụ: publish_command("red:on")
    """
    auth = {"username": MQTT_USER, "password": MQTT_PASS} if MQTT_USER else None
    publish.single(
        topic=CONTROL_TOPIC,
        payload=command,
        hostname=MQTT_BROKER,
        port=MQTT_PORT,
        auth=auth,
        keepalive=60,
    )
