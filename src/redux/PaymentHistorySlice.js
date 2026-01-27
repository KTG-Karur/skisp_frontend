import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentHistoryApi} from '../api/PaymentHistoryApi';

export const getPaymentHistory = createAsyncThunk('paymentHistory/getPaymentHistory', async (request) => {
    return await getPaymentHistoryApi(request);
});


const paymentHistorySlice = createSlice({
    name: 'paymentHistory',
    initialState: {
        paymentHistoryData: [],
        loading: false,
        error: null,
        getPaymentHistorySuccess: false,
        getPaymentHistoryFailed: false,
    },
    reducers: {
        resetpaymentHistoryStatus: (state) => {
            state.getPaymentHistorySuccess = false;
            state.getPaymentHistoryFailed = false;
            state.error = null;
            state.loading = false;
            state.paymentHistoryData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPaymentHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentHistorySuccess = false;
                state.getPaymentHistoryFailed = false;
            })
            .addCase(getPaymentHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentHistoryData = action.payload;
                state.getPaymentHistorySuccess = true;
                state.getPaymentHistoryFailed = false;
            })
            .addCase(getPaymentHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPaymentHistorySuccess = false;
                state.getPaymentHistoryFailed = true;
            })
    },
});

export const { resetpaymentHistoryStatus } = paymentHistorySlice.actions;
export default paymentHistorySlice.reducer;
