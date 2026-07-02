import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTickets, respondToTicket } from '../../store/slices/supportSlice';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  User,
  Send,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const SupportManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.support);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('RESOLVED');

  useEffect(() => {
    dispatch(fetchAllTickets());
  }, [dispatch]);

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      await dispatch(respondToTicket({ id: selectedTicket.id, response, status })).unwrap();
      toast.success(t('Response sent and ticket updated!'));
      setSelectedTicket(null);
      setResponse('');
      dispatch(fetchAllTickets());
    } catch (error) {
      toast.error(error || t('Failed to respond'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'text-blue-500 bg-blue-500/10';
      case 'IN_PROGRESS': return 'text-amber-500 bg-amber-500/10';
      case 'RESOLVED': return 'text-green-500 bg-green-500/10';
      case 'CLOSED': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('Support')} <span className="text-gold">{t('Inbox')}</span></h1>
        <p className="text-gray-500 font-medium">{t('Manage and resolve customer inquiries and technical issues')}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface border border-dark-border p-6 rounded-3xl">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{t('Total Tickets')}</p>
          <h3 className="text-2xl font-black text-white">{tickets?.length || 0}</h3>
        </div>
        <div className="bg-dark-surface border border-dark-border p-6 rounded-3xl">
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">{t('Open')}</p>
          <h3 className="text-2xl font-black text-white">{tickets?.filter(t => t.status === 'OPEN').length || 0}</h3>
        </div>
        <div className="bg-dark-surface border border-dark-border p-6 rounded-3xl">
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1">{t('In Progress')}</p>
          <h3 className="text-2xl font-black text-white">{tickets?.filter(t => t.status === 'IN_PROGRESS').length || 0}</h3>
        </div>
        <div className="bg-dark-surface border border-dark-border p-6 rounded-3xl">
          <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1">{t('Resolved')}</p>
          <h3 className="text-2xl font-black text-white">{tickets?.filter(t => t.status === 'RESOLVED').length || 0}</h3>
        </div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={t('Search by customer or subject...')}
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-gold outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 bg-dark-card border border-dark-border text-gray-400 rounded-xl flex items-center gap-2 hover:text-gold transition-all">
              <Filter size={18} /> {t('Filter')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20">
              <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">{t('Fetching Support Inbox...')}</p>
            </div>
          ) : !Array.isArray(tickets) || tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 bg-dark-card border border-dark-border rounded-3xl flex items-center justify-center text-gray-600 mb-6">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('No tickets found')}</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8">{t('The support inbox is currently empty. All customer inquiries have been addressed.')}</p>
              <button 
                onClick={() => dispatch(fetchAllTickets())}
                className="px-6 py-3 bg-gold/10 text-gold font-bold rounded-xl hover:bg-gold hover:text-black transition-all"
              >
                {t('Refresh Inbox')}
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-border bg-dark-card/30">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Customer')}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Subject')}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Category')}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Priority')}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Status')}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{t('Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-bold">
                          {ticket.customer?.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ticket.customer?.firstName || t('Unknown')} {ticket.customer?.lastName || ''}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{ticket.customer?.customerCode || t('N/A')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-white max-w-xs truncate">{ticket.subject}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{ticket.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
                        ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'text-red-500 bg-red-500/10' : 'text-gray-400 bg-gray-400/10'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-black rounded-lg transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 border-b border-dark-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center text-black font-black">
                    {selectedTicket.customer?.firstName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedTicket.subject}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{selectedTicket.customer?.firstName} {selectedTicket.customer?.lastName} • {selectedTicket.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-dark-card rounded-full text-gray-500">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Customer Description')}</p>
                  <div className="p-6 bg-dark-card border border-dark-border rounded-2xl text-gray-300 leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>

                <form onSubmit={handleRespond} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest">{t('Administrative Response')}</p>
                    <textarea 
                      required
                      rows="4"
                      className="w-full bg-dark-card border border-dark-border rounded-2xl px-6 py-6 text-white outline-none focus:border-gold resize-none"
                      placeholder={t('Type your response to the customer...')}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <select 
                        className="w-full h-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-white outline-none focus:border-gold"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="IN_PROGRESS">{t('Set to In-Progress')}</option>
                        <option value="RESOLVED">{t('Mark as Resolved')}</option>
                        <option value="CLOSED">{t('Close Ticket')}</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="flex-[2] py-4 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                    >
                      <Send size={18} strokeWidth={3} /> {t('Send Response')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportManagement;
