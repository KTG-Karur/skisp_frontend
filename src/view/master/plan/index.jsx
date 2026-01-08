// PlanManagement.jsx
import { useState, Fragment, useEffect } from 'react';
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
import _ from 'lodash';

// Dummy data for plans - Enhanced with more data
const dummyPlans = [
    {
        rule_id: 1,
        rule_name: 'Guest WiFi',
        plan_payment_type: 'noinvoice',
        profile_type: 'primary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '8000',
        bw_up_kbps: '8000',
        time_limit_type: 'daily',
        time_limit: '5',
        data_limit_type: 'disable',
        data_limit: '',
        plan_price: '0.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'from_tmpl',
        ref_group_id: 'default',
        rule_enable: 'enable',
    },
    {
        rule_id: 2,
        rule_name: 'Premium Plan',
        plan_payment_type: 'prepaid',
        profile_type: 'primary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '50000',
        bw_up_kbps: '20000',
        time_limit_type: 'monthly',
        time_limit: '720',
        data_limit_type: 'limit',
        data_limit: '100GB',
        plan_price: '999.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'fixed',
        ref_group_id: 'premium',
        rule_enable: 'enable',
    },
    {
        rule_id: 3,
        rule_name: 'Business Plan',
        plan_payment_type: 'postpaid',
        profile_type: 'secondary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '100000',
        bw_up_kbps: '50000',
        time_limit_type: 'unlimited',
        time_limit: '',
        data_limit_type: 'unlimited',
        data_limit: '',
        plan_price: '2499.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'fixed',
        ref_group_id: 'business',
        rule_enable: 'enable',
    },
    {
        rule_id: 4,
        rule_name: 'Student Plan',
        plan_payment_type: 'noinvoice',
        profile_type: 'primary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '20000',
        bw_up_kbps: '10000',
        time_limit_type: 'daily',
        time_limit: '3',
        data_limit_type: 'limit',
        data_limit: '10GB',
        plan_price: '0.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'from_tmpl',
        ref_group_id: 'student',
        rule_enable: 'disable',
    },
    {
        rule_id: 5,
        rule_name: 'Family Pack',
        plan_payment_type: 'postpaid',
        profile_type: 'primary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '75000',
        bw_up_kbps: '30000',
        time_limit_type: 'monthly',
        time_limit: '600',
        data_limit_type: 'limit',
        data_limit: '500GB',
        plan_price: '1899.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'fixed',
        ref_group_id: 'family',
        rule_enable: 'enable',
    },
    {
        rule_id: 6,
        rule_name: 'Basic Internet',
        plan_payment_type: 'prepaid',
        profile_type: 'primary',
        bw_download_type: 'limit',
        bw_upload_type: 'limit',
        bw_dn_kbps: '15000',
        bw_up_kbps: '5000',
        time_limit_type: 'daily',
        time_limit: '8',
        data_limit_type: 'limit',
        data_limit: '5GB',
        plan_price: '299.0',
        plan_currency_symbol: 'Rs',
        plan_currency_type: 'inr',
        plan_price_type: 'fixed',
        ref_group_id: 'basic',
        rule_enable: 'enable',
    },
];

