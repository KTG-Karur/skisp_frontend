import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconEye from '../../../components/Icon/IconEye';
import IconRefresh from '../../../components/Icon/IconRefresh';
import IconMenu from '../../../components/Icon/IconMenu';
import IconX from '../../../components/Icon/IconX';
import IconDownload from '../../../components/Icon/IconDownload';
import IconFilter from '../../../components/Icon/IconFilter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconWifi from '../../../components/Icon/IconWifi';
import IconDollar from '../../../components/Icon/IconDollarSign';
import IconClock from '../../../components/Icon/IconClock';
import IconCheck from '../../../components/Icon/IconCheck';
import IconAlertCircle from '../../../components/Icon/IconAlertCircle';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { findArrObj } from '../../../util/AllFunction';
import { getPaymentReport, resetPaymentReportStatus } from '../../../redux/paymentReportSlice.js';
import _ from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentReport = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Payment Report') : [];
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

    const { error, loading, getPaymentReportSuccess, getPaymentReportFailed, paymentReportData } = useSelector(
        (state) => ({
            getPaymentReportSuccess: state.PaymentReportSlice.getPaymentReportSuccess,
            getPaymentReportFailed: state.PaymentReportSlice.getPaymentReportFailed,
            error: state.PaymentReportSlice.error,
            loading: state.PaymentReportSlice.loading,
            paymentReportData: state.PaymentReportSlice.paymentReportData,
        })
    );

    // Sample data for internet provider
    const sampleInternetPayments = [
        {
            paymentId: 'PAY-ISP-001',
            invoiceNumber: 'INV-ISP-2024-001',
            clientName: 'Tech Solutions Inc.',
            clientId: 'CL-001',
            clientEmail: 'tech@example.com',
            clientPhone: '+91 9876543210',
            planName: 'Basic 599',
            planPrice: 599,
            amount: 599,
            paidAmount: 599,
            pendingAmount: 0,
            paymentDate: '2024-01-15',
            dueDate: '2024-01-10',
            status: 'paid',
            paymentMethod: 'Online Payment',
            transactionId: 'TXN00123456',
            description: 'Monthly subscription - Basic Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-001',
            billingCycle: 'Monthly'
        },
        {
            paymentId: 'PAY-ISP-002',
            invoiceNumber: 'INV-ISP-2024-002',
            clientName: 'John Smith',
            clientId: 'CL-002',
            clientEmail: 'john@example.com',
            clientPhone: '+91 9876543211',
            planName: 'Standard 799',
            planPrice: 799,
            amount: 799,
            paidAmount: 0,
            pendingAmount: 799,
            paymentDate: null,
            dueDate: '2024-01-20',
            status: 'pending',
            paymentMethod: 'Bank Transfer',
            transactionId: 'N/A',
            description: 'Monthly subscription - Standard Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-002',
            billingCycle: 'Monthly'
        },
        {
            paymentId: 'PAY-ISP-003',
            invoiceNumber: 'INV-ISP-2024-003',
            clientName: 'Sarah Johnson',
            clientId: 'CL-003',
            clientEmail: 'sarah@example.com',
            clientPhone: '+91 9876543212',
            planName: 'Premium 1199',
            planPrice: 1199,
            amount: 1199,
            paidAmount: 1199,
            pendingAmount: 0,
            paymentDate: '2024-01-18',
            dueDate: '2024-01-15',
            status: 'paid',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN00123457',
            description: 'Monthly subscription - Premium Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-003',
            billingCycle: 'Monthly'
        },
        {
            paymentId: 'PAY-ISP-004',
            invoiceNumber: 'INV-ISP-2024-004',
            clientName: 'Digital Marketing Agency',
            clientId: 'CL-004',
            clientEmail: 'dma@example.com',
            clientPhone: '+91 9876543213',
            planName: 'Business 2999',
            planPrice: 2999,
            amount: 2999,
            paidAmount: 1500,
            pendingAmount: 1499,
            paymentDate: '2024-01-10',
            dueDate: '2024-01-05',
            status: 'pending',
            paymentMethod: 'Cheque',
            transactionId: 'CHQ123456',
            description: 'Quarterly subscription - Business Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-004',
            billingCycle: 'Quarterly'
        },
        {
            paymentId: 'PAY-ISP-005',
            invoiceNumber: 'INV-ISP-2024-005',
            clientName: 'Robert Williams',
            clientId: 'CL-005',
            clientEmail: 'robert@example.com',
            clientPhone: '+91 9876543214',
            planName: 'Premium 1199',
            planPrice: 1199,
            amount: 1199,
            paidAmount: 0,
            pendingAmount: 1199,
            paymentDate: null,
            dueDate: '2024-01-12',
            status: 'pending',
            paymentMethod: 'Cash',
            transactionId: 'N/A',
            description: 'Monthly subscription - Premium Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-005',
            billingCycle: 'Monthly'
        },
        {
            paymentId: 'PAY-ISP-006',
            invoiceNumber: 'INV-ISP-2024-006',
            clientName: 'Emily Davis',
            clientId: 'CL-006',
            clientEmail: 'emily@example.com',
            clientPhone: '+91 9876543215',
            planName: 'Standard 799',
            planPrice: 799,
            amount: 799,
            paidAmount: 799,
            pendingAmount: 0,
            paymentDate: '2024-01-22',
            dueDate: '2024-01-25',
            status: 'paid',
            paymentMethod: 'UPI',
            transactionId: 'UPI123456789',
            description: 'Monthly subscription - Standard Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-006',
            billingCycle: 'Monthly'
        },
        {
            paymentId: 'PAY-ISP-007',
            invoiceNumber: 'INV-ISP-2024-007',
            clientName: 'Startup Hub',
            clientId: 'CL-007',
            clientEmail: 'startup@example.com',
            clientPhone: '+91 9876543216',
            planName: 'Business 2999',
            planPrice: 2999,
            amount: 2999,
            paidAmount: 0,
            pendingAmount: 2999,
            paymentDate: null,
            dueDate: '2024-01-30',
            status: 'pending',
            paymentMethod: 'Bank Transfer',
            transactionId: 'N/A',
            description: 'Annual subscription - Business Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-007',
            billingCycle: 'Annual'
        },
        {
            paymentId: 'PAY-ISP-008',
            invoiceNumber: 'INV-ISP-2024-008',
            clientName: 'Michael Brown',
            clientId: 'CL-008',
            clientEmail: 'michael@example.com',
            clientPhone: '+91 9876543217',
            planName: 'Basic 599',
            planPrice: 599,
            amount: 599,
            paidAmount: 599,
            pendingAmount: 0,
            paymentDate: '2024-01-14',
            dueDate: '2024-01-10',
            status: 'paid',
            paymentMethod: 'Debit Card',
            transactionId: 'TXN00123458',
            description: 'Monthly subscription - Basic Plan',
            createdBy: 'System',
            createdAt: '2024-01-01',
            customerId: 'CUST-008',
            billingCycle: 'Monthly'
        }
    ];

    const transformApiData = (apiData) => {
        // If no API data, use sample data
        const dataToTransform = (!apiData || !Array.isArray(apiData) || apiData.length === 0) ? sampleInternetPayments : apiData;
        
        return dataToTransform.map((payment, index) => {
            const paymentDate = moment(payment.paymentDate);
            const dueDate = moment(payment.dueDate);
            const today = moment();

            let paymentStatus = payment.status?.toLowerCase() || 'pending';
            let overdueDays = 0;
            let isOverdue = false;

            // Convert all statuses to only "paid" or "pending"
            if (paymentStatus === 'paid' || paymentStatus === 'partial') {
                paymentStatus = 'paid';
            } else {
                paymentStatus = 'pending';
            }

            const getStatusColor = (status) => {
                switch (status?.toLowerCase()) {
                    case 'paid':
                        return 'bg-green-100 text-green-800 border border-green-200';
                    case 'pending':
                        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border border-gray-200';
                }
            };

            return {
                id: payment.paymentId || `PAY-${index + 1}`,
                paymentId: payment.paymentId?.substring(0, 10) || `PAY-${index + 1}`,
                invoiceNumber: payment.invoiceNumber || `INV-${index + 1001}`,
                clientName: payment.clientName || 'Unknown Customer',
                clientEmail: payment.clientEmail || 'No email',
                clientPhone: payment.clientPhone || 'No phone',
                clientId: payment.clientId,
                customerId: payment.customerId || `CUST-${index + 1}`,
                planName: payment.planName || 'Unnamed Plan',
                planPrice: parseFloat(payment.planPrice || payment.amount || 0),
                amount: parseFloat(payment.amount || 0),
                paidAmount: parseFloat(payment.paidAmount || 0),
                pendingAmount: parseFloat(payment.pendingAmount || payment.amount || 0),
                paymentDate: payment.paymentDate ? paymentDate.format('YYYY-MM-DD') : null,
                dueDate: payment.dueDate ? dueDate.format('YYYY-MM-DD') : paymentDate.clone().add(30, 'days').format('YYYY-MM-DD'),
                status: paymentStatus,
                statusColor: getStatusColor(paymentStatus),
                paymentMethod: payment.paymentMethod || 'Bank Transfer',
                transactionId: payment.transactionId || 'N/A',
                description: payment.description || 'No description provided',
                createdBy: payment.createdBy || 'System',
                createdAt: payment.createdAt ? moment(payment.createdAt).format('YYYY-MM-DD') : today.format('YYYY-MM-DD'),
                overdueDays,
                isOverdue,
                billingCycle: payment.billingCycle || 'Monthly',
                originalData: payment,
            };
        });
    };

    const [allPayments, setAllPayments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [reportType, setReportType] = useState('all'); // 'all', 'pending', 'paid'
    const [dateRangeType, setDateRangeType] = useState('last30');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedPlan: null,
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
        billingCycle: '',
    });

    const [optionListState, setOptionListState] = useState({
        planList: [
            { value: '', label: 'All Plans' },
            { value: 'basic_599', label: 'Basic 599' },
            { value: 'standard_799', label: 'Standard 799' },
            { value: 'premium_1199', label: 'Premium 1199' },
            { value: 'business_2999', label: 'Business 2999' },
        ],
        billingCycles: [
            { value: '', label: 'All Billing Cycles' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'semi_annual', label: 'Semi-Annual' },
            { value: 'annual', label: 'Annual' },
        ],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize with sample data on component mount
    useEffect(() => {
        if (initialLoad) {
            const transformedPayments = transformApiData(sampleInternetPayments); // Fixed: Pass sample data
            setAllPayments(transformedPayments);
            setFilteredData(transformedPayments);
            setInitialLoad(false);
        }
    }, [initialLoad]);

    // Handle API data transformation when data arrives
    useEffect(() => {
        if (paymentReportData && Array.isArray(paymentReportData) && paymentReportData.length > 0) {
            const transformedPayments = transformApiData(paymentReportData);
            setAllPayments(transformedPayments);
            setFilteredData(transformedPayments);
            setIsSearching(false);
        }
    }, [paymentReportData]);

    // Initial search when component mounts
    useEffect(() => {
        if (!initialLoad && !isSearching && !loading) {
            handleAutoSearch();
        }
    }, [initialLoad]);

    // Function to handle automatic search
    const handleAutoSearch = async () => {
        if (isSearching) return;

        setIsSearching(true);
        setSearchLoading(true);

        try {
            // Simulate API call delay
            setTimeout(() => {
                const transformedPayments = transformApiData(sampleInternetPayments); // Fixed: Pass sample data
                setAllPayments(transformedPayments);
                setFilteredData(transformedPayments);
                setAppliedFilters({ ...filters });
                setCurrentPage(0);
                setIsSearching(false);
                setSearchLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setIsSearching(false);
            setSearchLoading(false);
        }
    };

    const buildBackendFilters = () => {
        const backendFilters = {
            isActive: 1,
        };

        // Set status based on report type
        if (reportType === 'pending') {
            backendFilters.status = 'pending';
        } else if (reportType === 'paid') {
            backendFilters.status = 'paid';
        }

        // Date range filters
        if (filters.startDate) {
            backendFilters.fromDate = filters.startDate;
        }
        if (filters.toDate) {
            backendFilters.toDate = filters.toDate;
        }

        // Add plan filter
        if (filters.selectedPlan && filters.selectedPlan.value) {
            backendFilters.planName = filters.selectedPlan.value;
        }

        // Add search query filter
        if (filters.searchQuery) {
            backendFilters.search = filters.searchQuery;
        }

        // Add billing cycle filter
        if (filters.billingCycle) {
            backendFilters.billingCycle = filters.billingCycle;
        }

        return backendFilters;
    };

    const getFilteredPayments = (payments) => {
        let results = [...payments];

        // Filter by report type
        if (reportType === 'pending') {
            results = results.filter((payment) => payment.status === 'pending');
        } else if (reportType === 'paid') {
            results = results.filter((payment) => payment.status === 'paid');
        }

        // Search query filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            results = results.filter(
                (payment) =>
                    payment.invoiceNumber.toLowerCase().includes(query) ||
                    payment.clientName.toLowerCase().includes(query) ||
                    payment.customerId.toLowerCase().includes(query) ||
                    payment.clientEmail.toLowerCase().includes(query) ||
                    payment.clientPhone.toLowerCase().includes(query) ||
                    (payment.description && payment.description.toLowerCase().includes(query)) ||
                    (payment.transactionId && payment.transactionId.toLowerCase().includes(query))
            );
        }

        // Plan filter
        if (filters.selectedPlan && filters.selectedPlan.value) {
            const selectedPlan = filters.selectedPlan.value;
            results = results.filter((payment) =>
                payment.planName.toLowerCase().includes(selectedPlan.toLowerCase())
            );
        }

        // Date range filter
        if (filters.startDate && filters.toDate) {
            results = results.filter((payment) => {
                const dueDate = moment(payment.dueDate);
                const startDate = moment(filters.startDate);
                const endDate = moment(filters.toDate);
                return dueDate.isBetween(startDate, endDate, 'day', '[]');
            });
        }

        // Billing cycle filter
        if (filters.billingCycle) {
            results = results.filter((payment) =>
                payment.billingCycle.toLowerCase() === filters.billingCycle.toLowerCase()
            );
        }

        return results;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSearching) return;

        setIsSearching(true);
        setSearchLoading(true);
        const backendFilters = buildBackendFilters();

        try {
            // Simulate API call
            setTimeout(() => {
                const results = getFilteredPayments(allPayments);
                setFilteredData(results);
                setAppliedFilters({ ...filters });
                setCurrentPage(0);
                setIsSearching(false);
                setSearchLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setIsSearching(false);
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        const clearFilters = {
            searchQuery: '',
            selectedPlan: null,
            startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
            billingCycle: '',
        };

        setFilters(clearFilters);
        setAppliedFilters(null);
        setCurrentPage(0);
        setFilteredData(allPayments);
    };

    const handleReportTypeChange = async (type) => {
        setReportType(type);
        setCurrentPage(0);
        
        const results = getFilteredPayments(allPayments);
        setFilteredData(results);
    };

    const handleDateRangeChange = async (range) => {
        setDateRangeType(range);
        const today = moment();
        let startDate;

        switch (range) {
            case 'last7':
                startDate = today.clone().subtract(7, 'days');
                break;
            case 'last30':
                startDate = today.clone().subtract(30, 'days');
                break;
            case 'last60':
                startDate = today.clone().subtract(60, 'days');
                break;
            case 'last90':
                startDate = today.clone().subtract(90, 'days');
                break;
            case 'custom':
                return;
        }

        const newFilters = {
            ...filters,
            startDate: startDate.format('YYYY-MM-DD'),
            toDate: today.format('YYYY-MM-DD'),
        };

        setFilters(newFilters);
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPayment(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const paymentColumns = [
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
            Header: 'Customer Details',
            accessor: 'customerDetails',
            sort: true,
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <span className="font-semibold text-gray-900 block text-sm">{row.original.clientName}</span>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-600">{row.original.customerId}</span>
                        <span className="text-xs text-gray-500">{row.original.clientEmail}</span>
                        <span className="text-xs text-gray-500">{row.original.clientPhone}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Plan Details',
            accessor: 'planDetails',
            sort: true,
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <IconWifi className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="font-semibold text-gray-900 text-sm">{row.original.planName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">{row.original.billingCycle}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Invoice',
            accessor: 'invoiceNumber',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-sm font-medium" style={{ color: primaryColor }}>
                    {value}
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-900 text-sm">{formatCurrency(value)}</div>
                    {row.original.pendingAmount > 0 && (
                        <div className="text-xs" style={{ color: warningColor }}>
                            Pending: {formatCurrency(row.original.pendingAmount)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            Header: 'Due Date',
            accessor: 'dueDate',
            sort: true,
            Cell: ({ value }) => {
                const dueDate = moment(value);
                const today = moment();
                const daysDiff = dueDate.diff(today, 'days');

                return (
                    <div className="space-y-1">
                        <div className={`font-semibold text-sm ${daysDiff < 0 ? 'text-red-600' :
                                daysDiff === 0 ? 'text-orange-600' :
                                    daysDiff <= 7 ? 'text-yellow-600' :
                                        'text-gray-700'
                            }`}>
                            {dueDate.format('DD/MM/YYYY')}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            sort: true,
            Cell: ({ value }) => {
                let statusText = value.charAt(0).toUpperCase() + value.slice(1);
                let statusIcon = null;

                switch(value) {
                    case 'paid':
                        statusIcon = <IconCheck className="w-3 h-3 mr-1" />;
                        break;
                    case 'pending':
                        statusIcon = <IconClock className="w-3 h-3 mr-1" />;
                        break;
                }

                return (
                    <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(value)}`}>
                            {statusIcon}
                            {statusText}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 80,
            Cell: ({ row }) => {
                const payment = row.original;
                return (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(payment)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-20 transition-colors"
                        title="View Payment Details"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                        <IconEye className="w-4 h-4" />
                    </motion.button>
                );
            },
        },
    ];

    // Calculate metrics
    const calculateMetrics = {
        totalPayments: filteredData.length,
        totalAmount: filteredData.reduce((sum, p) => sum + p.amount, 0),
        totalPaid: filteredData
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0),
        totalPending: filteredData
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.pendingAmount, 0),
    };

    const onDownloadExcel = () => {
        const dateRange = reportType !== 'all' ?
            `${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}` :
            'Complete Payment Report';

        const additionalDetails = ` ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Payments Report`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY HH:mm')}`;

        const data = filteredData.map((payment, index) => ({
            ['S.No']: index + 1,
            ['Payment ID']: payment.paymentId,
            ['Customer ID']: payment.customerId,
            ['Customer Name']: payment.clientName,
            ['Email']: payment.clientEmail,
            ['Phone']: payment.clientPhone,
            ['Invoice No']: payment.invoiceNumber,
            ['Plan Name']: payment.planName,
            ['Billing Cycle']: payment.billingCycle,
            ['Total Amount']: formatCurrency(payment.amount),
            ['Paid Amount']: formatCurrency(payment.paidAmount),
            ['Pending Amount']: formatCurrency(payment.pendingAmount),
            ['Due Date']: moment(payment.dueDate).format('DD/MM/YYYY'),
            ['Status']: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
            ['Payment Method']: payment.paymentMethod,
            ['Transaction ID']: payment.transactionId,
            ['Description']: payment.description,
        }));

        const header = [
            ['CONNECTNET INTERNET SERVICE PROVIDER'],
            [additionalDetails],
            [reportGeneratedDate],
            [],
            [
                'S.No',
                'Payment ID',
                'Customer ID',
                'Customer Name',
                'Email',
                'Phone',
                'Invoice No',
                'Plan Name',
                'Billing Cycle',
                'Total Amount',
                'Paid Amount',
                'Pending Amount',
                'Due Date',
                'Status',
                'Payment Method',
                'Transaction ID',
                'Description',
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        const summaryRows = [
            [],
            ['REPORT SUMMARY'],
            ['Total Payments', calculateMetrics.totalPayments],
            ['Total Amount', formatCurrency(calculateMetrics.totalAmount)],
            ['Total Paid', formatCurrency(calculateMetrics.totalPaid)],
            ['Total Pending', formatCurrency(calculateMetrics.totalPending)],
        ];

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        // Merge header cells
        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 16 } });
        worksheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 16 } });
        worksheet['!merges'].push({ s: { r: allRows.length - 5, c: 0 }, e: { r: allRows.length - 5, c: 1 } });

        const summaryStartRow = header.length + rows.length + 1;
        for (let i = 1; i < summaryRows.length; i++) {
            worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 1 } });
        }

        worksheet['!cols'] = Array(17).fill().map(() => ({ wch: 15 }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ConnectNet Payments');

        const fileName = `connectnet-payments-${reportType}-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/print-task', {
            state: {
                filteredData: filteredData,
                filters: filters,
                reportType: reportType,
                metrics: calculateMetrics,
                companyName: 'ConnectNet Internet Service Provider',
                logoUrl: '/logo.png',
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
        control: (provided, state) => ({
            ...provided,
            border: `1px solid ${borderColor}`,
            borderRadius: '0.5rem',
            minHeight: '42px',
            backgroundColor: state.isDisabled ? hoverBg : 'white',
            fontSize: '14px',
            '&:hover': {
                borderColor: primaryColor,
            },
            cursor: state.isDisabled ? 'not-allowed' : 'default',
            boxShadow: state.isFocused ? `0 0 0 2px ${primaryColor}20` : 'none',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? primaryColor : state.isFocused ? `${primaryColor}15` : 'white',
            color: state.isSelected ? 'white' : darkColor,
            fontSize: '14px',
            '&:hover': {
                backgroundColor: `${primaryColor}15`,
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
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
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: accentColor }}></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full opacity-5 animate-ping" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between mb-6 p-4 border rounded-xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <IconWifi className="w-5 h-5" style={{ color: primaryColor }} />
                                <h1 className="text-xl font-bold" style={{ color: darkColor }}>
                                    ConnectNet Payments
                                </h1>
                            </div>
                            <p className="text-xs" style={{ color: secondaryColor }}>Internet Service Provider Billing System</p>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-opacity-20" style={{ backgroundColor: `${primaryColor}15` }}>
                            {mobileMenuOpen ? <IconX className="w-5 h-5" style={{ color: primaryColor }} /> : <IconMenu className="w-5 h-5" style={{ color: primaryColor }} />}
                        </button>
                    </div>
                )}

                {/* Desktop Header */}
                {!isMobile && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>
                                <IconWifi className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: darkColor }}>
                                    Payment Report
                                </h1>
                                <p className="text-sm mt-1" style={{ color: secondaryColor }}>Monitor and manage internet service payments</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => handleReportTypeChange('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${reportType === 'all' ? 'text-white shadow-lg' : 'hover:opacity-90'}`}
                                style={{ 
                                    backgroundColor: reportType === 'all' ? primaryColor : cardBg,
                                    color: reportType === 'all' ? 'white' : darkColor,
                                    border: reportType === 'all' ? 'none' : `1px solid ${borderColor}`
                                }}
                            >
                                All Payments
                            </button>
                            <button
                                onClick={() => handleReportTypeChange('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${reportType === 'pending' ? 'text-white shadow-lg' : 'hover:opacity-90'}`}
                                style={{ 
                                    backgroundColor: reportType === 'pending' ? warningColor : cardBg,
                                    color: reportType === 'pending' ? 'white' : darkColor,
                                    border: reportType === 'pending' ? 'none' : `1px solid ${borderColor}`
                                }}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => handleReportTypeChange('paid')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${reportType === 'paid' ? 'text-white shadow-lg' : 'hover:opacity-90'}`}
                                style={{ 
                                    backgroundColor: reportType === 'paid' ? successColor : cardBg,
                                    color: reportType === 'paid' ? 'white' : darkColor,
                                    border: reportType === 'paid' ? 'none' : `1px solid ${borderColor}`
                                }}
                            >
                                Paid
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Export Buttons */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={onDownloadExcel}
                        className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-sm"
                        style={{ backgroundColor: successColor }}
                    >
                        <IconDownload className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={onDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-sm"
                        style={{ backgroundColor: dangerColor }}
                    >
                        <IconPrinter className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 font-medium"
                        style={{ 
                            backgroundColor: cardBg,
                            color: darkColor,
                            border: `1px solid ${borderColor}`
                        }}
                    >
                        <IconFilter className="w-4 h-4" />
                        {showSearch ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </motion.div>

                {/* Search Panel */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 sm:p-6 mb-6 border rounded-xl overflow-hidden"
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: darkColor }}>
                                    <IconSearch className="w-5 h-5" style={{ color: primaryColor }} />
                                    Search & Filter Payments
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                                    {/* Date Range Filters */}
                                    <div className={`${isMobile ? 'col-span-1' : 'md:col-span-1'}`}>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1" style={{ color: darkColor }}>
                                            <IconCalendar className="w-4 h-4" style={{ color: primaryColor }} />
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                backgroundColor: 'white',
                                                '--tw-ring-color': primaryColor,
                                            }}
                                            value={filters.startDate}
                                            onChange={(e) => {
                                                setFilters({ ...filters, startDate: e.target.value });
                                            }}
                                        />
                                    </div>
                                    <div className={`${isMobile ? 'col-span-1' : 'md:col-span-1'}`}>
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
                                            onChange={(e) => {
                                                setFilters({ ...filters, toDate: e.target.value });
                                            }}
                                        />
                                    </div>

                                    {/* Plan Filter */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>Internet Plan</label>
                                        <Select
                                            options={optionListState.planList}
                                            value={filters.selectedPlan}
                                            onChange={(selectedOption) => {
                                                setFilters({ ...filters, selectedPlan: selectedOption });
                                            }}
                                            placeholder="Select Plan"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>

                                    {/* Billing Cycle Filter */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: darkColor }}>Billing Cycle</label>
                                        <Select
                                            options={optionListState.billingCycles}
                                            value={optionListState.billingCycles.find(opt => opt.value === filters.billingCycle)}
                                            onChange={(selectedOption) => {
                                                setFilters({ ...filters, billingCycle: selectedOption?.value || '' });
                                            }}
                                            placeholder="Select Billing Cycle"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>

                                    {/* Search Input */}
                                    <div className={isMobile ? 'col-span-1' : 'md:col-span-2'}>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1" style={{ color: darkColor }}>
                                            <IconSearch className="w-4 h-4" style={{ color: primaryColor }} />
                                            Search Customers/Invoices
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                backgroundColor: 'white',
                                                '--tw-ring-color': primaryColor,
                                            }}
                                            placeholder="Search by customer name, ID, email, phone, or invoice..."
                                            value={filters.searchQuery}
                                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <motion.button
                                            type="button"
                                            onClick={handleClear}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                                            style={{ 
                                                backgroundColor: cardBg,
                                                color: darkColor,
                                                border: `1px solid ${borderColor}`
                                            }}
                                            disabled={searchLoading}
                                        >
                                            <IconRefresh className="w-4 h-4" />
                                            <span>Clear Filters</span>
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-4 sm:px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
                                            style={{ backgroundColor: primaryColor }}
                                            disabled={searchLoading || isSearching}
                                        >
                                            {searchLoading || isSearching ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Searching...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <IconSearch className="w-4 h-4" />
                                                    <span>Search Payments</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section - Show sample data initially */}
                {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 sm:p-12 text-center border rounded-xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: primaryColor }}></div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: darkColor }}>Loading Payment Data</h3>
                            <p style={{ color: secondaryColor }}>Please wait while we fetch billing information</p>
                        </div>
                    </motion.div>
                ) : searchLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 sm:p-12 text-center border rounded-xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: primaryColor }}></div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: darkColor }}>Searching Payments</h3>
                            <p style={{ color: secondaryColor }}>Fetching data based on your criteria</p>
                        </div>
                    </motion.div>
                ) : (filteredData.length > 0) ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="p-4 sm:p-6 border-b" style={{ borderColor: borderColor, background: `linear-gradient(135deg, ${lightBg} 0%, ${cardBg} 100%)` }}>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: darkColor }}>
                                        {reportType === 'all' ? 'All Payments' : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Payments`}
                                    </h3>
                                    <p style={{ color: secondaryColor }}>
                                        Showing {filteredData.length} payments totaling {formatCurrency(calculateMetrics.totalAmount)}
                                        {reportType !== 'all' && ` from ${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div style={{ color: secondaryColor }}>
                                        <span className="hidden sm:inline">Last updated: </span>
                                        <span className="font-medium">{moment().format('HH:mm')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4">
                            {isMobile ? (
                                <div className="space-y-3">
                                    {getPaginatedData().map((payment, index) => (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all"
                                            style={{ backgroundColor: 'white', borderColor: borderColor }}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                                                {payment.invoiceNumber}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{payment.clientName}</h4>
                                                        <p className="text-xs text-gray-600 mb-1">{payment.customerId}</p>
                                                        <p className="text-xs text-gray-500">{payment.planName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(payment.amount)}</div>
                                                        {payment.pendingAmount > 0 && (
                                                            <div className="text-xs" style={{ color: warningColor }}>
                                                                Pending: {formatCurrency(payment.pendingAmount)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-gray-500">Due Date:</span>
                                                        <p className="font-medium">
                                                            {moment(payment.dueDate).format('DD MMM YY')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Billing Cycle:</span>
                                                        <p className="font-medium">{payment.billingCycle}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
                                                    style={{
                                                        backgroundColor: `${primaryColor}15`,
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    <IconEye className="w-3.5 h-3.5" />
                                                    View Details
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <Table
                                    columns={paymentColumns}
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
                                    theadClass="bg-gradient-to-r from-blue-50 to-white"
                                    mobileView={false}
                                />
                            )}

                            {/* Mobile Pagination */}
                            {isMobile && filteredData.length > 0 && (
                                <div className="flex items-center justify-between mt-6 px-2">
                                    <button
                                        onClick={() => handlePaginationChange(currentPage - 1, pageSize)}
                                        disabled={currentPage === 0}
                                        className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                        style={{ 
                                            borderColor: borderColor,
                                            backgroundColor: cardBg,
                                            color: darkColor
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm" style={{ color: secondaryColor }}>
                                        Page {currentPage + 1} of {Math.ceil(getTotalCount() / pageSize)}
                                    </span>
                                    <button
                                        onClick={() => handlePaginationChange(currentPage + 1, pageSize)}
                                        disabled={currentPage >= Math.ceil(getTotalCount() / pageSize) - 1}
                                        className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                        style={{ 
                                            borderColor: borderColor,
                                            backgroundColor: cardBg,
                                            color: darkColor
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 sm:p-12 text-center border rounded-xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15` }}>
                                <IconWifi className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: primaryColor }} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: darkColor }}>ConnectNet Payment Dashboard</h3>
                            <p className="text-sm sm:text-base max-w-md mb-6" style={{ color: secondaryColor }}>
                                Use the search filters above to analyze customer payments and billing information.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Start Searching
                                </button>
                                <button
                                    onClick={onDownloadExcel}
                                    className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                    style={{ backgroundColor: successColor }}
                                >
                                    Export Sample Data
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Payment Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Payment Details - ${selectedPayment?.invoiceNumber || 'Payment'}`}
                setModel={closeDetailsModal}
                modelSize="max-w-4xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedPayment && (
                    <div className="p-4">
                        <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: borderColor, background: `linear-gradient(135deg, ${lightBg} 0%, ${cardBg} 100%)` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'white' }}>
                                    <IconWifi className="w-6 h-6" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: darkColor }}>ConnectNet Internet Service</h3>
                                    <p className="text-sm" style={{ color: secondaryColor }}>Customer Billing Information</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm" style={{ color: darkColor }}>Customer Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Customer Name:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.clientName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Customer ID:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.customerId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Email:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.clientEmail}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Phone:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.clientPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm" style={{ color: darkColor }}>Service Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Internet Plan:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.planName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Billing Cycle:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.billingCycle}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm" style={{ color: darkColor }}>Payment Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Invoice Number:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.invoiceNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Payment ID:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.paymentId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Status:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                                                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Payment Method:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Transaction ID:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>{selectedPayment.transactionId}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: hoverBg }}>
                                        <h4 className="font-semibold mb-3 text-sm" style={{ color: darkColor }}>Financial Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Total Amount:</span>
                                                <span className="font-bold" style={{ color: primaryColor }}>
                                                    {formatCurrency(selectedPayment.amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Paid Amount:</span>
                                                <span className="font-bold" style={{ color: primaryColor }}>
                                                    {formatCurrency(selectedPayment.paidAmount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Pending Amount:</span>
                                                <span className="font-bold" style={{ color: warningColor }}>
                                                    {formatCurrency(selectedPayment.pendingAmount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: secondaryColor }}>Due Date:</span>
                                                <span className="font-medium" style={{ color: darkColor }}>
                                                    {moment(selectedPayment.dueDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                                <h4 className="font-semibold mb-2 text-sm" style={{ color: darkColor }}>Description</h4>
                                <p className="text-sm" style={{ color: secondaryColor }}>{selectedPayment.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default PaymentReport;