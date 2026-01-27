import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconEye from '../../../components/Icon/IconEye';
import IconRefresh from '../../../components/Icon/IconRefresh';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { findArrObj } from '../../../util/AllFunction';
import { getPaymentHistory } from '../../../redux/PaymentHistorySlice';
import { getCustomers } from '../../../redux/customerSlice';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconFileText from '../../../components/Icon/IconFile';

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Payment History') : [];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const staffId = localData?.staffId;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const brandColorPrimary = '#1a73e8';
    const brandColorSecondary = '#00c853';

    const {
        loading,
        getPaymentHistorySuccess,
        getPaymentHistoryFailed,
        paymentHistoryData,
        customers = [],
        customerLoading = false,
    } = useSelector((state) => ({
        getPaymentHistorySuccess: state.PaymentHistorySlice.getPaymentHistorySuccess,
        getPaymentHistoryFailed: state.PaymentHistorySlice.getPaymentHistoryFailed,
        error: state.PaymentHistorySlice.error,
        loading: state.PaymentHistorySlice.loading,
        paymentHistoryData: state.PaymentHistorySlice.paymentHistoryData,
        customers: state.CustomerSlice.customers || [],
        customerLoading: state.CustomerSlice.loading || false,
    }));

    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800' },
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
    ];

    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((item, index) => {
            const invoice = item.invoice || {};
            const invoiceItems = invoice.items || [];
            const firstItem = invoiceItems[0] || {};

            const amount = parseFloat(item.amount) || 0;
            const formattedAmount = `₹${amount.toFixed(2)}`;

            const paymentDate = item.payment_date ? moment(item.payment_date).format('DD/MM/YYYY HH:mm') : 'N/A';
            const invoiceStatus = invoice.status || 'generated';

            return {
                id: item.id || `PAY-${index + 1000}`,
                paymentId: item.payment_id || `PID-${index + 1000}`,
                userId: item.user_id || 'N/A',
                orderId: item.order_id || 'N/A',
                razorpayOrderId: item.razorpay_order_id || 'N/A',
                amount: formattedAmount,
                originalAmount: amount,
                currency: item.currency || 'INR',
                paymentMethod: item.payment_method || 'N/A',
                paymentGateway: item.payment_gateway || 'N/A',
                description: item.description || 'No description',
                paymentFor: item.payment_for || 'N/A',
                serviceType: item.service_type || 'N/A',
                status: item.status || 'pending',
                paymentDate: paymentDate,
                rawPaymentDate: item.payment_date,
                invoiceId: item.invoice_id || 'N/A',
                invoiceStatus: invoiceStatus,
                invoiceNumber: invoice.invoice_id || 'N/A',
                billDate: invoice.bill_date ? moment(invoice.bill_date).format('DD/MM/YYYY') : 'N/A',
                dueDate: invoice.due_date ? moment(invoice.due_date).format('DD/MM/YYYY') : 'N/A',
                totalAmount: invoice.total_amount ? `₹${parseFloat(invoice.total_amount).toFixed(2)}` : 'N/A',
                paidAmount: invoice.paid_amount ? `₹${parseFloat(invoice.paid_amount).toFixed(2)}` : 'N/A',
                balanceAmount: invoice.balance_amount ? `₹${parseFloat(invoice.balance_amount).toFixed(2)}` : 'N/A',
                itemName: firstItem.item_name || 'N/A',
                itemDescription: firstItem.item_description || 'N/A',
                originalData: item,
                invoiceData: invoice,
            };
        });
    };

    const [Payments, setPayments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    const [filters, setFilters] = useState({
        userId: null,
        status: '',
        endDate: moment().format('YYYY-MM-DD'),
    });

    const [optionListState, setOptionListState] = useState({
        statusList: paymentStatusOptions,
        customerList: [],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);

    const getStatusColor = (status) => {
        const statusOption = paymentStatusOptions.find((opt) => opt.value === status);
        return statusOption?.color || 'bg-gray-100 text-gray-800';
    };

    const getPaymentColor = (amount) => {
        const amt = parseFloat(amount) || 0;
        if (amt <= 500) return '#10b981';
        if (amt <= 1000) return '#3b82f6';
        if (amt <= 2000) return '#8b5cf6';
        return '#ff6d00';
    };

    const paymentColumns = [
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
            Cell: ({ row }) => {
                const customer = customers.find((c) => c.user_id === row.original.userId);
                return (
                    <div>
                        <div className="font-medium text-gray-900">{customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : row.original.userId}</div>
                        <div className="text-xs text-gray-500">{row.original.userId}</div>
                    </div>
                );
            },
        },
        // {
        //     Header: 'Payment ID',
        //     accessor: 'paymentId',
        //     sort: true,
        //     Cell: ({ value }) => <div className="font-medium text-gray-900">{value}</div>,
        // },
        {
            Header: 'Amount',
            accessor: 'amount',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <div className="w-2 h-8 rounded-full mr-2" style={{ backgroundColor: getPaymentColor(row.original.originalAmount) }}></div>
                    <div>
                        <div className="font-bold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">{row.original.currency}</div>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Description',
            accessor: 'description',
            sort: true,
            Cell: ({ value }) => (
                <div className="max-w-xs truncate" title={value}>
                    {value}
                </div>
            ),
        },
        {
            Header: 'Payment Date',
            accessor: 'paymentDate',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            Header: 'Status',
            accessor: 'status',
            sort: true,
            Cell: ({ value }) => {
                let displayLabel = value.charAt(0).toUpperCase() + value.slice(1);
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{displayLabel}</span>;
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 100,
            Cell: ({ row }) => {
                const hasInvoice = row.original.invoiceId && row.original.invoiceId !== 'N/A';

                return (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handleViewDetails(row.original)}
                            className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="View Payment Details"
                            style={{ color: brandColorPrimary }}
                        >
                            <IconEye className="w-4 h-4" />
                        </button>

                        {hasInvoice && (
                            <Tippy content="View Invoice">
                                <button
                                    onClick={() => navigate(`/customers/invoices/${row.original.userId}?invoiceId=${row.original.invoiceId}`)}
                                    className="btn btn-sm btn-outline-warning flex items-center justify-center w-8 h-8"
                                >
                                    <IconFileText className="w-4 h-4" />
                                </button>
                            </Tippy>
                        )}
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
            return '25c1c6c1-3ea7-439c-f0b0-b03e42f21a5d';
        }
    };

    useEffect(() => {
        dispatch(getCustomers());
        const initialFilters = {
            userId: '',
            status: '',
            endDate: moment().format('YYYY-MM-DD'),
        };
        dispatch(getPaymentHistory(initialFilters));
    }, [dispatch]);

    useEffect(() => {
        if (paymentHistoryData?.data) {
            const transformedPayments = transformApiData(paymentHistoryData.data);
            setPayments(transformedPayments);
            setFilteredData(transformedPayments);
            calculateSummaryData(transformedPayments);

            const customerOptions = customers.map((customer) => ({
                value: customer.user_id,
                label: `${customer.first_name || ''} ${customer.last_name || ''} (${customer.user_id})`.trim(),
                phone: customer.mobile,
            }));

            setOptionListState((prev) => ({
                ...prev,
                customerList: [{ value: '', label: 'All Customers' }, ...customerOptions],
            }));
        } else {
            setPayments([]);
            setFilteredData([]);
            setSummaryData(null);
        }
    }, [paymentHistoryData, customers]);

    useEffect(() => {
        let filtered = [...Payments];

        if (filters.userId?.value) {
            filtered = filtered.filter((payment) => payment.userId === filters.userId.value);
        }

        if (filters.status) {
            filtered = filtered.filter((payment) => payment.status === filters.status);
        }

        if (filters.endDate) {
            const endDate = moment(filters.endDate);
            filtered = filtered.filter((payment) => {
                if (!payment.rawPaymentDate) return true;
                const paymentDate = moment(payment.rawPaymentDate);
                return paymentDate.isSameOrBefore(endDate, 'day');
            });
        }

        setFilteredData(filtered);
    }, [Payments, filters]);

    const calculateSummaryData = (payments) => {
        if (!payments || payments.length === 0) {
            setSummaryData(null);
            return;
        }

        const totalPayments = payments.length;
        const successPayments = payments.filter((p) => p.status === 'success').length;
        const pendingPayments = payments.filter((p) => p.status === 'pending').length;
        const failedPayments = payments.filter((p) => p.status === 'failed').length;

        const totalAmount = payments.reduce((sum, p) => sum + (p.originalAmount || 0), 0);
        const successAmount = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + (p.originalAmount || 0), 0);

        setSummaryData({
            total_payments: totalPayments,
            success_count: successPayments,
            pending_count: pendingPayments,
            failed_count: failedPayments,
            success_percentage: totalPayments > 0 ? ((successPayments / totalPayments) * 100).toFixed(1) : 0,
            failed_percentage: totalPayments > 0 ? ((failedPayments / totalPayments) * 100).toFixed(1) : 0,
            total_amount: totalAmount,
            success_amount: successAmount,
            average_payment: totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : 0,
        });
    };

    const buildBackendFilters = () => {
        const backendFilters = {};

        if (filters.userId?.value) {
            backendFilters.userId = filters.userId.value;
        }

        if (filters.status) {
            backendFilters.status = filters.status;
        }

        if (filters.endDate) {
            backendFilters.endDate = filters.endDate;
        }

        return backendFilters;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);

        const backendFilters = buildBackendFilters();

        try {
            await dispatch(getPaymentHistory(backendFilters));
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
        } catch (error) {
            console.error('Error fetching payment history:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            userId: null,
            status: '',
            endDate: moment().format('YYYY-MM-DD'),
        });
        setAppliedFilters(null);
        setSearchLoading(false);
        setCurrentPage(0);

        const defaultFilters = {
            userId: '',
            status: '',
            endDate: moment().format('YYYY-MM-DD'),
        };
        dispatch(getPaymentHistory(defaultFilters));
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPayment(null);
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

    const onDownload = () => {
        const additionalDetails = `Payment History Report`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY HH:mm')}`;
        const filterDetails = `Filters: ${filters.userId?.value ? `Customer: ${filters.userId.label}, ` : ''}${filters.status ? `Status: ${filters.status}, ` : ''}${filters.endDate ? `End Date: ${filters.endDate}` : ''}`;

        const data = filteredData.map((payment, index) => {
            const customer = customers.find((c) => c.user_id === payment.userId);
            return {
                ['S.No']: index + 1,
                ['Customer Name']: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown',
                ['User ID']: payment.userId,
                ['Payment ID']: payment.paymentId,
                ['Order ID']: payment.orderId,
                ['Amount']: payment.amount,
                ['Currency']: payment.currency,
                ['Payment Method']: payment.paymentMethod,
                ['Payment Gateway']: payment.paymentGateway,
                ['Description']: payment.description,
                ['Payment For']: payment.paymentFor,
                ['Service Type']: payment.serviceType,
                ['Status']: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
                ['Payment Date']: payment.paymentDate,
                ['Invoice ID']: payment.invoiceId,
                ['Invoice Status']: payment.invoiceStatus,
                ['Invoice Number']: payment.invoiceNumber,
                ['Bill Date']: payment.billDate,
                ['Due Date']: payment.dueDate,
                ['Total Amount']: payment.totalAmount,
                ['Paid Amount']: payment.paidAmount,
                ['Balance Amount']: payment.balanceAmount,
                ['Item Name']: payment.itemName,
                ['Item Description']: payment.itemDescription,
            };
        });

        const header = [
            [additionalDetails],
            [reportGeneratedDate],
            [filterDetails],
            [],
            [
                'S.No',
                'Customer Name',
                'User ID',
                'Payment ID',
                'Order ID',
                'Amount',
                'Currency',
                'Payment Method',
                'Payment Gateway',
                'Description',
                'Payment For',
                'Service Type',
                'Status',
                'Payment Date',
                'Invoice ID',
                'Invoice Status',
                'Invoice Number',
                'Bill Date',
                'Due Date',
                'Total Amount',
                'Paid Amount',
                'Balance Amount',
                'Item Name',
                'Item Description',
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        const summaryRows = [];
        if (summaryData) {
            summaryRows.push(
                [],
                ['REPORT SUMMARY'],
                ['Total Payments', summaryData.total_payments],
                ['Successful Payments', summaryData.success_count],
                ['Pending Payments', summaryData.pending_count],
                ['Failed Payments', summaryData.failed_count],
                ['Success Rate', `${summaryData.success_percentage}%`],
                ['Failed Rate', `${summaryData.failed_percentage}%`],
                ['Total Amount', `₹${summaryData.total_amount.toFixed(2)}`],
                ['Successful Amount', `₹${summaryData.success_amount.toFixed(2)}`],
                ['Average Payment', `₹${summaryData.average_payment}`],
            );
        }

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 23 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 23 } });
        worksheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 23 } });

        worksheet['!cols'] = Array(24).fill({ wch: 15 });
        worksheet['!cols'][0] = { wch: 8 };
        worksheet['!cols'][1] = { wch: 20 };
        worksheet['!cols'][2] = { wch: 15 };
        worksheet['!cols'][3] = { wch: 25 };
        worksheet['!cols'][9] = { wch: 30 };
        worksheet['!cols'][22] = { wch: 20 };
        worksheet['!cols'][23] = { wch: 30 };

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment History Report');

        const fileName = `Payment-History-Report-${moment().format('DD-MM-YYYY-HHmm')}.xlsx`;

        XLSX.writeFile(workbook, fileName);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-24 h-24 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: brandColorPrimary }}></div>
                <div className="absolute top-40 right-20 w-20 h-20 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: brandColorSecondary }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Payment History</h1>
                            <p className="text-gray-600">Track and manage payment transactions</p>
                        </div>
                    </div>
                </div>

                {showSearch && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <IconSearch className="w-5 h-5" style={{ color: brandColorPrimary }} />
                                </div>
                                Search Payment History
                            </h2>
                            <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                ▲ Hide Panel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer (Phone)</label>
                                    <Select
                                        options={optionListState.customerList}
                                        value={filters.userId}
                                        onChange={(selectedOption) => setFilters({ ...filters, userId: selectedOption })}
                                        placeholder="Select Customer"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                    <Select
                                        options={optionListState.statusList}
                                        value={filters.status ? { value: filters.status, label: filters.status.charAt(0).toUpperCase() + filters.status.slice(1) } : null}
                                        onChange={(selectedOption) => setFilters({ ...filters, status: selectedOption?.value || '' })}
                                        placeholder="Select Status"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                            '--tw-ring-color': brandColorPrimary,
                                        }}
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                        max={moment().format('YYYY-MM-DD')}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">Payments on or before this date</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Found {filteredData.length} payment transactions
                                    {filters.endDate && ` • Up to: ${moment(filters.endDate).format('DD/MM/YYYY')}`}
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
                                                <span>Search Payments</span>
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

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Payment Data</h3>
                            <p className="text-gray-500 max-w-md">Fetching payment history from the server...</p>
                        </div>
                    </div>
                ) : searchLoading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Searching Payments</h3>
                            <p className="text-gray-500 max-w-md">Filtering payment transactions based on your criteria...</p>
                        </div>
                    </div>
                ) : appliedFilters && filteredData.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Payment History Results</h3>
                                    <p className="text-gray-600">Showing {filteredData.length} payment transactions</p>
                                </div>
                                {filteredData.length > 0 && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onDownload}
                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                                        >
                                            <IconPrinter className="w-3 h-3" />
                                            <span>Export to Excel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {summaryData && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 px-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">Total Payments</p>
                                            <p className="text-2xl font-bold text-blue-800">{summaryData.total_payments}</p>
                                            <p className="text-xs text-blue-600 mt-1">₹{summaryData.total_amount.toFixed(2)}</p>
                                        </div>
                                        <div className="text-2xl">💰</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">Successful</p>
                                            <p className="text-2xl font-bold text-green-800">{summaryData.success_count}</p>
                                            <p className="text-xs text-green-600 mt-1">
                                                {summaryData.success_percentage}% • ₹{summaryData.success_amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-2xl">✅</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                                            <p className="text-2xl font-bold text-yellow-800">{summaryData.pending_count}</p>
                                            <p className="text-xs text-yellow-600 mt-1">
                                                {summaryData.total_payments > 0 ? ((summaryData.pending_count / summaryData.total_payments) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                        <div className="text-2xl">⏳</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-600 font-medium">Failed</p>
                                            <p className="text-2xl font-bold text-red-800">{summaryData.failed_count}</p>
                                            <p className="text-xs text-red-600 mt-1">{summaryData.failed_percentage}%</p>
                                        </div>
                                        <div className="text-2xl">❌</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4">
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
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Payments Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">No payment transactions match your current search criteria. Try adjusting your filters.</p>
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
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Payment History Dashboard</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">
                                {Payments.length > 0
                                    ? `Ready to search through ${Payments.length} payment transactions. Use the search filters above to generate detailed reports.`
                                    : 'No payment data available. Loading payment history...'}
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold text-lg shadow-xl"
                                style={{ backgroundColor: brandColorSecondary }}
                            >
                                Start Searching Payments
                            </button>
                        </div>
                    </div>
                )}

                <ModelViewBox
                    modal={showDetailsModal}
                    modelHeader={`Payment Details: ${selectedPayment?.userId || ''}`}
                    setModel={closeDetailsModal}
                    modelSize="max-w-4xl"
                    submitBtnText="Close"
                    loading={false}
                    hideSubmit={true}
                    saveBtn={false}
                >
                    {selectedPayment && (
                        <div className="p-6 space-y-6">
                            <div
                                className="mb-6 p-4 rounded-xl border"
                                style={{ borderColor: getPaymentColor(selectedPayment.originalAmount), backgroundColor: `${getPaymentColor(selectedPayment.originalAmount)}10` }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        {/* <h3 className="text-xl font-bold text-gray-800">{selectedPayment.paymentId}</h3> */}
                                        <p className="text-gray-600">
                                            {selectedPayment.description} • {selectedPayment.amount}
                                        </p>
                                        <p className="text-sm text-gray-500">User ID: {selectedPayment.userId}</p>
                                        <p className="text-sm text-gray-500">Order ID: {selectedPayment.orderId}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                                            {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPayment.invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            Invoice: {selectedPayment.invoiceStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Payment Information</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">User ID:</span>
                                                    <p className="text-gray-800">{selectedPayment.userId}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Order ID:</span>
                                                    <p className="text-gray-800">{selectedPayment.orderId}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Razorpay Order ID:</span>
                                                    <p className="text-gray-800">{selectedPayment.razorpayOrderId}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Amount:</span>
                                                    <p className="text-gray-800 font-bold">{selectedPayment.amount}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Currency:</span>
                                                    <p className="text-gray-800">{selectedPayment.currency}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Payment Method:</span>
                                                    <p className="text-gray-800">{selectedPayment.paymentMethod}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Payment Gateway:</span>
                                                    <p className="text-gray-800">{selectedPayment.paymentGateway}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Description:</span>
                                                <p className="text-gray-800 whitespace-pre-line">{selectedPayment.description}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Payment For:</span>
                                                    <p className="text-gray-800">{selectedPayment.paymentFor}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Service Type:</span>
                                                    <p className="text-gray-800">{selectedPayment.serviceType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Status Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div
                                                    className={`text-2xl font-bold mb-1 ${selectedPayment.status === 'success' ? 'text-green-600' : selectedPayment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}
                                                >
                                                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                                                </div>
                                                <div className="text-sm text-gray-600">Payment Status</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className={`text-2xl font-bold mb-1 ${selectedPayment.invoiceStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {selectedPayment.invoiceStatus.charAt(0).toUpperCase() + selectedPayment.invoiceStatus.slice(1)}
                                                </div>
                                                <div className="text-sm text-gray-600">Invoice Status</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1 text-blue-600">{selectedPayment.paymentDate.split(' ')[0]}</div>
                                                <div className="text-sm text-gray-600">Payment Date</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg border">
                                                <div className="text-2xl font-bold mb-1 text-gray-600">{selectedPayment.paymentDate.split(' ')[1]}</div>
                                                <div className="text-sm text-gray-600">Payment Time</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Invoice Information</h4>
                                        <div className="space-y-3 text-sm">
                                            {/* <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Invoice ID:</span>
                                                    <p className="text-gray-800">{selectedPayment.invoiceId}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Invoice Number:</span>
                                                    <p className="text-gray-800">{selectedPayment.invoiceNumber}</p>
                                                </div>
                                            </div> */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Bill Date:</span>
                                                    <p className="text-gray-800">{selectedPayment.billDate}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Due Date:</span>
                                                    <p className="text-gray-800">{selectedPayment.dueDate}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <span className="font-medium text-gray-600">Total Amount:</span>
                                                    <p className="text-gray-800 font-bold">{selectedPayment.totalAmount}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Paid Amount:</span>
                                                    <p className={`font-bold ${selectedPayment.invoiceStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedPayment.paidAmount}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Balance:</span>
                                                    <p
                                                        className={`font-bold ${selectedPayment.balanceAmount === '₹0.00' || selectedPayment.balanceAmount === 'N/A' ? 'text-green-600' : 'text-red-600'}`}
                                                    >
                                                        {selectedPayment.balanceAmount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-3">Item Details</h4>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Item Name:</span>
                                                <p className="text-gray-800">{selectedPayment.itemName}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Item Description:</span>
                                                <p className="text-gray-800 whitespace-pre-line">{selectedPayment.itemDescription}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedPayment.originalData && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-3">Technical Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Created At:</span>
                                                    <span className="font-medium">
                                                        {selectedPayment.originalData.created_at ? moment(selectedPayment.originalData.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Updated At:</span>
                                                    <span className="font-medium">
                                                        {selectedPayment.originalData.updated_at ? moment(selectedPayment.originalData.updated_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Service ID:</span>
                                                    <span className="font-medium">{selectedPayment.originalData.service_id || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </ModelViewBox>
            </div>
        </div>
    );
};

export default Index;
