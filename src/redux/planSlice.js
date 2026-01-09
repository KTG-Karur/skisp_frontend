import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPlanApi, createPlanApi, updatePlanApi, deletePlanApi, updatePlanStatusApi } from '../api/PlanApi';

export const getPlan = createAsyncThunk('plan/getPlan', async (request) => {
    return await getPlanApi(request);
});

export const createPlan = createAsyncThunk('plan/createPlan', async (request) => {
    return await createPlanApi(request);
});

export const updatePlan = createAsyncThunk('plan/updatePlan', async ({ request, planId }) => {
    return await updatePlanApi(request, planId);
});

export const deletePlan = createAsyncThunk('plan/deletePlan', async (planId) => {
    return await deletePlanApi(planId);
});

export const updatePlanStatus = createAsyncThunk('plan/updatePlanStatus', async ({ planId, isActive }) => {
    return await updatePlanStatusApi(planId, isActive);
});

const planSlice = createSlice({
    name: 'plan',
    initialState: {
        planData: [],
        loading: false,
        error: null,
        getPlanSuccess: false,
        getPlanFailed: false,
        createPlanSuccess: false,
        createPlanFailed: false,
        updatePlanSuccess: false,
        updatePlanFailed: false,
        deletePlanSuccess: false,
        deletePlanFailed: false,
        statusUpdateSuccess: false,
        statusUpdateFailed: false,
    },
    reducers: {
        resetPlanStatus: (state) => {
            state.getPlanSuccess = false;
            state.getPlanFailed = false;
            state.createPlanSuccess = false;
            state.createPlanFailed = false;
            state.updatePlanSuccess = false;
            state.updatePlanFailed = false;
            state.deletePlanSuccess = false;
            state.deletePlanFailed = false;
            state.statusUpdateSuccess = false;
            state.statusUpdateFailed = false;
            state.error = null;
            state.loading = false;
        },
        updatePlanLocal: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.planData.findIndex(plan => plan.id === id);
            if (index !== -1) {
                state.planData[index] = { ...state.planData[index], ...updates };
            }
        },
        updatePlanStatusLocal: (state, action) => {
            const { planId, isActive } = action.payload;
            const plan = state.planData.find(p => p.id === planId);
            if (plan) {
                plan.is_active = isActive;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPlanSuccess = false;
                state.getPlanFailed = false;
            })
            .addCase(getPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.planData = action.payload.data || [];
                state.getPlanSuccess = true;
                state.getPlanFailed = false;
            })
            .addCase(getPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPlanSuccess = false;
                state.getPlanFailed = true;
            })
            
            // CREATE
            .addCase(createPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPlanSuccess = false;
                state.createPlanFailed = false;
            })
            .addCase(createPlan.fulfilled, (state, action) => {
                state.loading = false;
                const newPlan = action.payload.data || action.payload;
                if (newPlan) {
                    state.planData.push(newPlan);
                }
                state.createPlanSuccess = true;
                state.createPlanFailed = false;
            })
            .addCase(createPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createPlanSuccess = false;
                state.createPlanFailed = true;
            })
            
            // UPDATE
            .addCase(updatePlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updatePlanSuccess = false;
                state.updatePlanFailed = false;
            })
            .addCase(updatePlan.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPlan = action.payload.data || action.payload;
                if (updatedPlan) {
                    const index = state.planData.findIndex((plan) => plan.id === updatedPlan.id);
                    if (index !== -1) {
                        state.planData[index] = { ...state.planData[index], ...updatedPlan };
                    }
                }
                state.updatePlanSuccess = true;
                state.updatePlanFailed = false;
            })
            .addCase(updatePlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updatePlanSuccess = false;
                state.updatePlanFailed = true;
            })
            
            // DELETE
            .addCase(deletePlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePlanSuccess = false;
                state.deletePlanFailed = false;
            })
            .addCase(deletePlan.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.meta.arg;
                state.planData = state.planData.filter((plan) => plan.id !== deletedId);
                state.deletePlanSuccess = true;
                state.deletePlanFailed = false;
            })
            .addCase(deletePlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deletePlanSuccess = false;
                state.deletePlanFailed = true;
            })
            
            // UPDATE STATUS
            .addCase(updatePlanStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.statusUpdateSuccess = false;
                state.statusUpdateFailed = false;
            })
            .addCase(updatePlanStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { planId, isActive } = action.meta.arg;
                const plan = state.planData.find(p => p.id === planId);
                if (plan) {
                    plan.is_active = isActive;
                }
                state.statusUpdateSuccess = true;
                state.statusUpdateFailed = false;
            })
            .addCase(updatePlanStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Status update failed';
                state.statusUpdateSuccess = false;
                state.statusUpdateFailed = true;
            });
    },
});

export const { resetPlanStatus, updatePlanLocal, updatePlanStatusLocal } = planSlice.actions;
export default planSlice.reducer;