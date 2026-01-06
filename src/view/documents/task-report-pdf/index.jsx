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

    const [taskData, setTaskData] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});
    const [filters, setFilters] = useState({});
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [reportType, setReportType] = useState('tasks'); // 'tasks' or 'pending-late'

    const { getCompanySuccess, companyData, getCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,
        errorMessage: state.ComapnySlice.errorMessage,
    }));

    useEffect(() => {
        if (location.state?.filteredData) {
            setTaskData(location.state.filteredData);
        }
        if (location.state?.filters) {
            setFilters(location.state.filters);
        }
        if (location.state?.showDateFilter) {
            setShowDateFilter(location.state.showDateFilter);
        }
        if (location.state?.reportType) {
            setReportType(location.state.reportType);
        }
        console.log('location.state');
        console.log(location.state);
    }, [location.state]);

    useEffect(() => {
        dispatch(getCompany());
    }, [dispatch]);

    useEffect(() => {
        if (getCompanySuccess && companyData?.data?.[0]) {
            const companyDataItem = companyData.data[0];
            setCompanyInfo({
                companyName: companyDataItem?.companyName || 'Task Management System',
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

    // Calculate statistics based on report type
    const calculateStatistics = () => {
        const stats = {
            totalTasks: taskData.length,
            completedTasks: taskData.filter((t) => t.status === 'completed').length,
            inProgressTasks: taskData.filter((t) => t.status === 'in-progress').length,
            pendingTasks: taskData.filter((t) => t.status === 'pending').length,
            highPriorityTasks: taskData.filter((t) => t.priority === 'High' || t.priority === 'Urgent').length,
            avgProgress: taskData.length > 0 ? Math.round(taskData.reduce((sum, t) => sum + t.progress, 0) / taskData.length) : 0,
            totalChecklistItems: taskData.reduce((sum, t) => sum + (t.totalChecklists || 0), 0),
            completedChecklistItems: taskData.reduce((sum, t) => sum + (t.completedChecklists || 0), 0),
        };

        // Additional stats for pending-late report
        if (reportType === 'pending-late') {
            stats.lateTasks = taskData.filter((t) => t.isLate).length;
            stats.overdueTasks = taskData.filter((t) => t.overdueDays > 0).length;
            stats.avgOverdueDays =
                taskData.filter((t) => t.overdueDays > 0).length > 0
                    ? Math.round(taskData.filter((t) => t.overdueDays > 0).reduce((sum, t) => sum + t.overdueDays, 0) / taskData.filter((t) => t.overdueDays > 0).length)
                    : 0;
        }

        return stats;
    };

    const statistics = calculateStatistics();

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return moment(date).format('DD/MM/YYYY');
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in-progress':
                return 'text-blue-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityColorClass = (priority) => {
        switch (priority) {
            case 'Urgent':
                return 'text-red-600';
            case 'High':
                return 'text-orange-600';
            case 'Medium':
                return 'text-blue-600';
            case 'Low':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const getProgressColor = (progress) => {
        if (progress === 100) return '#10b981';
        if (progress >= 75) return '#3b82f6';
        if (progress >= 50) return '#f59e0b';
        if (progress >= 25) return '#ef4444';
        return '#9ca3af';
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Calculate checklist completion percentage
    const getChecklistCompletion = (task) => {
        if (task.totalChecklists === 0) return 'No checklist';
        const percentage = (task.completedChecklists / task.totalChecklists) * 100;
        return `${task.completedChecklists}/${task.totalChecklists} (${Math.round(percentage)}%)`;
    };

    // Get report title based on report type
    const getReportTitle = () => {
        if (reportType === 'pending-late') {
            const subType = taskData.length > 0 && taskData[0]?.status === 'completed' ? 'Late Completion' : 'Pending Tasks';
            return `${subType} Report`;
        }
        return 'Task Management Report';
    };

    // Get date range text
    const getDateRangeText = () => {
        if (showDateFilter && filters.startDate && filters.toDate) {
            return `${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`;
        }
        return 'All Time';
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div
                id="task-report-to-print"
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
                                <h1 className="font-bold text-gray-800" style={{ fontSize: '14pt', lineHeight: '1.1' }}>
                                    {companyInfo.companyName}
                                </h1>
                                <p className="text-gray-600" style={{ fontSize: '9pt', lineHeight: '1.1' }}>
                                    {companyInfo.companyAddressOne}
                                    {companyInfo.companyAddressTwo && `, ${companyInfo.companyAddressTwo}`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-blue-800 uppercase" style={{ fontSize: '12pt', lineHeight: '1.1' }}>
                                {getReportTitle()}
                            </h2>
                            <p className="text-gray-600" style={{ fontSize: '9pt', lineHeight: '1.1' }}>
                                {getDateRangeText()}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '8pt', lineHeight: '1.1' }}>
                                Generated: {moment().format('DD/MM/YY HH:mm')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Task Table */}
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
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '3%' }}>
                                    #
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '14%' }}>
                                    Task Name
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '9%' }}>
                                    Category
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '11%' }}>
                                    Assigned To
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '9%' }}>
                                    Client
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '7%' }}>
                                    Status
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '10%' }}>
                                    Progress
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '9%' }}>
                                    Checklist
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '8%' }}>
                                    Start Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '8%' }}>
                                    Due Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '8%' }}>
                                    Completion Date
                                </th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '6%' }}>
                                    Days
                                </th>
                                {reportType === 'pending-late' && (
                                    <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '8%' }}>
                                        Overdue
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {taskData.map((task, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                        {index + 1}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '8pt' }}>{task.name}</div>
                                        <div style={{ fontSize: '7pt', color: '#666' }}>{task.remarks}</div>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        {task.category || 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        {task.assignedTo}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        {task.client || 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <span className={`font-medium ${getStatusColorClass(task.status)}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div
                                                style={{
                                                    width: '35px',
                                                    height: '6px',
                                                    backgroundColor: '#e5e7eb',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${task.progress}%`,
                                                        height: '100%',
                                                        backgroundColor: getProgressColor(task.progress),
                                                        borderRadius: '3px',
                                                    }}
                                                ></div>
                                            </div>
                                            <span style={{ fontSize: '7pt', fontWeight: '600' }}>{task.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ fontSize: '8pt' }}>{getChecklistCompletion(task)}</div>
                                        {task.checklists && task.checklists.length > 0 && (
                                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                                {task.checklists.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                width: '4px',
                                                                height: '4px',
                                                                backgroundColor: item.completed ? '#10b981' : '#9ca3af',
                                                                borderRadius: '50%',
                                                                marginRight: '2px',
                                                            }}
                                                        ></span>
                                                        <span
                                                            style={{
                                                                textDecoration: item.completed ? 'line-through' : 'none',
                                                                opacity: item.completed ? 0.7 : 1,
                                                            }}
                                                        >
                                                            {item.text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word', fontSize: '8pt' }}>
                                        {formatDate(task.startDate)}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ fontSize: '8pt' }}>{formatDate(task.dueDate)}</div>
                                        {task.priority && <div style={{ fontSize: '7pt', color: getPriorityColorClass(task.priority).replace('text-', '').replace('-600', '') }}></div>}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word', fontSize: '8pt' }}>
                                        {task.completionDate ? formatDate(task.completionDate) : 'Not Completed'}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word', fontSize: '8pt' }}>
                                        {(() => {
                                            if (task.status === 'completed') {
                                                return <span className="font-medium text-green-700">{task.totalDaysToComplete || 1} days</span>;
                                            } else if (task.status === 'in-progress' || task.status === 'pending') {
                                                const startDateStr = task.startDate || task.dueDate;
                                                if (!startDateStr) return 'N/A';

                                                const startDate = moment(startDateStr);
                                                const currentDate = moment();
                                                const runningDays = currentDate.diff(startDate, 'days') + 1;

                                                return <span className="font-medium">{runningDays} days</span>;
                                            } else {
                                                return <span className="text-gray-500">-</span>;
                                            }
                                        })()}
                                    </td>
                                    {reportType === 'pending-late' && (
                                        <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word', fontSize: '8pt' }}>
                                            {task.overdueDays > 0 ? (
                                                <span className="font-semibold text-red-600">
                                                    {task.overdueDays} day{task.overdueDays !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-green-600">On time</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Additional Statistics for Pending-Late Report */}
                {reportType === 'pending-late' && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200" style={{ fontSize: '9pt' }}>
                        <h3 className="font-bold text-gray-800 mb-2" style={{ fontSize: '10pt' }}>
                            Performance Metrics
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="text-center">
                                <div className="font-bold text-red-700" style={{ fontSize: '10pt' }}>
                                    {statistics.lateTasks || 0}
                                </div>
                                <div className="text-gray-600">Late Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-orange-700" style={{ fontSize: '10pt' }}>
                                    {statistics.overdueTasks || 0}
                                </div>
                                <div className="text-gray-600">Overdue</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-yellow-700" style={{ fontSize: '10pt' }}>
                                    {statistics.avgOverdueDays || 0}
                                </div>
                                <div className="text-gray-600">Avg Overdue Days</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-purple-700" style={{ fontSize: '10pt' }}>
                                    {statistics.highPriorityTasks}
                                </div>
                                <div className="text-gray-600">High Priority</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-gray-300 text-center">
                    <p className="text-gray-500" style={{ fontSize: '8pt' }}>
                        Computer generated report • {moment().format('DD/MM/YY HH:mm')} • Total Tasks: {taskData.length} • Avg Progress: {statistics.avgProgress}% • Checklist Completion:{' '}
                        {statistics.totalChecklistItems > 0 ? `${Math.round((statistics.completedChecklistItems / statistics.totalChecklistItems) * 100)}%` : 'N/A'}
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

                    #task-report-to-print,
                    #task-report-to-print * {
                        visibility: visible;
                    }

                    #task-report-to-print {
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
                    #task-report-to-print {
                        page-break-inside: auto;
                    }

                    table {
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    /* Status and Priority colors for print */
                    .text-green-600 {
                        color: #059669 !important;
                    }
                    .text-blue-600 {
                        color: #2563eb !important;
                    }
                    .text-yellow-600 {
                        color: #d97706 !important;
                    }
                    .text-red-600 {
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
                }

                /* Screen styles */
                @media screen {
                    #task-report-to-print {
                        padding: 15px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                    }

                    /* Better spacing for screen view */
                    #task-report-to-print > div:first-child {
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

                    /* Progress bar container */
                    td:nth-child(7) > div {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Index;
