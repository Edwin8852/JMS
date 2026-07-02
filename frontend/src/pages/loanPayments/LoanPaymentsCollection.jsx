import React, { useState, useEffect } from 'react'; // Force HMR reload
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CreditCard, Layers, Clock, TrendingUp, AlertCircle, RefreshCw,
  CheckCircle, FileSpreadsheet, Download, Printer, User, Calendar, DollarSign, ArrowRight
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import CurrencyInput from '../../components/ui/CurrencyInput';

const LoanPaymentsCollection = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  // States
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [payments, setPayments] = useState([]);
  
  // Dashboard Metrics
  const [dailyStats, setDailyStats] = useState({
    totalCollected: 0,
    cash: 0,
    upi: 0,
    bankTransfer: 0,
    card: 0,
    manual: 0,
    todayCount: 0
  });

  // Form States
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('PARTIAL_PAYMENT');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Filters State
  const [logSearch, setLogSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load active user on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error(e);
      }
    }
    fetchLoans();
    fetchPaymentLogs();
  }, []);

  // Fetch all loans to populate autocomplete selector
  const fetchLoans = async () => {
    try {
      const response = await api.get('/gold-finance');
      if (response.data && response.data.success) {
        // Show only loans that are active or overdue and have outstanding balances
        const payableLoans = response.data.data.filter(l => 
          (l.status === 'ACTIVE' || l.status === 'OVERDUE') && 
          (parseFloat(l.remainingPrincipal) + parseFloat(l.interestAmount) + parseFloat(l.penaltyAmount) > 0)
        );
        setLoans(payableLoans);
        setFilteredLoans(payableLoans);
      }
    } catch (error) {
      console.error('Failed to fetch active loans:', error);
      toast.error('Failed to fetch active loans list.');
    }
  };

  // Fetch recent payments and compute daily summaries
  const fetchPaymentLogs = async () => {
    try {
      const response = await api.get('/loan-payments');
      if (response.data && response.data.success) {
        const logs = response.data.data;
        setPayments(logs);

        // Compute today's collection summaries
        const todayStr = new Date().toISOString().split('T')[0];
        let total = 0;
        let cash = 0, upi = 0, bank = 0, card = 0, manual = 0;
        let count = 0;

        logs.forEach(pay => {
          const payDateStr = new Date(pay.paymentDate).toISOString().split('T')[0];
          if (payDateStr === todayStr && pay.status === 'SUCCESS') {
            const amt = parseFloat(pay.paymentAmount || pay.amountPaid || 0);
            total += amt;
            count++;
            
            const method = (pay.paymentMethod || '').toUpperCase();
            if (method === 'CASH') cash += amt;
            else if (method === 'UPI') upi += amt;
            else if (method === 'BANK_TRANSFER') bank += amt;
            else if (method === 'CARD') card += amt;
            else if (method === 'MANUAL_ENTRY') manual += amt;
          }
        });

        setDailyStats({
          totalCollected: total,
          cash,
          upi,
          bankTransfer: bank,
          card,
          manual,
          todayCount: count
        });
      }
    } catch (error) {
      console.error('Failed to fetch payments logs:', error);
    }
  };

  // Filter autocomplete list as user searches
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLoans(loans);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = loans.filter(l => 
        (l.loanNumber && l.loanNumber.toLowerCase().includes(q)) || 
        (l.customerName && l.customerName.toLowerCase().includes(q)) ||
        (l.customer && l.customer.customerCode && l.customer.customerCode.toLowerCase().includes(q))
      );
      setFilteredLoans(filtered);
    }
  }, [searchQuery, loans]);

  // Real-time allocation simulator based on entered payment amount and selection
  const simulateAllocation = () => {
    if (!selectedLoan || !paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      return { penaltyPaid: 0, interestPaid: 0, principalPaid: 0, remainingBalance: 0 };
    }

    const amount = parseFloat(paymentAmount);
    const outstandingPrincipal = parseFloat(selectedLoan.remainingPrincipal || 0);
    const outstandingInterest = parseFloat(selectedLoan.interestAmount || 0);
    const outstandingPenalty = parseFloat(selectedLoan.penaltyAmount || 0);

    let remaining = amount;
    let penaltyPaid = 0;
    let interestPaid = 0;
    let principalPaid = 0;

    if (paymentType === 'INTEREST_PAYMENT') {
      interestPaid = Math.min(remaining, outstandingInterest);
      remaining -= interestPaid;
      penaltyPaid = Math.min(remaining, outstandingPenalty);
      remaining -= penaltyPaid;
    } else if (paymentType === 'PRINCIPAL_PAYMENT') {
      principalPaid = Math.min(remaining, outstandingPrincipal);
      remaining -= principalPaid;
    } else if (paymentType === 'PENALTY_PAYMENT') {
      penaltyPaid = Math.min(remaining, outstandingPenalty);
      remaining -= penaltyPaid;
    } else {
      // PARTIAL_PAYMENT, FULL_SETTLEMENT, or general EMI
      penaltyPaid = Math.min(remaining, outstandingPenalty);
      remaining -= penaltyPaid;
      
      interestPaid = Math.min(remaining, outstandingInterest);
      remaining -= interestPaid;

      principalPaid = Math.min(remaining, outstandingPrincipal);
      remaining -= principalPaid;
    }

    // Apply leftover to principal if valid
    if (remaining > 0.01) {
      const extraPrincipal = Math.min(remaining, outstandingPrincipal - principalPaid);
      principalPaid = parseFloat((principalPaid + extraPrincipal).toFixed(2));
    }

    const totalDueRemaining = Math.max(0, (outstandingPrincipal + outstandingInterest + outstandingPenalty) - (penaltyPaid + interestPaid + principalPaid));

    return {
      penaltyPaid: parseFloat(penaltyPaid.toFixed(2)),
      interestPaid: parseFloat(interestPaid.toFixed(2)),
      principalPaid: parseFloat(principalPaid.toFixed(2)),
      remainingBalance: parseFloat(totalDueRemaining.toFixed(2))
    };
  };

  const simulation = simulateAllocation();

  // Handlers
  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setSearchQuery(`${loan.loanNumber} - ${loan.customerName}`);
    setShowDropdown(false);

    // If full settlement, default amount to total outstanding
    const outstanding = parseFloat(loan.remainingPrincipal || 0) + parseFloat(loan.interestAmount || 0) + parseFloat(loan.penaltyAmount || 0);
    if (paymentType === 'FULL_SETTLEMENT') {
      setPaymentAmount(outstanding.toFixed(2));
    }
  };

  // Adjust amount when changing payment type
  useEffect(() => {
    if (selectedLoan) {
      const outstanding = parseFloat(selectedLoan.remainingPrincipal || 0) + 
                            parseFloat(selectedLoan.interestAmount || 0) + 
                            parseFloat(selectedLoan.penaltyAmount || 0);
      if (paymentType === 'FULL_SETTLEMENT') {
        setPaymentAmount(outstanding.toFixed(2));
      } else if (paymentType === 'INTEREST_PAYMENT') {
        setPaymentAmount(parseFloat(selectedLoan.interestAmount || 0).toFixed(2));
      } else if (paymentType === 'PENALTY_PAYMENT') {
        setPaymentAmount(parseFloat(selectedLoan.penaltyAmount || 0).toFixed(2));
      } else {
        setPaymentAmount('');
      }
    }
  }, [paymentType, selectedLoan]);

  const handleManualScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.post('/loan-payments/trigger-overdue');
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Daily scan completed successfully!');
        fetchLoans(); // Refresh loans
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to trigger overdue calculations scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedLoan) {
      toast.error('Please select an active Gold Loan first.');
      return;
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    const outstanding = parseFloat(selectedLoan.remainingPrincipal || 0) + 
                          parseFloat(selectedLoan.interestAmount || 0) + 
                          parseFloat(selectedLoan.penaltyAmount || 0);

    if (amt > outstanding + 0.01) {
      toast.error(`Payment amount cannot exceed total outstanding balance of ₹${outstanding.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/loan-payments/${selectedLoan.id}/process`, {
        amountPaid: amt,
        paymentType,
        paymentMethod,
        referenceNumber,
        remarks,
        paymentDate
      });

      if (response.data && response.data.success) {
        toast.success('Loan payment collected and receipt generated successfully!');
        
        // Reset form
        setSelectedLoan(null);
        setSearchQuery('');
        setPaymentAmount('');
        setReferenceNumber('');
        setRemarks('');
        
        // Refresh data
        fetchLoans();
        fetchPaymentLogs();
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to process payment.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download printable PDF receipt trigger
  const handleDownloadReceipt = async (paymentId) => {
    try {
      toast.info('Preparing receipt PDF download...');
      const response = await api.get(`/loan-payments/receipt/${paymentId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
      toast.success('PDF Receipt opened successfully in a new tab.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch the PDF receipt document.');
    }
  };

  // Print Receipt in new window
  const handlePrintReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/loan-payments/receipt/${paymentId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobURL = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobURL;
      document.body.appendChild(iframe);
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error(err);
      toast.error('Failed to open printing frame.');
    }
  };

  // Filtered payment logs for the table
  const filteredPayments = payments.filter(pay => {
    const matchesSearch = 
      pay.loan?.loanNumber?.toLowerCase().includes(logSearch.toLowerCase()) ||
      pay.customer?.firstName?.toLowerCase().includes(logSearch.toLowerCase()) ||
      pay.customer?.lastName?.toLowerCase().includes(logSearch.toLowerCase()) ||
      pay.customer?.customerCode?.toLowerCase().includes(logSearch.toLowerCase());

    const matchesType = typeFilter ? pay.paymentType === typeFilter : true;
    const matchesMethod = methodFilter ? pay.paymentMethod === methodFilter : true;

    // Date range checks
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(pay.paymentDate) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(pay.paymentDate) <= new Date(endDate + 'T23:59:59');
    }

    return matchesSearch && matchesType && matchesMethod && matchesDate;
  });

  // Excel CSV Export
  const handleExcelExport = () => {
    if (filteredPayments.length === 0) {
      toast.warning('No logs available for export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Payment ID,Date,Loan Number,Customer Name,Customer Code,Amount Paid (INR),Payment Type,Payment Method,Ref ID,Collected By,Status\n";

    filteredPayments.forEach(pay => {
      const row = [
        pay.id,
        new Date(pay.paymentDate).toLocaleString(),
        pay.loan?.loanNumber || 'N/A',
        `${pay.customer?.firstName || ''} ${pay.customer?.lastName || ''}`,
        pay.customer?.customerCode || 'N/A',
        pay.paymentAmount || pay.amountPaid || 0,
        pay.paymentType,
        pay.paymentMethod,
        pay.transactionId || 'N/A',
        pay.creator?.name || 'System Admin',
        pay.status
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loan_Payments_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel CSV exported successfully.');
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-gold-gradient rounded-2xl text-white shadow-lg shadow-gold/20">
              <CreditCard size={28} />
            </span>
            {t('Loan Repayments Collection')}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('Record gold loan repayments, manage waterfall collections, and generate printable digital receipts.')}</p>
        </div>

        {/* Manual Overdue Run Trigger Button */}
        <button
          onClick={handleManualScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white hover:bg-navy-light disabled:bg-gray-400 font-bold rounded-xl shadow-md transition-all active:scale-95 duration-200"
        >
          <RefreshCw size={18} className={isScanning ? "animate-spin" : ""} />
          {isScanning ? t('Scanning Overdue...') : t('Run Overdue & Penalty Scan')}
        </button>
      </div>

      {/* Daily Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Collected */}
        <div className="lg:col-span-2 bg-gradient-to-br from-navy to-navy-light text-white p-5 rounded-2xl shadow-xl shadow-navy/10 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-white/70">{t('Collected Today')}</span>
            <span className="p-1.5 bg-white/10 rounded-lg text-gold"><TrendingUp size={16} /></span>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono">₹{dailyStats.totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-white/60 mt-1">{dailyStats.todayCount} {t('successful transactions')}</p>
          </div>
        </div>

        {/* CASH */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('Cash Payments')}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-800 font-mono">₹{dailyStats.cash.toLocaleString('en-IN')}</h4>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: dailyStats.totalCollected > 0 ? `${(dailyStats.cash / dailyStats.totalCollected) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* UPI */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('UPI / QR')}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-800 font-mono">₹{dailyStats.upi.toLocaleString('en-IN')}</h4>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-sky-500 h-1.5 rounded-full" 
                style={{ width: dailyStats.totalCollected > 0 ? `${(dailyStats.upi / dailyStats.totalCollected) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('Bank Transfer')}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-800 font-mono">₹{dailyStats.bankTransfer.toLocaleString('en-IN')}</h4>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: dailyStats.totalCollected > 0 ? `${(dailyStats.bankTransfer / dailyStats.totalCollected) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Card & Others */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('Card & Manual')}</span>
          <div>
            <h4 className="text-lg font-bold text-gray-800 font-mono">₹{(dailyStats.card + dailyStats.manual).toLocaleString('en-IN')}</h4>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full" 
                style={{ width: dailyStats.totalCollected > 0 ? `${((dailyStats.card + dailyStats.manual) / dailyStats.totalCollected) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Form Left, Simulation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Payment Collection Form */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 relative">
          
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-2.5 h-6 bg-gold rounded-full inline-block" />
            {t('Collection Record')}
          </h2>

          <form onSubmit={handleSubmitPayment} className="space-y-6">
            
            {/* Search Active/Overdue Gold Loan Auto-complete Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Select Gold Loan ID / Customer')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('Search by Loan GL-No, customer name, mobile...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                />
                
                {selectedLoan && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedLoan(null);
                      setSearchQuery('');
                      setPaymentAmount('');
                    }}
                    className="absolute right-3 top-3.5 text-xs text-red-500 font-bold hover:underline"
                  >
                    {t('Clear')}
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              <AnimatePresence>
                {showDropdown && filteredLoans.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-50 custom-scrollbar"
                  >
                    {filteredLoans.map(loan => {
                      const outstanding = parseFloat(loan.remainingPrincipal) + parseFloat(loan.interestAmount) + parseFloat(loan.penaltyAmount);
                      return (
                        <li 
                          key={loan.id}
                          onClick={() => handleSelectLoan(loan)}
                          className="p-3.5 hover:bg-gold/5 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-gray-900 block">{loan.loanNumber}</span>
                            <span className="text-xs text-gray-400">{loan.customerName} ({loan.customer?.customerCode || 'N/A'})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-800 font-mono">₹{outstanding.toLocaleString('en-IN')}</span>
                            <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                              loan.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>{loan.status}</span>
                          </div>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Loan Profile Cards */}
            {selectedLoan && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-4"
              >
                
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('Customer Name')}</span>
                    <span className="text-xs font-bold text-gray-800">{selectedLoan.customerName}</span>
                  </div>
                  <div className="sm:pl-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('Customer Code')}</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">{selectedLoan.customer?.customerCode || 'N/A'}</span>
                  </div>
                  <div className="sm:pl-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('Gold Weight / Purity')}</span>
                    <span className="text-xs font-bold text-gray-800">{selectedLoan.goldWeight}g ({selectedLoan.goldPurity})</span>
                  </div>
                  <div className="sm:pl-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('Sanctioned Principal')}</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">₹{parseFloat(selectedLoan.loanAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Specific Breakdown Balances cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">{t('Remaining Principal')}</span>
                    <span className="text-base font-bold text-navy font-mono">₹{parseFloat(selectedLoan.remainingPrincipal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">{t('Current Month Interest')}</span>
                    <span className="text-base font-bold text-amber-500 font-mono">₹{parseFloat(selectedLoan.monthlyInterest || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">{t('Total Interest Due')}</span>
                    <span className="text-base font-bold text-amber-600 font-mono">₹{parseFloat(selectedLoan.interestAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">{t('Penalty Accumulations')}</span>
                    <span className="text-base font-bold text-red-500 font-mono">₹{parseFloat(selectedLoan.penaltyAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Inputs: Payment Type & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Payment Type Option')}</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-bold text-gray-800"
                >
                  <option value="PARTIAL_PAYMENT">{t('Partial Loan Payment (Waterfall)')}</option>
                  <option value="SMART_PARTIAL_PAYMENT">{t('Smart Partial Payment (Auto Allocation)')}</option>
                  <option value="INTEREST_PAYMENT">{t('Interest Component Only')}</option>
                  <option value="PRINCIPAL_PAYMENT">{t('Principal Component Only')}</option>
                  <option value="PENALTY_PAYMENT">{t('Penalty Component Only')}</option>
                  <option value="FULL_SETTLEMENT">{t('Full Loan Settlement')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Payment Method')}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-bold text-gray-800"
                >
                  <option value="CASH">{t('Cash Collection')}</option>
                  <option value="UPI">{t('UPI QR Code')}</option>
                  <option value="BANK_TRANSFER">{t('Direct Bank Transfer')}</option>
                  <option value="CARD">{t('Card POS Payment')}</option>
                  <option value="MANUAL_ENTRY">{t('Manual Ledger Override')}</option>
                </select>
              </div>
            </div>

            {/* Input: Payment Amount & Backdate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Collection Amount (INR)')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
                  <CurrencyInput
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={paymentType === 'FULL_SETTLEMENT' && !!selectedLoan}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-bold text-gray-800 font-mono disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Payment Date')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-bold text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Ref Number & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Transaction / Ref ID (UPI/Bank)')}</label>
                <input
                  type="text"
                  placeholder="e.g. TXN1028392182"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-gray-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">{t('Remarks / Notes')}</label>
                <input
                  type="text"
                  placeholder="Collector remarks or reference notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-gray-800 font-bold"
                />
              </div>
            </div>

            {/* Collected By read-only */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <User size={14} />
                {t('Collected By Admin')}:
              </span>
              <span className="font-bold text-gray-700">{user ? user.name : 'Super Admin'}</span>
            </div>

            {/* Submit button with double submissions blocker */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedLoan}
              className="w-full py-3.5 bg-gradient-to-r from-gold via-gold/90 to-gold-dark text-navy hover:scale-[1.01] active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-400 font-display font-bold text-center rounded-2xl shadow-xl shadow-gold/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  {t('Processing Transaction...')}
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  {t('Process Repayment Collection')}
                </>
              )}
            </button>

          </form>

        </div>

        {/* Real-time Allocation Calculator Simulator Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-gradient-to-b from-navy to-navy-dark text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-navy">
            
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="p-1 bg-gold/25 rounded-md text-gold"><Layers size={16} /></span>
              {t('Allocation Simulator')}
            </h3>

            {selectedLoan && paymentAmount ? (
              <div className="space-y-5">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {t('Below is a real-time preview of how this payment of ')}
                  <strong className="text-gold font-mono">₹{parseFloat(paymentAmount).toLocaleString('en-IN')}</strong>
                  {t(' will be allocated using the rules defined for ')}
                  <strong className="text-white">{paymentType.replace('_', ' ')}</strong>.
                </p>

                {/* Simulation Waterfall Cards */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-300">{t('Customer Payment')}</span>
                    <span className="font-bold text-white font-mono">₹{parseFloat(paymentAmount).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-300">{t('Penalty Covered')}</span>
                    <span className="font-bold text-red-300 font-mono">+ ₹{simulation.penaltyPaid.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-300">{t('Interest Covered')}</span>
                    <span className="font-bold text-amber-300 font-mono">+ ₹{simulation.interestPaid.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-300">{t('Principal Covered')}</span>
                    <span className="font-bold text-emerald-300 font-mono">+ ₹{simulation.principalPaid.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-bold text-gold">{t('Remaining Principal')}</span>
                  <span className="text-lg font-bold font-mono text-white">₹{simulation.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {simulation.remainingBalance === 0 && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle size={14} />
                    {t('Success: This payment fully settles the gold loan balance!')}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 space-y-3">
                <Clock size={40} className="mx-auto opacity-30 text-gray-300" />
                <p className="text-xs leading-relaxed max-w-[240px] mx-auto">
                  {t('Select a loan and enter a collection amount to preview real-time waterfall allocation splits.')}
                </p>
              </div>
            )}

          </div>

          {/* Guidelines info card */}
          <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-800 space-y-1.5">
              <span className="font-bold block uppercase">{t('Repayment Instructions')}</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>{t('Double click submits are locked for 30 seconds.')}</li>
                <li>{t('Overpayments exceeding the total remaining amount are strictly rejected.')}</li>
                <li>{t('Generating digital PDF receipts is completed instantly upon successful ledger entry.')}</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* Payment logs section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-navy rounded-full inline-block" />
            {t('Collection Logs')}
          </h2>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleExcelExport}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <FileSpreadsheet size={16} />
              {t('Export Excel')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('Search by Loan No, customer...')}
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold text-xs font-bold text-gray-800"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-xs font-bold text-gray-800"
            >
              <option value="">{t('All Payment Types')}</option>
              <option value="PARTIAL_PAYMENT">{t('PARTIAL PAYMENT')}</option>
              <option value="INTEREST_PAYMENT">{t('INTEREST PAYMENT')}</option>
              <option value="PRINCIPAL_PAYMENT">{t('PRINCIPAL PAYMENT')}</option>
              <option value="PENALTY_PAYMENT">{t('PENALTY PAYMENT')}</option>
              <option value="FULL_SETTLEMENT">{t('FULL SETTLEMENT')}</option>
            </select>
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full p-2 bg-white rounded-xl border border-gray-200 focus:outline-none text-xs font-bold text-gray-800"
            >
              <option value="">{t('All Payment Methods')}</option>
              <option value="CASH">{t('CASH')}</option>
              <option value="UPI">{t('UPI')}</option>
              <option value="BANK_TRANSFER">{t('BANK TRANSFER')}</option>
              <option value="CARD">{t('CARD')}</option>
              <option value="MANUAL_ENTRY">{t('MANUAL ENTRY')}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setLogSearch('');
              setTypeFilter('');
              setMethodFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all"
          >
            {t('Clear Filters')}
          </button>
        </div>

        {/* Collection Logs Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="p-4">{t('Payment Date')}</th>
                <th className="p-4">{t('Loan No')}</th>
                <th className="p-4">{t('Customer Name')}</th>
                <th className="p-4 text-right">{t('Amount Collected')}</th>
                <th className="p-4">{t('Payment Type')}</th>
                <th className="p-4">{t('Method')}</th>
                <th className="p-4">{t('Collected By')}</th>
                <th className="p-4 text-center">{t('Receipt Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700 font-medium">
              {filteredPayments.length > 0 ? (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">{new Date(pay.paymentDate).toLocaleString()}</td>
                    <td className="p-4 font-bold text-navy whitespace-nowrap">{pay.loan?.loanNumber || 'N/A'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold block text-gray-900">{`${pay.customer?.firstName || ''} ${pay.customer?.lastName || ''}`}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{pay.customer?.customerCode || 'N/A'}</span>
                    </td>
                    <td className="p-4 text-right font-bold font-mono whitespace-nowrap text-gray-900">₹{parseFloat(pay.paymentAmount || pay.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-navy/5 text-navy border border-navy/10 rounded-md font-bold text-[9px]">
                        {pay.paymentType}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                        pay.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        pay.paymentMethod === 'UPI' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">{pay.creator?.name || 'System Admin'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownloadReceipt(pay.id)}
                          title={t('Download PDF Receipt')}
                          className="p-2 bg-navy/5 text-navy hover:bg-navy/15 rounded-lg transition-colors"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(pay.id)}
                          title={t('Direct Print Receipt')}
                          className="p-2 bg-gold/10 text-gold-dark hover:bg-gold/25 rounded-lg transition-colors"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    <AlertCircle className="mx-auto mb-2 opacity-30 text-gray-300" size={32} />
                    {t('No payment collections found matching current filter queries.')}
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

export default LoanPaymentsCollection;
