import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import goldLoanApi from '../../api/goldLoan.api';

// Admin Thunks
export const fetchAllLoans = createAsyncThunk('goldLoan/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.fetchAllLoans();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all loans');
  }
});

export const fetchPendingLoans = createAsyncThunk('goldLoan/fetchPending', async (_, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.fetchPendingLoans();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending applications');
  }
});

export const approveGoldLoan = createAsyncThunk('goldLoan/approve', async (payload, { rejectWithValue }) => {
  try {
    // payload can be an ID string or an object { id, valuationData }
    const id = typeof payload === 'object' ? payload.id : payload;
    const data = typeof payload === 'object' ? payload.valuationData : {};
    
    const response = await goldLoanApi.approveLoan(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve loan');
  }
});

export const preApproveGoldLoan = createAsyncThunk('goldLoan/preApprove', async (id, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.preApproveLoan(id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to pre-approve loan');
  }
});

export const rejectGoldLoan = createAsyncThunk('goldLoan/reject', async (payload, { rejectWithValue }) => {
  try {
    const id = typeof payload === 'object' ? payload.id : payload;
    const data = typeof payload === 'object' ? payload.remarksData : {};
    const response = await goldLoanApi.rejectLoan(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reject loan');
  }
});


// Customer Thunks
export const applyGoldLoan = createAsyncThunk('goldLoan/apply', async (loanData, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.applyLoan(loanData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to apply for loan');
  }
});

export const fetchMyGoldLoans = createAsyncThunk('goldLoan/fetchMyLoans', async (_, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.fetchMyLoans();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch your loans');
  }
});

// Common Thunks
export const fetchLoanDetails = createAsyncThunk('goldLoan/fetchDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.fetchLoanById(id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan details');
  }
});

export const fetchSchemes = createAsyncThunk('goldLoan/fetchSchemes', async (_, { rejectWithValue }) => {
  try {
    const response = await goldLoanApi.getSchemes();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch schemes');
  }
});

const goldLoanSlice = createSlice({
  name: 'goldLoan',
  initialState: {
    loans: [],
    pendingLoans: [],
    currentLoan: null,
    schemes: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearLoanState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllLoans.pending, (state) => { state.loading = true; })
      .addCase(fetchAllLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchAllLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending
      .addCase(fetchPendingLoans.fulfilled, (state, action) => {
        state.pendingLoans = action.payload;
      })
      // Fetch My Loans
      .addCase(fetchMyGoldLoans.fulfilled, (state, action) => {
        state.loans = action.payload;
      })
      // Fetch Details
      .addCase(fetchLoanDetails.fulfilled, (state, action) => {
        state.currentLoan = action.payload;
      })
      // Approve
      .addCase(approveGoldLoan.pending, (state) => { state.loading = true; })
      .addCase(approveGoldLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update local state
        const approvedLoan = action.payload;
        const exists = state.loans.find(l => l.id === approvedLoan.id);
        if (exists) {
          state.loans = state.loans.map(l => l.id === approvedLoan.id ? approvedLoan : l);
        } else {
          state.loans = [approvedLoan, ...state.loans];
        }
        state.pendingLoans = state.pendingLoans.filter(l => l.id !== approvedLoan.id);
        if (state.currentLoan?.id === approvedLoan.id) {
          state.currentLoan = approvedLoan;
        }
      })
      .addCase(approveGoldLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pre-Approve
      .addCase(preApproveGoldLoan.pending, (state) => { state.loading = true; })
      .addCase(preApproveGoldLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const preApprovedLoan = action.payload;
        state.loans = state.loans.map(l => l.id === preApprovedLoan.id ? preApprovedLoan : l);
        state.pendingLoans = state.pendingLoans.map(l => l.id === preApprovedLoan.id ? preApprovedLoan : l);
        if (state.currentLoan?.id === preApprovedLoan.id) {
          state.currentLoan = preApprovedLoan;
        }
      })
      .addCase(preApproveGoldLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject
      .addCase(rejectGoldLoan.pending, (state) => { state.loading = true; })
      .addCase(rejectGoldLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const rejectedLoan = action.payload;
        state.loans = state.loans.filter(l => l.id !== rejectedLoan.id);
        state.pendingLoans = state.pendingLoans.filter(l => l.id !== rejectedLoan.id);
        if (state.currentLoan?.id === rejectedLoan.id) {
          state.currentLoan = rejectedLoan;
        }
      })
      .addCase(rejectGoldLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Schemes
      .addCase(fetchSchemes.fulfilled, (state, action) => {
        state.schemes = action.payload;
      });
  }
});

export const { clearLoanState } = goldLoanSlice.actions;
export default goldLoanSlice.reducer;
