import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/ui/StatCard';
import DeviceCard from '../components/ui/DeviceCard';
import { FigmaTemp, FigmaHum, FigmaLight } from '../components/icons';
import { useIoTData } from '../hooks/useIoTData';
import {
  RANGE_OPTIONS,
  CHART_COLORS,
  getTempColorClass,
  getHumColorClass,
  getLightColorClass
} from '../utils/constants';

const Dashboard = () => {
  const [range, setRange] = useState('1h');
  const { stats, chartData, loadingChart, devices, togglingMap, handleToggle } = useIoTData(range);

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
        <StatCard label="Temperature" value={stats?.temperature?.value} unit={stats?.temperature?.unit || '°C'} trend="up" icon={FigmaTemp} colorClass={getTempColorClass(stats?.temperature?.value).text} iconClass={getTempColorClass(stats?.temperature?.value).bg} />
        <StatCard label="Humidity" value={stats?.humidity?.value} unit={stats?.humidity?.unit || '%'} trend="down" icon={FigmaHum} colorClass={getHumColorClass(stats?.humidity?.value).text} iconClass={getHumColorClass(stats?.humidity?.value).bg} />
        <StatCard label="Light Intensity" value={stats?.light?.value} unit={stats?.light?.unit || 'Lux'} trend="up" icon={FigmaLight} colorClass={getLightColorClass(stats?.light?.value).text} iconClass={getLightColorClass(stats?.light?.value).bg} />
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm mb-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">Environmental Sensor Trends</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Real-time monitoring of sensor data</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {chartSeries.map((key, i) => (
                <button
                  key={key}
                  onClick={() => toggleSeries(key)}
                  className={`flex items-center gap-2 text-xs font-medium transition-opacity ${isVisible(key) ? 'opacity-100' : 'opacity-30'}`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
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
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[chartSeries.indexOf(key) % CHART_COLORS.length]} strokeWidth={2} dot={false} />
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
              key={device.id || device.device_code}
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