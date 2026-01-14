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
    const [customerModal, setCustomerModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [activeTab, setActiveTab] = useState('view'); // 'view' or 'edit'

    // Form state
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
        acct_ref: '',
        first_name: '',
        last_name: '',
        email_addr: '',
        postal_addr: '',
        mobile_num: '',
    });

    // Plan search state
    const [priPlanSearch, setPriPlanSearch] = useState('');
    const [extPlanSearch, setExtPlanSearch] = useState('');
    const [showPriPlanList, setShowPriPlanList] = useState(false);
    const [showExtPlanList, setShowExtPlanList] = useState(false);

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
            closeCustomerModal();
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

    const fetchCustomers = () => {
        dispatch(
            getCustomers({
                ruleEnable: 'all',
                listType: 'all',
                numSeconds: 0,
                getDetails: true,
            })
        );
    };

    const fetchPlans = () => {
        dispatch(getAllPlans());
    };

    const getFilteredPriPlans = () => {
        let filtered = plans.filter((plan) => plan.profile_type === 'primary' || plan.profile_type === 'both');

        if (priPlanSearch) {
            const term = priPlanSearch.toLowerCase();
            filtered = filtered.filter((plan) => plan.rule_name?.toLowerCase().includes(term) || plan.plan_price?.toString().includes(term));
        }

        return filtered;
    };

    const getFilteredExtPlans = () => {
        let filtered = plans.filter((plan) => plan.profile_type === 'external' || plan.profile_type === 'both');

        if (extPlanSearch) {
            const term = extPlanSearch.toLowerCase();
            filtered = filtered.filter((plan) => plan.rule_name?.toLowerCase().includes(term) || plan.plan_price?.toString().includes(term));
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
                        {/* View/Edit Customer */}
                        <Tippy content="View/Edit Details">
                            <button onClick={() => handleCustomerDetails(customer.user_id)} className="btn btn-sm btn-outline-primary hover:scale-105 transition-transform">
                                <IconEye className="w-4 h-4" />
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
            width: 120,
        },
    ];

    const handleCustomerDetails = (userId) => {
        setSelectedUserId(userId);
        dispatch(getCustomerDetails(userId))
            .then(() => {
                // Set form state from customer details if available
                if (customerDetails?.data?.results) {
                    const results = customerDetails.data.results;
                    const getResultValue = (fid) => {
                        const result = results.find((r) => r.fid === fid);
                        return result?.value || '';
                    };

                    setFormState({
                        user_id: getResultValue('user_id'),
                        user_pass: '', // Don't load password
                        account_validity: 'num_days_from_acct_creation', // Default
                        validity_data: '30',
                        delete_expired_acct: 'enable',
                        del_q_exceeded_acct: 'enable',
                        pri_bandwidth_plan_name: getResultValue('q1_plan_name') || '',
                        ext_bandwidth_plan_name: getResultValue('q2_plan_name') || '',
                        num_mac_binding: '1', // Default
                        num_conc_logins: '1', // Default
                        login_control: 'default',
                        login_proto: 'plogin',
                        acct_ref: getResultValue('acct_ref'),
                        first_name: getResultValue('first_name'),
                        last_name: getResultValue('last_name'),
                        email_addr: getResultValue('user_email'),
                        postal_addr: getResultValue('user_address'),
                        mobile_num: getResultValue('user_mobile'),
                    });
                }
                setCustomerModal(true);
                setActiveTab('view');
            })
            .catch((error) => {
                showMessage('error', error.message || 'Failed to fetch customer details');
            });
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

    const closeCustomerModal = () => {
        setCustomerModal(false);
        setSelectedUserId('');
        setActiveTab('view');
        setPriPlanSearch('');
        setExtPlanSearch('');
        setShowPriPlanList(false);
        setShowExtPlanList(false);
        dispatch(clearSelectedCustomer());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEdit) {
                await dispatch(
                    updateCustomer({
                        request: formState,
                        userId: formState.user_id,
                    })
                ).unwrap();
            } else {
                await dispatch(createCustomer(formState)).unwrap();
            }
        } catch (error) {
            showMessage('error', error.message || 'Failed to save customer');
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(
                updateCustomer({
                    request: formState,
                    userId: selectedUserId,
                })
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

    const formatCustomerDetailResults = () => {
        if (!customerDetails?.data?.results) return [];

        return customerDetails.data.results.map((item, index) => ({
            id: index,
            label: item.label,
            value: item.value,
            fid: item.fid,
        }));
    };

    // Plan select component
    const PlanSelect = ({ value, onChange, placeholder, searchValue, onSearchChange, showList, onShowList, onHideList, plans, required = false, disabled = false }) => {
        return (
            <div className="relative">
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
                        {plans.map((plan) => (
                            <div
                                key={plan.id || plan.plan_id}
                                onClick={() => {
                                    onChange(plan.rule_name);
                                    onSearchChange(plan.rule_name);
                                    onHideList();
                                }}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium text-gray-800">{plan.rule_name}</div>
                                <div className="text-sm text-gray-600">
                                    {plan.bw_up_kbps} Kbps Up / {plan.bw_dn_kbps} Kbps Down • ₹{plan.plan_price}
                                    {plan.data_limit && ` • ${plan.data_limit} ${plan.data_limit_type}`}
                                    {plan.time_limit && ` • ${plan.time_limit} ${plan.time_limit_type}`}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {plan.profile_type === 'primary' ? 'Primary Plan' : plan.profile_type === 'external' ? 'External Plan' : 'Both'}
                                    {plan.is_active ? ' • Active' : ' • Inactive'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showList && plans.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="px-4 py-3 text-gray-500 text-center">No plans found</div>
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
                    </div>

                    <button
                        onClick={() => {
                            setIsEdit(false);
                            setModal(true);
                        }}
                        className="btn btn-success"
                    >
                        <IconUserPlus className="w-5 h-5" />
                        <span>Add New Customer</span>
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
            <ModelViewBox modal={modal} modelHeader={'Add New Customer'} setModel={closeModal} handleSubmit={handleSubmit} modelSize="xl" submitBtnText={'Create Customer'} loadings={customerLoading}>
                <div className="p-6">
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
                                <div>
                                    <label className="block text-sm font-medium mb-2">Primary Bandwidth Plan *</label>
                                    <PlanSelect
                                        value={formState.pri_bandwidth_plan_name}
                                        onChange={(value) => setFormState({ ...formState, pri_bandwidth_plan_name: value })}
                                        placeholder="Search and select primary plan..."
                                        searchValue={priPlanSearch}
                                        onSearchChange={setPriPlanSearch}
                                        showList={showPriPlanList}
                                        onShowList={() => setShowPriPlanList(true)}
                                        onHideList={() => setShowPriPlanList(false)}
                                        plans={getFilteredPriPlans()}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">External Bandwidth Plan</label>
                                    <PlanSelect
                                        value={formState.ext_bandwidth_plan_name}
                                        onChange={(value) => setFormState({ ...formState, ext_bandwidth_plan_name: value })}
                                        placeholder="Search and select external plan (optional)..."
                                        searchValue={extPlanSearch}
                                        onSearchChange={setExtPlanSearch}
                                        showList={showExtPlanList}
                                        onShowList={() => setShowExtPlanList(true)}
                                        onHideList={() => setShowExtPlanList(false)}
                                        plans={getFilteredExtPlans()}
                                    />
                                </div>
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
                </div>
            </ModelViewBox>

            {/* Customer View/Edit Modal */}
            <ModelViewBox
                modal={customerModal}
                modelHeader={`Customer - ${selectedUserId}`}
                setModel={closeCustomerModal}
                modelSize="xl"
                showSubmit={activeTab === 'edit'}
                submitBtnText="Update Customer"
                handleSubmit={handleUpdateSubmit}
                loadings={customerLoading}
                customHeader={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-xl text-white font-bold">
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value?.[0] || '?'}
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'last_name')?.value?.[0] || ''}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value || ''}
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'last_name')?.value ? ' ' + customerDetails.data.results.find((r) => r.fid === 'last_name').value : ''}
                                </h3>
                                <p className="text-gray-600">ID: {selectedUserId}</p>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('view')}
                                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <IconEye className="w-4 h-4" />
                                <span>View</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'edit' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <IconEdit className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="p-6">
                    {activeTab === 'view' ? (
                        // View Tab
                        <div className="space-y-6">
                            {customerDetails?.data?.results && (
                                <>
                                    {/* Account Information */}
                                    <div className="bg-blue-50 p-6 rounded-xl">
                                        <h4 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                                            <IconInfoCircle className="w-5 h-5 mr-2" />
                                            Account Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {customerDetails.data.results
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
                                                    {customerDetails.data.results
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
                                            {customerDetails.data.results.some((item) => item.fid.startsWith('q2_') && item.value !== '-') && (
                                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                                    <h5 className="font-semibold text-blue-700 mb-3">External Plan</h5>
                                                    <div className="space-y-2">
                                                        {customerDetails.data.results
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
                                            {customerDetails.data.results
                                                .filter((item) => ['first_name', 'last_name', 'user_email', 'user_mobile', 'user_phone', 'user_address'].includes(item.fid))
                                                .map((item) => (
                                                    <div key={item.fid} className="space-y-1">
                                                        <label className="text-sm text-gray-500">{item.label}</label>
                                                        <p className="font-medium text-gray-800">{item.value}</p>
                                                    </div>
                                                ))}
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
                                                    {customerDetails.data.results
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
                                                    {customerDetails.data.results
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
                                </>
                            )}
                        </div>
                    ) : (
                        // Edit Tab
                        <div>
                            <form onSubmit={handleUpdateSubmit}>
                                <div className="space-y-6">
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
                                            placeholder="Enter account reference"
                                            className="form-input"
                                        />
                                    </div>

                                    {/* Bandwidth Plans */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Primary Bandwidth Plan *</label>
                                            <PlanSelect
                                                value={formState.pri_bandwidth_plan_name}
                                                onChange={(value) => setFormState({ ...formState, pri_bandwidth_plan_name: value })}
                                                placeholder="Search and select primary plan..."
                                                searchValue={priPlanSearch}
                                                onSearchChange={setPriPlanSearch}
                                                showList={showPriPlanList}
                                                onShowList={() => setShowPriPlanList(true)}
                                                onHideList={() => setShowPriPlanList(false)}
                                                plans={getFilteredPriPlans()}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">External Bandwidth Plan</label>
                                            <PlanSelect
                                                value={formState.ext_bandwidth_plan_name}
                                                onChange={(value) => setFormState({ ...formState, ext_bandwidth_plan_name: value })}
                                                placeholder="Search and select external plan..."
                                                searchValue={extPlanSearch}
                                                onSearchChange={setExtPlanSearch}
                                                showList={showExtPlanList}
                                                onShowList={() => setShowExtPlanList(true)}
                                                onHideList={() => setShowExtPlanList(false)}
                                                plans={getFilteredExtPlans()}
                                            />
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

                                    {/* Password Update (Optional) */}
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <h4 className="text-lg font-semibold mb-2 text-yellow-800">Password Update</h4>
                                        <p className="text-sm text-yellow-600 mb-4">Leave password fields empty if you don't want to change the password.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    value={formState.user_pass}
                                                    onChange={(e) => setFormState({ ...formState, user_pass: e.target.value })}
                                                    placeholder="Enter new password (optional)"
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                                                <input type="password" placeholder="Confirm new password" className="form-input" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default Index;
