import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchemes } from '../../store/slices/chitFundSlice';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllSubscriptions } from '../../api/chit.api';
import { useTranslation } from 'react-i18next';

const ChitDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schemes, loading: schemesLoading } = useSelector((state) => state.chitFund);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllSubscriptions();
      setSubscriptions(res.data.data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchSchemes());
    loadData();
  }, [dispatch]);

  const stats = [
    { label: t('Active Schemes'), value: schemes.filter(s => s.status === 'ACTIVE').length, icon: <TrendingUp size={24} />, color: 'text-gold', bg: 'bg-gold/10' },
    { label: t('Total Subscribers'), value: schemes.reduce((acc, s) => acc + s.currentSubscribers, 0), icon: <Users size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('Upcoming Auctions'), value: schemes.filter(s => s.status === 'UPCOMING').length, icon: <Calendar size={24} />, color: 'text-gold', bg: 'bg-gold/10' },
    { label: t('Monthly Collections'), value: `₹${subscriptions.reduce((acc, sub) => acc + (sub.installments?.filter(i => i.status === 'PAID').length * sub.scheme?.monthlyInstallment || 0), 0).toLocaleString()}`, icon: <CheckCircle size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const getPaymentStatus = (sub) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const currentMonthPaid = sub.installments?.some(i => {
      if (!i.paymentDate) return false;
      const pDate = new Date(i.paymentDate);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && i.status === 'PAID';
    });

    if (currentMonthPaid) return { label: t('Paid'), color: 'bg-gold/10 text-gold', icon: <CheckCircle size={14} /> };
    
    const nextDue = sub.installments?.find(i => i.status === 'PENDING');
    if (nextDue) {
      const dueDate = new Date(nextDue.dueDate);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 5 && diffDays >= 0) return { label: t('Upcoming'), color: 'bg-amber-500/10 text-amber-600', icon: <Clock size={14} /> };
    }

    return { label: t('Pending'), color: 'bg-blue-500/10 text-blue-600', icon: <AlertCircle size={14} /> };
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.scheme?.schemeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">
            {t('Chit Fund')} <span className="text-gold">{t('Dashboard')}</span>
          </h1>
          <p className="text-gray-500 font-medium">{t('Enterprise savings management and collection tracking')}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin/chit-fund/schemes')}
          className="flex items-center gap-3 bg-gold-gradient text-black px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-gold/20"
        >
          <Plus size={20} strokeWidth={3} />
          {t('CREATE NEW SCHEME')}
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-dark-surface border border-dark-border p-6 rounded-[2rem] hover:border-gold/30 transition-all group"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Payment Status Table */}
      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('Monthly Payment Status')}</h2>
            <p className="text-gray-500 text-xs font-medium mt-1">{t('Real-time tracking of subscriber monthly contributions')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder={t('Search customers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-gold outline-none w-64 transition-all"
              />
            </div>
            <button className="p-3 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-gold transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-card/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Customer Name')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Chit Scheme')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Monthly Amount')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Next Due Date')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Status')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-6 h-16 bg-dark-card/20"></td>
                  </tr>
                ))
              ) : filteredSubscriptions.map((sub) => {
                const sortedInstallments = [...(sub.installments || [])].sort((a, b) => a.installmentNumber - b.installmentNumber);
                const status = getPaymentStatus({ ...sub, installments: sortedInstallments });
                const nextDue = sortedInstallments.find(i => i.status === 'PENDING');
                
                return (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold font-bold text-xs">
                          {sub.customer?.firstName?.[0]}{sub.customer?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{sub.customer?.firstName} {sub.customer?.lastName}</p>
                          <p className="text-[10px] text-gray-500 font-medium">#{sub.ticketNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-300">{sub.scheme?.schemeName}</td>
                    <td className="px-8 py-6 text-sm font-black text-white">₹{parseFloat(sub.scheme?.monthlyInstallment).toLocaleString()}</td>
                    <td className="px-8 py-6 text-sm font-medium text-gray-400">
                      {nextDue ? new Date(nextDue.dueDate).toLocaleDateString() : t('Completed')}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => navigate(`/admin/chit-fund/subscriber/${sub.id}`)}
                        className="p-2 text-gray-500 hover:text-gold transition-all"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filteredSubscriptions.length === 0 && (
            <div className="p-20 text-center text-gray-500 font-medium">
              {t('No matching subscriptions found.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChitDashboard;
