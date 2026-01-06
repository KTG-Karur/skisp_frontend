import { apiReturnCallBack } from './ApiConfig';
// const purposeOfVisit = apiContainer.purposeOfVisit;

// GET all purposeOfVisits
export async function getPurposeOfVisitApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/purpose-of-visit', request);
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

// CREATE purposeOfVisit
export async function createPurposeOfVisitApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/purpose-of-visit', request);
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

// UPDATE purposeOfVisit
export async function updatePurposeOfVisitApi(request, purposeOfVisitId) {
    try {
        const response = await apiReturnCallBack('PUT', '/purpose-of-visit' + `/${purposeOfVisitId}`, request);
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

export async function deletePurposeOfVisitApi(purposeOfVisitId) {
    try {
        const response = await apiReturnCallBack('DELETE', '/purpose-of-visit' + `/${purposeOfVisitId}`, { "isActive": 0}); // Pass true to indicate no body
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
