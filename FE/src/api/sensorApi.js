import api from './config';

export const getSensorLatest = () => api.get('/api/sensor-data/latest');
export const getSensorChart = (range = '24h') => api.get(`/api/sensor-data/chart?range=${range}`);
export const searchSensorLogs = (payload) => api.post('/api/sensor-data/search', payload);
