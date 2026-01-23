import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCustomersApi,
    createCustomerApi,
    updateCustomerApi,
    deleteCustomerApi,
    changeCustomerPasswordApi,
    getCustomerUsageApi,
    getOperationsHistoryApi,
    retryOperationApi,
    getCustomerDetailsApi,
    syncCustomerApi,
    getAllPlansApi,
} from '../api/CustomerApi';

// Async Thunks
export const getCustomers = createAsyncThunk('customer/getCustomers', async (params) => {
    return await getCustomersApi(params);
});

export const createCustomer = createAsyncThunk('customer/createCustomer', async (request) => {
    return await createCustomerApi(request);
});

export const updateCustomer = createAsyncThunk('customer/updateCustomer', async ({ request, userId }) => {
    return await updateCustomerApi(request, userId);
});

export const deleteCustomer = createAsyncThunk('customer/deleteCustomer', async (userId) => {
    return await deleteCustomerApi(userId);
});

export const syncCustomer = createAsyncThunk('customer/syncCustomer', async (userId) => {
    return await syncCustomerApi(userId);
});

export const getCustomerDetails = createAsyncThunk('customer/getCustomerDetails', async (userId) => {
    return await getCustomerDetailsApi(userId);
});

export const getAllPlans = createAsyncThunk('customer/getAllPlans', async () => {
    return await getAllPlansApi();
});

export const changeCustomerPassword = createAsyncThunk('customer/changePassword', async ({ userId, newPassword }) => {
    return await changeCustomerPasswordApi(userId, newPassword);
});

export const getCustomerUsage = createAsyncThunk('customer/getUsage', async (userId) => {
    return await getCustomerUsageApi(userId);
});

export const getOperationsHistory = createAsyncThunk('customer/getOperationsHistory', async (params) => {
    return await getOperationsHistoryApi(params);
});

export const retryOperation = createAsyncThunk('customer/retryOperation', async (operationId) => {
    return await retryOperationApi(operationId);
});

