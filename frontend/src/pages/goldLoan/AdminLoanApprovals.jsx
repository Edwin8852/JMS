import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Download,
  AlertCircle,
  Gem,
  User,
  ShieldAlert,
  Loader2,
  FileText
} from 'lucide-react';
import { fetchPendingLoans, approveGoldLoan, preApproveGoldLoan, rejectGoldLoan, clearLoanState } from '../../store/slices/goldLoanSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import goldLoanApi from '../../api/goldLoan.api';
import CurrencyInput from '../../components/ui/CurrencyInput';

const AdminLoanApprovals = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { pendingLoans, loading, error, success } = useSelector((state) => state.goldLoan);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Valuation Form State
  const [valuationForm, setValuationForm] = useState({
    currentGoldRate: '',
    validatedGoldWeight: '',
    approvedAmount: '',
    interestRate: 12,
    loanDuration: 12,
    remarks: ''
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    dispatch(fetchPendingLoans());
    const interval = setInterval(() => {
      dispatch(fetchPendingLoans());
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (selectedApp) {
      setValuationForm({
        currentGoldRate: '',
        validatedGoldWeight: selectedApp.goldWeight,
        approvedAmount: selectedApp.loanAmount,
        interestRate: 12,
        loanDuration: 12,
        remarks: ''
      });
    }
  }, [selectedApp]);

  useEffect(() => {
    if (success) {
      toast.success(t('Action completed successfully!'));
      setSelectedApp(null);
      dispatch(clearLoanState());
      dispatch(fetchPendingLoans());
    }
    if (error) {
      toast.error(t(error));
      dispatch(clearLoanState());
    }
  }, [success, error, dispatch]);

  const handleApprove = () => {
    if (!selectedApp) return;
    
    const submissionData = {
      id: selectedApp.id,
      valuationData: {
        ...valuationForm,
        goldValue: goldValue // Pass calculated gold value
      }
    };
    
    console.log('[AdminLoanApprovals] Submitting Approval Metadata:', submissionData);
    dispatch(approveGoldLoan(submissionData));
  };

  const handlePreApprove = (id) => {
    if (window.confirm(t('Are you sure you want to pre-approve this request and notify the customer?'))) {
      dispatch(preApproveGoldLoan(id));
    }
  };

  const handleReject = (id) => {
    const remarks = window.prompt(t('Enter reason for rejection:'));
    if (remarks !== null) {
      dispatch(rejectGoldLoan({ id, remarksData: { remarks } }));
    }
  };


  const handleDownloadInvoice = async (loanId) => {
    try {
      // First get the invoices for this loan
      const response = await goldLoanApi.fetchLoanInvoices(loanId);
      const invoices = response.data.data;
      if (invoices && invoices.length > 0) {
        const invId = invoices[0].id;
        const pdfResponse = await goldLoanApi.downloadInvoicePDF(invId);
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoices[0].invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        toast.info(t('No invoice found for this loan yet.'));
      }
    } catch (err) {
      toast.error(t('Failed to download invoice'));
    }
  };

  // Real-time Calculations
  const goldValue = parseFloat(valuationForm.validatedGoldWeight || 0) * parseFloat(valuationForm.currentGoldRate || 0);
  const monthlyInterest = (parseFloat(valuationForm.approvedAmount || 0) * (parseFloat(valuationForm.interestRate || 0) / 100)) / 12;
  const totalRepayment = parseFloat(valuationForm.approvedAmount || 0) + (monthlyInterest * parseFloat(valuationForm.loanDuration || 0));

  const filteredApps = pendingLoans.filter(app => 
    app.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t('Loan Approval Queue')}</h1>
          <p className="text-gray-500 mt-1">{t('Physically validate gold and approve loan requests.')}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t('Search ID or Customer...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:border-gold outline-none shadow-sm transition-all w-64"
              />
           </div>
           <div className="text-right">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                {t('Live Sync:')} {lastUpdated.toLocaleTimeString()}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading && pendingLoans.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>
        ) : filteredApps.length > 0 ? filteredApps.map((app) => (
          <motion.div 
            layout
            key={app.id} 
            className="glass-card p-6 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-8 border border-transparent hover:border-gold/20 hover:shadow-2xl transition-all"
          >
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="w-20 h-20 bg-gold/5 rounded-3xl flex items-center justify-center text-gold">
                 <Gem size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-xl">{app.loanNumber}</h4>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                    {app.status === 'APPROVED' ? t('Pre-Approved (Waiting for Gold)') : t('Pending Online Review')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><User size={14} className="text-gold" /> {app.customer?.firstName} {app.customer?.lastName}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('Applied')} {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full lg:w-auto px-8 py-4 bg-gray-50 rounded-[2rem]">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('Purity & Type')}</p>
                <p className="font-bold">{app.goldPurity} • {t(app.ornamentType || 'Ornaments')}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('Applied Weight')}</p>
                <p className="font-bold">{app.goldWeight}g</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t('Requested Amount')}</p>
                <p className="font-black text-gold-dark text-lg">₹{Number(app.loanAmount || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {app.status === 'PENDING_APPROVAL' && (
                <button 
                  onClick={() => handlePreApprove(app.id)}
                  className="w-full lg:w-auto px-6 py-3.5 bg-black text-white hover:bg-gray-900 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} className="text-green-400" /> {t('Pre-Approve')}
                </button>
              )}
              
              <button 
                onClick={() => setSelectedApp(app)}
                className="w-full lg:w-auto px-6 py-3.5 bg-gold text-black rounded-2xl font-black text-sm shadow-lg shadow-gold/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Gem size={18} /> {t('Process Valuation')}
              </button>

              <button 
                onClick={() => handleReject(app.id)}
                className="w-full lg:w-auto px-6 py-3.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> {t('Reject')}
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="glass-card p-20 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold">{t('No Pending Applications')}</h4>
              <p className="text-gray-500">{t('The loan approval queue is currently empty.')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Valuation & Approval Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] p-12 overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-black">{t('Physical Valuation Engine')}</h3>
                  <p className="text-gray-500 font-medium">{t('Processing')} <b>{selectedApp.loanNumber}</b> {t('for')} {selectedApp.customer?.firstName} {selectedApp.customer?.lastName}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Market Gold Rate (per gram)')}</label>
                        <CurrencyInput 
                          placeholder="₹ 0.00"
                          value={valuationForm.currentGoldRate}
                          onChange={(e) => setValuationForm(prev => ({ ...prev, currentGoldRate: e.target.value }))}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-4 font-black text-lg outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Validated Net Weight (g)')}</label>
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={valuationForm.validatedGoldWeight}
                          onChange={(e) => setValuationForm(prev => ({ ...prev, validatedGoldWeight: e.target.value }))}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-gold rounded-2xl p-4 font-black text-lg outline-none transition-all"
                        />
                      </div>
                   </div>
 
                   <div className="p-8 bg-gold/5 rounded-[2rem] border border-gold/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{t('Purity Check')}</span>
                        <span className="font-black text-xl text-gold-dark">{selectedApp.goldPurity} {t('Gold')}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{t('Calculated Gold Value')}</span>
                        <span className="text-4xl font-black text-gray-900">₹{goldValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Final Approved Loan Amount (₹)')}</label>
                        <CurrencyInput 
                          placeholder="₹ 0.00"
                          value={valuationForm.approvedAmount}
                          onChange={(e) => setValuationForm(prev => ({ ...prev, approvedAmount: e.target.value }))}
                          className="w-full bg-black text-gold border-none rounded-2xl p-6 font-black text-3xl outline-none"
                        />
                        <p className="text-[10px] text-gray-400 font-bold px-2 flex justify-between uppercase">
                           <span>{t('Requested:')} ₹{Number(selectedApp.loanAmount || 0).toLocaleString()}</span>
                           <span>LTV: {goldValue > 0 ? ((parseFloat(valuationForm.approvedAmount || 0) / goldValue) * 100).toFixed(1) : 0}%</span>
                        </p>
                      </div>
 
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Interest Rate (% p.a.)')}</label>
                          <input 
                            type="number"
                            value={valuationForm.interestRate}
                            onChange={(e) => setValuationForm(prev => ({ ...prev, interestRate: e.target.value }))}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Duration (Months)')}</label>
                          <input 
                            type="number"
                            value={valuationForm.loanDuration}
                            onChange={(e) => setValuationForm(prev => ({ ...prev, loanDuration: e.target.value }))}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none"
                          />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="glass-card p-8 rounded-[2.5rem] bg-gray-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
                      <h4 className="text-gold font-black uppercase tracking-widest text-[10px]">{t('Financial Projections')}</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                           <span className="text-gray-400 font-medium">{t('Monthly Interest EMI')}</span>
                           <span className="text-2xl font-black">₹{monthlyInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                           <span className="text-gray-400 font-medium">{t('Total Payable Amount')}</span>
                           <span className="text-2xl font-black text-gold">₹{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-gray-400 font-medium">{t('Due Date')}</span>
                           <span className="font-bold">{new Date(new Date().setMonth(new Date().getMonth() + parseInt(valuationForm.loanDuration || 12))).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="absolute -right-20 -top-20 w-60 h-60 bg-gold/10 rounded-full blur-[100px]" />
                   </div>

                   <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('Verification Remarks')}</label>
                      <textarea 
                        value={valuationForm.remarks}
                        onChange={(e) => setValuationForm(prev => ({ ...prev, remarks: e.target.value }))}
                        placeholder={t('Detail the physical condition, purity check results, and cash disbursement notes...')}
                        rows="4"
                        className="w-full bg-gray-50 border-none rounded-[2rem] p-6 outline-none focus:ring-2 ring-gold/10 font-medium resize-none"
                      />
                   </div>

                   <div className="flex gap-4">
                      <button 
                        onClick={() => setSelectedApp(null)}
                        className="flex-1 py-5 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100 hover:bg-red-100 transition-all"
                      >
                        {t('Cancel')}
                      </button>
                      <button 
                        disabled={loading || !valuationForm.currentGoldRate || !valuationForm.approvedAmount}
                        onClick={handleApprove}
                        className="flex-[2] py-5 bg-gold text-black rounded-2xl font-black shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> {t('Approve & Generate Invoice')}</>}
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLoanApprovals;
