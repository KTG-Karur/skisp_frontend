import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../api/EmployeeApi';

export const getEmployee = createAsyncThunk('employee/getEmployee', async (request) => {
    return await getEmployeeApi(request);
});

export const createEmployee = createAsyncThunk('employee/createEmployee', async (request) => {
    return await createEmployeeApi(request);
});

export const updateEmployee = createAsyncThunk('employee/updateEmployee', async ({ request, employeeId }) => {
    return await updateEmployeeApi(request, employeeId);
});

export const deleteEmployee = createAsyncThunk('employee/deleteEmployee', async (employeeId) => {
    return await deleteEmployeeApi(employeeId);
});

const employeeSlice = createSlice({
    name: 'employee',
    initialState: {
        employeeData: [],
        loading: false,
        error: null,
        getEmployeeSuccess: false,
        getEmployeeFailed: false,
        createEmployeeSuccess: false,
        createEmployeeFailed: false,
        updateEmployeeSuccess: false,
        updateEmployeeFailed: false,
        deleteEmployeeSuccess: false,
        deleteEmployeeFailed: false,
    },
    reducers: {
        resetEmployeeStatus: (state) => {
            state.getEmployeeSuccess = false;
            state.getEmployeeFailed = false;
            state.createEmployeeSuccess = false;
            state.createEmployeeFailed = false;
            state.updateEmployeeSuccess = false;
            state.updateEmployeeFailed = false;
            state.deleteEmployeeSuccess = false;
            state.deleteEmployeeFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getEmployeeSuccess = false;
                state.getEmployeeFailed = false;
            })
            .addCase(getEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeData = action.payload?.data || [];
                state.getEmployeeSuccess = true;
                state.getEmployeeFailed = false;
            })
            .addCase(getEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getEmployeeSuccess = false;
                state.getEmployeeFailed = true;
            })

            // CREATE
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createEmployeeSuccess = false;
                state.createEmployeeFailed = false;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeData.push(action.payload);
                state.createEmployeeSuccess = true;
                state.createEmployeeFailed = false;
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createEmployeeSuccess = false;
                state.createEmployeeFailed = true;
            })

            // UPDATE
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateEmployeeSuccess = false;
                state.updateEmployeeFailed = false;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.employeeData.findIndex((employee) => employee.id === action.payload.id);
                if (index !== -1) state.employeeData[index] = action.payload;
                state.updateEmployeeSuccess = true;
                state.updateEmployeeFailed = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateEmployeeSuccess = false;
                state.updateEmployeeFailed = true;
            })

            // DELETE
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteEmployeeSuccess = false;
                state.deleteEmployeeFailed = false;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeData = state.employeeData.filter((employee) => employee.id !== action.payload);
                state.deleteEmployeeSuccess = true;
                state.deleteEmployeeFailed = false;
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteEmployeeSuccess = false;
                state.deleteEmployeeFailed = true;
            });
    },
});

export const { resetEmployeeStatus } = employeeSlice.actions;
export default employeeSlice.reducer;
