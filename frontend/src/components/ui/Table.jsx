import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ columns, data, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-dark-card animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-3 min-w-[700px]">
        <thead>
          <tr className="text-left text-sm text-gray-500 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 pb-2 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIdx * 0.05 }}
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className="bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-card transition-all cursor-pointer group shadow-sm rounded-2xl"
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={`px-6 py-5 text-sm ${colIdx === 0 ? 'rounded-l-2xl' : ''} ${colIdx === columns.length - 1 ? 'rounded-r-2xl' : ''}`}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 italic">No records found.</p>
        </div>
      )}
    </div>
  );
};

export default Table;
