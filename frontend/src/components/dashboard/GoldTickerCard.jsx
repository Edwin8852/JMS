import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MiniTrendChart from './MiniTrendChart';

const GoldTickerCard = ({ label, value, change, percentage, isUp = true }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative min-w-[240px] flex-shrink-0 h-[75px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex flex-col justify-between overflow-hidden group shadow-lg transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:border-gold/40"
    >
      {/* Background Glow Effect */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${isUp ? 'bg-green-400' : 'bg-red-400'}`} />
      
      {/* Premium Border Gradient overlay */}
      <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none group-hover:border-gold/30 transition-colors duration-500" />
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-black text-white tracking-tight"
          >
            {value}
          </motion.span>
        </div>
        
        <div className={`flex flex-col items-end ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          <div className="flex items-center gap-1 font-bold text-xs">
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{percentage}%</span>
          </div>
          <span className="text-[9px] font-medium opacity-80 mt-0.5">
            {isUp ? '+' : '-'}{change}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isUp ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
          <span className="text-[8px] font-bold text-gray-500 tracking-tighter uppercase">Live Pulse</span>
        </div>
        <MiniTrendChart color={isUp ? "#4ade80" : "#f87171"} />
      </div>

    </motion.div>
  );
};

export default GoldTickerCard;
