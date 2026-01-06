import { apiReturnCallBack } from './ApiConfig';
import apiContainer from './apiContainer';

const role = apiContainer.role;

// GET roles
// GET roles - Modified to only fetch active roles by default
export async function getRolesApi(request = {}) {
    try {
        // Default to only active roles if not specified
        const params = { isActive: 1, ...request };
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `${role}?${queryParams}` : role;
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
        console.error('Get roles error:', error);
        throw error;
    }
}

// CREATE role
export async function createRoleApi(request) {
    try {
        const response = await apiReturnCallBack('POST', role, request);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('Create role error:', error);
        throw error;
    }
}

// UPDATE role - Modified to accept role permission data
export async function updateRoleApi(request, roleId) {
    try {
        // The request should now include roleName, accessIds, and rolePermissionId
        const response = await apiReturnCallBack('PUT', `${role}/${roleId}`, request);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('Update role error:', error);
        throw error;
    }
}

// DELETE role
export async function deleteRoleApi(roleId) {
    try {
        // Send isActive = 0 for soft delete
        const request = { isActive: 0 };
        const response = await apiReturnCallBack('PUT', `${role}/${roleId}`, request);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('Delete role error:', error);
        throw error;
    }
}
