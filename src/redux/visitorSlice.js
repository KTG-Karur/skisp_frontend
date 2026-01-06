import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVisitorApi, createVisitorApi, updateVisitorApi, getCompanyCodeApi, getPurposeOfVisitApi, getVisitorByNumberApi, getDashbordCountApi } from '../api/VisitorApi';
import { getEmployeeApi } from '../api/EmployeeApi';

// Async thunks
export const getVisitor = createAsyncThunk('visitor/getVisitor', async (request) => {
    return await getVisitorApi(request);
});

export const createVisitor = createAsyncThunk('visitor/createVisitor', async (request) => {
    return await createVisitorApi(request);
});

export const updateVisitor = createAsyncThunk('visitor/updateVisitor', async ({ request, visitorId }) => {
    return await updateVisitorApi(request, visitorId);
});

export const getCompanyCode = createAsyncThunk('visitor/getCompanyCode', async (request) => {
    return await getCompanyCodeApi(request);
});

export const getPurposeOfVisit = createAsyncThunk('visitor/getPurposeOfVisit', async (request) => {
    return await getPurposeOfVisitApi(request);
});

export const getEmployee = createAsyncThunk('visitor/getEmployee', async (request) => {
    return await getEmployeeApi(request);
});

export const getVisitorByNumber = createAsyncThunk('visitor/getVisitorByNumber', async (request) => {
    return await getVisitorByNumberApi(request);
});

export const getDashordCount = createAsyncThunk('visitor/getDashordCount', async (request) => {
    return await getDashbordCountApi(request);
});

const visitorSlice = createSlice({
    name: 'visitor',
    initialState: {
        visitorData: [],
        companyList: [],
        purposeList: [],
        staffList: [],
        visitorByNumber: [],
        DashordCount: [],
        loading: false,
        error: null,
        getVisitorSuccess: false,
        getVisitorFailed: false,
        createVisitorSuccess: false,
        createVisitorFailed: false,
        updateVisitorSuccess: false,
        updateVisitorFailed: false,
        getDropdownsSuccess: false,
        getDropdownsFailed: false,
        getVisitorByNumberSuccess: false,
        getVisitorByNumberFailed: false,
        getDashordCountSuccess: false,
        getDashordCountFailed: false,
    },
    reducers: {
        resetVisitorStatus: (state) => {
            state.getVisitorSuccess = false;
            state.getVisitorFailed = false;
            state.createVisitorSuccess = false;
            state.createVisitorFailed = false;
            state.updateVisitorSuccess = false;
            state.updateVisitorFailed = false;
            state.getDropdownsSuccess = false;
            state.getDropdownsFailed = false;
            state.getVisitorByNumberSuccess = false;
            state.getVisitorByNumberFailed = false;
            state.getDashordCountSuccess = false;
            state.getDashordCountFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearVisitorData: (state) => {
            state.visitorData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET VISITOR
            .addCase(getVisitor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getVisitorSuccess = false;
                state.getVisitorFailed = false;
            })
            .addCase(getVisitor.fulfilled, (state, action) => {
                state.loading = false;
                state.visitorData = action.payload.data;
                state.getVisitorSuccess = true;
                state.getVisitorFailed = false;
            })
            .addCase(getVisitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch visitors failed';
                state.getVisitorSuccess = false;
                state.getVisitorFailed = true;
            })
            // CREATE VISITOR
            .addCase(createVisitor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createVisitorSuccess = false;
                state.createVisitorFailed = false;
            })
            .addCase(createVisitor.fulfilled, (state, action) => {
                state.loading = false;
                state.visitorData.unshift(action.payload.data[0]);
                state.createVisitorSuccess = true;
                state.createVisitorFailed = false;
            })
            .addCase(createVisitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create visitor failed';
                state.createVisitorSuccess = false;
                state.createVisitorFailed = true;
            })
            // UPDATE VISITOR
            .addCase(updateVisitor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateVisitorSuccess = false;
                state.updateVisitorFailed = false;
            })
            .addCase(updateVisitor.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.visitorData.findIndex((visitor) => visitor.visitorId === action.payload.data[0].visitorId);
                if (index !== -1) state.visitorData[index] = action.payload.data[0];
                state.updateVisitorSuccess = true;
                state.updateVisitorFailed = false;
            })
            .addCase(updateVisitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update visitor failed';
                state.updateVisitorSuccess = false;
                state.updateVisitorFailed = true;
            })
            // GET COMPANY CODE
            .addCase(getCompanyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCompanyCode.fulfilled, (state, action) => {
                state.loading = false;
                state.companyList = action.payload.data.map((company) => ({
                    value: company.companyCodeId,
                    label: `${company.companyCode} - ${company.companyCodeName}`,
                }));
            })
            .addCase(getCompanyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch company codes failed';
            })
            // GET PURPOSE OF VISIT
            .addCase(getPurposeOfVisit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPurposeOfVisit.fulfilled, (state, action) => {
                state.loading = false;
                state.purposeList = action.payload.data.map((purpose) => ({
                    value: purpose.purposeOfVisitId,
                    label: purpose.purposeOfVisitName,
                }));
            })
            .addCase(getPurposeOfVisit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch purposes failed';
            })
            // GET EMPLOYEE (Staff)
            .addCase(getEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.staffList = action.payload.data.map((employee) => ({
                    value: employee.employeeId,
                    label: `${employee.employeeName} - ${employee.departmentName || employee.roleName || 'Employee'}`,
                }));
                state.getDropdownsSuccess = true;
                state.getDropdownsFailed = false;
            })
            .addCase(getEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch employees failed';
                state.getDropdownsSuccess = false;
                state.getDropdownsFailed = true;
            })
            // GET Visitor by number
            .addCase(getVisitorByNumber.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVisitorByNumber.fulfilled, (state, action) => {
                state.loading = false;
                state.visitorByNumber = action.payload.data.map((visitor) => ({
                    visitorName: visitor.visitorName,
                    mobileNumber: visitor.mobileNumber,
                    customerCode: visitor.customerCode,
                }));
                state.getVisitorByNumberSuccess = true;
                state.getVisitorByNumberFailed = false;
            })
            .addCase(getVisitorByNumber.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch employees failed';
                state.getVisitorByNumberSuccess = false;
                state.getVisitorByNumberFailed = true;
            })
            // GET Dashbord Count
            .addCase(getDashordCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashordCount.fulfilled, (state, action) => {
                state.loading = false;

                const dcount = action.payload.data || {};
                state.DashordCount = {
                    todayVisitors: dcount.todayVisitors ?? 0,
                    weeklyVisitors: dcount.weeklyVisitors ?? 0,
                    monthlyVisitors: dcount.monthlyVisitors ?? 0,
                    pendingReturns: dcount.pendingReturns ?? 0,
                };

                state.getDashordCountSuccess = true;
                state.getDashordCountFailed = false;
            })

            .addCase(getDashordCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch employees failed';
                state.getDashordCountSuccess = false;
                state.getDashordCountFailed = true;
            });
    },
});

export const { resetVisitorStatus, clearVisitorData } = visitorSlice.actions;
export default visitorSlice.reducer;
