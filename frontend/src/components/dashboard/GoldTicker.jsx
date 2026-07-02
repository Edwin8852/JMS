import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestGoldRate, updatePreviousRate } from '../../store/slices/goldRateSlice';
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

const GoldTicker = () => {
  const dispatch = useDispatch();
  const { current, previous, loading } = useSelector((state) => state.goldRate);
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    // Initial Fetch
    dispatch(fetchLatestGoldRate());

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(updatePreviousRate());
      dispatch(fetchLatestGoldRate());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (current) {
      const price24K = parseFloat(current.gold24k || current.gold24KRate || 0);
      const price22K = parseFloat(current.gold22k || current.gold22KRate || 0);
      const price18K = parseFloat(current.gold18k || current.gold18KRate || 0);
      const silverPrice = parseFloat(current.silverRate || 0);
      
      const prevPrice = previous ? parseFloat(previous.gold24k || previous.gold24KRate || price24K) : price24K;
      const change = price24K - prevPrice;
      const percentage = prevPrice > 0 ? (change / prevPrice) * 100 : 0;

      setTickerItems([
        { label: 'GOLD 24K', value: `₹${price24K.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change, percentage, icon: '🟡' },
        { label: 'GOLD 22K', value: `₹${price22K.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: change * (22/24), percentage, icon: '🟠' },
        { label: 'GOLD 18K', value: `₹${price18K.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: change * (18/24), percentage, icon: '🟤' },
        { label: 'SILVER', value: `₹${silverPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}/g`, change: 0, percentage: 0, icon: '⚪' },
        { label: 'MARKET STATUS', value: 'OPEN', change: 0, percentage: 0, icon: '🏛️' },
      ]);
    }
  }, [current, previous]);

  return (
    <div className="bg-white/90 backdrop-blur-md border-y border-gray-100 h-10 flex items-center overflow-hidden whitespace-nowrap shadow-sm">
      <div className="bg-gold-gradient text-white px-4 h-full flex items-center gap-2 font-black text-[10px] tracking-widest z-10 shadow-[10px_0_20px_rgba(0,0,0,0.05)]">
        <Zap size={14} fill="currentColor" /> LIVE RATES
      </div>
      
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-12 pl-8"
      >
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.label}</span>
            <span className="text-sm font-black text-gray-800">{item.value}</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(item.percentage).toFixed(2)}%
            </div>
          </div>
        ))}
      </motion.div>

      <div className="absolute right-0 bg-white/90 pl-4 pr-6 h-full flex items-center gap-2 text-[10px] text-gray-400 font-bold z-10">
        <Clock size={12} /> {current ? new Date(current.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
      </div>
    </div>
  );
};

export default GoldTicker;
