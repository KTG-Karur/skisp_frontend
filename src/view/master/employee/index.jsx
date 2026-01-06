import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { employeeFormContainer } from './formContainer';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import { getEmployee, createEmployee, updateEmployee, deleteEmployee, resetEmployeeStatus } from '../../../redux/employeeSlice';
import { getDepartmentApi } from '../../../api/DepartmentApi';
import { getRolesApi } from '../../../api/RoleApi';
import _ from 'lodash';

const Employees = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Employee');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName; // for role Permission (1.superadmin)
    const dispatch = useDispatch();
    const { getEmployeeSuccess, createEmployeeSuccess, createEmployeeFailed, updateEmployeeSuccess, deleteEmployeeSuccess, updateEmployeeFailed, error, employeeData } = useSelector(
        (state) => state.EmployeeSlice
    );
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false); // Add this line - use state instead of global variable
    const [state, setState] = useState({
        employeeName: '',
        mobileNo: '',
        addressI: '',
        addressII: '',
        pincode: '',
        roleId: '',
        departmentId: '',
        isAuthenticated: false,
        username: '',
        password: '',
    });
    const [parentList, setParentList] = useState([]);
    const [formContain, setFormContain] = useState(employeeFormContainer);
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('Employee Management'));
        fetchInitialData();
    }, []);

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(0);
    }, [parentList]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            await dispatch(getEmployee());
            await fetchDropdownData();
        } catch (error) {
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };
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

    const fetchDropdownData = async () => {
        try {
            const rolesResponse = await getRolesApi();
            const departmentsResponse = await getDepartmentApi();

            const departmentsData = departmentsResponse?.data || [];

            setRoles(rolesResponse?.data || []);
            setDepartments(departmentsData);

            const updatedFormContainer = [...employeeFormContainer];
            updatedFormContainer[0].formFields = updatedFormContainer[0].formFields.map((field) => {
                if (field.name === 'roleId') {
                    return {
                        ...field,
                        options: (rolesResponse?.data || []).map((role) => ({ value: role.roleId, label: role.roleName })) || [],
                    };
                } else if (field.name === 'departmentId') {
                    return {
                        ...field,
                        options: departmentsData.map((department) => ({ value: department.departmentId, label: department.departmentName })) || [],
                    };
                }
                return field;
            });
            setFormContain(updatedFormContainer);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showMessage('error', 'Failed to load dropdown options');
        }
    };

    useEffect(() => {
        if (getEmployeeSuccess) {
            setParentList(employeeData);
            dispatch(resetEmployeeStatus());
        }
    }, [getEmployeeSuccess, employeeData]);

    useEffect(() => {
        if (createEmployeeSuccess) {
            showMessage('success', 'Employee created successfully');
            closeModel();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (createEmployeeFailed) {
            showMessage('error', error || 'create employee Failed');
            dispatch(resetEmployeeStatus());
        }
    }, [createEmployeeSuccess, createEmployeeFailed]);

    useEffect(() => {
        if (updateEmployeeSuccess) {
            showMessage('success', 'Employee updated successfully');
            closeModel();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (updateEmployeeFailed) {
            showMessage('error', error || 'update employee Failed');
            dispatch(resetEmployeeStatus());
        }
    }, [updateEmployeeSuccess, updateEmployeeFailed]);

    useEffect(() => {
        if (deleteEmployeeSuccess) {
            showMessage('success', 'Employee deleted successfully');
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        }
    }, [deleteEmployeeSuccess]);

    const columns = [
        { Header: 'S.No', accessor: 'id', Cell: (row) => <div>{row?.row?.index + 1}</div> },
        { Header: 'Name', accessor: 'employeeName' },
        { Header: 'Mobile No', accessor: 'mobileNo' },
        { Header: 'Role', accessor: 'roleName' },
        { Header: 'Department', accessor: 'departmentName' },
        roleIdforRole === 'Super Admin' ? {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex">
                    {roleIdforRole === 'Super Admin' && (
                        <Tippy content="Edit">
                            <span className="text-success me-1 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                <IconPencil className="ltr:mr-2 rtl:ml-2" />
                            </span>
                        </Tippy>
                    )}
                    {roleIdforRole === 'Super Admin' && (
                        <Tippy content="Delete">
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteEmployee(row.original)}>
                                <IconTrashLines />
                            </span>
                        </Tippy>
                    )}
                </div>
            ),
        }: null,
    ].filter(Boolean);

    const closeModel = () => {
        setIsEdit(false); // Use state setter
        onFormClear();
        setModal(false);
    };

    const onFormClear = () => {
        setState({
            employeeName: '',
            mobileNo: '',
            addressI: '',
            addressII: '',
            pincode: '',
            roleId: '',
            departmentId: '',
            userId: '',
            isAuthenticated: false,
            username: '',
            password: '',
        });
        setSelectedItem(null);
        setErrors({});
        setShowPassword(false);
    };

    const createModel = () => {
        onFormClear();
        setIsEdit(false); // Use state setter
        setModal(true);
        setErrors({});
    };

    const onEditForm = (data) => {
        setState({
            ...data,
            roleId: data.roleId || '',
            departmentId: data.departmentId || '',
            userId: data.userId || '',
            isAuthenticated: data.isAuthenticated,
            username: data.userName || '',
            password: data.password || '',
        });
        setIsEdit(true); // Use state setter
        setSelectedItem(data);
        setErrors({});
        setModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.employeeName) newErrors.employeeName = 'Employee name is required';
        if (!state.mobileNo) newErrors.mobileNo = 'Mobile number is required';
        if (!state.roleId) newErrors.roleId = 'Role is required';
        if (!state.departmentId) newErrors.departmentId = 'Department is required';
        if (state.isAuthenticated) {
            if (!state.username) newErrors.username = 'Username is required when authentication is enabled';
            if (!state.password) newErrors.password = 'Password is required when authentication is enabled';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        const requestData = {
            employeeName: state.employeeName,
            mobileNo: state.mobileNo,
            addressI: state.addressI,
            addressII: state.addressII,
            pincode: state.pincode,
            roleId: state.roleId,
            departmentId: state.departmentId,
            userId: state.userId || '',
            username: state.username,
            password: state.password,
            isAuthenticated: state.isAuthenticated ? 1 : 0,
        };

        try {
            if (isEdit) {
                await dispatch(
                    updateEmployee({
                        request: requestData,
                        employeeId: selectedItem.employeeId,
                    })
                );
            } else {
                await dispatch(createEmployee(requestData));
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save employee data');
        }
    };

    const handleDeleteEmployee = (employee) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this employee?',
            () => {
                const requestData = {
                    employeeName: employee.employeeName,
                    mobileNo: employee.mobileNo,
                    addressI: employee.addressI,
                    addressII: employee.addressII,
                    pincode: employee.pincode,
                    roleId: employee.roleId,
                    departmentId: employee.departmentId,
                    userId: employee.userId || '',
                    username: employee.userName || '',
                    password: employee.password || '',
                    isAuthenticated: employee.isAuthenticated ? 1 : 0,
                    isActive: 0,
                };

                dispatch(
                    updateEmployee({
                        employeeId: employee.employeeId,
                        request: requestData,
                    })
                );
            },
            'Yes, delete it'
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div>
                    <Table
                        columns={columns}
                        Title={'Employee List'}
                        toggle={roleIdforRole === 'Super Admin'? createModel : false}
                        data={getPaginatedData()}
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

            <ModelViewBox modal={modal} modelHeader={isEdit ? 'Edit Employee' : 'Add Employee'} isEdit={isEdit} setModel={closeModel} handleSubmit={onFormSubmit} modelSize="lg">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <label>Role</label>
                        <select name="roleId" value={state.roleId} onChange={handleChange} className="form-select">
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.roleId} value={role.roleId}>
                                    {role.roleName}
                                </option>
                            ))}
                        </select>
                        {errors.roleId && <div className="text-danger">{errors.roleId}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Department</label>
                        <select name="departmentId" value={state.departmentId} onChange={handleChange} className="form-select">
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                                <option key={department.departmentId} value={department.departmentId}>
                                    {department.departmentName}
                                </option>
                            ))}
                        </select>
                        {errors.departmentId && <div className="text-danger">{errors.departmentId}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Name</label>
                        <input type="text" name="employeeName" value={state.employeeName} onChange={handleChange} placeholder="Enter Employee Name" className="form-input" />
                        {errors.employeeName && <div className="text-danger">{errors.employeeName}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Mobile No</label>
                        <input type="text" name="mobileNo" value={state.mobileNo} onChange={handleChange} placeholder="Enter Mobile Number" className="form-input" maxLength={10} minLength={10} />
                        {errors.mobileNo && <div className="text-danger">{errors.mobileNo}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Address I</label>
                        <textarea name="addressI" value={state.addressI} onChange={handleChange} placeholder="Enter Address I" className="form-input" rows="2" />
                    </div>

                    <div className="col-span-6">
                        <label>Address II</label>
                        <textarea name="addressII" value={state.addressII} onChange={handleChange} placeholder="Enter Address II" className="form-input" rows="2" />
                    </div>

                    <div className="col-span-6">
                        <label>Pincode</label>
                        <input type="text" name="pincode" value={state.pincode} onChange={handleChange} placeholder="Enter Pincode" className="form-input" maxLength={6} minLength={6} />
                    </div>

                    <div className="col-span-12">
                        <label className="flex items-center">
                            <input type="checkbox" name="isAuthenticated" checked={state.isAuthenticated} onChange={handleChange} className="form-checkbox" />
                            <span className="ml-2">Enable authentication?</span>
                        </label>
                    </div>

                    {state.isAuthenticated ? (
                        <>
                            <div className="col-span-6">
                                <label>Username</label>
                                <input type="text" name="username" value={state.username} onChange={handleChange} placeholder="Enter Username" className="form-input" />
                                {errors.username && <div className="text-danger">{errors.username}</div>}
                            </div>

                            <div className="col-span-6">
                                <label>Password</label>
                                <div className="relative">
                                    <input
                                        type={(showPassword ? 'text' : 'password')}
                                        name="password"
                                        value={state.password}
                                        onChange={handleChange}
                                        placeholder="Enter Password"
                                        className="form-input pr-10"
                                    />

                                    <span onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                                        {showPassword ? 'hide' : 'show'}
                                    </span>
                                </div>

                                {errors.password && <div className="text-danger">{errors.password}</div>}
                            </div>
                        </>
                    ) : (
                        ''
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default Employees;
