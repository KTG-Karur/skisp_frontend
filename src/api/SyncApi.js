import { apiReturnCallBack } from './ApiConfig';

// GET all expos
export async function getBandWidthSyncApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/hs5200/plans/bandwidth/sync', {});
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
// GET all expos
export async function getSmartBytesSyncApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/hs5200/plans/smartbytes/sync', {});
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
