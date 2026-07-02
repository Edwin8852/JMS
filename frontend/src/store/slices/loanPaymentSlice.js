import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchLoanPayments = createAsyncThunk('loanPayments/fetchLoanPayments', async (filters, { rejectWithValue }) => {
  try {
    const response = await api.get('/loan-payments', { params: filters });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan payments');
  }
});

export const processLoanPayment = createAsyncThunk('loanPayments/processPayment', async ({ loanId, paymentData }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/loan-payments/${loanId}/process`, paymentData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to process loan payment');
  }
});

const loanPaymentSlice = createSlice({
  name: 'loanPayments',
  initialState: {
    payments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLoanPaymentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoanPayments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLoanPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchLoanPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(processLoanPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(processLoanPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(processLoanPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLoanPaymentError } = loanPaymentSlice.actions;
export default loanPaymentSlice.reducer;
