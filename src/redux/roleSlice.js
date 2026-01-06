import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRolesApi, createRoleApi, updateRoleApi, deleteRoleApi } from '../api/RoleApi';
import { getRolePermissionsApi, updateRolePermissionsApi } from '../api/RolePermissionApi';

export const getRole = createAsyncThunk('role/getRole', async (request = {}) => {
    return await getRolesApi(request);
});

export const createRole = createAsyncThunk('role/createRole', async (request) => {
    return await createRoleApi(request);
});

export const updateRole = createAsyncThunk('role/updateRole', async ({ request, roleId }) => {
    return await updateRoleApi(request, roleId);
});

export const deleteRole = createAsyncThunk('role/deleteRole', async (roleId) => {
    return await deleteRoleApi(roleId);
});

export const getRolePermissions = createAsyncThunk('role/getRolePermissions', async (request = {}) => {
    return await getRolePermissionsApi(request);
});

export const updateRolePermission = createAsyncThunk('role/updateRolePermission', async ({ rolePermissionId, request }) => {
    return await updateRolePermissionsApi(rolePermissionId, request);
});

const roleSlice = createSlice({
    name: 'role',
    initialState: {
        roleData: [],
        getRoleList: [], // Added this property
        rolePermissions: [],
        getRolePermissionList: [], // Added this property
        loading: false,
        error: null,
        errorMessage: null, // Added this property
        getRoleSuccess: false,
        getRoleFailed: false,
        getRoleFailure: false, // Added this property
        createRoleSuccess: false,
        createRoleFailed: false,
        createRoleData: null, // Added this property
        updateRoleSuccess: false,
        updateRoleFailed: false,
        updateRoleData: null, // Added this property
        deleteRoleSuccess: false,
        deleteRoleFailed: false,
        getRolePermissionSuccess: false, // Added this property
        getRolePermissionFailure: false, // Added this property
        getPermissionsSuccess: false,
        getPermissionsFailed: false,
        updatePermissionSuccess: false,
        updatePermissionFailed: false,
    },
    reducers: {
        resetRoleStatus: (state) => {
            state.getRoleSuccess = false;
            state.getRoleFailed = false;
            state.getRoleFailure = false;
            state.createRoleSuccess = false;
            state.createRoleFailed = false;
            state.updateRoleSuccess = false;
            state.updateRoleFailed = false;
            state.deleteRoleSuccess = false;
            state.deleteRoleFailed = false;
            state.getRolePermissionSuccess = false;
            state.getRolePermissionFailure = false;
            state.getPermissionsSuccess = false;
            state.getPermissionsFailed = false;
            state.updatePermissionSuccess = false;
            state.updatePermissionFailed = false;
            state.error = null;
            state.errorMessage = null;
            state.loading = false;
        },
        setRoleData: (state, action) => {
            state.roleData = action.payload;
            state.getRoleList = action.payload;
        },
        setRolePermissions: (state, action) => {
            state.rolePermissions = action.payload;
            state.getRolePermissionList = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ROLES
            .addCase(getRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getRoleSuccess = false;
                state.getRoleFailed = false;
                state.getRoleFailure = false;
            })
            .addCase(getRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roleData = action.payload.data || [];
                state.getRoleList = action.payload.data || [];
                state.getRoleSuccess = true;
                state.getRoleFailed = false;
                state.getRoleFailure = false;
            })
            .addCase(getRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.errorMessage = action.error.message || 'Fetch failed';
                state.getRoleSuccess = false;
                state.getRoleFailed = true;
                state.getRoleFailure = true;
            })

            // CREATE ROLE
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.createRoleSuccess = false;
                state.createRoleFailed = false;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                state.createRoleData = action.payload.data || null;
                if (action.payload.data) {
                    state.roleData.push(action.payload.data);
                    state.getRoleList.push(action.payload.data);
                }
                state.createRoleSuccess = true;
                state.createRoleFailed = false;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.errorMessage = action.error.message || 'Create failed';
                state.createRoleSuccess = false;
                state.createRoleFailed = true;
            })

            // UPDATE ROLE
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.updateRoleSuccess = false;
                state.updateRoleFailed = false;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                state.updateRoleData = action.payload.data || null;
                if (action.payload.data) {
                    const index = state.roleData.findIndex((role) => role.roleId === action.payload.data.roleId);
                    if (index !== -1) {
                        state.roleData[index] = action.payload.data;
                        state.getRoleList[index] = action.payload.data;
                    }
                }
                state.updateRoleSuccess = true;
                state.updateRoleFailed = false;
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.errorMessage = action.error.message || 'Update failed';
                state.updateRoleSuccess = false;
                state.updateRoleFailed = true;
            })

            // DELETE ROLE
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.deleteRoleSuccess = false;
                state.deleteRoleFailed = false;
            })
            // In the deleteRole.fulfilled case
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data && action.payload.data.roleId) {
                    // Update the role in the list with isActive = 0
                    const index = state.roleData.findIndex((role) => role.roleId === action.payload.data.roleId);
                    if (index !== -1) {
                        state.roleData[index] = { ...state.roleData[index], isActive: 0 };
                        state.getRoleList[index] = { ...state.getRoleList[index], isActive: 0 };
                    }
                }
                state.deleteRoleSuccess = true;
                state.deleteRoleFailed = false;
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.errorMessage = action.error.message || 'Delete failed';
                state.deleteRoleSuccess = false;
                state.deleteRoleFailed = true;
            })

            // GET ROLE PERMISSIONS
            .addCase(getRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getPermissionsSuccess = false;
                state.getPermissionsFailed = false;
                state.getRolePermissionSuccess = false;
                state.getRolePermissionFailure = false;
            })
            .addCase(getRolePermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.rolePermissions = action.payload.data || [];
                state.getRolePermissionList = action.payload.data || [];
                state.getPermissionsSuccess = true;
                state.getRolePermissionSuccess = true;
                state.getPermissionsFailed = false;
                state.getRolePermissionFailure = false;
            })
            .addCase(getRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch permissions failed';
                state.errorMessage = action.error.message || 'Fetch permissions failed';
                state.getPermissionsSuccess = false;
                state.getRolePermissionSuccess = false;
                state.getPermissionsFailed = true;
                state.getRolePermissionFailure = true;
            })

            // UPDATE ROLE PERMISSION
            .addCase(updateRolePermission.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.updatePermissionSuccess = false;
                state.updatePermissionFailed = false;
            })
            .addCase(updateRolePermission.fulfilled, (state) => {
                state.loading = false;
                state.updatePermissionSuccess = true;
                state.updatePermissionFailed = false;
            })
            .addCase(updateRolePermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Permission update failed';
                state.errorMessage = action.error.message || 'Permission update failed';
                state.updatePermissionSuccess = false;
                state.updatePermissionFailed = true;
            });
    },
});

export const { resetRoleStatus, setRoleData, setRolePermissions } = roleSlice.actions;
export default roleSlice.reducer;
