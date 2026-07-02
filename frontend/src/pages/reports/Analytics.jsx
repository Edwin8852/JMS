import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import dashboardApi from '../../api/dashboard.api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getExecutiveStats();
      setData(response.data.data);
    } catch (err) {
      toast.error('Failed to load executive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <RefreshCw className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  const { kpis, charts, security } = data;

  const COLORS = ['#D4AF37', '#1A1A1A', '#4A4A4A', '#8E8E8E'];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Executive <span className="text-gold">Analytics</span></h1>
          <p className="text-gray-500 font-medium">Enterprise-level financial performance and risk monitoring.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="p-3 bg-dark-card border border-dark-border text-gray-400 rounded-xl hover:text-gold transition-all">
            <RefreshCw size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gold text-black rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Portfolio Value" 
          value={`₹${kpis.totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          up={true}
          icon={<DollarSign className="text-gold" />}
        />
        <StatCard 
          title="Loan Revenue" 
          value={`₹${kpis.loanRevenue.toLocaleString()}`} 
          trend="+8.2%" 
          up={true}
          icon={<TrendingUp className="text-gold" />}
        />
        <StatCard 
          title="Penalty Collection" 
          value={`₹${kpis.totalPenalty.toLocaleString()}`} 
          trend="+24.1%" 
          up={true}
          icon={<ShieldAlert className="text-gold" />}
        />
        <StatCard 
          title="Overdue Accounts" 
          value={kpis.overdueCount} 
          trend="-2.4%" 
          up={false}
          icon={<Users className="text-gold" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Mix */}
        <div className="lg:col-span-1 bg-dark-surface border border-dark-border rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className="text-lg font-black text-white mb-8">Revenue Mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.revenueByChannel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.revenueByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Trends */}
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-[2.5rem] p-8 shadow-2xl">
          <h3 className="text-lg font-black text-white mb-8">Collection Trends (Last 6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.collectionTrends}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short' })} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" />
                <Area type="monotone" dataKey="target" stroke="#444" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security Audit Feed */}
      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-dark-border flex justify-between items-center">
          <h3 className="text-lg font-black text-white">System Security & Audit Feed</h3>
          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Integrity Monitoring
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-card/50 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-8 py-4">Event Time</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4">Module</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {security.audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5 text-xs text-gray-400">
                    {new Date(audit.createdAt).toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                        {audit.user?.firstName?.[0]}{audit.user?.lastName?.[0]}
                      </div>
                      <span className="text-sm font-bold text-white">{audit.user?.firstName} {audit.user?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-gray-300">{audit.action.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-dark-card border border-dark-border rounded text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                      {audit.module}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-green-500 uppercase">SECURE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, up, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-dark-surface border border-dark-border p-8 rounded-[2rem] shadow-xl"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-dark-card border border-dark-border rounded-2xl">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-white">{value}</h3>
  </motion.div>
);

export default Analytics;
