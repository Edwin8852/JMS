import api from './axios';

/**
 * Gold Finance / Gold Loan Enterprise API
 */

// Loan Management
export const fetchAllLoans = () => api.get('/gold-finance');
export const fetchLoanById = (id) => api.get(`/gold-finance/${id}`);
export const fetchPendingLoans = () => api.get('/gold-finance/pending');
export const applyLoan = (data) => api.post('/gold-finance/apply', data);
export const fetchMyLoans = () => api.get('/gold-finance/my-loans');
export const approveLoan = (id, data) => api.put(`/gold-finance/${id}/approve`, data);
export const preApproveLoan = (id) => api.patch(`/gold-finance/${id}/pre-approve`);
export const rejectLoan = (id, data) => api.patch(`/gold-finance/${id}/reject`, data);
export const updateLoan = (id, data) => api.put(`/gold-finance/${id}`, data);
export const closeLoan = (id, data) => api.post(`/gold-loans/${id}/close`, data);
export const releaseOrnament = (id, data) => api.post(`/gold-loans/${id}/release-ornament`, data);

// Payments
export const makePayment = (id, paymentData) => api.post(`/gold-finance/${id}/pay`, paymentData);

// Invoices
export const fetchLoanInvoices = (loanId) => api.get(`/invoices/loan/${loanId}`);
export const fetchInvoiceById = (id) => api.get(`/invoices/${id}`);
export const downloadInvoicePDF = (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' });
export const fetchLoanHistory = (id) => api.get(`/gold-finance/${id}/history`);

// Schemes
export const getSchemes = () => api.get('/schemes');

export const fetchLoanDetails = (id) => api.get(`/gold-loans/${id}/details`); // Note: gold-loans vs gold-finance

export default {
  fetchAllLoans,
  fetchLoanById,
  fetchPendingLoans,
  applyLoan,
  fetchMyLoans,
  approveLoan,
  preApproveLoan,
  rejectLoan,
  updateLoan,
  makePayment,
  fetchLoanInvoices,
  fetchInvoiceById,
  downloadInvoicePDF,
  fetchLoanHistory,
  getSchemes,
  closeLoan,
  releaseOrnament,
  fetchLoanDetails
};
