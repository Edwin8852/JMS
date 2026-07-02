import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chitApi from '../../api/chit.api';

export const fetchSchemes = createAsyncThunk('chitFund/fetchSchemes', async (_, { rejectWithValue }) => {
  try {
    const response = await chitApi.fetchSchemes();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch schemes');
  }
});

export const fetchAvailableSchemes = createAsyncThunk('chitFund/fetchAvailableSchemes', async (_, { rejectWithValue }) => {
  try {
    const response = await chitApi.getAvailableSchemes();
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch available schemes');
  }
});

export const createScheme = createAsyncThunk('chitFund/createScheme', async (schemeData, { rejectWithValue }) => {
  try {
    const response = await chitApi.createScheme(schemeData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create scheme');
  }
});

export const updateScheme = createAsyncThunk('chitFund/updateScheme', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await chitApi.updateScheme(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update scheme');
  }
});

export const deleteScheme = createAsyncThunk('chitFund/deleteScheme', async (id, { rejectWithValue }) => {
  try {
    await chitApi.deleteScheme(id);
    return id; // return id to remove from state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete scheme');
  }
});

export const enrollSubscriber = createAsyncThunk('chitFund/enrollSubscriber', async (enrollData, { rejectWithValue }) => {
  try {
    const response = await chitApi.enrollSubscriber(enrollData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to enroll subscriber');
  }
});

export const collectPayment = createAsyncThunk('chitFund/collectPayment', async ({ installmentId, paymentData }, { rejectWithValue }) => {
  try {
    const response = await chitApi.collectPayment(installmentId, paymentData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to collect payment');
  }
});

export const fetchSubscriberDetails = createAsyncThunk('chitFund/fetchSubscriberDetails', async (subscriberId, { rejectWithValue }) => {
  try {
    const response = await chitApi.getSubscriberDetails(subscriberId);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriber details');
  }
});

export const conductAuction = createAsyncThunk('chitFund/conductAuction', async (auctionData, { rejectWithValue }) => {
  try {
    const response = await chitApi.conductAuction(auctionData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to conduct auction');
  }
});

export const fetchAuctions = createAsyncThunk('chitFund/fetchAuctions', async (schemeId, { rejectWithValue }) => {
  try {
    const response = await chitApi.fetchAuctions(schemeId);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch auctions');
  }
});

const chitFundSlice = createSlice({
  name: 'chitFund',
  initialState: {
    schemes: [],
    availableSchemes: [],
    currentSubscriber: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearChitError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchemes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchemes.fulfilled, (state, action) => {
        state.loading = false;
        state.schemes = action.payload;
      })
      .addCase(fetchSchemes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableSchemes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableSchemes.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSchemes = action.payload;
      })
      .addCase(fetchAvailableSchemes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createScheme.fulfilled, (state, action) => {
        state.schemes.unshift(action.payload); // Add to top
      })
      .addCase(updateScheme.fulfilled, (state, action) => {
        const index = state.schemes.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.schemes[index] = action.payload;
        }
      })
      .addCase(deleteScheme.fulfilled, (state, action) => {
        state.schemes = state.schemes.filter(s => s.id !== action.payload);
      })
      .addCase(fetchSubscriberDetails.fulfilled, (state, action) => {
        state.currentSubscriber = action.payload;
      })
      .addCase(conductAuction.pending, (state) => {
        state.loading = true;
      })
      .addCase(conductAuction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(conductAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChitError } = chitFundSlice.actions;
export default chitFundSlice.reducer;
