import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory } from '../../store/slices/inventorySlice';
import { History, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const StockHistory = () => {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector(state => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchHistory({ search: searchTerm, transactionType: filterType, page, limit: 15 }));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm, filterType, page]);

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
      <h1 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight flex items-center gap-3">
        <History className="text-gold" size={32} /> Stock <span className="text-gold">History</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by item name..." 
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white text-sm appearance-none"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="ALL">All Transactions</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-card border-b border-dark-border text-[10px] uppercase font-black text-gray-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Qty Change</th>
                <th className="px-6 py-4">Bal. Stock</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading && history.data.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gold animate-pulse text-xs font-black uppercase">Loading...</td></tr>
              ) : history.data.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500 text-xs font-black uppercase">No history found</td></tr>
              ) : (
                history.data.map((tx, idx) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} key={tx.id} className="hover:bg-dark-card transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-sm">{tx.inventoryItem?.itemName}</span>
                      <span className="text-[10px] block text-gray-500">{tx.inventoryItem?.purity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                        tx.transactionType === 'STOCK_IN' ? 'bg-green-500/10 text-green-500' :
                        tx.transactionType === 'STOCK_OUT' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">
                      <span className={tx.transactionType === 'STOCK_OUT' ? 'text-red-500' : 'text-green-500'}>
                        {tx.transactionType === 'STOCK_OUT' ? '-' : '+'}{tx.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-bold">{tx.currentStock}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{tx.user?.firstName} {tx.user?.lastName}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate" title={tx.remarks}>{tx.remarks || '-'}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {history.totalPages > 1 && (
          <div className="p-4 border-t border-dark-border flex justify-between items-center bg-dark-card">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-xs font-black uppercase text-gray-400 hover:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-500">Page {history.currentPage} of {history.totalPages}</span>
            <button 
              disabled={page === history.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-xs font-black uppercase text-gold hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistory;
