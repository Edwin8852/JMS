import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchMyGoldLoans } from '../../store/slices/goldLoanSlice';
import { fetchLoanPayments } from '../../store/slices/paymentSlice';
import { 
  Gem, 
  Calendar, 
  ArrowLeft,
  Loader2,
  Download,
  Eye,
  CheckCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import goldLoanApi from '../../api/goldLoan.api';
import { toast } from 'react-toastify';
import LoanDetailsView from './components/LoanDetailsView';

const CustomerLoanHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans, loading } = useSelector((state) => state.goldLoan);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'CLOSED', 'RELEASED'
  
  const [loanDetails, setLoanDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGoldLoans());
  }, [dispatch]);

  // Sync selected loan when loans update
  useEffect(() => {
    if (selectedLoan && loans.length > 0) {
      const updated = loans.find(l => l.id === selectedLoan.id);
      if (updated) setSelectedLoan(updated);
    }
  }, [loans]);

  const handleViewDetails = async (loan) => {
    setSelectedLoan(loan);
    setDetailsLoading(true);
    try {
      const response = await goldLoanApi.fetchLoanById(loan.id);
      setLoanDetails(response.data.data);
    } catch (error) {
      toast.error('Failed to load full loan details');
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING_APPROVAL': 'bg-blue-50 text-blue-600 border-blue-200',
      'APPROVED': 'bg-green-50 text-green-600 border-green-200',
      'ACTIVE': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'OVERDUE': 'bg-red-50 text-red-600 border-red-200',
      'CLOSED': 'bg-gray-100 text-gray-600 border-gray-200',
      'LOAN_CLOSED': 'bg-gray-100 text-gray-600 border-gray-200',
      'ORNAMENT_RELEASED': 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
        {t(status)}
      </span>
    );
  };

  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'ACTIVE') {
      return !['CLOSED', 'LOAN_CLOSED', 'ORNAMENT_RELEASED'].includes(loan.status);
    } else if (activeTab === 'CLOSED') {
      return loan.status === 'CLOSED' || loan.status === 'LOAN_CLOSED';
    } else if (activeTab === 'RELEASED') {
      return loan.status === 'ORNAMENT_RELEASED';
    }
    return true;
  });

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white hover:bg-gray-50 rounded-full transition-all shadow-sm border border-gray-100">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold">{t('My Loans')}</h1>
            <p className="text-gray-500">{t('Track and manage your gold loans with SDRS.')}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/customer/services/loan')}
          className="btn-gold px-8 py-4 rounded-2xl font-black shadow-lg shadow-gold/20 flex items-center gap-2"
        >
          {t('New Loan Request')}
        </button>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 bg-gray-100 p-2 rounded-[2rem] w-fit">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${
            activeTab === 'ACTIVE' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {t('loanLifecycle.activeLoans')}
        </button>
        <button
          onClick={() => setActiveTab('CLOSED')}
          className={`px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${
            activeTab === 'CLOSED' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {t('loanLifecycle.closedLoans')}
        </button>
        <button
          onClick={() => setActiveTab('RELEASED')}
          className={`px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${
            activeTab === 'RELEASED' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {t('loanLifecycle.ornamentReleased')}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>
        ) : filteredLoans.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">
            {activeTab === 'ACTIVE' && t('No active loans found.')}
            {activeTab === 'CLOSED' && t('No closed loans found.')}
            {activeTab === 'RELEASED' && t('No released loans found.')}
          </div>
        ) : (
          <div className="overflow-x-auto p-4 custom-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 rounded-2xl">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-l-2xl">{t('Loan Number')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Loan Amount')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Total Paid')}</th>
                  {activeTab !== 'ACTIVE' && (
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Closure Date')}</th>
                  )}
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-r-2xl text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold/10 rounded-xl text-gold"><Gem size={18} /></div>
                        <span className="font-bold text-gray-900">{loan.loanNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">₹{Number(loan.loanAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{Number(loan.totalPaid || 0).toLocaleString()}</td>
                    {activeTab !== 'ACTIVE' && (
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {loan.loanClosedDate ? new Date(loan.loanClosedDate).toLocaleDateString() : 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {getStatusBadge(loan.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetails(loan)}
                        className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 ml-auto"
                      >
                        <Eye size={14} /> {t('View Details')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loan Details Modal (Rendered securely via LoanDetailsView passing isCustomerView=true) */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLoan(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-6xl bg-white rounded-[3rem] p-8 md:p-12 overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/90 backdrop-blur-md pb-4 z-10 border-b border-gray-100">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-black">{selectedLoan.loanNumber}</h3>
                  <p className="text-gray-500 font-medium">{t('Detailed breakdown of your financial journey with SDRS Gold.')}</p>
                </div>
                <button 
                  onClick={() => setSelectedLoan(null)} 
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  {t('Close Viewer')}
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-40">
                  <Loader2 className="animate-spin text-gold" size={60} />
                </div>
              ) : loanDetails ? (
                <LoanDetailsView loanDetails={loanDetails} isCustomerView={true} />
              ) : (
                <div className="text-center py-20 text-red-500 font-bold">{t('Failed to load details.')}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLoanHistory;
