import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMyTickets = createAsyncThunk('support/fetchMyTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/support/my-tickets');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
  }
});

export const createTicket = createAsyncThunk('support/createTicket', async (ticketData, { rejectWithValue }) => {
  try {
    const response = await api.post('/support/tickets', ticketData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create ticket');
  }
});

export const fetchAllTickets = createAsyncThunk('support/fetchAllTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/support/all-tickets');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all tickets');
  }
});

export const respondToTicket = createAsyncThunk('support/respondToTicket', async ({ id, response, status }, { rejectWithValue }) => {
  try {
    const responseData = await api.patch(`/support/tickets/${id}/respond`, { response, status });
    return responseData.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to respond to ticket');
  }
});

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // My Tickets
      .addCase(fetchMyTickets.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // All Tickets (Admin)
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Respond to Ticket
      .addCase(respondToTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(respondToTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })
      .addCase(respondToTicket.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default supportSlice.reducer;
