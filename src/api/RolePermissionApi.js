import { apiReturnCallBack } from './ApiConfig';
import apiContainer from './apiContainer';

const rolePermission = '/role-permission';

// GET role permissions
export async function getRolePermissionsApi(request = {}) {
    try {
        // Create query parameters properly
        const queryParams = new URLSearchParams();

        if (request.roleId) {
            queryParams.append('roleId', request.roleId);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `${rolePermission}?${queryString}` : rolePermission;

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
        console.error('Get role permissions error:', error);
        throw error;
    }
}

// CREATE role permission
export async function createRolePermissionApi(request) {
    try {
        const response = await apiReturnCallBack('POST', rolePermission, request);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('Create role permission error:', error);
        throw error;
    }
}

// UPDATE role permission
export async function updateRolePermissionsApi(rolePermissionId, request) {
    try {
        const response = await apiReturnCallBack('PUT', `${rolePermission}/${rolePermissionId}`, request);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || JSON.stringify(data));
        }

        return data;
    } catch (error) {
        console.error('Update role permission error:', error);
        throw error;
    }
}
