import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTransactions } from '../../store/slices/customerSlice';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PaymentHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myTransactions, loading } = useSelector((state) => state.customers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = myTransactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const txnId = (tx.transactionId || `TXN-${tx.id}`).toLowerCase();
    const loanNum = (tx.loan?.loanNumber || '').toLowerCase();
    return txnId.includes(term) || loanNum.includes(term);
  });

  useEffect(() => {
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  if (loading && myTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">{t('Transaction History')}</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">{t('Track all your payments, interest, and settlements.')}</p>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
          <Download size={18} /> {t('Export Statement')}
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Search by transaction ID or loan...')}
              className="w-full bg-white border-2 border-transparent focus:border-gold/20 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 text-gray-500 font-bold hover:text-gold transition-all flex-shrink-0">
            <Filter size={18} /> {t('Filters')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 md:px-8 py-4 md:py-6 text-xs font-bold uppercase tracking-wider text-gray-400">{t('Transaction Details')}</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">{t('Loan ID')}</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-xs font-bold uppercase tracking-wider text-gray-400">{t('Date')}</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-xs font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">{t('Method')}</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">{t('Amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx, index) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 flex-shrink-0">
                        <ArrowUpRight size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{t(tx.paymentType)}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">ID: {tx.transactionId || 'TXN-'+tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                    <span className="font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-xs">
                      {tx.loan?.loanNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <p className="text-sm font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 hidden md:table-cell">
                    <span className="text-sm font-bold text-gray-600">{t(tx.paymentMethod)}</span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                    <p className="text-base md:text-lg font-black text-green-600">₹ {tx.paymentAmount?.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">{t('Successful')}</p>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400">
                    <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{searchTerm ? t('No transactions match your search.') : t('No transactions found.')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
