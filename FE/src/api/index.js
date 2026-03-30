import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sensor APIs
export const getSensorLatest = () => api.get('/api/sensor-data/latest');
export const getSensorChart = (range = '24h') => api.get(`/api/sensor-data/chart?range=${range}`);
export const searchSensorLogs = (payload) => api.post('/api/sensor-data/search', payload);

// Device APIs
export const getDevices = () => api.get('/api/device-data/devices');
export const controlDevice = (deviceCode) => api.post(`/api/device-data/control/${deviceCode}`);
export const searchDeviceLogs = (payload) => api.post('/api/device-data/search', payload);

export default api;
