/**
 * goldRateSlice.js
 * ──────────────────────────────────────────────────────────────────────────
 * Redux slice for the canonical daily gold rate (used by loan/valuation forms).
 * Reads from GET /api/gold-rate/latest.
 *
 * State shape:
 *   current:   { gold22k, gold24k, silverRate, updatedAt, rateDate, source, isFallback }
 *   loading:   boolean
 *   error:     string | null
 *   isToday:   boolean  — true if rate is from today's IST date
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLatestGoldRate }              from '../../api/goldRate.api';

// ── Helper: get today's date in IST as 'YYYY-MM-DD' ────────────────────────
const getTodayIST = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

// ── Async thunk ─────────────────────────────────────────────────────────────
export const fetchLatestGoldRate = createAsyncThunk(
  'goldRate/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getLatestGoldRate();   // { city, gold22k, gold24k, ... }
      if (!res || (!res.gold24k && !res.gold22k)) throw new Error('Invalid response from /gold-rate/latest');
      return res;
    } catch (error) {
      console.error('[goldRateSlice] fetchLatestGoldRate failed:', error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch gold rate');
    }
  },
  {
    condition: (_, { getState }) => {
      const { loading, current } = getState().goldRate;
      if (loading) return false;
      
      if (current?.updatedAt) {
        const lastUpdated = new Date(current.updatedAt).getTime();
        const now = new Date().getTime();
        if (now - lastUpdated < 10000) {
          return false;
        }
      }
    }
  }
);

// ── Initial state ────────────────────────────────────────────────────────────
const INITIAL_RATE = {
  gold22k:    0,
  gold24k:    0,
  silverRate: 0,
  // Legacy aliases for loan calculation components
  gold22KRate: 0,
  gold24KRate: 0,
  updatedAt:  null,
  rateDate:   null,
  source:     '',
  isFallback: false,
};

const goldRateSlice = createSlice({
  name: 'goldRate',
  initialState: {
    current:  null,
    previous: JSON.parse(localStorage.getItem('prevGoldRate')) || null,
    loading:  false,
    error:    null,
    isToday:  false,  // whether current rate is from today's IST date
  },

  reducers: {
    /** Store current as previous before a new fetch (for change tracking). */
    updatePreviousRate: (state) => {
      if (state.current) {
        state.previous = state.current;
        localStorage.setItem('prevGoldRate', JSON.stringify(state.current));
      }
    },
    /** Clear all rate data (e.g., on logout). */
    clearGoldRate: (state) => {
      state.current  = null;
      state.previous = null;
      state.error    = null;
      state.isToday  = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestGoldRate.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchLatestGoldRate.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        // Normalise into a unified shape
        const normalised = {
          city:       payload.city       || 'Chennai',
          gold18k:    Number(payload.gold18k    || 0),
          gold22k:    Number(payload.gold22k    || 0),
          gold24k:    Number(payload.gold24k    || 0),
          silverRate: Number(payload.silverRate || 0),
          // Keep legacy aliases in sync
          gold22KRate: Number(payload.gold22k   || 0),
          gold24KRate: Number(payload.gold24k   || 0),
          updatedAt:   payload.updatedAt  || null,
          rateDate:    payload.rateDate   || null,
          source:      payload.source     || '',
          isFallback:  payload.isFallback || false,
        };

        state.current = normalised;

        // Check if this rate is from today (IST)
        const todayIST  = getTodayIST();
        state.isToday   = payload.rateDate === todayIST;

        if (!state.isToday) {
          console.warn(
            `[goldRateSlice] ⚠️  Rate is from ${payload.rateDate}, not today (${todayIST}). Fallback mode.`
          );
        }

        state.error = null;
      })
      .addCase(fetchLatestGoldRate.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.isToday = false;

        // On failure, keep the last known good rate (don't wipe it)
        console.error('[goldRateSlice] Rate fetch rejected:', action.payload);
      });
  },
});

export const { updatePreviousRate, clearGoldRate } = goldRateSlice.actions;
export default goldRateSlice.reducer;
