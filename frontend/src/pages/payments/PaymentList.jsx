import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  Download,
  ArrowDownRight,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../store/slices/paymentSlice';
import Table from '../../components/ui/Table';
import RecordPaymentModal from './RecordPaymentModal';
import { useTranslation } from 'react-i18next';

const PaymentList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Payments | SDRS Gold Finance";
    dispatch(fetchPayments());
  }, [dispatch]);

  const columns = [
    {
      header: t('Customer'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
            <User size={20} />
          </div>
          <div>
            <p className="font-bold">{row.loan?.customer?.firstName} {row.loan?.customer?.lastName}</p>
            <p className="text-xs text-gray-500">Loan ID: {row.loan?.loanCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: t('Amount'), 
      render: (row) => <span className="font-bold">₹ {row.paymentAmount?.toLocaleString()}</span> 
    },
    { 
      header: t('Method'), 
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-sm font-medium">{row.paymentMethod}</span>
        </div>
      )
    },
    { 
      header: t('Date'), 
      render: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
    {
      header: t('Status'),
      render: () => (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold/10 text-gold uppercase">
          SUCCESS
        </span>
      )
    },
    {
      header: t('Actions'),
      render: () => (
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg text-gray-400">
          <MoreVertical size={18} />
        </button>
      )
    }
  ];

  const filteredPayments = payments.filter(p => 
    p.loan?.loanCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.loan?.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{t('Payments')}</h1>
          <p className="text-gray-500 text-sm">Monitor all incoming payments and track loan repayments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={18} /> {t('Export')}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-gold flex items-center gap-2 shadow-gold"
          >
            <Plus size={18} /> {t('Record Payment')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gold/10 rounded-2xl text-gold">
              <ArrowDownRight size={24} />
            </div>
            <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Today's Collection</p>
            <h3 className="text-2xl font-bold">₹ {payments.reduce((acc, p) => acc + (new Date(p.createdAt).toDateString() === new Date().toDateString() ? p.paymentAmount : 0), 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gold/10 rounded-2xl text-gold">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">-2%</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Monthly Total</p>
            <h3 className="text-2xl font-bold">₹ {payments.reduce((acc, p) => acc + p.paymentAmount, 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">Real-time</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Transactions</p>
            <h3 className="text-2xl font-bold">{payments.length}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, loan ID..."
              className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Filter size={18} /> {t('Filter')}
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredPayments} loading={loading} />
      </div>

      <RecordPaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default PaymentList;
