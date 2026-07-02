import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchMyGoldLoans } from '../../store/slices/goldLoanSlice';
import { 
  Gem, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Coins, 
  ArrowRight,
  Plus,
  AlertTriangle,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import goldLoanApi from '../../api/goldLoan.api';
import { toast } from 'react-toastify';

const GoldLoanDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans, loading } = useSelector(state => state.goldLoan);

  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [downloadingId, setDownloadingId] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchMyGoldLoans());
      setLastUpdated(new Date());
    };
    
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15s polling for customers
    return () => clearInterval(interval);
  }, [dispatch]);

  const stats = {
    totalActive: loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED').length,
    pending: loans.filter(l => l.status === 'PENDING_APPROVAL').length,
    totalBorrowed: loans.reduce((acc, l) => acc + (Number(l.approvedAmount || l.loanAmount) || 0), 0)
  };

  const handleDownloadInvoice = async (e, loanId) => {
    e.stopPropagation();
    setDownloadingId(loanId);
    try {
      const response = await goldLoanApi.fetchLoanInvoices(loanId);
      const invoices = response.data.data;
      if (invoices && invoices.length > 0) {
        const inv = invoices[0];
        const pdfResponse = await goldLoanApi.downloadInvoicePDF(inv.id);
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));
        window.open(url, '_blank');
      } else {
        toast.info('Invoice is being generated. Please check back in a moment.');
      }
    } catch (err) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t('Gold Finance Dashboard')}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">{t('Manage your active loans and tracking pending applications.')}</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
              <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse" />
              {t('Live Sync')}: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/customer/gold-loan/history')}
            className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <FileText size={20} /> {t('View History')}
          </button>
          <button 
            onClick={() => navigate('/customer/services/loan')}
            className="btn-gold flex items-center justify-center gap-2 group px-8 py-4 rounded-2xl shadow-xl shadow-gold/20"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-all duration-300" />
            {t('Apply for New Loan')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('Total Borrowed'), value: `₹${stats.totalBorrowed.toLocaleString()}`, icon: Coins, color: 'bg-gold' },
          { label: t('loanLifecycle.activeLoans'), value: stats.totalActive, icon: ShieldCheck, color: 'bg-green-500' },
          { label: t('Pending Requests'), value: stats.pending, icon: Clock, color: 'bg-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className={`w-14 h-14 ${stat.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon className={stat.color.replace('bg-', 'text-')} size={28} />
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-all duration-500" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          {t('Your Loan Applications')}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {loading && loans.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold" size={32} /></div>
          ) : loans.length > 0 ? loans.map((loan, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={loan.id} 
              onClick={() => navigate('/customer/gold-loan/history')}
              className="glass-card p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all border border-transparent hover:border-gold/20 group cursor-pointer"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-gold/10 rounded-3xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                  <Gem size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-lg">{loan.loanNumber}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      loan.status === 'ACTIVE' || loan.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                      loan.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-600' :
                      loan.status === 'OVERDUE' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t(loan.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {loan.goldWeight}{t('gram')} • {t(`${loan.goldPurity} Gold`, { defaultValue: `${loan.goldPurity} Gold` })} • {new Date(loan.loanDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:gap-12">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {loan.status === 'PENDING_APPROVAL' ? t('Requested Amount') : t('Approved Amount')}
                  </p>
                  <p className="text-xl font-black text-gray-900">₹{Number(loan.approvedAmount || loan.loanAmount || 0).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {(loan.status === 'ACTIVE' || loan.status === 'APPROVED') && (
                    <button 
                      onClick={(e) => handleDownloadInvoice(e, loan.id)}
                      className="p-3 bg-gray-100 rounded-2xl hover:bg-black hover:text-white transition-all flex items-center gap-2"
                    >
                      {downloadingId === loan.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                  )}
                  <button className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gold transition-colors group-hover:text-black">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card p-20 rounded-[3rem] text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Coins size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">{t('No loans found')}</h4>
                <p className="text-gray-500">{t("You haven't applied for any gold loans yet.")}</p>
              </div>
              <button 
                onClick={() => navigate('/customer/services/loan')}
                className="btn-gold px-8 py-4 rounded-2xl font-bold"
              >
                {t('Apply Now')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldLoanDashboard;