const customerSlice = createSlice({
    name: 'customer',
    initialState: {
        customers: [],
        operations: [],
        selectedCustomer: null,
        customerUsage: null,
        customerDetails: null,
        plans: [],
        loading: false,
        plansLoading: false,
        error: null,

        // Status flags
        getCustomersSuccess: false,
        createCustomerSuccess: false,
        updateCustomerSuccess: false,
        deleteCustomerSuccess: false,
        changePasswordSuccess: false,
        getUsageSuccess: false,
        getOperationsHistorySuccess: false,
        retryOperationSuccess: false,
        syncCustomerSuccess: false,
        getCustomerDetailsSuccess: false,
        getAllPlansSuccess: false,

        // Error flags
        getCustomersFailed: false,
        createCustomerFailed: false,
        updateCustomerFailed: false,
        deleteCustomerFailed: false,
        changePasswordFailed: false,
        getUsageFailed: false,
        getOperationsHistoryFailed: false,
        retryOperationFailed: false,
        syncCustomerFailed: false,
        getCustomerDetailsFailed: false,
        getAllPlansFailed: false,

        // Additional stats
        total: 0,
        successful_users: 0,
        failed_users: 0,
        success_rate: 0,
    },
    reducers: {
        resetCustomerStatus: (state) => {
            state.getCustomersSuccess = false;
            state.createCustomerSuccess = false;
            state.updateCustomerSuccess = false;
            state.deleteCustomerSuccess = false;
            state.changePasswordSuccess = false;
            state.getUsageSuccess = false;
            state.getOperationsHistorySuccess = false;
            state.retryOperationSuccess = false;
            state.syncCustomerSuccess = false;
            state.getCustomerDetailsSuccess = false;
            state.getAllPlansSuccess = false;

            state.getCustomersFailed = false;
            state.createCustomerFailed = false;
            state.updateCustomerFailed = false;
            state.deleteCustomerFailed = false;
            state.changePasswordFailed = false;
            state.getUsageFailed = false;
            state.getOperationsHistoryFailed = false;
            state.retryOperationFailed = false;
            state.syncCustomerFailed = false;
            state.getCustomerDetailsFailed = false;
            state.getAllPlansFailed = false;

            state.error = null;
            state.loading = false;
            state.plansLoading = false;
        },
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload;
        },
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        },
        clearCustomerUsage: (state) => {
            state.customerUsage = null;
        },
        clearCustomerDetails: (state) => {
            state.customerDetails = null;
        },
        clearOperations: (state) => {
            state.operations = [];
        },
        clearPlans: (state) => {
            state.plans = [];
        },
        updateCustomerLocal: (state, action) => {
            const { customerId, updates } = action.payload;
            const index = state.customers.findIndex((customer) => customer.user_id === customerId);
            if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...updates };
            }
        },
        addCustomerLocal: (state, action) => {
            state.customers.unshift(action.payload);
        },
        removeCustomerLocal: (state, action) => {
            const customerId = action.payload;
            state.customers = state.customers.filter((customer) => customer.user_id !== customerId);
        },
    },
    extraReducers: (builder) => {
        builder
            // GET CUSTOMERS
            .addCase(getCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCustomersSuccess = false;
                state.getCustomersFailed = false;
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.loading = false;
                const responseData = action.payload?.data || action.payload;
                
                if (Array.isArray(responseData)) {
                    state.customers = responseData;
                } else if (responseData?.results) {
                    state.customers = responseData.results;
                    // Extract stats if available
                    state.total = responseData.total || responseData.results.length || 0;
                    state.successful_users = responseData.successful_users || 0;
                    state.failed_users = responseData.failed_users || 0;
                    state.success_rate = responseData.success_rate || 0;
                } else {
                    state.customers = [];
                }
                
                state.getCustomersSuccess = true;
                state.getCustomersFailed = false;
            })
            .addCase(getCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to fetch customers';
                state.getCustomersSuccess = false;
                state.getCustomersFailed = true;
            })

            // CREATE CUSTOMER
            .addCase(createCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createCustomerSuccess = false;
                state.createCustomerFailed = false;
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.loading = false;
                const newCustomer = action.payload?.data || action.payload;
                if (newCustomer) {
                    state.customers.unshift(newCustomer);
                }
                state.createCustomerSuccess = true;
                state.createCustomerFailed = false;
            })
            .addCase(createCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to create customer';
                state.createCustomerSuccess = false;
                state.createCustomerFailed = true;
            })

            // UPDATE CUSTOMER
            .addCase(updateCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateCustomerSuccess = false;
                state.updateCustomerFailed = false;
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                state.loading = false;
                const { userId } = action.meta.arg;
                const updatedData = action.payload?.data || action.payload;

                if (userId && updatedData) {
                    const index = state.customers.findIndex((customer) => customer.user_id === userId);
                    if (index !== -1) {
                        state.customers[index] = { ...state.customers[index], ...updatedData };
                    }
                }
                state.updateCustomerSuccess = true;
                state.updateCustomerFailed = false;
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to update customer';
                state.updateCustomerSuccess = false;
                state.updateCustomerFailed = true;
            })

            // DELETE CUSTOMER
            .addCase(deleteCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteCustomerSuccess = false;
                state.deleteCustomerFailed = false;
            })
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action.meta.arg;
                state.customers = state.customers.filter((customer) => customer.user_id !== userId);
                state.deleteCustomerSuccess = true;
                state.deleteCustomerFailed = false;
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to delete customer';
                state.deleteCustomerSuccess = false;
                state.deleteCustomerFailed = true;
            })

            // SYNC CUSTOMER
            .addCase(syncCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.syncCustomerSuccess = false;
                state.syncCustomerFailed = false;
            })
            .addCase(syncCustomer.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action.meta.arg;
                const syncData = action.payload?.data || action.payload;
                
                if (userId && syncData) {
                    const index = state.customers.findIndex((customer) => customer.user_id === userId);
                    if (index !== -1) {
                        state.customers[index] = { ...state.customers[index], ...syncData };
                    }
                }
                state.syncCustomerSuccess = true;
                state.syncCustomerFailed = false;
            })
            .addCase(syncCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to sync customer';
                state.syncCustomerSuccess = false;
                state.syncCustomerFailed = true;
            })

            // GET CUSTOMER DETAILS
            .addCase(getCustomerDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCustomerDetailsSuccess = false;
                state.getCustomerDetailsFailed = false;
            })
            .addCase(getCustomerDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.customerDetails = action.payload?.mapping || action.payload;
                state.getCustomerDetailsSuccess = true;
                state.getCustomerDetailsFailed = false;
                console.log("action.payload")
                console.log(action.payload)
            })
            .addCase(getCustomerDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to get customer details';
                state.getCustomerDetailsSuccess = false;
                state.getCustomerDetailsFailed = true;
            })

            // GET ALL PLANS
            .addCase(getAllPlans.pending, (state) => {
                state.plansLoading = true;
                state.error = null;
                state.getAllPlansSuccess = false;
                state.getAllPlansFailed = false;
            })
            .addCase(getAllPlans.fulfilled, (state, action) => {
                state.plansLoading = false;
                const responseData = action.payload?.data || action.payload;
                
                if (Array.isArray(responseData)) {
                    state.plans = responseData;
                } else if (responseData?.results) {
                    state.plans = responseData.results;
                } else if (responseData?.data) {
                    state.plans = responseData.data;
                } else {
                    state.plans = [];
                }
                
                state.getAllPlansSuccess = true;
                state.getAllPlansFailed = false;
            })
            .addCase(getAllPlans.rejected, (state, action) => {
                state.plansLoading = false;
                state.error = action.error?.message || 'Failed to fetch plans';
                state.getAllPlansSuccess = false;
                state.getAllPlansFailed = true;
            })

            // CHANGE PASSWORD
            .addCase(changeCustomerPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.changePasswordSuccess = false;
                state.changePasswordFailed = false;
            })
            .addCase(changeCustomerPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.changePasswordSuccess = true;
                state.changePasswordFailed = false;
            })
            .addCase(changeCustomerPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to change password';
                state.changePasswordSuccess = false;
                state.changePasswordFailed = true;
            })

            // GET CUSTOMER USAGE
            .addCase(getCustomerUsage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getUsageSuccess = false;
                state.getUsageFailed = false;
            })
            .addCase(getCustomerUsage.fulfilled, (state, action) => {
                state.loading = false;
                state.customerUsage = action.payload?.data?.account_usage || action.payload?.data || action.payload;
                state.getUsageSuccess = true;
                state.getUsageFailed = false;
            })
            .addCase(getCustomerUsage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to get customer usage';
                state.getUsageSuccess = false;
                state.getUsageFailed = true;
            })

            // GET OPERATIONS HISTORY
            .addCase(getOperationsHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getOperationsHistorySuccess = false;
                state.getOperationsHistoryFailed = false;
            })
            .addCase(getOperationsHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.operations = action.payload?.data || [];
                state.getOperationsHistorySuccess = true;
                state.getOperationsHistoryFailed = false;
            })
            .addCase(getOperationsHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to get operations history';
                state.getOperationsHistorySuccess = false;
                state.getOperationsHistoryFailed = true;
            })

            // RETRY OPERATION
            .addCase(retryOperation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.retryOperationSuccess = false;
                state.retryOperationFailed = false;
            })
            .addCase(retryOperation.fulfilled, (state, action) => {
                state.loading = false;
                const updatedOperation = action.payload?.data || action.payload;
                const operationId = updatedOperation.operation_id || action.meta.arg;
                const index = state.operations.findIndex((op) => op.operation_id === operationId);
                if (index !== -1) {
                    state.operations[index] = { ...state.operations[index], ...updatedOperation };
                }
                state.retryOperationSuccess = true;
                state.retryOperationFailed = false;
            })
            .addCase(retryOperation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Failed to retry operation';
                state.retryOperationSuccess = false;
                state.retryOperationFailed = true;
            });
    },
});

export const {
    resetCustomerStatus,
    setSelectedCustomer,
    clearSelectedCustomer,
    clearCustomerUsage,
    clearCustomerDetails,
    clearOperations,
    clearPlans,
    updateCustomerLocal,
    addCustomerLocal,
    removeCustomerLocal
} = customerSlice.actions;

export default customerSlice.reducer;