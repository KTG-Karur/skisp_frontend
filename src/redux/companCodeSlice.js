import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyCodeApi, createCompanyCodeApi, updateCompanyCodeApi, deleteCompanyCodeApi } from '../api/CompanyCodeApi';

export const getCompanyCode = createAsyncThunk('companyCode/getCompanyCode', async (request) => {
    return await getCompanyCodeApi(request);
});

export const createCompanyCode = createAsyncThunk('companyCode/createCompanyCode', async (request) => {
    return await createCompanyCodeApi(request);
});

export const updateCompanyCode = createAsyncThunk('companyCode/updateCompanyCode', async ({ request, companyCodeId }) => {
    return await updateCompanyCodeApi(request, companyCodeId);
});

export const deleteCompanyCode = createAsyncThunk('companyCode/deleteCompanyCode', async (companyCodeId) => {
    return await deleteCompanyCodeApi(companyCodeId);
});

const companyCodeSlice = createSlice({
    name: 'companyCode',
    initialState: {
        companyCodeData: [],
        loading: false,
        error: null,
        getCompanyCodeSuccess: false,
        getCompanyCodeFailed: false,
        createCompanyCodeSuccess: false,
        createCompanyCodeFailed: false,
        updateCompanyCodeSuccess: false,
        updateCompanyCodeFailed: false,
        deleteCompanyCodeSuccess: false,
        deleteCompanyCodeFailed: false,
    },
    reducers: {
        resetCompanyCodeStatus: (state) => {
            state.getCompanyCodeSuccess = false;
            state.getCompanyCodeFailed = false;
            state.createCompanyCodeSuccess = false;
            state.createCompanyCodeFailed = false;
            state.updateCompanyCodeSuccess = false;
            state.updateCompanyCodeFailed = false;
            state.deleteCompanyCodeSuccess = false;
            state.deleteCompanyCodeFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getCompanyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCompanyCodeSuccess = false;
                state.getCompanyCodeFailed = false;
            })
            .addCase(getCompanyCode.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.companyCodeData = action.payload.data.map((dept) => ({
                    id: dept.companyCodeId, // Map companyCodeId to id
                    companyCodeName: dept.companyCodeName,
                    companyCode: dept.companyCode,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getCompanyCodeSuccess = true;
                state.getCompanyCodeFailed = false;
            })
            .addCase(getCompanyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getCompanyCodeSuccess = false;
                state.getCompanyCodeFailed = true;
            })
            // CREATE
            .addCase(createCompanyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createCompanyCodeSuccess = false;
                state.createCompanyCodeFailed = false;
            })
            .addCase(createCompanyCode.fulfilled, (state, action) => {
                state.loading = false;
                const newCompanyCode = action.payload.data || action.payload;
                // Map the new companyCode to match our structure
                state.companyCodeData.push({
                    id: newCompanyCode.companyCodeId,
                    companyCodeName: newCompanyCode.companyCodeName,
                    companyCode: newCompanyCode.companyCode,
                    status: newCompanyCode.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newCompanyCode.isActive,
                    createdAt: newCompanyCode.createdAt,
                    updatedAt: newCompanyCode.updatedAt,
                });
                state.createCompanyCodeSuccess = true;
                state.createCompanyCodeFailed = false;
            })
            .addCase(createCompanyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createCompanyCodeSuccess = false;
                state.createCompanyCodeFailed = true;
            })
            // UPDATE
            .addCase(updateCompanyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateCompanyCodeSuccess = false;
                state.updateCompanyCodeFailed = false;
            })
            .addCase(updateCompanyCode.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCompanyCode = action.payload.data || action.payload;
                const index = state.companyCodeData.findIndex((companyCode) => companyCode.id === updatedCompanyCode.companyCodeId);
                if (index !== -1) {
                    state.companyCodeData[index] = {
                        id: updatedCompanyCode.companyCodeId,
                        companyCodeName: updatedCompanyCode.companyCodeName,
                        companyCode: updatedCompanyCode.companyCode,
                        status: updatedCompanyCode.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedCompanyCode.isActive,
                        createdAt: updatedCompanyCode.createdAt,
                        updatedAt: updatedCompanyCode.updatedAt,
                    };
                }
                state.updateCompanyCodeSuccess = true;
                state.updateCompanyCodeFailed = false;
            })
            .addCase(updateCompanyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateCompanyCodeSuccess = false;
                state.updateCompanyCodeFailed = true;
            })
            // DELETE
            .addCase(deleteCompanyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteCompanyCodeSuccess = false;
                state.deleteCompanyCodeFailed = false;
            })
            .addCase(deleteCompanyCode.fulfilled, (state, action) => {
                state.loading = false;
                // Use the companyCodeId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.companyCodeData = state.companyCodeData.filter((companyCode) => companyCode.id !== deletedId);
                state.deleteCompanyCodeSuccess = true;
                state.deleteCompanyCodeFailed = false;
            })
            .addCase(deleteCompanyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteCompanyCodeSuccess = false;
                state.deleteCompanyCodeFailed = true;
            });
    },
});

export const { resetCompanyCodeStatus } = companyCodeSlice.actions;
export default companyCodeSlice.reducer;
