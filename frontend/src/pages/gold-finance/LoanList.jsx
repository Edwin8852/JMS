import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoans } from '../../store/slices/loanSlice';
import Table from '../../components/ui/Table';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Coins, 
  Gem, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoanList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans, loading, error } = useSelector((state) => state.loans);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = "Gold Loans | SDRS Gold Finance";
    dispatch(fetchLoans());
  }, [dispatch]);

  const filteredLoans = loans.filter(loan => 
    loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Disbursed', value: '₹ 1.2 Cr', icon: <Coins size={24} />, color: 'bg-gold/10 text-gold' },
    { label: 'Active Loans', value: '142', icon: <Gem size={24} />, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Interest Earned', value: '₹ 8.4 L', icon: <TrendingUp size={24} />, color: 'bg-green-500/10 text-green-600' },
    { label: 'Overdue', value: '12', icon: <AlertCircle size={24} />, color: 'bg-red-500/10 text-red-500' },
  ];

  const columns = [
    {
      header: 'Loan Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
            <Gem size={24} />
          </div>
          <div>
            <p className="font-bold text-sm">#{row.loanNumber}</p>
            <p className="text-xs text-gray-500">{row.ornamentType || 'Gold Ornaments'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-bold text-sm">{row.customer?.firstName} {row.customer?.lastName}</p>
          <p className="text-xs text-gray-500">ID: {row.customer?.customerCode}</p>
        </div>
      )
    },
    {
      header: 'Valuation',
      render: (row) => (
        <div>
          <p className="font-bold text-sm">₹ {row.loanAmount?.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{row.goldWeight}g @ {row.goldPurity}K</p>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
          row.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 
          row.status === 'CLOSED' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          onClick={() => navigate(`/gold-finance/details/${row.id}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-all text-gray-400 hover:text-gold"
        >
          <ArrowUpRight size={20} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Gold Loan Management</h1>
          <p className="text-gray-500 mt-1">Monitor valuations, disbursements, and repayments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => navigate('/gold-finance/create')}
            className="btn-gold flex items-center gap-2"
          >
            <Plus size={18} /> New Loan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded-[2.5rem] flex items-center gap-5 hover:scale-[1.02] transition-all cursor-default"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="glass-card p-8 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by loan ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-50 dark:bg-dark-card rounded-2xl text-gray-500 hover:text-gold transition-all font-bold text-sm">
              <Filter size={18} /> Advanced Filter
            </button>
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredLoans} 
          loading={loading}
          onRowClick={(row) => navigate(`/gold-finance/details/${row.id}`)}
        />
        
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 text-red-500 rounded-2xl text-center text-sm font-bold border border-red-500/20">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanList;
