import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getSensorLatest, getSensorChart, getDevices, controlDevice } from '../api';

const RANGE_OPTIONS = ['1h', '5h', '24h'];

// === ICONS ===
const FigmaTemp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6.74999 13.5C6.74999 14.7426 5.74262 15.75 4.49999 15.75C3.25736 15.75 2.24999 14.7426 2.24999 13.5C2.24999 12.6673 2.70266 11.9409 3.37499 11.5517V7.875C3.37499 7.25368 3.87867 6.75 4.49999 6.75C5.1213 6.75 5.62499 7.25368 5.62499 7.875V11.5517C6.29732 11.9409 6.74999 12.6673 6.74999 13.5ZM7.87499 10.5239C8.57502 11.3171 8.99999 12.3589 8.99999 13.5C8.99999 15.9854 6.98543 18 4.49999 18C4.48948 18 4.47858 18 4.46803 17.9999C1.99648 17.9827 -0.012562 15.9481 5.9142e-05 13.4766C0.00582477 12.3446 0.429774 11.3117 1.12499 10.5239V3.375C1.12499 1.51105 2.63604 0 4.49999 0C6.36394 0 7.87499 1.51105 7.87499 3.375V10.5239ZM7.31249 13.5C7.31249 12.2928 6.63151 11.6652 6.18749 11.162V3.375C6.18749 2.44452 5.43047 1.6875 4.49999 1.6875C3.56951 1.6875 2.81249 2.44452 2.81249 3.375V11.162C2.36488 11.6693 1.69364 12.2906 1.68752 13.4852C1.67965 15.0277 2.93779 16.3017 4.47974 16.3124L4.49999 16.3125C6.0508 16.3125 7.31249 15.0508 7.31249 13.5Z" fill="currentColor" />
  </svg>
);

const FigmaHum = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6.99614 0.75308C6.72545 -0.228056 5.31068 -0.273738 5.00386 0.75308C3.40943 6.13126 0 7.59274 0 11.3833C0 14.7392 2.68364 17.4546 6 17.4546C9.31636 17.4546 12 14.7392 12 11.3833C12 7.57365 8.59807 6.15581 6.99614 0.75308ZM6 15.2727C3.89489 15.2727 2.18182 13.5597 2.18182 11.4546C2.18182 11.1532 2.42591 10.9091 2.72727 10.9091C3.02864 10.9091 3.27273 11.1532 3.27273 11.4546C3.27273 12.9583 4.49625 14.1818 6 14.1818C6.30136 14.1818 6.54545 14.4259 6.54545 14.7273C6.54545 15.0286 6.30136 15.2727 6 15.2727Z" fill="currentColor" />
  </svg>
);

const FigmaLight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 5.625C7.14023 5.625 5.625 7.14023 5.625 9C5.625 10.8598 7.14023 12.375 9 12.375C10.8598 12.375 12.375 10.8598 12.375 9C12.375 7.14023 10.8598 5.625 9 5.625ZM17.6625 8.45508L14.3332 6.79219L15.5109 3.2625C15.6691 2.78438 15.2156 2.33086 14.741 2.49258L11.2113 3.67031L9.54492 0.3375C9.31992 -0.1125 8.68008 -0.1125 8.45508 0.3375L6.79219 3.6668L3.25898 2.48906C2.78086 2.33086 2.32734 2.78437 2.48906 3.25898L3.6668 6.78867L0.3375 8.45508C-0.1125 8.68008 -0.1125 9.31992 0.3375 9.54492L3.6668 11.2078L2.48906 14.741C2.33086 15.2191 2.78437 15.6727 3.25898 15.5109L6.78867 14.3332L8.45156 17.6625C8.67656 18.1125 9.31641 18.1125 9.54141 17.6625L11.2043 14.3332L14.734 15.5109C15.2121 15.6691 15.6656 15.2156 15.5039 14.741L14.3262 11.2113L17.6555 9.54844C18.1125 9.31992 18.1125 8.68008 17.6625 8.45508ZM12.1816 12.1816C10.4273 13.9359 7.57266 13.9359 5.81836 12.1816C4.06406 10.4273 4.06406 7.57266 5.81836 5.81836C7.57266 4.06406 10.4273 4.06406 12.1816 5.81836C13.9359 7.57266 13.9359 10.4273 12.1816 12.1816Z" fill="currentColor" />
  </svg>
);

