import React from 'react';
import { FigmaDeviceLight, FigmaDeviceFan, FigmaDeviceDehumidifier } from '../icons';
import { DEVICE_COLORS_CONFIG } from '../../utils/constants';

const DEVICE_ICON_MAP = {
  light: FigmaDeviceLight,
  fan: FigmaDeviceFan,
  dehumidifier: FigmaDeviceDehumidifier,
};

const DeviceCard = ({ device, onToggle, togglingMap }) => {
  const type = (device.type || '').toLowerCase();
  const cfg = DEVICE_COLORS_CONFIG[type] || DEVICE_COLORS_CONFIG['fan'];
  const Icon = DEVICE_ICON_MAP[type] || FigmaDeviceFan;
  
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

export default DeviceCard;
