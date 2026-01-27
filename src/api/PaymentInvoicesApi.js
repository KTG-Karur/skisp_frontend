import { apiReturnCallBack } from './ApiConfig';

// GET paymentInvoices for a specific user
export async function getPaymentInvoicesApi(userId) {
    try {
        const response = await apiReturnCallBack('GET', `/payments/invoices?userId=${userId}`);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Generate new invoice
export async function generateInvoiceApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/payments/invoices/generate', request);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Update invoice status
export async function updateInvoiceStatusApi(invoiceId, status) {
    try {
        const response = await apiReturnCallBack('PUT', `/payments/invoices/${invoiceId}/status`, { status });
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Download invoice PDF
export async function downloadInvoiceApi(invoiceId) {
    try {
        const response = await apiReturnCallBack('GET', `/payments/invoices/${invoiceId}/download`, null, 'blob');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download invoice');
        }
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
