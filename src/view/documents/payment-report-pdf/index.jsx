import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCompany, resetCompanyStatus } from '../../../redux/companySlice';
import { baseURL } from '../../../api/ApiConfig';
import moment from 'moment';

const Index = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentData, setPaymentData] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});
    const [filters, setFilters] = useState({});
    const [reportType, setReportType] = useState('all');
    const [metrics, setMetrics] = useState({});

    const { getCompanySuccess, companyData, getCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,
        errorMessage: state.ComapnySlice.errorMessage,
    }));

    useEffect(() => {
        if (location.state?.filteredData) {
            setPaymentData(location.state.filteredData);
        }
        if (location.state?.filters) {
            setFilters(location.state.filters);
        }
        if (location.state?.reportType) {
            setReportType(location.state.reportType);
        }
        if (location.state?.metrics) {
            setMetrics(location.state.metrics);
        }
        console.log('location.state', location.state);
    }, [location.state]);

    useEffect(() => {
        dispatch(getCompany());
    }, [dispatch]);

    useEffect(() => {
        if (getCompanySuccess && companyData?.data?.[0]) {
            const companyDataItem = companyData.data[0];
            setCompanyInfo({
                companyName: companyDataItem?.companyName || 'ConnectNet Internet Service Provider',
                companyMobile: companyDataItem?.companyMobile || '',
                companyAltMobile: companyDataItem?.companyAltMobile || '',
                companyMail: companyDataItem?.companyMail || '',
                companyAddressOne: companyDataItem?.companyAddressOne || '',
                companyGstNo: companyDataItem?.companyGstNo || '',
                companyAddressTwo: companyDataItem?.companyAddressTwo || '',
                logoPreview: companyDataItem?.companyLogo ? `${baseURL}${companyDataItem?.companyLogo}` : '',
            });
            dispatch(resetCompanyStatus());
        }
    }, [getCompanySuccess, companyData, dispatch]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'Pending';
        return moment(date).format('DD/MM/YYYY');
    };

    const getStatusColorClass = (status) => {
        return status?.toLowerCase() === 'paid' ? 'text-green-600' : 'text-red-600';
    };

    const getStatusText = (status) => {
        const statusLower = status?.toLowerCase();

        // If status is "paid", show "Paid", otherwise show "Pending"
        if (statusLower === 'paid') {
            return 'Paid';
        } else {
            // All other statuses (pending, overdue, partial, etc.) show as "Pending"
            return 'Pending';
        }
    };

    const getConnectionTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'fiber':
                return 'text-blue-600';
            case 'broadband':
                return 'text-purple-600';
            case 'wireless':
                return 'text-green-600';
            case 'satellite':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Calculate statistics if not provided
    const calculateStatistics = () => {
        if (Object.keys(metrics).length > 0) return metrics;

        const paidPayments = paymentData.filter(p => p.status === 'paid');
        const pendingPayments = paymentData.filter(p => p.status === 'pending');

        return {
            totalPayments: paymentData.length,
            totalAmount: paymentData.reduce((sum, p) => sum + (p.amount || 0), 0),
            totalPaid: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
            totalPending: pendingPayments.reduce((sum, p) => sum + (p.pendingAmount || p.amount || 0), 0),
            paidCount: paidPayments.length,
            pendingCount: pendingPayments.length,
            collectionRate: paymentData.length > 0
                ? Math.round((paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) /
                    paymentData.reduce((sum, p) => sum + (p.amount || 0), 0)) * 100)
                : 0,
        };
    };

    const statistics = calculateStatistics();

    // Get report title based on report type
    const getReportTitle = () => {
        const typeMap = {
            'all': 'Complete Payment Report',
            'pending': 'Pending Payments Report',
            'paid': 'Paid Payments Report'
        };
        return typeMap[reportType] || 'Payment Report';
    };

    // Get date range text
    const getDateRangeText = () => {
        if (filters.startDate && filters.toDate) {
            return `${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`;
        }
        return 'All Time';
    };

    // Calculate days until due or overdue - return empty to hide
    const getDueDateStatus = (payment) => {
        return ''; // Always return empty to hide status
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div
                id="payment-report-to-print"
                className="bg-white mx-auto"
                style={{
                    width: '277mm',
                    minHeight: '190mm',
                    height: 'auto',
                }}
            >
                {/* Header Section */}
                <div className="pb-2 mb-2" style={{ padding: '0' }}>
                    <div className="flex justify-between items-start" style={{ width: '100%' }}>
                        <div className="flex items-center">
                            {companyInfo.logoPreview && (
                                <img
                                    src={companyInfo.logoPreview}
                                    alt="Company Logo"
                                    crossOrigin="anonymous"
                                    style={{
                                        maxHeight: '35px',
                                        marginRight: '10px',
                                    }}
                                />
                            )}
                            <div>
                                <h1 className="font-bold text-gray-800" style={{ fontSize: '14pt', lineHeight: '1.1', padding: '2px' }}>
                                    {companyInfo.companyName}
                                </h1>
                                <p className="text-gray-600" style={{ fontSize: '9pt', lineHeight: '1.1', padding: '1px' }}>
                                    {companyInfo.companyAddressOne}
                                    {companyInfo.companyAddressTwo && `, ${companyInfo.companyAddressTwo}`}
                                </p>
                                <p className="text-gray-500" style={{ fontSize: '8pt', lineHeight: '1.1', padding: '1px' }}>
                                    Internet Service Provider • Billing & Payment System
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-blue-800 uppercase" style={{ fontSize: '12pt', lineHeight: '1.1', padding: '1px' }}>
                                {getReportTitle()}
                            </h2>
                            <p className="text-gray-600" style={{ fontSize: '9pt', lineHeight: '1.1', padding: '1px' }}>
                                {getDateRangeText()}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '8pt', lineHeight: '1.1', padding: '1px' }}>
                                Generated: {moment().format('DD/MM/YY HH:mm')}
                            </p>
                        </div>
                    </div>
                </div>
                <br></br>

                {/* Payment Table */}
                <div style={{ width: '100%' }}>
                    <table
                        className="border-collapse border border-gray-300"
                        style={{
                            width: '100%',
                            tableLayout: 'fixed',
                            fontSize: '8pt',
                            lineHeight: '1.2',
                            margin: '0',
                            padding: '0',
                        }}
                    >
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '5%' }}>
                                    #
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '20%' }}>
                                    Customer Details
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '18%' }}>
                                    Plan & Connection
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Invoice
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>
                                    Amount
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '15%' }}>
                                    Due Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Payment Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData.map((payment, index) => {
                                const dueDateStatus = getDueDateStatus(payment);

                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '8pt' }}>{payment.clientName}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>ID: {payment.customerId || payment.clientId}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>{payment.clientEmail}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>{payment.clientPhone}</div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: '600', fontSize: '8pt' }}>{payment.planName}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>
                                                <span className={getConnectionTypeColor(payment.connectionType)}>
                                                    {payment.connectionType}
                                                </span>
                                                {' • '}
                                                {payment.billingCycle}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: '600', fontSize: '8pt', color: '#2563eb' }}>
                                                {payment.invoiceNumber}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>
                                                {payment.paymentId}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '8pt' }}>{formatCurrency(payment.amount)}</div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt', fontWeight: '600' }}>{formatDate(payment.dueDate)}</div>
                                            <div>{dueDateStatus}</div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt' }}>{formatDate(payment.paymentDate)}</div>
                                        </td>
                                        {/* STATUS COLUMN FIXED - changed align-top to align-middle */}
                                        <td className="border border-gray-300 align-middle p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            <span className={`font-medium ${getStatusColorClass(payment.status)}`} style={{ lineHeight: '1' }}>
                                                {getStatusText(payment.status)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-gray-300 text-center">
                    <p className="text-gray-500" style={{ fontSize: '8pt' }}>
                        Computer generated report • {moment().format('DD/MM/YY HH:mm')} •
                        Total Records: {paymentData.length} •
                        Report Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)} •
                        Collection Rate: {statistics.collectionRate}%
                    </p>
                    <p className="text-gray-400" style={{ fontSize: '7pt' }}>
                        ConnectNet Internet Service Provider • Billing Department • GST: {companyInfo.companyGstNo || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-print-none mt-6 flex justify-center gap-4">
                <button onClick={handleBack} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                    ← Back
                </button>
                <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    🖨️ Print
                </button>
            </div>

            <style jsx>{`
                @media print {
                    /* Reset all margins and padding */
                    body,
                    html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Hide everything except the print content */
                    body * {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    #payment-report-to-print,
                    #payment-report-to-print * {
                        visibility: visible;
                    }

                    #payment-report-to-print {
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 277mm !important;
                        min-height: 190mm !important;
                        height: auto !important;
                        margin: 0 auto !important;
                        padding: 5mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        overflow: visible !important;
                        page-break-after: always;
                    }

                    /* Hide navigation and other elements */
                    .d-print-none,
                    header,
                    nav,
                    .navbar,
                    .sidebar,
                    .action-buttons {
                        display: none !important;
                    }

                    /* Ensure table fits properly */
                    table {
                        width: 100% !important;
                        table-layout: fixed !important;
                        border-collapse: collapse !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                    }

                    th,
                    td {
                        padding: 2px 3px !important;
                        border: 0.5px solid #000 !important;
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                        margin: 0 !important;
                    }

                    /* Page setup for A4 landscape */
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }

                    /* Force colors to print */
                    @media print and (color) {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                    }

                    /* Allow page breaks inside table rows if needed */
                    tr {
                        page-break-inside: auto !important;
                        break-inside: auto !important;
                    }

                    thead {
                        display: table-header-group !important;
                    }

                    tbody {
                        display: table-row-group !important;
                    }

                    /* Ensure proper text wrapping */
                    th,
                    td {
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                        hyphens: auto !important;
                    }

                    /* Allow multiple pages */
                    #payment-report-to-print {
                        page-break-inside: auto;
                    }

                    table {
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    /* Status colors for print */
                    .text-green-600,
                    .text-green-700 {
                        color: #059669 !important;
                    }
                    .text-blue-600,
                    .text-blue-700 {
                        color: #2563eb !important;
                    }
                    .text-yellow-600,
                    .text-yellow-700 {
                        color: #d97706 !important;
                    }
                    .text-red-600,
                    .text-red-700 {
                        color: #dc2626 !important;
                    }
                    .text-orange-600 {
                        color: #ea580c !important;
                    }
                    .text-purple-600 {
                        color: #7c3aed !important;
                    }
                    .text-gray-600 {
                        color: #4b5563 !important;
                    }
                    .text-gray-500 {
                        color: #6b7280 !important;
                    }
                    .text-gray-400 {
                        color: #9ca3af !important;
                    }
                }

                /* Screen styles */
                @media screen {
                    #payment-report-to-print {
                        padding: 15px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                    }

                    /* Better spacing for screen view */
                    #payment-report-to-print > div:first-child {
                        margin-bottom: 10px;
                    }

                    /* Table styling for screen */
                    table {
                        font-size: 8pt;
                    }

                    th,
                    td {
                        padding: 3px 4px;
                        font-size: 8pt;
                    }

                    /* Ensure proper text wrapping in table cells */
                    .align-top {
                        vertical-align: top;
                    }

                    /* Better table cell text handling */
                    td {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }

                    /* Force table to use all available space */
                    table {
                        border-spacing: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Index;