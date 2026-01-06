import { useState, Fragment, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from './roleFormLayout';
import { roleFormContainer } from './formContainer';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import { getRole, createRole, updateRole, deleteRole, resetRoleStatus, getRolePermissions } from '../../../redux/roleSlice';
import { getPages, resetPageStatus } from '../../../redux/pageSlice';
import RoleTreeView from '../../../components/Atom/RoleTreeView';
import _ from 'lodash';

let isEdit = false;

const Roles = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Role');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName; // for role Permission (1.superadmin)

    const dispatch = useDispatch();

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Safe selector with default values
    const { pagesData = [], loading: pagesLoading = false } = useSelector((state) => state.PageSlice || {});
    const { getRoleSuccess, getRoleFailed, createRoleSuccess, updateRoleSuccess, deleteRoleSuccess, error, roleData = [], loading } = useSelector((state) => state.RoleSlice || {});

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({
        roleName: '',
        accessIds: '',
    });
    const [parentList, setParentList] = useState([]);
    const [formContain, setFormContain] = useState(roleFormContainer);
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [rolePermissionId, setRolePermissionId] = useState('');
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const errorHandle = useRef();

    // Add pagination handler function
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Add function to get paginated data
    const getPaginatedData = () => {
        const dataArray = parentList || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    // Add function to get total count
    const getTotalCount = () => {
        return (parentList || []).length;
    };

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(0);
    }, [parentList]);

    useEffect(() => {
        dispatch(getRole());
        dispatch(getPages({ isActive: 1 }));
        dispatch(setPageTitle('Role Management'));

        return () => {
            // Cleanup on component unmount
            dispatch(resetRoleStatus());
            dispatch(resetPageStatus());
        };
    }, [dispatch]);

    useEffect(() => {
        if (getRoleSuccess && roleData) {
            const activeRoles = roleData.filter((role) => role.isActive !== 0);
            setParentList(activeRoles);
            dispatch(resetRoleStatus());
        }
        if (getRoleFailed && error) {
            showMessage('error', error);
            dispatch(resetRoleStatus());
        }
    }, [getRoleSuccess, getRoleFailed, roleData, error, dispatch]);

    useEffect(() => {
        if (createRoleSuccess) {
            showMessage('success', 'Role created successfully');
            closeModel();
            dispatch(resetRoleStatus());
            dispatch(getRole());
        }
    }, [createRoleSuccess, dispatch]);

    useEffect(() => {
        if (updateRoleSuccess) {
            showMessage('success', 'Role updated successfully');
            closeModel();
            dispatch(resetRoleStatus());
            dispatch(getRole());
        }
    }, [updateRoleSuccess, dispatch]);

    useEffect(() => {
        if (deleteRoleSuccess) {
            showMessage('success', 'Role deleted successfully');
            dispatch(resetRoleStatus());
            dispatch(getRole());
        }
    }, [deleteRoleSuccess, dispatch]);

    // Function to fetch role permissions for a specific role
    const fetchRolePermissions = async (roleId) => {
        try {
            const result = await dispatch(getRolePermissions({ roleId }));
            if (result.payload && result.payload.data && result.payload.data.length > 0) {
                return result.payload.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching role permissions:', error);
            return null;
        }
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
        },
        {
            Header: 'Name',
            accessor: 'roleName',
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex">
                          <Tippy content="Edit">
                              <span className="text-success me-1 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                  <IconPencil className="ltr:mr-2 rtl:ml-2" />
                              </span>
                          </Tippy>

                          <Tippy content="Delete">
                              <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteRole(row.original.roleId)}>
                                  <IconTrashLines />
                              </span>
                          </Tippy>
                      </div>
                  ),
              }
            : null,
    ].filter(Boolean);

    const closeModel = () => {
        isEdit = false;
        onFormClear();
        setErrors({});
        setModal(false);
    };

    const onFormClear = () => {
        setState({
            roleName: '',
            accessIds: '',
        });
        setRolePermissionId('');
        setSelectedItem(null);
        setSelectedPermissions([]);
        setErrors({});
        setIsLoadingPermissions(false);
    };

    const createModel = () => {
        onFormClear();
        isEdit = false;
        setModal(true);
    };

    const onEditForm = async (data) => {
        if (!data) return;
        setIsLoadingPermissions(true);
        setErrors({});
        setModal(true);

        try {
            const rolePermission = await fetchRolePermissions(data.roleId);

            setState({
                roleName: data.roleName || '',
                accessIds: rolePermission ? rolePermission.accessIds : '',
            });

            setRolePermissionId(rolePermission ? rolePermission.rolePermissionId : '');

            let permissions = [];

            if (rolePermission && rolePermission.accessIds) {
                try {
                    const accessData = JSON.parse(rolePermission.accessIds);
                    const permissionsArray = accessData.access || accessData;

                    if (permissionsArray && Array.isArray(permissionsArray)) {
                        permissionsArray.forEach((pageAccess) => {
                            if (pageAccess.accessPermission && Array.isArray(pageAccess.accessPermission)) {
                                pageAccess.accessPermission.forEach((accessId) => {
                                    if (accessId !== null) {
                                        permissions.push(`${pageAccess.pageId}_${accessId}`);
                                    }
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error parsing role permissions:', error);
                }
            }

            setSelectedPermissions(permissions);
            isEdit = true;
            setSelectedItem(data);
        } catch (error) {
            console.error('Error loading role permissions:', error);
            showMessage('error', 'Failed to load role permissions');
        } finally {
            setIsLoadingPermissions(false);
        }
    };

    const handleValidation = () => {
        const newErrors = {};
        if (!state.roleName?.trim()) newErrors.roleName = 'Role name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePermissionsChange = (permissions) => {
        setSelectedPermissions(permissions);

        // Group permissions by pageId
        const permissionsByPage = {};

        permissions.forEach((permissionKey) => {
            const [pageId, accessId] = permissionKey.split('_');
            if (!permissionsByPage[pageId]) {
                permissionsByPage[pageId] = [];
            }

            const numericAccessId = parseInt(accessId);
            if (!isNaN(numericAccessId)) {
                permissionsByPage[pageId].push(numericAccessId);
            }
        });

        // Convert to the format expected by your backend
        const accessArray = Object.keys(permissionsByPage).map((pageId) => ({
            pageId: pageId,
            accessPermission: permissionsByPage[pageId],
        }));

        setState((prev) => ({
            ...prev,
            accessIds: JSON.stringify(accessArray),
        }));
    };

    const onFormSubmit = async () => {
        if (!handleValidation()) return;

        try {
            // Wrap accessIds inside { access: [...] }
            const formattedAccessIds = { access: JSON.parse(state.accessIds) };

            if (isEdit && selectedItem?.roleId) {
                const requestData = {
                    roleName: state.roleName.trim(),
                    accessIds: JSON.stringify(formattedAccessIds), // convert to string if backend expects string
                };

                if (rolePermissionId) {
                    requestData.rolePermissionId = rolePermissionId;
                }

                await dispatch(
                    updateRole({
                        request: requestData,
                        roleId: selectedItem.roleId,
                    })
                );
            } else {
                const requestData = {
                    roleName: state.roleName.trim(),
                    accessIds: JSON.stringify(formattedAccessIds),
                };
                await dispatch(createRole(requestData));
            }
        } catch (error) {
            showMessage('error', 'Failed to save role data');
        }
    };

    const handleDeleteRole = (roleId) => {
        if (!roleId) return;
        showMessage('warning', 'Are you sure you want to delete this role? This action can be undone.', () => dispatch(deleteRole(roleId)), 'Yes, delete it');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const isLoading = loading || pagesLoading;

    return (
        <div>
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div>
                    <Table
                        columns={columns}
                        Title={'Role List'}
                        toggle={roleIdforRole == 'Super Admin' ? createModel : false}
                        data={getPaginatedData()} // Use paginated data
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={getTotalCount()}
                        totalPages={Math.ceil(getTotalCount() / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={true}
                        isSortable={true}
                    />
                </div>
            )}

            <ModelViewBox modal={modal} modelHeader={isEdit ? 'Edit Role' : 'Add Role'} isEdit={isEdit} setModel={closeModel} handleSubmit={onFormSubmit} modelSize="xl">
                <FormLayout
                    dynamicForm={formContain}
                    handleSubmit={onFormSubmit}
                    setState={setState}
                    state={state}
                    ref={errorHandle}
                    noOfColumns={1}
                    errors={errors}
                    setErrors={setErrors}
                    handleChange={handleChange}
                >
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Permissions</label>
                        {isLoadingPermissions ? (
                            <div className="text-center p-4 border rounded bg-gray-50 dark:bg-gray-800">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading permissions...</p>
                            </div>
                        ) : Array.isArray(pagesData) && pagesData.length > 0 ? (
                            <RoleTreeView data={pagesData} selectedPermissions={selectedPermissions} onPermissionsChange={handlePermissionsChange} />
                        ) : (
                            <div className="text-center p-4 border rounded bg-gray-50 dark:bg-gray-800">
                                <p className="text-gray-500 dark:text-gray-400">{pagesLoading ? 'Loading pages...' : 'No pages available for permission assignment'}</p>
                            </div>
                        )}
                    </div>
                </FormLayout>
            </ModelViewBox>
        </div>
    );
};

export default Roles;
