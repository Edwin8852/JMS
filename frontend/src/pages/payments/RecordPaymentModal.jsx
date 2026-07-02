import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, User, IndianRupee, Wallet, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createPayment } from '../../store/slices/paymentSlice';
import { fetchLoans } from '../../store/slices/loanSlice';
import { toast } from 'react-toastify';

const schema = z.object({
  loanId: z.string().min(1, 'Please select a loan'),
  paymentAmount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER']),
  description: z.string().optional(),
});

const RecordPaymentModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loans } = useSelector((state) => state.loans);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchLoans({ status: 'ACTIVE' }));
    }
  }, [isOpen, dispatch]);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'CASH',
    }
  });

  const watchedLoanId = watch('loanId');

  useEffect(() => {
    const loan = loans.find(l => l.id === watchedLoanId);
    setSelectedLoan(loan);
    if (loan) {
      // Default to monthly interest or some amount? 
      // User will enter manually usually
    }
  }, [watchedLoanId, loans]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createPayment(data)).unwrap();
      toast.success('Payment recorded successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to record payment');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gold-gradient">
              <div className="text-gray-900">
                <h2 className="text-2xl font-bold">Record Payment</h2>
                <p className="text-gray-700 text-sm">Update loan repayment and generate invoice.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-full text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Select Loan */}
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <CreditCard size={16} className="text-gold" /> Select Active Loan
                </label>
                <select
                  {...register('loanId')}
                  className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all appearance-none"
                >
                  <option value="">Choose a loan...</option>
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.loanCode} - {loan.customer?.firstName} {loan.customer?.lastName}
                    </option>
                  ))}
                </select>
                {errors.loanId && <p className="text-red-500 text-xs">{errors.loanId.message}</p>}
              </div>

              {selectedLoan && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gold/5 rounded-2xl p-4 border border-gold/10 grid grid-cols-2 gap-4"
                >
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Remaining Principal</p>
                    <p className="text-lg font-bold text-gold">₹ {selectedLoan.remainingPrincipal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Monthly Interest</p>
                    <p className="text-lg font-bold text-gold">₹ {selectedLoan.monthlyInterest?.toLocaleString()}</p>
                  </div>
                </motion.div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <IndianRupee size={16} className="text-gold" /> Payment Amount
                </label>
                <input
                  {...register('paymentAmount', { valueAsNumber: true })}
                  type="number"
                  placeholder="Enter amount to pay"
                  className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-3 px-4 outline-none transition-all"
                />
                {errors.paymentAmount && <p className="text-red-500 text-xs">{errors.paymentAmount.message}</p>}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Wallet size={16} className="text-gold" /> Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CASH', 'UPI', 'BANK_TRANSFER'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setValue('paymentMethod', method)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        watch('paymentMethod') === method 
                        ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20' 
                        : 'bg-gray-50 dark:bg-dark-card border-transparent text-gray-500 hover:border-gold'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-gray-200 dark:border-dark-border rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-4 bg-gold-gradient text-black rounded-2xl font-bold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RecordPaymentModal;
