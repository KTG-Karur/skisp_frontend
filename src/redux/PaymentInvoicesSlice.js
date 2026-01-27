import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentInvoicesApi} from '../api/PaymentInvoicesApi';

export const getPaymentInvoices = createAsyncThunk('paymentInvoices/getPaymentInvoices', async (request) => {
    return await getPaymentInvoicesApi(request);
});


const paymentInvoicesSlice = createSlice({
    name: 'paymentInvoices',
    initialState: {
        paymentInvoicesData: [],
        loading: false,
        error: null,
        getPaymentInvoicesSuccess: false,
        getPaymentInvoicesFailed: false,
    },
    reducers: {
        resetpaymentInvoicesStatus: (state) => {
            state.getPaymentInvoicesSuccess = false;
            state.getPaymentInvoicesFailed = false;
            state.error = null;
            state.loading = false;
            state.paymentInvoicesData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPaymentInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentInvoicesSuccess = false;
                state.getPaymentInvoicesFailed = false;
            })
            .addCase(getPaymentInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentInvoicesData = action.payload;
                state.getPaymentInvoicesSuccess = true;
                state.getPaymentInvoicesFailed = false;
            })
            .addCase(getPaymentInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPaymentInvoicesSuccess = false;
                state.getPaymentInvoicesFailed = true;
            })
    },
});

export const { resetpaymentInvoicesStatus } = paymentInvoicesSlice.actions;
export default paymentInvoicesSlice.reducer;
