import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { CandlestickChart, AlertCircle, Loader2 } from 'lucide-react';
import { fetchLiveRates } from '../../store/slices/liveRateSlice';
import GoldTickerCard from './GoldTickerCard';
import MarketStatus from './MarketStatus';

const LiveMarketHeader = () => {
  const dispatch = useDispatch();
  const { rates, loading, error } = useSelector((state) => state.liveRate);
  const [tickerRates, setTickerRates] = useState([]);
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    dispatch(fetchLiveRates());
    
    // Automatic frontend refresh every 1 minute (60,000 ms)
    const interval = setInterval(() => {
      // Only poll if the page is visible and user is likely logged in
      if (!document.hidden && localStorage.getItem('token')) {
        dispatch(fetchLiveRates());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (rates && rates.updatedAt) {
      setTickerRates([
        { 
          label: '24K GOLD', 
          value: `₹${Number(rates.gold24k || 0).toLocaleString()}/g`, 
          change: Number(rates.gold24k_change || 0).toFixed(2), 
          percentage: Number(rates.gold24k_change_percent || 0).toFixed(2), 
          isUp: rates.gold24k_is_up !== false 
        },
        { 
          label: '22K GOLD', 
          value: `₹${Number(rates.gold22k || 0).toLocaleString()}/g`, 
          change: Number(rates.gold22k_change || 0).toFixed(2), 
          percentage: Number(rates.gold22k_change_percent || 0).toFixed(2), 
          isUp: rates.gold22k_is_up !== false 
        },
        { 
          label: '18K GOLD', 
          value: `₹${Number(rates.gold18k || 0).toLocaleString()}/g`, 
          change: Number(rates.gold18k_change || 0).toFixed(2), 
          percentage: Number(rates.gold18k_change_percent || 0).toFixed(2), 
          isUp: rates.gold18k_is_up !== false 
        },
        { 
          label: 'SILVER', 
          value: `₹${Number(rates.silver || 0).toLocaleString()}/g`, 
          change: Number(rates.silver_change || 0).toFixed(2), 
          percentage: Number(rates.silver_change_percent || 0).toFixed(2), 
          isUp: rates.silver_is_up !== false 
        },
      ]);
      
      const updateTime = new Date(rates.updatedAt);
      const updateDiff = () => {
        const diff = Math.floor((new Date() - updateTime) / 60000);
        setTimeAgo(diff <= 0 ? 'Just now' : `${diff} mins ago`);
      };
      
      updateDiff();
      const timeInterval = setInterval(updateDiff, 30000); // update time ago text every 30s
      return () => clearInterval(timeInterval);
    }
  }, [rates]);

  const marketStatusVal = rates.marketStatus || (rates.isLive ? 'LIVE' : 'CACHED');

  return (
    <div className="w-full bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] border-b border-gold/10 py-4 px-6 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Branding & Indicator */}
        <div className="flex items-center gap-4 min-w-[240px]">
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 shadow-[0_0_20px_rgba(212,160,23,0.1)]">
            <CandlestickChart className="text-gold" size={24} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">Live Gold Market</h2>
              {marketStatusVal === 'LIVE' ? (
                <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-md border border-green-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-tighter">Live</span>
                </div>
              ) : marketStatusVal === 'CACHED' ? (
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Cached</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Offline</span>
                </div>
              )}
            </div>
            <p className="text-[11px] font-medium text-gray-500 mt-0.5">Real-time bullion and silver analytics</p>
          </div>
        </div>

        {/* Center: Ticker Section */}
        <div 
          className="flex-1 w-full overflow-hidden relative min-h-[75px] flex items-center"
          style={{
             maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
             WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
          }}
        >
          <div className="ticker-container flex items-center gap-4">
            {tickerRates.length > 0 ? (
              [...tickerRates, ...tickerRates, ...tickerRates, ...tickerRates, ...tickerRates, ...tickerRates, ...tickerRates, ...tickerRates].map((rate, idx) => (
                <GoldTickerCard key={idx} {...rate} />
              ))
            ) : (
              // Skeleton loading
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[240px] h-[75px] bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
              ))
            )}
          </div>
          
          {/* Loading state overlay */}
          {loading && tickerRates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-xl z-20">
              <div className="flex items-center gap-2 text-gold text-xs font-bold border border-gold/30 px-4 py-2 rounded-lg bg-gold/10">
                <Loader2 className="animate-spin text-gold" size={14} />
                <span>Fetching live rates...</span>
              </div>
            </div>
          )}

          {/* Error Warning/API Unavailable Overlay */}
          {(error || marketStatusVal === 'API ERROR') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-20">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold border border-red-400/30 px-4 py-2 rounded-lg bg-red-400/10">
                <AlertCircle size={14} />
                <span>API Unavailable: Active Default Rates</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Market Status */}
        <div className="hidden lg:block">
          <MarketStatus status={marketStatusVal} lastUpdated={timeAgo} />
        </div>

      </div>

      {/* Global CSS for Ticker and Grid */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-container {
          display: flex;
          width: max-content;
          animation: ticker-scroll 120s linear infinite;
        }
        .ticker-container:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default LiveMarketHeader;
