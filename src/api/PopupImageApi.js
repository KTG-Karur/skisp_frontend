import { apiReturnCallBack } from './ApiConfig';

// GET all popup images
export async function getPopupImageApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/popup-images', request);
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

// CREATE popup image
export async function createPopupImageApi(request) {
    try {
        console.log("=== CREATE POPUP IMAGE API CALLED ===");
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
        
        const response = await apiReturnCallBack('FORMPOST', '/popup-images', request);
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
        console.error("Create Popup Image API Error:", error);
        throw error;
    }
}

// UPDATE popup image
export async function updatePopupImageApi(request, popupImageId) {
    try {
        console.log("Update popup image API called for:", popupImageId);
        
        if (request instanceof FormData) {
            console.log("Update request is FormData, using FORMPUT");
            const response = await apiReturnCallBack('FORMPUT', `/popup-images/${popupImageId}`, request);
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
            const response = await apiReturnCallBack('PUT', `/popup-images/${popupImageId}`, request);
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

// DELETE popup image
export async function deletePopupImageApi(popupImageId) {
    try {
        console.log("Delete popup image API called for:", popupImageId);
        const response = await apiReturnCallBack('DELETE', `/popup-images/${popupImageId}`);
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