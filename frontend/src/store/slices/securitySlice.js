import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchSecurityLogs = createAsyncThunk('security/fetchLogs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/dashboard/security-logs');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch security logs');
  }
});

const securitySlice = createSlice({
  name: 'security',
  initialState: {
    logins: [],
    audits: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecurityLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSecurityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logins = action.payload.logins;
        state.audits = action.payload.audits;
      })
      .addCase(fetchSecurityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default securitySlice.reducer;
