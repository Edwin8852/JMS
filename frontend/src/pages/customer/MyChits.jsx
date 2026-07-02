import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle,
  CreditCard,
  X,
  Loader2,
  TrendingUp,
  History,
  Info,
  Download,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getFullSubscriptionDetails, collectPayment, getAvailableSchemes, enrollSubscriber } from '../../api/chit.api';
import api from '../../api/axios';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://jms-vpf1.onrender.com/api').replace('/api', '');

const MyChits = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'history'
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableSchemes, setAvailableSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [openTimelineId, setOpenTimelineId] = useState(null);

  const toggleTimeline = (id) => setOpenTimelineId(prev => prev === id ? null : id);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, availRes] = await Promise.all([
        getFullSubscriptionDetails(),
        getAvailableSchemes()
      ]);
      setSubscriptions(subsRes.data.data || []);
      setAvailableSchemes(availRes.data.data || []);
    } catch (error) {
      console.error('MyChits Error:', error);
      toast.error('Failed to load chit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayment = async () => {
    if (!selectedInstallment) return;
    
    setIsPaying(true);
    try {
      await collectPayment(selectedInstallment.id, {
        amount: selectedInstallment.payableAmount,
        paymentMethod: 'UPI',
        paymentSource: 'ONLINE_PAYMENT',
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
      
      toast.success('Payment successful!');
      setSelectedInstallment(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDownloadInvoice = async (transactionId) => {
    try {
      const toastId = toast.loading(t('Generating invoice...'));
      const response = await api.get(`/pdf/chit-invoice/${transactionId}`);
      if (response.data.success && response.data.data.pdfUrl) {
        toast.update(toastId, { render: t('Invoice downloaded successfully'), type: 'success', isLoading: false, autoClose: 3000 });
        const pdfUrl = `${BACKEND_URL}${response.data.data.pdfUrl}`;
        window.open(pdfUrl, '_blank');
      } else {
        toast.update(toastId, { render: t('Failed to generate invoice'), type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to download invoice'));
    }
  };

  const handleJoinScheme = async (schemeId) => {
    setIsJoining(true);
    try {
      await enrollSubscriber({ schemeId });
      toast.success('Successfully joined the chit scheme!');
      loadData();
      setActiveTab('active');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join scheme');
    } finally {
      setIsJoining(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCurrentMonthPayment = (installments) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return installments.find(inst => {
      if (!inst.paymentDate) return false;
      const pDate = new Date(inst.paymentDate);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && inst.status === 'PAID';
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{t('Gold')} <span className="text-gold">{t('Savings')}</span></h1>
          <p className="text-gray-500 mt-1 font-medium italic text-sm md:text-base">{t('Empowering your future through secure gold savings.')}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'available' ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {t('Available Schemes')}
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'active' ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {t('My Joined Schemes')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'history' ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {t('Scheme History')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* AVAILABLE SCHEMES TAB */}
        {activeTab === 'available' && (
          availableSchemes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 relative overflow-hidden flex flex-col group hover:-translate-y-1 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-gold/30">
                      <Wallet size={24} />
                    </div>
                    {scheme.startDate && new Date(scheme.startDate).getMonth() === new Date().getMonth() && (
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                        {t('NEW')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-1 line-clamp-1">{t(scheme.schemeName)}</h3>
                  <p className="text-xs text-gray-500 font-bold mb-6 line-clamp-2 min-h-[32px]">{t(scheme.description) || t('Premium Gold Savings Plan')}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Total Value')}</p>
                      <p className="text-sm font-black text-gray-900">₹{parseFloat(scheme.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Monthly')}</p>
                      <p className="text-sm font-black text-gold">₹{parseFloat(scheme.monthlyInstallment).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Clock size={14} className="text-gold" /> {scheme.durationMonths} {t('Months Duration')}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Users size={14} className="text-gold" /> {scheme.maxSubscribers - scheme.currentSubscribers} {t('Slots Available')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinScheme(scheme.id)}
                    disabled={isJoining || scheme.isJoined || scheme.isFull}
                    className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gold-gradient text-white shadow-lg shadow-gold/30 hover:scale-[1.02] active:scale-95"
                  >
                    {scheme.isJoined ? t('Already Joined') : scheme.isFull ? t('Scheme Full') : t('Join Scheme')}
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
             <div className="glass-card p-24 rounded-[3.5rem] text-center space-y-8 border border-dashed border-gray-300 bg-gray-50/30">
              <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-200 border border-gray-100 shadow-2xl shadow-gray-200/20">
                <ShieldCheck size={56} />
              </div>
              <div className="max-w-md mx-auto space-y-3">
                <h3 className="text-3xl font-black tracking-tight text-gray-900">{t('No Available Schemes')}</h3>
                <p className="text-gray-500 font-bold text-sm leading-relaxed">{t("There are no new schemes available to join at the moment. Please check back later.")}</p>
              </div>
            </div>
          )
        )}

        {/* ACTIVE & HISTORY TABS */}
        {(activeTab === 'active' || activeTab === 'history') && (
          subscriptions?.filter(sub => activeTab === 'history' ? (sub?.status === 'COMPLETED' || sub?.status === 'WITHDRAWN') : (sub?.status !== 'COMPLETED' && sub?.status !== 'WITHDRAWN'))?.length > 0 ? (
            subscriptions?.filter(sub => activeTab === 'history' ? (sub?.status === 'COMPLETED' || sub?.status === 'WITHDRAWN') : (sub?.status !== 'COMPLETED' && sub?.status !== 'WITHDRAWN'))?.map((sub, index) => {
          const sortedInstallments = [...(sub?.installments || [])].sort((a, b) => a.installmentNumber - b.installmentNumber);
          const paidInstallments = sortedInstallments.filter(i => i.status === 'PAID');
          const pendingInstallments = sortedInstallments.filter(i => i.status !== 'PAID');
          const nextInstallment = pendingInstallments[0];
          
          const currentMonthPaidInstallment = getCurrentMonthPayment(sortedInstallments);
          const alreadyPaidThisMonth = !!currentMonthPaidInstallment;
          
          const daysLeft = nextInstallment ? getDaysUntilDue(nextInstallment.dueDate) : null;
          const isDueSoon = daysLeft !== null && daysLeft <= 5 && daysLeft >= 0;
          const remainingMonths = sub.scheme?.durationMonths - paidInstallments.length;

          return (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden rounded-[3rem] relative border border-gray-100 shadow-2xl shadow-gray-200/40"
            >
              {/* Alert Ribbon for Due Soon */}
              {isDueSoon && !alreadyPaidThisMonth && (
                <div className="bg-amber-500 text-white text-center py-2.5 text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
                  {t('Reminder: Your monthly payment is due in {{daysLeft}} days', { daysLeft })}
                </div>
              )}

              {/* Success Ribbon if already paid */}
              {alreadyPaidThisMonth && (
                <div className="bg-gold-gradient text-white text-center py-2.5 text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> {t('Monthly Contribution Secured')}
                </div>
              )}

              <div className="p-5 md:p-10 lg:p-14">
                <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-16">
                  <div className="space-y-10 flex-1">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-gold-gradient rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-gold/30">
                        <Wallet className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">{sub.scheme?.schemeName}</h2>
                          <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-gold/20 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" /> {t('Active Plan')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500 font-bold">
                          <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><Calendar size={16} className="text-gold" /> {t('Ticket #')}{sub.ticketNumber}</span>
                          <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"><Clock size={16} className="text-gold" /> {sub.scheme?.durationMonths} {t('Months')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-10 border-t border-gray-100/50">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Monthly Contribution')}</p>
                        <p className="text-2xl font-black text-gray-900">₹{parseFloat(sub.scheme?.monthlyInstallment).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Total Savings Value')}</p>
                        <p className="text-2xl font-black text-gray-900">₹{parseFloat(sub.scheme?.totalAmount).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Total Amount Paid')}</p>
                        <p className="text-2xl font-black text-gold">₹{parseFloat(sub.totalPaid).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Remaining Months')}</p>
                        <p className="text-2xl font-black text-blue-600">{remainingMonths} {t('Months')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-96 space-y-4">
                    {alreadyPaidThisMonth ? (
                      <div className="bg-gradient-to-br from-gold/10 to-white border border-gold/20 rounded-[3rem] p-10 text-center space-y-6 shadow-lg shadow-gold/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                        
                        <div className="w-20 h-20 bg-gold-gradient rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-gold/30">
                           <CheckCircle size={40} />
                        </div>
                        
                        <div className="space-y-2">
                           <h4 className="font-black text-gold uppercase tracking-widest text-xs">{t('Payment Completed')}</h4>
                           <p className="text-xs text-gray-600 font-bold leading-relaxed px-2">
                             {t('Your current month payment has already been completed successfully.')}
                           </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gold/20">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span>{t('Paid Month')}</span>
                              <span className="text-gold">{new Date(currentMonthPaidInstallment.paymentDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span>{t('Amount Paid')}</span>
                              <span className="text-gold">₹{parseFloat(currentMonthPaidInstallment.paidAmount).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <span>{t('Next Due Date')}</span>
                              <span className="text-amber-600 font-black">{nextInstallment ? new Date(nextInstallment.dueDate).toLocaleDateString() : t('Completed')}</span>
                           </div>
                        </div>

                        {currentMonthPaidInstallment?.transactionId ? (
                           <button 
                             onClick={() => handleDownloadInvoice(currentMonthPaidInstallment.transactionId)}
                             className="w-full flex items-center justify-center gap-2 bg-gold-gradient text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4 transition-all shadow-lg shadow-gold/30 active:scale-95 cursor-pointer"
                           >
                              <Download size={16} /> {t('Download Current Invoice')}
                           </button>
                        ) : (
                           <div className="bg-gold-gradient text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                              <ShieldCheck size={16} /> {t('Savings Secured')}
                           </div>
                        )}
                      </div>
                    ) : nextInstallment ? (
                      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[3rem] p-10 space-y-8 shadow-lg shadow-gray-100/50 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Currently Due')}</p>
                          </div>
                          <h3 className="text-4xl font-black text-gray-900 tracking-tight">₹{parseFloat(nextInstallment.payableAmount).toLocaleString()}</h3>
                          <div className="flex items-center gap-2 mt-3 bg-amber-50 w-fit px-3 py-1.5 rounded-xl border border-amber-100">
                             <Clock size={14} className="text-amber-600" />
                             <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{t('Due on {{date}}', { date: new Date(nextInstallment.dueDate).toLocaleDateString() })}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedInstallment(nextInstallment)}
                          className="w-full bg-gold-gradient text-white py-6 rounded-2xl font-black text-sm tracking-widest uppercase shadow-2xl shadow-gold/30 hover:shadow-gold/50 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                          <CreditCard size={20} /> {t('Pay Installment')} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        
                        <div className="flex items-center gap-2 justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <Info size={12} /> {t('Click to pay current month due')}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-[3rem] p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
                           <TrendingUp size={40} />
                        </div>
                        <div>
                           <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs">{t('Plan Completed')}</h4>
                           <p className="text-xs text-blue-600 font-bold mt-2 leading-relaxed">{t('Congratulations! You have successfully completed all installments for this savings plan.')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Installment Timeline Accordion */}
              <div className="px-5 md:px-10 lg:px-14 pb-8">
                <div className="border-t border-gray-100 pt-6">
                  <button 
                    onClick={() => toggleTimeline(sub.id)} 
                    className="w-full flex justify-between items-center text-sm font-bold text-gray-700 hover:text-gold transition-colors"
                  >
                    <span className="uppercase tracking-widest text-[11px] font-black flex items-center gap-2">
                       <History size={16} /> Installment Timeline & Invoices
                    </span>
                    {openTimelineId === sub.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {openTimelineId === sub.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden mt-6"
                      >
                        <div className="flex flex-col space-y-4 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                          {sortedInstallments.map((inst, idx) => {
                            const isFullyPaid = inst.status === 'PAID';
                            const isPartial = inst.status === 'PARTIAL';
                            const isOverdue = inst.status === 'OVERDUE';
                            
                            const statusColor = isFullyPaid ? 'bg-gold/10 text-gold border-gold/20' 
                                              : isPartial ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                              : isOverdue ? 'bg-red-50 text-red-700 border-red-200' 
                                              : 'bg-gray-50 text-gray-500 border-gray-200';
                            
                            const statusDot = isFullyPaid ? 'bg-gold' 
                                            : isPartial ? 'bg-yellow-500' 
                                            : isOverdue ? 'bg-red-500' 
                                            : 'bg-gray-300';
                            
                            return (
                              <div key={inst.id} className="flex items-start gap-4 relative group hover:scale-[1.01] transition-transform">
                                <div className="flex flex-col items-center pt-2">
                                  <div className={`w-3.5 h-3.5 rounded-full ${statusDot} z-10 shadow-sm ring-4 ring-white`} />
                                  {idx !== sortedInstallments.length - 1 && <div className="w-0.5 h-full bg-gray-100 absolute top-5 left-[7px] -z-10" />}
                                </div>
                                <div className={`flex-1 flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-2xl border ${statusColor} shadow-sm backdrop-blur-sm transition-all`}>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                       Installment #{inst.installmentNumber}
                                       {isFullyPaid && <CheckCircle size={12} className="text-gold" />}
                                    </p>
                                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                    <span className="font-black text-lg">₹{parseFloat(inst.payableAmount).toLocaleString()}</span>
                                    <span className="text-[9px] px-2.5 py-1 bg-white/70 rounded-full font-black tracking-widest uppercase shadow-sm">
                                       {isFullyPaid ? 'FULLY PAID' : isPartial ? 'PARTIAL PAID' : inst.status}
                                    </span>
                                    {isFullyPaid && inst.transactionId && (
                                      <button 
                                        onClick={() => handleDownloadInvoice(inst.transactionId)}
                                        className="p-2 bg-white/80 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md group/btn" 
                                        title="Download Invoice"
                                      >
                                        <Download size={16} className="text-gray-400 group-hover/btn:text-gold transition-colors" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-gray-50 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(parseFloat(sub.totalPaid) / parseFloat(sub.scheme?.totalAmount)) * 100}%` }}
                  className="absolute top-0 left-0 h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                />
              </div>
            </motion.div>
          );
        }) 
        ) : (
          <div className="glass-card p-24 rounded-[3.5rem] text-center space-y-8 border border-dashed border-gray-300 bg-gray-50/30">
            <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-200 border border-gray-100 shadow-2xl shadow-gray-200/20">
              <History size={56} />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h3 className="text-3xl font-black tracking-tight text-gray-900">
                {activeTab === 'active' ? t('No Active Savings') : t('No History Found')}
              </h3>
              <p className="text-gray-500 font-bold text-sm leading-relaxed">
                {activeTab === 'active' 
                  ? t("You haven't joined any active chit schemes yet. Head over to Available Schemes to start your journey.") 
                  : t("You have no completed or closed savings plans in your history.")}
              </p>
            </div>
            {activeTab === 'active' && (
              <button 
                onClick={() => setActiveTab('available')}
                className="bg-gold-gradient text-white px-14 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:scale-105 transition-all"
              >
                {t('Browse Premium Schemes')}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {selectedInstallment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedInstallment(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] md:rounded-[4rem] p-7 md:p-14 shadow-2xl overflow-hidden border border-gray-100 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedInstallment(null)}
                className="absolute top-4 right-4 md:top-10 md:right-10 p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <X size={28} />
              </button>

              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto text-gold shadow-inner border border-gold/10">
                  <ShieldCheck size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">{t('Confirm Payment')}</h3>
                  <p className="text-gray-500 font-bold text-xs">{t('Securely process your monthly savings contribution.')}</p>
                </div>

                {(() => {
                  const parentSub = subscriptions.find(s => s.installments && s.installments.some(i => i.id === selectedInstallment.id));
                  return parentSub ? (
                    <div className="bg-gray-50 rounded-[2rem] p-8 space-y-4 border border-gray-100 shadow-inner text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">{t('Total Chit Value')}</span>
                          <span className="font-black text-gray-900 text-sm">₹{parseFloat(parentSub.scheme?.totalAmount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">{t('Total Paid')}</span>
                          <span className="font-black text-gold text-sm">₹{parseFloat(parentSub.totalPaid).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">{t('Remaining Balance')}</span>
                          <span className="font-black text-blue-600 text-sm">₹{parseFloat(parentSub.pendingAmount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">{t('Upcoming Installment')}</span>
                          <span className="font-black text-amber-600 text-sm">#{selectedInstallment.installmentNumber + 1}</span>
                        </div>
                      </div>
                      
                      <div className="h-px bg-gray-200/50 my-4" />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">{t('Current Installment Order')}</span>
                          <span className="font-black text-gray-900 text-lg">#{selectedInstallment.installmentNumber}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 font-black uppercase tracking-widest text-[10px] block mb-1">{t('Final Amount')}</span>
                          <span className="text-3xl font-black text-gold">₹{parseFloat(selectedInstallment.payableAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="space-y-4">
                  <button 
                    onClick={handlePayment}
                    disabled={isPaying}
                    className="w-full bg-gold-gradient text-white py-7 rounded-3xl font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-gold/30 hover:shadow-gold/50 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {isPaying ? <Loader2 className="animate-spin" /> : <>{t('Authorize Payment')} <ShieldCheck size={22} /></>}
                  </button>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                     <ShieldCheck size={14} className="text-gold" /> {t('SSL SECURE • INSTANT CONFIRMATION')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyChits;
