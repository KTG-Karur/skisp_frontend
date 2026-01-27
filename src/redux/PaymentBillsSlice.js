import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentBillsApi} from '../api/PaymentBillsApi';

export const getPaymentBills = createAsyncThunk('paymentBills/getPaymentBills', async (request) => {
    return await getPaymentBillsApi(request);
});


const paymentBillsSlice = createSlice({
    name: 'paymentBills',
    initialState: {
        paymentBillsData: [],
        loading: false,
        error: null,
        getPaymentBillsSuccess: false,
        getPaymentBillsFailed: false,
    },
    reducers: {
        resetpaymentBillsStatus: (state) => {
            state.getPaymentBillsSuccess = false;
            state.getPaymentBillsFailed = false;
            state.error = null;
            state.loading = false;
            state.paymentBillsData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPaymentBills.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentBillsSuccess = false;
                state.getPaymentBillsFailed = false;
            })
            .addCase(getPaymentBills.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentBillsData = action.payload;
                state.getPaymentBillsSuccess = true;
                state.getPaymentBillsFailed = false;
            })
            .addCase(getPaymentBills.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPaymentBillsSuccess = false;
                state.getPaymentBillsFailed = true;
            })
    },
});

export const { resetpaymentBillsStatus } = paymentBillsSlice.actions;
export default paymentBillsSlice.reducer;
