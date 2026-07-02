import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Download, Filter, TrendingUp, Calendar, FileText, 
  DollarSign, Activity, Users, CheckCircle, Clock, Award
} from 'lucide-react';
import { toast } from 'react-toastify';

const COLORS = {
  primaryGold: '#D4A62A',
  darkBg: '#0B0F19',
  cardBg: '#111827',
  borderGold: 'rgba(212,166,42,0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  success: '#22C55E',
  danger: '#EF4444',
  blue: '#3B82F6',
  purple: '#A855F7'
};

const PIE_COLORS = [COLORS.primaryGold, COLORS.blue, COLORS.danger, COLORS.purple];

const Reports = () => {
  const { t } = useTranslation();
  const [chartView, setChartView] = useState('Monthly');

  useEffect(() => {
    document.title = `${t('Reports & Analytics')} | SDRS Gold Finance`;
  }, [t]);

  // Mock Data for Charts
  const revenueData = [
    { name: t('Week 1'), revenue: 45000, collections: 32000 },
    { name: t('Week 2'), revenue: 52000, collections: 41000 },
    { name: t('Week 3'), revenue: 48000, collections: 38000 },
    { name: t('Week 4'), revenue: 61000, collections: 52000 },
  ];

  const recoveryTrendData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  const loanPortfolioData = [
    { name: 'Active', value: 65 },
    { name: 'Closed', value: 25 },
    { name: 'Overdue', value: 10 },
  ];

  const sparklineData = [
    { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 45 }, { value: 40 }
  ];

  const kpis = [
    { title: 'Total Revenue (MTD)', value: '₹ 18,45,000', trend: '+12.5%', isPositive: true, icon: DollarSign },
    { title: 'Total Collections', value: '₹ 15,20,000', trend: '+8.2%', isPositive: true, icon: Activity },
    { title: 'Active Loans', value: '1,245', trend: '+5.1%', isPositive: true, icon: Users },
    { title: 'Collection Efficiency', value: '94.2%', trend: '-1.2%', isPositive: false, icon: CheckCircle },
    { title: 'Pending Approvals', value: '42', trend: '+12', isPositive: false, icon: Clock },
    { title: 'Gold Assets Value', value: '₹ 4.2 Cr', trend: '+2.4%', isPositive: true, icon: Award },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-surface border border-dark-border p-4 rounded-xl shadow-xl shadow-black/50 backdrop-blur-md">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-300">{entry.name}:</span> 
              <span className="text-white font-bold">
                {typeof entry.value === 'number' && entry.name !== 'Active' && entry.name !== 'Closed' && entry.name !== 'Overdue' ? `₹ ${entry.value.toLocaleString()}` : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6 md:p-8 font-sans transition-colors duration-300 rounded-[30px]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            {t('Reports')} <span className="text-[#D4A62A]">& {t('Analytics')}</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium tracking-wide text-sm">{t('Enterprise-grade financial intelligence & overview.')}</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info(t('Date range filter clicked'))}
            className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-5 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gold/10 hover:border-gold transition-all shadow-lg"
          >
            <Calendar size={18} className="text-[#D4A62A]" /> {t('Date Range')}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success(t('PDF Export started'))}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4A62A] to-[#B8860B] text-black px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(212,166,42,0.3)] hover:shadow-[0_0_30px_rgba(212,166,42,0.5)] transition-all"
          >
            <Download size={18} /> {t('Export PDF')}
          </motion.button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-surface border border-dark-border rounded-[20px] p-6 hover:border-gold/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4A62A] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-[rgba(212,166,42,0.1)] rounded-xl text-[#D4A62A] group-hover:scale-110 transition-transform duration-300">
                <kpi.icon size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${kpi.isPositive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                {kpi.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[#9CA3AF] text-sm font-semibold mb-1 uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-3xl font-black text-white">{kpi.value}</h3>
            </div>
            
            <div className="h-12 mt-4 -mx-2 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke={kpi.isPositive ? '#22C55E' : '#EF4444'} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Revenue & Collections Overview */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-[20px] p-6 lg:p-8 hover:border-gold/30 transition-colors shadow-lg"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white">
              <TrendingUp size={22} className="text-[#D4A62A]" />
              {t('Revenue & Collections Overview')}
            </h3>
            <div className="flex bg-dark-bg p-1 rounded-lg border border-dark-border">
              {['Weekly', 'Monthly'].map(view => (
                <button 
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${chartView === view ? 'bg-[rgba(212,166,42,0.15)] text-[#D4A62A]' : 'text-[#9CA3AF] hover:text-white'}`}
                >
                  {t(view)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dx={-10} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(212,166,42,0.05)'}} />
                <Bar dataKey="revenue" name={t('Revenue')} fill="#D4A62A" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="collections" name={t('Collections')} fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Collection Summary Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark-surface border border-dark-border rounded-[20px] p-6 lg:p-8 hover:border-gold/30 transition-colors shadow-lg flex flex-col"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
            <FileText size={22} className="text-[#D4A62A]" />
            {t('Collection Summary')}
          </h3>
          
          <div className="relative h-[200px] mb-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Principal', value: 1245000 },
                    { name: 'Interest', value: 312000 },
                    { name: 'Fees', value: 63500 },
                  ]}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#D4A62A" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#A855F7" />
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">{t('Total')}</span>
              <span className="text-2xl font-black text-white">₹ 16.2L</span>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
             {[
               { label: t('Principal Collections'), value: '₹ 12,45,000', dot: 'bg-[#D4A62A]' },
               { label: t('Interest Collections'), value: '₹ 3,12,000', dot: 'bg-[#3B82F6]' },
               { label: t('Fees & Penalties'), value: '₹ 63,500', dot: 'bg-[#A855F7]' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center p-3.5 bg-dark-bg rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                    <span className="text-xs text-[#9CA3AF] font-bold tracking-wide">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">{item.value}</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        
        {/* Recovery Trend Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface border border-dark-border rounded-[20px] p-6 lg:p-8 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white">
              <Activity size={22} className="text-[#22C55E]" />
              {t('Recovery Trend')}
            </h3>
            <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-[10px] font-black uppercase tracking-widest">+18% {t('vs Last Week')}</span>
          </div>

          <div className="h-[280px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recoveryTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dx={-10} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="value" name={t('Recovery')} stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRecovery)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Loan Portfolio Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface border border-dark-border rounded-[20px] p-6 lg:p-8 shadow-lg flex flex-col sm:flex-row gap-8 items-center"
        >
          <div className="flex-1 w-full">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-3 text-white">
              <PieChart size={22} className="text-[#A855F7]" />
              {t('Loan Portfolio')}
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-8 font-medium">{t('Distribution of current loan statuses')}</p>
            
            <div className="space-y-4">
              {[
                { name: 'Active Loans', value: '65%', color: 'bg-[#D4A62A]', amount: '809' },
                { name: 'Closed Loans', value: '25%', color: 'bg-[#3B82F6]', amount: '311' },
                { name: 'Overdue Loans', value: '10%', color: 'bg-[#EF4444]', amount: '125' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_${item.color.replace('bg-[', '').replace(']', '')}]`}></div>
                    <div>
                      <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{item.name}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-bold tracking-widest uppercase">{item.amount} {t('Accounts')}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-[200px] h-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loanPortfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#D4A62A" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#EF4444" />
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Key Insights Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white px-2">
          <Award size={22} className="text-[#D4A62A]" />
          {t('Key Insights')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('Highest Collection Day'), value: t('Wednesday'), detail: '₹ 4,12,000' },
            { label: t('Loan Approval Ratio'), value: '88.5%', detail: t('+2.4% vs last month') },
            { label: t('Average Daily Collection'), value: '₹ 2,45,000', detail: t('Steady performance') },
            { label: t('Total Overdue Amount'), value: '₹ 8,15,000', detail: t('Action required'), alert: true },
          ].map((insight, idx) => (
            <div key={idx} className={`bg-dark-surface border ${insight.alert ? 'border-red-500/30' : 'border-dark-border'} rounded-2xl p-5 hover:bg-dark-bg transition-colors`}>
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-2">{insight.label}</p>
              <h4 className={`text-xl font-black mb-1 ${insight.alert ? 'text-[#EF4444]' : 'text-white'}`}>{insight.value}</h4>
              <p className="text-xs text-gray-500 font-medium">{insight.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default Reports;
