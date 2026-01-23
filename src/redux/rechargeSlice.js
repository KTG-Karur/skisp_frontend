import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRechargeApi, createRechargeApi, updateRechargeApi } from '../api/RechargeApi';

export const getRecharge = createAsyncThunk('recharge/getRecharge', async (request) => {
    return await getRechargeApi(request);
});

export const createRecharge = createAsyncThunk('recharge/createRecharge', async (request) => {
    return await createRechargeApi(request);
});

export const updateRecharge = createAsyncThunk('recharge/updateRecharge', async ({ request, rechargeId }) => {
    return await updateRechargeApi(request, rechargeId);
});

const rechargeSlice = createSlice({
    name: 'recharge',
    initialState: {
        planDetails: null,  // Store plan details separately
        rechargeData: [],   // Store list of recharges
        loading: false,
        error: null,
        getRechargeSuccess: false,
        getRechargeFailed: false,
        createRechargeSuccess: false,
        createRechargeFailed: false,
        updateRechargeSuccess: false,
        updateRechargeFailed: false,
    },
    reducers: {
        resetRechargeStatus: (state) => {
            state.getRechargeSuccess = false;
            state.getRechargeFailed = false;
            state.createRechargeSuccess = false;
            state.createRechargeFailed = false;
            state.updateRechargeSuccess = false;
            state.updateRechargeFailed = false;
            state.error = null;
            state.loading = false;
            state.planDetails = null; // Reset plan details too
        },
        updateRechargeLocal: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.rechargeData.findIndex(recharge => recharge.id === id);
            if (index !== -1) {
                state.rechargeData[index] = { ...state.rechargeData[index], ...updates };
            }
        },
        updateRechargeStatusLocal: (state, action) => {
            const { rechargeId, isActive } = action.payload;
            const recharge = state.rechargeData.find(p => p.id === rechargeId);
            if (recharge) {
                recharge.is_active = isActive;
            }
        },
        clearPlanDetails: (state) => {
            state.planDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH PLAN DETAILS
            .addCase(getRecharge.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getRechargeSuccess = false;
                state.getRechargeFailed = false;
            })
            .addCase(getRecharge.fulfilled, (state, action) => {
                state.loading = false;
                state.planDetails = action.payload.data?.results || null;
                state.getRechargeSuccess = true;
                state.getRechargeFailed = false;
            })
            .addCase(getRecharge.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch plan details';
                state.getRechargeSuccess = false;
                state.getRechargeFailed = true;
                state.planDetails = null;
            })
            
            // CREATE RECHARGE
            .addCase(createRecharge.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createRechargeSuccess = false;
                state.createRechargeFailed = false;
            })
            .addCase(createRecharge.fulfilled, (state, action) => {
                state.loading = false;
                const newRecharge = action.payload.data || action.payload;
                if (newRecharge) {
                    state.rechargeData.push(newRecharge);
                }
                state.createRechargeSuccess = true;
                state.createRechargeFailed = false;
                state.error = null; // Clear any previous error
            })
            .addCase(createRecharge.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.error?.message || 'Create failed';
                state.createRechargeSuccess = false;
                state.createRechargeFailed = true;
            })
            
            // UPDATE RECHARGE
            .addCase(updateRecharge.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateRechargeSuccess = false;
                state.updateRechargeFailed = false;
            })
            .addCase(updateRecharge.fulfilled, (state, action) => {
                state.loading = false;
                const updatedRecharge = action.payload.data || action.payload;
                if (updatedRecharge) {
                    const index = state.rechargeData.findIndex((recharge) => recharge.id === updatedRecharge.id);
                    if (index !== -1) {
                        state.rechargeData[index] = { ...state.rechargeData[index], ...updatedRecharge };
                    }
                }
                state.updateRechargeSuccess = true;
                state.updateRechargeFailed = false;
            })
            .addCase(updateRecharge.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateRechargeSuccess = false;
                state.updateRechargeFailed = true;
            })
    },
});

export const { resetRechargeStatus, updateRechargeLocal, updateRechargeStatusLocal, clearPlanDetails } = rechargeSlice.actions;
export default rechargeSlice.reducer;