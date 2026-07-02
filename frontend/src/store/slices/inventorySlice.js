import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchDashboardStats = createAsyncThunk('inventory/fetchDashboardStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/inventory/dashboard');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
});

export const fetchItems = createAsyncThunk('inventory/fetchItems', async (query, { rejectWithValue }) => {
  try {
    const response = await api.get('/inventory/items', { params: query });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch items');
  }
});

export const fetchHistory = createAsyncThunk('inventory/fetchHistory', async (query, { rejectWithValue }) => {
  try {
    const response = await api.get('/inventory/history', { params: query });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
  }
});

export const addStock = createAsyncThunk('inventory/addStock', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/inventory/items/stock-in', data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add stock');
  }
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    dashboard: null,
    items: [],
    history: { data: [], total: 0, totalPages: 1, currentPage: 1 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchItems.pending, (state) => { state.loading = true; })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      
      .addCase(fetchHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      });
  },
});

export default inventorySlice.reducer;
