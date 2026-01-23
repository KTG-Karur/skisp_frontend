import { apiReturnCallBack } from './ApiConfig';

// Helper function to get settingId from localStorage
const getSettingId = () => {
    const loginInfoStr = localStorage.getItem('loginInfo');

    if (!loginInfoStr) {
        return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    }

    try {
        const loginInfo = JSON.parse(loginInfoStr);
        if (loginInfo?.settingId) {
            return loginInfo.settingId;
        }

        return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    } catch (error) {
        console.error('Invalid loginInfo JSON', error);
        return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    }
};

// GET all recharges with settingId
export async function getRechargeApi(request) {
    try {
        const settingId = getSettingId();
        const requestWithSetting = {
            ...request,
            settingId: settingId
        };
        const response = await apiReturnCallBack('GET', `/hs5200/user/plan-details`, requestWithSetting);
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

// CREATE recharge
export async function createRechargeApi(request) {
    try {
        const settingId = getSettingId();
        const requestWithSetting = {
            ...request,
            settingId: settingId
        };
        const response = await apiReturnCallBack('POST', '/hs5200/user/ve-payment', requestWithSetting);
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

// UPDATE recharge
export async function updateRechargeApi(request, rechargeId) {
    try {
        const response = await apiReturnCallBack('PUT', `/hs5200/recharges/bandwidth/${rechargeId}`, request);
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