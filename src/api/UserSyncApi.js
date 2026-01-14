import { apiReturnCallBack } from './ApiConfig';

// Helper function to get settingId from localStorage
const getSettingId = () => {
    const selectedProviderId = localStorage.getItem('selectedProvider');
    return '6f786d38-1399-430e-9f27-aeedc7c95f44'; // Default setting ID
};

// Get all users from HS5200
export async function getAllUsersFromHS5200Api(params = {}) {
    try {
        const settingId = getSettingId();
        const queryParams = new URLSearchParams({
            settingId: settingId,
            rule_enable: params.ruleEnable || 'all',
            list_type: params.listType || 'all',
            num_seconds: params.numSeconds || 0,
            get_details: params.getDetails || true,
        }).toString();

        const response = await apiReturnCallBack('GET', `/hs5200/users/list?${queryParams}`);
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
        console.error('Get All Users Error:', error);
        throw error;
    }
}

// Get single customer details from HS5200
export async function getCustomerFromHS5200Api(userId) {
    try {
        const settingId = getSettingId();
        const queryParams = new URLSearchParams({
            settingId: settingId,
            userId: userId,
        }).toString();

        // Use get_user_record endpoint for single user
        const response = await apiReturnCallBack('GET', `/hs5200/user-management/get-user-record?${queryParams}`);
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
        console.error('Get Customer Error:', error);
        throw error;
    }
}

// Get customer usage from HS5200
export async function getCustomerUsageFromHS5200Api(userId) {
    try {
        const settingId = getSettingId();
        const queryParams = new URLSearchParams({
            settingId: settingId,
            userId: userId,
        }).toString();

        const response = await apiReturnCallBack('GET', `/hs5200/user-management/get-account-usage?${queryParams}`);
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
        console.error('Get Customer Usage Error:', error);
        throw error;
    }
}

// Sync all users
export async function syncAllUsersApi() {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
        };

        const response = await apiReturnCallBack('POST', '/hs5200/users/sync/all', request);
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
        console.error('Sync All Users Error:', error);
        throw error;
    }
}

// Sync specific user
export async function syncSpecificUserApi(userId) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            userId: userId,
        };

        const response = await apiReturnCallBack('POST', '/hs5200/users/sync/specific', request);
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
        console.error('Sync Specific User Error:', error);
        throw error;
    }
}

// Force sync specific users
export async function forceSyncUsersApi(userIds) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            userIds: userIds,
        };

        const response = await apiReturnCallBack('POST', '/hs5200/users/sync/force', request);
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
        console.error('Force Sync Users Error:', error);
        throw error;
    }
}

// Get sync status
export async function getSyncStatusApi(syncId) {
    try {
        const response = await apiReturnCallBack('GET', `/hs5200/users/sync/status?syncId=${syncId}`);
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
        console.error('Get Sync Status Error:', error);
        throw error;
    }
}

// Get sync summary
export async function getSyncSummaryApi() {
    try {
        const settingId = getSettingId();
        const response = await apiReturnCallBack('GET', `/hs5200/users/sync/summary?settingId=${settingId}`);
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
        console.error('Get Sync Summary Error:', error);
        throw error;
    }
}

// Add user to HS5200
export async function addUserToHS5200Api(userData) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            ...userData,
        };

        const response = await apiReturnCallBack('POST', '/hs5200/user-management/add-user', request);
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
        console.error('Add User Error:', error);
        throw error;
    }
}

// Update user in HS5200
export async function updateUserInHS5200Api(userId, userData) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            userId: userId,
            ...userData,
        };

        const response = await apiReturnCallBack('PUT', '/hs5200/user-management/modify-user', request);
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
        console.error('Update User Error:', error);
        throw error;
    }
}

// Delete user from HS5200
export async function deleteUserFromHS5200Api(userId) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            userId: userId,
        };

        const response = await apiReturnCallBack('DELETE', '/hs5200/user-management/delete-user', request);
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
        console.error('Delete User Error:', error);
        throw error;
    }
}

// Change password in HS5200
export async function changePasswordInHS5200Api(userId, newPassword) {
    try {
        const settingId = getSettingId();
        const request = {
            settingId: settingId,
            userId: userId,
            new_pass: newPassword,
        };

        const response = await apiReturnCallBack('PUT', '/hs5200/user-management/change-password', request);
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
        console.error('Change Password Error:', error);
        throw error;
    }
}
