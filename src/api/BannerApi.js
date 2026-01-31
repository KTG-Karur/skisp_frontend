import { apiReturnCallBack } from './ApiConfig';

// GET all banners
export async function getBannerApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/banners', request);
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

export async function createBannerApi(request) {
    try {
        console.log("=== CREATE BANNER API CALLED ===");
        console.log("Request type:", typeof request);
        console.log("Is FormData?:", request instanceof FormData);
        
        if (request instanceof FormData) {
            console.log("FormData contents:");
            for (let [key, value] of request.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File - ${value.name}, ${value.type}`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
        } else {
            console.log("Request (non-FormData):", request);
        }
        
        const response = await apiReturnCallBack('FORMPOST', '/banners', request);
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
        console.error("Create Banner API Error:", error);
        throw error;
    }
}

// UPDATE banner
export async function updateBannerApi(request, bannerId) {
    try {
        console.log("Update banner API called for:", bannerId);
        
        if (request instanceof FormData) {
            console.log("Update request is FormData, using FORMPUT");
            const response = await apiReturnCallBack('FORMPUT', `/banners/${bannerId}`, request);
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
        } else {
            console.log("Update request is JSON, using regular PUT");
            const response = await apiReturnCallBack('PUT', `/banners/${bannerId}`, request);
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
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// DELETE banner
export async function deleteBannerApi(bannerId) {
    try {
        console.log("Delete banner API called for:", bannerId);
        const response = await apiReturnCallBack('DELETE', `/banners/${bannerId}`);
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