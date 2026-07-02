import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import kycApi from '../../api/kyc.api';

export const fetchKycStatus = createAsyncThunk('kyc/fetchStatus', async (_, { rejectWithValue }) => {
  try {
    const response = await kycApi.getKycStatus();
    if (response.data && response.data.success === false) {
       return rejectWithValue(response.data.message || 'Failed to fetch KYC status');
    }
    return response.data.data || { kycStatus: 'UNVERIFIED', isKycVerified: false, kycDocuments: {} };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 404 means the customer has not submitted KYC yet. Do not show an error toast.
      return { kycStatus: 'UNVERIFIED', isKycVerified: false, kycDocuments: {} };
    }
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch KYC status');
  }
});

export const submitKycDocs = createAsyncThunk('kyc/submit', async (formData, { rejectWithValue }) => {
  try {
    const response = await kycApi.submitKyc(formData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC');
  }
});

const kycSlice = createSlice({
  name: 'kyc',
  initialState: {
    status: 'UNVERIFIED',
    isVerified: false,
    documents: {},
    customerData: {},
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetKycState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKycStatus.pending, (state) => { state.loading = true; })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.kycStatus;
        state.isVerified = action.payload.isKycVerified;
        state.documents = action.payload.kycDocuments;
        state.customerData = {
          aadharNumber: action.payload.aadharNumber,
          panNumber: action.payload.panNumber
        };
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitKycDocs.pending, (state) => { state.loading = true; })
      .addCase(submitKycDocs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.status = 'PENDING';
        if (action.payload?.kycDocuments) {
          state.documents = action.payload.kycDocuments;
        }
      })
      .addCase(submitKycDocs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetKycState } = kycSlice.actions;
export default kycSlice.reducer;
