import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const GoldValuationCard = ({ 
  purity, 
  weight, 
  rate, 
  requestedAmount, 
  eligibleAmount,
  estimatedGoldValue,
  loading 
}) => {
  // Safe numbers
  const safeWeight = Number(weight || 0);
  const safeRate = Number(rate || 0);
  const safeRequested = Number(requestedAmount || 0);
  const safeEligible = Number(eligibleAmount || 0);
  const safeValue = Number(estimatedGoldValue || 0);

  // Calculate LTV Percentage
  const ltvPercentage = safeValue > 0 ? (safeRequested / safeValue) * 100 : 0;
  const isOverLimit = safeRequested > safeEligible;

  if (loading) {
    return (
      <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10 animate-pulse space-y-4">
        <div className="h-6 bg-gold/10 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gold/10 rounded"></div>
          <div className="h-4 bg-gold/10 rounded"></div>
          <div className="h-4 bg-gold/10 rounded"></div>
          <div className="h-4 bg-gold/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gold/5 rounded-3xl border border-gold/10 space-y-4 shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h4 className="font-bold flex items-center gap-2 text-gold-dark">
          <Info size={18} /> Live Valuation Summary
        </h4>
        <span className="text-[10px] font-black uppercase tracking-widest bg-gold/20 text-gold-dark px-2 py-1 rounded-full">
          Real-time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
        <div className="flex justify-between items-center border-b border-gold/5 pb-2">
          <span className="text-sm text-gray-500">Current Rate ({purity})</span>
          <b className="text-gray-900 font-display">₹{safeRate > 0 ? safeRate.toLocaleString() : '0'}/g</b>
        </div>
        <div className="flex justify-between items-center border-b border-gold/5 pb-2">
          <span className="text-sm text-gray-500">Estimated Gold Value</span>
          <b className="text-gray-900 font-display">₹{safeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b>
        </div>
        <div className="flex justify-between items-center border-b border-gold/5 pb-2">
          <span className="text-sm text-green-600 font-semibold">Eligible Loan (75% LTV)</span>
          <b className="text-green-700 text-lg font-display">₹{safeEligible.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b>
        </div>
        <div className="flex justify-between items-center border-b border-gold/5 pb-2">
          <span className="text-sm text-gray-500">Requested Amount</span>
          <b className="text-gray-900 font-display">₹{safeRequested.toLocaleString()}</b>
        </div>
        <div className="flex justify-between items-center col-span-1 md:col-span-2 pt-1">
          <span className="text-sm text-gray-500">LTV Percentage</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${ltvPercentage > 75 ? 'bg-red-500' : 'bg-gold'}`} 
                style={{ width: `${Math.min(ltvPercentage, 100)}%` }}
              ></div>
            </div>
            <b className={`text-sm ${ltvPercentage > 75 ? 'text-red-500' : 'text-gray-900'}`}>
              {ltvPercentage.toFixed(1)}%
            </b>
          </div>
        </div>
      </div>

      {isOverLimit && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100"
        >
          <AlertCircle size={16} /> 
          <span>Requested amount exceeds eligible loan value of ₹{safeEligible.toLocaleString()}.</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoldValuationCard;
