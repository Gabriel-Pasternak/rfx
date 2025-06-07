import React, { useState } from 'react';
import Skeleton from './Skeleton';

export default function DataTable({ columns, data, loading, onRowClick, searchable = false }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleSort = col => {
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  let filtered = data;
  if (searchable && search) {
    filtered = data.filter(row =>
      columns.some(col =>
        String(row[col.accessor] || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      if (a[sortCol] < b[sortCol]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortCol] > b[sortCol]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-3 flex justify-end">
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.accessor}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => handleSort(col.accessor)}
                >
                  <span>{col.Header}</span>
                  {sortCol === col.accessor && (
                    <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton width="100%" height={18} />
                      </td>
                    ))}
                  </tr>
                ))
              : paged.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50 cursor-pointer transition"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map(col => (
                      <td key={col.accessor} className="px-4 py-3 text-sm text-gray-900">
                        {col.Cell ? col.Cell(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages || 1}
        </span>
        <div className="space-x-2">
          <button
            className="px-2 py-1 rounded border text-xs disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="px-2 py-1 rounded border text-xs disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 