import React, { useState, useCallback } from 'react';
import { searchDeviceLogs } from '../api';
import { Settings } from 'lucide-react';

const PAGE_SIZES = [5, 10, 20];

const STATUS_BADGE = {
  'ON': 'bg-green-100 text-green-600',
  'OFF': 'bg-gray-100 text-gray-500',
  'Waiting': 'bg-yellow-100 text-yellow-600',
};

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

  React.useEffect(() => {
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
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
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
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
