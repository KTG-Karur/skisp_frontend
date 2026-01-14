import { apiReturnCallBack } from './ApiConfig';
import { getPlanApi } from './PlanApi';

// Helper function to get settingId from localStorage
const getSettingId = () => {
    return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d'; // Updated setting ID
};

// GET all users from HS5200
export async function getCustomersApi(params = {}) {
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

        return {
            success: data.data?.success || false,
            total: data.data?.total || 0,
            successful_users: data.data?.successful_users || 0,
            failed_users: data.data?.failed_users || 0,
            success_rate: data.data?.success_rate || 0,
            data: data.data?.users || [],
        };
    } catch (error) {
        console.error('Get Customers Error:', error);
        throw error;
    }
}

// Get customer details from HS5200
export async function getCustomerDetailsApi(userId) {
    try {
        const response = await apiReturnCallBack('GET', `/hs5200/user/details?userId=${userId}`);
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
        console.error('Get Customer Details Error:', error);
        throw error;
    }
}

// CREATE customer - Create in HS5200
export async function createCustomerApi(request) {
    try {
        const settingId = getSettingId();
        const requestWithSetting = {
            ...request,
            settingId: settingId,
            created_by: localStorage.getItem('employee_id') || 'system',
        };

        // Create in HS5200
        const hs5200Response = await apiReturnCallBack('POST', '/hs5200/user-management/add-user', requestWithSetting);
        const hs5200Data = await hs5200Response.json();

        if (!hs5200Response.ok) {
            throw new Error(hs5200Data.message || 'Failed to create user in HS5200');
        }

        return {
            success: true,
            data: {
                ...request,
                hs5200_response: hs5200Data,
                sync_status: 'synced',
            },
        };
    } catch (error) {
        console.error('Create Customer Error:', error);
        throw error;
    }
}

// UPDATE customer - Update in HS5200
export async function updateCustomerApi(request, userId) {
    try {
        const settingId = getSettingId();

        // Update in HS5200
        const hs5200Request = {
            settingId: settingId,
            userId: userId,
            ...request,
        };

        const hs5200Response = await apiReturnCallBack('PUT', '/hs5200/user-management/modify-user', hs5200Request);
        const hs5200Data = await hs5200Response.json();

        if (!hs5200Response.ok) {
            throw new Error(hs5200Data.message || 'Failed to update user in HS5200');
        }

        return {
            success: true,
            data: {
                ...request,
                hs5200_response: hs5200Data,
                sync_status: 'synced',
            },
        };
    } catch (error) {
        console.error('Update Customer Error:', error);
        throw error;
    }
}

// DELETE customer - Delete from HS5200
export async function deleteCustomerApi(userId) {
    try {
        const settingId = getSettingId();

        // Delete from HS5200
        const hs5200Request = {
            settingId: settingId,
            userId: userId,
        };

        const hs5200Response = await apiReturnCallBack('DELETE', '/hs5200/user-management/delete-user', hs5200Request);
        const hs5200Data = await hs5200Response.json();

        if (!hs5200Response.ok) {
            throw new Error(hs5200Data.message || 'Failed to delete user from HS5200');
        }

        return {
            success: true,
            data: hs5200Data,
        };
    } catch (error) {
        console.error('Delete Customer Error:', error);
        throw error;
    }
}

// Sync specific user (mark as synced - since we're only using HS5200 now)
export async function syncCustomerApi(userId) {
    try {
        // Get user details from HS5200
        const hs5200Response = await apiReturnCallBack('GET', `/hs5200/user/details?userId=${userId}`);
        const hs5200Data = await hs5200Response.json();

        if (!hs5200Response.ok) {
            throw new Error(hs5200Data.message || 'Failed to get user details from HS5200');
        }

        const userDetails = hs5200Data.data || {};

        // Return user data with sync status
        return {
            success: true,
            data: {
                ...userDetails,
                user_id: userId,
                sync_status: 'synced',
                last_sync: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Sync Customer Error:', error);
        throw error;
    }
}

// Get all plans for dropdown
export async function getAllPlansApi() {
    try {
        const settingId = getSettingId();
        const response = await getPlanApi({ settingId: settingId });
        return response;
    } catch (error) {
        console.error('Get All Plans Error:', error);
        throw error;
    }
}

// Change customer password
export async function changeCustomerPasswordApi(userId, newPassword) {
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

// Get customer usage
export async function getCustomerUsageApi(userId) {
    try {
        const settingId = getSettingId();
        const response = await apiReturnCallBack('GET', `/hs5200/user-management/get-account-usage?settingId=${settingId}&userId=${userId}`);
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
// Get operations history
export async function getOperationsHistoryApi(params = {}) {
    try {
        const response = await apiReturnCallBack('GET', '/hs5200/user-management/operations', params);
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
        console.error('Get Operations History Error:', error);
        throw error;
    }
}

// Retry failed operation
export async function retryOperationApi(operationId) {
    try {
        const request = {
            operationId: operationId,
        };

        const response = await apiReturnCallBack('POST', '/hs5200/user-management/retry-operation', request);
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
        console.error('Retry Operation Error:', error);
        throw error;
    }
}
