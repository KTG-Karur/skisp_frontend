import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { getCustomers, createCustomer, updateCustomer, getCustomerDetails, getAllPlans, resetCustomerStatus, clearSelectedCustomer } from '../../../redux/customerSlice';
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
import IconEyeOff from '../../../components/Icon/IconEyeOff';
import IconFileText from '../../../components/Icon/IconFile';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { showMessage } from '../../../util/AllFunction';
import { baseURL } from '../../../api/ApiConfig';

const Index = () => {
    const dispatch = useDispatch();
    const customerState = useSelector((state) => state.CustomerSlice || {});
    const navigate = useNavigate()
    const {
        customers = [],
        loading: customerLoading = false,
        error: customerError = null,
        createCustomerSuccess = false,
        updateCustomerSuccess = false,
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
    const [showPassword, setShowPassword] = useState(false);

    // FIX: Add state for form field focus
    const [focusedField, setFocusedField] = useState(null);

    // Form state for add customer - EMPTY INITIAL VALUES
    const [formState, setFormState] = useState({
        settingId: '',
        localUserId: '',
        user_id: '',
        user_pass_type: 'specify',
        user_pass: '',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '30',
        first_login_before_ts: '0',
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
        mobile_num: '',
        postal_addr: '',
    });

    // Form state for edit customer
    const [editFormState, setEditFormState] = useState({
        settingId: '',
        localUserId: '',
        user_id: '',
        user_pass: '',
        pri_bandwidth_plan_name: '',
        first_name: '',
        last_name: '',
        email_addr: '',
        mobile_num: '',
        postal_addr: '',
        acct_ref: '',
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
        if (customerError) {
            showMessage('error', customerError);
            dispatch(resetCustomerStatus());
        }
    }, [createCustomerSuccess, updateCustomerSuccess, customerError]);

    useEffect(() => {
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

    // Fixed PasswordInput component
    const PasswordInput = ({ value, onChange, placeholder, required = false, label = '', showPasswordToggle = true, fieldName }) => {
        const [show, setShow] = useState(false);
        const [localValue, setLocalValue] = useState(value);

        // Handle focus to clear field
        const handleFocus = () => {
            if (focusedField !== fieldName) {
                setLocalValue('');
                setFocusedField(fieldName);
            }
        };

        // Handle change
        const handleChange = (e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);
            onChange(e);
        };

        // Sync local value with parent value
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        return (
            <div>
                <label className="block text-sm font-medium mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <input
                        type={show ? 'text' : 'password'}
                        value={localValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        className="form-input pr-10 w-full"
                        required={required}
                    />
                    {showPasswordToggle && (
                        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {show ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // FIX: Regular input component that clears on focus
    const ClearableInput = ({ value, onChange, placeholder, required = false, label = '', type = 'text', fieldName, readOnly = false }) => {
        const [localValue, setLocalValue] = useState(value);

        const handleFocus = () => {
            if (focusedField !== fieldName && !readOnly) {
                setLocalValue('');
                setFocusedField(fieldName);
            }
        };

        const handleChange = (e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);
            onChange(e);
        };

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        return (
            <div>
                <label className="block text-sm font-medium mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input type={type} value={localValue} onChange={handleChange} onFocus={handleFocus} placeholder={placeholder} className="form-input w-full" required={required} readOnly={readOnly} />
            </div>
        );
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
                            <button onClick={() => handleViewCustomer(customer.user_id)} className="btn btn-sm btn-outline-info">
                                <IconEye className="w-4 h-4" />
                            </button>
                        </Tippy>

                        <Tippy content="View Invoices">
                            <button onClick={() => navigate(`/customers/invoices/${customer.user_id}`)} className="btn btn-sm btn-outline-warning">
                                <IconFileText className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* Edit Customer */}
                        {/* <Tippy content="Edit Customer">
                            <button onClick={() => handleEditCustomer(customer.user_id)} className="btn btn-sm btn-outline-primary hover:scale-105 transition-transform">
                                <IconPencil className="w-4 h-4" />
                            </button>
                        </Tippy> */}

                        {/* Sync Customer */}
                        <Tippy content="Sync Customer">
                            <button onClick={() => handleSyncCustomer(customer.user_id)} className="btn btn-sm btn-outline-secondary hover:scale-105 transition-transform">
                                <IconRefresh className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* REMOVED DELETE BUTTON */}
                    </div>
                );
            },
            width: 140,
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
                // Extract data from API response
                if (customerDetails?.data?.results) {
                    const results = customerDetails.data.results;

                    // Helper function to get value from results array
                    const getValue = (fid) => {
                        const item = results.find((r) => r.fid === fid);
                        return item ? item.value : '';
                    };

                    // Extract values from API response
                    setEditFormState({
                        user_id: getValue('user_id') || userId,
                        first_name: getValue('first_name') || '',
                        last_name: getValue('last_name') || '',
                        email_addr: getValue('user_email') || '',
                        mobile_num: getValue('user_mobile') || '',
                        postal_addr: getValue('user_address') || '',
                        acct_ref: getValue('acct_ref') || '',
                        pri_bandwidth_plan_name: getValue('q1_plan_name') || '',
                        ext_bandwidth_plan_name: getValue('q2_plan_name') || '',
                        user_pass: '', // Password field empty by default
                    });
                }
                setEditModal(true);
            })
            .catch((error) => {
                showMessage('error', error.message || 'Failed to fetch customer details');
            });
    };

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

    const handleSyncCustomer = async (userId) => {
        try {
            setIsSyncing(true);

            const settingId = getSettingId();

            const response = await fetch(`${baseURL}/hs5200/users/sync/specific`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settingId,
                    userId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Sync failed');
            }

            showMessage('success', `Customer ${userId} synced successfully`);
            fetchCustomers(); // Refresh the list
        } catch (error) {
            showMessage('error', error.message || 'Failed to sync customer');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncAllCustomers = async () => {
        try {
            setIsSyncing(true);
            const settingId = getSettingId();

            // Call sync all API directly
            const response = await fetch(`${baseURL}/hs5200/users/sync/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settingId: settingId,
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

    const closeModal = () => {
        setModal(false);
        // Reset form to empty values
        setFormState({
            settingId: '',
            localUserId: '',
            user_id: '',
            user_pass_type: 'specify',
            user_pass: '',
            account_validity: 'num_days_from_acct_creation',
            validity_data: '30',
            first_login_before_ts: '0',
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
            mobile_num: '',
            postal_addr: '',
        });
        setPriPlanSearch('');
        setExtPlanSearch('');
        setShowPriPlanList(false);
        setShowExtPlanList(false);
        setFocusedField(null); // Reset focus state
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
        setFocusedField(null); // Reset focus state
    };

    const handleSubmit = async (e) => {
        try {
            const settingId = getSettingId();
            const submitData = {
                ...formState,
                settingId: settingId,
                createdBy: 'admin',
            };
            await dispatch(createCustomer(submitData)).unwrap();
        } catch (error) {
            showMessage('error', error.message || 'Failed to save customer');
        }
    };

    const handleUpdateSubmit = async (e) => {
        try {
            const settingId = getSettingId();
            const updateRequest = {
                ...editFormState,
                settingId: settingId,
                userId: selectedUserId,
            };

            await dispatch(updateCustomer({ request: updateRequest, userId: selectedUserId })).unwrap();
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
                    <button onClick={() => setModal(true)} className="btn btn-success" disabled={plansLoading}>
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
                                    <ClearableInput
                                        value={formState.user_id}
                                        onChange={(e) => setFormState({ ...formState, user_id: e.target.value })}
                                        placeholder="Enter user ID"
                                        required={true}
                                        label="User ID *"
                                        fieldName="user_id"
                                    />
                                    <PasswordInput
                                        value={formState.user_pass}
                                        onChange={(e) => setFormState({ ...formState, user_pass: e.target.value })}
                                        placeholder="Enter password"
                                        required={true}
                                        label="Password *"
                                        fieldName="user_pass"
                                    />
                                </div>

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ClearableInput
                                        value={formState.first_name}
                                        onChange={(e) => setFormState({ ...formState, first_name: e.target.value })}
                                        placeholder="Enter first name"
                                        required={true}
                                        label="First Name *"
                                        fieldName="first_name"
                                    />
                                    <ClearableInput
                                        value={formState.last_name}
                                        onChange={(e) => setFormState({ ...formState, last_name: e.target.value })}
                                        placeholder="Enter last name"
                                        label="Last Name"
                                        fieldName="last_name"
                                    />
                                    <ClearableInput
                                        value={formState.email_addr}
                                        onChange={(e) => setFormState({ ...formState, email_addr: e.target.value })}
                                        placeholder="Enter email"
                                        required={true}
                                        label="Email *"
                                        type="email"
                                        fieldName="email_addr"
                                    />
                                    <ClearableInput
                                        value={formState.mobile_num}
                                        onChange={(e) => setFormState({ ...formState, mobile_num: e.target.value })}
                                        placeholder="Enter mobile number"
                                        required={true}
                                        label="Mobile Number *"
                                        type="tel"
                                        fieldName="mobile_num"
                                    />
                                </div>

                                {/* Account Reference */}
                                <ClearableInput
                                    value={formState.acct_ref}
                                    onChange={(e) => setFormState({ ...formState, acct_ref: e.target.value })}
                                    placeholder="Enter account reference (optional)"
                                    label="Account Reference"
                                    fieldName="acct_ref"
                                />

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

                                {/* Account Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Account Validity Type</label>
                                        <select value={formState.account_validity} onChange={(e) => setFormState({ ...formState, account_validity: e.target.value })} className="form-select">
                                            <option value="num_days_from_acct_creation">Days from Account Creation</option>
                                            <option value="absolute_expiry_ts">Absolute Expiry Timestamp</option>
                                            <option value="num_days_from_each_login">Days from Each Login</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Validity Data</label>
                                        <input
                                            type="text"
                                            value={formState.validity_data}
                                            onChange={(e) => setFormState({ ...formState, validity_data: e.target.value })}
                                            placeholder="e.g., 30 or timestamp"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Password Type</label>
                                        <select value={formState.user_pass_type} onChange={(e) => setFormState({ ...formState, user_pass_type: e.target.value })} className="form-select">
                                            <option value="specify">Specify Password</option>
                                            <option value="generate">Generate Random</option>
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

            {/* View Customer Modal - Complete Information */}
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
                                <span className="text-xl text-white font-bold">{customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value?.[0] || selectedUserId?.[0] || '?'}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value || ''} {customerDetails?.data?.results?.find((r) => r.fid === 'last_name')?.value || ''}
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
                    {customerDetails?.data?.results ? (
                        <div className="space-y-6">
                            {/* Account Information */}
                            <div className="bg-green-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                                    <IconInfoCircle className="w-5 h-5 mr-2" />
                                    Account Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* User ID */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">User ID</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'user_id')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Status</label>
                                        <p className={`font-medium ${customerDetails.data.results.find((r) => r.fid === 'rule_enable')?.value === 'Enable' ? 'text-green-600' : 'text-red-600'}`}>
                                            {customerDetails.data.results.find((r) => r.fid === 'rule_enable')?.value || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Account Reference */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Account Reference</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'acct_ref')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Account State */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Account State</label>
                                        <p className={`font-medium ${customerDetails.data.results.find((r) => r.fid === 'account_state')?.value === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                            {customerDetails.data.results.find((r) => r.fid === 'account_state')?.value || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Active Plan */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Active Plan</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'active_plan')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Account Expiry */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Account Expiry</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'expire_time')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Circuit ID */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Circuit ID</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'circuit_id')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Uniq ID */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Unique ID</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'uniq_id')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Site ID */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Site ID</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'site_uid')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Monthly Billing Day */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Monthly Billing Day</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'monthly_bill_day')?.value || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Network Plans */}
                            <div className="bg-purple-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                                    <IconWifi className="w-5 h-5 mr-2" />
                                    Network Plans
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Primary Plan */}
                                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                                        <h5 className="font-semibold text-purple-700 mb-3">Primary Plan</h5>
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

                                    {/* External Plan if not Disable */}
                                    {customerDetails.data.results.find((r) => r.fid === 'q2_plan_name')?.value !== 'Disable' && (
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
                            <div className="bg-amber-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-amber-800">
                                    <IconUserPlus className="w-5 h-5 mr-2" />
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">First Name</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'first_name')?.value || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Last Name</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'last_name')?.value || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Email Address</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'user_email')?.value || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Mobile Number</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'user_mobile')?.value || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Phone Number</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'user_phone')?.value || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Address</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'user_address')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Show GSTIN if available in your API response */}
                                    {/* If GSTIN is not in your API, you might need to check the actual field name */}
                                    {customerDetails.data.results.find((r) => r.fid === 'gstin_no') && (
                                        <div className="space-y-1">
                                            <label className="text-sm text-gray-500">GSTIN</label>
                                            <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'gstin_no')?.value || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-teal-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-teal-800">
                                    <IconRefresh className="w-5 h-5 mr-2" />
                                    Usage Statistics
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Data Usage */}
                                    <div className="bg-white p-4 rounded-lg border border-teal-200">
                                        <h5 className="font-semibold text-teal-700 mb-3">Data Usage</h5>
                                        <div className="space-y-2">
                                            {/* Today's Data Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Today's Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'daily_dq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Weekly Data Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Weekly Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'weekly_dq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Monthly Data Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Monthly Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'monthly_dq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Monthly Usage From */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Monthly Usage From:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'monthly_dq_sts')?.value || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Usage */}
                                    <div className="bg-white p-4 rounded-lg border border-teal-200">
                                        <h5 className="font-semibold text-teal-700 mb-3">Time Usage</h5>
                                        <div className="space-y-2">
                                            {/* Today's Time Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Today's Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'daily_tq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Weekly Time Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Weekly Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'weekly_tq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Monthly Time Usage */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Monthly Usage:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'monthly_tq_usage')?.value || 'N/A'}</span>
                                            </div>

                                            {/* Monthly Time Usage From */}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Monthly Usage From:</span>
                                                <span className="text-sm font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'monthly_tq_sts')?.value || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-blue-50 p-6 rounded-xl">
                                <h4 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                                    <IconInfoCircle className="w-5 h-5 mr-2" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Primary Plan Price */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Plan Price</label>
                                        <p className="font-medium text-gray-800">₹{customerDetails.data.results.find((r) => r.fid === 'q1_price')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Price Type */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Price Type</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'q1_price_type')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Payment Type */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Payment Type</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'q1_payment_type')?.value || 'N/A'}</p>
                                    </div>

                                    {/* Currency Type */}
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-500">Currency</label>
                                        <p className="font-medium text-gray-800">{customerDetails.data.results.find((r) => r.fid === 'q1_currency_type')?.value?.toUpperCase() || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Show MAC addresses if available in your API response */}
                            {/* Note: Your new API response might not have MAC addresses. If needed, you'll need to fetch from another endpoint */}
                            {/* 
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <IconWifi className="w-5 h-5 mr-2" />
            MAC Address Binding
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-500">MAC Address 1</label>
              <p className="font-medium text-gray-800 font-mono">
                {customerDetails.data.mac_address_1 || 'Not configured'}
              </p>
            </div>
          </div>
        </div>
        */}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading customer details...</p>
                        </div>
                    )}
                </div>
            </ModelViewBox>

            {/* Edit Customer Modal - Simplified */}
            <ModelViewBox
                modal={editModal}
                modelHeader={`Edit Customer - ${selectedUserId}`}
                setModel={closeEditModal}
                modelSize="xl"
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
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ClearableInput
                                        value={editFormState.user_id}
                                        onChange={(e) => setEditFormState({ ...editFormState, user_id: e.target.value })}
                                        placeholder="User ID"
                                        required={true}
                                        label="User ID *"
                                        fieldName="edit_user_id"
                                        readOnly={true}
                                    />
                                    <PasswordInput
                                        value={editFormState.user_pass}
                                        onChange={(e) => setEditFormState({ ...editFormState, user_pass: e.target.value })}
                                        placeholder="Enter new password (leave empty to keep current)"
                                        required={false}
                                        label="New Password"
                                        fieldName="edit_user_pass"
                                    />
                                </div>

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ClearableInput
                                        value={editFormState.first_name}
                                        onChange={(e) => setEditFormState({ ...editFormState, first_name: e.target.value })}
                                        placeholder="Enter first name"
                                        required={true}
                                        label="First Name *"
                                        fieldName="edit_first_name"
                                    />
                                    <ClearableInput
                                        value={editFormState.last_name}
                                        onChange={(e) => setEditFormState({ ...editFormState, last_name: e.target.value })}
                                        placeholder="Enter last name"
                                        label="Last Name"
                                        fieldName="edit_last_name"
                                    />
                                    <ClearableInput
                                        value={editFormState.email_addr}
                                        onChange={(e) => setEditFormState({ ...editFormState, email_addr: e.target.value })}
                                        placeholder="Enter email"
                                        required={true}
                                        label="Email *"
                                        type="email"
                                        fieldName="edit_email_addr"
                                    />
                                    <ClearableInput
                                        value={editFormState.mobile_num}
                                        onChange={(e) => setEditFormState({ ...editFormState, mobile_num: e.target.value })}
                                        placeholder="Enter mobile number"
                                        required={true}
                                        label="Mobile Number *"
                                        type="tel"
                                        fieldName="edit_mobile_num"
                                    />
                                </div>

                                {/* Account Reference */}
                                <ClearableInput
                                    value={editFormState.acct_ref}
                                    onChange={(e) => setEditFormState({ ...editFormState, acct_ref: e.target.value })}
                                    placeholder="Enter account reference"
                                    label="Account Reference"
                                    fieldName="edit_acct_ref"
                                />

                                {/* Bandwidth Plans - Only Primary Plan in edit */}
                                <div className="grid grid-cols-1 gap-6">
                                    <PlanSelect
                                        value={editFormState.pri_bandwidth_plan_name}
                                        onChange={(value) => setEditFormState({ ...editFormState, pri_bandwidth_plan_name: value })}
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
                                        label="Primary Bandwidth Plan *"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <textarea
                                        value={editFormState.postal_addr}
                                        onChange={(e) => setEditFormState({ ...editFormState, postal_addr: e.target.value })}
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
        </div>
    );
};

export default Index;
