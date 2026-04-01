export const RANGE_OPTIONS = ['1h', '5h', '24h'];

export const LOG_PAGE_SIZES = [5, 10, 20];
export const SENSOR_LOG_PAGE_SIZES = [7, 10, 20];

export const STATUS_BADGE = {
  'ON': 'bg-green-100 text-green-600',
  'OFF': 'bg-gray-100 text-gray-500',
  'Waiting': 'bg-yellow-100 text-yellow-600',
};

export const CHART_COLORS = ['#F97316', '#3B82F6', '#FACC15'];

export const DEVICE_COLORS_CONFIG = {
  light: { onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
  fan: { onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
  dehumidifier: { onIconBg: '#DCFCE7', onIconColor: '#16A34A', offIconBg: '#F1F5F9', offIconColor: '#94A3B8' },
};

export const SENSOR_UNITS = {
  temp: '°C',
  hum: '%',
  light: 'Lux',
  default: ''
};

export const getTempColorClass = (value) => {
  if (value == null) return { text: "text-[#FB923C]", bg: "bg-orange-50 text-[#FB923C]" }; 
  if (value < 20) return { text: "text-red-300", bg: "bg-red-50 text-red-300" }; 
  if (value < 35) return { text: "text-red-500", bg: "bg-red-100 text-red-500" }; 
  return { text: "text-red-700", bg: "bg-red-200 text-red-700" };
};

export const getHumColorClass = (value) => {
  if (value == null) return { text: "text-[#3B82F6]", bg: "bg-blue-50 text-[#3B82F6]" }; 
  if (value < 40) return { text: "text-blue-300", bg: "bg-blue-50 text-blue-300" }; 
  if (value < 70) return { text: "text-blue-500", bg: "bg-blue-100 text-blue-500" }; 
  return { text: "text-blue-700", bg: "bg-blue-200 text-blue-700" };
};

export const getLightColorClass = (value) => {
  if (value == null) return { text: "text-[#FBBF24]", bg: "bg-yellow-50 text-[#FBBF24]" }; 
  if (value < 200) return { text: "text-yellow-800", bg: "bg-yellow-100 text-yellow-800" }; 
  if (value < 600) return { text: "text-yellow-500", bg: "bg-yellow-200 text-yellow-500" }; 
  return { text: "text-yellow-300", bg: "bg-yellow-50 text-yellow-300" }; 
};
