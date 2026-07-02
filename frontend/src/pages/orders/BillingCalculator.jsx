import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Scale, Percent, Coins, Receipt, Hash, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import CurrencyInput from '../../components/ui/CurrencyInput';

const BillingCalculator = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { rates: liveRates, loading: ratesLoading, marketStatus, isLive } = useSelector((state) => state.liveRate);

  // Inputs
  const [inputs, setInputs] = useState({
    goldRate: '',
    netWeight: '',
    wastagePercentage: '',
    makingCharge: ''
  });

  const [selectedPurity, setSelectedPurity] = useState('22K');
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  useEffect(() => {
    dispatch(fetchLiveRates());
  }, [dispatch]);

  // Auto-fill Gold Rate when liveRates or selectedPurity changes (if not manually overridden)
  useEffect(() => {
    if (liveRates && !isManuallyEdited) {
      const key = `gold${selectedPurity.toLowerCase()}`;
      const rate = liveRates[key];
      if (rate && inputs.goldRate !== rate.toString()) {
        setInputs(prev => ({ ...prev, goldRate: rate.toString() }));
      }
    }
  }, [liveRates, selectedPurity, isManuallyEdited]);

  const handlePuritySelect = (purity) => {
    setSelectedPurity(purity);
    setIsManuallyEdited(false);
  };

  // Results
  const [results, setResults] = useState({
    wastageWeight: 0,
    totalWeight: 0,
    goldAmount: 0,
    goldGST: 0,
    makingGST: 0,
    totalGST: 0,
    finalAmount: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'goldRate') {
      setIsManuallyEdited(true);
    }

    // Allow empty string to easily clear inputs
    if (value === '') {
      setInputs(prev => ({ ...prev, [name]: '' }));
      return;
    }
    
    // Prevent negative numbers
    const numValue = parseFloat(value);
    if (numValue < 0) return;

    // Validate wastage percentage max 100
    if (name === 'wastagePercentage' && numValue > 100) return;

    setInputs(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const goldRate = parseFloat(inputs.goldRate) || 0;
    const netWeight = parseFloat(inputs.netWeight) || 0;
    const wastagePercentage = parseFloat(inputs.wastagePercentage) || 0;
    const makingCharge = parseFloat(inputs.makingCharge) || 0;

    // Step 1: wastageWeight = (netWeight * wastagePercentage) / 100
    const wastageWeight = (netWeight * wastagePercentage) / 100;

    // Step 2: totalWeight = netWeight + wastageWeight
    const totalWeight = netWeight + wastageWeight;

    // Step 3: goldAmount = totalWeight * goldRate
    const goldAmount = totalWeight * goldRate;

    // Step 4: goldGST = goldAmount * 3 / 100
    const goldGST = (goldAmount * 3) / 100;

    // Step 5: makingGST = makingCharge * 5 / 100
    const makingGST = (makingCharge * 5) / 100;

    // Step 6: totalGST = goldGST + makingGST
    const totalGST = goldGST + makingGST;

    // Step 7: finalAmount = goldAmount + makingCharge + totalGST
    const finalAmount = goldAmount + makingCharge + totalGST;

    setResults({
      wastageWeight,
      totalWeight,
      goldAmount,
      goldGST,
      makingGST,
      totalGST,
      finalAmount
    });
  }, [inputs]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <Calculator className="text-gold" size={32} /> {t('Billing')} <span className="text-gold">{t('Calculator')}</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">
            {t('Real-time standalone jewellery billing utility')}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* INPUTS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* PURITY SELECTOR */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
               {t('Select Gold Purity')}
             </h3>
             <div className="grid grid-cols-3 gap-3">
               {['24K', '22K', '18K'].map(purity => (
                 <button
                   key={purity}
                   onClick={() => handlePuritySelect(purity)}
                   className={`py-3 rounded-2xl font-black text-sm transition-all border ${
                     selectedPurity === purity 
                       ? 'bg-gold-gradient text-black border-transparent shadow-lg shadow-gold/20' 
                       : 'bg-gray-50 dark:bg-dark-card text-gray-500 border-gray-200 dark:border-dark-border hover:bg-gold/10 hover:text-gold hover:border-gold/30'
                   }`}
                 >
                   {purity}
                 </button>
               ))}
             </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
             <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Scale size={16} className="text-gold"/> {t('Entry Details')}
             </h3>
             
             <div className="space-y-5">
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase flex justify-between">
                   <span>{t('Gold Rate (per gram)')}</span>
                   <span className="text-gold">₹</span>
                 </label>
                 <CurrencyInput 
                   name="goldRate"
                   value={inputs.goldRate}
                   onChange={handleChange}
                   placeholder="e.g., 8,000"
                   className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold transition-all focus:ring-2 focus:ring-gold/50 outline-none"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase flex justify-between">
                   <span>{t('Net Weight')}</span>
                   <span className="text-gold">Grams (g)</span>
                 </label>
                 <input 
                   type="number" 
                   name="netWeight"
                   value={inputs.netWeight}
                   onChange={handleChange}
                   placeholder="e.g., 10"
                   className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold transition-all focus:ring-2 focus:ring-gold/50 outline-none"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase flex justify-between">
                   <span>{t('Wastage Percentage')}</span>
                   <span className="text-gold">%</span>
                 </label>
                 <input 
                   type="number" 
                   name="wastagePercentage"
                   value={inputs.wastagePercentage}
                   onChange={handleChange}
                   placeholder="e.g., 8"
                   max="100"
                   className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold transition-all focus:ring-2 focus:ring-gold/50 outline-none"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase flex justify-between">
                   <span>{t('Making Charge (Fixed Amount)')}</span>
                   <span className="text-gold">₹</span>
                 </label>
                 <CurrencyInput 
                   name="makingCharge"
                   value={inputs.makingCharge}
                   onChange={handleChange}
                   placeholder="e.g., 5,000"
                   className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold transition-all focus:ring-2 focus:ring-gold/50 outline-none"
                 />
               </div>

             </div>
             
             <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <p className="text-xs text-blue-800 dark:text-blue-400 font-medium">
                  <strong>{t('Note')}:</strong> {t('Values auto-calculate instantly as you type. Negative values are not permitted.')}
                </p>
             </div>
          </div>

          {/* LIVE MARKET RATE CARD */}
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                 {t('Live Market Rate')}
               </h3>
               {(!isLive || marketStatus === 'API ERROR') && (
                 <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-900/50">
                   <AlertCircle size={12} /> {t('Using Cached Rates')}
                 </span>
               )}
             </div>
             
             <div className="space-y-3">
               {[
                 { label: '24K Gold', value: liveRates?.gold24k },
                 { label: '22K Gold', value: liveRates?.gold22k },
                 { label: '18K Gold', value: liveRates?.gold18k }
               ].map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border/50 last:border-0">
                   <span className="text-gray-600 dark:text-gray-400 font-bold">{item.label}</span>
                   <span className="text-gray-900 dark:text-white font-black">{formatCurrency(item.value || 0)}</span>
                 </div>
               ))}
             </div>
             
             {liveRates?.updatedAt && (
               <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                 <Clock size={12} /> {t('Last Updated')}: {new Date(liveRates.updatedAt).toLocaleTimeString()}
               </div>
             )}
          </div>
        </motion.div>

        {/* RESULTS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Receipt size={16} className="text-gold"/> {t('Calculation Breakdown')}
            </h3>

            <div className="flex-1 space-y-4 font-medium text-sm">
              {/* Weights */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-dark-border">
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{t('Wastage Weight')}</p>
                   <p className="text-lg text-gray-900 dark:text-white font-black flex items-center gap-1">
                     {results.wastageWeight.toFixed(3)}<span className="text-xs text-gray-400 font-medium">g</span>
                   </p>
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{t('Total Weight (Net + Wastage)')}</p>
                   <p className="text-lg text-gold font-black flex items-center gap-1">
                     {results.totalWeight.toFixed(3)}<span className="text-xs text-gold/60 font-medium">g</span>
                   </p>
                 </div>
              </div>

              {/* Amounts */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border/50">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Coins size={14} className="text-gray-400"/> {t('Gold Amount')}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(results.goldAmount)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-border/50">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Coins size={14} className="text-gray-400"/> {t('Making Charge')}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(parseFloat(inputs.makingCharge) || 0)}</span>
                </div>
              </div>

              {/* GST Breakdown */}
              <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-4 space-y-3 mt-4 border border-gray-100 dark:border-dark-border">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Percent size={12}/> {t('GST Breakdown')}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('Gold GST (3%)')}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(results.goldGST)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t('Making GST (5%)')}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(results.makingGST)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-dark-border">
                  <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">{t('Total GST')}</span>
                  <span className="text-gold font-black text-sm">{formatCurrency(results.totalGST)}</span>
                </div>
              </div>

            </div>

            {/* Final Total Box */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center bg-gold-gradient rounded-2xl p-6 shadow-xl shadow-gold/20 shrink-0">
               <div>
                 <p className="text-black/70 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                   <Hash size={14}/> {t('Final Amount')}
                 </p>
                 <h2 className="text-3xl md:text-4xl font-black text-black mt-1">{formatCurrency(results.finalAmount)}</h2>
               </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BillingCalculator;
