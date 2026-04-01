import { useState, useRef, useCallback, useEffect } from 'react';
import { getSensorLatest, getSensorChart, getDevices, controlDevice } from '../api';

export const useIoTData = (currentRange) => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [devices, setDevices] = useState([]);
  const [togglingMap, setTogglingMap] = useState({});

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const rangeRef = useRef(currentRange);

  useEffect(() => {
    rangeRef.current = currentRange;
  }, [currentRange]);

  const fetchDevices = useCallback(() => {
    getDevices().then(r => setDevices(r.data)).catch(console.error);
  }, []);

  const fetchStats = useCallback(() => {
    getSensorLatest().then(r => setStats(r.data)).catch(console.error);
  }, []);

  const fetchChart = useCallback((r) => {
    setLoadingChart(true);
    getSensorChart(r)
      .then(res => {
        const series = res.data;
        if (!series.length) return setChartData([]);
        const timeMap = {};

        series.forEach(({ label, data }) => {
          data.forEach(({ timestamp, value }) => {
            const isSeconds = r === '1h';
            const dateObj = new Date(timestamp);

            const key = dateObj.toLocaleTimeString('vi-VN', {
              hour: '2-digit', minute: '2-digit', second: isSeconds ? '2-digit' : undefined
            });

            if (!timeMap[key]) {
              timeMap[key] = { time: key, timestamp: dateObj.getTime() };
            }
            timeMap[key][label] = value;
          });
        });

        const sortedData = Object.values(timeMap).sort((a, b) => a.timestamp - b.timestamp);
        setChartData(sortedData);
      })
      .catch(console.error)
      .finally(() => setLoadingChart(false));
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const socketUrl = (import.meta.env && import.meta.env.VITE_WS_URL) || 'ws://localhost:8000/ws';
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected to backend');
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'sensor_update') {
          const newData = message.data;
          setStats(newData);

          if (rangeRef.current === '1h') {
            const nowLabel = new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            const newPoint = {
              time: nowLabel,
              "Temperature Sensor": newData.temperature?.value,
              "Humidity Sensor": newData.humidity?.value,
              "Light Sensor": newData.light?.value
            };

            setChartData(prev => {
              const next = [...prev, newPoint];
              if (next.length > 2000) return next.slice(next.length - 2000);
              return next;
            });
          }
        } else if (message.type === 'device_update') {
          const updatedDevice = message.data;
          setDevices(prevDevices =>
            prevDevices.map(dev =>
              dev.device_code === updatedDevice.device_code
                ? { ...dev, device_status: updatedDevice.device_status, last_action: updatedDevice.last_action }
                : dev
            )
          );
        }
      } catch (err) {
        console.error('[WebSocket] Error parsing message:', err);
      }
    };

    socket.onclose = () => {
      console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
      reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 3000);
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      socket.close();
    };
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDevices();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Tránh loop
        wsRef.current.close();
      }
    };
  }, [fetchStats, fetchDevices, connectWebSocket]);

  useEffect(() => {
    fetchChart(currentRange);
  }, [currentRange, fetchChart]);

  const handleToggle = useCallback(async (deviceCode) => {
    setTogglingMap(prev => ({ ...prev, [deviceCode]: true }));
    try {
      await controlDevice(deviceCode);
      fetchDevices(); // Có thể chờ websocket phản hồi để update state
    } catch (err) {
      console.error('Toggle failed:', err);
      alert(err?.response?.data?.detail || 'Toggle failed. Is the MQTT broker reachable?');
    } finally {
      // Nếu socket update quá nhanh thì cái này override lại, mà chờ promise resolve là hợp lý.
      setTogglingMap(prev => ({ ...prev, [deviceCode]: false }));
    }
  }, [fetchDevices]);

  return {
    stats,
    chartData,
    loadingChart,
    devices,
    togglingMap,
    handleToggle
  };
};
