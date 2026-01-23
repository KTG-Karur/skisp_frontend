import { apiReturnCallBack } from './ApiConfig';

// Helper function to get settingId from localStorage


// GET all plans with settingId
export async function getPlanApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/hs5200/plans/bandwidthall`, request);
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

// GET all Active plans with settingId
export async function getActivePlanApi(request) {
    try {
        const response = await apiReturnCallBack('GET', `/hs5200/plans/bandwidth`, request);
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

// CREATE plan
export async function createPlanApi(request) {
    try {
        const settingId = getSettingId();
        const requestWithSetting = {
            ...request,
            settingId: settingId
        };
        const response = await apiReturnCallBack('POST', '/hs5200/plans/bandwidth', requestWithSetting);
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

// UPDATE plan
export async function updatePlanApi(request, planId) {
    try {
        const response = await apiReturnCallBack('PUT', `/hs5200/plans/bandwidth/${planId}`, request);
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

// DELETE/Deactivate plan
export async function deletePlanApi(planId) {
    try {
        const response = await apiReturnCallBack('PUT', `/hs5200/plans/bandwidth/${planId}`, { 
            "planId": planId,
            "isActive": false 
        });
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

// Update plan status (active/inactive)
export async function updatePlanStatusApi(planId, isActive) {
    try {
        const response = await apiReturnCallBack('PUT', `/hs5200/plans/bandwidth`, { 
            "planId": planId,
            "isActive": isActive 
        });
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