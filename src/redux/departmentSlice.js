import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDepartmentApi, createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from '../api/DepartmentApi';

export const getDepartment = createAsyncThunk('department/getDepartment', async (request) => {
    return await getDepartmentApi(request);
});

export const createDepartment = createAsyncThunk('department/createDepartment', async (request) => {
    return await createDepartmentApi(request);
});

export const updateDepartment = createAsyncThunk('department/updateDepartment', async ({ request, departmentId }) => {
    return await updateDepartmentApi(request, departmentId);
});

export const deleteDepartment = createAsyncThunk('department/deleteDepartment', async (departmentId) => {
    return await deleteDepartmentApi(departmentId);
});

const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departmentData: [],
        loading: false,
        error: null,
        getDepartmentSuccess: false,
        getDepartmentFailed: false,
        createDepartmentSuccess: false,
        createDepartmentFailed: false,
        updateDepartmentSuccess: false,
        updateDepartmentFailed: false,
        deleteDepartmentSuccess: false,
        deleteDepartmentFailed: false,
    },
    reducers: {
        resetDepartmentStatus: (state) => {
            state.getDepartmentSuccess = false;
            state.getDepartmentFailed = false;
            state.createDepartmentSuccess = false;
            state.createDepartmentFailed = false;
            state.updateDepartmentSuccess = false;
            state.updateDepartmentFailed = false;
            state.deleteDepartmentSuccess = false;
            state.deleteDepartmentFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDepartmentSuccess = false;
                state.getDepartmentFailed = false;
            })
            .addCase(getDepartment.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.departmentData = action.payload.data.map((dept) => ({
                    id: dept.departmentId, // Map departmentId to id
                    departmentName: dept.departmentName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getDepartmentSuccess = true;
                state.getDepartmentFailed = false;
            })
            .addCase(getDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getDepartmentSuccess = false;
                state.getDepartmentFailed = true;
            })
            // CREATE
            .addCase(createDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createDepartmentSuccess = false;
                state.createDepartmentFailed = false;
            })
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.loading = false;
                const newDepartment = action.payload.data || action.payload;
                // Map the new department to match our structure
                state.departmentData.push({
                    id: newDepartment.departmentId,
                    departmentName: newDepartment.departmentName,
                    status: newDepartment.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newDepartment.isActive,
                    createdAt: newDepartment.createdAt,
                    updatedAt: newDepartment.updatedAt,
                });
                state.createDepartmentSuccess = true;
                state.createDepartmentFailed = false;
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createDepartmentSuccess = false;
                state.createDepartmentFailed = true;
            })
            // UPDATE
            .addCase(updateDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateDepartmentSuccess = false;
                state.updateDepartmentFailed = false;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDepartment = action.payload.data || action.payload;
                const index = state.departmentData.findIndex((department) => department.id === updatedDepartment.departmentId);
                if (index !== -1) {
                    state.departmentData[index] = {
                        id: updatedDepartment.departmentId,
                        departmentName: updatedDepartment.departmentName,
                        status: updatedDepartment.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedDepartment.isActive,
                        createdAt: updatedDepartment.createdAt,
                        updatedAt: updatedDepartment.updatedAt,
                    };
                }
                state.updateDepartmentSuccess = true;
                state.updateDepartmentFailed = false;
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateDepartmentSuccess = false;
                state.updateDepartmentFailed = true;
            })
            // DELETE
            .addCase(deleteDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteDepartmentSuccess = false;
                state.deleteDepartmentFailed = false;
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.loading = false;
                // Use the departmentId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.departmentData = state.departmentData.filter((department) => department.id !== deletedId);
                state.deleteDepartmentSuccess = true;
                state.deleteDepartmentFailed = false;
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteDepartmentSuccess = false;
                state.deleteDepartmentFailed = true;
            });
    },
});

export const { resetDepartmentStatus } = departmentSlice.actions;
export default departmentSlice.reducer;
