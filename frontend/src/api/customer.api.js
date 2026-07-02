import api from './axios';

export const fetchCustomers = (filters) => api.get('/customers', { params: filters });
export const createCustomer = (data) => api.post('/customers', data);
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const searchCustomers = (query) => api.get('/customers/search', { params: { q: query } });
export const resendCredentials = (id) => api.post(`/customers/${id}/resend-credentials`);
export const getMyDashboard = () => api.get('/customers/me/dashboard');
export const getMyProfile = () => api.get('/customers/me/profile');
export const getMyTransactions = () => api.get('/customers/me/transactions');

export default {
  fetchCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  resendCredentials,
  getMyDashboard,
  getMyProfile,
  getMyTransactions
};
