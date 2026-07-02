import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Gem, 
  Calculator, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  TrendingUp,
  Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import { createLoan } from '../../store/slices/loanSlice';
import { toast } from 'react-toastify';
import CurrencyInput from '../../components/ui/CurrencyInput';

const CreateLoan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers } = useSelector((state) => state.customers);
  const { rates: liveRates } = useSelector((state) => state.liveRate);
  const { loading } = useSelector((state) => state.loans);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerId: '',
    goldWeight: '',
    goldPurity: '22',
    ornamentType: '',
    loanAmount: '',
    interestRate: '12',
    duration: '12',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchLiveRates());
  }, [dispatch]);

  const filteredCustomers = customers.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const calculateValuation = () => {
    if (!liveRates || !formData.goldWeight) return 0;
    const rate = formData.goldPurity === '24' ? liveRates.gold24k : 
                 formData.goldPurity === '22' ? liveRates.gold22k : 
                 liveRates.gold18k;
    return (parseFloat(formData.goldWeight) * Number(rate || 0)).toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createLoan({
        ...formData,
        customerId: selectedCustomer.id,
        loanAmount: parseFloat(formData.loanAmount)
      })).unwrap();
      toast.success('Gold Loan disbursed successfully!');
      navigate('/gold-finance');
    } catch (error) {
      toast.error(error || 'Failed to create loan');
    }
  };

  const steps = [
    { title: 'Select Customer', icon: <User size={20} /> },
    { title: 'Gold Details', icon: <Gem size={20} /> },
    { title: 'Loan Terms', icon: <Calculator size={20} /> },
    { title: 'Review', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back Header */}
      <button 
        onClick={() => navigate('/gold-finance')}
        className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors font-medium"
      >
        <ChevronLeft size={20} /> Back to Loans
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">New Gold Loan</h1>
          <p className="text-gray-500 mt-1">Disburse a new loan against gold ornaments.</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                step === idx + 1 ? 'bg-gold text-black shadow-gold' : 
                step > idx + 1 ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-dark-card text-gray-400'
              }`}>
                {step > idx + 1 ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              {idx < steps.length - 1 && <div className="w-4 h-[2px] bg-gray-200 dark:bg-dark-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Customer */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search customer by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="col-span-2 py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Enterprise Customers...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="col-span-2 py-20 flex flex-col items-center gap-6 bg-gray-50 dark:bg-dark-card rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-dark-border">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center text-gray-400">
                      <User size={32} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold">No customers found</h3>
                      <p className="text-sm text-gray-500 mt-1">Try a different search term or add a new customer.</p>
                    </div>
                    <button 
                      onClick={() => dispatch(fetchCustomers())}
                      className="px-6 py-2 bg-gold/10 text-gold font-bold rounded-xl hover:bg-gold hover:text-black transition-all"
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                        selectedCustomer?.id === c.id ? 'border-gold bg-gold/5 shadow-gold/10' : 'border-transparent bg-gray-50 dark:bg-dark-card hover:border-gray-200'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold">
                        {c.firstName?.[0]}{c.lastName?.[0] || 'C'}
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-gray-500">ID: {c.customerCode} • {c.mobileNumber}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  disabled={!selectedCustomer}
                  onClick={handleNext}
                  className="btn-gold px-12 py-4 flex items-center gap-2 text-lg disabled:opacity-50"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Gold Details */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Scale size={16} className="text-gold" /> Net Weight (Grams) *
                  </label>
                  <input 
                    type="number"
                    value={formData.goldWeight}
                    onChange={(e) => setFormData({...formData, goldWeight: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 px-6 outline-none transition-all text-xl"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp size={16} className="text-gold" /> Purity (Karat) *
                  </label>
                  <select 
                    value={formData.goldPurity}
                    onChange={(e) => setFormData({...formData, goldPurity: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 px-6 outline-none transition-all text-xl appearance-none"
                  >
                    <option value="24">24K (99.9%)</option>
                    <option value="22">22K (91.6%)</option>
                    <option value="20">20K (83.3%)</option>
                    <option value="18">18K (75.0%)</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Gem size={16} className="text-gold" /> Ornament Description *
                  </label>
                  <textarea 
                    value={formData.ornamentType}
                    onChange={(e) => setFormData({...formData, ornamentType: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 px-6 outline-none transition-all resize-none"
                    placeholder="e.g. Gold Necklace with Ruby Studs (2 Items)"
                    rows={3}
                  />
                </div>
              </div>

              {/* Live Valuation Box */}
              <div className="bg-gold/5 border border-gold/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Estimated Market Value</p>
                  <h2 className="text-4xl font-black">₹ {Number(calculateValuation()).toLocaleString()}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Live Rate: ₹{Number(liveRates?.gold24k || 0).toLocaleString()}/g (24K)</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">Calculated based on purity & weight</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={handlePrev} className="px-8 py-4 border border-gray-200 dark:border-dark-border rounded-2xl font-bold">Back</button>
                <button 
                  disabled={!formData.goldWeight || !formData.ornamentType}
                  onClick={handleNext} 
                  className="btn-gold px-12 py-4 flex items-center gap-2 disabled:opacity-50"
                >
                  Configure Loan <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Loan Terms */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Disbursement Amount (Principal) *</label>
                  <CurrencyInput 
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 px-6 outline-none transition-all text-xl font-bold text-gold"
                    placeholder="Enter amount"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Max LTV: 75% of Valuation (₹{(calculateValuation() * 0.75).toFixed(0)})</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Annual Interest Rate (%) *</label>
                  <input 
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-card border border-transparent focus:border-gold rounded-2xl py-4 px-6 outline-none transition-all text-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={handlePrev} className="px-8 py-4 border border-gray-200 dark:border-dark-border rounded-2xl font-bold">Back</button>
                <button 
                  disabled={!formData.loanAmount}
                  onClick={handleNext} 
                  className="btn-gold px-12 py-4 flex items-center gap-2 disabled:opacity-50"
                >
                  Final Review <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Final Review */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-gray-50 dark:bg-dark-card rounded-[2.5rem] p-10 border border-gray-100 dark:border-dark-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <Gem size={80} className="text-gold/10" />
                </div>
                
                <h3 className="text-2xl font-bold mb-8">Loan Disbursement Review</h3>
                
                <div className="grid grid-cols-2 gap-y-6 text-sm">
                   <div>
                     <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px] font-bold">Customer</p>
                     <p className="font-bold text-lg">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px] font-bold">Gold Valuation</p>
                     <p className="font-bold text-lg">₹ {calculateValuation()}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px] font-bold">Principal Amount</p>
                     <p className="font-bold text-lg text-gold">₹ {parseFloat(formData.loanAmount).toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 mb-1 uppercase tracking-wider text-[10px] font-bold">LTV Ratio</p>
                     <p className="font-bold text-lg">{((formData.loanAmount / calculateValuation()) * 100).toFixed(1)}%</p>
                   </div>
                </div>

                <div className="mt-10 p-6 bg-white dark:bg-dark-surface rounded-2xl flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <ShieldCheck className="text-green-500" size={18} />
                  By clicking Disburse Loan, you confirm that the gold ornaments have been verified and the valuation is accurate.
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={handlePrev} className="px-8 py-4 border border-gray-200 dark:border-dark-border rounded-2xl font-bold">Back</button>
                <button 
                  disabled={loading}
                  onClick={handleSubmit} 
                  className="btn-gold px-12 py-4 flex items-center gap-2 text-lg shadow-gold-lg"
                >
                  {loading ? 'Processing...' : 'Disburse Loan Now'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateLoan;
