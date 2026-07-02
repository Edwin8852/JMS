import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMyDocuments = createAsyncThunk('documents/fetchMyDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/documents/my-documents');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
  }
});

export const uploadDocument = createAsyncThunk('documents/uploadDocument', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
  }
});

export const fetchAllDocuments = createAsyncThunk('documents/fetchAllDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/documents/all-documents');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all documents');
  }
});

export const verifyDocument = createAsyncThunk('documents/verifyDocument', async ({ id, status, remarks }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/documents/${id}/verify`, { status, remarks });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to verify document');
  }
});

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchAllDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      });
  },
});

export default documentSlice.reducer;
