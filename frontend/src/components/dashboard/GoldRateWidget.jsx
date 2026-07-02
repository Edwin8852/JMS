/**
 * GoldRateWidget.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Live Gold Market Widget for the SDRS Dashboard.
 *
 * Purity Rules (server-side, 24K is master):
 *   18K = 24K × (18 / 24)
 *   22K = 24K × (22 / 24)
 *
 * These ratios are computed by the backend service. The frontend ONLY displays
 * what the DB returns — it never derives 22K or 18K from each other.
 *
 * Data Sources (in priority order):
 *   1. goldRate Redux slice  (GET /api/gold-rate/latest)  ← canonical DB rate
 *   2. liveRate Redux slice  (GET /api/gold-rates/live)   ← live ticker
 *
 * Auto-refresh: every 30 minutes
 * No-cache:     applied at API layer (Cache-Control: no-store)
 * Fallback:     amber warning banner when today's rate is unavailable
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector }                 from 'react-redux';
import { motion, AnimatePresence }                  from 'framer-motion';
import {
  Gem, Coins, TrendingUp, TrendingDown,
  RefreshCw, AlertTriangle, CheckCircle2, Clock, Zap,
} from 'lucide-react';
import { fetchLiveRates }        from '../../store/slices/liveRateSlice';
import { fetchLatestGoldRate }   from '../../store/slices/goldRateSlice';
import { forceRefreshGoldRate, getGoldRateLogs }  from '../../api/goldRate.api';

// ── Constants ────────────────────────────────────────────────────────────────
const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

// ── Format a date string as IST ─────────────────────────────────────────────
const formatIST = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day:      '2-digit',
      month:    'short',
      year:     'numeric',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   true,
    });
  } catch {
    return '—';
  }
};

// ── Today in IST 'YYYY-MM-DD' ────────────────────────────────────────────────
const getTodayIST = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

// ── Format INR ───────────────────────────────────────────────────────────────
const inr = (val) =>
  Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// ──────────────────────────────────────────────────────────────────────────
// Rate Card Component
// ──────────────────────────────────────────────────────────────────────────
const RateCard = ({ label, sublabel, value, change, changePercent, isUp, icon: Icon, accent, loading }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -4 }}
    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    className="relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 flex flex-col gap-2.5"
    style={{
      background: `linear-gradient(135deg, ${accent}08 0%, transparent 100%)`,
      borderColor: `${accent}25`,
    }}
  >
    {/* Glow orb */}
    <div
      className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-3xl opacity-15 pointer-events-none"
      style={{ background: accent }}
    />

    {/* Label row */}
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg" style={{ background: `${accent}18` }}>
        <Icon size={13} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: `${accent}cc` }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-[9px] text-gray-600 font-medium">{sublabel}</p>
        )}
      </div>
    </div>

    {/* Value */}
    {loading ? (
      <div className="h-7 w-28 rounded-lg bg-white/8 animate-pulse" />
    ) : (
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-black text-white">₹{inr(value)}</span>
        <span className="text-[10px] text-gray-500 font-bold">/gram</span>
      </div>
    )}

    {/* Change pill */}
    {!loading && change !== undefined && (
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit
        ${isUp
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}
      >
        {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
        {isUp ? '+' : ''}{Number(change || 0).toFixed(0)}
        {changePercent !== undefined && (
          <span className="opacity-70 ml-0.5">({isUp ? '+' : ''}{Number(changePercent || 0).toFixed(2)}%)</span>
        )}
      </div>
    )}
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────
// Main Widget
// ──────────────────────────────────────────────────────────────────────────
const GoldRateWidget = ({ compact = false }) => {
  const dispatch = useDispatch();

  const { rates: liveRates, loading: liveLoading } = useSelector((s) => s.liveRate);
  const { current: goldRate, loading: grLoading }  = useSelector((s) => s.goldRate);

  const [refreshing, setRefreshing] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);

  // ── Load both slices ────────────────────────────────────────────────────
  const loadRates = useCallback(async () => {
    dispatch(fetchLatestGoldRate()); // Primary: canonical DB rate (/api/gold-rate/latest)
    dispatch(fetchLiveRates());       // Secondary: live ticker with change metrics
    try {
      const logsResp = await getGoldRateLogs(1);
      if (logsResp?.success) setApiLogs(logsResp.data);
    } catch (err) {
      console.warn('Failed to fetch rate logs', err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadRates]);

  // ── Manual force-refresh ────────────────────────────────────────────────
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await forceRefreshGoldRate();    // POST /api/gold-rates/refresh
    } catch (err) {
      console.warn('[GoldRateWidget] Manual server refresh failed:', err.message);
    } finally {
      await loadRates();
      setRefreshing(false);
    }
  };

  // ── Derive display values ─────────────────────────────────────────────────
  // Primary source: goldRate slice (canonical /latest DB record — 24K is master)
  // Fallback: liveRates slice if goldRate is not yet loaded
  const gold24k_raw = Number(goldRate?.gold24k || liveRates?.gold24k || 0);

  const gold24k    = gold24k_raw;
  const gold22k    = Number(goldRate?.gold22k || liveRates?.gold22k || 0);
  const gold18k    = Number(goldRate?.gold18k || liveRates?.gold18k || 0);
  const silverRate = Number(goldRate?.silverRate || liveRates?.silverRate || liveRates?.silver || 0);
  const updatedAt  = goldRate?.updatedAt || liveRates?.updatedAt;
  const source     = 'Chennai Market Rates';  // Always Chennai
  const city       = 'Chennai';               // Always Chennai
  const isFallback = goldRate?.isFallback || false;
  const rateDate   = goldRate?.rateDate;
  const isToday    = rateDate ? rateDate === getTodayIST() : true;
  const isLive     = liveRates?.isLive !== false;
  const loading    = (liveLoading || grLoading) && gold24k === 0;

  // Change metrics from liveRate slice
  const changes = {
    gold24k: { change: liveRates?.gold24k_change, pct: liveRates?.gold24k_change_percent, isUp: liveRates?.gold24k_is_up !== false },
    gold22k: { change: liveRates?.gold22k_change, pct: liveRates?.gold22k_change_percent, isUp: liveRates?.gold22k_is_up !== false },
    gold18k: { change: liveRates?.gold18k_change, pct: liveRates?.gold18k_change_percent, isUp: liveRates?.gold18k_is_up !== false },
    silver:  { change: liveRates?.silver_change,  pct: liveRates?.silver_change_percent,  isUp: liveRates?.silver_is_up  !== false },
  };

  // ── Console logging (Requirement 18 - Frontend side) ─────────────────────
  useEffect(() => {
    if (gold24k > 0) {
      console.log('\n[GoldRateWidget] ══ DISPLAYED UI RATE ══');
      console.log(`  Market City : ${city}`);
      console.log(`  24K Gold  : ₹${gold24k} /gram`);
      console.log(`  22K Gold  : ₹${gold22k} /gram`);
      console.log(`  18K Gold  : ₹${gold18k} /gram`);
      console.log(`  Silver    : ₹${silverRate} /gram`);
      console.log(`  Source    : ${source}`);
      console.log(`  Updated   : ${formatIST(updatedAt)}`);
      console.log(`  Fallback  : ${isFallback}`);
      console.log('══════════════════════════════════════\n');
    }
  }, [gold24k]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Compact mode ─────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="contents">
        {[
          { label: '24K Gold Rate', value: gold24k,    accent: '#D4A017' },
          { label: '22K Gold Rate', value: gold22k,    accent: '#F59E0B' },
          { label: '18K Gold Rate', value: gold18k,    accent: '#CA8A04' },
          { label: 'Silver Rate',   value: silverRate, accent: '#9CA3AF' },
        ].map(({ label, value, accent }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 rounded-3xl border border-gold/10 bg-gradient-to-br from-white to-gold/5 dark:from-dark-card dark:to-gold/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: `${accent}18` }}>
                <Gem size={16} style={{ color: accent }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-xl font-black">
                {loading ? '—' : `₹${inr(value)}`}
              </h4>
              <span className="text-[10px] font-bold text-gray-400">/ gram</span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // ── Full widget ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden border border-white/8 p-5 md:p-6 shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #111111 50%, #0d0d0d 100%)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-amber-500/20" style={{ background: '#D4A01715' }}>
            <Gem size={17} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide">Live Gold Market</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Chennai · IST</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
            !isToday
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : isLive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              !isToday ? 'bg-amber-400 animate-pulse' :
              isLive   ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            {!isToday ? 'Cached' : isLive ? 'Live' : 'Cached'}
          </div>

          {/* Refresh button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Fetch latest rate now"
            className="p-2 rounded-xl border border-white/10 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 transition-all duration-200"
            style={{ background: refreshing ? '#D4A01712' : '#ffffff08' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-amber-400' : ''} />
          </motion.button>
        </div>
      </div>

      {/* ── API Health Card ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-4">
        <div className="flex items-center gap-2">
          <Zap size={14} className={apiLogs?.[0]?.status === 'SUCCESS' ? "text-emerald-400" : apiLogs?.[0]?.status === 'FAILED' ? "text-red-400" : "text-amber-400"} />
          <span className="text-[11px] font-semibold text-gray-300">
            API Health: <span className={apiLogs?.[0]?.status === 'SUCCESS' ? "text-emerald-400" : apiLogs?.[0]?.status === 'FAILED' ? "text-red-400" : "text-amber-400"}>
              {apiLogs?.[0]?.status === 'SUCCESS' ? '100% Operational' : apiLogs?.[0]?.status === 'FAILED' ? 'Failing' : 'Pending'}
            </span>
          </span>
        </div>
        <div className="text-[10px] text-gray-500">
          Last Attempt: {apiLogs?.[0] ? formatIST(apiLogs[0].createdAt) : '—'}
        </div>
      </div>

      {/* ── Unavailable Banner ───────────────────────────────────────────── */}
      <AnimatePresence>
        {(isFallback || !isToday) && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex items-center gap-2 border border-amber-500/20 rounded-xl px-3 py-2.5"
            style={{ background: '#F59E0B0d' }}
          >
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
            <p className="text-[10px] text-amber-300 font-medium">
              Chennai Rate Temporarily Unavailable
              {rateDate && ` — Showing last known Chennai rate from ${rateDate}.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rate Cards Grid: 24K · 22K · 18K · Silver ─────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <RateCard
          label="24K Gold"
          sublabel="Master Rate"
          value={gold24k}
          change={changes.gold24k.change}
          changePercent={changes.gold24k.pct}
          isUp={changes.gold24k.isUp}
          icon={Gem}
          accent="#D4A017"
          loading={loading}
        />
        <RateCard
          label="22K Gold"
          sublabel="Market Rate"
          value={gold22k}
          change={changes.gold22k.change}
          changePercent={changes.gold22k.pct}
          isUp={changes.gold22k.isUp}
          icon={TrendingUp}
          accent="#F59E0B"
          loading={loading}
        />
        <RateCard
          label="18K Gold"
          sublabel="Market Rate"
          value={gold18k}
          change={changes.gold18k.change}
          changePercent={changes.gold18k.pct}
          isUp={changes.gold18k.isUp}
          icon={Zap}
          accent="#CA8A04"
          loading={loading}
        />
        <RateCard
          label="Silver"
          sublabel="Per gram"
          value={silverRate}
          change={changes.silver.change}
          changePercent={changes.silver.pct}
          isUp={changes.silver.isUp}
          icon={Coins}
          accent="#9CA3AF"
          loading={loading}
        />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Clock size={11} />
          <span>
            Updated:{' '}
            <span className="text-gray-300 font-medium">{formatIST(updatedAt)}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          {isToday
            ? <CheckCircle2 size={11} className="text-emerald-500" />
            : <AlertTriangle size={11} className="text-amber-500" />
          }
          <span className={isToday ? 'text-emerald-400' : 'text-amber-400'}>
            {isToday ? "Today's Rate" : "Previous Rate"}
          </span>
          <span className="text-white/10 mx-1">·</span>
          <span className="text-gray-600 truncate max-w-[120px]">{source}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GoldRateWidget;
