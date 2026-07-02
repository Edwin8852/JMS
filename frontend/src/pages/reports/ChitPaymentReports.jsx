import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChitPayments } from '../../store/slices/chitPaymentSlice';
import Table from '../../components/ui/Table';
import { Download, Search, Filter, IndianRupee, FileText, FileSpreadsheet, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ChitPaymentReports = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.chitPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const filters = {};
      if (searchTerm) filters.searchTerm = searchTerm;
      if (activeStatus !== 'ALL') filters.paymentStatus = activeStatus;
      
      dispatch(fetchChitPayments(filters));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm, activeStatus]);

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(20);
    doc.text('SDRS Gold Finance - Chit Fund Collections Report', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filter: ${activeStatus}`, 14, 36);

    const tableColumn = ["Receipt ID", "Date", "Subscriber Name", "Customer Code", "Scheme", "Month", "Amount Paid", "Status"];
    const tableRows = [];

    payments.forEach(payment => {
      const paymentData = [
        payment.id.split('-')[0].toUpperCase(),
        new Date(payment.paymentDate).toLocaleDateString(),
        payment.subscriber?.customer?.firstName + ' ' + (payment.subscriber?.customer?.lastName || ''),
        payment.subscriber?.customer?.customerCode || 'N/A',
        payment.subscriber?.scheme?.schemeName || 'N/A',
        payment.installmentMonth || 'N/A',
        `Rs. ${payment.amountPaid}`,
        payment.paymentStatus || 'INSTALLMENT_PAID'
      ];
      tableRows.push(paymentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`Chit_Collections_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ["Receipt ID,Date,Subscriber Name,Customer Code,Scheme,Month,Amount Paid,Status"];
    
    const csvRows = payments.map(payment => {
      return [
        payment.id.split('-')[0].toUpperCase(),
        new Date(payment.paymentDate).toLocaleDateString(),
        `"${payment.subscriber?.customer?.firstName} ${payment.subscriber?.customer?.lastName || ''}"`,
        payment.subscriber?.customer?.customerCode || 'N/A',
        `"${payment.subscriber?.scheme?.schemeName || 'N/A'}"`,
        payment.installmentMonth || 'N/A',
        payment.amountPaid,
        payment.paymentStatus || 'INSTALLMENT_PAID'
      ].join(',');
    });

    const csvContent = headers.concat(csvRows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chit_Collections_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { header: 'Receipt ID', render: (row) => <span className="text-xs text-gray-500 font-mono font-bold">{row.id.split('-')[0].toUpperCase()}</span> },
    { header: 'Date', render: (row) => <span className="text-sm font-medium">{new Date(row.paymentDate).toLocaleDateString()}</span> },
    { 
      header: 'Customer', 
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.subscriber?.customer?.firstName} {row.subscriber?.customer?.lastName || ''}</p>
          <p className="text-[10px] text-gray-500 font-black tracking-widest">{row.subscriber?.customer?.customerCode || 'N/A'}</p>
        </div>
      )
    },
    { 
      header: 'Scheme', 
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900">{row.subscriber?.scheme?.schemeName || 'N/A'}</p>
          <p className="text-[10px] text-purple-600 font-black tracking-widest uppercase">Installment #{row.installmentMonth || 'N/A'}</p>
        </div>
      )
    },
    { 
      header: 'Amount Paid', 
      render: (row) => <span className="font-black text-green-600 text-lg flex items-center gap-1"><IndianRupee size={14}/>{parseFloat(row.amountPaid).toLocaleString()}</span> 
    },
    { 
      header: 'Status', 
      render: (row) => {
        const status = row.paymentStatus || 'INSTALLMENT_PAID';
        const isFullyPaid = status === 'FULLY_PAID' || status === 'INSTALLMENT_PAID';
        const isPartial = status === 'PARTIAL_PAID';
        const isOverdue = status === 'OVERDUE';
        
        return (
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
            isFullyPaid ? 'bg-green-100 text-green-700' :
            isPartial ? 'bg-yellow-100 text-yellow-700' :
            isOverdue ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {isFullyPaid && <CheckCircle size={12} />}
            {isPartial && <Clock size={12} />}
            {isOverdue && <AlertCircle size={12} />}
            {status.replace('_', ' ')}
          </span>
        );
      }
    },
  ];

  const filterTabs = [
    { id: 'ALL', label: 'All Collections' },
    { id: 'INSTALLMENT_PAID', label: 'Paid Installments' },
    { id: 'FULLY_PAID', label: 'Fully Paid Chits' },
    { id: 'PARTIAL_PAID', label: 'Partial Paid' },
    { id: 'OVERDUE', label: 'Overdue Payments' }
  ];

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Chit Fund <span className="text-purple-600">Collections</span>
          </h1>
          <p className="text-gray-500 mt-1 font-bold">Independent Chit Fund payment records & logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet size={18} className="text-green-600" /> Export CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-purple-200"
          >
            <FileText size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="glass-card p-2 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/40">
        
        {/* Filter Badges */}
        <div className="flex overflow-x-auto custom-scrollbar p-4 gap-2 border-b border-gray-100">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeStatus === tab.id 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-[28rem] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search Customer, Scheme, or Receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-purple-600 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all shadow-sm focus:shadow-md"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {payments?.length || 0} Records
              </span>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-3xl border border-gray-100">
            <Table columns={columns} data={payments || []} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChitPaymentReports;
