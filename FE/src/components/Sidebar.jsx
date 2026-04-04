import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wifi,
  ClipboardList,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sensors', icon: Wifi, label: 'Sensors' },
  { to: '/device-logs', icon: ClipboardList, label: 'Devices Logs' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-sidebar-purple flex flex-col justify-between py-6 px-4 border-r border-purple-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2 lg:mb-12">
        <div className="bg-primary-600 p-1.5 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </div>
        <div>
          <span className="font-bold text-gray-800 text-xl">IoT</span>
          <span className="text-gray-500 text-sm ml-1">System Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                ? 'bg-active-purple text-white shadow-lg shadow-purple-200'
                : 'text-gray-500 hover:bg-purple-100'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-3 px-2 mt-auto">
        <div className="w-10 h-10 shrink-0 rounded-full border border-white overflow-hidden bg-gradient-to-br from-primary-500 to-blue-400 flex items-center justify-center text-white font-semibold shadow-sm">
          <img
            src="/avatar.png"
            alt="User"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* LH */}
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800">Lê Trung Hiếu</div>
          <div className="text-xs text-gray-500 font-medium">System Admin</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
