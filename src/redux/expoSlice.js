import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExpoApi, createExpoApi, updateExpoApi, deleteExpoApi } from '../api/ExpoApi';

export const getExpo = createAsyncThunk('expo/getExpo', async (request) => {
    return await getExpoApi(request);
});

export const createExpo = createAsyncThunk('expo/createExpo', async (request) => {
    return await createExpoApi(request);
});

export const updateExpo = createAsyncThunk('expo/updateExpo', async ({ request, expoId }) => {
    return await updateExpoApi(request, expoId);
});

export const deleteExpo = createAsyncThunk('expo/deleteExpo', async (expoId) => {
    return await deleteExpoApi(expoId);
});

const expoSlice = createSlice({
    name: 'expo',
    initialState: {
        expoData: [],
        loading: false,
        error: null,
        getExpoSuccess: false,
        getExpoFailed: false,
        createExpoSuccess: false,
        createExpoFailed: false,
        updateExpoSuccess: false,
        updateExpoFailed: false,
        deleteExpoSuccess: false,
        deleteExpoFailed: false,
    },
    reducers: {
        resetExpoStatus: (state) => {
            state.getExpoSuccess = false;
            state.getExpoFailed = false;
            state.createExpoSuccess = false;
            state.createExpoFailed = false;
            state.updateExpoSuccess = false;
            state.updateExpoFailed = false;
            state.deleteExpoSuccess = false;
            state.deleteExpoFailed = false;
            state.error = null;
            state.loading = false;
        },
        updateExpoLocal: (state, action) => {
            const { id, updates } = action.payload;
            const index = state.expoData.findIndex(expo => expo.id === id);
            if (index !== -1) {
                state.expoData[index] = { ...state.expoData[index], ...updates };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getExpo.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExpoSuccess = false;
                state.getExpoFailed = false;
            })
            .addCase(getExpo.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data && Array.isArray(action.payload.data)) {
                    state.expoData = action.payload.data.map((expo) => ({
                        id: expo.expoId,
                        expoName: expo.expoName,
                        country: expo.country,
                        place: expo.place,
                        fromDate: expo.fromDate,
                        toDate: expo.toDate,
                        year: expo.year,
                        staffIds: expo.staff || [], 
                        isCompleted: expo.isCompleted ,
                        status: expo.isActive,
                        isActive: expo.isActive,
                        createdAt: expo.createdAt,
                        updatedAt: expo.updatedAt,
                    }));
                }
                state.getExpoSuccess = true;
                state.getExpoFailed = false;
            })
            .addCase(getExpo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExpoSuccess = false;
                state.getExpoFailed = true;
            })
            // CREATE
            .addCase(createExpo.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createExpoSuccess = false;
                state.createExpoFailed = false;
            })
            .addCase(createExpo.fulfilled, (state, action) => {
                state.loading = false;
                const newExpo = action.payload.data || action.payload;
                if (newExpo) {
                    state.expoData.push({
                        id: newExpo.expoId,
                        expoName: newExpo.expoName,
                        country: newExpo.country,
                        place: newExpo.place,
                        fromDate: newExpo.fromDate,
                        toDate: newExpo.toDate,
                        year: newExpo.year,
                        staffIds: newExpo.staff || [],
                        isCompleted: newExpo.isCompleted,
                        status: newExpo.isActive,
                        isActive: newExpo.isActive,
                        createdAt: newExpo.createdAt,
                        updatedAt: newExpo.updatedAt,
                    });
                }
                state.createExpoSuccess = true;
                state.createExpoFailed = false;
            })
            .addCase(createExpo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createExpoSuccess = false;
                state.createExpoFailed = true;
            })
            // UPDATE
            .addCase(updateExpo.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateExpoSuccess = false;
                state.updateExpoFailed = false;
            })
            .addCase(updateExpo.fulfilled, (state, action) => {
                state.loading = false;
                const updatedExpo = action.payload.data || action.payload;
                if (updatedExpo) {
                    const index = state.expoData.findIndex((expo) => expo.id === updatedExpo.expoId);
                    if (index !== -1) {
                        state.expoData[index] = {
                            ...state.expoData[index],
                            expoName: updatedExpo.expoName,
                            country: updatedExpo.country,
                            place: updatedExpo.place,
                            fromDate: updatedExpo.fromDate,
                            toDate: updatedExpo.toDate,
                            year: updatedExpo.year,
                            staffIds: updatedExpo.staff || state.expoData[index].staffIds,
                            isCompleted: updatedExpo.isCompleted,
                            status: updatedExpo.isActive,
                            isActive: updatedExpo.isActive,
                            updatedAt: updatedExpo.updatedAt,
                        };
                    }
                }
                state.updateExpoSuccess = true;
                state.updateExpoFailed = false;
            })
            .addCase(updateExpo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateExpoSuccess = false;
                state.updateExpoFailed = true;
            })
            // DELETE
            .addCase(deleteExpo.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteExpoSuccess = false;
                state.deleteExpoFailed = false;
            })
            .addCase(deleteExpo.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.meta.arg;
                state.expoData = state.expoData.filter((expo) => expo.id !== deletedId);
                state.deleteExpoSuccess = true;
                state.deleteExpoFailed = false;
            })
            .addCase(deleteExpo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteExpoSuccess = false;
                state.deleteExpoFailed = true;
            });
    },
});

export const { resetExpoStatus, updateExpoLocal } = expoSlice.actions;
export default expoSlice.reducer;