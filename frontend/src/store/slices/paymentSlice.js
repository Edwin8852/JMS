import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentApi from '../../api/payment.api';

export const fetchPayments = createAsyncThunk('payments/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const response = await paymentApi.getAllPayments(filters);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
  }
});

export const fetchLoanPayments = createAsyncThunk('payments/fetchByLoan', async (loanId, { rejectWithValue }) => {
  try {
    const response = await paymentApi.getLoanPayments(loanId);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan payments');
  }
});

export const createPayment = createAsyncThunk('payments/create', async (paymentData, { rejectWithValue }) => {
  try {
    const response = await paymentApi.processPayment(paymentData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to record payment');
  }
});


const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearPaymentState: (state) => { 
      state.error = null; 
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Loan
      .addCase(fetchLoanPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchLoanPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchLoanPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Payment
      .addCase(createPayment.pending, (state) => { state.loading = true; })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // The payload usually contains { payment, loan }
        if (action.payload.payment) {
          state.payments.unshift(action.payload.payment);
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },

});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
