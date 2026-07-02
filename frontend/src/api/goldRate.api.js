/**
 * goldRate.api.js
 * ──────────────────────────────────────────────────────────────────────────
 * Frontend API helpers for all Gold & Silver rate endpoints.
 * Note: Cache-Control headers belong on server *responses* only.
 * Sending them as *request* headers triggers CORS preflight failures.
 * The backend controller already sets no-store on the response side.
 */
import api from './axios';

/**
 * GET /api/gold-rate/latest
 * Returns: { gold18k, gold22k, gold24k, silverRate, updatedAt, rateDate, source, isFallback }
 */
export const getLatestGoldRate = async () => {
  const { data } = await api.get('/gold-rate/latest');
  return data; // { success, data: { gold18k, gold22k, gold24k, silverRate, updatedAt, ... } }
};

/**
 * GET /api/gold-rates/live
 * Returns the rich live-market response with change metrics for the ticker.
 */
export const getLiveGoldRates = async () => {
  const { data } = await api.get('/gold-rates/live');
  return data;
};

/**
 * POST /api/gold-rates/refresh
 * Admin-only: forces a fresh scrape and DB upsert.
 */
export const forceRefreshGoldRate = async () => {
  const { data } = await api.post('/gold-rates/refresh', {});
  return data;
};

/**
 * GET /api/gold-rates/logs
 * Returns recent update attempt logs.
 */
export const getGoldRateLogs = async (limit = 10) => {
  const { data } = await api.get(`/gold-rates/logs?limit=${limit}`);
  return data;
};
