import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchMyDashboard } from '../../store/slices/customerSlice';
import { createPayment } from '../../store/slices/paymentSlice';
import { Gem, Calendar, Clock, ChevronRight, ShieldCheck, Coins, X, CreditCard, Loader2, QrCode } from 'lucide-react';
import api from '../../api/axios';
const MyLoans = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myDashboard, loading } = useSelector((state) => state.customers);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPaying, setIsPaying] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE');

  useEffect(() => {
    dispatch(fetchMyDashboard());
  }, [dispatch]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) return toast.error('Enter valid amount');
    
    console.log('[MyLoans] Processing payment for loan:', selectedLoan.id, 'Amount:', payAmount);
    setIsPaying(true);
    try {
        await dispatch(createPayment({
            loanId: selectedLoan.id,
            paymentAmount: parseFloat(payAmount),
            paymentMethod: paymentMethod,
            paymentType: 'EMI'
        })).unwrap();
        
        toast.success('Payment processed successfully!');
        setSelectedLoan(null);
        setPayAmount('');
        setPaymentMethod('UPI');
        dispatch(fetchMyDashboard());
    } catch (error) {
        console.error('[MyLoans] Payment Error:', error);
        toast.error(error || 'Payment failed');
    } finally {
        setIsPaying(false);
    }
  };

  const handleDownloadInvoice = async (invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/download-by-number/${invoiceNumber}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  const calculateBreakdown = (loan, inputAmountStr) => {
    if (!loan) return null;
    const remainingPrincipal = parseFloat(loan.remainingPrincipal || loan.loanAmount || 0);
    const monthlyInterest = parseFloat(loan.monthlyInterest || 0);
    const interestAmount = parseFloat(loan.interestAmount || monthlyInterest);
    
    const isOverdue = new Date() > new Date(loan.dueDate) || loan.status === 'OVERDUE';
    let penalty = 0;
    if (isOverdue) {
      penalty = parseFloat((remainingPrincipal * 0.012).toFixed(2));
    }
    
    const totalPayable = remainingPrincipal + interestAmount + penalty;
    const inputAmount = parseFloat(inputAmountStr) || 0;
    
    let remainingPayment = inputAmount;
    let penaltyPaid = Math.min(remainingPayment, penalty);
    remainingPayment -= penaltyPaid;
    
    let interestPaid = Math.min(remainingPayment, interestAmount);
    remainingPayment -= interestPaid;
    
    let principalPaid = Math.min(remainingPayment, remainingPrincipal);
    remainingPayment -= principalPaid;
    
    if (remainingPayment > 0) {
      principalPaid += remainingPayment;
    }
    
    const remainingBalanceAfter = Math.max(0, remainingPrincipal - principalPaid);
    
    return {
      remainingPrincipal,
      interestAmount,
      penalty,
      totalPayable,
      penaltyPaid,
      interestPaid,
      principalPaid,
      remainingBalanceAfter,
      isOverdue
    };
  };

  const loans = myDashboard?.loans || [];
  
  const getDisplayedLoans = () => {
    switch(activeTab) {
      case 'CLOSED':
        return loans.filter(l => l.status === 'CLOSED' || l.status === 'LOAN_CLOSED');
      case 'RELEASED':
        return loans.filter(l => l.status === 'ORNAMENT_RELEASED');
      case 'ACTIVE':
      default:
        return loans.filter(l => ['ACTIVE', 'APPROVED', 'PENDING_APPROVAL', 'READY_FOR_CLOSURE'].includes(l.status));
    }
  };

  const displayedLoans = getDisplayedLoans();
  const activeBreakdown = selectedLoan ? calculateBreakdown(selectedLoan, payAmount) : null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'FULLY_PAID':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'PARTIAL_PAID':
        return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'INTEREST_ONLY_PAID':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'PENALTY_PAID':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse';
      default:
        return 'bg-green-100 text-green-700 border border-green-300';
    }
  };

  if (loading && !myDashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">{t('My Gold Loans')}</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">{t('View and manage your active and past gold loans.')}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-dark-border mb-8 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'ACTIVE' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('loanLifecycle.activeLoans')}
        </button>
        <button 
          onClick={() => setActiveTab('CLOSED')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'CLOSED' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Closed History')}
        </button>
        <button 
          onClick={() => setActiveTab('RELEASED')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'RELEASED' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('loanLifecycle.ornamentReleased')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {displayedLoans.length > 0 ? displayedLoans.map((loan, index) => (
          <motion.div 
            key={loan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8 relative z-10">
              <div className="flex gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gold/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-gold">
                  <Gem size={28} className="md:hidden" />
                  <Gem size={40} className="hidden md:block" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold">{t(loan.ornamentType) || t('Gold Loan')}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(loan.currentStatus || loan.status)}`}>
                      {t(loan.currentStatus || loan.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium">{t('Loan ID:')} <span className="text-gray-900">{loan.loanNumber}</span></p>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-gold" />
                      {t('Started:')} {new Date(loan.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShieldCheck size={16} className="text-gold" />
                      {t('Weight:')} {loan.goldWeight}{t('gram')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-start md:items-end">
                <div className="text-left md:text-right">
                  <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">{t('Remaining Balance')}</p>
                  <h4 className="text-2xl md:text-3xl font-black text-gold">₹ {(loan.remainingPrincipal ?? loan.loanAmount)?.toLocaleString()}</h4>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                    {['ACTIVE'].includes(loan.status) && (
                      <button 
                          onClick={() => setSelectedLoan(loan)}
                          className="flex items-center gap-2 bg-gold-gradient text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all"
                      >
                          <CreditCard size={18} /> {t('Pay Now')}
                      </button>
                    )}
                    <Link 
                      to={`/customer/gold-loan/${loan.id}/ledger`}
                      className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all"
                    >
                      {t('View Details')} <ChevronRight size={18} />
                    </Link>
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
          </motion.div>
        )) : (
          <div className="glass-card p-20 rounded-[2.5rem] text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Coins size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('No loans found')}</h3>
            <p className="text-gray-500 mt-2">{t("You don't have any loans in this category.")}</p>
            <Link to="/customer/services/loan" className="mt-8 btn-gold px-8 py-4 rounded-2xl inline-block">
              {t('Apply for a Loan')}
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedLoan(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">{t('Make Payment')}</h3>
                    <button onClick={() => setSelectedLoan(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                {activeBreakdown && activeBreakdown.isOverdue && (
                  <div className="p-4 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex flex-col gap-1 font-medium animate-pulse">
                    <span className="font-bold text-sm">⚠️ {t('OVERDUE WARNING')}</span>
                    {t('This loan is overdue. A 1.2% penalty has been automatically applied to the total payable balance. Please pay immediately to prevent risk score penalty.')}
                  </div>
                )}

                <div className="p-6 bg-gold/5 rounded-3xl mb-8 space-y-3 border border-gold/10">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{t('Principal Outstanding:')}</span>
                      <span className="font-bold text-gray-900">₹ {activeBreakdown?.remainingPrincipal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{t('Outstanding Interest:')}</span>
                      <span className="font-bold text-gray-900">₹ {activeBreakdown?.interestAmount?.toLocaleString()}</span>
                    </div>
                    {activeBreakdown?.penalty > 0 && (
                      <div className="flex justify-between items-center text-sm text-rose-600 font-bold">
                        <span>{t('Overdue Penalty (1.2%):')}</span>
                        <span>₹ {activeBreakdown?.penalty?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-gold/20 pt-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-gold uppercase tracking-wider">{t('Total Payable')}:</span>
                      <h4 className="text-2xl font-black text-gold">₹ {activeBreakdown?.totalPayable?.toLocaleString()}</h4>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">{t('Enter Amount (₹)')}</label>
                        <input 
                            type="number" 
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 text-xl font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    {parseFloat(payAmount) > 0 && activeBreakdown && (
                      <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
                        <p className="font-bold text-gray-700 mb-1">{t('Payment Allocation Preview:')}</p>
                        <div className="flex justify-between text-gray-600">
                          <span>{t('Penalty Paid:')}</span>
                          <span className="font-semibold text-rose-600">₹ {activeBreakdown.penaltyPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>{t('Interest Paid:')}</span>
                          <span className="font-semibold text-purple-600">₹ {activeBreakdown.interestPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>{t('Principal Reduction:')}</span>
                          <span className="font-semibold text-green-600">₹ {activeBreakdown.principalPaid?.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                          <span>{t('New Principal Balance:')}</span>
                          <span>₹ {activeBreakdown.remainingBalanceAfter?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold">{t('Payment Method')}</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-gold bg-gold/5 text-gold shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="hidden" />
                                <span className="font-bold">{t('UPI')}</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-gold bg-gold/5 text-gold shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="hidden" />
                                <span className="font-bold">{t('Card')}</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-gold bg-gold/5 text-gold shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="hidden" />
                                <span className="font-bold">{t('Cash')}</span>
                            </label>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {paymentMethod === 'UPI' && (
                            <motion.div
                                key="upi"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-200">
                                    <div className="p-4 bg-white rounded-xl shadow-sm">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=bgmkingedwin8486w@okhdfcbank&pn=Edwin&am=${payAmount || 0}`} 
                                            alt="UPI QR Code" 
                                            className="w-32 h-32 object-contain"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold flex items-center justify-center gap-2">
                                            <QrCode size={16} className="text-gold" />
                                            {t('Scan to Pay')}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{t('Use any UPI app (GPay, PhonePe, Paytm)')}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentMethod === 'CARD' && (
                            <motion.div
                                key="card"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">{t('Card Holder Name')}</label>
                                        <input type="text" placeholder="John Doe" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-gold focus:ring-1 focus:ring-gold" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">{t('Card Number')}</label>
                                        <input type="text" maxLength="19" placeholder="0000 0000 0000 0000" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-gold focus:ring-1 focus:ring-gold tracking-widest" required />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-600">{t('Expiry Date')}</label>
                                            <input type="text" maxLength="5" placeholder="MM/YY" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-gold focus:ring-1 focus:ring-gold" required />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-600">{t('CVV')}</label>
                                            <input type="password" maxLength="4" placeholder="***" className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-gold focus:ring-1 focus:ring-gold tracking-widest" required />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentMethod === 'CASH' && (
                            <motion.div
                                key="cash"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <ShieldCheck size={16} className="text-rose-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-800">{t('Admin Processing Required')}</h4>
                                        <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                                            {t('Cash payments cannot be processed online. Please visit our branch and hand over the cash to the Admin. Once verified, the Admin will update your payment records.')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button 
                        type={paymentMethod === 'CASH' ? 'button' : 'submit'} 
                        disabled={isPaying || paymentMethod === 'CASH'}
                        className={`w-full h-16 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
                            paymentMethod === 'CASH' 
                            ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-500' 
                            : 'bg-gold-gradient shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {isPaying ? <Loader2 className="animate-spin" /> : <>{paymentMethod === 'CASH' ? t('Admin Only') : t('Complete Payment')} <ShieldCheck size={20} /></>}
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyLoans;
