import React, { useState, useCallback, useEffect } from 'react';
import { searchDeviceLogs } from '../api';
import { Settings } from 'lucide-react';
import { FigmaDeviceLight, FigmaDeviceFan, FigmaDeviceDehumidifier } from '../components/icons';
import { LOG_PAGE_SIZES, STATUS_BADGE } from '../utils/constants';

const DEVICE_ICONS = {
  light: (
    <div className="w-8 h-8 rounded-full bg-[#fef08a] flex items-center justify-center text-[#eab308] shrink-0">
      <FigmaDeviceLight size={12} />
    </div>
  ),
  fan: (
    <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center text-[#3b82f6] shrink-0">
      <FigmaDeviceFan size={14} />
    </div>
  ),
  dehumidifier: (
    <div className="w-8 h-8 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#f97316] shrink-0">
      <FigmaDeviceDehumidifier size={14} />
    </div>
  ),
  default: (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
      <Settings size={16} />
    </div>
  )
};

const getDeviceIcon = (deviceName) => {
  const name = (deviceName || '').toLowerCase();
  if (name.includes('light')) return DEVICE_ICONS.light;
  if (name.includes('fan')) return DEVICE_ICONS.fan;
  if (name.includes('dehumid')) return DEVICE_ICONS.dehumidifier;
  return DEVICE_ICONS.default;
};

const DeviceLogs = () => {
  const [q, setQ] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [action, setAction] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback((p = 1, overrideFilters = {}) => {
    setLoading(true);
    const searchConfig = {
      q: q || undefined,
      type: overrideFilters.deviceType !== undefined ? overrideFilters.deviceType : deviceType || undefined,
      action: action || undefined,
      sort_type: overrideFilters.sort !== undefined ? overrideFilters.sort : sort,
      page: p,
      page_size: overrideFilters.pageSize !== undefined ? overrideFilters.pageSize : pageSize,
    };

    searchDeviceLogs(searchConfig)
      .then(r => {
        setLogs(r.data.data || []);
        setTotal(r.data.total || 0);
        setTotalPages(r.data.total_pages || 0);
        setPage(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, deviceType, action, sort, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    handleSearch(newPage);
  };

  useEffect(() => {
    handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-full">
      {/* ContentHead */}
      <section className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1">System Action Logs</h1>
        <p className="text-gray-500 text-sm font-medium">Review device operations, status changes, and automated tasks.</p>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-4 mb-6" data-purpose="table-controls">
        <div className="relative flex-1 min-w-[300px]">
          <input
            type="text"
            className="w-full border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 shadow-sm outline-none border"
            placeholder="Tìm kiếm thời gian (16h), mã thiết bị (LIGHT_01), hoặc trạng thái..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(1)}
          />
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium shadow-sm outline-none focus:ring-purple-500 focus:border-purple-500 min-w-[180px]"
            value={deviceType}
            onChange={e => {
              setDeviceType(e.target.value);
              handleSearch(1, { deviceType: e.target.value });
            }}
          >
            <option value="">Device Type: All</option>
            <option value="light">Light</option>
            <option value="fan">Fan</option>
            <option value="dehumidifier">Dehumidifier</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium shadow-sm outline-none focus:ring-purple-500 focus:border-purple-500 min-w-[180px]"
            value={sort}
            onChange={e => {
              setSort(e.target.value);
              handleSearch(1, { sort: e.target.value });
            }}
          >
            <option value="desc">Sort: Newest</option>
            <option value="asc">Sort: Oldest</option>
          </select>

          <button
            onClick={() => handleSearch(1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg text-sm shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </section>

      {/* TableSection */}
      <section className="bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-white border-b border-purple-200">
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider w-16">ID</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider">Device Name</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider text-center">Action</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-sm font-extrabold text-gray-900 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium text-sm">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium text-sm">No records found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 text-sm font-medium">{log.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(log.device_name || log.type)}
                        <span className="text-gray-800 text-sm font-medium">{log.device_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800 text-sm font-medium">{log.action || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_BADGE[log.device_status] || 'bg-gray-100 text-gray-500'}`}>
                        {log.device_status || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))
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
                  onChange={e => {
                    const newVal = Number(e.target.value);
                    setPageSize(newVal);
                    handleSearch(1, { pageSize: newVal });
                  }}
                >
                  {LOG_PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
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

export default DeviceLogs;
