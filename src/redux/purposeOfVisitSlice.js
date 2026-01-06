import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPurposeOfVisitApi, createPurposeOfVisitApi, updatePurposeOfVisitApi, deletePurposeOfVisitApi } from '../api/PurposeOfVisitApi';

export const getPurposeOfVisit = createAsyncThunk('purposeOfVisit/getPurposeOfVisit', async (request) => {
    return await getPurposeOfVisitApi(request);
});

export const createPurposeOfVisit = createAsyncThunk('purposeOfVisit/createPurposeOfVisit', async (request) => {
    return await createPurposeOfVisitApi(request);
});

export const updatePurposeOfVisit = createAsyncThunk('purposeOfVisit/updatePurposeOfVisit', async ({ request, purposeOfVisitId }) => {
    return await updatePurposeOfVisitApi(request, purposeOfVisitId);
});

export const deletePurposeOfVisit = createAsyncThunk('purposeOfVisit/deletePurposeOfVisit', async (purposeOfVisitId) => {
    return await deletePurposeOfVisitApi(purposeOfVisitId);
});

const purposeOfVisitSlice = createSlice({
    name: 'purposeOfVisit',
    initialState: {
        purposeOfVisitData: [],
        loading: false,
        error: null,
        getPurposeOfVisitSuccess: false,
        getPurposeOfVisitFailed: false,
        createPurposeOfVisitSuccess: false,
        createPurposeOfVisitFailed: false,
        updatePurposeOfVisitSuccess: false,
        updatePurposeOfVisitFailed: false,
        deletePurposeOfVisitSuccess: false,
        deletePurposeOfVisitFailed: false,
    },
    reducers: {
        resetPurposeOfVisitStatus: (state) => {
            state.getPurposeOfVisitSuccess = false;
            state.getPurposeOfVisitFailed = false;
            state.createPurposeOfVisitSuccess = false;
            state.createPurposeOfVisitFailed = false;
            state.updatePurposeOfVisitSuccess = false;
            state.updatePurposeOfVisitFailed = false;
            state.deletePurposeOfVisitSuccess = false;
            state.deletePurposeOfVisitFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPurposeOfVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPurposeOfVisitSuccess = false;
                state.getPurposeOfVisitFailed = false;
            })
            .addCase(getPurposeOfVisit.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.purposeOfVisitData = action.payload.data.map((dept) => ({
                    id: dept.purposeOfVisitId, // Map purposeOfVisitId to id
                    purposeOfVisitName: dept.purposeOfVisitName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getPurposeOfVisitSuccess = true;
                state.getPurposeOfVisitFailed = false;
            })
            .addCase(getPurposeOfVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPurposeOfVisitSuccess = false;
                state.getPurposeOfVisitFailed = true;
            })
            // CREATE
            .addCase(createPurposeOfVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPurposeOfVisitSuccess = false;
                state.createPurposeOfVisitFailed = false;
            })
            .addCase(createPurposeOfVisit.fulfilled, (state, action) => {
                state.loading = false;
                const newPurposeOfVisit = action.payload.data || action.payload;
                // Map the new purposeOfVisit to match our structure
                state.purposeOfVisitData.push({
                    id: newPurposeOfVisit.purposeOfVisitId,
                    purposeOfVisitName: newPurposeOfVisit.purposeOfVisitName,
                    status: newPurposeOfVisit.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newPurposeOfVisit.isActive,
                    createdAt: newPurposeOfVisit.createdAt,
                    updatedAt: newPurposeOfVisit.updatedAt,
                });
                state.createPurposeOfVisitSuccess = true;
                state.createPurposeOfVisitFailed = false;
            })
            .addCase(createPurposeOfVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createPurposeOfVisitSuccess = false;
                state.createPurposeOfVisitFailed = true;
            })
            // UPDATE
            .addCase(updatePurposeOfVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updatePurposeOfVisitSuccess = false;
                state.updatePurposeOfVisitFailed = false;
            })
            .addCase(updatePurposeOfVisit.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPurposeOfVisit = action.payload.data || action.payload;
                const index = state.purposeOfVisitData.findIndex((purposeOfVisit) => purposeOfVisit.id === updatedPurposeOfVisit.purposeOfVisitId);
                if (index !== -1) {
                    state.purposeOfVisitData[index] = {
                        id: updatedPurposeOfVisit.purposeOfVisitId,
                        purposeOfVisitName: updatedPurposeOfVisit.purposeOfVisitName,
                        status: updatedPurposeOfVisit.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedPurposeOfVisit.isActive,
                        createdAt: updatedPurposeOfVisit.createdAt,
                        updatedAt: updatedPurposeOfVisit.updatedAt,
                    };
                }
                state.updatePurposeOfVisitSuccess = true;
                state.updatePurposeOfVisitFailed = false;
            })
            .addCase(updatePurposeOfVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updatePurposeOfVisitSuccess = false;
                state.updatePurposeOfVisitFailed = true;
            })
            // DELETE
            .addCase(deletePurposeOfVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePurposeOfVisitSuccess = false;
                state.deletePurposeOfVisitFailed = false;
            })
            .addCase(deletePurposeOfVisit.fulfilled, (state, action) => {
                state.loading = false;
                // Use the purposeOfVisitId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.purposeOfVisitData = state.purposeOfVisitData.filter((purposeOfVisit) => purposeOfVisit.id !== deletedId);
                state.deletePurposeOfVisitSuccess = true;
                state.deletePurposeOfVisitFailed = false;
            })
            .addCase(deletePurposeOfVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deletePurposeOfVisitSuccess = false;
                state.deletePurposeOfVisitFailed = true;
            });
    },
});

export const { resetPurposeOfVisitStatus } = purposeOfVisitSlice.actions;
export default purposeOfVisitSlice.reducer;
