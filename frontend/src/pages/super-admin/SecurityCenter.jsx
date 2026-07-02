import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSecurityLogs } from '../../store/slices/securitySlice';
import { 
  ShieldCheck, 
  Lock, 
  History, 
  User as UserIcon, 
  Monitor, 
  Globe, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  X
} from 'lucide-react';

const SecurityCenter = () => {
  const dispatch = useDispatch();
  const { logins, audits, loading } = useSelector((state) => state.security);
  const [activeTab, setActiveTab] = useState('LOGINS');
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    dispatch(fetchSecurityLogs());
    const interval = setInterval(() => dispatch(fetchSecurityLogs()), 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="w-full space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Security <span className="text-gold">Center</span> <ShieldCheck className="text-gold inline-block mb-1" size={32} />
          </h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">Forensic Audit Trails & Access Management</p>
        </motion.div>

        <div className="flex bg-dark-surface border border-dark-border p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('LOGINS')}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'LOGINS' ? 'bg-gold-gradient text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Access Logs
          </button>
          <button 
            onClick={() => setActiveTab('AUDITS')}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'AUDITS' ? 'bg-gold-gradient text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Audit Trails
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-dark-surface border border-dark-border p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Lock size={120} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Access Events</p>
          <h3 className="text-4xl font-black text-white">{logins.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-green-500">
             <CheckCircle size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">System Integrity Verified</span>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <AlertCircle size={120} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Failed Attempts</p>
          <h3 className="text-4xl font-black text-red-500">{logins.filter(l => l.status === 'FAILED').length}</h3>
          <p className="text-gray-600 text-[10px] font-medium mt-4 italic uppercase">Detection engine active</p>
        </div>

        <div className="bg-dark-surface border border-dark-border p-8 rounded-[2.5rem] relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <History size={120} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Administrative Mutations</p>
          <h3 className="text-4xl font-black text-gold">{audits.length}</h3>
          <p className="text-gray-600 text-[10px] font-medium mt-4 italic uppercase tracking-tighter">Immutable forensic record</p>
        </div>
      </div>

      {/* Main Logs Area */}
      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden min-h-[600px]">
        {loading ? (
           <div className="p-40 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="inline-block">
                <ShieldCheck size={64} className="text-gold/20" />
              </motion.div>
              <p className="text-gold font-black tracking-widest uppercase mt-4 animate-pulse">Decrypting Security Data...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'LOGINS' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-dark-card border-b border-dark-border">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User / Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Point (IP)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Device Signature</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {logins.map((log, idx) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gold/5 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center font-black">
                            {log.user?.firstName?.[0] || 'S'}
                          </div>
                          <div>
                             <p className="text-white font-black text-sm">{log.user?.firstName} {log.user?.lastName}</p>
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{log.user?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-xs">
                          <Globe size={14} className="text-gold/50" /> {log.ipAddress || '127.0.0.1'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-gray-500 truncate max-w-xs text-[10px] font-medium uppercase italic">
                           <Monitor size={14} /> {log.userAgent?.split(' ')[0]}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${log.status === 'SUCCESS' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10 animate-pulse'}`}>
                           {log.status === 'SUCCESS' ? <CheckCircle size={10}/> : <XCircle size={10}/>} {log.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-bold text-xs">
                         {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-dark-card border-b border-dark-border">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action / Module</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Target ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {audits.map((log, idx) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gold/5 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gold-gradient text-black rounded-xl flex items-center justify-center font-black">
                             {log.user?.firstName?.[0]}
                           </div>
                           <p className="text-white font-black text-sm">{log.user?.firstName} {log.user?.lastName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                           <span className="text-white font-bold text-xs uppercase">{log.action.replace('_', ' ')}</span>
                           <span className="text-[10px] text-gold font-black uppercase tracking-widest">{log.module}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-gray-500">
                         {log.targetId ? log.targetId.slice(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-bold text-xs">
                         {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                         <button 
                          onClick={() => setSelectedAudit(log)}
                          className="p-2 bg-dark-card border border-dark-border text-gray-500 hover:text-gold hover:border-gold/50 rounded-lg transition-all"
                         >
                           <Eye size={18} />
                         </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAudit(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-4xl bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden"
            >
               <div className="p-8 border-b border-dark-border flex justify-between items-center bg-dark-card/50">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center text-black">
                     <History size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Audit Payload Review</h3>
                     <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Forensic diff for action: {selectedAudit.action}</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedAudit(null)} className="p-2 hover:bg-dark-card rounded-full text-gray-500">
                    <X size={24} />
                 </button>
               </div>

               <div className="p-8 grid grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initial State (OLD)</p>
                    <div className="p-6 bg-black rounded-2xl font-mono text-xs text-gray-400 overflow-x-auto">
                      <pre>{JSON.stringify(selectedAudit.oldData || {}, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest">Modified State (NEW)</p>
                    <div className="p-6 bg-black border border-gold/10 rounded-2xl font-mono text-xs text-gold/80 overflow-x-auto">
                       <pre>{JSON.stringify(selectedAudit.newData || {}, null, 2)}</pre>
                    </div>
                  </div>
               </div>

               <div className="p-8 border-t border-dark-border bg-dark-card/30 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                       <Globe size={14} className="text-gray-500" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Source IP: {selectedAudit.ipAddress || 'Internal'}</span>
                     </div>
                  </div>
                  <button onClick={() => setSelectedAudit(null)} className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl">
                    Close Review
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityCenter;
