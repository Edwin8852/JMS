import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchMyTickets, createTicket } from '../../store/slices/supportSlice';
import { 
  MessageSquare, 
  Plus, 
  X, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import { toast } from 'react-toastify';

const SupportCenter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.support);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'GOLD_LOAN',
    priority: 'MEDIUM',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchMyTickets());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTicket(formData)).unwrap();
      toast.success('Ticket raised successfully!');
      setIsModalOpen(false);
      setFormData({ subject: '', category: 'GOLD_LOAN', priority: 'MEDIUM', description: '' });
      dispatch(fetchMyTickets());
    } catch (error) {
      toast.error(error || 'Failed to raise ticket');
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
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {t('Support Center Title').split(' ')[0]} <span className="text-gold">{t('Support Center Title').split(' ').slice(1).join(' ')}</span> <LifeBuoy className="text-gold shrink-0" size={32} />
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">{t("Need help with your loans or chits? Raise a ticket and we'll get back to you.")}</p>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-gold-gradient text-black px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-black text-sm shadow-xl shadow-gold/20 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={3} />
          {t('NEW SUPPORT TICKET')}
        </motion.button>
      </div>

      {/* Tickets List */}
      <div className="bg-dark-surface border border-dark-border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-black text-white">{t('Your Support Tickets')}</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={t('Search tickets...')}
              className="bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-2 text-sm text-white focus:border-gold outline-none transition-all w-full"
            />
          </div>
        </div>

        <div className="divide-y divide-dark-border/50">
          {tickets.length === 0 ? (
            <div className="p-12 md:p-20 text-center flex flex-col items-center">
              <MessageSquare size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium italic">{t('No active support tickets found.')}</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gold/5 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getStatusColor(ticket.status)}`}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base md:text-lg mb-1 break-words">{ticket.subject}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t(ticket.category)}</span>
                      <span className="text-gray-700 hidden sm:inline">•</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                    {t(ticket.status)}
                  </span>
                  <ChevronRight size={20} className="text-gray-700 group-hover:text-gold transition-colors hidden sm:block" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-6 md:p-8 bg-gold-gradient flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-black text-black">{t('Raise Ticket').split(' ')[0]} <span className="opacity-70">{t('Raise Ticket').split(' ').slice(1).join(' ')}</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/10 rounded-full text-black">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Category')}</label>
                  <select 
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="GOLD_LOAN">{t('Gold Loan Related')}</option>
                    <option value="CHIT_FUND">{t('Chit Fund Related')}</option>
                    <option value="PAYMENT">{t('Payment/Transaction Issue')}</option>
                    <option value="KYC">{t('KYC/Verification')}</option>
                    <option value="OTHER">{t('General Inquiry')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Subject')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold"
                    placeholder={t('Brief summary of the issue')}
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('Description')}</label>
                  <textarea 
                    required
                    rows="4"
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold resize-none"
                    placeholder={t('Describe your issue in detail...')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 md:py-5 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? t('RAISING TICKET...') : t('SUBMIT SUPPORT REQUEST')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTicket(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-dark-surface border border-dark-border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-dark-border flex justify-between items-start gap-4">
                <div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-2 inline-block ${getStatusColor(selectedTicket.status)}`}>
                    {t(selectedTicket.status)}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white break-words">{selectedTicket.subject}</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 bg-dark-card hover:bg-gold/10 text-gray-400 rounded-full transition-all shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{t('Your Request')}</p>
                  <div className="p-5 md:p-6 bg-dark-card border border-dark-border rounded-2xl text-gray-300 break-words text-sm md:text-base">
                    {selectedTicket.description}
                  </div>
                </div>

                {selectedTicket.adminResponse ? (
                  <div>
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-4">{t('Admin Response')}</p>
                    <div className="p-5 md:p-6 bg-gold/5 border border-gold/20 rounded-2xl text-white break-words text-sm md:text-base">
                      {selectedTicket.adminResponse}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 md:p-6 bg-dark-card/50 border border-dark-border border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                    <Clock size={32} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm font-medium">{t('Pending response from the support team.')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportCenter;
