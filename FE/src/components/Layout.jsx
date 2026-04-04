import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

const pageTitles = {
  '/': 'Dashboard',
  '/sensors': 'Sensor Logs',
  '/device-logs': 'Device Logs',
  '/profile': 'Profile',
};

const Layout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Hidden on profile page */}
        {!isProfilePage && (
          <header className="px-8 pt-6 pb-0 mb-2 flex items-center justify-between bg-transparent shrink-0">
            <div className="text-2xl font-bold text-gray-800">{title}</div>
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 border border-gray-100 relative hover:bg-gray-50 transition-colors">
              <Bell size={18} strokeWidth={2} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </header>
        )}
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
