import { useState, useMemo } from 'react';
import EmptyState from './EmptyState';

const PAGE_SIZE = 10;

export default function DataTable({
  columns,
  data,
  onRowClick,
  filters,
  emptyMessage = 'No records found.',
  exportFilename,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [filterValues, setFilterValues] = useState({});

  const filteredData = useMemo(() => {
    if (!filters) return data;
    return data.filter((row) =>
      filters.every((f) => {
        const val = filterValues[f.key];
        if (!val) return true;
        const cellVal = String(f.accessor ? f.accessor(row) : row[f.key] || '').toLowerCase();
        return cellVal.includes(val.toLowerCase());
      })
    );
  }, [data, filters, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = col.accessor ? col.accessor(a) : a[col.key];
      const bVal = col.accessor ? col.accessor(b) : b[col.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pageData = sortedData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function handleExport() {
    const header = columns.map((c) => c.label).join(',');
    const rows = filteredData.map((row) =>
      columns.map((c) => {
        const val = c.accessor ? c.accessor(row) : row[c.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename || 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Filter bar + Export */}
      {(filters?.length > 0 || exportFilename) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {filters?.map((f) => (
            <input
              key={f.key}
              type="text"
              placeholder={f.label}
              value={filterValues[f.key] || ''}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                setPage(0);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            />
          ))}
          {exportFilename && (
            <button
              onClick={handleExport}
              className="ml-auto px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
            >
              Export CSV
            </button>
          )}
        </div>
      )}

      {sortedData.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`px-4 py-3 text-left font-medium text-gray-600 ${
                        col.sortable !== false ? 'cursor-pointer hover:text-gray-900 select-none' : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-xs">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-gray-100 last:border-0 ${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-700">
                        {col.render
                          ? col.render(row)
                          : col.accessor
                          ? col.accessor(row)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedData.length)} of {sortedData.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
