import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    syncCustomer,
    getCustomerDetails,
    getAllPlans,
    resetCustomerStatus,
    setSelectedCustomer,
    clearSelectedCustomer,
} from '../../../redux/customerSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconEye from '../../../components/Icon/IconEye';
import IconUserPlus from '../../../components/Icon/IconUserPlus';
import IconSearch from '../../../components/Icon/IconSearch';
import IconRefresh from '../../../components/Icon/IconRefresh';
import IconSync from '../../../components/Icon/IconRefresh';
import IconCheckCircle from '../../../components/Icon/IconCircleCheck';
import IconXCircle from '../../../components/Icon/IconXCircle';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconMail from '../../../components/Icon/IconMail';
import IconPhone from '../../../components/Icon/IconPhone';
import IconWifi from '../../../components/Icon/IconWifi';
import IconEdit from '../../../components/Icon/IconEdit';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { showMessage } from '../../../util/AllFunction';

const Index = () => {
    const dispatch = useDispatch();

    const customerState = useSelector((state) => state.CustomerSlice || {});
    const {
        customers = [],
        loading: customerLoading = false,
        error: customerError = null,
        createCustomerSuccess = false,
        updateCustomerSuccess = false,
        deleteCustomerSuccess = false,
        syncCustomerSuccess = false,
        selectedCustomer = null,
        customerDetails = null,

        plans = [],
        plansLoading = false,
        total = 0,
        successful_users = 0,
        failed_users = 0,
        success_rate = 0,
    } = customerState;

    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedUserId, setSelectedUserId] = useState('');

    // Form state for add customer
    const [formState, setFormState] = useState({
        user_id: '',
        user_pass: '',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '30',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: '',
        ext_bandwidth_plan_name: '',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'default',
        login_proto: 'plogin',
        first_login_before_ts: '0',
        user_pass_type: 'specify',
        acct_ref: '',
        first_name: '',
        last_name: '',
        email_addr: '',
        postal_addr: '',
        mobile_num: '',
    });

    // Form state for edit customer
    const [editFormState, setEditFormState] = useState({
        first_name: '',
        last_name: '',
        email_addr: '',
        new_pass: '',
        new_pri_bandwidth_plan_name: '',
        new_ext_bandwidth_plan_name: '',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '30',
    });

    // Plan search state
    const [priPlanSearch, setPriPlanSearch] = useState('');
    const [extPlanSearch, setExtPlanSearch] = useState('');
    const [showPriPlanList, setShowPriPlanList] = useState(false);
    const [showExtPlanList, setShowExtPlanList] = useState(false);
    const [allPlans, setAllPlans] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Customer Management'));
        fetchCustomers();
        fetchPlans();
    }, [dispatch]);

    useEffect(() => {
        if (createCustomerSuccess) {
            showMessage('success', 'Customer created successfully');
            closeModal();
            fetchCustomers();
            dispatch(resetCustomerStatus());
        }
        if (updateCustomerSuccess) {
            showMessage('success', 'Customer updated successfully');
            closeEditModal();
            fetchCustomers();
            dispatch(resetCustomerStatus());
        }
        if (deleteCustomerSuccess) {
            showMessage('success', 'Customer deleted successfully');
            fetchCustomers();
            dispatch(resetCustomerStatus());
        }
        if (syncCustomerSuccess) {
            showMessage('success', 'Customer details refreshed');
            fetchCustomers();
            dispatch(resetCustomerStatus());
        }
        if (customerError) {
            showMessage('error', customerError);
            dispatch(resetCustomerStatus());
        }
    }, [createCustomerSuccess, updateCustomerSuccess, deleteCustomerSuccess, syncCustomerSuccess, customerError]);

    useEffect(() => {
        // Extract plans data from API response
        if (plans && Array.isArray(plans)) {
            setAllPlans(plans);
        } else if (plans && plans.data && Array.isArray(plans.data)) {
            setAllPlans(plans.data);
        } else if (plans && Array.isArray(plans.data)) {
            setAllPlans(plans.data);
        }
    }, [plans]);

    const fetchCustomers = () => {
        dispatch(
            getCustomers({
                ruleEnable: 'all',
                listType: 'all',
                numSeconds: 0,
                getDetails: true,
            }),
        );
    };

    const fetchPlans = () => {
        dispatch(getAllPlans());
    };

    const getFilteredPriPlans = () => {
        let filtered = allPlans.filter((plan) => {
            if (!plan || typeof plan !== 'object') return false;
            const profileType = plan.profile_type || '';
            const ruleName = plan.rule_name || '';
            return profileType === 'primary' || profileType === 'both' || !profileType;
        });

        if (priPlanSearch) {
            const term = priPlanSearch.toLowerCase();
            filtered = filtered.filter((plan) => {
                const ruleName = (plan.rule_name || '').toLowerCase();
                const planPrice = (plan.plan_price || '').toString();
                const bwUp = (plan.bw_up_kbps || '').toString();
                const bwDown = (plan.bw_dn_kbps || '').toString();
                return ruleName.includes(term) || planPrice.includes(term) || bwUp.includes(term) || bwDown.includes(term);
            });
        }
        return filtered;
    };

    const getFilteredExtPlans = () => {
        let filtered = allPlans.filter((plan) => {
            if (!plan || typeof plan !== 'object') return false;
            const profileType = plan.profile_type || '';
            const ruleName = plan.rule_name || '';
            return profileType === 'external' || profileType === 'both' || !profileType;
        });

        if (extPlanSearch) {
            const term = extPlanSearch.toLowerCase();
            filtered = filtered.filter((plan) => {
                const ruleName = (plan.rule_name || '').toLowerCase();
                const planPrice = (plan.plan_price || '').toString();
                const bwUp = (plan.bw_up_kbps || '').toString();
                const bwDown = (plan.bw_dn_kbps || '').toString();
                return ruleName.includes(term) || planPrice.includes(term) || bwUp.includes(term) || bwDown.includes(term);
            });
        }
        return filtered;
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: (row) => <div className="text-center">{row?.row?.index + 1 + currentPage * pageSize}</div>,
            width: 70,
        },
        {
            Header: 'User ID',
            accessor: 'user_id',
            sort: true,
            Cell: ({ value }) => <div className="font-semibold text-primary">{value}</div>,
        },
        {
            Header: 'Customer Name',
            accessor: 'fullName',
            Cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {customer.first_name?.[0]?.toUpperCase() || customer.user_id?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="font-medium">
                                {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{customer.acct_ref || 'No reference'}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Contact Info',
            accessor: 'contact',
            Cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                            <IconMail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 truncate">{customer.user_email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <IconPhone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{customer.user_mobile || 'N/A'}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Created Date',
            accessor: 'create_ts',
            Cell: ({ value }) => {
                if (!value) return 'N/A';
                const date = new Date(value * 1000);
                return (
                    <div className="flex items-center space-x-2">
                        <IconCalendar className="w-4 h-4 text-gray-400" />
                        <span>{date.toLocaleDateString()}</span>
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: 'rule_enable',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 text-xs rounded-full ${value === 'enable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value === 'enable' ? 'Active' : 'Disabled'}</span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const customer = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        {/* View Customer */}
                        <Tippy content="View Customer">
                            <button onClick={() => handleViewCustomer(customer.user_id)} className="btn btn-sm btn-outline-info hover:scale-105 transition-transform">
                                <IconEye className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* Edit Customer */}
                        <Tippy content="Edit Customer">
                            <button onClick={() => handleEditCustomer(customer.user_id)} className="btn btn-sm btn-outline-primary hover:scale-105 transition-transform">
                                <IconPencil className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* Sync Customer */}
                        <Tippy content="Sync Customer">
                            <button onClick={() => handleSyncCustomer(customer.user_id)} className="btn btn-sm btn-outline-secondary hover:scale-105 transition-transform">
                                <IconRefresh className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* Delete */}
                        <Tippy content="Delete">
                            <button onClick={() => handleDeleteCustomer(customer.user_id)} className="btn btn-sm btn-outline-danger hover:scale-105 transition-transform">
                                <IconTrashLines className="w-4 h-4" />
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 180,
        },
    ];

    const handleViewCustomer = (userId) => {
        setSelectedUserId(userId);
        dispatch(getCustomerDetails(userId))
            .then(() => {
                setViewModal(true);
            })
            .catch((error) => {
                showMessage('error', error.message || 'Failed to fetch customer details');
            });
    };

    const handleEditCustomer = (userId) => {
        setSelectedUserId(userId);
        dispatch(getCustomerDetails(userId))
            .then(() => {
                // Set edit form state from customer details
                if (customerDetails?.data?.mapping?.full_user_data) {
                    const userData = customerDetails.data.mapping.full_user_data;
                    const detailsArray = userData.details || [];

                    // Helper function to get value from details array
                    const getDetailValue = (fid) => {
                        const detail = detailsArray.find((item) => item.fid === fid);
                        return detail?.value || '';
                    };

                    setEditFormState((prev) => ({
                        ...prev,
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        email_addr: userData.email || '',
                        new_pri_bandwidth_plan_name: getDetailValue('q1_plan_name') || '',
                        new_ext_bandwidth_plan_name: getDetailValue('q2_plan_name') || '',
                        new_pass: '', // Reset password field for safety
                    }));
                }
                setEditModal(true);
            })
            .catch((error) => {
                showMessage('error', error.message || 'Failed to fetch customer details');
            });
    };

    const handleSyncCustomer = async (userId) => {
        try {
            setIsSyncing(true);

            // Sync specific customer with API
            const response = await fetch('http://localhost:5043/hs5200/users/sync/specific', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settingId: '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d',
                    userId: userId,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('success', `Customer ${userId} synced successfully`);
                fetchCustomers(); // Refresh the list
            } else {
                throw new Error(data.message || 'Sync failed');
            }
        } catch (error) {
            showMessage('error', error.message || 'Failed to sync customer');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncAllCustomers = async () => {
        try {
            setIsSyncing(true);
            // Call sync all API directly
            const response = await fetch('http://localhost:5043/hs5200/users/sync/all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settingId: '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d',
                    forceSync: false,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('success', 'All customers synced successfully');
                fetchCustomers(); // Refresh the list
            } else {
                throw new Error(data.message || 'Sync failed');
            }
        } catch (error) {
            showMessage('error', error.message || 'Failed to sync all customers');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteCustomer = (userId) => {
        showMessage('warning', `Delete user ${userId}? This action cannot be undone.`, async () => {
            try {
                await dispatch(deleteCustomer(userId)).unwrap();
            } catch (error) {
                showMessage('error', error.message || 'Failed to delete customer');
            }
        });
    };

    const closeModal = () => {
        setModal(false);
        setFormState({
            user_id: '',
            user_pass: '',
            account_validity: 'num_days_from_acct_creation',
            validity_data: '30',
            delete_expired_acct: 'enable',
            del_q_exceeded_acct: 'enable',
            pri_bandwidth_plan_name: '',
            ext_bandwidth_plan_name: '',
            num_mac_binding: '1',
            num_conc_logins: '1',
            login_control: 'default',
            login_proto: 'plogin',
            acct_ref: '',
            first_name: '',
            last_name: '',
            email_addr: '',
            postal_addr: '',
            mobile_num: '',
        });
        setPriPlanSearch('');
        setExtPlanSearch('');
        setShowPriPlanList(false);
        setShowExtPlanList(false);
    };

    const closeViewModal = () => {
        setViewModal(false);
        setSelectedUserId('');
        dispatch(clearSelectedCustomer());
    };

    const closeEditModal = () => {
        setEditModal(false);
        setSelectedUserId('');
        setPriPlanSearch('');
        setExtPlanSearch('');
        setShowPriPlanList(false);
        setShowExtPlanList(false);
        dispatch(clearSelectedCustomer());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createCustomer(formState)).unwrap();
        } catch (error) {
            showMessage('error', error.message || 'Failed to save customer');
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare update request with only allowed fields
            const updateRequest = {
                first_name: editFormState.first_name,
                last_name: editFormState.last_name,
                email_addr: editFormState.email_addr,
                new_pri_bandwidth_plan_name: editFormState.new_pri_bandwidth_plan_name,
                new_ext_bandwidth_plan_name: editFormState.new_ext_bandwidth_plan_name,
                account_validity: editFormState.account_validity,
                validity_data: editFormState.validity_data,
            };

            // Only include password if provided
            if (editFormState.new_pass) {
                updateRequest.new_pass = editFormState.new_pass;
            }

            await dispatch(
                updateCustomer({
                    request: updateRequest,
                    userId: selectedUserId,
                }),
            ).unwrap();
        } catch (error) {
            showMessage('error', error.message || 'Failed to update customer');
        }
    };

    const getFilteredData = () => {
        let filtered = customers;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((customer) => {
                return (
                    customer.user_id?.toLowerCase().includes(term) ||
                    customer.first_name?.toLowerCase().includes(term) ||
                    customer.last_name?.toLowerCase().includes(term) ||
                    customer.user_email?.toLowerCase().includes(term) ||
                    customer.user_mobile?.includes(term) ||
                    customer.acct_ref?.toLowerCase().includes(term)
                );
            });
        }
        return filtered;
    };

    const getPaginatedData = () => {
        const dataArray = getFilteredData();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    // Plan select component
    const PlanSelect = ({ value, onChange, placeholder, searchValue, onSearchChange, showList, onShowList, onHideList, plans, required = false, disabled = false, label = '' }) => {
        return (
            <div className="relative">
                <label className="block text-sm font-medium mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <IconSearch className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            onShowList();
                        }}
                        onFocus={onShowList}
                        placeholder={placeholder}
                        className="form-input pl-12 pr-10 w-full"
                        disabled={disabled}
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                onSearchChange('');
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {showList && plans.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.id || plan.plan_id || index}
                                onClick={() => {
                                    onChange(plan.rule_name || '');
                                    onSearchChange(plan.rule_name || '');
                                    onHideList();
                                }}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium text-gray-800">{plan.rule_name || 'Unnamed Plan'}</div>
                                <div className="text-sm text-gray-600">
                                    {plan.bw_up_kbps ? `${plan.bw_up_kbps} Kbps Up` : ''}
                                    {plan.bw_dn_kbps ? ` / ${plan.bw_dn_kbps} Kbps Down` : ''}
                                    {plan.plan_price ? ` • ₹${plan.plan_price}` : ''}
                                    {plan.data_limit ? ` • ${plan.data_limit} ${plan.data_limit_type || ''}` : ''}
                                    {plan.time_limit ? ` • ${plan.time_limit} ${plan.time_limit_type || ''}` : ''}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {plan.profile_type ? `Profile: ${plan.profile_type}` : 'No profile type'}
                                    {plan.is_active !== undefined ? ` • ${plan.is_active ? 'Active' : 'Inactive'}` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showList && plans.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="px-4 py-3 text-gray-500 text-center">{plansLoading ? 'Loading plans...' : 'No plans found'}</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {/* Search and Action Bar */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <IconSearch className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by ID, name, email, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-12 pr-4 py-3 w-full md:w-80"
                            />
                        </div>
                        <button onClick={fetchCustomers} className="btn btn-secondary" disabled={customerLoading}>
                            <IconRefresh className={`w-5 h-5 ${customerLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button onClick={handleSyncAllCustomers} className="btn btn-info" disabled={customerLoading || isSyncing}>
                            <IconSync className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>Sync All Customers</span>
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setModal(true);
                        }}
                        className="btn btn-success"
                        disabled={plansLoading}
                    >
                        <IconUserPlus className="w-5 h-5" />
                        <span>Add New Customer</span>
                        {plansLoading && <span className="ml-2">(Loading Plans...)</span>}
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            {total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                                <p className="text-2xl font-bold text-blue-800">{total}</p>
                            </div>
                            <IconUserPlus className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Successful</p>
                                <p className="text-2xl font-bold text-green-800">{successful_users}</p>
                            </div>
                            <IconCheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Failed</p>
                                <p className="text-2xl font-bold text-red-800">{failed_users}</p>
                            </div>
                            <IconXCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                                <p className="text-2xl font-bold text-purple-800">{success_rate}%</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{success_rate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Table */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Customer Management'}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getFilteredData().length}
                    totalPages={Math.ceil(getFilteredData().length / pageSize)}
                    onPaginationChange={(pageIndex, newPageSize) => {
                        setCurrentPage(pageIndex);
                        setPageSize(newPageSize);
                    }}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    loadings={customerLoading}
                />
            </div>

            {/* Add Customer Modal */}
            <ModelViewBox
                modal={modal}
                modelHeader={'Add New Customer'}
                setModel={closeModal}
                handleSubmit={handleSubmit}
                modelSize="xl"
                submitBtnText={'Create Customer'}
                loadings={customerLoading || plansLoading}
            >
                <div className="p-6">
                    {plansLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading plans data...</p>
                        </div>
                    ) : allPlans.length === 0 ? (
                        <div className="text-center py-12">
                            <IconWifi className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Plans Available</h3>
                            <p className="text-gray-500">Please check if plans are configured in the system.</p>
                            <button onClick={fetchPlans} className="mt-4 btn btn-primary">
                                <IconRefresh className="w-4 h-4 mr-2" />
                                Reload Plans
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">User ID *</label>
                                        <input
                                            type="text"
                                            value={formState.user_id}
                                            onChange={(e) => setFormState({ ...formState, user_id: e.target.value })}
                                            placeholder="Enter user ID"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Password *</label>
                                        <input
                                            type="password"
                                            value={formState.user_pass}
                                            onChange={(e) => setFormState({ ...formState, user_pass: e.target.value })}
                                            placeholder="Enter password"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={formState.first_name}
                                            onChange={(e) => setFormState({ ...formState, first_name: e.target.value })}
                                            placeholder="Enter first name"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formState.last_name}
                                            onChange={(e) => setFormState({ ...formState, last_name: e.target.value })}
                                            placeholder="Enter last name"
                                            className="form-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={formState.email_addr}
                                            onChange={(e) => setFormState({ ...formState, email_addr: e.target.value })}
                                            placeholder="Enter email"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            value={formState.mobile_num}
                                            onChange={(e) => setFormState({ ...formState, mobile_num: e.target.value })}
                                            placeholder="Enter mobile number"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Account Reference */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Account Reference</label>
                                    <input
                                        type="text"
                                        value={formState.acct_ref}
                                        onChange={(e) => setFormState({ ...formState, acct_ref: e.target.value })}
                                        placeholder="Enter account reference (optional)"
                                        className="form-input"
                                    />
                                </div>
                                {/* Bandwidth Plans */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PlanSelect
                                        value={formState.pri_bandwidth_plan_name}
                                        onChange={(value) => setFormState({ ...formState, pri_bandwidth_plan_name: value })}
                                        placeholder="Search and select primary plan..."
                                        searchValue={priPlanSearch}
                                        onSearchChange={setPriPlanSearch}
                                        showList={showPriPlanList}
                                        onShowList={() => setShowPriPlanList(true)}
                                        onHideList={() => {
                                            setTimeout(() => setShowPriPlanList(false), 200);
                                        }}
                                        plans={getFilteredPriPlans()}
                                        required
                                        label="Primary Bandwidth Plan"
                                    />
                                    <PlanSelect
                                        value={formState.ext_bandwidth_plan_name}
                                        onChange={(value) => setFormState({ ...formState, ext_bandwidth_plan_name: value })}
                                        placeholder="Search and select external plan (optional)..."
                                        searchValue={extPlanSearch}
                                        onSearchChange={setExtPlanSearch}
                                        showList={showExtPlanList}
                                        onShowList={() => setShowExtPlanList(true)}
                                        onHideList={() => {
                                            setTimeout(() => setShowExtPlanList(false), 200);
                                        }}
                                        plans={getFilteredExtPlans()}
                                        label="External Bandwidth Plan"
                                    />
                                </div>
                                {/* Network Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">MAC Binding Limit</label>
                                        <select value={formState.num_mac_binding} onChange={(e) => setFormState({ ...formState, num_mac_binding: e.target.value })} className="form-select" required>
                                            {[0, 1, 2, 3, 4, 5].map((num) => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Concurrent Logins</label>
                                        <select value={formState.num_conc_logins} onChange={(e) => setFormState({ ...formState, num_conc_logins: e.target.value })} className="form-select" required>
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Login Protocol</label>
                                        <select value={formState.login_proto} onChange={(e) => setFormState({ ...formState, login_proto: e.target.value })} className="form-select" required>
                                            <option value="plogin">Portal Login</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <textarea
                                        value={formState.postal_addr}
                                        onChange={(e) => setFormState({ ...formState, postal_addr: e.target.value })}
                                        placeholder="Enter address"
                                        className="form-input"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </ModelViewBox>

            {/* View Customer Modal */}
            <ModelViewBox
                modal={viewModal}
                modelHeader={`Customer Details - ${selectedUserId}`}
                setModel={closeViewModal}
                modelSize="xl"
                showSubmit={false}
                loadings={customerLoading}
                customHeader={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-xl text-white font-bold">
                                    {customerDetails?.data?.mapping?.full_user_data?.first_name?.[0] || selectedUserId?.[0] || '?'}
                                    {customerDetails?.data?.mapping?.full_user_data?.last_name?.[0] || ''}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {customerDetails?.data?.mapping?.full_user_data?.first_name || ''}
                                    {customerDetails?.data?.mapping?.full_user_data?.last_name ? ' ' + customerDetails.data.mapping.full_user_data.last_name : ''}
                                </h3>
                                <p className="text-gray-600">ID: {selectedUserId}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    handleEditCustomer(selectedUserId);
                                }}
                                className="btn btn-primary"
                            >
                                <IconEdit className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="p-6">
                    {customerDetails?.data?.mapping?.full_user_data ? (
                        <div className="space-y-6">
                            {/* Sync Status & Basic Info */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                    <IconInfoCircle className="w-5 h-5 mr-2" />
                                    Sync Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Sync Status</label>
                                        <p className={`font-medium ${customerDetails.data.mapping.sync_status === 'synced' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {customerDetails.data.mapping.sync_status}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Last Sync</label>
                                        <p className="font-medium text-gray-800">{new Date(customerDetails.data.mapping.last_sync_at).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Success Rate</label>
                                        <p className="font-medium text-blue-600">{customerDetails.data.mapping.full_user_data.success_rate}%</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Location</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.setting_info?.location_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">HS5200 IP</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.setting_info?.hs5200_ip || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-blue-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                                    <IconInfoCircle className="w-5 h-5 mr-2" />
                                    Account Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customerDetails.data.mapping.full_user_data.details
                                        .filter((item) => ['user_id', 'rule_enable', 'acct_ref', 'account_state', 'active_plan', 'expire_time'].includes(item.fid))
                                        .map((item) => (
                                            <div key={item.fid} className="space-y-1">
                                                <label className="text-sm text-gray-500">{item.label}</label>
                                                <p
                                                    className={`font-medium ${
                                                        item.fid === 'account_state' && item.value === 'Active'
                                                            ? 'text-green-600'
                                                            : item.fid === 'account_state' && item.value === 'Inactive'
                                                              ? 'text-red-600'
                                                              : item.fid === 'rule_enable' && item.value === 'Enable'
                                                                ? 'text-green-600'
                                                                : item.fid === 'rule_enable' && item.value === 'Disable'
                                                                  ? 'text-red-600'
                                                                  : 'text-gray-800'
                                                    }`}
                                                >
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Network Plans */}
                            <div className="bg-green-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                                    <IconWifi className="w-5 h-5 mr-2" />
                                    Network Plans
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Primary Plan */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h5 className="font-semibold text-green-700 mb-3">Primary Plan</h5>
                                        <div className="space-y-2">
                                            {customerDetails.data.mapping.full_user_data.details
                                                .filter((item) => item.fid.startsWith('q1_'))
                                                .map((item) => (
                                                    <div key={item.fid} className="flex justify-between">
                                                        <span className="text-sm text-gray-600">{item.label}:</span>
                                                        <span className="text-sm font-medium text-gray-800">{item.value}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* External Plan */}
                                    {customerDetails.data.mapping.full_user_data.ext_bw_plan_name !== 'disable' && (
                                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                                            <h5 className="font-semibold text-blue-700 mb-3">External Plan</h5>
                                            <div className="space-y-2">
                                                {customerDetails.data.mapping.full_user_data.details
                                                    .filter((item) => item.fid.startsWith('q2_'))
                                                    .map((item) => (
                                                        <div key={item.fid} className="flex justify-between">
                                                            <span className="text-sm text-gray-600">{item.label}:</span>
                                                            <span className="text-sm font-medium text-gray-800">{item.value}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-purple-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                                    <IconUserPlus className="w-5 h-5 mr-2" />
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">First Name</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.first_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Last Name</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.last_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Email</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.email || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Mobile</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.mobile || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">GSTIN</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.gstin_no || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Address</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.mapping.full_user_data.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-amber-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-amber-800">
                                    <IconRefresh className="w-5 h-5 mr-2" />
                                    Usage Statistics
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Data Usage */}
                                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                                        <h5 className="font-semibold text-amber-700 mb-3">Data Usage</h5>
                                        <div className="space-y-2">
                                            {customerDetails.data.mapping.full_user_data.details
                                                .filter((item) => item.fid.includes('dq_usage') || item.fid === 'monthly_dq_sts')
                                                .map((item) => (
                                                    <div key={item.fid} className="flex justify-between">
                                                        <span className="text-sm text-gray-600">{item.label}:</span>
                                                        <span className="text-sm font-medium text-gray-800">{item.value}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Time Usage */}
                                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                                        <h5 className="font-semibold text-amber-700 mb-3">Time Usage</h5>
                                        <div className="space-y-2">
                                            {customerDetails.data.mapping.full_user_data.details
                                                .filter((item) => item.fid.includes('tq_usage') || item.fid === 'monthly_tq_sts')
                                                .map((item) => (
                                                    <div key={item.fid} className="flex justify-between">
                                                        <span className="text-sm text-gray-600">{item.label}:</span>
                                                        <span className="text-sm font-medium text-gray-800">{item.value}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MAC Addresses */}
                            {customerDetails.data.mapping.full_user_data.mac_1 && (
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                                        <IconWifi className="w-5 h-5 mr-2" />
                                        MAC Address Binding
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['mac_1', 'mac_2', 'mac_3', 'mac_4', 'mac_5']
                                            .map((macField) => {
                                                const macValue = customerDetails.data.mapping.full_user_data[macField];
                                                if (macValue) {
                                                    return (
                                                        <div key={macField} className="space-y-1">
                                                            <label className="text-sm text-gray-500">MAC {macField.split('_')[1]}</label>
                                                            <p className="font-medium text-gray-800 font-mono">{macValue}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })
                                            .filter(Boolean)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading customer details...</p>
                        </div>
                    )}
                </div>
            </ModelViewBox>

            {/* Edit Customer Modal */}
            <ModelViewBox
                modal={editModal}
                modelHeader={`Edit Customer - ${selectedUserId}`}
                setModel={closeEditModal}
                modelSize="lg"
                showSubmit={true}
                submitBtnText="Update Customer"
                handleSubmit={handleUpdateSubmit}
                loadings={customerLoading || plansLoading}
            >
                <div className="p-6">
                    {plansLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading plans data...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={editFormState.first_name}
                                            onChange={(e) => setEditFormState({ ...editFormState, first_name: e.target.value })}
                                            placeholder="Enter first name"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={editFormState.last_name}
                                            onChange={(e) => setEditFormState({ ...editFormState, last_name: e.target.value })}
                                            placeholder="Enter last name"
                                            className="form-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={editFormState.email_addr}
                                            onChange={(e) => setEditFormState({ ...editFormState, email_addr: e.target.value })}
                                            placeholder="Enter email"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Bandwidth Plans */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <PlanSelect
                                        value={editFormState.new_pri_bandwidth_plan_name}
                                        onChange={(value) => setEditFormState({ ...editFormState, new_pri_bandwidth_plan_name: value })}
                                        placeholder="Search and select primary plan..."
                                        searchValue={priPlanSearch}
                                        onSearchChange={setPriPlanSearch}
                                        showList={showPriPlanList}
                                        onShowList={() => setShowPriPlanList(true)}
                                        onHideList={() => {
                                            setTimeout(() => setShowPriPlanList(false), 200);
                                        }}
                                        plans={getFilteredPriPlans()}
                                        required
                                        label="Primary Bandwidth Plan"
                                    />
                                    <PlanSelect
                                        value={editFormState.new_ext_bandwidth_plan_name}
                                        onChange={(value) => setEditFormState({ ...editFormState, new_ext_bandwidth_plan_name: value })}
                                        placeholder="Search and select external plan..."
                                        searchValue={extPlanSearch}
                                        onSearchChange={setExtPlanSearch}
                                        showList={showExtPlanList}
                                        onShowList={() => setShowExtPlanList(true)}
                                        onHideList={() => {
                                            setTimeout(() => setShowExtPlanList(false), 200);
                                        }}
                                        plans={getFilteredExtPlans()}
                                        label="External Bandwidth Plan"
                                    />
                                </div>

                                {/* Account Validity */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Account Validity Type</label>
                                        <select
                                            value={editFormState.account_validity}
                                            onChange={(e) => setEditFormState({ ...editFormState, account_validity: e.target.value })}
                                            className="form-select"
                                        >
                                            <option value="num_days_from_acct_creation">Days from Account Creation</option>
                                            <option value="absolute_expiry_ts">Absolute Expiry Timestamp</option>
                                            <option value="num_days_from_each_login">Days from Each Login</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Validity Data</label>
                                        <input
                                            type="text"
                                            value={editFormState.validity_data}
                                            onChange={(e) => setEditFormState({ ...editFormState, validity_data: e.target.value })}
                                            placeholder="e.g., 30 or timestamp"
                                            className="form-input"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {editFormState.account_validity === 'absolute_expiry_ts' ? 'Enter Unix timestamp (e.g., 1735689600)' : 'Enter number of days'}
                                        </p>
                                    </div>
                                </div>

                                {/* Password Update (Optional) */}
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <h4 className="text-lg font-semibold mb-2 text-yellow-800">Password Update</h4>
                                    <p className="text-sm text-yellow-600 mb-4">Leave empty if you don't want to change the password.</p>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={editFormState.new_pass}
                                            onChange={(e) => setEditFormState({ ...editFormState, new_pass: e.target.value })}
                                            placeholder="Enter new password (optional)"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default Index;
