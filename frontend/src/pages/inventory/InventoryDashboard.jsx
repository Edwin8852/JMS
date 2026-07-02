import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/inventorySlice';
import { Layers, AlertTriangle, List, Activity, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-surface border border-dark-border rounded-3xl p-6 flex items-center justify-between">
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className={`text-2xl font-black ${colorClass}`}>{value}</h3>
    </div>
    <div className={`p-4 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
      <Icon size={24} className={colorClass} />
    </div>
  </motion.div>
);

const InventoryDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector(state => state.inventory);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return <div className="p-8 text-center text-gold animate-pulse">Loading Inventory Stats...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!dashboard) return null;

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
      <h1 className="text-2xl md:text-4xl font-black text-[#1f2937] uppercase tracking-tight flex items-center gap-3">
        <Layers className="text-gold" size={32} /> Inventory <span className="text-gold">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total 22K Gold" value={`${dashboard.totalGold22K || 0} g`} icon={Box} colorClass="text-yellow-500" />
        <StatCard title="Total 18K Gold" value={`${dashboard.totalGold18K || 0} g`} icon={Box} colorClass="text-yellow-400" />
        <StatCard title="Total Silver" value={`${dashboard.totalSilver || 0} g`} icon={Box} colorClass="text-gray-300" />
        <StatCard title="Low Stock Alerts" value={dashboard.lowStockCount || 0} icon={AlertTriangle} colorClass="text-red-500" />
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-3xl overflow-hidden mt-8">
        <div className="p-6 border-b border-dark-border flex items-center gap-2">
          <Activity className="text-gold" size={20} />
          <h2 className="text-lg font-black text-white uppercase">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-card border-b border-dark-border text-[10px] uppercase font-black text-gray-500">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {dashboard.recentTransactions?.map(tx => (
                <tr key={tx.id} className="hover:bg-dark-card transition-colors">
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
                  <td className="px-6 py-4 text-white font-bold text-sm">
                    {tx.transactionType === 'STOCK_OUT' ? '-' : '+'}{tx.quantity} {tx.inventoryItem?.unit}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {tx.user?.firstName} {tx.user?.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!dashboard.recentTransactions || dashboard.recentTransactions.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm uppercase">No recent transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
