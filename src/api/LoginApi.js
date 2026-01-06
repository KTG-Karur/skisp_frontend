import { apiReturnCallBack } from './ApiConfig';

// GET group members
export async function getLoginApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/organization-login`, request);
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
