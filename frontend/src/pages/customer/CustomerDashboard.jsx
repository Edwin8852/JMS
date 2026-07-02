import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyDashboard } from '../../store/slices/customerSlice';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { useTranslation } from 'react-i18next';
import { 
  Coins, 
  CreditCard, 
  History, 
  Bell, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Gem,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { myDashboard, loading: dashboardLoading } = useSelector((state) => state.customers);
  const { rates: liveRates, loading: rateLoading } = useSelector((state) => state.liveRate);

  useEffect(() => {
    dispatch(fetchMyDashboard());
    dispatch(fetchLiveRates());
  }, [dispatch]);

  const stats = useMemo(() => myDashboard?.overview || {
    totalLoans: 0,
    activeChits: 0,
    riskScore: 'A+'
  }, [myDashboard]);

  const loans = useMemo(() => myDashboard?.loans || [], [myDashboard]);
  const activeLoans = useMemo(() => loans.filter(l => ['ACTIVE', 'APPROVED', 'READY_FOR_CLOSURE'].includes(l.status)), [loans]);
  const closedLoans = useMemo(() => loans.filter(l => ['CLOSED', 'ORNAMENT_RELEASED'].includes(l.status)), [loans]);
  const chits = useMemo(() => myDashboard?.chits || [], [myDashboard]);
  const recentPayments = useMemo(() => myDashboard?.recentPayments || [], [myDashboard]);

  if (dashboardLoading && !myDashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">{t('Welcome back')}, {user?.firstName || t('Customer')}! 👋</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{t('Track your loans and upcoming payments.')}</p>
        </div>
        <div className="flex items-center gap-4">
            {/* Live Gold Rate Widget */}
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
                    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                        <Gem size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{t('24K Gold')}</p>
                        <p className="text-sm font-black">
                            {liveRates?.updatedAt ? `₹${Number(liveRates.gold24k).toLocaleString()}` : t('Loading...')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{t('22K Gold')}</p>
                        <p className="text-sm font-black">
                            {liveRates?.updatedAt ? `₹${Number(liveRates.gold22k).toLocaleString()}` : t('Loading...')}
                        </p>
                    </div>
                    <div className="ml-2 flex items-center text-green-500 font-black text-[10px]">
                        <ArrowUpRight size={14} /> 1.2%
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 bg-gold/10 text-gold rounded-xl border border-gold/20 flex items-center gap-2 font-bold text-sm">
                <ShieldCheck size={18} />
                {t('Risk Status')}: {stats.riskScore}
            </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-gold to-amber-600 p-6 rounded-[2.5rem] text-black shadow-gold/20 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">{t('Active Loans')}</p>
          <h3 className="text-3xl font-black mt-1">{activeLoans.length}</h3>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/customer/my-loans" className="flex items-center gap-1 text-xs font-bold group">
              {t('View All')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
          <div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 shadow-inner">
              <Wallet size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{t('Active Chits')}</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{stats.activeChits}</h3>
          </div>
          <div className="flex items-center justify-end mt-4">
             <Link to="/customer/my-chits" className="p-2 bg-blue-500/10 rounded-full text-blue-600 hover:bg-blue-500 hover:text-white transition-all">
                <ArrowRight size={14} />
             </Link>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <ShieldCheck size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{t('Closed Loans')}</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{closedLoans.length}</h3>
          </div>
          <div className="flex items-center justify-end mt-4">
             <Link to="/customer/my-loans" className="p-2 bg-emerald-500/10 rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                <ArrowRight size={14} />
             </Link>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
              <Gem size={20} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{t('Released Ornaments')}</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{loans.filter(l => l.status === 'ORNAMENT_RELEASED').length}</h3>
          </div>
          <div className="flex items-center justify-end mt-4">
             <Link to="/customer/my-loans" className="p-2 bg-purple-500/10 rounded-full text-purple-600 hover:bg-purple-500 hover:text-white transition-all">
                <ArrowRight size={14} />
             </Link>
          </div>
        </div>
      </div>

      {/* Select Service Section */}
      <div className="glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-6">{t('Quick Actions')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/customer/services/loan" className="p-6 bg-gold/5 border border-gold/10 rounded-3xl hover:bg-gold/10 transition-all group">
                  <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center text-gold mb-4">
                      <Gem size={24} />
                  </div>
                  <h4 className="font-bold text-lg">{t('Apply for Gold Loan')}</h4>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{t('Get instant cash against your gold ornaments.')}</p>
                  <div className="flex items-center gap-2 text-gold font-bold text-sm group-hover:gap-3 transition-all">
                      {t('Get Started')} <ArrowRight size={16} />
                  </div>
              </Link>
              
              <Link to="/customer/services/chit-schemes" className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl hover:bg-blue-500/10 transition-all group">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                      <Coins size={24} />
                  </div>
                  <h4 className="font-bold text-lg">{t('Join Chit Fund')}</h4>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{t('Save monthly and win big with our secure chits.')}</p>
                  <div className="flex items-center gap-2 text-blue-500 font-bold text-sm group-hover:gap-3 transition-all">
                      {t('Explore Schemes')} <ArrowRight size={16} />
                  </div>
              </Link>
              
              <Link to="/customer/services/order" className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl hover:bg-purple-500/10 transition-all group">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
                      <CreditCard size={24} />
                  </div>
                  <h4 className="font-bold text-lg">{t('Order Jewelry')}</h4>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{t('Customize and order your dream jewelry items.')}</p>
                  <div className="flex items-center gap-2 text-purple-500 font-bold text-sm group-hover:gap-3 transition-all">
                      {t('Browse Catalog')} <ArrowRight size={16} />
                  </div>
              </Link>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Active Loan Details */}
        <div className="lg:col-span-2 glass-card p-5 md:p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2">
                <Coins size={20} className="text-gold" />
                {t('Active Savings & Loans')}
            </span>
            <div className="flex gap-4">
               <Link to="/customer/loans" className="text-sm text-gold hover:underline">{t('Loans')}</Link>
               <Link to="/customer/my-chits" className="text-sm text-blue-500 hover:underline">{t('Chits')}</Link>
            </div>
          </h3>
          <div className="space-y-6">
            {/* Active Chits in Dashboard */}
            {chits.length > 0 && chits.map((chit) => (
               <div key={chit.id} className="flex items-center justify-between p-4 md:p-6 bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{t(chit.scheme?.schemeName)}</p>
                      <p className="text-xs text-gray-500 font-medium">{t('Ticket')} #{chit.ticketNumber} • {chit.scheme?.durationMonths} {t('Months Plan')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">₹ {parseFloat(chit.totalPaid).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('Total Paid')}</p>
                  </div>
               </div>
            ))}

            {activeLoans.length > 0 ? activeLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-dark-card rounded-3xl border border-transparent hover:border-gold/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                    <Gem size={28} />
                  </div>
                  <div>
                    <p className="font-bold">{t(loan.ornamentType) || t('Gold Loan')}</p>
                    <p className="text-xs text-gray-500">ID: {loan.loanNumber} • {loan.goldWeight}g {t('Gold')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹ {loan.loanAmount?.toLocaleString()}</p>
                  <p className={`text-xs font-bold ${['ACTIVE', 'READY_FOR_CLOSURE'].includes(loan.status) ? 'text-green-500' : 'text-gray-500'}`}>
                    {t(loan.status) || loan.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )) : chits.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Coins size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t('No active savings or loans found.')}</p>
                </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5 md:p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2">
                <History size={20} className="text-gold" />
                {t('Recent Payments')}
            </span>
            <Link to="/customer/payments" className="text-sm text-gold hover:underline">{t('History')}</Link>
          </h3>
          <div className="space-y-6">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t(payment.paymentType)}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-500">+₹{payment.paymentAmount?.toLocaleString()}</p>
              </div>
            )) : (
                <div className="text-center py-12 text-gray-500">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t('No recent payments.')}</p>
                </div>
            )}
          </div>
          <Link to="/customer/payments" className="block w-full mt-8 py-4 text-center text-sm font-bold text-gold hover:bg-gold/5 rounded-2xl transition-all border border-gold/10">
            {t('View All Transactions')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
