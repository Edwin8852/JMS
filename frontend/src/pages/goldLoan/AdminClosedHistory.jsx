import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLoans } from '../../store/slices/goldLoanSlice';
import { 
  Download, 
  Search, 
  Eye, 
  FileText, 
  Filter,
  CheckCircle,
  Gem,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import LoanDetailsView from './components/LoanDetailsView';
import goldLoanApi from '../../api/goldLoan.api';
import { toast } from 'react-toastify';

const AdminClosedHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loans, loading } = useSelector((state) => state.goldLoan);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllLoans());
  }, [dispatch]);

  // Filter for CLOSED and ORNAMENT_RELEASED status
  const closedLoans = loans.filter(
    loan => loan.status === 'CLOSED' || loan.status === 'ORNAMENT_RELEASED' || loan.status === 'LOAN_CLOSED'
  ).filter(loan => 
    loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer?.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.mobileNumber?.includes(searchTerm)
  );

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

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(20);
    doc.text('SDRS Gold Finance - Closed Loan History', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = [
      "Loan No", "Customer", "Cust ID", "Mobile", 
      "Weight(g)", "Purity", "Amount", "Total Paid",
      "Created Date", "Closed Date", "Status"
    ];
    
    const tableRows = [];

    closedLoans.forEach(loan => {
      const loanData = [
        loan.loanNumber,
        `${loan.customer?.firstName} ${loan.customer?.lastName || ''}`,
        loan.customer?.customerCode,
        loan.mobileNumber,
        loan.goldWeight,
        loan.goldPurity,
        `Rs ${parseFloat(loan.loanAmount).toFixed(2)}`,
        `Rs ${parseFloat(loan.totalPaid || 0).toFixed(2)}`,
        new Date(loan.createdAt).toLocaleDateString(),
        loan.loanClosedDate ? new Date(loan.loanClosedDate).toLocaleDateString() : 'N/A',
        loan.status
      ];
      tableRows.push(loanData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] } // Black header to match SDRS styling
    });

    doc.save(`Closed_Loans_Report_${new Date().getTime()}.pdf`);
  };

  const exportCSV = () => {
    const headers = [
      "Loan Number", "Customer Name", "Customer ID", "Mobile Number", 
      "Gold Weight", "Gold Purity", "Ornament Type", "Loan Amount",
      "Principal Paid", "Interest Paid", "Penalty Paid", "Total Amount Paid",
      "Loan Created Date", "Loan Closed Date", "Current Status"
    ];

    const rows = closedLoans.map(loan => [
      loan.loanNumber,
      `"${loan.customer?.firstName} ${loan.customer?.lastName || ''}"`,
      loan.customer?.customerCode,
      loan.mobileNumber,
      loan.goldWeight,
      loan.goldPurity,
      loan.ornamentType || 'Ornaments',
      loan.loanAmount,
      loan.totalPrincipalPaid || 0,
      loan.totalInterestPaid || 0,
      loan.totalPenalty || 0,
      loan.totalPaid || 0,
      new Date(loan.createdAt).toLocaleDateString(),
      loan.loanClosedDate ? new Date(loan.loanClosedDate).toLocaleDateString() : 'N/A',
      loan.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Closed_Loans_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t('Closed History')}</h1>
          <p className="text-gray-500 mt-1">{t('Complete history of all fully repaid and closed gold loans.')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t('Search Loan ID, Name...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:border-gold outline-none shadow-sm transition-all w-64"
            />
          </div>
          
          <button 
            onClick={exportPDF}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-all flex items-center gap-2"
          >
            <FileText size={18} /> Export PDF
          </button>
          
          <button 
            onClick={exportCSV}
            className="px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-black text-sm hover:bg-green-100 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-4 custom-scrollbar">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-gray-50 rounded-2xl">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-l-2xl">Loan Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Gold Asset</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-r-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <Loader2 className="animate-spin text-gold mx-auto" size={40} />
                  </td>
                </tr>
              ) : closedLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-500 font-medium">
                    No closed loans found matching your criteria.
                  </td>
                </tr>
              ) : (
                closedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{loan.loanNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{loan.customer?.firstName} {loan.customer?.lastName}</div>
                      <div className="text-xs text-gray-500">{loan.customer?.customerCode} • {loan.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{loan.goldWeight}g • {loan.goldPurity}</div>
                      <div className="text-xs text-gray-500">{loan.ornamentType || 'Ornaments'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-600">Total: ₹{parseFloat(loan.totalPaid || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                         Prin: ₹{parseFloat(loan.totalPrincipalPaid || 0).toLocaleString()} • Int: ₹{parseFloat(loan.totalInterestPaid || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-700">Created: {new Date(loan.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">Closed: {loan.loanClosedDate ? new Date(loan.loanClosedDate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        loan.status === 'ORNAMENT_RELEASED' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetails(loan)}
                        className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 ml-auto"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Details Modal */}
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
                  <h3 className="text-3xl font-display font-black">{selectedLoan.loanNumber} - Complete Lifecycle</h3>
                  <p className="text-gray-500 font-medium">Full details, timelines, and audit logs.</p>
                </div>
                <button 
                  onClick={() => setSelectedLoan(null)} 
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  Close Viewer
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-40">
                  <Loader2 className="animate-spin text-gold" size={60} />
                </div>
              ) : loanDetails ? (
                <LoanDetailsView loanDetails={loanDetails} isCustomerView={false} />
              ) : (
                <div className="text-center py-20 text-red-500 font-bold">Failed to load details.</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClosedHistory;
