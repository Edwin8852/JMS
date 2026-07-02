import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriberDetails, collectPayment } from '../../store/slices/chitFundSlice';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Receipt,
  Download,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const SubscriberLedger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentSubscriber, loading } = useSelector((state) => state.chitFund);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchSubscriberDetails(id));
    }
  }, [dispatch, id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedInstallment?.id) return;
    
    try {
      await dispatch(collectPayment({ 
        installmentId: selectedInstallment.id, 
        paymentData 
      })).unwrap();
      toast.success('Payment recorded successfully!');
      setSelectedInstallment(null);
      dispatch(fetchSubscriberDetails(id));
    } catch (error) {
      toast.error(error || 'Payment failed');
    }
  };

  const handleDownloadInvoice = async (transactionId) => {
    try {
      const toastId = toast.loading('Generating invoice...');
      const response = await api.get(`/pdf/chit-invoice/${transactionId}`);
      if (response.data.success && response.data.data.pdfUrl) {
        toast.update(toastId, { render: 'Invoice downloaded successfully', type: 'success', isLoading: false, autoClose: 3000 });
        const pdfUrl = `${BACKEND_URL}${response.data.data.pdfUrl}`;
        window.open(pdfUrl, '_blank');
      } else {
        toast.update(toastId, { render: 'Failed to generate invoice', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  if (loading && !currentSubscriber) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  if (!currentSubscriber) {
    return (
      <div className="p-8 text-center bg-dark-surface border border-dark-border rounded-3xl m-8">
        <AlertTriangle className="mx-auto text-gold mb-4" size={48} />
        <h2 className="text-2xl font-black text-white mb-2">Subscriber Not Found</h2>
        <p className="text-gray-500 mb-6">The subscriber record you are looking for does not exist.</p>
        <button onClick={() => navigate('/admin/chit-fund')} className="px-6 py-2 bg-gold/10 text-gold rounded-xl font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/admin/chit-fund/scheme/${currentSubscriber?.schemeId}`)} 
            className="p-3 bg-dark-card rounded-xl text-gray-400 hover:text-gold transition-all flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Subscriber <span className="text-gold">Ledger</span></h1>
            <p className="text-gray-600 font-medium text-sm md:text-base">
              {currentSubscriber?.customer?.firstName || "N/A"} {currentSubscriber?.customer?.lastName || ""} • Ticket #{currentSubscriber?.ticketNumber || "0"}
            </p>
          </div>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-dark-card border border-dark-border text-gray-400 hover:text-gold rounded-xl font-bold text-xs tracking-widest uppercase transition-all">
          <Download size={18} /> Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscriber Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center text-black text-2xl font-black">
                {currentSubscriber?.customer?.firstName?.[0] || "?"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {currentSubscriber?.customer?.firstName || "N/A"} {currentSubscriber?.customer?.lastName || ""}
                </h3>
                <p className="text-gold text-xs font-black uppercase tracking-widest">{currentSubscriber?.status || "UNKNOWN"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-dark-card rounded-2xl border border-dark-border">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Amount Paid</p>
                <p className="text-2xl font-black text-white">₹{parseFloat(currentSubscriber?.totalPaid || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-dark-card rounded-2xl border border-dark-border">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Scheme Progress</p>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-lg font-bold text-white">
                    {currentSubscriber?.installments?.filter(i => i.status === 'PAID').length || 0} / {currentSubscriber?.scheme?.durationMonths || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-bold">Installments</p>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSubscriber?.installments?.filter(i => i.status === 'PAID').length || 0) / (currentSubscriber?.scheme?.durationMonths || 1)) * 100}%` }}
                    className="h-full bg-gold-gradient"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Installments Table */}
        <div className="lg:col-span-2">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-dark-border">
              <h3 className="text-xl font-black text-white">Installment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-card/30">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">No</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Due Date</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                  {!currentSubscriber?.installments || currentSubscriber.installments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-gray-500 font-medium">No installment records found</td>
                    </tr>
                  ) : (
                    currentSubscriber.installments.map((inst) => (
                      <tr key={inst?.id} className="hover:bg-gold/5 transition-colors">
                        <td className="px-8 py-5 text-center">
                          <span className="text-sm font-bold text-gray-400">#{inst?.installmentNumber || "0"}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm text-white font-medium">
                            <Calendar size={14} className="text-gray-500" />
                            {inst?.dueDate ? new Date(inst.dueDate).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-sm font-bold text-white">₹{parseFloat(inst?.payableAmount || 0).toLocaleString()}</p>
                          {parseFloat(inst?.penaltyAmount || 0) > 0 && (
                            <p className="text-[10px] text-red-500 font-bold">+ ₹{inst.penaltyAmount} Penalty</p>
                          )}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                            inst?.status === 'PAID' ? 'bg-gold/10 text-gold border border-gold/20' :
                            inst?.status === 'PARTIAL' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            inst?.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {inst?.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          {inst?.status !== 'PAID' ? (
                            <button 
                              onClick={() => {
                                setSelectedInstallment(inst);
                                setPaymentData({...paymentData, amount: inst?.payableAmount || ""});
                              }}
                              className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-black rounded-lg transition-all"
                            >
                              <CreditCard size={18} />
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <CheckCircle size={20} className="text-gold" />
                              {inst?.transactionId && (
                                <button 
                                  onClick={() => handleDownloadInvoice(inst.transactionId)}
                                  className="p-1.5 bg-dark-surface border border-dark-border hover:bg-gold/10 text-gray-400 hover:text-gold rounded-lg transition-all shadow-sm group"
                                  title="Download Invoice"
                                >
                                  <Download size={14} className="group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedInstallment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInstallment(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-dark-surface border border-dark-border rounded-[2.5rem] overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="p-6 md:p-8 bg-gold-gradient flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-black">Collect Payment</h3>
                  <p className="text-black/60 text-xs font-bold uppercase tracking-widest">Installment #{selectedInstallment?.installmentNumber}</p>
                </div>
                <button onClick={() => setSelectedInstallment(null)} className="p-2 hover:bg-black/10 rounded-full text-black transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Added Overview inside Modal */}
              <div className="px-5 md:px-8 pt-6 md:pt-8">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4 md:p-6 grid grid-cols-2 gap-4 shadow-inner">
                  <div>
                     <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Chit Value</span>
                     <span className="font-black text-white text-sm">₹{parseFloat(currentSubscriber?.scheme?.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                     <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Total Paid</span>
                     <span className="font-black text-gold text-sm">₹{parseFloat(currentSubscriber?.totalPaid || 0).toLocaleString()}</span>
                  </div>
                  <div>
                     <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Remaining Balance</span>
                     <span className="font-black text-blue-500 text-sm">₹{parseFloat(currentSubscriber?.pendingAmount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                     <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Upcoming Installment</span>
                     <span className="font-black text-amber-500 text-sm">#{selectedInstallment?.installmentNumber + 1}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="p-5 md:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payable Amount</label>
                    <div className="p-4 bg-dark-card border border-dark-border rounded-xl text-white font-bold">
                      ₹{parseFloat(selectedInstallment?.payableAmount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Penalty Due</label>
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-500 font-bold">
                      ₹{parseFloat(selectedInstallment?.penaltyAmount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Collecting Amount (₹)</label>
                  <input 
                    required
                    type="number"
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white text-xl font-black focus:border-gold outline-none"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Method</label>
                  <select 
                    className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-4 text-white outline-none focus:border-gold"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI / G-PAY</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-5 bg-gold-gradient text-black font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all">
                  RECORD PAYMENT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriberLedger;
