import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createLoan, fetchLoans } from '../../store/slices/loanSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import goldLoanApi from '../../api/goldLoan.api';
import { 
  User, 
  Gem, 
  Coins, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Download,
  FileText,
  XCircle,
  Clock,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import Input from '../../components/ui/Input';
import { toast } from 'react-toastify';
import walkInApi from '../../api/walkIn.api';
import WalkInCustomerModal from './WalkInCustomerModal';

import { Controller } from 'react-hook-form';
import CurrencyInput from '../../components/ui/CurrencyInput';

const loanSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  goldType: z.string().min(1, "Gold type is required"),
  ornamentType: z.string().min(1, "Ornament type is required"),
  goldWeight: z.string().min(1, "Weight is required"),
  goldPurity: z.string().min(1, "Purity is required"),
  marketRate: z.union([z.string(), z.number()]).refine(val => String(val).trim() !== "", "Market rate is required"),
  loanAmount: z.union([z.string(), z.number()]).refine(val => String(val).trim() !== "", "Loan amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  duration: z.string().min(1, "Duration is required"),
});

const CreateLoan = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('disburse');
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const { loans = [], loading } = useSelector((state) => state.loans);

  // Walk-in Process States
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loan Lifecycle History States
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Close and Release States
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleWalkInSuccess = (newCustomer) => {
    dispatch(fetchCustomers());
    setValue('customerId', newCustomer.id);
    setStep(2);
  };

  const handleViewHistory = async (loan) => {
    setSelectedLoan(loan);
    setHistoryLoading(true);
    setIsHistoryOpen(true);
    try {
      const res = await goldLoanApi.fetchLoanHistory(loan.id);
      setHistory(res.data.data || []);
    } catch (err) {
      toast.error(t('Failed to load history logs'));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    setActionLoading(true);
    try {
      await goldLoanApi.closeLoan(selectedLoan.id, { remarks: 'Loan closed from admin dashboard' });
      toast.success(t('Loan Closed Successfully'));
      setIsCloseModalOpen(false);
      dispatch(fetchLoans());
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to close loan'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRelease = async () => {
    setActionLoading(true);
    try {
      await goldLoanApi.releaseOrnament(selectedLoan.id, { releaseNotes: 'Ornament released from admin dashboard' });
      toast.success(t('Ornament Released Successfully'));
      setIsReleaseModalOpen(false);
      dispatch(fetchLoans());
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to release ornament'));
    } finally {
      setActionLoading(false);
    }
  };

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      goldType: "ORNAMENTS",
      goldPurity: "22K",
      interestRate: "12",
      duration: "12",
      marketRate: "6800"
    }
  });

  const watchWeight = watch('goldWeight');
  const watchMarketRate = watch('marketRate');
  const [estimatedValue, setEstimatedValue] = useState(0);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchLoans());
  }, [dispatch]);

  useEffect(() => {
    if (watchWeight && watchMarketRate) {
      const val = parseFloat(watchWeight) * parseFloat(watchMarketRate);
      setEstimatedValue(val);
      // Automatically suggest 75% LTV (Loan to Value)
      setValue('loanAmount', (val * 0.75).toFixed(0));
    }
  }, [watchWeight, watchMarketRate, setValue]);

  const onSubmit = async (data) => {
    console.log('[AdminCreateLoan] Submitting Payload:', data);
    
    const selectedCustomer = customers.find(c => c.id === data.customerId);
    const isWalkIn = selectedCustomer && selectedCustomer.customerType === 'WALK_IN';

    if (isWalkIn) {
      setIsSubmitting(true);
      try {
        await walkInApi.createLoan({
          customerId: data.customerId,
          goldType: data.goldType,
          ornamentType: data.ornamentType,
          goldWeight: data.goldWeight,
          goldPurity: data.goldPurity,
          loanAmount: data.loanAmount,
          interestRate: data.interestRate,
          duration: data.duration,
          marketRate: data.marketRate
        });
        toast.success(t('Walk-in Gold Loan Disbursed Successfully!'));
        setStep(4);
        dispatch(fetchLoans());
      } catch (err) {
        toast.error(err.response?.data?.message || t('Failed to disburse walk-in loan'));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const result = await dispatch(createLoan(data));
      if (createLoan.fulfilled.match(result)) {
        toast.success(t('Gold Loan Created Successfully!'));
        setStep(4);
        dispatch(fetchLoans()); // Refresh ledger list
      } else {
        toast.error(t(result.payload) || t('Failed to create loan'));
      }
    }
  };

  const handleDownloadInvoice = async (loanId) => {
    try {
      const response = await goldLoanApi.fetchLoanInvoices(loanId);
      const invoices = response.data.data;
      if (invoices && invoices.length > 0) {
        const invId = invoices[0].id;
        const pdfResponse = await goldLoanApi.downloadInvoicePDF(invId);
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));
        window.open(url, '_blank');
        toast.success(t('Invoice downloaded successfully!'));
      } else {
        toast.error(t('No invoice found for this loan'));
      }
    } catch (err) {
      toast.error(t('Failed to download invoice'));
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const filteredLoans = loans.filter(l => 
    l.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.mobileNumber?.includes(searchTerm)
  );

  const getDisplayedLoans = () => {
    switch (activeTab) {
      case 'active':
        return filteredLoans.filter(l => l.status === 'ACTIVE');
      case 'ready':
        return filteredLoans.filter(l => l.status === 'READY_FOR_CLOSURE');
      case 'closed':
        return filteredLoans.filter(l => l.status === 'CLOSED' || l.status === 'LOAN_CLOSED' || l.status === 'ORNAMENT_RELEASED' || l.loan_closed === true || l.loanClosed === true);
      case 'released':
        return filteredLoans.filter(l => l.status === 'ORNAMENT_RELEASED');
      default:
        return filteredLoans;
    }
  };

  const displayedLoans = getDisplayedLoans();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12}/> {t('Active')}</span>;
      case 'CLOSED':
      case 'LOAN_CLOSED':
        return <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 flex items-center gap-1.5 w-fit"><CheckCircle size={12}/> {t('Closed')}</span>;
      case 'ORNAMENT_RELEASED':
        return <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-100 flex items-center gap-1.5 w-fit"><Gem size={12}/> {t('Released')}</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-teal-100 flex items-center gap-1.5 w-fit"><Clock size={12}/> {t('Pre-Approved')}</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1.5 w-fit"><Clock size={12}/> {t('Pending')}</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-1.5 w-fit"><XCircle size={12}/> {t('Rejected')}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 w-fit">{t(status)}</span>;
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Title */}
      <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{t('Gold Loan Management')}</h1>
          <p className="text-gray-500 mt-2">{t('Create new gold loans and view full disbursement ledger.')}</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex border-b border-gray-100 dark:border-dark-border mb-8 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('disburse')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'disburse' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Disburse New Loan')}
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'active' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Active Loans')}
        </button>
        <button 
          onClick={() => setActiveTab('ready')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'ready' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Ready For Closure')}
        </button>
        <button 
          onClick={() => setActiveTab('closed')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'closed' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Closed History')}
        </button>
        <button 
          onClick={() => setActiveTab('released')}
          className={`flex-shrink-0 px-6 py-4 text-center font-black uppercase tracking-wider text-xs border-b-2 transition-all ${
            activeTab === 'released' ? 'border-gold text-gold border-b-gold font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('Ornament Released')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'disburse' ? (
          <motion.div 
            key="disburseTab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Progress Bar */}
            {step < 4 && (
              <div className="flex items-center justify-between px-12 relative max-w-xl mx-auto">
                <div className="absolute top-1/2 left-12 right-12 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= i ? 'bg-gold text-black shadow-gold' : 'bg-white text-gray-400 border-2 border-gray-100'
                  }`}>
                    {step > i ? <CheckCircle size={20} /> : i}
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] max-w-4xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <User size={20} className="text-gold" /> {t('Customer Selection')}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 block mb-2">{t('Select Registered Customer')}</label>
                            <select {...register('customerId')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 ring-gold/20">
                              <option value="">{t('-- Choose Customer --')}</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.firstName} {c.lastName} ({c.customerCode}){c.customerType === 'WALK_IN' ? ` [${t('Walk-in')}]` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:self-end">
                            <button
                              type="button"
                              onClick={() => setIsWalkInModalOpen(true)}
                              className="w-full sm:w-auto bg-black text-white hover:bg-gold hover:text-black font-bold py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                            >
                              <span>+ {t('Create New Customer')}</span>
                            </button>
                          </div>
                        </div>
                        {errors.customerId && <p className="text-red-500 text-xs">{t(errors.customerId.message)}</p>}
                      </div>
                      <div className="pt-6 flex justify-end">
                        <button type="button" onClick={nextStep} className="btn-gold flex items-center gap-2">
                          {t('Jewelry Details')} <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Gem size={20} className="text-gold" /> {t('Jewelry & Valuation')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-sm font-bold">{t('Gold Type')}</label>
                          <select {...register('goldType')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 ring-gold/20">
                            <option value="ORNAMENTS">{t('Ornaments')}</option>
                            <option value="BARS">{t('Gold Bars')}</option>
                            <option value="COINS">{t('Gold Coins')}</option>
                          </select>
                        </div>
                        <Input label={t('Ornament Type')} {...register('ornamentType')} placeholder="e.g. Bangles, Necklace" error={errors.ornamentType?.message ? t(errors.ornamentType.message) : undefined} />
                        <Input label={t('Net Weight (Grams)')} type="number" step="0.01" {...register('goldWeight')} placeholder="0.00" error={errors.goldWeight?.message ? t(errors.goldWeight.message) : undefined} />
                        <div className="space-y-1">
                          <label className="text-sm font-bold">{t('Gold Purity')}</label>
                          <select {...register('goldPurity')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none focus:ring-2 ring-gold/20">
                            <option value="22K">22K Gold (916)</option>
                            <option value="24K">24K Gold</option>
                            <option value="18K">18K Gold</option>
                          </select>
                        </div>
                        <Controller
                          name="marketRate"
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput label={t('Current Market Rate (per gram)')} {...field} error={errors.marketRate?.message ? t(errors.marketRate.message) : undefined} />
                          )}
                        />
                      </div>

                      <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10">
                        <p className="text-sm text-gold font-bold uppercase tracking-wider">{t('Estimated Gold Value')}</p>
                        <h4 className="text-3xl font-black mt-1">₹ {estimatedValue.toLocaleString()}</h4>
                      </div>

                      <div className="pt-6 flex justify-between">
                        <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-500 font-bold"><ChevronLeft size={18} /> {t('Back')}</button>
                        <button type="button" onClick={nextStep} className="btn-gold flex items-center gap-2">{t('Financials')} <ChevronRight size={18} /></button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Coins size={20} className="text-gold" /> {t('Loan Financials')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                          name="loanAmount"
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput label={t('Final Loan Amount (₹)')} {...field} error={errors.loanAmount?.message ? t(errors.loanAmount.message) : undefined} />
                          )}
                        />
                        <Input label={t('Interest Rate (% per annum)')} type="number" {...register('interestRate')} error={errors.interestRate?.message ? t(errors.interestRate.message) : undefined} />
                        <Input label={t('Duration (Months)')} type="number" {...register('duration')} error={errors.duration?.message ? t(errors.duration.message) : undefined} />
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">{t('Monthly Interest')}</p>
                          <p className="text-lg font-bold">₹ {((parseFloat(watch('loanAmount') || 0) * parseFloat(watch('interestRate') || 0)) / 1200).toFixed(0)}</p>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-between">
                        <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-500 font-bold"><ChevronLeft size={18} /> {t('Back')}</button>
                        <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 px-12">
                          {loading ? <Loader2 className="animate-spin" /> : <>{t('Disburse Loan')} <CheckCircle size={18} /></>}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                      <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                        <CheckCircle size={40} />
                      </div>
                      <h2 className="text-3xl font-bold">{t('Loan Disbursed!')}</h2>
                      <p className="text-gray-500">{t('The loan has been successfully registered and disbursed directly in the shop.')}</p>
                      <div className="flex justify-center gap-4 pt-6">
                        <button type="button" onClick={() => { setStep(1); }} className="px-8 py-3 bg-gray-100 rounded-xl font-bold">{t('Create Another')}</button>
                        <button type="button" onClick={() => setActiveTab('ledger')} className="btn-gold px-8 py-3">{t('View in Ledger')}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ledgerTab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-sm">
              <div className="relative w-full sm:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('Search by Loan #, Customer...')}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 outline-none text-sm focus:ring-2 ring-gold/20"
                />
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {t('Total Records:')} {displayedLoans.length}
              </div>
            </div>

            {/* Ledger Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-dark-card/50">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Loan #')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Customer')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Gold Valuation')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Disbursed Amount')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Remaining Balance')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Status')}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {displayedLoans.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-8 py-20 text-center text-gray-500 font-medium">
                          {t('No gold loans found in this category.')}
                        </td>
                      </tr>
                    ) : (
                      displayedLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-black text-sm">{loan.loanNumber}</p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(loan.loanDate || loan.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-bold text-sm">{loan.customerName || `${loan.customer?.firstName} ${loan.customer?.lastName}`}</p>
                            <p className="text-xs text-gray-500">{loan.mobileNumber || loan.customer?.mobileNumber}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-bold">{loan.goldPurity} Gold ({loan.goldWeight}g)</p>
                            <p className="text-[10px] text-gold font-bold">₹{Number(loan.goldValue || 0).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-black text-gray-900">₹{Number(loan.principalAmount || loan.loanAmount).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-black text-amber-600">₹{Number(loan.remainingPrincipal !== undefined ? loan.remainingPrincipal : loan.loanAmount).toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-5">
                            {getStatusBadge(loan.status)}
                          </td>
                          <td className="px-8 py-5 text-center flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleViewHistory(loan)}
                              className="p-2.5 bg-gray-50 hover:bg-gold hover:text-black rounded-xl transition-all"
                              title={t('View Loan History Timeline')}
                            >
                              <Clock size={16} />
                            </button>
                            {(loan.status === 'ACTIVE' || loan.status === 'CLOSED' || loan.status === 'LOAN_CLOSED' || loan.status === 'READY_FOR_CLOSURE' || loan.status === 'ORNAMENT_RELEASED') ? (
                              <button 
                                onClick={() => handleDownloadInvoice(loan.id)}
                                className="p-2.5 bg-gray-50 hover:bg-black hover:text-white rounded-xl transition-all"
                                title={t('Download Invoice')}
                              >
                                <Download size={16} />
                              </button>
                            ) : null}
                            {loan.status === 'READY_FOR_CLOSURE' && (
                              <button 
                                onClick={() => { setSelectedLoan(loan); setIsCloseModalOpen(true); }}
                                className="px-4 py-2 bg-amber-500 text-black hover:bg-amber-600 rounded-xl transition-all font-bold text-xs"
                              >
                                {t('Close Loan')}
                              </button>
                            )}
                            {(loan.status === 'CLOSED' || loan.status === 'LOAN_CLOSED') && (
                              <button 
                                onClick={() => { setSelectedLoan(loan); setIsReleaseModalOpen(true); }}
                                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-all font-bold text-xs"
                              >
                                {t('Release Ornament')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Timeline Drawer Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Drawer Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-dark-card shadow-2xl p-8 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{t('Loan Lifecycle History')}</h3>
                  <p className="text-xs text-gray-400 font-bold">{selectedLoan?.loanNumber} • {selectedLoan?.customerName || (selectedLoan?.customer?.firstName + ' ' + selectedLoan?.customer?.lastName)}</p>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="flex-1">
                 {historyLoading ? (
                    <div className="py-20 text-center">
                      <Loader2 className="animate-spin text-gold mx-auto" size={24} />
                    </div>
                 ) : history.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 font-medium">
                      {t('No history logs found for this loan.')}
                    </div>
                 ) : (
                    <div className="relative pl-6 space-y-8 border-l-2 border-gold/20 ml-2">
                       {history.map((h) => {
                          let icon = <Clock size={12} />;
                          let color = 'bg-amber-500 text-black';
                          let labelEn = h.action;
                          let labelTa = '';
                          
                          if (h.action === 'REQUEST_CREATED') {
                            icon = <FileText size={12} className="text-black" />;
                            color = 'bg-amber-400 text-black';
                            labelEn = 'Request Submitted';
                            labelTa = 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது';
                          } else if (h.action === 'ADMIN_APPROVED') {
                            icon = <ShieldCheck size={12} className="text-white" />;
                            color = 'bg-blue-600 text-white';
                            labelEn = 'Online Pre-Approved';
                            labelTa = 'முன் அனுமதி வழங்கப்பட்டது';
                          } else if (h.action === 'CUSTOMER_VISITED_SHOP') {
                            icon = <User size={12} className="text-white" />;
                            color = 'bg-purple-600 text-white';
                            labelEn = 'Shop Visit Verification';
                            labelTa = 'நேரடி நகைச் சரிபார்ப்பு';
                          } else if (h.action === 'LOAN_DISBURSED') {
                            icon = <Coins size={12} className="text-black" />;
                            color = 'bg-emerald-400 text-black';
                            labelEn = 'Loan Fully Disbursed';
                            labelTa = 'கடன் வழங்கப்பட்டது';
                          } else if (h.action === 'INTEREST_PAID') {
                            icon = <CreditCard size={12} className="text-white" />;
                            color = 'bg-indigo-600 text-white';
                            labelEn = 'Repayment Received';
                            labelTa = 'தவணை செலுத்தப்பட்டது';
                          } else if (h.action === 'CLOSED') {
                            icon = <CheckCircle size={12} className="text-white" />;
                            color = 'bg-gray-800 text-white';
                            labelEn = 'Loan Closed';
                            labelTa = 'கணக்கு மூடப்பட்டது';
                          }

                          return (
                            <div key={h.id} className="relative">
                              <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${color} shadow-md`}>
                                {icon}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-black text-sm text-gray-900">{labelEn}</p>
                                  <p className="text-[10px] text-gray-400 font-bold">
                                    {new Date(h.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {labelTa && (
                                  <p className="text-xs text-gold font-bold italic">{labelTa}</p>
                                )}
                                {h.remarks && (
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">{h.remarks}</p>
                                )}
                              </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WalkInCustomerModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={handleWalkInSuccess}
      />
      {/* Close Loan Confirmation Modal */}
      <AnimatePresence>
        {isCloseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">{t('Close Loan')}</h3>
              <p className="text-gray-500 text-center mb-8">
                {t('Are you sure you want to close this loan?')} <br />
                <span className="font-bold text-black dark:text-white">{selectedLoan?.loanNumber}</span>
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCloseModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold transition-all"
                >
                  {t('Cancel')}
                </button>
                <button 
                  onClick={handleConfirmClose}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {actionLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> {t('Closing Loan...')}</>
                  ) : (
                    t('Confirm Closure')
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Release Ornament Confirmation Modal */}
      <AnimatePresence>
        {isReleaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gem size={32} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">{t('Release Ornament')}</h3>
              <p className="text-gray-500 text-center mb-8">
                {t('Are you sure you want to release the ornament for this loan?')} <br />
                <span className="font-bold text-black dark:text-white">{selectedLoan?.loanNumber}</span>
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold transition-all"
                >
                  {t('Cancel')}
                </button>
                <button 
                  onClick={handleConfirmRelease}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {actionLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> {t('Releasing...')}</>
                  ) : (
                    t('Release Ornament')
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateLoan;
