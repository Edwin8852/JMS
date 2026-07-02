import api from './axios';

export const fetchSchemes = () => api.get('/chit-fund/schemes');
export const getAvailableSchemes = () => api.get('/chit-fund/schemes/available');
export const createScheme = (data) => api.post('/chit-fund/schemes', data);
export const enrollSubscriber = (data) => api.post('/chit-fund/enroll', data);
export const collectPayment = (installmentId, data) => api.post(`/chit-fund/payment/${installmentId}`, data);
export const getSubscriberDetails = (id) => api.get(`/chit-fund/subscriber/${id}`);

// Auction Methods
export const conductAuction = (data) => api.post('/chit-fund/auctions/conduct', data);
export const fetchAuctions = (schemeId) => api.get(`/chit-fund/auctions/${schemeId}`);

export const getMySubscriptions = () => api.get('/chit-fund/my-subscriptions');
export const getFullSubscriptionDetails = () => api.get('/chit-fund/my-subscriptions/full');
export const getAllSubscriptions = () => api.get('/chit-fund/all-subscriptions');

export const updateScheme = (id, data) => api.put(`/chit-fund/schemes/${id}`, data);
export const deleteScheme = (id) => api.delete(`/chit-fund/schemes/${id}`);

export default {
  fetchSchemes,
  getAvailableSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  enrollSubscriber,
  collectPayment,
  getSubscriberDetails,
  conductAuction,
  fetchAuctions,
  getMySubscriptions,
  getFullSubscriptionDetails,
  getAllSubscriptions
};
