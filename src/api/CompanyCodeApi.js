import { apiReturnCallBack } from './ApiConfig';
// const companyCode = apiContainer.companyCode;

// GET all companyCodes
export async function getCompanyCodeApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/company-code', request);
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

// CREATE companyCode
export async function createCompanyCodeApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/company-code', request);
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

// UPDATE companyCode
export async function updateCompanyCodeApi(request, companyCodeId) {
    try {
        const response = await apiReturnCallBack('PUT', '/company-code' + `/${companyCodeId}`, request);
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

export async function deleteCompanyCodeApi(companyCodeId) {
    try {
        const response = await apiReturnCallBack('DELETE', '/company-code' + `/${companyCodeId}`, { "isActive": 0}); // Pass true to indicate no body
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
