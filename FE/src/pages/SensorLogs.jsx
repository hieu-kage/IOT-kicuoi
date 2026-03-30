import React, { useState, useCallback, useEffect } from 'react';
import { searchSensorLogs } from '../api';

const SENSOR_CATEGORIES = [
  { label: 'Sensor Type: All', value: '' },
  { label: 'Temperature', value: 'temp' },
  { label: 'Humidity', value: 'hum' },
  { label: 'Light', value: 'light' }
];

const ICONS = {
  temp: (
    <div className="w-8 h-8 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#f97316] shrink-0">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21a5 5 0 0 1-5-5c0-1.657 1.343-3 3-3V5a2 2 0 1 1 4 0v8c1.657 0 3 1.343 3 3a5 5 0 0 1-5 5z"></path></svg>
    </div>
  ),
  hum: (
    <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#3b82f6] shrink-0">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.5c-4.4 0-8-3.6-8-8s8-11.5 8-11.5 8 7.1 8 11.5-3.6 8-8 8z"></path></svg>
    </div>
  ),
  light: (
    <div className="w-8 h-8 rounded-full bg-[#fef08a] flex items-center justify-center text-[#eab308] shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </div>
  ),
  default: (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>
    </div>
  ),
};

const UNITS = {
  temp: '°F',
  hum: '%',
  light: 'LUX',
  default: ''
};

const SensorLogs = () => {
  const [q, setQ] = useState('');
  const [sensorType, setSensorType] = useState('');
  const [sort, setSort] = useState('desc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback((p = 1) => {
    setLoading(true);
    searchSensorLogs({
      sensor_code: sensorType || undefined,
      q: q || undefined,
      sort_type: sort,
      page: p,
      page_size: pageSize,
    })
      .then(r => {
        setLogs(r.data.data || []);
        setTotal(r.data.total || 0);
        setTotalPages(r.data.total_pages || 0);
        setPage(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sensorType, sort, pageSize]);

  // Initial load
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchLogs(newPage);
  };

  const getSensorDisplay = (sensorName = '') => {
    const lower = sensorName.toLowerCase();
    if (lower.includes('temp')) return { icon: ICONS.temp, unit: UNITS.temp };
    if (lower.includes('hum')) return { icon: ICONS.hum, unit: UNITS.hum };
    if (lower.includes('light')) return { icon: ICONS.light, unit: UNITS.light };
    return { icon: ICONS.default, unit: UNITS.default };
  };

  return (
    <div className="min-h-full">
      {/* ContentHead */}
      <section className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Sensors Logs</h1>
        <p className="text-gray-500 text-sm font-medium">Manage and monitor real-time sensor readings across all devices.</p>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-4 mb-6" data-purpose="table-controls">
        <div className="relative flex-1 min-w-[300px]">
          <input
            type="text"
            className="w-full border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 shadow-sm outline-none border"
            placeholder="Tìm kiếm theo thời gian (16h30p), tên, hoặc mã cảm biến..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
          />
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium shadow-sm outline-none focus:ring-purple-500 focus:border-purple-500 min-w-[180px]"
            value={sensorType}
            onChange={(e) => { setSensorType(e.target.value); fetchLogs(1); }}
          >
            {SENSOR_CATEGORIES.map(c => <option key={c.label} value={c.value}>{c.label}</option>)}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium shadow-sm outline-none focus:ring-purple-500 focus:border-purple-500 min-w-[180px]"
            value={sort}
            onChange={(e) => { setSort(e.target.value); fetchLogs(1); }}
          >
            <option value="desc">Sort: Newest</option>
            <option value="asc">Sort: Oldest</option>
          </select>

          <button
            onClick={() => fetchLogs(1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg text-sm shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </section>

      {/* TableSection */}
      <section className="bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white border-b border-purple-200">
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider w-16">ID</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider">Sensor Name</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider text-center">Value</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider text-center">Unit</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium text-sm">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium text-sm">No records found.</td></tr>
              ) : (
                logs.map((log) => {
                  const { icon, unit } = getSensorDisplay(log.sensor_name);
                  return (
                    <tr key={log.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 text-sm font-medium">{log.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {icon}
                          <span className="text-gray-800 text-sm font-medium">{log.sensor_name || 'Unknown Sensor'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-800 text-sm font-medium">{log.value}</td>
                      <td className="px-6 py-4 text-center text-gray-500 text-sm font-medium">{unit}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm font-medium">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 0 && (
        <footer className="flex items-center justify-between pb-8">
          <div className="text-sm font-bold text-gray-800">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-800">Page size:</span>
              <div className="relative">
                <select
                  className="bg-purple-100 border-none rounded-full px-4 py-1 text-sm font-bold text-gray-800 focus:ring-0 appearance-none pr-8 cursor-pointer outline-none"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); fetchLogs(1); }}
                >
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex flex-col justify-center items-center px-3 pointer-events-none text-gray-600">
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6l-6 6h12z"></path></svg>
                  <svg className="w-2 h-2 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 18l6-6H6z"></path></svg>
                </div>
              </div>
            </div>

            <nav aria-label="Pagination" className="flex space-x-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-l-md bg-white text-gray-500 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-1 text-sm font-bold border ${page === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-r-md bg-white text-gray-500 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SensorLogs;
