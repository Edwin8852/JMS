import api from './axios';

export const submitKyc = (formData) => api.post('/kyc/submit', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getKycStatus = () => api.get('/kyc/status');

export const approveKyc = (id) => api.put(`/kyc/${id}/approve`);
export const rejectKyc = (id, reason) => api.put(`/kyc/${id}/reject`, { reason });

export default {
  submitKyc,
  getKycStatus,
  approveKyc,
  rejectKyc
};
