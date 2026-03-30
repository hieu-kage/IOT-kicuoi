from datetime import datetime, timezone, timedelta
def get_vietnam_time():
    """Trả về giờ VN nhưng giấu nhẹm mác Timezone để lừa Database"""
    return datetime.utcnow() + timedelta(hours=7)
