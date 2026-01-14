import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllUsersFromHS5200Api, syncAllUsersApi, syncSpecificUserApi, forceSyncUsersApi, getSyncStatusApi, getSyncSummaryApi } from '../api/UserSyncApi';

// Async Thunks
export const getAllUsersFromHS5200 = createAsyncThunk('userSync/getAllUsers', async (params) => {
    return await getAllUsersFromHS5200Api(params);
});

export const syncAllUsers = createAsyncThunk('userSync/syncAllUsers', async () => {
    return await syncAllUsersApi();
});

export const syncSpecificUser = createAsyncThunk('userSync/syncSpecificUser', async (userId) => {
    return await syncSpecificUserApi(userId);
});

export const forceSyncUsers = createAsyncThunk('userSync/forceSyncUsers', async (userIds) => {
    return await forceSyncUsersApi(userIds);
});

export const getSyncStatus = createAsyncThunk('userSync/getSyncStatus', async (syncId) => {
    return await getSyncStatusApi(syncId);
});

export const getSyncSummary = createAsyncThunk('userSync/getSyncSummary', async () => {
    return await getSyncSummaryApi();
});

const userSyncSlice = createSlice({
    name: 'userSync',
    initialState: {
        // Data
        allUsers: [], // Users from HS5200 (not synced yet)
        syncResults: null,
        syncStatus: null,
        syncSummary: null,

        // Active sync tracking
        activeSyncs: [],

        // Loading states
        loading: false,
        syncing: false,
        statusLoading: false,
        summaryLoading: false,

        // Status flags
        getAllUsersSuccess: false,
        syncAllSuccess: false,
        syncSpecificSuccess: false,
        forceSyncSuccess: false,
        getSyncStatusSuccess: false,
        getSyncSummarySuccess: false,

        // Error flags
        getAllUsersFailed: false,
        syncAllFailed: false,
        syncSpecificFailed: false,
        forceSyncFailed: false,
        getSyncStatusFailed: false,
        getSyncSummaryFailed: false,

        // Error message
        error: null,
    },
    reducers: {
        resetUserSyncStatus: (state) => {
            state.getAllUsersSuccess = false;
            state.syncAllSuccess = false;
            state.syncSpecificSuccess = false;
            state.forceSyncSuccess = false;
            state.getSyncStatusSuccess = false;
            state.getSyncSummarySuccess = false;

            state.getAllUsersFailed = false;
            state.syncAllFailed = false;
            state.syncSpecificFailed = false;
            state.forceSyncFailed = false;
            state.getSyncStatusFailed = false;
            state.getSyncSummaryFailed = false;

            state.error = null;
            state.loading = false;
            state.syncing = false;
            state.statusLoading = false;
            state.summaryLoading = false;
        },
        clearAllUsers: (state) => {
            state.allUsers = [];
        },
        clearSyncResults: (state) => {
            state.syncResults = null;
        },
        clearSyncStatus: (state) => {
            state.syncStatus = null;
        },
        clearSyncSummary: (state) => {
            state.syncSummary = null;
        },
        addActiveSync: (state, action) => {
            state.activeSyncs.push(action.payload);
        },
        updateActiveSync: (state, action) => {
            const { syncId, updates } = action.payload;
            const index = state.activeSyncs.findIndex((sync) => sync.sync_id === syncId);
            if (index !== -1) {
                state.activeSyncs[index] = { ...state.activeSyncs[index], ...updates };
            }
        },
        removeActiveSync: (state, action) => {
            const syncId = action.payload;
            state.activeSyncs = state.activeSyncs.filter((sync) => sync.sync_id !== syncId);
        },
        updateSyncProgress: (state, action) => {
            const { syncId, processed, synced, failed } = action.payload;
            const sync = state.activeSyncs.find((s) => s.sync_id === syncId);
            if (sync) {
                sync.processed = processed;
                sync.synced = synced;
                sync.failed = failed;
                if (sync.totalUsers > 0) {
                    sync.progress = Math.round((processed / sync.totalUsers) * 100);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL USERS
            .addCase(getAllUsersFromHS5200.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAllUsersSuccess = false;
                state.getAllUsersFailed = false;
            })
            .addCase(getAllUsersFromHS5200.fulfilled, (state, action) => {
                state.loading = false;
                state.allUsers = action.payload.data?.users || [];
                state.getAllUsersSuccess = true;
                state.getAllUsersFailed = false;
            })
            .addCase(getAllUsersFromHS5200.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to get users from HS5200';
                state.getAllUsersSuccess = false;
                state.getAllUsersFailed = true;
            })

            // SYNC ALL USERS
            .addCase(syncAllUsers.pending, (state) => {
                state.syncing = true;
                state.error = null;
                state.syncAllSuccess = false;
                state.syncAllFailed = false;
            })
            .addCase(syncAllUsers.fulfilled, (state, action) => {
                state.syncing = false;
                state.syncResults = action.payload.data;
                if (action.payload.data?.sync_id) {
                    state.activeSyncs.push({
                        sync_id: action.payload.data.sync_id,
                        status: 'pending',
                        progress: 0,
                        totalUsers: 0,
                        processed: 0,
                        synced: 0,
                        failed: 0,
                        startTime: new Date().toISOString(),
                    });
                }
                state.syncAllSuccess = true;
                state.syncAllFailed = false;
            })
            .addCase(syncAllUsers.rejected, (state, action) => {
                state.syncing = false;
                state.error = action.error.message || 'Failed to start user sync';
                state.syncAllSuccess = false;
                state.syncAllFailed = true;
            })

            // SYNC SPECIFIC USER
            .addCase(syncSpecificUser.pending, (state) => {
                state.syncing = true;
                state.error = null;
                state.syncSpecificSuccess = false;
                state.syncSpecificFailed = false;
            })
            .addCase(syncSpecificUser.fulfilled, (state, action) => {
                state.syncing = false;
                state.syncResults = action.payload.data;
                state.syncSpecificSuccess = true;
                state.syncSpecificFailed = false;
            })
            .addCase(syncSpecificUser.rejected, (state, action) => {
                state.syncing = false;
                state.error = action.error.message || 'Failed to sync user';
                state.syncSpecificSuccess = false;
                state.syncSpecificFailed = true;
            })

            // FORCE SYNC USERS
            .addCase(forceSyncUsers.pending, (state) => {
                state.syncing = true;
                state.error = null;
                state.forceSyncSuccess = false;
                state.forceSyncFailed = false;
            })
            .addCase(forceSyncUsers.fulfilled, (state, action) => {
                state.syncing = false;
                state.syncResults = action.payload.data;
                if (action.payload.data?.sync_id) {
                    state.activeSyncs.push({
                        sync_id: action.payload.data.sync_id,
                        status: 'pending',
                        progress: 0,
                        totalUsers: action.payload.data?.user_count || 0,
                        processed: 0,
                        synced: 0,
                        failed: 0,
                        startTime: new Date().toISOString(),
                    });
                }
                state.forceSyncSuccess = true;
                state.forceSyncFailed = false;
            })
            .addCase(forceSyncUsers.rejected, (state, action) => {
                state.syncing = false;
                state.error = action.error.message || 'Failed to force sync users';
                state.forceSyncSuccess = false;
                state.forceSyncFailed = true;
            })

            // GET SYNC STATUS
            .addCase(getSyncStatus.pending, (state) => {
                state.statusLoading = true;
                state.error = null;
                state.getSyncStatusSuccess = false;
                state.getSyncStatusFailed = false;
            })
            .addCase(getSyncStatus.fulfilled, (state, action) => {
                state.statusLoading = false;
                state.syncStatus = action.payload.data;

                // Update active sync if found
                if (action.payload.data?.sync_id) {
                    const index = state.activeSyncs.findIndex((sync) => sync.sync_id === action.payload.data.sync_id);
                    if (index !== -1) {
                        state.activeSyncs[index] = {
                            ...state.activeSyncs[index],
                            ...action.payload.data,
                            progress: action.payload.data.progress || 0,
                        };
                    }
                }

                state.getSyncStatusSuccess = true;
                state.getSyncStatusFailed = false;
            })
            .addCase(getSyncStatus.rejected, (state, action) => {
                state.statusLoading = false;
                state.error = action.error.message || 'Failed to get sync status';
                state.getSyncStatusSuccess = false;
                state.getSyncStatusFailed = true;
            })

            // GET SYNC SUMMARY
            .addCase(getSyncSummary.pending, (state) => {
                state.summaryLoading = true;
                state.error = null;
                state.getSyncSummarySuccess = false;
                state.getSyncSummaryFailed = false;
            })
            .addCase(getSyncSummary.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.syncSummary = action.payload.data;
                state.getSyncSummarySuccess = true;
                state.getSyncSummaryFailed = false;
            })
            .addCase(getSyncSummary.rejected, (state, action) => {
                state.summaryLoading = false;
                state.error = action.error.message || 'Failed to get sync summary';
                state.getSyncSummarySuccess = false;
                state.getSyncSummaryFailed = true;
            });
    },
});

export const { resetUserSyncStatus, clearAllUsers, clearSyncResults, clearSyncStatus, clearSyncSummary, addActiveSync, updateActiveSync, removeActiveSync, updateSyncProgress } = userSyncSlice.actions;

export default userSyncSlice.reducer;
