import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoanPayments } from '../../store/slices/loanPaymentSlice';
import Table from '../../components/ui/Table';
import { Download, Search, Filter, IndianRupee, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const LoanPaymentReports = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.loanPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    dispatch(fetchLoanPayments({}));
  }, [dispatch]);

  const handleDownloadInvoice = async (invoiceNumber) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'https://jms-vpf1.onrender.com/api';
      const response = await fetch(`${backendUrl}/invoices/download-by-number/${invoiceNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.warning('No records to export');
      return;
    }
    const headers = ['Payment ID', 'Invoice Number', 'Date', 'Customer', 'Amount Paid', 'Principal Paid', 'Interest Paid', 'Penalty Paid', 'Status', 'Method'];
    const rows = filteredPayments.map(row => [
      row.id,
      row.invoiceNumber || 'N/A',
      new Date(row.paymentDate || row.createdAt).toLocaleDateString(),
      row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'N/A',
      row.amountPaid || row.paymentAmount,
      row.principalPaid || row.amountPaid || 0,
      row.interestPaid || 0,
      row.penaltyPaid || row.penaltyAmount || 0,
      row.paymentStatus || 'ACTIVE',
      row.paymentMethod
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loan_Payment_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Report exported to Excel (CSV) successfully!');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'FULLY_PAID':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'PARTIAL_PAID':
        return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'INTEREST_ONLY_PAID':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'PENALTY_PAID':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse';
      default:
        return 'bg-green-100 text-green-700 border border-green-300';
    }
  };

  const filteredPayments = (payments || []).filter((pmt) => {
    const matchesSearch = 
      (pmt.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pmt.customer ? `${pmt.customer.firstName} ${pmt.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (pmt.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = 
      selectedStatus === 'ALL' || 
      (pmt.paymentStatus || 'ACTIVE') === selectedStatus;
      
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Payment ID', render: (row) => <span className="text-xs text-gray-500 font-mono">{row.id.split('-')[0].toUpperCase()}</span> },
    { header: 'Date', render: (row) => new Date(row.paymentDate || row.createdAt).toLocaleDateString() },
    { header: 'Customer', render: (row) => row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'N/A' },
    { 
      header: 'Total Paid', 
      render: (row) => <span className="font-bold text-green-600 flex items-center gap-1"><IndianRupee size={12}/>{(row.amountPaid || row.paymentAmount)?.toLocaleString()}</span> 
    },
    { 
      header: 'Breakdown (P / I / Py)', 
      render: (row) => (
        <div className="text-xs space-y-1 py-1 font-medium">
          <div><span className="text-gray-400 font-bold">Principal:</span> ₹ {Number(row.principalPaid || row.amountPaid || 0).toLocaleString()}</div>
          <div><span className="text-purple-600 font-bold">Interest:</span> ₹ {Number(row.interestPaid || 0).toLocaleString()}</div>
          <div><span className="text-rose-600 font-bold">Penalty:</span> ₹ {Number(row.penaltyPaid || row.penaltyAmount || 0).toLocaleString()}</div>
        </div>
      )
    },
    { 
      header: 'Status', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(row.paymentStatus || 'ACTIVE')}`}>
          {row.paymentStatus || 'SUCCESS'}
        </span>
      )
    },
    { header: 'Method', render: (row) => row.paymentMethod || 'CASH' },
    {
      header: 'Invoice',
      render: (row) => row.invoiceNumber ? (
        <button
          onClick={() => handleDownloadInvoice(row.invoiceNumber)}
          className="flex items-center gap-1 bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
        >
          Invoice PDF
        </button>
      ) : <span className="text-xs text-gray-400">N/A</span>
    }
  ];

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Loan Payment <span className="text-gold">Reports</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Independent Gold Loan collection records.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-gold flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-all">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={() => window.print()} className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all">
            <Printer size={18} /> Print PDF
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by ID, Invoice, or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-500">{Filter} Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 dark:bg-dark-card border border-gray-200 rounded-2xl py-2 px-4 outline-none text-sm font-bold text-gray-700 focus:ring-2 focus:ring-gold/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PARTIAL_PAID">PARTIAL_PAID</option>
              <option value="FULLY_PAID">FULLY_PAID</option>
              <option value="INTEREST_ONLY_PAID">INTEREST_ONLY_PAID</option>
              <option value="PENALTY_PAID">PENALTY_PAID</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
        </div>
        
        <Table columns={columns} data={filteredPayments} loading={loading} />
      </div>
    </div>
  );
};

export default LoanPaymentReports;
