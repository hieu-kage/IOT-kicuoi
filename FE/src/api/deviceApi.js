import api from './config';

export const getDevices = () => api.get('/api/device-data/devices');
export const controlDevice = (deviceCode) => api.post(`/api/device-data/control/${deviceCode}`);
export const searchDeviceLogs = (payload) => api.post('/api/device-data/search', payload);
