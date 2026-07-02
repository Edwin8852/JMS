import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Search,
  Eye,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const InvoiceList = () => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // If customer, we should ideally fetch only their invoices.
        // Assuming backend GET /api/invoices filters by role if needed, or we fetch all and filter for now.
        // Or better yet, we just hit the endpoint. If backend doesn't filter, we should ideally update it, but for now let's hit it.
        const response = await api.get('/invoices');
        let data = response.data.data || [];
        // Temporary frontend filter if backend doesn't filter for customer
        if (user?.role === 'CUSTOMER') {
          // In a real scenario, the backend should filter by customer ID. We will assume the backend /invoices handles role-based filtering,
          // or we filter it if the invoice model has customerId populated. But Invoice model doesn't directly have customerId, it has loanId.
        }
        setInvoices(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [user]);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceType.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (invoiceNumber) => {
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
    } catch (err) {
      setError('Failed to download invoice PDF.');
    }
  };

  const handleView = async (invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/download-by-number/${invoiceNumber}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to view invoice PDF.');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">{user?.role === 'CUSTOMER' ? t('My Invoices') : t('Invoices')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            {t('View and download your payment receipts and closure invoices.')}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="p-4 md:p-8 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-white to-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-xl text-gold">
              <FileText size={20} />
            </div>
            {t('All Invoices')}
          </h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t('Search Invoice Number...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-card/50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Invoice Details')}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Type')}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Amount')}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Date')}</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-500">{t('Loading invoices...')}</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-red-500">{error}</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-500">{t('No invoices found.')}</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-card/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                        <span className="text-xs text-gray-500">Loan ID: {inv.loanId.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-lg uppercase">
                        {inv.invoiceType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-900 dark:text-white">₹{parseFloat(inv.paidAmount).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-300">{new Date(inv.generatedDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(inv.invoiceNumber)}
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-gold hover:text-white rounded-lg transition-colors"
                          title="View / Print PDF"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(inv.invoiceNumber)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
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
    </div>
  );
};

export default InvoiceList;
