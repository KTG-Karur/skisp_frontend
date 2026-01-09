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
import { getEmployee, resetEmployeeStatus } from '../../../redux/employeeSlice';
import { getProvider, resetProviderStatus } from '../../../redux/providerSlice';
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

    // Color scheme based on #FFF4E2 (warm creamy off-white)
    const baseColor = '#FFF4E2';
    const primaryColor = '#D4A76A'; // Warm gold/brown - main accent
    const secondaryColor = '#7C6F5A'; // Warm taupe - secondary text
    const accentColor = '#FF9A3D'; // Warm orange - for highlights
    const successColor = '#28A745'; // Green - for success states
    const warningColor = '#FFC107'; // Amber - for warnings
    const dangerColor = '#DC3545'; // Red - for errors/danger
    const infoColor = '#6C757D'; // Gray - for info
    const darkColor = '#495057'; // Dark gray for text
    
    // Complementary colors derived from base
    const lightBg = '#FFF9F0'; // Lighter warm white
    const cardBg = '#FFFDF8'; // Slightly off-white for cards
    const borderColor = '#E8DFD0'; // Warm light border
    const hoverBg = '#F5F0E6'; // Warm hover background

    const { getEmployeeSuccess, getEmployeeFailed, employeeData, providerData, getProviderSuccess, getProviderFailed, error, loading, getReportSuccess, getReportFailed, reportData } = useSelector(
        (state) => ({
            getReportSuccess: state.ReportSlice.getReportSuccess,
            getReportFailed: state.ReportSlice.getReportFailed,
            error: state.ReportSlice.error,
            loading: state.ReportSlice.loading,
            reportData: state.ReportSlice.reportData,
            getEmployeeSuccess: state.EmployeeSlice.getEmployeeSuccess,
            getEmployeeFailed: state.EmployeeSlice.getEmployeeFailed,
            employeeData: state.EmployeeSlice.employeeData,
            providerData: state.ProviderSlice.providerData,
            getProviderSuccess: state.ProviderSlice.getProviderSuccess,
            getProviderFailed: state.ProviderSlice.getProviderFailed,
        })
    );

    // ISP Plan Data Structure
    const ispPlans = [
        { value: '599', label: 'Basic 599 (50 Mbps)', price: 599, speed: '50 Mbps', data: 'Unlimited', users: 'Up to 3' },
        { value: '799', label: 'Standard 799 (100 Mbps)', price: 799, speed: '100 Mbps', data: 'Unlimited', users: 'Up to 5' },
        { value: '1199', label: 'Premium 1199 (200 Mbps)', price: 1199, speed: '200 Mbps', data: 'Unlimited', users: 'Up to 8' },
        { value: '2999', label: 'Ultimate 2999 (500 Mbps)', price: 2999, speed: '500 Mbps', data: 'Unlimited', users: 'Up to 12' },
        { value: '4999', label: 'Business 4999 (1 Gbps)', price: 4999, speed: '1 Gbps', data: 'Unlimited', users: 'Unlimited' },
    ];

    // Payment Status Options (only paid and pending)
    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    ];

    // Transform API data to match ISP Plan format
    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((plan, index) => {
            // Find plan details from ispPlans array
            const planDetails = ispPlans.find(p => p.value === plan.planAmount?.toString()) || ispPlans[0];

            // Calculate renewal date
            let renewalDate = null;
            if (plan.activationDate) {
                renewalDate = moment(plan.activationDate).add(30, 'days').format('YYYY-MM-DD');
            }

            // Calculate days until renewal
            let daysUntilRenewal = null;
            if (renewalDate) {
                const today = moment();
                const renewalMoment = moment(renewalDate);
                daysUntilRenewal = renewalMoment.diff(today, 'days');
            }

            // Calculate bandwidth usage percentage
            const bandwidthUsage = plan.bandwidthUsage || 0;
            const bandwidthLimit = plan.bandwidthLimit || 100;
            const usagePercentage = Math.round((bandwidthUsage / bandwidthLimit) * 100);

            return {
                id: plan.subscriptionId || `SUB-${index + 1000}`,
                subscriptionId: plan.subscriptionId?.substring(0, 10) || `SUB-${index + 1000}`,
                customerName: plan.customerName || 'Unknown Customer',
                customerId: plan.customerId || `CUST-${index + 500}`,
                contactNumber: plan.contactNumber || 'N/A',
                email: plan.email || 'N/A',
                address: plan.address || 'Not specified',
                area: plan.area || 'General',
                serviceType: plan.serviceType || 'fibre',
                planName: planDetails.label,
                planPrice: planDetails.price,
                speed: planDetails.speed,
                dataLimit: planDetails.data,
                maxUsers: planDetails.users,
                activationDate: plan.activationDate ? moment(plan.activationDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
                renewalDate: renewalDate,
                daysUntilRenewal: daysUntilRenewal,
                bandwidthUsage: bandwidthUsage,
                bandwidthLimit: bandwidthLimit,
                usagePercentage: usagePercentage,
                paymentStatus: plan.paymentStatus || 'pending',
                connectionStatus: plan.connectionStatus || 'active',
                lastPaymentDate: plan.lastPaymentDate ? moment(plan.lastPaymentDate).format('YYYY-MM-DD') : null,
                totalPaid: plan.totalPaid || 0,
                salesAgent: plan.salesAgent || 'System',
                remarks: plan.remarks || 'No remarks provided',
                installationStatus: plan.installationStatus || 'completed',
                routerMac: plan.routerMac || 'N/A',
                customerType: plan.customerType || 'residential',
                originalData: plan,
            };
        });
    };

    const [plans, setPlans] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedPlan: null,
        selectedPaymentStatus: null,
        selectedCustomer: null,
        startDate: '',
        toDate: '',
    });

    const [optionListState, setOptionListState] = useState({
        planList: ispPlans,
        paymentStatusList: paymentStatusOptions,
        customerList: [],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [showDateFilter, setShowDateFilter] = useState(false);

    const getStatusColor = (status) => {
        const statusOption = paymentStatusOptions.find(opt => opt.value === status);
        return statusOption?.color || 'bg-gray-100 text-gray-800';
    };

    const getPlanColor = (planPrice) => {
        switch (planPrice) {
            case 599:
                return successColor; // Green for basic
            case 799:
                return primaryColor; // Primary for standard
            case 1199:
                return accentColor; // Accent for premium
            case 2999:
                return warningColor; // Warning for ultimate
            case 4999:
                return darkColor; // Dark for business
            default:
                return primaryColor;
        }
    };

    const getUsageColor = (percentage) => {
        if (percentage >= 90) return dangerColor; // Red
        if (percentage >= 70) return warningColor; // Yellow
        if (percentage >= 40) return successColor; // Green
        return primaryColor; // Primary
    };

    const planColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            sort: true,
            width: 60,
            Cell: ({ row }) => (
                <div className="text-center font-medium" style={{ color: primaryColor }}>
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
                    <div className="font-medium" style={{ color: darkColor }}>{value}</div>
                    <div className="text-xs" style={{ color: secondaryColor }}>{row.original.contactNumber}</div>
                </div>
            ),
        },
        {
            Header: 'Subscription ID',
            accessor: 'subscriptionId',
            sort: true,
            Cell: ({ value }) => <div className="font-medium" style={{ color: darkColor }}>{value}</div>,
        },
        {
            Header: 'Plan',
            accessor: 'planName',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <div className="w-2 h-8 rounded-full mr-2" style={{ backgroundColor: getPlanColor(row.original.planPrice) }}></div>
                    <div>
                        <div className="font-medium" style={{ color: darkColor }}>{value}</div>
                        <div className="text-xs" style={{ color: secondaryColor }}>₹{row.original.planPrice}/month</div>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Speed',
            accessor: 'speed',
            sort: true,
            Cell: ({ value }) => (
                <div>
                    <div className="font-medium" style={{ color: darkColor }}>{value}</div>
                </div>
            ),
        },
        {
            Header: 'Activation Date',
            accessor: 'activationDate',
            sort: true,
            Cell: ({ value }) => <div className="font-medium" style={{ color: darkColor }}>{moment(value).format('DD/MM/YYYY')}</div>,
        },
        {
            Header: 'Renewal Date',
            accessor: 'renewalDate',
            sort: true,
            Cell: ({ value, row }) => {
                if (!value) return <div style={{ color: secondaryColor }}>-</div>;

                const renewalDate = moment(value);
                const today = moment();
                const daysDiff = renewalDate.diff(today, 'days');
                let className = 'font-medium';
                let additionalInfo = '';

                if (daysDiff < 0) {
                    className = 'text-red-600 font-semibold';
                    additionalInfo = ` (${Math.abs(daysDiff)} days overdue)`;
                } else if (daysDiff === 0) {
                    className = 'text-orange-600 font-semibold';
                    additionalInfo = ' - Due today!';
                } else if (daysDiff <= 7) {
                    className = 'text-yellow-600 font-semibold';
                    additionalInfo = ` (in ${daysDiff} days)`;
                }

                return (
                    <div className={className}>
                        {renewalDate.format('DD/MM/YYYY')}
                        {additionalInfo && <span className="text-xs block mt-0.5">{additionalInfo}</span>}
                    </div>
                );
            },
        },
        {
            Header: 'Payment Status',
            accessor: 'paymentStatus',
            sort: true,
            Cell: ({ value }) => {
                const statusOption = paymentStatusOptions.find(opt => opt.value === value);
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                        {statusOption?.label || value}
                    </span>
                );
            },
        },
        {
            Header: 'Usage',
            accessor: 'usagePercentage',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${value}%`,
                                backgroundColor: getUsageColor(value),
                            }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: darkColor }}>{value}%</span>
                </div>
            ),
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
                            className="flex items-center justify-center w-8 h-8 transition-colors p-1 rounded hover:opacity-20"
                            title="View Plan Details"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                            <IconEye className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        // Initialize data when reportData changes
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            const transformedPlans = transformApiData(reportData.data);
            setPlans(transformedPlans);
            setFilteredData(transformedPlans);
            
            // Extract unique customers for filter dropdown - search only by name and phone
            const uniqueCustomers = Array.from(
                new Map(transformedPlans.map(plan => [plan.customerId, plan])).values()
            ).map(plan => ({
                value: plan.customerId,
                label: plan.customerName,
                phone: plan.contactNumber,
                searchText: `${plan.customerName} ${plan.contactNumber}`.toLowerCase() // Only name and phone
            }));
            
            setOptionListState(prev => ({
                ...prev,
                customerList: [{ value: '', label: 'All Customers' }, ...uniqueCustomers]
            }));
        } else {
            setPlans([]);
            setFilteredData([]);
            setOptionListState(prev => ({
                ...prev,
                customerList: [{ value: '', label: 'All Customers' }]
            }));
        }

        // You can load additional data here if needed
        dispatch(getEmployee());
        dispatch(getProvider());
    }, [reportData]);

    useEffect(() => {
        // Load initial data with default filters
        const initialFilters = {
            isActive: 1,
        };
        dispatch(getReport(initialFilters));
    }, []);

    const buildBackendFilters = () => {
        const backendFilters = {
            isActive: 1,
            reportType: 'plan',
        };

        if (filters.searchQuery) {
            backendFilters.search = filters.searchQuery;
        }

        if (showDateFilter && filters.startDate) {
            backendFilters.fromDate = filters.startDate;
        }

        if (showDateFilter && filters.toDate) {
            backendFilters.toDate = filters.toDate;
        }

        if (filters.selectedPlan) {
            backendFilters.planAmount = filters.selectedPlan.value;
        }

        if (filters.selectedPaymentStatus) {
            backendFilters.paymentStatus = filters.selectedPaymentStatus.value;
        }

        // For customer filter, we'll handle it provider-side
        return backendFilters;
    };

    // Filter data based on selected customer - only by name and phone
    const filterByCustomer = (data, customerId, customerSearchText) => {
        if (!customerId) return data;
        
        return data.filter(plan => {
            // First check if customerId matches exactly
            if (plan.customerId === customerId) return true;
            
            // If we have search text, check only name and phone
            if (customerSearchText) {
                const searchLower = customerSearchText.toLowerCase();
                return (
                    plan.customerName?.toLowerCase().includes(searchLower) ||
                    plan.contactNumber?.includes(customerSearchText)
                );
            }
            
            return false;
        });
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
            console.error('Error fetching filtered plans:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            searchQuery: '',
            selectedPlan: null,
            selectedPaymentStatus: null,
            selectedCustomer: null,
            startDate: '',
            toDate: '',
        });
        setAppliedFilters(null);
        setShowDateFilter(false);
        setSearchLoading(false);
        setCurrentPage(0);

        // Fetch all active plans when clearing filters
        dispatch(getReport({ isActive: 1, reportType: 'plan' }));
    };

    const toggleDateFilter = () => {
        setShowDateFilter(!showDateFilter);
        if (!showDateFilter) {
            setFilters((prev) => ({
                ...prev,
                startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
                toDate: moment().format('YYYY-MM-DD'),
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                startDate: '',
                toDate: '',
            }));
        }
    };

    const handleViewDetails = (plan) => {
        setSelectedPlan(plan);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPlan(null);
    };

    // Custom filter function for customer dropdown - search only by name and phone
    const filterCustomerOptions = (option, inputValue) => {
        const searchLower = inputValue.toLowerCase();
        const optionData = option.data;
        
        // Search ONLY by name and phone
        const matches = 
            optionData.label?.toLowerCase().includes(searchLower) ||
            optionData.phone?.includes(inputValue);
        
        return matches;
    };

    // Format option label to show name and phone only
    const formatCustomerOptionLabel = (option) => {
        if (option.value === '') return option.label;
        
        return (
            <div className="py-1">
                <div className="font-medium" style={{ color: darkColor }}>{option.label}</div>
                {option.phone && option.phone !== 'N/A' && (
                    <div className="text-xs" style={{ color: secondaryColor }}>
                        Phone: {option.phone}
                    </div>
                )}
            </div>
        );
    };

    const onDownload = () => {
        const yearMonth = showDateFilter && filters.startDate && filters.toDate
            ? `${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
            : 'All Time';

        const additionalDetails = `ISP Plan Report for ${yearMonth}`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY')}`;

        const data = filteredData.map((plan, index) => ({
            ['S.No']: index + 1,
            ['Subscription ID']: plan.subscriptionId,
            ['Customer Name']: plan.customerName,
            ['Customer ID']: plan.customerId,
            ['Contact Number']: plan.contactNumber,
            ['Email']: plan.email,
            ['Address']: plan.address,
            ['Area']: plan.area,
            ['Service Type']: plan.serviceType,
            ['Plan Name']: plan.planName,
            ['Plan Price']: `₹${plan.planPrice}/month`,
            ['Speed']: plan.speed,
            ['Data Limit']: plan.dataLimit,
            ['Max Users']: plan.maxUsers,
            ['Activation Date']: moment(plan.activationDate).format('DD/MM/YYYY'),
            ['Renewal Date']: plan.renewalDate ? moment(plan.renewalDate).format('DD/MM/YYYY') : '-',
            ['Payment Status']: paymentStatusOptions.find(p => p.value === plan.paymentStatus)?.label || plan.paymentStatus,
            ['Connection Status']: plan.connectionStatus,
            ['Bandwidth Usage']: `${plan.usagePercentage}% (${plan.bandwidthUsage}/${plan.bandwidthLimit} GB)`,
            ['Total Paid']: `₹${plan.totalPaid}`,
            ['Sales Agent']: plan.salesAgent,
            ['Remarks']: plan.remarks,
        }));

        const header = [
            [additionalDetails],
            [reportGeneratedDate],
            [],
            [
                'S.No', 'Subscription ID', 'Customer Name', 'Customer ID', 'Contact Number', 'Email', 'Address', 'Area',
                'Service Type', 'Plan Name', 'Plan Price', 'Speed', 'Data Limit', 'Max Users', 'Activation Date',
                'Renewal Date', 'Payment Status', 'Connection Status', 'Bandwidth Usage', 'Total Paid', 'Sales Agent', 'Remarks'
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        // Calculate summary statistics
        const totalRevenue = filteredData.reduce((sum, plan) => sum + plan.planPrice, 0);
        const activeConnections = filteredData.filter(p => p.connectionStatus === 'active').length;
        const paidSubscriptions = filteredData.filter(p => p.paymentStatus === 'paid').length;

        const summaryRows = [
            [],
            ['ISP PLAN REPORT SUMMARY'],
            ['Total Subscriptions', filteredData.length],
            ['Active Connections', activeConnections],
            ['Paid Subscriptions', paidSubscriptions],
            ['Total Monthly Revenue', `₹${totalRevenue}`],
            ['Average Bandwidth Usage', `${Math.round(filteredData.reduce((sum, p) => sum + p.usagePercentage, 0) / filteredData.length)}%`],
        ];

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        // Merge header rows
        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 21 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 21 } });

        // Merge summary rows
        const summaryStartRow = header.length + rows.length + 1;
        for (let i = 0; i < 6; i++) {
            worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 1 } });
        }

        // Set column widths
        worksheet['!cols'] = Array(22).fill({ wch: 15 });
        worksheet['!cols'][5] = { wch: 20 }; // Email column
        worksheet['!cols'][6] = { wch: 25 }; // Address column
        worksheet['!cols'][21] = { wch: 30 }; // Remarks column

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ISP Plan Report');

        const fileName =
            showDateFilter && filters.startDate && filters.toDate
                ? `ISP-Plan-Report-${moment(filters.startDate).format('DD-MM-YYYY')}-to-${moment(filters.toDate).format('DD-MM-YYYY')}.xlsx`
                : `ISP-Plan-Report-All-Time.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/PlanReportpdf', {
            state: {
                filteredData: filteredData,
                filters: filters,
                showDateFilter: showDateFilter,
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
            border: `1px solid ${borderColor}`,
            borderRadius: '0.5rem',
            minHeight: '42px',
            backgroundColor: cardBg,
            '&:hover': {
                borderColor: primaryColor,
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? primaryColor : state.isFocused ? `${primaryColor}15` : cardBg,
            color: state.isSelected ? 'white' : darkColor,
            '&:hover': {
                backgroundColor: `${primaryColor}15`,
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }),
    };

    return (
        <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: baseColor }}>
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-24 h-24 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                <div className="absolute top-40 right-20 w-20 h-20 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: accentColor }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2" style={{ color: darkColor }}>
                                Plan Management Report
                            </h1>
                            <p style={{ color: secondaryColor }}>Track and analyze internet plan subscriptions and payments</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                Total Plans: {filteredData.length}
                            </div>
                            <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${successColor}15`, color: successColor }}>
                                Paid: {filteredData.filter(p => p.paymentStatus === 'paid').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Panel */}
                {showSearch && (
                    <div className="p-6 mb-6 border rounded-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: darkColor }}>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <IconSearch className="w-5 h-5" style={{ color: primaryColor }} />
                                </div>
                                Search & Filter Plans
                            </h2>
                            <button
                                onClick={() => setShowSearch(false)}
                                className="transition-colors p-2 hover:opacity-20 rounded-lg"
                                style={{ color: secondaryColor, backgroundColor: `${primaryColor}15` }}
                            >
                                ▲ Hide Panel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {/* Plan Filter */}
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>
                                        Internet Plan
                                    </label>
                                    <Select
                                        options={[{ value: '', label: 'All Plans' }, ...optionListState.planList]}
                                        value={filters.selectedPlan}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedPlan: selectedOption })}
                                        placeholder="Select Plan (599, 799, 1199, 2999)"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Payment Status Filter */}
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>Payment Status</label>
                                    <Select
                                        options={optionListState.paymentStatusList}
                                        value={filters.selectedPaymentStatus}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedPaymentStatus: selectedOption })}
                                        placeholder="Select Payment Status"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                {/* Customer Filter - Search only by name and phone */}
                                <div className="p-3 rounded-lg border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>Customer</label>
                                    <Select
                                        options={optionListState.customerList}
                                        value={filters.selectedCustomer}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedCustomer: selectedOption })}
                                        placeholder="Search by name or phone..."
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        filterOption={filterCustomerOptions}
                                        formatOptionLabel={formatCustomerOptionLabel}
                                    />
                                </div>

                                {/* Date Filter Toggle */}
                                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={toggleDateFilter}
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 font-medium ${showDateFilter ? 'text-white shadow-lg transform scale-105' : 'hover:opacity-90'
                                            }`}
                                        style={{
                                            backgroundColor: showDateFilter ? primaryColor : cardBg,
                                            borderColor: showDateFilter ? primaryColor : borderColor,
                                            color: showDateFilter ? 'white' : darkColor,
                                        }}
                                    >
                                        <IconCalendar className="w-4 h-4" />
                                        <span>{showDateFilter ? 'Hide Date Filter' : 'Add Date Filter'}</span>
                                    </button>

                                    {/* Search Input */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>Search</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg px-4 py-2.5 focus:outline-none transition-colors"
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                backgroundColor: 'white',
                                                '--tw-ring-color': primaryColor,
                                            }}
                                            placeholder="Search by customer name, ID, contact, or address..."
                                            value={filters.searchQuery}
                                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Date Range Filters (when toggled) */}
                                {showDateFilter && (
                                    <>
                                        <div className="p-3 rounded-lg border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                            <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>From Date</label>
                                            <input
                                                type="date"
                                                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                                                style={{
                                                    border: `1px solid ${borderColor}`,
                                                    backgroundColor: 'white',
                                                    '--tw-ring-color': primaryColor,
                                                }}
                                                value={filters.startDate}
                                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                            <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>To Date</label>
                                            <input
                                                type="date"
                                                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                                                style={{
                                                    border: `1px solid ${borderColor}`,
                                                    backgroundColor: 'white',
                                                    '--tw-ring-color': primaryColor,
                                                }}
                                                value={filters.toDate}
                                                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6" style={{ borderTop: `1px solid ${borderColor}` }}>
                                <div className="text-sm" style={{ color: secondaryColor }}>
                                    Found {filteredData.length} plan subscriptions
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 font-medium hover:opacity-90"
                                        style={{ 
                                            backgroundColor: cardBg,
                                            color: darkColor,
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <IconRefresh className="w-4 h-4" />
                                        <span>Clear All</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center min-w-[140px]"
                                        style={{ backgroundColor: primaryColor }}
                                        disabled={searchLoading || (showDateFilter && (!filters.startDate || !filters.toDate))}
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
                            style={{ backgroundColor: primaryColor }}
                        >
                            <IconSearch className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span>Show Search Panel</span>
                        </button>
                    </div>
                )}

                {/* Results Section */}
                {loading ? (
                    <div className="p-12 text-center border rounded-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: primaryColor }}></div>
                            <h3 className="text-2xl font-semibold mb-3" style={{ color: darkColor }}>Loading Plan Data</h3>
                            <p style={{ color: secondaryColor }}>Fetching ISP plan subscription information from the server...</p>
                        </div>
                    </div>
                ) : searchLoading ? (
                    <div className="p-12 text-center border rounded-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: primaryColor }}></div>
                            <h3 className="text-2xl font-semibold mb-3" style={{ color: darkColor }}>Searching Plans</h3>
                            <p style={{ color: secondaryColor }}>Filtering plan subscriptions based on your criteria...</p>
                        </div>
                    </div>
                ) : appliedFilters && filteredData.length > 0 ? (
                    <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="p-6 border-b" style={{ borderColor: borderColor, background: `linear-gradient(135deg, ${lightBg} 0%, ${cardBg} 100%)` }}>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1" style={{ color: darkColor }}>Plan Report Results</h3>
                                    <p style={{ color: secondaryColor }}>
                                        Showing {filteredData.length} plan subscriptions
                                        {showDateFilter && filters.startDate && filters.toDate
                                            ? ` from ${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
                                            : ' (All Time)'}
                                    </p>
                                </div>
                                {/* Export buttons in table header */}
                                {filteredData.length > 0 && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onDownload}
                                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                                            style={{ backgroundColor: successColor }}
                                        >
                                            <IconPrinter className="w-3 h-3" />
                                            <span>Excel</span>
                                        </button>
                                        <button
                                            onClick={onDownloadPDF}
                                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                                            style={{ backgroundColor: dangerColor }}
                                        >
                                            <IconPrinter className="w-3 h-3" />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

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
                    <div className="p-12 text-center border rounded-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${successColor}15` }}>
                                <IconSearch className="w-14 h-14" style={{ color: successColor }} />
                            </div>
                            <h3 className="text-2xl font-semibold mb-3" style={{ color: darkColor }}>No Plans Found</h3>
                            <p className="text-lg max-w-md mb-6" style={{ color: secondaryColor }}>No plan subscriptions match your current search criteria. Try adjusting your filters or search terms.</p>
                            <button
                                onClick={handleClear}
                                className="px-7 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Clear Filters & Show All
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center border rounded-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15` }}>
                                <IconSearch className="w-14 h-14" style={{ color: primaryColor }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: darkColor }}>Plan Report</h3>
                            <p className="text-lg max-w-md mb-6" style={{ color: secondaryColor }}>
                                {plans.length > 0
                                    ? `Ready to search through ${plans.length} plan subscriptions. Use the search filters above to generate detailed reports.`
                                    : 'No plan data available. Start by adding some plan subscriptions.'}
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold text-lg shadow-xl"
                                style={{ backgroundColor: successColor }}
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
                            <div className="mb-6 p-4 rounded-xl border" style={{
                                borderColor: getPlanColor(selectedPlan.planPrice),
                                backgroundColor: `${getPlanColor(selectedPlan.planPrice)}10`
                            }}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold" style={{ color: darkColor }}>{selectedPlan.customerName}</h3>
                                        <p style={{ color: secondaryColor }}>{selectedPlan.planName} • ₹{selectedPlan.planPrice}/month</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPlan.paymentStatus)}`}>
                                            {paymentStatusOptions.find(p => p.value === selectedPlan.paymentStatus)?.label || selectedPlan.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Customer & Plan Details */}
                                <div className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="p-4 rounded-lg border" style={{ backgroundColor: hoverBg, borderColor: borderColor }}>
                                        <h4 className="font-semibold mb-3" style={{ color: darkColor }}>Customer Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Customer ID:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.customerId}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Contact:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.contactNumber}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Email:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.email}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Area:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.area}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-medium" style={{ color: secondaryColor }}>Address:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Specifications */}
                                    <div className="p-4 rounded-lg border" style={{ backgroundColor: hoverBg, borderColor: borderColor }}>
                                        <h4 className="font-semibold mb-3" style={{ color: darkColor }}>Plan Specifications</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.speed}
                                                </div>
                                                <div className="text-sm" style={{ color: secondaryColor }}>Speed</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                                                <div className="text-2xl font-bold mb-1 whitespace-nowrap" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.dataLimit}
                                                </div>
                                                <div className="text-sm" style={{ color: secondaryColor }}>Data Limit</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    {selectedPlan.maxUsers}
                                                </div>
                                                <div className="text-sm" style={{ color: secondaryColor }}>Max Users</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                                                <div className="text-2xl font-bold mb-1" style={{ color: getPlanColor(selectedPlan.planPrice) }}>
                                                    ₹{selectedPlan.planPrice}
                                                </div>
                                                <div className="text-sm" style={{ color: secondaryColor }}>Monthly</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Payment Details */}
                                <div className="space-y-6">
                                    {/* Payment Details */}
                                    <div className="p-4 rounded-lg border" style={{ backgroundColor: hoverBg, borderColor: borderColor }}>
                                        <h4 className="font-semibold mb-3" style={{ color: darkColor }}>Payment Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Total Paid:</span>
                                                <p className="font-medium" style={{ color: successColor }}>₹{selectedPlan.totalPaid}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Last Payment:</span>
                                                <p style={{ color: darkColor }}>
                                                    {selectedPlan.lastPaymentDate
                                                        ? moment(selectedPlan.lastPaymentDate).format('DD/MM/YYYY')
                                                        : 'No payments yet'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium" style={{ color: secondaryColor }}>Sales Agent:</span>
                                                <p style={{ color: darkColor }}>{selectedPlan.salesAgent}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium" style={{ color: secondaryColor }}>Bandwidth Usage:</span>
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
                                                <div className="text-xs mt-1" style={{ color: secondaryColor }}>
                                                    {selectedPlan.bandwidthUsage} GB used of {selectedPlan.bandwidthLimit} GB limit
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks Section */}
                            {selectedPlan.remarks && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2" style={{ color: darkColor }}>Remarks</h4>
                                    <p className="p-3 rounded-lg border" style={{ backgroundColor: hoverBg, borderColor: borderColor, color: secondaryColor }}>
                                        {selectedPlan.remarks}
                                    </p>
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