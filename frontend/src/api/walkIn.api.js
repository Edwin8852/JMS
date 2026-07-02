import api from './axios';

/**
 * Walk-in Customer Loan Workflow API
 */

export const registerCustomer = (data) => api.post('/walk-in/register', data);

export const uploadKyc = (id, formData) => api.post(`/walk-in/${id}/upload-kyc`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const verifyKyc = (id, data) => api.post(`/walk-in/${id}/verify-kyc`, data);

export const createLoan = (data) => api.post('/walk-in/create-loan', data);

export default {
  registerCustomer,
  uploadKyc,
  verifyKyc,
  createLoan,
};
