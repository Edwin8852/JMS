import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setLoanApplication, clearLoanApplication } from '../../store/slices/loanSlice';
import loanApi from '../../api/loan.api';
import { 
  Gem, 
  Coins, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const loanSchema = z.object({
  ornamentType: z.string().min(1, "Ornament type is required"),
  goldType: z.string().min(1, "Gold type is required"),
  goldWeight: z.string().min(1, "Weight is required"),
  goldPurity: z.string().min(1, "Purity is required"),
  loanAmount: z.string().min(1, "Requested amount is required"),
  jewelryDetails: z.string().optional(),
});

const LoanApplication = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedLoan, setSubmittedLoan] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      goldPurity: "22K"
    }
  });

  // Watch form values for Review step
  const formData = watch();
  const { loanApplication } = useSelector(state => state.loans);

  const handleNextStep = () => {
    dispatch(setLoanApplication(formData));
    setStep(2);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        goldWeight: parseFloat(data.goldWeight),
        loanAmount: parseFloat(data.loanAmount),
        customerId: user.id
      };
      
      const response = await loanApi.applyLoan(payload);
      
      if (response.data.success) {
        toast.success('Loan application submitted!');
        dispatch(clearLoanApplication());
        setSubmittedLoan(response.data.data); // Add state for this
        reset();
        setStep(3);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex items-center gap-4">
          <Link to="/customer/services" className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold">Apply for Gold Loan</h1>
            <p className="text-gray-500">Provide details about your gold jewelry to get an estimate.</p>
          </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-4">
          {[1, 2].map(i => (
              <div key={i} className={`h-1 w-12 rounded-full ${step >= i ? 'bg-gold' : 'bg-gray-200'}`} />
          ))}
      </div>

      <div className="glass-card p-10 rounded-[3rem]">
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Ornament Type</label>
                        <input {...register('ornamentType')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none" placeholder="e.g. Necklace, Bangles" />
                        {errors.ornamentType && <p className="text-red-500 text-xs">{errors.ornamentType.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Gold Item Type</label>
                        <select {...register('goldType')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none">
                            <option value="ORNAMENTS">Jewelry / Ornaments</option>
                            <option value="COINS">Gold Coins</option>
                            <option value="BARS">Gold Bars</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Net Gold Weight (Grams)</label>
                        <input type="number" step="0.01" {...register('goldWeight')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none" placeholder="0.00" />
                        {errors.goldWeight && <p className="text-red-500 text-xs">{errors.goldWeight.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Gold Purity</label>
                        <select {...register('goldPurity')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none">
                            <option value="22K">22K Gold (916)</option>
                            <option value="24K">24K Gold</option>
                            <option value="18K">18K Gold</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Requested Loan Amount (₹)</label>
                        <input type="number" {...register('loanAmount')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none" placeholder="Amount you need" />
                        {errors.loanAmount && <p className="text-red-500 text-xs">{errors.loanAmount.message}</p>}
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm font-bold">Jewelry Details / Condition</label>
                        <textarea {...register('jewelryDetails')} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 outline-none h-24" placeholder="Describe the items, condition, or any hallmarks..." />
                    </div>
                </div>

                <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10 flex gap-4">
                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <p className="text-sm text-gray-600">
                        Our representative will call you for physical verification of the gold once the application is submitted.
                    </p>
                </div>

                <button type="button" onClick={handleNextStep} className="w-full btn-gold py-4 rounded-2xl flex items-center justify-center gap-2">
                    Review Application <ChevronRight size={18} />
                </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Review Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-500 font-bold uppercase">Ornament</p>
                            <p className="font-bold">{formData.ornamentType || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-500 font-bold uppercase">Weight</p>
                            <p className="font-bold">{formData.goldWeight || '0'} g</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-500 font-bold uppercase">Purity</p>
                            <p className="font-bold">{formData.goldPurity || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-gold/10 rounded-2xl">
                            <p className="text-xs text-gold-dark font-bold uppercase">Requested Amount</p>
                            <p className="font-bold text-lg">₹ {parseFloat(formData.loanAmount || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold flex items-center justify-center gap-2">
                        <ChevronLeft size={18} /> Edit
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] btn-gold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-gold/20">
                        {loading ? <Loader2 className="animate-spin" /> : <>Confirm & Submit <CheckCircle size={18} /></>}
                    </button>
                </div>
            </motion.div>
          )}

          {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-10">
                  <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                      <CheckCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-bold">Application Submitted!</h2>
                  <p className="text-gray-500">Your loan application ID is <b>{submittedLoan?.loanNumber || 'PENDING'}</b>. We will contact you shortly for the next steps.</p>
                  <button type="button" onClick={() => navigate('/customer/dashboard')} className="btn-gold px-12 py-4 rounded-2xl">
                      Back to Dashboard
                  </button>
              </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoanApplication;
