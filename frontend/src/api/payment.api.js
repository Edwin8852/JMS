import api from './axios';

export const processPayment = (data) => api.post('/payments', data);
export const getAllPayments = (filters) => api.get('/payments', { params: filters });
export const getLoanPayments = (loanId) => api.get(`/payments/${loanId}`);
export const getMyTransactions = () => api.get('/customers/me/transactions');

export default {
  processPayment,
  getAllPayments,
  getLoanPayments,
  getMyTransactions
};

