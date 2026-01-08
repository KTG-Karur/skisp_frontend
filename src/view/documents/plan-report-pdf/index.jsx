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

    const [planData, setPlanData] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});
    const [filters, setFilters] = useState({});
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [metrics, setMetrics] = useState({});

    const { getCompanySuccess, companyData, getCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,
        errorMessage: state.ComapnySlice.errorMessage,
    }));

    useEffect(() => {
        if (location.state?.filteredData) {
            const data = location.state.filteredData;
            setPlanData(data);
            calculateStatistics(data);
        }
        if (location.state?.filters) {
            setFilters(location.state.filters);
        }
        if (location.state?.showDateFilter !== undefined) {
            setShowDateFilter(location.state.showDateFilter);
        }
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

    // Calculate statistics
    const calculateStatistics = (data) => {
        const activeConnections = data.filter(p => p.connectionStatus === 'active').length;
        const paidSubscriptions = data.filter(p => p.paymentStatus === 'paid').length;
        const totalRevenue = data.reduce((sum, plan) => sum + (plan.planPrice || 0), 0);
        const avgBandwidthUsage = data.length > 0 
            ? Math.round(data.reduce((sum, p) => sum + (p.usagePercentage || 0), 0) / data.length)
            : 0;

        setMetrics({
            totalSubscriptions: data.length,
            activeConnections,
            paidSubscriptions,
            totalMonthlyRevenue: totalRevenue,
            averageBandwidthUsage: avgBandwidthUsage,
        });
    };

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
        if (!date) return 'N/A';
        return moment(date).format('DD/MM/YYYY');
    };

    const getStatusColorClass = (status, type = 'payment') => {
        if (type === 'payment') {
            return status?.toLowerCase() === 'paid' ? 'text-green-600' : 'text-yellow-600';
        } else {
            return status?.toLowerCase() === 'active' ? 'text-blue-600' : 'text-gray-600';
        }
    };

    const getStatusText = (status, type = 'payment') => {
        const statusLower = status?.toLowerCase();
        
        if (type === 'payment') {
            if (statusLower === 'paid') {
                return 'Paid';
            } else {
                return 'Pending';
            }
        } else {
            if (statusLower === 'active') {
                return 'Active';
            } else if (statusLower === 'inactive') {
                return 'Inactive';
            } else if (statusLower === 'suspended') {
                return 'Suspended';
            } else {
                return status || 'Unknown';
            }
        }
    };

    const getPlanColor = (planPrice) => {
        switch (planPrice) {
            case 599:
                return 'text-green-600';
            case 799:
                return 'text-blue-600';
            case 1199:
                return 'text-purple-600';
            case 2999:
                return 'text-orange-600';
            case 4999:
                return 'text-pink-600';
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

    // Get report title
    const getReportTitle = () => {
        return 'ISP Plan Management Report';
    };

    // Get date range text
    const getDateRangeText = () => {
        if (showDateFilter && filters.startDate && filters.toDate) {
            return `${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`;
        }
        return 'All Time';
    };

    // Get renewal status
    const getRenewalStatus = (plan) => {
        if (!plan.renewalDate) return '';
        
        const renewalDate = moment(plan.renewalDate);
        const today = moment();
        const daysDiff = renewalDate.diff(today, 'days');
        
        if (daysDiff < 0) {
            return `(${Math.abs(daysDiff)} days overdue)`;
        } else if (daysDiff === 0) {
            return '(Due today)';
        } else if (daysDiff <= 7) {
            return `(in ${daysDiff} days)`;
        }
        return '';
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div
                id="plan-report-to-print"
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
                                    Internet Service Provider • Plan Management System
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

                {/* Plan Table */}
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
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '4%' }}>
                                    #
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '18%' }}>
                                    Customer Details
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>
                                    Subscription ID
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '15%' }}>
                                    Plan Details
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Activation Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>
                                    Renewal Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Payment Status
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Connection Status
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '9%' }}>
                                    Bandwidth Usage
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {planData.map((plan, index) => {
                                const renewalStatus = getRenewalStatus(plan);

                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '8pt' }}>{plan.customerName}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>ID: {plan.customerId}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>{plan.contactNumber}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>{plan.area}</div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: '600', fontSize: '8pt', color: '#2563eb' }}>
                                                {plan.subscriptionId}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: '600', fontSize: '8pt' }} className={getPlanColor(plan.planPrice)}>
                                                {plan.planName}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>
                                                {plan.speed} • {plan.dataLimit}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666', fontWeight: '600' }}>
                                                {formatCurrency(plan.planPrice)}/month
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt' }}>{formatDate(plan.activationDate)}</div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt', fontWeight: renewalStatus ? '600' : 'normal' }}>
                                                {formatDate(plan.renewalDate)}
                                            </div>
                                            {renewalStatus && (
                                                <div style={{ 
                                                    fontSize: '7pt', 
                                                    color: renewalStatus.includes('overdue') ? '#dc2626' : 
                                                           renewalStatus.includes('Due today') ? '#ea580c' : 
                                                           renewalStatus.includes('in') ? '#d97706' : '#666'
                                                }}>
                                                    {renewalStatus}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 align-middle p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            <span className={`font-medium ${getStatusColorClass(plan.paymentStatus, 'payment')}`} style={{ lineHeight: '1' }}>
                                                {getStatusText(plan.paymentStatus, 'payment')}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 align-middle p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            <span className={`font-medium ${getStatusColorClass(plan.connectionStatus, 'connection')}`} style={{ lineHeight: '1' }}>
                                                {getStatusText(plan.connectionStatus, 'connection')}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ 
                                                    flex: 1, 
                                                    height: '6px', 
                                                    backgroundColor: '#e5e7eb', 
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div 
                                                        style={{ 
                                                            height: '100%', 
                                                            backgroundColor: plan.usagePercentage >= 90 ? '#ef4444' : 
                                                                          plan.usagePercentage >= 70 ? '#f59e0b' : 
                                                                          plan.usagePercentage >= 40 ? '#10b981' : '#3b82f6',
                                                            width: `${Math.min(plan.usagePercentage, 100)}%`,
                                                            borderRadius: '3px'
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ 
                                                    fontSize: '7pt', 
                                                    fontWeight: '600',
                                                    color: plan.usagePercentage >= 90 ? '#ef4444' : 
                                                          plan.usagePercentage >= 70 ? '#f59e0b' : 
                                                          plan.usagePercentage >= 40 ? '#10b981' : '#3b82f6'
                                                }}>
                                                    {plan.usagePercentage}%
                                                </span>
                                            </div>
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
                        Total Plans: {planData.length} •
                        Active: {metrics.activeConnections || 0} •
                        Paid: {metrics.paidSubscriptions || 0} •
                        Revenue: {formatCurrency(metrics.totalMonthlyRevenue || 0)}/month
                    </p>
                    <p className="text-gray-400" style={{ fontSize: '7pt' }}>
                        ConnectNet Internet Service Provider • Plan Management Department • GST: {companyInfo.companyGstNo || 'N/A'}
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

                    #plan-report-to-print,
                    #plan-report-to-print * {
                        visibility: visible;
                    }

                    #plan-report-to-print {
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

                    /* Statistics grid for print */
                    .grid-cols-4 {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
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
                    #plan-report-to-print {
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
                    .text-pink-600 {
                        color: #db2777 !important;
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

                    /* Progress bar colors for print */
                    .bg-red-600 { background-color: #dc2626 !important; }
                    .bg-yellow-600 { background-color: #d97706 !important; }
                    .bg-green-600 { background-color: #059669 !important; }
                    .bg-blue-600 { background-color: #2563eb !important; }
                    .bg-gray-200 { background-color: #e5e7eb !important; }
                    .bg-blue-50 { background-color: #eff6ff !important; }
                    .bg-green-50 { background-color: #f0fdf4 !important; }
                    .bg-purple-50 { background-color: #faf5ff !important; }
                    .bg-orange-50 { background-color: #fff7ed !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .border-blue-200 { border-color: #bfdbfe !important; }
                    .border-green-200 { border-color: #bbf7d0 !important; }
                    .border-purple-200 { border-color: #e9d5ff !important; }
                    .border-orange-200 { border-color: #fed7aa !important; }
                    .border-gray-200 { border-color: #e5e7eb !important; }
                }

                /* Screen styles */
                @media screen {
                    #plan-report-to-print {
                        padding: 15px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                    }

                    /* Better spacing for screen view */
                    #plan-report-to-print > div:first-child {
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

                    /* Statistics cards */
                    .grid-cols-4 {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px;
                        margin-bottom: 16px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Index;