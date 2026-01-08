import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentReportApi } from '../api/PaymentReportApi';

export const getPaymentReport = createAsyncThunk('paymentReport/getPaymentReport', async (request = {}) => {
    const data = await getPaymentReportApi(request);
    return data;
});

const paymentReportSlice = createSlice({
    name: 'paymentReport',
    initialState: {
        paymentReportData: [],
        getPaymentReportList: [],
        loading: false,
        error: null,
        getPaymentReportSuccess: false,
        getPaymentReportFailed: false,
        errorMessage: null,
    },
    reducers: {
        resetPaymentReportStatus: (state) => {
            state.getPaymentReportSuccess = false;
            state.getPaymentReportFailed = false;
            state.error = null;
            state.errorMessage = null;
            state.loading = false;
        },
        setPaymentReportData: (state, action) => {
            state.paymentReportData = action.payload;
            state.getPaymentReportList = action.payload;
        },
        clearPaymentReportData: (state) => {
            state.paymentReportData = [];
            state.getPaymentReportList = [];
            state.getPaymentReportSuccess = false;
            state.getPaymentReportFailed = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH PAYMENT REPORT
            .addCase(getPaymentReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getPaymentReportSuccess = false;
                state.getPaymentReportFailed = false;
            })
            .addCase(getPaymentReport.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentReportData = action.payload.data || [];
                state.getPaymentReportList = action.payload.data || [];
                state.getPaymentReportSuccess = true;
                state.getPaymentReportFailed = false;
            })
            .addCase(getPaymentReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch payment report failed';
                state.errorMessage = action.error.message || 'Fetch payment report failed';
                state.getPaymentReportSuccess = false;
                state.getPaymentReportFailed = true;
            });
    },
});

export const { resetPaymentReportStatus, setPaymentReportData, clearPaymentReportData } = paymentReportSlice.actions;
export default paymentReportSlice.reducer;