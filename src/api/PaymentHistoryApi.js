// api/CollectionApi.js
import { apiReturnCallBack } from './ApiConfig';

// GET paymentHistory
export async function getPaymentHistoryApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/payments/history`, request);
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