const FigmaDeviceLight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3.82057 18.0707C3.82097 18.3209 3.89494 18.5659 4.03375 18.7743L4.71347 19.7961C4.82958 19.9707 4.98707 20.114 5.17193 20.2131C5.35679 20.3122 5.56327 20.364 5.77301 20.364H8.22739C8.43713 20.364 8.64361 20.3122 8.82847 20.2131C9.01332 20.114 9.17082 19.9707 9.28693 19.7961L9.96665 18.7743C10.1054 18.5659 10.1796 18.3211 10.1798 18.0707L10.1814 16.5455H3.81858L3.82057 18.0707ZM0 7C0 8.76472 0.654261 10.3747 1.7325 11.6049C2.38955 12.3546 3.41727 13.9209 3.80903 15.2421C3.81062 15.2524 3.81182 15.2628 3.81341 15.2731H10.1866C10.1882 15.2628 10.1894 15.2528 10.191 15.2421C10.5827 13.9209 11.6105 12.3546 12.2675 11.6049C13.3457 10.3747 14 8.76472 14 7C14 3.12654 10.8544 -0.0119284 6.97812 3.39178e-06C2.92091 0.0123329 0 3.29995 0 7ZM7 3.81819C5.24563 3.81819 3.81818 5.24563 3.81818 7C3.81818 7.35159 3.53341 7.63637 3.18182 7.63637C2.83023 7.63637 2.54545 7.35159 2.54545 7C2.54545 4.54364 4.54364 2.54546 7 2.54546C7.35159 2.54546 7.63636 2.83023 7.63636 3.18182C7.63636 3.53341 7.35159 3.81819 7 3.81819Z" fill="currentColor" />
  </svg>
);

const FigmaDeviceFan = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13.0836 4.75007C12.0412 4.75007 11.0764 4.9178 10.224 5.22729L10.6845 0.658822C10.7246 0.271406 10.3836 -0.0436483 9.99466 0.00496433C7.03709 0.376053 4.75007 2.88127 4.75007 5.9164C4.75007 6.95879 4.9178 7.92362 5.22729 8.77601L0.658822 8.31549C0.271406 8.27541 -0.0436482 8.61644 0.00496432 9.00534C0.376053 11.9629 2.88127 14.2499 5.9164 14.2499C6.95879 14.2499 7.92362 14.0822 8.77601 13.7727L8.31549 18.3412C8.27652 18.7282 8.61644 19.0437 9.00534 18.995C11.9629 18.624 14.2499 16.1187 14.2499 13.0836C14.2499 12.0412 14.0822 11.0764 13.7727 10.224L18.3412 10.6845C18.7286 10.7235 19.0436 10.3836 18.995 9.99466C18.6239 7.03709 16.1187 4.75007 13.0836 4.75007ZM9.5 10.6875C9.26514 10.6875 9.03555 10.6178 8.84027 10.4874C8.64499 10.3569 8.49279 10.1714 8.40291 9.95443C8.31303 9.73745 8.28952 9.49869 8.33533 9.26834C8.38115 9.03799 8.49425 8.8264 8.66032 8.66033C8.8264 8.49425 9.03799 8.38116 9.26833 8.33534C9.49868 8.28952 9.73745 8.31303 9.95443 8.40291C10.1714 8.49279 10.3569 8.64499 10.4874 8.84027C10.6178 9.03555 10.6875 9.26514 10.6875 9.5C10.6875 9.81494 10.5624 10.117 10.3397 10.3397C10.117 10.5624 9.81494 10.6875 9.5 10.6875Z" fill="currentColor" />
  </svg>
);

