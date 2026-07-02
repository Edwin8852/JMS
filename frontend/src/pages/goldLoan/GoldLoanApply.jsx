import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gem, 
  Coins, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { applyGoldLoan } from '../../store/slices/goldLoanSlice';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { fetchKycStatus } from '../../store/slices/kycSlice';
import { toast } from 'react-toastify';
import GoldValuationCard from '../../components/goldLoan/GoldValuationCard';
import CurrencyInput from '../../components/ui/CurrencyInput';

const GoldLoanApply = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goldType: 'ORNAMENTS',
    ornamentType: 'Chain',
    goldWeight: '',
    goldPurity: '22K',
    requestedAmount: '',
    remarks: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: loanLoading } = useSelector(state => state.goldLoan);
  const { rates: liveRates, loading: rateLoading } = useSelector(state => state.liveRate);
  const { status: kycStatus, isVerified: isKycVerified, loading: kycLoading } = useSelector(state => state.kyc);

  useEffect(() => {
    dispatch(fetchLiveRates());
    dispatch(fetchKycStatus());
    
    const interval = setInterval(() => dispatch(fetchLiveRates()), 300000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Dynamic Valuation Logic
  const currentRate = formData.goldPurity === '24K' 
    ? liveRates.gold24k 
    : formData.goldPurity === '22K' 
    ? liveRates.gold22k 
    : liveRates.gold18k;

  const estimatedGoldValue = Number(formData.goldWeight || 0) * Number(currentRate || 0);
  const eligibleLoanAmount = estimatedGoldValue * 0.75; // 75% LTV

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = async () => {
    console.log('[GoldLoanApply] Attempting to submit form data:', formData);

    if (!isKycVerified) {
      toast.error('KYC Verification required before applying for a loan.');
      return;
    }

    if (!formData.goldWeight || !formData.requestedAmount) {
      toast.error('Please fill in all required fields (Weight and Amount)');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        marketRateAtTime: currentRate,
        estimatedValue: estimatedGoldValue,
        eligibleAmount: eligibleLoanAmount
      };
      
      console.log('[GoldLoanApply] Final Submission Payload:', submissionData);

      await dispatch(applyGoldLoan(submissionData)).unwrap();
      toast.success('Application submitted successfully!');
      setStep(2);
    } catch (err) {
      console.error('[GoldLoanApply] Submission Failed:', err);
      toast.error(err || 'Failed to submit application');
    }
  };


  return (
    <div className="w-full space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold">Apply for Gold Loan</h1>
          <p className="text-gray-500">Submit your request and visit our branch for physical verification.</p>
        </div>
      </div>

      {!isKycVerified && !kycLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-[2.5rem] border-red-100 bg-red-50/50 flex flex-col md:flex-row items-center justify-between gap-6"
        >
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-600">
                 <ShieldAlert size={32} />
              </div>
              <div className="space-y-1">
                 <h4 className="font-black text-lg text-red-900">Identity Verification Required</h4>
                 <p className="text-sm text-red-700 font-medium max-w-xs">
                    {kycStatus === 'PENDING' 
                      ? 'Your KYC verification is currently pending. Please wait for admin approval.' 
                      : 'Please complete your KYC verification before applying for a gold loan.'}
                 </p>
              </div>
           </div>
           {kycStatus !== 'PENDING' && (
             <button 
               onClick={() => navigate('/customer/kyc-verification')}
               className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-200 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
             >
                Complete KYC <ArrowRight size={18} />
             </button>
           )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-8 ${!isKycVerified ? 'opacity-50 pointer-events-none grayscale' : ''}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Gem size={16} className="text-gold" /> Gold Category
                </label>
                <select 
                  name="goldType"
                  value={formData.goldType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-gold/20 font-bold"
                >
                  <option value="ORNAMENTS">Ornaments (Jewelry)</option>
                  <option value="BARS">Gold Bars</option>
                  <option value="COINS">Gold Coins</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Gem size={16} className="text-gold" /> Ornament Type
                </label>
                <select 
                  name="ornamentType"
                  value={formData.ornamentType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-gold/20 font-bold"
                >
                  <option value="Chain">Chain</option>
                  <option value="Ring">Ring</option>
                  <option value="Bracelet">Bracelet</option>
                  <option value="Coin">Coin</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Other">Other</option>
                </select>
              </div>


              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Gem size={16} className="text-gold" /> Gold Purity
                </label>
                <div className="flex gap-3">
                  {['18K', '22K', '24K'].map(p => (
                    <button
                      key={p}
                      onClick={() => setFormData(prev => ({ ...prev, goldPurity: p }))}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        formData.goldPurity === p 
                        ? 'bg-gold text-black shadow-gold' 
                        : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Estimated Gold Weight (Grams)</label>
                <input 
                  type="number" 
                  name="goldWeight"
                  value={formData.goldWeight}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-gold/20 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Requested Loan Amount (₹)</label>
                <CurrencyInput 
                  name="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={handleInputChange}
                  placeholder="Amount you need"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-gold/20 font-bold text-lg"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold">Remarks (Optional)</label>
                <textarea 
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Describe your ornaments or additional info..."
                  rows="3"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-gold/20 resize-none font-medium"
                />
              </div>
            </div>

            {/* Live Valuation Summary */}
            {(formData.goldWeight || formData.requestedAmount) && (
              <GoldValuationCard 
                purity={formData.goldPurity}
                weight={formData.goldWeight}
                rate={currentRate}
                requestedAmount={formData.requestedAmount}
                eligibleAmount={eligibleLoanAmount}
                estimatedGoldValue={estimatedGoldValue}
                loading={rateLoading}
              />
            )}

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
              <Info className="text-blue-500 shrink-0" size={24} />
              <p className="text-sm text-blue-700 leading-relaxed">
                Final loan amount and interest will be determined by our admin after physical gold validation at the branch.
              </p>
            </div>

            <button 
              disabled={loanLoading || !formData.goldWeight || !formData.requestedAmount || !isKycVerified}
              onClick={handleApply}
              className="w-full btn-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-xl shadow-gold/20"
            >
              {loanLoading ? <Loader2 className="animate-spin" /> : <>Submit Request <CheckCircle size={20} /></>}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-20"
          >
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/20">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-black">Request Submitted!</h2>
              <p className="text-gray-500 max-w-md mx-auto text-lg font-medium">
                Your application has been received. Please visit our nearest branch with your gold for physical verification.
              </p>
            </div>
            <button 
              onClick={() => navigate('/customer/dashboard')}
              className="btn-gold px-12 py-5 rounded-2xl font-black shadow-lg shadow-gold/20"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoldLoanApply;
