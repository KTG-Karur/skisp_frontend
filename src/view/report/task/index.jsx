import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconEye from '../../../components/Icon/IconEye';
import IconRefresh from '../../../components/Icon/IconRefresh';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { findArrObj } from '../../../util/AllFunction';
import { getReport, resetReportStatus } from '../../../redux/reportSlice';
import { getCustomers, resetCustomerStatus } from '../../../redux/customerSlice';
import { getPlan, resetPlanStatus } from '../../../redux/planSlice';
import { baseURL } from '../../../api/ApiConfig';
import _ from 'lodash';

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Plan Report') : [];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const staffId = localData?.staffId;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ISP Brand colors
    const brandColorPrimary = '#1a73e8'; // ISP Blue
    const brandColorSecondary = '#00c853'; // ISP Green

    // Get data from Redux store
    const {
        loading,
        getReportSuccess,
        getReportFailed,
        reportData,
        customers = [],
        customerLoading = false,
        plans = [],
        planLoading = false,
    } = useSelector((state) => ({
        getReportSuccess: state.ReportSlice.getReportSuccess,
        getReportFailed: state.ReportSlice.getReportFailed,
        error: state.ReportSlice.error,
        loading: state.ReportSlice.loading,
        reportData: state.ReportSlice.reportData,
        customers: state.CustomerSlice.customers || [],
        customerLoading: state.CustomerSlice.loading || false,
        plans: state.PlanSlice.planData || [],
        planLoading: state.PlanSlice.loading || false,
    }));

    // Account Status Options (active, Expired, all)
    const accountStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
        { value: 'Expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
        { value: 'expiring_soon', label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' },
    ];

    // Transform API data to match display format
    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((item, index) => {
            const userDetails = item.user_details || {};
            const fullData = item.full_data || {};

            // Determine status based on days_remaining
            let displayStatus = item.status || 'active';
            if (item.days_remaining < 0) {
                displayStatus = 'Expired';
            } else if (item.days_remaining <= 30) {
                displayStatus = 'expiring_soon';
            } else {
                displayStatus = 'active';
            }

            // Calculate bandwidth in Mbps
            const bandwidthKbps = parseInt(userDetails.bandwidth) || 0;
            const bandwidthMbps = Math.round(bandwidthKbps / 1000);

            // Parse data quota
            const dataQuota = userDetails.data_quota || 'Unlimited';
            let dataLimit = 'Unlimited';
            if (dataQuota.includes('MB')) {
                const match = dataQuota.match(/(\d+)/);
                if (match) {
                    const mb = parseInt(match[1]);
                    dataLimit = `${Math.round(mb / 1024)} GB`;
                }
            }

            // Get price
            const price = parseFloat(userDetails.price) || 0;

            return {
                id: item.mapping_id || `PLAN-${index + 1000}`,
                subscriptionId: `SUB-${item.user_id?.substring(0, 6) || index + 1000}`,
                customerName: userDetails.first_name ? `${userDetails.first_name} ${userDetails.last_name || ''}`.trim() : 'Unknown Customer',
                customerId: item.user_id,
                contactNumber: userDetails.mobile || 'N/A',
                email: userDetails.email || 'N/A',
                address: userDetails.address || 'Not specified',
                area: item.setting?.location_name || 'General',
                serviceType: 'fibre',
                planName: userDetails.plan_name || 'Unknown Plan',
                planPrice: price,
                speed: `${bandwidthMbps} Mbps`,
                dataLimit: dataLimit,
                maxUsers: 'N/A',
                activationDate: item.created_at ? moment(item.created_at).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
                renewalDate: item.expiry_date || null,
                daysUntilRenewal: item.days_remaining,
                bandwidthUsage: Math.floor(Math.random() * 100), // Mock data
                bandwidthLimit: 100,
                usagePercentage: Math.floor(Math.random() * 100),
                paymentStatus: 'pending',
                connectionStatus: displayStatus,
                lastPaymentDate: null,
                totalPaid: 0,
                salesAgent: 'System',
                remarks: userDetails.account_state || 'No remarks provided',
                installationStatus: 'completed',
                routerMac: 'N/A',
                customerType: 'residential',
                originalData: item,
                userDetails: userDetails,
                fullData: fullData,
                expiryDate: item.expiry_date,
                daysRemaining: item.days_remaining,
                accountState: userDetails.account_state,
                create_ts: item.created_at,
            };
        });
    };

    const [Plans, setPlans] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [insightsData, setInsightsData] = useState(null);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedPlan: null,
        selectedCustomer: null,
        selectedAccountStatus: null,
        daysThreshold: 30,
    });

    const [optionListState, setOptionListState] = useState({
        planList: [],
        accountStatusList: accountStatusOptions,
        customerList: [],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);

    const getStatusColor = (status) => {
        const statusOption = accountStatusOptions.find((opt) => opt.value === status);
        return statusOption?.color || 'bg-gray-100 text-gray-800';
    };

    const getPlanColor = (planPrice) => {
        const price = parseFloat(planPrice) || 0;
        if (price <= 1000) return '#10b981'; // Green for basic
        if (price <= 2000) return '#3b82f6'; // Blue for standard
        if (price <= 3000) return '#8b5cf6'; // Purple for premium
        if (price <= 4000) return '#ff6d00'; // Orange for ultimate
        return '#6200ea'; // Purple for business
    };

    const getUsageColor = (percentage) => {
        if (percentage >= 90) return '#ef4444'; // Red
        if (percentage >= 70) return '#f59e0b'; // Yellow
        if (percentage >= 40) return brandColorSecondary; // Green
        return brandColorPrimary; // Blue
    };

    const planColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            sort: true,
            width: 60,
            Cell: ({ row }) => (
                <div className="text-center font-medium" style={{ color: brandColorPrimary }}>
                    {row.index + 1}
                </div>
            ),
        },
        {
            Header: 'Customer',
            accessor: 'customerName',
            sort: true,
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.original.contactNumber}</div>
                    <div className="text-xs text-gray-500">ID: {row.original.customerId}</div>
                </div>
            ),
        },
        {
            Header: 'Subscription ID',
            accessor: 'subscriptionId',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            Header: 'Plan',
            accessor: 'planName',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <div className="w-2 h-8 rounded-full mr-2" style={{ backgroundColor: getPlanColor(row.original.planPrice) }}></div>
                    <div>
                        <div className="font-medium text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">₹{row.original.planPrice}/month</div>
                        <div className="text-xs text-gray-500">{row.original.speed}</div>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Expiry Date',
            accessor: 'expiryDate',
            sort: true,
            Cell: ({ value, row }) => {
                if (!value) return <div className="text-gray-400">-</div>;

                const expiryDate = moment(value);
                const today = moment();
                const daysDiff = row.original.daysRemaining || expiryDate.diff(today, 'days');

                let className = 'font-medium';
                let additionalInfo = '';

                if (daysDiff < 0) {
                    className = 'text-red-600 font-semibold';
                    additionalInfo = ` (${Math.abs(daysDiff)} days ago)`;
                } else if (daysDiff === 0) {
                    className = 'text-orange-600 font-semibold';
                    additionalInfo = ' - Expires today!';
                } else if (daysDiff <= 7) {
                    className = 'text-yellow-600 font-semibold';
                    additionalInfo = ` (in ${daysDiff} days)`;
                }

                return (
                    <div className={className}>
                        {expiryDate.format('DD/MM/YYYY')}
                        {additionalInfo && <span className="text-xs block mt-0.5">{additionalInfo}</span>}
                    </div>
                );
            },
        },
        {
            Header: 'Days Remaining',
            accessor: 'daysRemaining',
            sort: true,
            Cell: ({ value }) => {
                let className = 'font-medium';
                let displayValue = value;

                if (value < 0) {
                    className = 'text-red-600 font-semibold';
                    displayValue = `Expired ${Math.abs(value)} days ago`;
                } else if (value === 0) {
                    className = 'text-orange-600 font-semibold';
                    displayValue = 'Today';
                } else if (value <= 7) {
                    className = 'text-yellow-600 font-semibold';
                    displayValue = `${value} days`;
                } else {
                    displayValue = `${value} days`;
                }

                return <div className={className}>{displayValue}</div>;
            },
        },
        {
            Header: 'Status',
            accessor: 'connectionStatus',
            sort: true,
            Cell: ({ value }) => {
                let displayLabel = value;
                if (value === 'expiring_soon') displayLabel = 'Expiring Soon';
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{displayLabel}</span>;
            },
        },
        {
            Header: 'Account State',
            accessor: 'accountState',
            sort: true,
            Cell: ({ value }) => {
                const isActive = value === 'Active';
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value || 'Unknown'}</span>;
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 80,
            Cell: ({ row }) => {
                const plan = row.original;
                return (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handleViewDetails(plan)}
                            className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="View Plan Details"
                            style={{ color: brandColorPrimary }}
                        >
                            <IconEye className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

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

    useEffect(() => {
        // Load initial data
        dispatch(getCustomers());
        dispatch(getPlan({ settingId: getSettingId() }));

        const initialFilters = {
            settingId: getSettingId(),
            daysThreshold: 30,
            accountState: '',
            page: 1,
            limit: 50000,
            search: '',
            planName: '',
            userId: '',
        };
        dispatch(getReport(initialFilters));
    }, [dispatch]);

    useEffect(() => {
        // When report data changes, transform it
        if (reportData?.data?.items) {
            const transformedPlans = transformApiData(reportData.data.items);
            setPlans(transformedPlans);
            setFilteredData(transformedPlans);

            // Set summary and insights data
            if (reportData.data.summary) {
                setSummaryData(reportData.data.summary);
            }
            if (reportData.data.insights) {
                setInsightsData(reportData.data.insights);
            }

            // Prepare plan list for dropdown (unique plan names)
            const planNames = [...new Set(transformedPlans.map((plan) => plan.planName))];
            const planOptions = planNames.map((planName) => ({
                value: planName,
                label: planName,
                searchText: planName.toLowerCase(),
            }));

            // Prepare customer list for dropdown (phone numbers)
            const customerOptions = transformedPlans.map((plan) => ({
                value: plan.contactNumber !== 'N/A' ? plan.contactNumber : plan.customerId,
                label: `${plan.customerName} (${plan.contactNumber})`,
                phone: plan.contactNumber,
                searchText: `${plan.customerName} ${plan.contactNumber} ${plan.customerId}`.toLowerCase(),
            }));

            // Remove duplicates
            const uniqueCustomerOptions = Array.from(new Map(customerOptions.map((item) => [item.value, item])).values());

            setOptionListState((prev) => ({
                ...prev,
                customerList: [{ value: '', label: 'All Customers' }, ...uniqueCustomerOptions],
                planList: [{ value: '', label: 'All Plans' }, ...planOptions],
            }));
        } else {
            setPlans([]);
            setFilteredData([]);
            setSummaryData(null);
            setInsightsData(null);
            setOptionListState((prev) => ({
                ...prev,
                customerList: [{ value: '', label: 'All Customers' }],
                planList: [{ value: '', label: 'All Plans' }],
            }));
        }
    }, [reportData]);

    useEffect(() => {
        // Apply filters to data
        let filtered = [...Plans];

        // Search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (plan) =>
                    plan.customerName?.toLowerCase().includes(query) ||
                    plan.customerId?.toLowerCase().includes(query) ||
                    plan.contactNumber?.includes(query) ||
                    plan.email?.toLowerCase().includes(query) ||
                    plan.planName?.toLowerCase().includes(query)
            );
        }

        // Customer filter (by phone number)
        if (filters.selectedCustomer?.value) {
            filtered = filtered.filter((plan) => plan.contactNumber === filters.selectedCustomer.value || plan.customerId === filters.selectedCustomer.value);
        }

        // Plan filter (by plan name)
        if (filters.selectedPlan?.value) {
            filtered = filtered.filter((plan) => plan.planName === filters.selectedPlan.value);
        }

        // Account status filter
        if (filters.selectedAccountStatus?.value) {
            filtered = filtered.filter((plan) => {
                if (filters.selectedAccountStatus.value === 'expiring_soon') {
                    return plan.daysRemaining > 0 && plan.daysRemaining <= filters.daysThreshold;
                }
                return plan.connectionStatus === filters.selectedAccountStatus.value;
            });
        }

        setFilteredData(filtered);
    }, [Plans, filters]);

    const buildBackendFilters = () => {
        const backendFilters = {
            settingId: getSettingId(),
            daysThreshold: filters.daysThreshold,
            page: 1,
            limit: 500,
            exportFormat: 'json',
        };

        if (filters.searchQuery) {
            backendFilters.search = filters.searchQuery;
        }

        // Send plan name (not ID)
        if (filters.selectedPlan?.value) {
            backendFilters.planName = filters.selectedPlan.value;
        }

        // Send user phone number (not ID)
        if (filters.selectedCustomer?.value) {
            backendFilters.userId = filters.selectedCustomer.value;
        }

        // Send account state
        if (filters.selectedAccountStatus?.value) {
            if (filters.selectedAccountStatus.value === 'expiring_soon') {
                backendFilters.accountState = 'Active';
                backendFilters.daysThreshold = 7; // For expiring soon, use 7 days threshold
            } else {
                backendFilters.accountState = filters.selectedAccountStatus.value === 'Expired' ? 'Expired' : filters.selectedAccountStatus.value;
            }
        }

        return backendFilters;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);

        const backendFilters = buildBackendFilters();

        try {
            await dispatch(getReport(backendFilters));
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            searchQuery: '',
            selectedPlan: null,
            selectedCustomer: null,
            selectedAccountStatus: null,
            daysThreshold: 30,
        });
        setAppliedFilters(null);
        setSearchLoading(false);
        setCurrentPage(0);

        // Reset to default filters
        const defaultFilters = {
            settingId: getSettingId(),
            daysThreshold: 30,
            accountState: '',
            page: 1,
            limit: 50000,
            search: '',
            planName: '',
            userId: '',
        };
        dispatch(getReport(defaultFilters));
    };

    const handleViewDetails = (plan) => {
        setSelectedPlan(plan);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPlan(null);
    };

    const filterCustomerOptions = (option, inputValue) => {
        const searchLower = inputValue.toLowerCase();
        const optionData = option.data;

        const matches = optionData.label?.toLowerCase().includes(searchLower) || optionData.phone?.includes(inputValue) || optionData.value?.includes(inputValue);

        return matches;
    };

    const formatCustomerOptionLabel = (option) => {
        if (option.value === '') return option.label;

        return (
            <div className="py-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                {option.phone && option.phone !== 'N/A' && <div className="text-xs text-gray-500">Phone: {option.phone}</div>}
            </div>
        );
    };

    const formatPlanOptionLabel = (option) => {
        if (option.value === '') return option.label;

        return (
            <div className="py-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                {option.price && <div className="text-xs text-gray-500">₹{option.price}/month</div>}
            </div>
        );
    };

    const filterPlanOptions = (option, inputValue) => {
        const searchLower = inputValue.toLowerCase();
        const optionData = option.data;

        const matches = optionData.label?.toLowerCase().includes(searchLower) || optionData.searchText?.includes(searchLower);

        return matches;
    };

    const handleDaysThresholdChange = (value) => {
        setFilters((prev) => ({ ...prev, daysThreshold: parseInt(value) || 30 }));
    };

    const onDownload = () => {
        const yearMonth = 'All Time';
        const additionalDetails = `ISP Plan Expiry Report`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY')}`;

        const data = filteredData.map((plan, index) => ({
            ['S.No']: index + 1,
            ['Customer Name']: plan.customerName,
            ['Customer ID']: plan.customerId,
            ['Contact Number']: plan.contactNumber,
            ['Email']: plan.email,
            ['Address']: plan.address,
            ['Plan Name']: plan.planName,
            ['Plan Price']: `₹${plan.planPrice}/month`,
            ['Speed']: plan.speed,
            ['Data Limit']: plan.dataLimit,
            ['Expiry Date']: plan.expiryDate ? moment(plan.expiryDate).format('DD/MM/YYYY') : '-',
            ['Days Remaining']: plan.daysRemaining,
            ['Status']: plan.connectionStatus === 'expiring_soon' ? 'Expiring Soon' : plan.connectionStatus,
            ['Account State']: plan.accountState || 'Unknown',
            ['Activation Date']: moment(plan.activationDate).format('DD/MM/YYYY'),
            ['Bandwidth Usage']: `${plan.usagePercentage}%`,
            ['Remarks']: plan.remarks,
        }));

        const header = [
            [additionalDetails],
            [reportGeneratedDate],
            [],
            [
                'S.No',
                'Customer Name',
                'Customer ID',
                'Contact Number',
                'Email',
                'Address',
                'Plan Name',
                'Plan Price',
                'Speed',
                'Data Limit',
                'Expiry Date',
                'Days Remaining',
                'Status',
                'Account State',
                'Activation Date',
                'Bandwidth Usage',
                'Remarks',
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        // Add summary section if available
        const summaryRows = [];
        if (summaryData) {
            summaryRows.push(
                [],
                ['REPORT SUMMARY'],
                ['Total Users', summaryData.total_users],
                ['Active Users', summaryData.active_count],
                ['Expiring Soon', summaryData.expiring_soon_count],
                ['Expired Users', summaryData.expired_count],
                ['Expiring Soon %', `${summaryData.percentage_expiring_soon}%`],
                ['Expired %', `${summaryData.percentage_expired}%`]
            );
        }

        // Add insights if available
        if (insightsData) {
            summaryRows.push(
                [],
                ['INSIGHTS'],
                ['Total Potential Revenue', `₹${insightsData.total_potential_revenue}`],
                ['Active Revenue', `₹${insightsData.active_revenue}`],
                ['Revenue at Risk', `₹${insightsData.potential_revenue_at_risk}`],
                ['Lost Revenue', `₹${insightsData.lost_revenue}`],
                ['Average Days to Expiry', `${insightsData.average_days_to_expiry} days`],
                ['Closest Expiry', `${insightsData.closest_expiry} days`],
                ['Urgency Level', insightsData.urgency_level]
            );
        }

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        // Merge header rows
        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 16 } });

        // Merge summary rows
        const summaryStartRow = header.length + rows.length + 1;
        if (summaryRows.length > 0) {
            for (let i = 0; i < summaryRows.length; i++) {
                if (summaryRows[i].length === 1) {
                    worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 16 } });
                } else if (summaryRows[i].length === 2) {
                    worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 1 } });
                }
            }
        }

        // Set column widths
        worksheet['!cols'] = Array(17).fill({ wch: 15 });
        worksheet['!cols'][0] = { wch: 8 }; // S.No
        worksheet['!cols'][1] = { wch: 20 }; // Customer Name
        worksheet['!cols'][2] = { wch: 15 }; // Customer ID
        worksheet['!cols'][5] = { wch: 25 }; // Address
        worksheet['!cols'][6] = { wch: 20 }; // Plan Name
        worksheet['!cols'][16] = { wch: 30 }; // Remarks

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ISP Plan Expiry Report');

        const fileName = `ISP-Plan-Expiry-Report-${moment().format('DD-MM-YYYY')}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/PlanReportpdf', {
            state: {
                filteredData: filteredData,
                filters: filters,
                summaryData: summaryData,
                insightsData: insightsData,
            },
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredData.length;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            minHeight: '42px',
            backgroundColor: 'white',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? brandColorPrimary : state.isFocused ? `${brandColorPrimary}15` : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
                backgroundColor: `${brandColorPrimary}15`,
            },
        }),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-24 h-24 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: brandColorPrimary }}></div>
                <div className="absolute top-40 right-20 w-20 h-20 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: brandColorSecondary }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header with Summary Stats */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plan Expiry Report</h1>
                            <p className="text-gray-600">Track and manage plan expiry dates and renewals</p>
                        </div>
                    </div>
                </div>

                {/* Search Panel */}
                {showSearch && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <IconSearch className="w-5 h-5" style={{ color: brandColorPrimary }} />
                                </div>
                                Search & Filter Plans
                            </h2>
                            <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                ▲ Hide Panel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {/* Plan Filter */}
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                    <Select
                                        options={optionListState.planList}
                                        value={filters.selectedPlan}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedPlan: selectedOption })}
                                        placeholder="Select Plan"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        formatOptionLabel={formatPlanOptionLabel}
                                        filterOption={filterPlanOptions}
                                    />
                                </div>

                                {/* Customer Filter (by phone) */}
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer (Phone)</label>
                                    <Select
                                        options={optionListState.customerList}
                                        value={filters.selectedCustomer}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedCustomer: selectedOption })}
                                        placeholder="Search by phone or name..."
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        filterOption={filterCustomerOptions}
                                        formatOptionLabel={formatCustomerOptionLabel}
                                    />
                                </div>

                                {/* Days Threshold */}
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Threshold (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                            '--tw-ring-color': brandColorPrimary,
                                        }}
                                        value={filters.daysThreshold}
                                        onChange={(e) => handleDaysThresholdChange(e.target.value)}
                                        min="1"
                                        max="365"
                                        placeholder="Days threshold for expiring soon"
                                    />
                                </div>

                                {/* Search Input */}
                                {/* <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm"
                                        style={{
                                            '--tw-ring-color': brandColorPrimary,
                                        }}
                                        placeholder="Search by customer name, phone, email, or plan..."
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                    />
                                </div> */}

                                {/* Account Status Filter - MOVED DOWN HERE */}
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                                    <Select
                                        options={optionListState.accountStatusList}
                                        value={filters.selectedAccountStatus}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedAccountStatus: selectedOption })}
                                        placeholder="Select Status"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Found {filteredData.length} plan subscriptions
                                    {filters.daysThreshold > 0 && ` • Expiry threshold: ${filters.daysThreshold} days`}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium hover:shadow-sm"
                                    >
                                        <IconRefresh className="w-4 h-4" />
                                        <span>Clear All</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center min-w-[140px]"
                                        style={{ backgroundColor: brandColorPrimary }}
                                        disabled={searchLoading}
                                    >
                                        {searchLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                <span>Searching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconSearch className="w-4 h-4 mr-2" />
                                                <span>Search Plans</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {!showSearch && (
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-5 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg flex items-center gap-2 group"
                            style={{ backgroundColor: brandColorPrimary }}
                        >
                            <IconSearch className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span>Show Search Panel</span>
                        </button>
                    </div>
                )}

                {/* Results Section */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Plan Data</h3>
                            <p className="text-gray-500 max-w-md">Fetching plan expiry information from the server...</p>
                        </div>
                    </div>
                ) : searchLoading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Searching Plans</h3>
                            <p className="text-gray-500 max-w-md">Filtering plan subscriptions based on your criteria...</p>
                        </div>
                    </div>
                ) : appliedFilters && filteredData.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Plan Expiry Report Results</h3>
                                    <p className="text-gray-600">Showing {filteredData.length} plan subscriptions</p>
                                </div>
                                {/* Export buttons in table header */}
                                {filteredData.length > 0 && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onDownload}
                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                                        >
                                            <IconPrinter className="w-3 h-3" />
                                            <span>Excel</span>
                                        </button>
                                        <button
                                            onClick={onDownloadPDF}
                                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                                        >
                                            <IconPrinter className="w-3 h-3" />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Summary Cards */}
                        {summaryData && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">Total Users</p>
                                            <p className="text-2xl font-bold text-blue-800">{summaryData.total_users}</p>
                                        </div>
                                        <div className="text-2xl">👥</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">Active</p>
                                            <p className="text-2xl font-bold text-green-800">{summaryData.active_count}</p>
                                            <p className="text-xs text-green-600 mt-1">{((summaryData.active_count / summaryData.total_users) * 100).toFixed(1)}%</p>
                                        </div>
                                        <div className="text-2xl">✅</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-yellow-600 font-medium">Expiring Soon</p>
                                            <p className="text-2xl font-bold text-yellow-800">{summaryData.expiring_soon_count}</p>
                                            <p className="text-xs text-yellow-600 mt-1">{summaryData.percentage_expiring_soon}%</p>
                                        </div>
                                        <div className="text-2xl">⚠️</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-600 font-medium">Expired</p>
                                            <p className="text-2xl font-bold text-red-800">{summaryData.expired_count}</p>
                                            <p className="text-xs text-red-600 mt-1">{summaryData.percentage_expired}%</p>
                                        </div>
                                        <div className="text-2xl">❌</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            <Table
                                columns={planColumns}
                                data={getPaginatedData()}
                                Title=""
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                totalCount={getTotalCount()}
                                totalPages={Math.ceil(getTotalCount() / pageSize)}
                                onPaginationChange={handlePaginationChange}
                                isSortable={true}
                                pagination={true}
                                isSearchable={false}
                                tableClass="min-w-full rounded-lg overflow-hidden"
                                theadClass="bg-gray-50"
                            />
                        </div>
                    </div>
                ) : appliedFilters && filteredData.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorSecondary}15` }}>
                                <IconSearch className="w-14 h-14" style={{ color: brandColorSecondary }} />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Plans Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">No plan subscriptions match your current search criteria. Try adjusting your filters or search terms.</p>
                            <button
                                onClick={handleClear}
                                className="px-7 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                style={{ backgroundColor: brandColorPrimary }}
                            >
                                Clear Filters & Show All
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                <IconSearch className="w-14 h-14" style={{ color: brandColorPrimary }} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">ISP Plan Expiry Report Dashboard</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">
                                {Plans.length > 0
                                    ? `Ready to search through ${Plans.length} plan subscriptions. Use the search filters above to generate detailed expiry reports.`
                                    : 'No plan data available. Loading plan expiry information...'}
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold text-lg shadow-xl"
                                style={{ backgroundColor: brandColorSecondary }}
                            >
                                Start Searching Plans
                            </button>
                        </div>
                    </div>
                )}

                {/* Plan Details Modal */}
                <ModelViewBox
                    modal={showDetailsModal}
                    modelHeader={`Plan Details: ${selectedPlan?.subscriptionId || ''}`}
                    setModel={closeDetailsModal}
                    modelSize="max-w-5xl"
                    submitBtnText="Close"
                    loading={false}
                    hideSubmit={true}
                    saveBtn={false}
                >
                    {selectedPlan && (
                        <div className="p-6">
                            {/* Header with plan info */}
                            <div
                                className="mb-6 p-4 rounded-xl border"
                                style={{
                                    borderColor: getPlanColor(selectedPlan.planPrice),
                                    backgroundColor: `${getPlanColor(selectedPlan.planPrice)}10`,
                                }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{selectedPlan.customerName}</h3>
                                        <p className="text-gray-600">
                                            {selectedPlan.planName} • ₹{selectedPlan.planPrice}/month
                                        </p>
                                        <p className="text-sm text-gray-500">Customer ID: {selectedPlan.customerId}</p>
                                        <p className="text-sm text-gray-500">Phone: {selectedPlan.contactNumber}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPlan.connectionStatus)}`}>
                                            {selectedPlan.connectionStatus === 'expiring_soon' ? 'Expiring Soon' : selectedPlan.connectionStatus}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedPlan.accountState === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {selectedPlan.accountState || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Customer & Plan Details */}
                                <div className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Customer ID:</span>
                                                <p className="text-gray-800">{selectedPlan.customerId}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Contact:</span>
                                                <p className="text-gray-800">{selectedPlan.contactNumber}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Email:</span>
                                                <p className="text-gray-800">{selectedPlan.email}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Area:</span>
                                                <p className="text-gray-800">{selectedPlan.area}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-medium text-gray-600">Address:</span>
                                                <p className="text-gray-800 whitespace-pre-line">{selectedPlan.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Specifications */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Plan Specifications</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.speed}
                                                </div>
                                                <div className="text-sm text-gray-600">Speed</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1 whitespace-nowrap" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.dataLimit}
                                                </div>
                                                <div className="text-sm text-gray-600">Data Limit</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    ₹{selectedPlan.planPrice}
                                                </div>
                                                <div className="text-sm text-gray-600">Monthly Price</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.activationDate ? moment(selectedPlan.activationDate).format('DD/MM/YYYY') : 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-600">Activation Date</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Expiry Details */}
                                <div className="space-y-6">
                                    {/* Expiry Details */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Expiry Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Expiry Date:</span>
                                                <p
                                                    className={`font-medium ${
                                                        selectedPlan.daysRemaining < 0 ? 'text-red-600' : selectedPlan.daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
                                                    }`}
                                                >
                                                    {selectedPlan.expiryDate ? moment(selectedPlan.expiryDate).format('DD/MM/YYYY') : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Days Remaining:</span>
                                                <p className={`font-bold ${selectedPlan.daysRemaining < 0 ? 'text-red-600' : selectedPlan.daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {selectedPlan.daysRemaining !== null ? `${selectedPlan.daysRemaining} days` : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Status:</span>
                                                <p
                                                    className={`font-medium ${
                                                        selectedPlan.connectionStatus === 'Expired'
                                                            ? 'text-red-600'
                                                            : selectedPlan.connectionStatus === 'expiring_soon'
                                                            ? 'text-yellow-600'
                                                            : 'text-green-600'
                                                    }`}
                                                >
                                                    {selectedPlan.connectionStatus === 'expiring_soon' ? 'Expiring Soon' : selectedPlan.connectionStatus}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Account State:</span>
                                                <p className={`font-medium ${selectedPlan.accountState === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{selectedPlan.accountState || 'Unknown'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-gray-600">Bandwidth Usage:</span>
                                                    <span className="font-medium" style={{ color: getUsageColor(selectedPlan.usagePercentage) }}>
                                                        {selectedPlan.usagePercentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${selectedPlan.usagePercentage}%`,
                                                            backgroundColor: getUsageColor(selectedPlan.usagePercentage),
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {selectedPlan.bandwidthUsage} GB used of {selectedPlan.bandwidthLimit} GB limit
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Original Data (if available) */}
                                    {selectedPlan.userDetails && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Data Quota:</span>
                                                    <span className="font-medium">{selectedPlan.userDetails.data_quota || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bandwidth:</span>
                                                    <span className="font-medium">{selectedPlan.userDetails.bandwidth || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Currency:</span>
                                                    <span className="font-medium">{selectedPlan.userDetails.currency || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Site UID:</span>
                                                    <span className="font-medium">{selectedPlan.userDetails.site_uid || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Remarks Section */}
                            {selectedPlan.remarks && selectedPlan.remarks !== 'No remarks provided' && (
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedPlan.remarks}</p>
                                </div>
                            )}
                        </div>
                    )}
                </ModelViewBox>
            </div>
        </div>
    );
};

export default Index;
