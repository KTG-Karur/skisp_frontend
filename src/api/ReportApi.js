// api/CollectionApi.js
import { apiReturnCallBack } from './ApiConfig';

// GET report
export async function getReportApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/hs5200/reports/expiry`, request);
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
