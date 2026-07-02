import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchChitPayments = createAsyncThunk('chitPayments/fetchChitPayments', async (filters, { rejectWithValue }) => {
  try {
    const response = await api.get('/chit-payments', { params: filters });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch chit payments');
  }
});

export const processChitPayment = createAsyncThunk('chitPayments/processPayment', async ({ subscriberId, paymentData }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/chit-payments/${subscriberId}/process`, paymentData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to process chit payment');
  }
});

const chitPaymentSlice = createSlice({
  name: 'chitPayments',
  initialState: {
    payments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearChitPaymentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChitPayments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchChitPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchChitPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(processChitPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(processChitPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(processChitPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChitPaymentError } = chitPaymentSlice.actions;
export default chitPaymentSlice.reducer;
