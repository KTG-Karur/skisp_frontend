import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBandWidthSyncApi, getSmartBytesSyncApi } from '../api/SyncApi';

export const syncBandWidth = createAsyncThunk('bandwidth/sync', async (request) => {
    return await getBandWidthSyncApi(request);
});

export const syncSmartBytes = createAsyncThunk('smartbytes/sync', async (request) => {
    return await getSmartBytesSyncApi(request);
});

const syncSlice = createSlice({
    name: 'sync',
    initialState: {
        bandwidth: {
            loading: false,
            success: false,
            error: null,
            message: ''
        },
        smartbytes: {
            loading: false,
            success: false,
            error: null,
            message: ''
        },
        overallSyncInProgress: false,
        lastSyncComplete: false
    },
    reducers: {
        resetSyncStatus: (state) => {
            state.bandwidth.loading = false;
            state.bandwidth.success = false;
            state.bandwidth.error = null;
            state.bandwidth.message = '';
            state.smartbytes.loading = false;
            state.smartbytes.success = false;
            state.smartbytes.error = null;
            state.smartbytes.message = '';
            state.overallSyncInProgress = false;
            state.lastSyncComplete = false;
        },
        setOverallSyncInProgress: (state, action) => {
            state.overallSyncInProgress = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Bandwidth Sync
            .addCase(syncBandWidth.pending, (state) => {
                state.bandwidth.loading = true;
                state.bandwidth.success = false;
                state.bandwidth.error = null;
                state.bandwidth.message = '';
                state.overallSyncInProgress = true;
            })
            .addCase(syncBandWidth.fulfilled, (state, action) => {
                state.bandwidth.loading = false;
                state.bandwidth.success = true;
                state.bandwidth.error = null;
                state.bandwidth.message = action.payload?.data?.message || 
                                         action.payload?.message || 
                                         'Bandwidth plans synced successfully';
            })
            .addCase(syncBandWidth.rejected, (state, action) => {
                state.bandwidth.loading = false;
                state.bandwidth.success = false;
                state.bandwidth.error = action.error.message || 'Bandwidth sync failed';
                state.bandwidth.message = 'Bandwidth sync failed';
            })
            
            // SmartBytes Sync
            .addCase(syncSmartBytes.pending, (state) => {
                state.smartbytes.loading = true;
                state.smartbytes.success = false;
                state.smartbytes.error = null;
                state.smartbytes.message = '';
                state.overallSyncInProgress = true;
            })
            .addCase(syncSmartBytes.fulfilled, (state, action) => {
                state.smartbytes.loading = false;
                state.smartbytes.success = true;
                state.smartbytes.error = null;
                state.smartbytes.message = action.payload?.data?.message || 
                                          action.payload?.message || 
                                          'Smartbytes plans synced successfully';
                if (state.bandwidth.success || state.bandwidth.loading === false) {
                    state.overallSyncInProgress = false;
                    state.lastSyncComplete = true;
                }
            })
            .addCase(syncSmartBytes.rejected, (state, action) => {
                state.smartbytes.loading = false;
                state.smartbytes.success = false;
                state.smartbytes.error = action.error.message || 'SmartBytes sync failed';
                state.smartbytes.message = 'SmartBytes sync failed';
                state.overallSyncInProgress = false;
            });
    },
});

export const { resetSyncStatus, setOverallSyncInProgress } = syncSlice.actions;
export default syncSlice.reducer;