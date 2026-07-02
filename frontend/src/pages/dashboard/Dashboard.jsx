import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Gem,
  Plus,
  Building,
  ShieldCheck,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoans }          from '../../store/slices/loanSlice';
import { fetchCustomers }      from '../../store/slices/customerSlice';
import { fetchLiveRates }      from '../../store/slices/liveRateSlice';
import { fetchLatestGoldRate } from '../../store/slices/goldRateSlice';
import { useTranslation }      from 'react-i18next';
import { useNavigate }         from 'react-router-dom';
import goldLoanApi from '../../api/goldLoan.api';
import { toast } from 'react-toastify';
import GoldRateWidget          from '../../components/dashboard/GoldRateWidget';

const data = [
  { name: 'Jan', revenue: 4000, loans: 2400 },
  { name: 'Feb', revenue: 3000, loans: 1398 },
  { name: 'Mar', revenue: 2000, loans: 9800 },
  { name: 'Apr', revenue: 2780, loans: 3908 },
  { name: 'May', revenue: 1890, loans: 4800 },
  { name: 'Jun', revenue: 2390, loans: 3800 },
];

const StatCard = React.memo(({ title, value, trend, icon: Icon, color, trendUp }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500"
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />
    
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
  </motion.div>
));


const Dashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loans = [], loading: loansLoading, error: loansError } = useSelector(state => state.loans);
  const { customers = [] } = useSelector(state => state.customers);
  const { rates: liveRates } = useSelector(state => state.liveRate);

  const loadData = () => {
    console.log('[AdminDashboard] Refreshing dashboard data...');
    dispatch(fetchLoans());
    dispatch(fetchCustomers());
    dispatch(fetchLiveRates());
    dispatch(fetchLatestGoldRate()); // Keep goldRate slice in sync for loan calculations
  };

  const pollLiveRates = () => {
    if (!document.hidden && localStorage.getItem('token')) {
      dispatch(fetchLiveRates());
      dispatch(fetchLatestGoldRate());
    }
  };

  useEffect(() => {
    document.title = "Dashboard | SDRS Gold Finance";
    console.log("[AdminDashboard] Mounting dashboard...");
    loadData();

    // Polling only live rates every 60 seconds when visible
    const interval = setInterval(pollLiveRates, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRetry = () => {
    loadData();
  };

  const handleCloseLoan = async (id) => {
    const remarks = window.prompt(t('Enter closure remarks:'));
    if (remarks !== null) {
      try {
        await goldLoanApi.closeLoan(id, { remarks });
        toast.success(t('Loan closed successfully'));
        loadData();
      } catch (err) {
        toast.error(t('Failed to close loan'));
      }
    }
  };

  const handleReleaseOrnament = async (id) => {
    const releaseNotes = window.prompt(t('Enter release notes:'));
    if (releaseNotes !== null) {
      try {
        await goldLoanApi.releaseOrnament(id, { releaseNotes });
        toast.success(t('Ornament released successfully'));
        loadData();
      } catch (err) {
        toast.error(t('Failed to release ornament'));
      }
    }
  };

  useEffect(() => {
    if (loans && loans.length > 0) {
      console.log("[AdminDashboard] Loans Loaded:", loans);
    }
  }, [loans]);

  const pendingRequests = useMemo(() => (loans || []).filter(l => l && l.status === 'PENDING_APPROVAL'), [loans]);
  const activeLoans = useMemo(() => (loans || []).filter(l => l && (l.status === 'ACTIVE' || l.status === 'APPROVED')), [loans]);
  const readyForClosure = useMemo(() => (loans || []).filter(l => l && l.status === 'READY_FOR_CLOSURE'), [loans]);
  const closedLoans = useMemo(() => (loans || []).filter(l => l && (l.status === 'CLOSED' || l.status === 'LOAN_CLOSED')), [loans]);
  const releasedLoans = useMemo(() => (loans || []).filter(l => l && l.status === 'ORNAMENT_RELEASED'), [loans]);

  const pendingKyc = useMemo(() => (customers || []).filter(c => c && (c.kycStatus === 'PENDING' || !c.isKycVerified)), [customers]);
  const totalDisbursed = useMemo(() => activeLoans.reduce((acc, loan) => acc + parseFloat(loan?.loanAmount || 0), 0), [activeLoans]);
  
  const totalInterestCollected = useMemo(() => (loans || []).reduce((acc, loan) => acc + parseFloat(loan?.totalInterestPaid || 0), 0), [loans]);
  const totalLoansRecovered = useMemo(() => (loans || []).reduce((acc, loan) => acc + parseFloat(loan?.totalPrincipalPaid || 0) + parseFloat(loan?.totalInterestPaid || 0) + parseFloat(loan?.totalPenalty || 0), 0), [loans]);

  const [activeTab, setActiveTab] = useState('ACTIVE');

  const getFilteredLoans = () => {
    switch(activeTab) {
      case 'READY_FOR_CLOSURE': return readyForClosure;
      case 'CLOSED': return closedLoans;
      case 'RELEASED': return releasedLoans;
      case 'ACTIVE':
      default: return activeLoans;
    }
  };


  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1.5 w-fit"><Clock size={12}/> {t('Pending')}</span>;
      case 'ACTIVE':
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12}/> {t('Approved')}</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-1.5 w-fit"><XCircle size={12}/> {t('Rejected')}</span>;
      case 'READY_FOR_CLOSURE':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12}/> {t('Ready for Closure')}</span>;
      case 'CLOSED':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 flex items-center gap-1.5 w-fit"><ShieldCheck size={12}/> {t('Loan Closed')}</span>;
      case 'ORNAMENT_RELEASED':
        return <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-100 flex items-center gap-1.5 w-fit"><Gem size={12}/> {t('Ornament Released')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 w-fit">{t(status)}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{t('Dashboard')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">{t('Dashboard Description')}</p>
        </div>
        <button 
          onClick={() => navigate('/admin/loans')}
          className="btn-gold flex items-center justify-center gap-2 group w-full md:w-auto"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          {t('New Gold Loan')}
        </button>
      </div>

      {/* Gold Market Overview — Live Rate Widget */}
      <GoldRateWidget />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <StatCard 
          title={t('Active Loans')} 
          value={activeLoans.length.toString()} 
          trend={t('Active')} 
          trendUp={true}
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t('Ready For Closure')} 
          value={readyForClosure.length.toString()} 
          trend={readyForClosure.length > 0 ? t("Action") : t("Clear")} 
          trendUp={readyForClosure.length === 0}
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title={t('Closed Loans')} 
          value={closedLoans.length.toString()} 
          trend={t('Closed')} 
          trendUp={true}
          icon={ShieldCheck} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title={t('Released')} 
          value={releasedLoans.length.toString()} 
          trend={t('Returned')} 
          trendUp={true}
          icon={Gem} 
          color="bg-purple-500" 
        />
        <StatCard 
          title={t('Interest Collected')} 
          value={`₹${totalInterestCollected.toLocaleString()}`} 
          trend={t('Revenue')} 
          trendUp={true}
          icon={TrendingUp} 
          color="bg-green-500" 
        />
        <StatCard 
          title={t('Total Recovered')} 
          value={`₹${totalLoansRecovered.toLocaleString()}`} 
          trend={t('Collected')} 
          trendUp={true}
          icon={Coins} 
          color="bg-gold" 
        />
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Loan Requests Table */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-4 md:p-8 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-white to-gray-50/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-xl text-gold">
                  <FileText size={20} />
                </div>
                {t('loanLifecycle.title')}
              </h3>
              <button 
                onClick={() => navigate('/admin/gold-loan/approvals')}
                className="text-gold font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('View Approvals')} <ArrowRight size={16} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ACTIVE', 'READY_FOR_CLOSURE', 'CLOSED', 'RELEASED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab 
                    ? 'bg-gold text-black shadow-md shadow-gold/20' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-border dark:text-gray-400'
                  }`}
                >
                  {tab === 'ACTIVE' && t('loanLifecycle.activeLoans')}
                  {tab === 'READY_FOR_CLOSURE' && t('loanLifecycle.readyForClosure')}
                  {tab === 'CLOSED' && t('loanLifecycle.closedLoans')}
                  {tab === 'RELEASED' && t('loanLifecycle.ornamentReleased')}
                  <span className="ml-2 px-2 py-0.5 rounded-lg bg-black/10 text-[10px]">
                    {tab === 'ACTIVE' && activeLoans.length}
                    {tab === 'READY_FOR_CLOSURE' && readyForClosure.length}
                    {tab === 'CLOSED' && closedLoans.length}
                    {tab === 'RELEASED' && releasedLoans.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-dark-card/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loanLifecycle.customer')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loanLifecycle.ornamentDetails')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loanLifecycle.amount')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loanLifecycle.status')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loanLifecycle.date')}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {loansLoading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-gold" size={32} />
                        <p className="text-gray-500 font-medium">{t('Loading requests...')}</p>
                      </div>
                    </td>
                  </tr>
                ) : getFilteredLoans().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <FileText size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">{t('No loans found in this category')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getFilteredLoans().slice(0, 10).map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/gold-loan/approvals`)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold">
                            {loan.customer?.firstName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{loan.customer?.firstName} {loan.customer?.lastName}</p>
                            <p className="text-xs text-gray-500">{loan.loanNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-gray-900">{t(`${loan.goldPurity} Gold`, { defaultValue: `${loan.goldPurity} Gold` })}</p>
                        <p className="text-[10px] font-medium text-gray-500">{loan.goldWeight} {t('Grams')}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-900">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          {loan.status === 'READY_FOR_CLOSURE' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCloseLoan(loan.id); }}
                              className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-800"
                            >
                              {t('Close Loan')}
                            </button>
                          )}
                          {(loan.status === 'CLOSED' || loan.status === 'LOAN_CLOSED') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReleaseOrnament(loan.id); }}
                              className="px-3 py-1 bg-gold text-black text-[10px] font-bold rounded-lg hover:bg-gold/80"
                            >
                              {t('Release Ornament')}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/gold-loan/${loan.id}/ledger`); }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-lg hover:bg-blue-100"
                          >
                            {t('Ledger')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


          <div className="glass-card p-8 rounded-[2.5rem] bg-gold/5 border-gold/20">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gold rounded-2xl text-black">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black text-sm">{t('SDRS SECURE')}</h4>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('Pledge & Repledge')}</p>
                </div>
             </div>
             <p className="text-xs text-gray-600 leading-relaxed mb-6">
               {t('Your gold assets are insured and stored in enterprise-grade vaults with 24/7 surveillance.')}
             </p>
             <div className="flex items-center justify-between text-[10px] font-black text-gold-dark uppercase tracking-widest">
                <span>{t('GST Verified')}</span>
                <span>{t('ISO Certified')}</span>
             </div>
          </div>
        </div>
      
      {/* Business Info Section */}
      <div className="glass-card p-5 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-gold/5 dark:from-dark-card dark:to-gold/5 border-gold/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center text-black shadow-gold group">
              <Building size={32} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">SDRS GOLD FINANCE</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><UserCheck size={14} className="text-gold" /> {t('Proprietor')}: D. Sekar</span>
                <span className="flex items-center gap-1"><FileText size={14} className="text-gold" /> {t('GSTIN')}: 33BIXPS6851D1ZQ</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white dark:bg-dark-bg p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border">
              <div className="p-2 bg-gold/10 rounded-xl text-gold font-bold">
                +91 98432 57757
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