const PlanManagement = () => {
    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [state, setState] = useState({
        rule_name: '',
        profile_type: 'primary',
        plan_payment_type: 'noinvoice',
        bw_dn_kbps: '',
        bw_up_kbps: '',
        time_limit_type: 'daily',
        time_limit: '',
        data_limit_type: 'disable',
        data_limit: '',
        plan_price: '0.0',
        rule_enable: 'enable',
    });
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [plans, setPlans] = useState(dummyPlans);
    const [viewType, setViewType] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [hoveredCard, setHoveredCard] = useState(null);

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
            plan_payment_type: 'noinvoice',
            bw_dn_kbps: '',
            bw_up_kbps: '',
            time_limit_type: 'daily',
            time_limit: '',
            data_limit_type: 'disable',
            data_limit: '',
            plan_price: '0.0',
            rule_enable: 'enable',
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
            plan_payment_type: plan.plan_payment_type || 'noinvoice',
            bw_dn_kbps: plan.bw_dn_kbps || '',
            bw_up_kbps: plan.bw_up_kbps || '',
            time_limit_type: plan.time_limit_type || 'daily',
            time_limit: plan.time_limit || '',
            data_limit_type: plan.data_limit_type || 'disable',
            data_limit: plan.data_limit || '',
            plan_price: plan.plan_price || '0.0',
            rule_enable: plan.rule_enable || 'enable',
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
            if (selectedItem?.rule_id) {
                const updatedPlans = plans.map((plan) =>
                    plan.rule_id === selectedItem.rule_id
                        ? {
                              ...plan,
                              ...state,
                              plan_currency_symbol: 'Rs',
                              plan_currency_type: 'inr',
                              plan_price_type: parseFloat(state.plan_price) > 0 ? 'fixed' : 'from_tmpl',
                              bw_download_type: 'limit',
                              bw_upload_type: 'limit',
                          }
                        : plan
                );
                setPlans(updatedPlans);
                showMessage('success', 'Plan updated successfully');
            } else {
                const newPlan = {
                    rule_id: plans.length + 1,
                    ...state,
                    plan_currency_symbol: 'Rs',
                    plan_currency_type: 'inr',
                    plan_price_type: parseFloat(state.plan_price) > 0 ? 'fixed' : 'from_tmpl',
                    ref_group_id: 'custom_' + Date.now(),
                    bw_download_type: 'limit',
                    bw_upload_type: 'limit',
                };
                setPlans([...plans, newPlan]);
                showMessage('success', 'Plan created successfully');
            }
            closeModel();
        } catch (error) {
            showMessage('error', 'Failed to save plan');
        }
    };

    const handleDeletePlan = (planId) => {
        showMessage('warning', 'Are you sure you want to delete this plan?', () => {
            const updatedPlans = plans.filter((plan) => plan.rule_id !== planId);
            setPlans(updatedPlans);
            showMessage('success', 'Plan deleted successfully');
        });
    };

    const formatSpeed = (kbps) => {
        if (!kbps) return 'Unlimited';
        const mbps = kbps / 1000;
        return `${mbps} Mbps`;
    };

    const getPaymentTypeBadge = (type) => {
        const types = {
            noinvoice: { label: 'Free', color: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white', iconColor: 'text-emerald-300' },
            prepaid: { label: 'Prepaid', color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white', iconColor: 'text-blue-300' },
            postpaid: { label: 'Postpaid', color: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white', iconColor: 'text-purple-300' },
        };
        return types[type] || { label: type, color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white', iconColor: 'text-gray-300' };
    };

    const getStatusBadge = (status) => {
        return status === 'enable'
            ? { label: 'Active', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', iconColor: 'text-green-300' }
            : { label: 'Inactive', color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white', iconColor: 'text-gray-300' };
    };

    const getPlanCardColor = (plan) => {
        if (plan.rule_enable === 'disable') {
            return {
                header: 'bg-gradient-to-r from-gray-100 to-gray-200',
                body: 'bg-gray-50',
                border: 'border-gray-200',
                shadow: 'hover:shadow-gray-300',
                iconBg: 'bg-gray-200',
                iconColor: 'text-gray-500',
            };
        }

        switch (plan.plan_payment_type) {
            case 'noinvoice':
                return {
                    header: 'bg-gradient-to-r from-emerald-50 to-teal-100',
                    body: 'bg-white',
                    border: 'border-emerald-200',
                    shadow: 'hover:shadow-emerald-300',
                    iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600',
                };
            case 'prepaid':
                return {
                    header: 'bg-gradient-to-r from-blue-50 to-cyan-100',
                    body: 'bg-white',
                    border: 'border-blue-200',
                    shadow: 'hover:shadow-blue-300',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                };
            case 'postpaid':
                return {
                    header: 'bg-gradient-to-r from-purple-50 to-indigo-100',
                    body: 'bg-white',
                    border: 'border-purple-200',
                    shadow: 'hover:shadow-purple-300',
                    iconBg: 'bg-purple-100',
                    iconColor: 'text-purple-600',
                };
            default:
                return {
                    header: 'bg-gradient-to-r from-gray-50 to-gray-100',
                    body: 'bg-white',
                    border: 'border-gray-200',
                    shadow: 'hover:shadow-gray-300',
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                };
        }
    };

    const filteredPlans = plans.filter((plan) => {
        const matchesSearch = plan.rule_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || plan.plan_payment_type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Table columns configuration
    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div className="text-gray-600">{row.index + 1}</div>,
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
            Header: 'Price',
            accessor: 'plan_price',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-800">{row.original.plan_price === '0.0' ? 'Free' : `${row.original.plan_currency_symbol} ${row.original.plan_price}`}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getPaymentTypeBadge(row.original.plan_payment_type).color}`}>
                        {getPaymentTypeBadge(row.original.plan_payment_type).label}
                    </div>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'rule_enable',
            Cell: ({ value }) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(value).color}`}>{getStatusBadge(value).label}</span>,
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
                    <Tippy content="Edit Plan">
                        <button
                            onClick={() => onEditForm(row.original)}
                            className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 hover:scale-110"
                        >
                            <IconPencil className="w-4 h-4 text-green-600" />
                        </button>
                    </Tippy>
                    <Tippy content="Delete Plan">
                        <button
                            onClick={() => handleDeletePlan(row.original.rule_id)}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 transition-all duration-300 hover:scale-110"
                        >
                            <IconTrashLines className="w-4 h-4 text-red-600" />
                        </button>
                    </Tippy>
                </div>
            ),
        },
    ];

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredPlans.slice(startIndex, endIndex);
    };

    // Custom Form Component - Fixed
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
                id: 'plan_payment_type',
                label: 'Payment Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'noinvoice', label: 'Free' },
                    { value: 'prepaid', label: 'Prepaid' },
                    { value: 'postpaid', label: 'Postpaid' },
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
                    { value: 'daily', label: 'Daily' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'unlimited', label: 'Unlimited' },
                ],
                colSpan: 6,
            },
            {
                id: 'time_limit',
                label: 'Time Limit (Hours)',
                type: 'number',
                placeholder: '24',
                colSpan: 6,
            },
            {
                id: 'data_limit_type',
                label: 'Data Limit Type',
                type: 'select',
                required: true,
                options: [
                    { value: 'disable', label: 'No Limit' },
                    { value: 'limit', label: 'Limited' },
                    { value: 'unlimited', label: 'Unlimited' },
                ],
                colSpan: 6,
            },
            {
                id: 'data_limit',
                label: 'Data Limit',
                type: 'text',
                placeholder: '10GB',
                colSpan: 6,
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
                id: 'rule_enable',
                label: 'Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'enable', label: 'Active' },
                    { value: 'disable', label: 'Inactive' },
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
                                return state.time_limit_type !== 'unlimited';
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
                            <button
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
                            </button>
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-4 top-3.5 text-blue-500 group-focus-within:text-blue-600 transition-colors duration-300">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                filterType === 'all'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                            }`}
                        >
                            All Plans
                        </button>
                        <button
                            onClick={() => setFilterType('noinvoice')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                filterType === 'noinvoice'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200'
                            }`}
                        >
                            Free
                        </button>
                        <button
                            onClick={() => setFilterType('prepaid')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                filterType === 'prepaid'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200'
                            }`}
                        >
                            Prepaid
                        </button>
                        <button
                            onClick={() => setFilterType('postpaid')}
                            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                filterType === 'postpaid'
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 hover:from-purple-200 hover:to-indigo-200'
                            }`}
                        >
                            Postpaid
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewType('grid')}
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
                        <button
                            onClick={() => setViewType('list')}
                            className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                viewType === 'list'
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
                    </div>
                </div>

                {/* Plans Grid View - Enhanced with Animations */}
                {viewType === 'grid' ? (
                    <>
                        {filteredPlans.length === 0 ? (
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeInUp">
                                {filteredPlans.map((plan) => {
                                    const colors = getPlanCardColor(plan);
                                    const isHovered = hoveredCard === plan.rule_id;

                                    return (
                                        <div
                                            key={plan.rule_id}
                                            className={`relative rounded-xl transition-all duration-500 ${plan.rule_enable === 'disable' ? 'opacity-80' : ''} ${
                                                isHovered ? 'transform -translate-y-2' : ''
                                            }`}
                                            onMouseEnter={() => setHoveredCard(plan.rule_id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            {/* Floating animation for active cards */}
                                            {plan.rule_enable === 'enable' && (
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500 group-hover:duration-200 animate-float"></div>
                                            )}

                                            <div
                                                className={`relative rounded-xl ${colors.border} border-2 overflow-hidden transition-all duration-300 ${
                                                    plan.rule_enable === 'disable' ? 'bg-gradient-to-br from-gray-50 to-gray-100' : colors.body
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
                                                                    <span className="bg-white/50 px-2 py-0.5 rounded">ID: {plan.rule_id}</span>
                                                                    <span className="capitalize">{plan.profile_type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadge(plan.plan_payment_type).color} shadow-md`}>
                                                                {getPaymentTypeBadge(plan.plan_payment_type).label}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(plan.rule_enable).color} shadow-md`}>
                                                                {getStatusBadge(plan.rule_enable).label}
                                                            </span>
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
                                                                    {plan.time_limit_type === 'unlimited'
                                                                        ? 'Unlimited'
                                                                        : `${plan.time_limit} hours${plan.time_limit_type === 'monthly' ? '/month' : '/day'}`}
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
                                                                    {plan.data_limit_type === 'disable'
                                                                        ? 'No Limit'
                                                                        : plan.data_limit_type === 'unlimited'
                                                                        ? 'Unlimited'
                                                                        : plan.data_limit || 'Not Set'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price Section */}
                                                    <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 transition-all duration-300 hover:shadow-inner">
                                                        <div className="text-center">
                                                            <div className="text-xs text-gray-500 mb-2 tracking-wider">PRICE</div>
                                                            <div className={`text-2xl font-bold ${plan.plan_price === '0.0' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                                {plan.plan_price === '0.0' ? 'Free' : `${plan.plan_currency_symbol} ${plan.plan_price}`}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                                                                <div className="opacity-75">Type: {plan.plan_price_type.replace('_', ' ')}</div>
                                                                <div className="opacity-75">Ref: {plan.ref_group_id}</div>
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
                                                        <button
                                                            onClick={() => onEditForm(plan)}
                                                            className="p-2.5 btn bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border border-green-300 hover:border-green-400 rounded-lg transition-all duration-300 hover:scale-110"
                                                        >
                                                            <IconPencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePlan(plan.rule_id)}
                                                            className="p-2.5 btn bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-all duration-300 hover:scale-110"
                                                        >
                                                            <IconTrashLines className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    // List View using Table Component
                    <div className="datatables animate-fadeInUp">
                        <Table
                            columns={columns}
                            Title={'Plans List'}
                            toggle={createModel}
                            data={getPaginatedData()}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={filteredPlans.length}
                            totalPages={Math.ceil(filteredPlans.length / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            btnName="Add Plan"
                            loading={false}
                            customButtonClass="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/30"
                        />
                    </div>
                )}
            </div>

            {/* Custom Modal for Add/Edit - Enhanced */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                                    <IconWifi className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedItem ? 'Edit Plan' : 'Add New Plan'}</h2>
                                    <p className="text-sm text-gray-600">{selectedItem ? 'Update your plan details' : 'Create a new bandwidth plan'}</p>
                                </div>
                            </div>
                            <button onClick={closeModel} className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                                <svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">{renderForm()}</div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={closeModel}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onFormSubmit}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                {selectedItem ? 'Update Plan' : 'Create Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

      {/* Custom Modal for Add/Edit - Enhanced */}
      {modal && (
        <ModelViewBox
          modal={modal}
          setModel={setModal} 
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
                <h4 className="text-xl font-bold tracking-tight">
                  {selectedItem ? 'Edit Plan' : 'Add New Plan'}
                </h4>
                <p className="text-sm text-white/80">
                  {selectedItem ? 'Update your plan details' : 'Create a new bandwidth plan'}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {renderForm()}
          </div>
        </ModelViewBox>
      )}

      {/* View Plan Details Modal - Enhanced */}
      <ModelViewBox
        modal={viewModal}
        modelHeader="Plan Details"
        setModel={closeModel}
        modelSize="md"
        showSubmit={false}
        saveBtn={false}
      >
        {selectedItem && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-4">
                <IconWifi className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedItem.rule_name}</h3>
              <div className="flex justify-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentTypeBadge(selectedItem.plan_payment_type).color}`}>
                  {getPaymentTypeBadge(selectedItem.plan_payment_type).label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedItem.rule_enable).color}`}>
                  {getStatusBadge(selectedItem.rule_enable).label}
                </span>
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
                      {selectedItem.time_limit_type === 'unlimited' 
                        ? 'Unlimited' 
                        : `${selectedItem.time_limit} hours${selectedItem.time_limit_type === 'monthly' ? '/month' : '/day'}`
                      }
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
                      {selectedItem.data_limit_type === 'disable' 
                        ? 'No Limit' 
                        : selectedItem.data_limit_type === 'unlimited'
                          ? 'Unlimited'
                          : selectedItem.data_limit || 'Not Set'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">PRICE</div>
                  <div className={`text-3xl font-bold ${selectedItem.plan_price === "0.0" ? 'text-emerald-600' : 'text-gray-800'} mb-3`}>
                    {selectedItem.plan_price === "0.0" ? 'Free' : `${selectedItem.plan_currency_symbol} ${selectedItem.plan_price}`}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div className="text-center">
                      <div className="font-medium">Type</div>
                      <div className="mt-1">{selectedItem.plan_price_type.replace('_', ' ')}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Currency</div>
                      <div className="mt-1">{selectedItem.plan_currency_type.toUpperCase()}</div>
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
                        <span className="text-sm text-gray-600">Rule ID:</span>
                        <span className="font-medium">{selectedItem.rule_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profile Type:</span>
                        <span className="font-medium capitalize">{selectedItem.profile_type}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ref Group:</span>
                        <span className="font-medium">{selectedItem.ref_group_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Download Type:</span>
                        <span className="font-medium">{selectedItem.bw_download_type}</span>
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
          from { opacity: 0; }
          to { opacity: 1; }
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
          0%, 100% {
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
