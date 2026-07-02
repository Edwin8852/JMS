import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  User, 
  Clock,
  ExternalLink
} from 'lucide-react';
import Table from '../../components/ui/Table';

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = "Activity Logs | SDRS Gold Finance";
  }, []);

  const logData = [
    { id: 1, admin: 'karan_admin', action: 'Created New Loan', module: 'Loans', time: '2 mins ago', ip: '192.168.1.1', status: 'SUCCESS' },
    { id: 2, admin: 'karan_admin', action: 'Updated Gold Rate', module: 'Gold Rates', time: '15 mins ago', ip: '192.168.1.1', status: 'SUCCESS' },
    { id: 3, admin: 'vijay_manager', action: 'Failed Login Attempt', module: 'Auth', time: '1 hour ago', ip: '103.24.56.2', status: 'FAILURE' },
    { id: 4, admin: 'karan_admin', action: 'Exported Revenue PDF', module: 'Reports', time: '3 hours ago', ip: '192.168.1.1', status: 'SUCCESS' },
    { id: 5, admin: 'system', action: 'Automated Backup', module: 'System', time: '6 hours ago', ip: 'localhost', status: 'SUCCESS' },
  ];

  const columns = [
    {
      header: 'Admin / System',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${row.admin === 'system' ? 'bg-purple-500/10 text-purple-500' : 'bg-gold/10 text-gold'}`}>
            <User size={18} />
          </div>
          <div>
            <p className="font-bold">{row.admin}</p>
            <p className="text-xs text-gray-500">{row.ip}</p>
          </div>
        </div>
      )
    },
    { header: 'Action', accessor: 'action' },
    { header: 'Module', accessor: 'module' },
    {
      header: 'Time',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock size={14} />
          {row.time}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          row.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Audit',
      render: () => (
        <button className="text-gold hover:underline flex items-center gap-1 text-xs font-bold">
          Verify <ExternalLink size={12} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Activity Logs</h1>
          <p className="text-gray-500 text-sm">Monitor all administrative activities and system changes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={18} /> Export History
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by admin or action..."
              className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Filter size={18} /> Module Filter
            </button>
          </div>
        </div>
        <Table columns={columns} data={logData.filter(log => 
          log.admin.toLowerCase().includes(searchTerm.toLowerCase()) || 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.module.toLowerCase().includes(searchTerm.toLowerCase())
        )} />
      </div>
    </div>
  );
};

export default ActivityLogs;
