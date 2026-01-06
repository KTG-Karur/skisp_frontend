import { apiReturnCallBack } from './ApiConfig';

// GET all pages
export async function getPagesApi(request = {}) {
    try {
        const queryParams = new URLSearchParams(request).toString();
        const url = queryParams ? `/page?${queryParams}` : '/page';

        const response = await apiReturnCallBack('GET', url);
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

// CREATE page
export async function createPageApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/page', request);
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

// UPDATE page
export async function updatePageApi(request, pageId) {
    try {
        const response = await apiReturnCallBack('PUT', `/page/${pageId}`, request);
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
