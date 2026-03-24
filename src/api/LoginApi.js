import { apiReturnCallBack } from './ApiConfig';

// GET login API
export async function getLoginApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/organization-login`, request);
        const data = await response.json();
        
        if (!response.ok) {
            // Don't redirect here - let the component handle it
            throw new Error(data.message || 'Authentication failed');
        }
        
        return data;
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}