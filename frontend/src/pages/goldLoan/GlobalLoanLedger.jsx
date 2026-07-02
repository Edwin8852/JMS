import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Filter, Download, Eye, X, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { fetchAllLoans, fetchMyLoans } from '../../api/goldLoan.api';

const GlobalLoanLedger = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadLoans = async () => {
      try {
        setLoading(true);
        const response = user?.role === 'CUSTOMER' 
          ? await fetchMyLoans() 
          : await fetchAllLoans();
        
        setLoans(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch loans');
      } finally {
        setLoading(false);
      }
    };
    loadLoans();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
      case 'PARTIALLY_PAID': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'READY_FOR_CLOSURE': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'CLOSED':
      case 'LOAN_CLOSED': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'ORNAMENT_RELEASED': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter Logic
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.mobileNumber?.includes(searchTerm) ||
      loan.customer?.customerCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
    
    let matchesDate = true;
    if (fromDate || toDate) {
      const loanDate = new Date(loan.loanDate || loan.createdAt);
      if (fromDate) matchesDate = matchesDate && loanDate >= new Date(fromDate);
      if (toDate) {
        const toD = new Date(toDate);
        toD.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && loanDate <= toD;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const currentLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    if (filteredLoans.length === 0) return;
    
    const headers = ['Loan ID', 'Customer Name', 'Mobile', 'Loan Amount', 'Outstanding', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLoans.map(loan => [
        loan.loanNumber,
        `"${loan.customerName || (loan.customer?.firstName + ' ' + (loan.customer?.lastName||''))}"`,
        loan.mobileNumber,
        loan.loanAmount,
        parseFloat(loan.remainingPrincipal || 0) + parseFloat(loan.interestAmount || 0) + parseFloat(loan.penaltyAmount || 0),
        loan.status,
        new Date(loan.loanDate || loan.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Loan_Ledger_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{t('Loan Ledger')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            {user?.role === 'CUSTOMER' ? t('View your loans and their details.') : t('Manage and view complete lifecycle of all gold loans.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
        {/* FILTERS */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder={t('Search Loan ID, Name, Mobile, Code...')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
            <div className="w-full md:w-48">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 font-medium"
              >
                <option value="ALL">{t('All Status')}</option>
                <option value="ACTIVE">{t('Active')}</option>
                <option value="PARTIALLY_PAID">{t('Partially Paid')}</option>
                <option value="READY_FOR_CLOSURE">{t('Ready For Closure')}</option>
                <option value="CLOSED">{t('Closed')}</option>
                <option value="ORNAMENT_RELEASED">{t('Ornament Released')}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-36 px-3 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                  title={t("From Date")}
                />
              </div>
              <div className="relative">
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-36 px-3 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                  title={t("To Date")}
                />
              </div>
            </div>
            {(searchTerm || statusFilter !== 'ALL' || fromDate || toDate) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setFromDate('');
                  setToDate('');
                  setCurrentPage(1);
                }}
                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                title={t("Clear Filters")}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-card/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Loan ID')}</th>
                {user?.role !== 'CUSTOMER' && <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Customer')}</th>}
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Loan Amount')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Outstanding')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Status')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Date')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'CUSTOMER' ? 6 : 7} className="px-6 py-10 text-center text-gray-500">{t('Loading loans...')}</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={user?.role === 'CUSTOMER' ? 6 : 7} className="px-6 py-10 text-center text-red-500">{error}</td>
                </tr>
              ) : currentLoans.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'CUSTOMER' ? 6 : 7} className="px-6 py-10 text-center text-gray-500">{t('No loans found.')}</td>
                </tr>
              ) : (
                currentLoans.map((loan) => {
                  const outstanding = parseFloat(loan.remainingPrincipal || 0) + parseFloat(loan.interestAmount || 0) + parseFloat(loan.penaltyAmount || 0);
                  
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">{loan.loanNumber}</span>
                      </td>
                      {user?.role !== 'CUSTOMER' && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{loan.customerName || (loan.customer?.firstName + ' ' + (loan.customer?.lastName || ''))}</span>
                            <span className="text-[10px] text-gray-500">{loan.mobileNumber}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">₹{parseFloat(loan.loanAmount).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-red-500">₹{outstanding.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusColor(loan.status)}`}>
                          {t(loan.status) || loan.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-300">{new Date(loan.loanDate || loan.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(user?.role === 'CUSTOMER' ? `/customer/gold-loan/${loan.id}/ledger` : `/admin/gold-loan/${loan.id}/ledger`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-gold dark:hover:bg-gold transition-colors"
                        >
                          <Eye size={14} />
                          {t('View Details')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              {t('Showing')} {(currentPage - 1) * itemsPerPage + 1} {t('to')} {Math.min(currentPage * itemsPerPage, filteredLoans.length)} {t('of')} {filteredLoans.length} {t('entries')}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-2">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoanLedger;
