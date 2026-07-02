import api from './axios';

export const getExecutiveStats = () => api.get('/dashboard/executive-stats');
export const getAdminStats = () => api.get('/dashboard/stats');
export const getCustomerDashboard = () => api.get('/customers/me/dashboard');

export default {
  getExecutiveStats,
  getAdminStats,
  getCustomerDashboard
};
