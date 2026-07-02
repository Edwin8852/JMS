import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerApi from '../../api/customer.api';

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const response = await customerApi.fetchCustomers(filters);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
  }
}, {
  condition: (filters, { getState }) => {
    const { customers, loading } = getState().customers;
    if (customers && customers.length > 0 && (!filters || Object.keys(filters).length === 0) && !loading) {
      return false;
    }
  }
});

export const createCustomer = createAsyncThunk('customers/create', async (customerData, { rejectWithValue }) => {
  try {
    const response = await customerApi.createCustomer(customerData);
    return response.data; // Return full response to get data and credentials
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
  }
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await customerApi.updateCustomer(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
  }
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id, { rejectWithValue }) => {
  try {
    await customerApi.deleteCustomer(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
  }
});

export const resendCustomerCredentials = createAsyncThunk('customers/resendCredentials', async (id, { rejectWithValue }) => {
  try {
    const response = await customerApi.resendCredentials(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to resend credentials');
  }
});

export const fetchMyDashboard = createAsyncThunk('customers/fetchMyDashboard', async (_, { rejectWithValue }) => {
  try {
    const response = await customerApi.getMyDashboard();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
  }
}, {
  condition: (_, { getState }) => {
    const { myDashboard, loading } = getState().customers;
    if (myDashboard && !loading) {
      return false;
    }
  }
});

export const fetchMyProfile = createAsyncThunk('customers/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await customerApi.getMyProfile();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const fetchMyTransactions = createAsyncThunk('customers/fetchMyTransactions', async (_, { rejectWithValue }) => {
  try {
    const response = await customerApi.getMyTransactions();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
  }
});

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10
    },
    myDashboard: null,
    myProfile: null,
    myTransactions: []
  },
  reducers: {
    clearCustomerError: (state) => { state.error = null; },
    clearCustomerState: (state) => {
      state.myDashboard = null;
      state.myProfile = null;
      state.myTransactions = [];
      state.customers = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = Array.isArray(action.payload) ? action.payload : [];
        console.log(`[CustomerSlice] Fetched ${state.customers.length} customers.`);
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('[CustomerSlice] Fetch failed:', action.payload);
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.data);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.customers.findIndex(c => c.id === action.payload?.id);
        if (idx !== -1) state.customers[idx] = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendCustomerCredentials.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendCustomerCredentials.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendCustomerCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.myDashboard = action.payload;
      })
      .addCase(fetchMyDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.myTransactions = action.payload;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) => action.type === 'auth/logout',
        (state) => {
          state.myDashboard = null;
          state.myProfile = null;
          state.myTransactions = [];
        }
      );
  },
});


export const { clearCustomerError, clearCustomerState } = customerSlice.actions;
export default customerSlice.reducer;
