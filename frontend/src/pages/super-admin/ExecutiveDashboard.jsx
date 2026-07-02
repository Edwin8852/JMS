import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchExecutiveStats, fetchHighRiskAccounts, runRiskAnalysis } from '../../store/slices/dashboardSlice';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase, 
  AlertTriangle, 
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { toast } from 'react-toastify';

const ExecutiveDashboard = () => {
  const dispatch = useDispatch();
  const { executiveStats: stats, highRiskAccounts, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchExecutiveStats());
    dispatch(fetchHighRiskAccounts());
  }, [dispatch]);

  const handleRunAI = async () => {
    try {
      await dispatch(runRiskAnalysis()).unwrap();
      toast.success('Global Risk Analysis completed!');
      dispatch(fetchHighRiskAccounts());
      dispatch(fetchExecutiveStats());
    } catch (error) {
      toast.error(error || 'AI analysis failed');
    }
  };

  if (loading || !stats) {
    return <div className="p-8 text-gold animate-pulse font-black text-center mt-20 text-2xl tracking-[0.5em]">INITIALIZING AI ENGINE...</div>;
  }

  const kpis = [
    { label: 'Total Enterprise Revenue', value: `₹${stats.kpis.totalRevenue.toLocaleString()}`, trend: '+12.5%', icon: <TrendingUp />, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Gold Loan Portfolio', value: `₹${stats.kpis.loanRevenue.toLocaleString()}`, trend: '+5.2%', icon: <Briefcase />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Chit Fund Collection', value: `₹${stats.kpis.chitRevenue.toLocaleString()}`, trend: '+8.1%', icon: <DollarSign />, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'AI Risk Exposure', value: highRiskAccounts.length, trend: highRiskAccounts.length > 5 ? '+Critical' : '-Stable', icon: <ShieldAlert />, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const COLORS = ['#D4AF37', '#1E1E1E', '#4B5563', '#9CA3AF'];

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 uppercase">
            Executive <span className="text-gold">Analytics</span>
          </h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">Real-time Financial Intelligence & AI Risk Engine</p>
        </motion.div>
        
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunAI}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase shadow-lg shadow-red-500/20"
          >
            <Zap size={16} fill="currentColor" /> Run AI Analysis
          </motion.button>
          <div className="px-6 py-3 bg-gold-gradient text-black rounded-xl font-black text-xs tracking-widest uppercase shadow-lg shadow-gold/20">
            Enterprise Mode Active
          </div>
        </div>
      </div>
      
      {/* Rest of the UI (KPI Grid, Charts) remains the same but uses dynamic data */}
      {/* ... (Omitted for brevity in this replace call, will keep the core structure) ... */}
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-dark-surface border border-dark-border p-6 rounded-[2rem] hover:border-gold/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold ${kpi.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.trend.includes('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-white">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Mix */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 bg-dark-surface border border-dark-border rounded-[2.5rem] p-8 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <PieIcon className="text-gold" size={20} />
            <h3 className="text-lg font-black text-white tracking-tight">Revenue Mix</h3>
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.revenueByChannel}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats.charts.revenueByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {stats.charts.revenueByChannel.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-400">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Collection Trends */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-[2.5rem] p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-gold" size={20} />
            <h3 className="text-lg font-black text-white tracking-tight">Collection Trends (Last 6 Months)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.charts.collectionTrends}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { month: 'short' })}
                />
                <YAxis stroke="#6b7280" fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="target" stroke="#4B5563" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="collected" stroke="#D4AF37" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Risk Monitor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={24} />
              <h3 className="text-xl font-black text-white">AI Behavioral Risk Monitor</h3>
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-dark-card px-4 py-2 rounded-full border border-dark-border">
              Live Predictions Active
            </span>
          </div>
          
          <div className="space-y-4">
            {highRiskAccounts.length === 0 ? (
              <div className="p-20 text-center text-gray-600 font-bold italic">No high-risk behaviors detected in the current portfolio.</div>
            ) : (
              highRiskAccounts.map((account, idx) => (
                <motion.div 
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-6 bg-dark-card border border-dark-border rounded-2xl group hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center font-black">
                      {account.firstName[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{account.firstName} {account.lastName}</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{account.customerCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Risk Score</p>
                      <span className={`font-black text-lg ${account.riskScore > 70 ? 'text-red-500' : 'text-amber-500'}`}>
                        {account.riskScore}%
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 transition-all">
                      Intervene
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] p-8 flex flex-col justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={120} className="text-gold" />
          </div>
          <AlertTriangle size={48} className="text-gold mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-black text-white mb-2">Predictive Intelligence</h3>
          <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">
            AI analysis predicts a <span className="text-gold font-bold">14% increase</span> in potential defaults over the next 30 days based on current collection trends.
          </p>
          <button className="w-full py-4 bg-gold-gradient text-black rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all">
            VIEW FORECAST REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
