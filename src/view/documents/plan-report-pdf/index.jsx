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
    const [summaryData, setSummaryData] = useState(null);
    const [insightsData, setInsightsData] = useState(null);
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
        if (location.state?.summaryData) {
            setSummaryData(location.state.summaryData);
        }
        if (location.state?.insightsData) {
            setInsightsData(location.state.insightsData);
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

    // Calculate statistics from plan data
    const calculateStatistics = (data) => {
        const activeCount = data.filter(p => p.connectionStatus === 'active').length;
        const expiringSoonCount = data.filter(p => p.connectionStatus === 'expiring_soon').length;
        const expiredCount = data.filter(p => p.connectionStatus === 'expired').length;
        const totalRevenue = data.reduce((sum, plan) => sum + (plan.planPrice || 0), 0);
        
        setMetrics({
            totalSubscriptions: data.length,
            activeCount,
            expiringSoonCount,
            expiredCount,
            totalMonthlyRevenue: totalRevenue,
            averageDaysRemaining: data.length > 0 
                ? Math.round(data.reduce((sum, p) => sum + (p.daysRemaining || 0), 0) / data.length)
                : 0,
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

    const getStatusColorClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-600';
            case 'expired':
                return 'text-red-600';
            case 'expiring_soon':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusText = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'expiring_soon') {
            return 'Expiring Soon';
        } else if (statusLower === 'active') {
            return 'Active';
        } else if (statusLower === 'expired') {
            return 'Expired';
        } else {
            return status || 'Unknown';
        }
    };

    const getPlanColor = (planPrice) => {
        const price = parseFloat(planPrice) || 0;
        if (price <= 1000) return '#10b981';
        if (price <= 2000) return '#3b82f6';
        if (price <= 3000) return '#8b5cf6';
        if (price <= 4000) return '#ff6d00';
        return '#6200ea';
    };

    const getStatusIndicator = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return '●';
            case 'expired':
                return '■';
            case 'expiring_soon':
                return '▲';
            default:
                return '○';
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
        return 'ISP PLAN EXPIRY REPORT';
    };

    // Get subtitle
    const getReportSubtitle = () => {
        if (filters.selectedAccountStatus?.value) {
            return `Status: ${filters.selectedAccountStatus.label}`;
        }
        if (filters.selectedPlan?.value) {
            return `Plan: ${filters.selectedPlan.label}`;
        }
        return 'All Plan Subscriptions';
    };

    // Get days remaining text with color
    const getDaysRemainingText = (days) => {
        if (days < 0) {
            return { text: `Expired ${Math.abs(days)} days ago`, color: '#dc2626' };
        } else if (days === 0) {
            return { text: 'Expires Today', color: '#ea580c' };
        } else if (days <= 7) {
            return { text: `${days} days`, color: '#d97706' };
        } else {
            return { text: `${days} days`, color: '#059669' };
        }
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
                                        maxHeight: '40px',
                                        marginRight: '12px',
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
                                    Internet Service Provider • Plan Expiry Monitoring System
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-blue-800 uppercase" style={{ fontSize: '16pt', lineHeight: '1.1', padding: '1px' }}>
                                {getReportTitle()}
                            </h2>
                            <p className="text-gray-600" style={{ fontSize: '10pt', lineHeight: '1.1', padding: '1px' }}>
                                {getReportSubtitle()}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '8pt', lineHeight: '1.1', padding: '1px' }}>
                                Generated: {moment().format('DD/MM/YYYY HH:mm')}
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
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '15%' }}>
                                    Customer Details
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Subscription ID
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '14%' }}>
                                    Plan Details
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Expiry Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Days Remaining
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>
                                    Status
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>
                                    Account State
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '13%' }}>
                                    Contact & Area
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {planData.map((plan, index) => {
                                const daysRemainingInfo = getDaysRemainingText(plan.daysRemaining);
                                const planColor = getPlanColor(plan.planPrice);

                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '8pt' }}>{plan.customerName}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>ID: {plan.customerId}</div>
                                            <div style={{ fontSize: '7pt', color: '#666' }}>
                                                Activation: {formatDate(plan.activationDate)}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontWeight: '600', fontSize: '8pt', color: '#2563eb' }}>
                                                {plan.subscriptionId}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ 
                                                fontWeight: '600', 
                                                fontSize: '8pt', 
                                                color: planColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <div style={{ 
                                                    width: '6px', 
                                                    height: '6px', 
                                                    backgroundColor: planColor, 
                                                    borderRadius: '50%',
                                                    display: 'inline-block'
                                                }}></div>
                                                {plan.planName}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                                {plan.speed}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                                Data: {plan.dataLimit}
                                            </div>
                                            <div style={{ 
                                                fontSize: '7pt', 
                                                color: '#666', 
                                                fontWeight: '600',
                                                marginTop: '2px'
                                            }}>
                                                {formatCurrency(plan.planPrice)}/month
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt', fontWeight: '600' }}>
                                                {formatDate(plan.expiryDate)}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ 
                                                fontSize: '8pt', 
                                                fontWeight: '600',
                                                color: daysRemainingInfo.color
                                            }}>
                                                {daysRemainingInfo.text}
                                            </div>
                                            {plan.daysRemaining < 0 && (
                                                <div style={{ 
                                                    fontSize: '7pt', 
                                                    color: '#dc2626',
                                                    marginTop: '2px'
                                                }}>
                                                    Action Required
                                                </div>
                                            )}
                                            {plan.daysRemaining <= 7 && plan.daysRemaining >= 0 && (
                                                <div style={{ 
                                                    fontSize: '7pt', 
                                                    color: '#d97706',
                                                    marginTop: '2px'
                                                }}>
                                                    Urgent Renewal
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 align-middle p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '4px',
                                                fontSize: '8pt',
                                                color: getStatusColorClass(plan.connectionStatus).replace('text-', '')
                                            }}>
                                                <span style={{ fontSize: '10pt' }}>
                                                    {getStatusIndicator(plan.connectionStatus)}
                                                </span>
                                                <span style={{ fontWeight: '600' }}>
                                                    {getStatusText(plan.connectionStatus)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-middle p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ 
                                                fontSize: '8pt',
                                                fontWeight: plan.accountState === 'Active' ? '600' : 'normal',
                                                color: plan.accountState === 'Active' ? '#059669' : '#dc2626'
                                            }}>
                                                {plan.accountState || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                            <div style={{ fontSize: '8pt', color: '#666' }}>
                                                📞 {plan.contactNumber}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                                📧 {plan.email || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                                📍 {plan.area || 'General'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Report Summary Section */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded" style={{ fontSize: '9pt' }}>
                    <h3 className="font-bold text-gray-800 mb-2" style={{ fontSize: '10pt' }}>REPORT SUMMARY</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="font-medium text-gray-700">Total Subscriptions</div>
                            <div className="font-bold text-blue-800 text-lg">{metrics.totalSubscriptions || 0}</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700">Active Connections</div>
                            <div className="font-bold text-green-800 text-lg">{metrics.activeCount || 0}</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700">Expiring Soon</div>
                            <div className="font-bold text-yellow-800 text-lg">{metrics.expiringSoonCount || 0}</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700">Expired Connections</div>
                            <div className="font-bold text-red-800 text-lg">{metrics.expiredCount || 0}</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700">Total Monthly Revenue</div>
                            <div className="font-bold text-purple-800 text-lg">
                                {formatCurrency(metrics.totalMonthlyRevenue || 0)}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700">Avg. Days Remaining</div>
                            <div className="font-bold text-blue-800 text-lg">
                                {metrics.averageDaysRemaining || 0} days
                            </div>
                        </div>
                    </div>

                    {/* Additional Insights if available */}
                    {insightsData && (
                        <div className="mt-4 pt-3 border-t border-gray-300">
                            <h4 className="font-bold text-gray-700 mb-1" style={{ fontSize: '9pt' }}>INSIGHTS</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Total Potential Revenue:</span>
                                    <span className="font-bold text-gray-800 ml-2">₹{insightsData.total_potential_revenue || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Active Revenue:</span>
                                    <span className="font-bold text-green-700 ml-2">₹{insightsData.active_revenue || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Revenue at Risk:</span>
                                    <span className="font-bold text-yellow-700 ml-2">₹{insightsData.potential_revenue_at_risk || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Lost Revenue:</span>
                                    <span className="font-bold text-red-700 ml-2">₹{insightsData.lost_revenue || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-gray-300 text-center">
                    <p className="text-gray-500" style={{ fontSize: '8pt' }}>
                        Computer generated report • Generated on: {moment().format('DD/MM/YYYY HH:mm')} • 
                        Total Plans: {planData.length} • 
                        Active: {metrics.activeCount || 0} • 
                        Expiring Soon: {metrics.expiringSoonCount || 0} • 
                        Expired: {metrics.expiredCount || 0}
                    </p>
                    <p className="text-gray-400" style={{ fontSize: '7pt' }}>
                        {companyInfo.companyName} • Plan Expiry Monitoring System • 
                        {companyInfo.companyMobile && ` Contact: ${companyInfo.companyMobile}`} • 
                        {companyInfo.companyGstNo && ` GST: ${companyInfo.companyGstNo}`}
                    </p>
                    <p className="text-gray-400" style={{ fontSize: '7pt' }}>
                        Note: This report shows plan expiry status as of generation time. For real-time updates, please check the online system.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-print-none mt-6 flex justify-center gap-4">
                <button 
                    onClick={handleBack} 
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Back to Report
                </button>
                <button 
                    onClick={handlePrint} 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    🖨️ Print Report
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
                    .grid-cols-4,
                    .grid-cols-3,
                    .grid-cols-2 {
                        display: grid !important;
                    }

                    .grid-cols-4 {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    }

                    .grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }

                    .grid-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
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

                    /* Colors for print */
                    .text-blue-800 { color: #1e40af !important; }
                    .text-green-800 { color: #065f46 !important; }
                    .text-yellow-800 { color: #92400e !important; }
                    .text-red-800 { color: #991b1b !important; }
                    .text-purple-800 { color: #5b21b6 !important; }
                    .text-gray-800 { color: #1f2937 !important; }
                    .text-gray-700 { color: #374151 !important; }
                    .text-gray-600 { color: #4b5563 !important; }
                    .text-gray-500 { color: #6b7280 !important; }
                    .text-gray-400 { color: #9ca3af !important; }

                    .bg-blue-50 { background-color: #eff6ff !important; }
                    .bg-green-50 { background-color: #f0fdf4 !important; }
                    .bg-yellow-50 { background-color: #fefce8 !important; }
                    .bg-red-50 { background-color: #fef2f2 !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }

                    .border-blue-200 { border-color: #bfdbfe !important; }
                    .border-green-200 { border-color: #bbf7d0 !important; }
                    .border-yellow-200 { border-color: #fde68a !important; }
                    .border-red-200 { border-color: #fecaca !important; }
                    .border-gray-300 { border-color: #d1d5db !important; }
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
                }
            `}</style>
        </div>
    );
};

export default Index;