import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Database, 
  ShieldCheck, 
  Users, 
  Cpu, 
  Globe, 
  Zap,
  Lock,
  Search
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const apiTrafficData = [
  { time: '00:00', requests: 400 },
  { time: '04:00', requests: 300 },
  { time: '08:00', requests: 1200 },
  { time: '12:00', requests: 1800 },
  { time: '16:00', requests: 1400 },
  { time: '20:00', requests: 900 },
  { time: '23:59', requests: 500 },
];

const healthData = [
  { name: 'CPU', value: 45 },
  { name: 'RAM', value: 68 },
  { name: 'Disk', value: 32 },
  { name: 'Network', value: 12 },
];

const SuperAdminDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">System Monitoring</h1>
          <p className="text-gray-500 mt-1">Global platform health and audit tracking.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-bold border border-green-500/20">
          <Zap size={14} fill="currentColor" />
          SYSTEM OPERATIONAL
        </div>
      </div>

      {/* Real-time Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'API Uptime', value: '99.99%', icon: Globe, color: 'text-blue-500' },
          { label: 'DB Connections', value: '156 Active', icon: Database, color: 'text-gold' },
          { label: 'System Load', value: '42%', icon: Cpu, color: 'text-purple-500' },
          { label: 'Security Alerts', value: '0 Critical', icon: ShieldCheck, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-dark-card ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity size={20} className="text-gold" />
              API Traffic (24h)
            </h3>
            <select className="bg-gray-100 dark:bg-dark-card border-none outline-none px-4 py-2 rounded-xl text-sm">
              <option>Total Requests</option>
              <option>Errors only</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiTrafficData}>
                <defs>
                  <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorApi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Lock size={20} className="text-gold" />
            Audit Logs
          </h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Admin 'karan' updated inventory</p>
                  <p className="text-xs text-gray-500">2 mins ago • IP: 192.168.1.1</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-gray-100 dark:bg-dark-card rounded-2xl text-sm font-bold hover:bg-gold hover:text-black transition-all">
            View All Security Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
