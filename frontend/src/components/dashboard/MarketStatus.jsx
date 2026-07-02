import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

const MarketStatus = ({ status = "LIVE", lastUpdated = "Just now" }) => {
  const isLive = status === "LIVE" || status === "OPEN";
  const isCached = status === "CACHED";
  const isError = status === "API ERROR" || status === "ERROR";

  let badgeClass = 'bg-gray-500/10 border-gray-500/30 text-gray-400';
  let dotClass = 'bg-gray-500';

  if (isLive) {
    badgeClass = 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
    dotClass = 'bg-green-500 animate-pulse';
  } else if (isCached) {
    badgeClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    dotClass = 'bg-amber-500 animate-pulse';
  } else if (isError) {
    badgeClass = 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    dotClass = 'bg-red-500';
  }

  const displayText = isLive ? "LIVE" : isCached ? "CACHED" : "API ERROR";

  return (
    <div className="flex flex-col items-end gap-1 px-4 border-l border-white/10">
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">Market Status</span>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${badgeClass}`}>
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-[11px] font-black tracking-widest">{displayText}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 mt-2 text-gray-500">
        <Clock size={12} className="opacity-70" />
        <span className="text-[9px] font-medium tracking-tight">Updated {lastUpdated}</span>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <ShieldCheck size={10} className="text-gold/60" />
        <span className="text-[8px] font-bold text-gold/40 tracking-tighter uppercase">Verified Source</span>
      </div>
    </div>
  );
};

export default MarketStatus;