const FigmaDeviceDehumidifier = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9.32875 2L14.5171 7.18833C15.5432 8.21373 16.2421 9.52039 16.5254 10.9431C16.8088 12.3657 16.6638 13.8404 16.1089 15.1807C15.554 16.521 14.6141 17.6666 13.408 18.4726C12.202 19.2786 10.7839 19.7088 9.33334 19.7088C7.88274 19.7088 6.46472 19.2786 5.25866 18.4726C4.05259 17.6666 3.11266 16.521 2.55776 15.1807C2.00286 13.8404 1.85792 12.3657 2.14126 10.9431C2.42461 9.52039 3.12352 8.21373 4.14959 7.18833L9.32875 2Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const StatCard = ({ label, value, unit, trend, icon: Icon, iconClass, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border-none flex justify-between items-center transition-transform hover:-translate-y-1"
    style={{ boxShadow: '0 6px 9.2px 0 rgba(91,45,255,0.25)' }}
  >
    <div>
      <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h2 className={`text-3xl font-bold ${'text-gray-800'}`}>
          {value != null ? `${value}${unit ? (unit === 'Lux' ? ' Lux' : unit) : ''}` : '—'}
        </h2>
        {trend && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm
            ${trend === 'up' ? 'bg-green-100 text-green-600' : trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            {trend === 'up' ? '↑ 2%' : trend === 'down' ? '↓ 2%' : trend}
          </span>
        )}
      </div>
    </div>
    <div className={`p-3 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
      <Icon size={24} className="opacity-90" />
    </div>
  </div>
);

const DEVICE_CONFIG = {
  light: { icon: FigmaDeviceLight, onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
  fan: { icon: FigmaDeviceFan, onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
  dehumidifier: { icon: FigmaDeviceDehumidifier, onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
};

const DeviceCard = ({ device, onToggle, togglingMap }) => {
  const type = (device.type || '').toLowerCase();
  const cfg = DEVICE_CONFIG[type] || DEVICE_CONFIG['fan'];
  const Icon = cfg.icon;
  const status = device.device_status || 'OFF';
  const isOn = status === 'ON';
  const isWaiting = status === 'Waiting';
  const isPending = isWaiting || togglingMap[device.device_code];

  return (
    <div
      onClick={() => { if (!isPending) onToggle(device.device_code); }}
      className={`rounded-[28px] px-6 py-5 flex justify-between items-center border-2 transition-all duration-200 cursor-pointer select-none
        ${isPending
          ? 'bg-[#FFF5D4] border-[#FDE68A]'
          : isOn
            ? 'bg-[#ECFDF5] border-[#BBF7D0]'
            : 'bg-[#AAD1E2]/30 border-[#AAD1E2]/30'}
        ${togglingMap[device.device_code] ? 'opacity-60 cursor-wait' : 'hover:-translate-y-0.5'}`}
      style={{ boxShadow: '0 6px 9.2px 0 rgba(91,45,255,0.25)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isPending ? '#FEF3C7' : (isOn ? cfg.onIconBg : cfg.offIconBg),
            color: isPending ? '#F59E0B' : (isOn ? cfg.onIconColor : cfg.offIconColor),
          }}
        >
          <Icon size={26} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-base leading-tight">{device.name}</h4>
          <p className={`text-sm font-semibold mt-0.5
            ${isPending ? 'text-amber-500' : (isOn ? 'text-green-500' : 'text-slate-400')}`}>
            {isPending ? 'Waiting...' : (isOn ? 'Active' : 'Inactive')}
          </p>
        </div>
      </div>
      {isPending ? (
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <div className="w-6 h-6 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <button
          onClick={e => { e.stopPropagation(); onToggle(device.device_code); }}
          title={isOn ? 'Turn Off' : 'Turn On'}
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 active:scale-95
            ${isOn
              ? 'bg-[#22C55E] text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.55)]'
              : 'bg-[#9CA3AF] text-white hover:bg-gray-500'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="12" />
            <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
          </svg>
        </button>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState('1h'); // Mặc định là 1h
  const [loadingChart, setLoadingChart] = useState(true);
  const [devices, setDevices] = useState([]);
  const [togglingMap, setTogglingMap] = useState({});

  const rangeRef = useRef(range);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  const fetchDevices = useCallback(() => {
    getDevices().then(r => setDevices(r.data)).catch(console.error);
  }, []);

  const fetchStats = useCallback(() => {
    getSensorLatest().then(r => setStats(r.data)).catch(console.error);
  }, []);

  // Hàm quản lý WebSocket chung
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Fix: Không hardcode localhost
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
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      socket.close(); // Buộc close để kích hoạt Auto-reconnect
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

            // Format time key
            const key = dateObj.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: isSeconds ? '2-digit' : undefined
            });

            // Ghi lại timestamp thực để dễ sort
            if (!timeMap[key]) {
              timeMap[key] = { time: key, timestamp: dateObj.getTime() };
            }
            timeMap[key][label] = value;
          });
        });

        // FIX: Đã sắp xếp lại data theo đúng mốc thời gian (chrono)
        const sortedData = Object.values(timeMap).sort((a, b) => a.timestamp - b.timestamp);
        setChartData(sortedData);
      })
      .catch(console.error)
      .finally(() => setLoadingChart(false));
  }, []);

  useEffect(() => { fetchChart(range); }, [range, fetchChart]);

  const handleToggle = useCallback(async (deviceCode) => {
    setTogglingMap(prev => ({ ...prev, [deviceCode]: true }));
    try {
      await controlDevice(deviceCode);
      fetchDevices();
    } catch (err) {
      console.error('Toggle failed:', err);
      alert(err?.response?.data?.detail || 'Toggle failed. Is the MQTT broker reachable?');
    } finally {
      setTogglingMap(prev => ({ ...prev, [deviceCode]: false }));
    }
  }, [fetchDevices]);

  const COLORS = ['#F97316', '#3B82F6', '#FACC15'];
  const chartSeries = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'time' && k !== 'timestamp') : [];
  const [visibleSeries, setVisibleSeries] = useState({});
  const toggleSeries = (key) => setVisibleSeries(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  const isVisible = (key) => visibleSeries[key] !== false;

  const visibleChartData = chartData.map(point => {
    const filtered = { time: point.time };
    chartSeries.forEach((k) => { if (isVisible(k)) filtered[k] = point[k]; });
    return filtered;
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Temperature" value={stats?.temperature?.value} unit={stats?.temperature?.unit || '°C'} trend="up" icon={FigmaTemp} colorClass="text-[#FB923C]" iconClass="bg-orange-50 text-[#FB923C]" />
        <StatCard label="Humidity" value={stats?.humidity?.value} unit={stats?.humidity?.unit || '%'} trend="down" icon={FigmaHum} colorClass="text-[#3B82F6]" iconClass="bg-blue-50 text-[#3B82F6]" />
        <StatCard label="Light Intensity" value={stats?.light?.value} unit={stats?.light?.unit || 'Lux'} trend="up" icon={FigmaLight} colorClass="text-[#FBBF24]" iconClass="bg-yellow-50 text-[#FBBF24]" />
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm mb-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">Environmental Sensor Trends</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Real-time monitoring of sensor data</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Clickable legend labels */}
            <div className="flex items-center gap-4">
              {chartSeries.map((key, i) => (
                <button
                  key={key}
                  onClick={() => toggleSeries(key)}
                  className={`flex items-center gap-2 text-xs font-medium transition-opacity ${isVisible(key) ? 'opacity-100' : 'opacity-30'}`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {key}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {RANGE_OPTIONS.map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-4 py-1.5 text-xs font-bold transition-colors
                    ${range === r ? 'bg-white shadow-sm rounded-md text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loadingChart ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={visibleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={30} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              {chartSeries.filter(isVisible).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[chartSeries.indexOf(key) % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Device Cards */}
      {devices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleToggle}
              togglingMap={togglingMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;