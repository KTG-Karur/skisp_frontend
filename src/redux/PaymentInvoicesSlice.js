import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentInvoicesApi, generateInvoiceApi, updateInvoiceStatusApi } from '../api/PaymentInvoicesApi';

export const getPaymentInvoices = createAsyncThunk('paymentInvoices/getPaymentInvoices', async ({ userId, invoiceId } = {}) => {
    return await getPaymentInvoicesApi({ userId, invoiceId });
});

export const generateInvoice = createAsyncThunk('paymentInvoices/generateInvoice', async (request) => {
    return await generateInvoiceApi(request);
});

export const updateInvoiceStatus = createAsyncThunk('paymentInvoices/updateInvoiceStatus', async ({ invoiceId, status }) => {
    return await updateInvoiceStatusApi(invoiceId, status);
});

const paymentInvoicesSlice = createSlice({
    name: 'paymentInvoices',
    initialState: {
        invoices: [],
        loading: false,
        error: null,
        getPaymentInvoicesSuccess: false,
        generateInvoiceSuccess: false,
        updateInvoiceStatusSuccess: false,
        getPaymentInvoicesFailed: false,
        generateInvoiceFailed: false,
        updateInvoiceStatusFailed: false,
    },
    reducers: {
        resetPaymentInvoicesStatus: (state) => {
            state.getPaymentInvoicesSuccess = false;
            state.generateInvoiceSuccess = false;
            state.updateInvoiceStatusSuccess = false;
            state.getPaymentInvoicesFailed = false;
            state.generateInvoiceFailed = false;
            state.updateInvoiceStatusFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearInvoices: (state) => {
            state.invoices = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET PAYMENT INVOICES
            .addCase(getPaymentInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentInvoicesSuccess = false;
                state.getPaymentInvoicesFailed = false;
            })
            .addCase(getPaymentInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload?.data || [];
                state.getPaymentInvoicesSuccess = true;
                state.getPaymentInvoicesFailed = false;
            })
            .addCase(getPaymentInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch invoices';
                state.getPaymentInvoicesSuccess = false;
                state.getPaymentInvoicesFailed = true;
            })

            // GENERATE INVOICE
            .addCase(generateInvoice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.generateInvoiceSuccess = false;
                state.generateInvoiceFailed = false;
            })
            .addCase(generateInvoice.fulfilled, (state, action) => {
                state.loading = false;
                const newInvoice = action.payload?.data;
                if (newInvoice) {
                    state.invoices.unshift(newInvoice);
                }
                state.generateInvoiceSuccess = true;
                state.generateInvoiceFailed = false;
            })
            .addCase(generateInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to generate invoice';
                state.generateInvoiceSuccess = false;
                state.generateInvoiceFailed = true;
            })

            // UPDATE INVOICE STATUS
            .addCase(updateInvoiceStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateInvoiceStatusSuccess = false;
                state.updateInvoiceStatusFailed = false;
            })
            .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { invoiceId, status } = action.meta.arg;
                const updatedInvoice = action.payload?.data;

                if (updatedInvoice) {
                    const index = state.invoices.findIndex((inv) => inv.id === invoiceId || inv.invoice_id === invoiceId);
                    if (index !== -1) {
                        state.invoices[index] = { ...state.invoices[index], ...updatedInvoice, status };
                    }
                }
                state.updateInvoiceStatusSuccess = true;
                state.updateInvoiceStatusFailed = false;
            })
            .addCase(updateInvoiceStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update invoice status';
                state.updateInvoiceStatusSuccess = false;
                state.updateInvoiceStatusFailed = true;
            });
    },
});

export const { resetPaymentInvoicesStatus, clearInvoices } = paymentInvoicesSlice.actions;
export default paymentInvoicesSlice.reducer;
