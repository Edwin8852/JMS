import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loanApi from '../../api/loan.api';

// Async Thunks
export const fetchLoans = createAsyncThunk('loans/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const response = await loanApi.getAllLoans(filters);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch loans');
  }
}, {
  condition: (filters, { getState }) => {
    const { loans, loading } = getState().loans;
    if (loans && loans.length > 0 && (!filters || Object.keys(filters).length === 0) && !loading) {
      return false;
    }
  }
});

export const createLoan = createAsyncThunk('loans/create', async (loanData, { rejectWithValue }) => {
  try {
    const response = await loanApi.createLoan(loanData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create loan');
  }
});

const loanSlice = createSlice({
  name: 'loans',
  initialState: {
    loans: [],
    currentLoan: null,
    loading: false,
    error: null,
    loanApplication: {
      ornamentType: '',
      goldWeight: '',
      goldPurity: '22K',
      loanAmount: '',
      items: [] // For multiple items support
    },
    stats: {
      totalDisbursed: 0,
      activeLoans: 0,
      totalInterestEarned: 0
    }
  },
  reducers: {
    clearLoanError: (state) => { state.error = null; },
    setCurrentLoan: (state, action) => { state.currentLoan = action.payload; },
    setLoanApplication: (state, action) => { 
      state.loanApplication = { ...state.loanApplication, ...action.payload };
    },
    clearLoanApplication: (state) => {
      state.loanApplication = {
        ornamentType: '',
        goldWeight: '',
        goldPurity: '22K',
        loanAmount: '',
        items: []
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => { state.loading = true; })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLoan.pending, (state) => { state.loading = true; })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.loans.unshift(action.payload);
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearLoanError, 
  setCurrentLoan, 
  setLoanApplication, 
  clearLoanApplication 
} = loanSlice.actions;
export default loanSlice.reducer;
