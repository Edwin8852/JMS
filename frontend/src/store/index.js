import { configureStore, combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import loanReducer from './slices/loanSlice';
import customerReducer from './slices/customerSlice';
import paymentReducer from './slices/paymentSlice';
import auditReducer from './slices/auditSlice';
import notificationReducer from './slices/notificationSlice';
import chitFundReducer from './slices/chitFundSlice';
import dashboardReducer from './slices/dashboardSlice';
import supportReducer from './slices/supportSlice';
import documentReducer from './slices/documentSlice';
import securityReducer from './slices/securitySlice';
import jewelryOrderReducer from './slices/jewelryOrderSlice';
import goldLoanReducer from './slices/goldLoanSlice';
import liveRateReducer from './slices/liveRateSlice';
import goldRateReducer from './slices/goldRateSlice';
import kycReducer from './slices/kycSlice';
import loanPaymentReducer from './slices/loanPaymentSlice';
import chitPaymentReducer from './slices/chitPaymentSlice';
import inventoryReducer from './slices/inventorySlice';

const appReducer = combineReducers({
  auth: authReducer,
  loans: loanReducer,
  customers: customerReducer,
  payments: paymentReducer,
  audit: auditReducer,
  notifications: notificationReducer,
  chitFund: chitFundReducer,
  dashboard: dashboardReducer,
  support: supportReducer,
  documents: documentReducer,
  security: securityReducer,
  jewelryOrders: jewelryOrderReducer,
  goldLoan: goldLoanReducer,
  liveRate: liveRateReducer,
  goldRate: goldRateReducer,
  kyc: kycReducer,
  loanPayments: loanPaymentReducer,
  chitPayments: chitPaymentReducer,
  inventory: inventoryReducer,
});


const rootReducer = (state, action) => {
  if (action.type === 'auth/logout' || action.type === 'auth/login/pending') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),

  devTools: process.env.NODE_ENV !== 'production',
});