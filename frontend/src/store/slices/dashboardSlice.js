import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchExecutiveStats = createAsyncThunk('dashboard/fetchExecutiveStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/dashboard/executive-stats');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch executive stats');
  }
});

export const fetchHighRiskAccounts = createAsyncThunk('dashboard/fetchHighRiskAccounts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/ai/risk-analysis/high-risk');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch high risk accounts');
  }
});

export const runRiskAnalysis = createAsyncThunk('dashboard/runRiskAnalysis', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/ai/risk-analysis/run');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to run risk analysis');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    executiveStats: null,
    highRiskAccounts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExecutiveStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExecutiveStats.fulfilled, (state, action) => {
        state.loading = false;
        state.executiveStats = action.payload;
      })
      .addCase(fetchHighRiskAccounts.fulfilled, (state, action) => {
        state.highRiskAccounts = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
