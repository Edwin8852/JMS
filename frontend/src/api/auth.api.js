import api from './axios';

export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/profile');
export const changePassword = (data) => api.post('/auth/change-password', data);

export const updateProfile = (data) => api.put('/auth/profile', data);

export default {
  login,
  logout,
  getProfile,
  changePassword,
  updateProfile
};
