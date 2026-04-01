import React from 'react';

const StatCard = ({ label, value, unit, trend, icon: Icon, iconClass, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border-none flex justify-between items-center transition-transform hover:-translate-y-1"
    style={{ boxShadow: '0 6px 9.2px 0 rgba(91,45,255,0.25)' }}
  >
    <div>
      <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h2 className={`text-3xl font-bold ${colorClass || 'text-gray-800'}`}>
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

export default StatCard;
