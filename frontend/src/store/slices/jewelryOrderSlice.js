import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchOrders = createAsyncThunk('jewelryOrders/fetchOrders', async (filters, { rejectWithValue }) => {
  try {
    console.log('[DEBUG] API Request: GET /orders');
    const response = await api.get('/orders', { params: filters });
    console.log('[DEBUG] API Response for /orders:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('[DEBUG] API Error for /orders:', error);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrderById = createAsyncThunk('jewelryOrders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
  }
});

export const createOrder = createAsyncThunk('jewelryOrders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to place order');
  }
});

export const updateOrder = createAsyncThunk('jewelryOrders/updateOrder', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update order');
  }
});

export const deleteOrder = createAsyncThunk('jewelryOrders/deleteOrder', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/orders/${id}`);
    return id; // Return ID so we can update state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
  }
});

const jewelryOrderSlice = createSlice({
  name: 'jewelryOrders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload);
        if (index !== -1) {
          state.orders[index].status = 'CANCELLED';
        }
      });
  },
});

export default jewelryOrderSlice.reducer;

