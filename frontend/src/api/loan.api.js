import api from './axios';

/**
 * Loan related API calls
 */

export const createLoan = (loanData) => api.post('/gold-finance', loanData);
export const getAllLoans = () => api.get('/gold-finance');
export const getLoanById = (id) => api.get(`/gold-finance/${id}`);
export const updateLoan = (id, data) => api.put(`/gold-finance/${id}`, data);
export const closeLoan = (id, data) => api.post(`/gold-loans/${id}/close`, data);

// Customer-specific endpoints
export const getMyLoans = () => api.get('/gold-finance/my-loans');
export const applyLoan = (loanData) => api.post('/gold-finance/apply', loanData);

// Admin-specific workflow endpoints
export const getPendingLoans = () => api.get('/gold-finance/pending');
export const approveLoan = (id) => api.put(`/gold-finance/${id}/approve`);

// Gold Rate endpoints
export const getLatestGoldRate = () => api.get('/gold-rates/latest');

export default {
    createLoan,
    getAllLoans,
    getLoanById,
    updateLoan,
    closeLoan,
    getMyLoans,
    applyLoan,
    getPendingLoans,
    approveLoan,
    getLatestGoldRate
};
