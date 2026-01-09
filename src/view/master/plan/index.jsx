import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconEye from '../../../components/Icon/IconEye';
import IconPlus from '../../../components/Icon/IconPlus';
import IconWifi from '../../../components/Icon/IconWifi';
import IconDownload from '../../../components/Icon/IconDownload';
import IconUpload from '../../../components/Icon/IconUpload';
import IconClock from '../../../components/Icon/IconClock';
import IconDatabase from '../../../components/Icon/IconDatabase';
import IconCreditCard from '../../../components/Icon/IconCreditCard';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ModelViewBox from '../../../util/ModelViewBox';
import Table from '../../../util/Table';
import { showMessage } from '../../../util/AllFunction';
import { getPlan, createPlan, updatePlan, deletePlan, updatePlanStatus, resetPlanStatus } from '../../../redux/planSlice';
import _ from 'lodash';

const PlanManagement = () => {
    const dispatch = useDispatch();

    const planState = useSelector((state) => state.PlanSlice || {});
    const { planData = [], loading = false, error = null, createPlanSuccess = false, updatePlanSuccess = false, deletePlanSuccess = false, statusUpdateSuccess = false } = planState;

    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [state, setState] = useState({
        rule_name: '',
        profile_type: 'primary',
        bw_dn_kbps: '',
        bw_up_kbps: '',
        time_limit_type: 'disable',
        time_limit: '',
        data_limit_type: 'disable',
        data_limit: '',
        plan_price: '0.0',
        is_active: true,
    });
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewType, setViewType] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [dataVersion, setDataVersion] = useState(0);

    // Card view specific states
    const [cardCurrentPage, setCardCurrentPage] = useState(1);
    const [cardPageSize, setCardPageSize] = useState(8);

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (createPlanSuccess) {
            showMessage('success', 'Plan created successfully');
            closeModel();
            fetchPlans();
            dispatch(resetPlanStatus());
        }

        if (updatePlanSuccess) {
            showMessage('success', 'Plan updated successfully');
            closeModel();
            fetchPlans();
            dispatch(resetPlanStatus());
        }

        if (deletePlanSuccess) {
            showMessage('success', 'Plan deleted successfully');
            fetchPlans();
            dispatch(resetPlanStatus());
        }

        if (statusUpdateSuccess) {
            showMessage('success', 'Plan status updated successfully');
            fetchPlans();
            setDataVersion(prev => prev + 1);
            dispatch(resetPlanStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetPlanStatus());
        }
    }, [createPlanSuccess, updatePlanSuccess, deletePlanSuccess, statusUpdateSuccess, error]);

    const getSettingId = () => {
        const selectedProviderId = localStorage.getItem('selectedProvider');
        return '6f786d38-1399-430e-9f27-aeedc7c95f44';
    };

    const fetchPlans = () => {
        dispatch(getPlan({settingId: getSettingId()}));
    };

    const closeModel = () => {
        setModal(false);
        setViewModal(false);
        onFormClear();
    };

    const onFormClear = () => {
        setSelectedItem(null);
        setErrors({});
        setState({
            rule_name: '',
            profile_type: 'primary',
            bw_dn_kbps: '',
            bw_up_kbps: '',
            time_limit_type: 'disable',
            time_limit: '',
            data_limit_type: 'disable',
            data_limit: '',
            plan_price: '0.0',
            is_active: true,
        });
    };

    const createModel = () => {
        onFormClear();
        setModal(true);
    };

    const viewPlanDetails = (plan) => {
        setSelectedItem(plan);
        setViewModal(true);
    };

    const onEditForm = (plan) => {
        setState({
            rule_name: plan.rule_name || '',
            profile_type: plan.profile_type || 'primary',
            bw_dn_kbps: plan.bw_dn_kbps || '',
            bw_up_kbps: plan.bw_up_kbps || '',
            time_limit_type: plan.time_limit_type || 'disable',
            time_limit: plan.time_limit || '',
            data_limit_type: plan.data_limit_type || 'disable',
            data_limit: plan.data_limit || '',
            plan_price: plan.plan_price || '0.0',
            is_active: plan.is_active || true,
        });
        setSelectedItem(plan);
        setModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleToggleStatus = async (planId, currentStatus) => {
        try {
            await dispatch(
                updatePlanStatus({
                    planId,
                    isActive: !currentStatus,
                })
            ).unwrap();
        } catch (error) {
            showMessage('error', 'Failed to update plan status');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!state.rule_name.trim()) {
            newErrors.rule_name = 'Plan name is required';
        }

        if (!state.bw_dn_kbps) {
            newErrors.bw_dn_kbps = 'Download speed is required';
        }

        if (!state.bw_up_kbps) {
            newErrors.bw_up_kbps = 'Upload speed is required';
        }

        if (!state.plan_price && state.plan_price !== '0') {
            newErrors.plan_price = 'Price is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fill in all required fields');
            return;
        }

        try {
            const requestData = {
                rule_name: state.rule_name.trim(),
                profile_type: state.profile_type,
                bw_dn_kbps: state.bw_dn_kbps,
                bw_up_kbps: state.bw_up_kbps,
                time_limit_type: state.time_limit_type,
                time_limit: state.time_limit || '',
                data_limit_type: state.data_limit_type,
                data_limit: state.data_limit || '',
                plan_price: state.plan_price,
                is_active: state.is_active,
            };

            if (selectedItem?.id) {
                dispatch(
                    updatePlan({
                        request: requestData,
                        planId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createPlan(requestData));
            }
        } catch (error) {
            showMessage('error', 'Failed to save data');
        }
    };

    const handleDeletePlan = (planId) => {
        showMessage('warning', 'Are you sure you want to delete this plan?', () => {
            dispatch(deletePlan(planId));
        });
    };

    const formatSpeed = (kbps) => {
        if (!kbps) return 'Unlimited';
        const mbps = kbps / 1000;
        return `${mbps} Mbps`;
    };

    const getStatusBadge = (status) => {
        return status
            ? { label: 'Active', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', iconColor: 'text-green-300' }
            : { label: 'Inactive', color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', iconColor: 'text-gray-300' };
    };

    const getPlanCardColor = (plan) => {
        if (!plan.is_active) {
            return {
                header: 'bg-gradient-to-r from-gray-100 to-gray-200',
                body: 'bg-gray-50',
                border: 'border-gray-200',
                shadow: 'hover:shadow-gray-300',
                iconBg: 'bg-gray-200',
                iconColor: 'text-gray-500',
            };
        }

        if (plan.plan_price === '0.0') {
            return {
                header: 'bg-gradient-to-r from-emerald-50 to-teal-100',
                body: 'bg-white',
                border: 'border-emerald-200',
                shadow: 'hover:shadow-emerald-300',
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600',
            };
        } else {
            return {
                header: 'bg-gradient-to-r from-blue-50 to-cyan-100',
                body: 'bg-white',
                border: 'border-blue-200',
                shadow: 'hover:shadow-blue-300',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
            };
        }
    };

    const filteredPlans = planData.filter((plan) => {
        const matchesSearch = plan.rule_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        return matchesSearch;
    });

    // Table pagination - KEEP AS IS
    const getPaginatedTableData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredPlans.slice(startIndex, endIndex);
    };

    // Card pagination - NEW
    const getPaginatedCards = () => {
        const startIndex = (cardCurrentPage - 1) * cardPageSize;
        const endIndex = startIndex + cardPageSize;
        return filteredPlans.slice(startIndex, endIndex);
    };

    const cardTotalPages = Math.ceil(filteredPlans.length / cardPageSize);

    // Card pagination handlers
    const handleCardPageChange = (page) => {
        if (page < 1 || page > cardTotalPages) return;
        setCardCurrentPage(page);
    };

    const handleCardPageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setCardPageSize(newSize);
        setCardCurrentPage(1);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Table columns configuration
    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div className="text-gray-600">{row.index + 1 + (currentPage * pageSize)}</div>,
            width: 70,
        },
        {
            Header: 'Plan Name',
            accessor: 'rule_name',
            sort: true,
            Cell: ({ row }) => {
                const colors = getPlanCardColor(row.original);
                return (
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform duration-300 hover:rotate-12`}>
                            <IconWifi className={`w-5 h-5 ${colors.iconColor}`} />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800">{row.original.rule_name}</div>
                            <div className="text-xs text-gray-500 capitalize">{row.original.profile_type} Profile</div>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Download',
            accessor: 'bw_dn_kbps',
            Cell: ({ value }) => (
                <div className="font-medium text-gray-800 flex items-center gap-2">
                    <IconDownload className="w-4 h-4 text-blue-500" />
                    {formatSpeed(value)}
                </div>
            ),
        },
        {
            Header: 'Upload',
            accessor: 'bw_up_kbps',
            Cell: ({ value }) => (
                <div className="font-medium text-gray-800 flex items-center gap-2">
                    <IconUpload className="w-4 h-4 text-green-500" />
                    {formatSpeed(value)}
                </div>
            ),
        },
        {
            Header: 'Time Limit',
            accessor: 'time_limit',
            Cell: ({ row }) => (
                <div className="font-medium text-gray-800 flex items-center gap-2">
                    <IconClock className="w-4 h-4 text-amber-500" />
                    {row.original.time_limit_type === 'disable' ? 'No Limit' : `${row.original.time_limit || ''} hours`}
                </div>
            ),
        },
        {
            Header: 'Data Limit',
            accessor: 'data_limit',
            Cell: ({ row }) => (
                <div className="font-medium text-gray-800 flex items-center gap-2">
                    <IconDatabase className="w-4 h-4 text-purple-500" />
                    {row.original.data_limit_type === 'disable' ? 'No Limit' : row.original.data_limit || 'Not Set'}
                </div>
            ),
        },
        {
            Header: 'Price',
            accessor: 'plan_price',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-800">{row.original.plan_price === '0.0' ? 'Free' : `${row.original.plan_currency_symbol || 'Rs'} ${row.original.plan_price}`}</div>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'is_active',
            Cell: ({ value, row }) => (
                <button
                    onClick={() => handleToggleStatus(row.original.plan_id, value)}
                    className={`inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    <span className="sr-only">{value ? 'Active' : 'Inactive'}</span>
                </button>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Tippy content="View Details">
                        <button
                            onClick={() => viewPlanDetails(row.original)}
                            className="p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-110"
                        >
                            <IconEye className="w-4 h-4 text-blue-600" />
                        </button>
                    </Tippy>
                    {/* <Tippy content="Edit Plan">
                        <button
                            onClick={() => onEditForm(row.original)}
                            className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 hover:scale-110"
                        >
                            <IconPencil className="w-4 h-4 text-green-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Delete Plan">
                        <button
                            onClick={() => handleDeletePlan(row.original.id)}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 transition-all duration-300 hover:scale-110"
                        >
                            <IconTrashLines className="w-4 h-4 text-red-600" />
                        </button>
                    </Tippy> */}
                </div>
            ),
        },
    ];

    // Custom Form Component
    const renderForm = () => {
        const formFields = [
            {
                id: 'rule_name',
                label: 'Plan Name',
                type: 'text',
                required: true,
                placeholder: 'Enter plan name',
                colSpan: 12,
            },
            {
                id: 'profile_type',
                label: 'Profile Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'primary', label: 'Primary' },
                    { value: 'secondary', label: 'Secondary' },
                ],
                colSpan: 6,
            },
            {
                id: 'bw_dn_kbps',
                label: 'Download Speed (Kbps)',
                type: 'number',
                required: true,
                placeholder: '8000',
                colSpan: 6,
            },
            {
                id: 'bw_up_kbps',
                label: 'Upload Speed (Kbps)',
                type: 'number',
                required: true,
                placeholder: '8000',
                colSpan: 6,
            },
            {
                id: 'time_limit_type',
                label: 'Time Limit Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'disable', label: 'No Limit' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'monthly', label: 'Monthly' },
                ],
                colSpan: 6,
            },
            {
                id: 'time_limit',
                label: 'Time Limit (Hours)',
                type: 'number',
                placeholder: '24',
                colSpan: 6,
                disabled: state.time_limit_type === 'disable',
            },
            {
                id: 'data_limit_type',
                label: 'Data Limit Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'disable', label: 'No Limit' },
                    { value: 'limit', label: 'Limited' },
                ],
                colSpan: 6,
            },
            {
                id: 'data_limit',
                label: 'Data Limit',
                type: 'text',
                placeholder: '10GB',
                colSpan: 6,
                disabled: state.data_limit_type === 'disable',
            },
            {
                id: 'plan_price',
                label: 'Price',
                type: 'number',
                required: true,
                placeholder: '0.00',
                step: '0.01',
                colSpan: 6,
            },
            {
                id: 'is_active',
                label: 'Status',
                type: 'select',
                required: true,
                options: [
                    { value: true, label: 'Active' },
                    { value: false, label: 'Inactive' },
                ],
                colSpan: 6,
            },
        ];

        return (
            <form onSubmit={onFormSubmit}>
                <div className="grid grid-cols-12 gap-4">
                    {formFields.map((field) => {
                        const shouldShowField = () => {
                            if (field.id === 'time_limit') {
                                return state.time_limit_type !== 'disable';
                            }
                            if (field.id === 'data_limit') {
                                return state.data_limit_type === 'limit';
                            }
                            return true;
                        };

                        if (!shouldShowField()) return null;

                        return (
                            <div key={field.id} className={`col-span-${field.colSpan || 12}`}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        id={field.id}
                                        name={field.id}
                                        value={state[field.id] || ''}
                                        onChange={handleInputChange}
                                        className={`form-select w-full transition-all duration-300 ${
                                            errors[field.id] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                        }`}
                                        required={field.required}
                                        disabled={field.disabled}
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        id={field.id}
                                        name={field.id}
                                        value={state[field.id] || ''}
                                        onChange={handleInputChange}
                                        placeholder={field.placeholder}
                                        className={`form-input w-full transition-all duration-300 ${
                                            errors[field.id] ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                        }`}
                                        required={field.required}
                                        step={field.step}
                                        disabled={field.disabled}
                                    />
                                )}

                                {errors[field.id] && <p className="mt-1 text-sm text-red-500 animate-pulse">{errors[field.id]}</p>}
                            </div>
                        );
                    })}
                </div>
            </form>
        );
    };

    return (
        <div className="animate-fadeIn">
            <div className="p-6">
                {/* Enhanced Header with Gradient Background */}
                <div className="relative mb-8 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent"></div>
                    <div className="relative p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="relative">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 bg-clip-text text-transparent">Bandwidth Plans</h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 ml-1">Manage your internet bandwidth plans and pricing</p>
                                <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
                                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                            {/* <button
                                type="button"
                                onClick={createModel}
                                className="relative group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg shadow-orange-500/30"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                                <span className="flex items-center gap-2">
                                    <IconPlus className="w-5 h-5 animate-bounce" />
                                    Add New Plan
                                </span>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white to-transparent group-hover:animate-pulse"></div>
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Filters and Search - Enhanced */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            placeholder="Search plans by name..."
                            className="form-input pl-12 w-full py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(0);
                                setCardCurrentPage(1);
                            }}
                        />
                        <div className="absolute left-4 top-3.5 text-blue-500 group-focus-within:text-blue-600 transition-colors duration-300">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setViewType('table');
                                setCurrentPage(0);
                            }}
                            className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                viewType === 'table'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                            }`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 6L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M21 12L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M21 18L3 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setViewType('grid');
                                setCardCurrentPage(1);
                            }}
                            className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                viewType === 'grid'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                            }`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Table view - KEEP AS IS */}
                <div className={`datatables ${viewType === 'table' ? 'animate-fadeIn' : 'hidden'}`}>
                    <Table
                        columns={columns}
                        Title={'Plans List'}
                        // toggle={createModel}
                        data={getPaginatedTableData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={filteredPlans.length}
                        totalPages={Math.ceil(filteredPlans.length / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={false}
                        isSortable={true}
                        // btnName="Add Plan"
                        loading={loading}
                        customButtonClass="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/30"
                    />
                </div>

                {/* Grid view - FIXED CARD PAGINATION */}
                {viewType === 'grid' && (
                    <>
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading plans...</p>
                            </div>
                        ) : filteredPlans.length === 0 ? (
                            <div className="text-center py-16 animate-fadeIn">
                                <div className="inline-block p-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 mb-6">
                                    <IconWifi className="w-16 h-16 text-gray-400 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-3">No plans found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">Try adjusting your search or filter criteria to find what you're looking for.</p>
                                <button
                                    onClick={createModel}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105"
                                >
                                    Create Your First Plan
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeInUp" key={dataVersion}>
                                    {getPaginatedCards().map((plan, index) => {
                                        const colors = getPlanCardColor(plan);
                                        const isHovered = hoveredCard === plan.id;

                                        return (
                                            <div
                                                key={`${plan.id}-${index}`}
                                                className={`relative rounded-xl transition-all duration-500 ${!plan.is_active ? 'opacity-80' : ''} ${isHovered ? 'transform -translate-y-2' : ''}`}
                                                onMouseEnter={() => setHoveredCard(plan.id)}
                                                onMouseLeave={() => setHoveredCard(null)}
                                            >
                                                {/* Floating animation for active cards */}
                                                {plan.is_active && (
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200 animate-float"></div>
                                                )}

                                                <div
                                                    className={`relative rounded-xl ${colors.border} border-2 overflow-hidden transition-all duration-300 ${
                                                        !plan.is_active ? 'bg-gradient-to-br from-gray-50 to-gray-100' : colors.body
                                                    }`}
                                                >
                                                    {/* Card Header with Colored Background */}
                                                    <div className={`p-5 transition-all duration-300 ${colors.header}`}>
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform duration-300 ${
                                                                        isHovered ? 'rotate-12 scale-110' : ''
                                                                    }`}
                                                                >
                                                                    <IconWifi className={`w-6 h-6 ${colors.iconColor}`} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800 text-lg">{plan.rule_name}</h3>
                                                                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                                                                        <span className="bg-white/50 px-2 py-0.5 rounded">ID: {plan.id}</span>
                                                                        <span className="capitalize">{plan.profile_type}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStatus(plan.plan_id, plan.is_active);
                                                                    }}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(plan.is_active).color} shadow-md cursor-pointer`}
                                                                >
                                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* All Plan Data in Compact Layout */}
                                                    <div className="p-5">
                                                        {/* Bandwidth Section */}
                                                        <div className="mb-5">
                                                            <div className="text-xs font-medium text-gray-500 mb-3 tracking-wider">BANDWIDTH</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50">
                                                                            <IconDownload className="w-4 h-4 text-blue-600" />
                                                                        </div>
                                                                        <span className="text-xs text-gray-600">Download</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-gray-800">{formatSpeed(plan.bw_dn_kbps)}</div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-100 to-green-50">
                                                                            <IconUpload className="w-4 h-4 text-green-600" />
                                                                        </div>
                                                                        <span className="text-xs text-gray-600">Upload</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-gray-800">{formatSpeed(plan.bw_up_kbps)}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Limits Section */}
                                                        <div className="mb-5">
                                                            <div className="text-xs font-medium text-gray-500 mb-3 tracking-wider">LIMITS</div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-amber-50">
                                                                            <IconClock className="w-4 h-4 text-amber-600" />
                                                                        </div>
                                                                        <span className="text-xs text-gray-600">Time</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-gray-800">
                                                                        {plan.time_limit_type === 'disable' || !plan.time_limit_type
                                                                            ? 'No Limit'
                                                                            : `${plan.time_limit || ''} hours${plan.time_limit_type === 'monthly' ? '/month' : '/day'}`}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50">
                                                                            <IconDatabase className="w-4 h-4 text-purple-600" />
                                                                        </div>
                                                                        <span className="text-xs text-gray-600">Data</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-gray-800">
                                                                        {plan.data_limit_type === 'disable' || !plan.data_limit_type ? 'No Limit' : plan.data_limit || 'Not Set'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Price Section */}
                                                        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 transition-all duration-300 hover:shadow-inner">
                                                            <div className="text-center">
                                                                <div className="text-xs text-gray-500 mb-2 tracking-wider">PRICE</div>
                                                                <div className={`text-2xl font-bold ${plan.plan_price === '0.0' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                                    {plan.plan_price === '0.0' ? 'Free' : `${plan.plan_currency_symbol || 'Rs'} ${plan.plan_price}`}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                                                    <div className="opacity-75">Location: {plan.setting?.location_name || 'N/A'}</div>
                                                                    <div className="opacity-75">Last Sync: {new Date(plan.last_sync).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => viewPlanDetails(plan)}
                                                                className="flex-1 btn bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg py-2.5 text-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                                                            >
                                                                <IconEye className="w-4 h-4" />
                                                                Details
                                                            </button>
                                                            {/* <button
                                                                onClick={() => onEditForm(plan)}
                                                                className="p-2.5 btn bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border border-green-300 hover:border-green-400 rounded-lg transition-all duration-300 hover:scale-110"
                                                            >
                                                                <IconPencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePlan(plan.id)}
                                                                className="p-2.5 btn bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-all duration-300 hover:scale-110"
                                                            >
                                                                <IconTrashLines className="w-4 h-4" />
                                                            </button> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CUSTOM PAGINATION FOR CARD VIEW ONLY */}
                                {filteredPlans.length > cardPageSize && (
                                    <div className="mt-8 animate-fadeIn">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            {/* Page Size Selector for Cards */}
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium whitespace-nowrap text-gray-700">Show:</label>
                                                <select 
                                                    value={cardPageSize} 
                                                    onChange={handleCardPageSizeChange}
                                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="8">8 cards</option>
                                                    <option value="12">12 cards</option>
                                                    <option value="16">16 cards</option>
                                                    <option value="20">20 cards</option>
                                                </select>
                                            </div>

                                            {/* Page Info for Cards */}
                                            <div className="text-sm text-gray-700">
                                                Showing <span className="font-bold">{(cardCurrentPage - 1) * cardPageSize + 1}</span> to{' '}
                                                <span className="font-bold">{Math.min(cardCurrentPage * cardPageSize, filteredPlans.length)}</span> of{' '}
                                                <span className="font-bold">{filteredPlans.length}</span> plans
                                            </div>

                                            {/* Pagination Controls for Cards */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCardPageChange(cardCurrentPage - 1)}
                                                    disabled={cardCurrentPage === 1}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                                        cardCurrentPage === 1
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:scale-105'
                                                    }`}
                                                >
                                                    Previous
                                                </button>

                                                {/* Page Numbers for Cards */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, cardTotalPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (cardTotalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (cardCurrentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (cardCurrentPage >= cardTotalPages - 2) {
                                                            pageNum = cardTotalPages - 4 + i;
                                                        } else {
                                                            pageNum = cardCurrentPage - 2 + i;
                                                        }

                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => handleCardPageChange(pageNum)}
                                                                className={`w-8 h-8 rounded-lg transition-all duration-300 ${
                                                                    cardCurrentPage === pageNum
                                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <span className="text-gray-600 mx-2">
                                                    Page {cardCurrentPage} of {cardTotalPages}
                                                </span>

                                                <button
                                                    onClick={() => handleCardPageChange(cardCurrentPage + 1)}
                                                    disabled={cardCurrentPage === cardTotalPages}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                                        cardCurrentPage === cardTotalPages
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:scale-105'
                                                    }`}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Custom Modal for Add/Edit - Enhanced */}
            <ModelViewBox
                modal={modal}
                setModel={closeModel}
                modelHeader={selectedItem ? 'Edit Plan' : 'Add New Plan'}
                modelSize="lg"
                handleSubmit={onFormSubmit}
                btnName={selectedItem ? 'Update Plan' : 'Create Plan'}
                cancelBtn={true}
                saveBtn={true}
                headerBg="bg-gradient-to-r from-[#ee7f1b] to-[#f39c4a]"
                backgroundColor="bg-white"
                showBackdropBlur={true}
                customHeader={
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold tracking-tight">{selectedItem ? 'Edit Plan' : 'Add New Plan'}</h4>
                            <p className="text-sm text-white/80">{selectedItem ? 'Update your plan details' : 'Create a new bandwidth plan'}</p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-6">{renderForm()}</div>
            </ModelViewBox>

            {/* View Plan Details Modal */}
            <ModelViewBox modal={viewModal} modelHeader="Plan Details" setModel={closeModel} modelSize="md" showSubmit={false} saveBtn={false}>
                {selectedItem && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-4">
                                <IconWifi className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{selectedItem.rule_name}</h3>
                            <div className="flex justify-center gap-2 mt-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedItem.is_active).color}`}>{selectedItem.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>

                        {/* All Plan Data in Details View */}
                        <div className="space-y-6">
                            {/* Bandwidth Section */}
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
                                    Bandwidth
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-white/50">
                                                <IconDownload className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Download</span>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800">{formatSpeed(selectedItem.bw_dn_kbps)}</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-white/50">
                                                <IconUpload className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Upload</span>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800">{formatSpeed(selectedItem.bw_up_kbps)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Limits Section */}
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded"></div>
                                    Limits
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-white/50">
                                                <IconClock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Time Limit</span>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800">
                                            {selectedItem.time_limit_type === 'disable' || !selectedItem.time_limit_type
                                                ? 'No Limit'
                                                : `${selectedItem.time_limit || ''} hours${selectedItem.time_limit_type === 'monthly' ? '/month' : '/day'}`}
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-white/50">
                                                <IconDatabase className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <span className="text-sm text-gray-700">Data Limit</span>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800">
                                            {selectedItem.data_limit_type === 'disable' || !selectedItem.data_limit_type ? 'No Limit' : selectedItem.data_limit || 'Not Set'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 mb-2">PRICE</div>
                                    <div className={`text-3xl font-bold ${selectedItem.plan_price === '0.0' ? 'text-emerald-600' : 'text-gray-800'} mb-3`}>
                                        {selectedItem.plan_price === '0.0' ? 'Free' : `${selectedItem.plan_currency_symbol || 'Rs'} ${selectedItem.plan_price}`}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                        <div className="text-center">
                                            <div className="font-medium">Location</div>
                                            <div className="mt-1">{selectedItem.setting?.location_name || 'N/A'}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium">Last Updated</div>
                                            <div className="mt-1">{new Date(selectedItem.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded"></div>
                                    Additional Information
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Plan ID:</span>
                                                <span className="font-medium">{selectedItem.plan_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Profile Type:</span>
                                                <span className="font-medium capitalize">{selectedItem.profile_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Rule ID:</span>
                                                <span className="font-medium">{selectedItem.rule_id}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Setting ID:</span>
                                                <span className="font-medium">{selectedItem.setting_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Created:</span>
                                                <span className="font-medium">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Last Sync:</span>
                                                <span className="font-medium">{new Date(selectedItem.last_sync).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Add CSS Animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .delay-300 {
                    animation-delay: 300ms;
                }
            `}</style>
        </div>
    );
};

export default PlanManagement;