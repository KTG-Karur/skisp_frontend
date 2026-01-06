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
import { getClient, resetClientStatus } from '../../../redux/clientSlice';
import { baseURL } from '../../../api/ApiConfig';
import _ from 'lodash';

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Task Report') : [];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const staffId = localData?.staffId;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Brand colors matching the dashboard
    const brandColorPrimary = '#1d7dbe'; // Primary blue
    const brandColorSecondary = '#f5903a'; // Secondary orange
    const brandColorLight = '#4a9fe4'; // Lighter blue
    const brandColorSecondaryLight = '#ffac5c'; // Lighter orange

    const { getEmployeeSuccess, getEmployeeFailed, employeeData, clientData, getClientSuccess, getClientFailed, error, loading, getReportSuccess, getReportFailed, reportData } = useSelector(
        (state) => ({
            getReportSuccess: state.ReportSlice.getReportSuccess,
            getReportFailed: state.ReportSlice.getReportFailed,
            error: state.ReportSlice.error,
            loading: state.ReportSlice.loading,
            reportData: state.ReportSlice.reportData,
            getEmployeeSuccess: state.EmployeeSlice.getEmployeeSuccess,
            getEmployeeFailed: state.EmployeeSlice.getEmployeeFailed,
            employeeData: state.EmployeeSlice.employeeData,
            clientData: state.ClientSlice.clientData,
            getClientSuccess: state.ClientSlice.getClientSuccess,
            getClientFailed: state.ClientSlice.getClientFailed,
        })
    );

    // Transform API data to match component format
    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((task, index) => {
            // Extract checklist completion data
            const checklists = task.checklists || [];
            const completedChecklists = checklists.filter((item) => item.completed).length;
            const totalChecklists = checklists.length;

            // Extract assigned staff names
            const staffNames = task.staffDetails?.map((staff) => staff.employeeName) || [];

            // Calculate progress based on checklists
            const progress = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

            // Determine priority text from priorityLevel
            const getPriorityText = (priorityLevel) => {
                switch (priorityLevel?.toLowerCase()) {
                    case 'very-high':
                        return 'Very High';
                    case 'high':
                        return 'High';
                    case 'medium':
                        return 'Medium';
                    case 'low':
                        return 'Low';
                    default:
                        return priorityLevel || 'Medium';
                }
            };

            // Get department from first staff member
            const department = task.staffDetails?.[0]?.departmentName || 'Not specified';

            // Calculate total days to complete if task is completed
            let completionDate = null;
            let totalDaysToComplete = null;

            if (task.completionDate) {
                completionDate = moment(task.completionDate).format('YYYY-MM-DD');
                const startDate = moment(task.startDate || task.dueDate); // Use dueDate if startDate is null
                const completionDateObj = moment(task.completionDate);
                totalDaysToComplete = completionDateObj.diff(startDate, 'days') + 1; // +1 to include start day
            }

            // NEW: Calculate running days for pending/in-progress tasks
            let runningDays = null;
            let remainingDays = null;

            if (task.status === 'pending' || task.status === 'in-progress') {
                // Use current date as the running date
                const currentDate = moment();

                // Calculate running days from startDate (or dueDate if startDate is null)
                const startDate = task.startDate ? moment(task.startDate) : moment(task.dueDate);
                runningDays = currentDate.diff(startDate, 'days') + 1; // +1 to include start day

                // Calculate remaining days until due date
                const dueDate = moment(task.dueDate);
                remainingDays = dueDate.diff(currentDate, 'days');

                // If overdue, show as negative
                if (remainingDays < 0) {
                    remainingDays = Math.abs(remainingDays); // Convert to positive for display
                }
            }

            return {
                id: task.taskId,
                taskId: task.taskId?.substring(0, 8) || `TASK-${index + 1}`,
                name: task.taskName || 'Unnamed Task',
                category: task.category || 'Development',
                client: task.clientName || 'Unknown Client',
                staff: staffNames,
                assignedTo: staffNames.join(', '),
                assignedBy: task.createdBy || 'System',
                startDate: task.startDate ? moment(task.startDate).format('YYYY-MM-DD') : task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
                dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD'),
                completionDate: completionDate,
                checklists: checklists.map((item) => ({
                    id: item.checklistId,
                    text: item.text,
                    completed: item.completed || false,
                })),
                completedChecklists,
                totalChecklists,
                totalDaysToComplete: totalDaysToComplete || 0,
                runningDays: runningDays, // NEW: Running days for pending/in-progress tasks
                remainingDays: remainingDays, // NEW: Remaining days until due date
                remarks: task.description || 'No description provided',
                status: task.status || 'pending',
                priority: getPriorityText(task.priorityLevel),
                progress,
                estimatedHours: 8, // Default value since not in API
                actualHours: 4, // Default value since not in API
                department,
                tags: [task.category || 'General'],
                originalData: task, // Keep original API data for reference
            };
        });
    };

    const [tasks, setTasks] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedEmployee: null,
        selectedClient: null,
        startDate: '',
        toDate: '',
    });

    const [optionListState, setOptionListState] = useState({
        employeeList: [],
        clientList: [],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [showDateFilter, setShowDateFilter] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Development':
                return brandColorPrimary;
            case 'Design':
                return '#8b5cf6';
            case 'Marketing':
                return '#10b981';
            case 'Sales':
                return brandColorSecondary;
            case 'Testing':
                return '#ef4444';
            case 'Finance':
                return '#9333ea';
            case 'HR':
                return '#ec4899';
            case 'Content':
                return '#0ea5e9';
            case 'Operations':
                return '#f59e0b';
            default:
                return brandColorPrimary;
        }
    };

    const taskColumns = [
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
            Header: 'Client',
            accessor: 'client',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            Header: 'Task Name',
            accessor: 'name',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-900">{value}</div>,
        },
        {
            Header: 'Assigned To',
            accessor: 'assignedTo',
            sort: true,
        },
        {
            Header: 'Department',
            accessor: 'department',
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'status',
            sort: true,
            Cell: ({ value }) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>,
        },
        {
            Header: 'Progress',
            accessor: 'progress',
            sort: true,
            Cell: ({ value }) => (
                <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${value}%`,
                                backgroundColor: value === 100 ? '#10b981' : brandColorPrimary,
                            }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium">{value}%</span>
                </div>
            ),
        },
        {
            Header: 'Checklist',
            accessor: 'checklistCount',
            sort: true,
            Cell: ({ row }) => (
                <div className="text-center">
                    <span className="font-medium text-gray-900">
                        {row.original.completedChecklists}/{row.original.totalChecklists}
                    </span>
                </div>
            ),
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-900">{moment(value).format('DD/MM/YYYY')}</div>,
        },
        {
            Header: 'Due Date',
            accessor: 'dueDate',
            sort: true,
            Cell: ({ value, row }) => {
                const dueDate = moment(value);
                const today = moment();
                const daysDiff = dueDate.diff(today, 'days');
                let className = 'font-medium';
                let additionalInfo = '';

                // Add running days info for pending/in-progress tasks
                if (row.original.status === 'pending' || row.original.status === 'in-progress') {
                    if (row.original.runningDays !== null) {
                        additionalInfo = ` (Running: ${row.original.runningDays} day${row.original.runningDays !== 1 ? 's' : ''})`;

                        // Color coding based on remaining days
                        if (row.original.remainingDays !== null) {
                            if (row.original.remainingDays === 0) {
                                additionalInfo += ' - Due today!';
                                className = 'text-orange-600 font-semibold';
                            } else if (row.original.remainingDays < 0) {
                                additionalInfo += ' - Overdue!';
                                className = 'text-red-600 font-semibold';
                            } else if (row.original.remainingDays <= 2) {
                                additionalInfo += ` - ${row.original.remainingDays} day${row.original.remainingDays !== 1 ? 's' : ''} left`;
                                className = 'text-yellow-600 font-semibold';
                            } else {
                                additionalInfo += ` - ${row.original.remainingDays} day${row.original.remainingDays !== 1 ? 's' : ''} left`;
                            }
                        }
                    }
                }

                if (daysDiff < 0) {
                    className = 'text-red-600 font-semibold';
                } else if (daysDiff === 0) {
                    className = 'text-orange-600 font-semibold';
                } else if (daysDiff <= 2) {
                    className = 'text-yellow-600 font-semibold';
                }

                return (
                    <div className={className}>
                        {dueDate.format('DD/MM/YYYY')}
                        {additionalInfo && <span className="text-xs block mt-0.5">{additionalInfo}</span>}
                    </div>
                );
            },
        },
        {
            Header: 'Completion Date',
            accessor: 'completionDate',
            sort: true,
            Cell: ({ value, row }) => {
                if (row.original.status === 'completed' && value) {
                    return <div className="font-medium text-green-600">{moment(value).format('DD/MM/YYYY')}</div>;
                }
                return <div className="text-gray-400">-</div>;
            },
        },
        {
            Header: 'Days to Complete',
            accessor: 'totalDaysToComplete',
            sort: true,
            Cell: ({ value, row }) => {
                if (row.original.status === 'completed' && value > 0) {
                    return (
                        <div className="text-center">
                            <span className="font-medium text-gray-900">
                                {value} day{value !== 1 ? 's' : ''}
                            </span>
                            <div className="text-xs text-gray-500">Completed on: {moment(row.original.completionDate).format('DD/MM/YYYY')}</div>
                        </div>
                    );
                } else if (row.original.status === 'completed' && value === 0) {
                    return (
                        <div className="text-center">
                            <span className="font-medium text-gray-900">Same day</span>
                        </div>
                    );
                } else if (row.original.status === 'pending' || row.original.status === 'in-progress') {
                    // Show running days for pending/in-progress tasks
                    if (row.original.runningDays !== null) {
                        return (
                            <div className="text-center">
                                <span className="font-medium text-gray-900">
                                    {row.original.runningDays} day{row.original.runningDays !== 1 ? 's' : ''}
                                </span>
                                <div className="text-xs text-gray-500">Running</div>
                            </div>
                        );
                    }
                }
                return <div className="text-center text-gray-400">-</div>;
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 100,
            Cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => handleViewDetails(task)}
                            className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="View Task Details"
                            style={{ color: brandColorPrimary }}
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
            const transformedTasks = transformApiData(reportData.data);
            setTasks(transformedTasks);
            setFilteredData(transformedTasks);
        } else {
            setTasks([]);
            setFilteredData([]);
        }

        // Load employees for filter dropdown
        if (employeeData && Array.isArray(employeeData)) {
            const employeeOptions = employeeData.map((emp) => ({
                value: emp.employeeId || emp.id,
                label: emp.employeeName || emp.name,
            }));
            setOptionListState((prev) => ({
                ...prev,
                employeeList: employeeOptions,
            }));
        }

        // Load clients for filter dropdown
        if (clientData) {
            let clientList = [];
            if (Array.isArray(clientData)) {
                clientList = clientData;
            } else if (clientData?.data && Array.isArray(clientData.data)) {
                clientList = clientData.data;
            } else if (clientData?.clients && Array.isArray(clientData.clients)) {
                clientList = clientData.clients;
            }

            const clientOptions = clientList.map((client) => ({
                value: client.clientId || client.id || client.name,
                label: client.clientName || client.name,
            }));

            setOptionListState((prev) => ({
                ...prev,
                clientList: clientOptions,
            }));
        }
    }, [employeeData, clientData, reportData]);

    useEffect(() => {
        if (roleIdforRole !== 'Super Admin' && staffId && optionListState.employeeList.length > 0) {
            const currentUserEmployee = optionListState.employeeList.find((emp) => emp.value === staffId);
            if (currentUserEmployee) {
                setFilters((prev) => ({
                    ...prev,
                    selectedEmployee: currentUserEmployee,
                }));
            }
        }
    }, [roleIdforRole, staffId, optionListState.employeeList]);

    useEffect(() => {
        // Load initial data with default filters
        const initialFilters = {
            isActive: 1,
        };
        dispatch(getReport(initialFilters));
        dispatch(getEmployee());
        dispatch(getClient());
    }, []);

    const buildBackendFilters = () => {
        const backendFilters = {
            isActive: 1,
        };

        if (filters.searchQuery) {
            backendFilters.taskId = filters.searchQuery;
        }

        if (showDateFilter && filters.startDate) {
            backendFilters.fromDate = filters.startDate;
        }

        if (showDateFilter && filters.toDate) {
            backendFilters.toDate = filters.toDate;
        }

        if (filters.selectedEmployee) {
            backendFilters.assignedTo = filters.selectedEmployee.value;
        }

        if (filters.selectedClient) {
            backendFilters.clientId = filters.selectedClient.value;
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
            console.error('Error fetching filtered tasks:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            searchQuery: '',
            selectedEmployee: null,
            selectedClient: null,
            startDate: '',
            toDate: '',
        });
        setAppliedFilters(null);
        setShowDateFilter(false);
        setSearchLoading(false);
        setCurrentPage(0);

        // Fetch all active tasks when clearing filters
        dispatch(getReport({ isActive: 1 }));
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

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTask(null);
    };

    const onDownload = () => {
        const yearMonth = showDateFilter && filters.startDate && filters.toDate ? `${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}` : 'All Time';

        const additionalDetails = `Task Management Report for ${yearMonth}`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY')}`;

        const data = filteredData.map((task, index) => ({
            ['S.No']: index + 1,
            ['Task ID']: task.taskId,
            ['Task Name']: task.name,
            ['Client']: task.client || 'N/A',
            ['Assigned To']: task.assignedTo,
            ['Department']: task.department,
            ['Status']: task.status.charAt(0).toUpperCase() + task.status.slice(1),
            ['Progress']: `${task.progress}%`,
            ['Checklist Completed']: `${task.completedChecklists}/${task.totalChecklists}`,
            ['Start Date']: moment(task.startDate).format('DD/MM/YYYY'),
            ['Due Date']: moment(task.dueDate).format('DD/MM/YYYY'),
            ['Completion Date']: task.completionDate ? moment(task.completionDate).format('DD/MM/YYYY') : '-',
            ['Days to Complete']: task.status === 'completed' && task.totalDaysToComplete > 0 ? `${task.totalDaysToComplete} days` : '-',
            ['Remarks']: task.remarks,
            ['Priority']: task.priority,
        }));

        const header = [
            [additionalDetails],
            [reportGeneratedDate],
            [],
            [
                'S.No',
                'Task ID',
                'Task Name',
                'Client',
                'Assigned To',
                'Department',
                'Status',
                'Progress',
                'Checklist Completed',
                'Start Date',
                'Due Date',
                'Completion Date',
                'Days to Complete',
                'Remarks',
                'Priority',
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        const summaryRows = [
            [],
            ['SUMMARY'],
            ['Total Tasks', filteredData.length],
            ['Completed Tasks', filteredData.filter((t) => t.status === 'completed').length],
            ['In Progress Tasks', filteredData.filter((t) => t.status === 'in-progress').length],
            ['Pending Tasks', filteredData.filter((t) => t.status === 'pending').length],
        ];

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        // Merge header rows
        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 14 } });

        // Merge summary rows
        const summaryStartRow = header.length + rows.length + 1;
        for (let i = 0; i < 5; i++) {
            worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 1 } });
        }

        worksheet['!cols'] = [
            { wch: 8 },
            { wch: 12 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 12 },
            { wch: 10 },
            { wch: 18 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 12 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Report');

        const fileName =
            showDateFilter && filters.startDate && filters.toDate
                ? `Task-Report-${moment(filters.startDate).format('DD-MM-YYYY')}-to-${moment(filters.toDate).format('DD-MM-YYYY')}.xlsx`
                : `Task-Report-All-Time.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/print-task', {
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
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: brandColorPrimary }}></div>
                <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: brandColorSecondary }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: brandColorPrimary }}>
                        Task Management Report
                    </h1>
                    <p className="text-gray-600">Track and analyze task performance across your organization</p>
                </div>

                {/* Search Panel */}
                {showSearch && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <IconSearch className="w-5 h-5" style={{ color: brandColorPrimary }} />
                                Search & Filter Tasks
                            </h2>
                            <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded">
                                ▲ Hide
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-2 lg:col-span-4">
                                    <button
                                        type="button"
                                        onClick={toggleDateFilter}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                            showDateFilter ? 'text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        style={{
                                            backgroundColor: showDateFilter ? brandColorPrimary : '#f9fafb',
                                            borderColor: showDateFilter ? brandColorPrimary : '#e5e7eb',
                                        }}
                                    >
                                        <IconCalendar className="w-4 h-4" />
                                        <span className="font-medium">{showDateFilter ? 'Hide Date Filter' : 'Add Date Filter'}</span>
                                    </button>
                                </div>

                                {showDateFilter && (
                                    <>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{
                                                    '--tw-ring-color': brandColorPrimary,
                                                }}
                                                value={filters.startDate}
                                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                style={{
                                                    '--tw-ring-color': brandColorPrimary,
                                                }}
                                                value={filters.toDate}
                                                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Employee filter - only show for Super Admin */}
                                {roleIdforRole === 'Super Admin' && (
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                        <Select
                                            options={[{ value: '', label: 'All Employee' }, ...optionListState.employeeList]}
                                            value={filters.selectedEmployee}
                                            onChange={(selectedOption) => setFilters({ ...filters, selectedEmployee: selectedOption })}
                                            placeholder="Select Employee"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                )}

                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                    <Select
                                        options={[{ value: '', label: 'All Clients' }, ...optionListState.clientList]}
                                        value={filters.selectedClient}
                                        onChange={(selectedOption) => setFilters({ ...filters, selectedClient: selectedOption })}
                                        placeholder="Select Client"
                                        isSearchable
                                        isClearable
                                        styles={customStyles}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="md:col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <IconSearch className="w-4 h-4" />
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                            '--tw-ring-color': brandColorPrimary,
                                        }}
                                        placeholder="Search by task ID, name, or description..."
                                        value={filters.searchQuery}
                                        onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
                                    >
                                        <IconRefresh className="w-4 h-4" />
                                        <span className="whitespace-nowrap">Clear All</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 sm:px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px] text-sm sm:text-base w-full sm:w-auto"
                                        style={{ backgroundColor: brandColorPrimary }}
                                        disabled={searchLoading || (showDateFilter && (!filters.startDate || !filters.toDate))}
                                    >
                                        {searchLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                <span className="whitespace-nowrap">Searching...</span>
                                            </>
                                        ) : (
                                            <span className="whitespace-nowrap">Search</span>
                                        )}
                                    </button>
                                    {appliedFilters && filteredData.length > 0 && (
                                        <>
                                            {_.includes(accessIds, '5') && (
                                                <button
                                                    type="button"
                                                    onClick={onDownload}
                                                    className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                                                >
                                                    <IconPrinter className="w-4 h-4" />
                                                    <span className="whitespace-nowrap">Export Excel</span>
                                                </button>
                                            )}
                                            {_.includes(accessIds, '9') && (
                                                <button
                                                    type="button"
                                                    onClick={onDownloadPDF}
                                                    className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                                                >
                                                    <IconPrinter className="w-4 h-4" />
                                                    <span className="whitespace-nowrap">Export PDF</span>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {!showSearch && (
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium flex items-center gap-2"
                            style={{ backgroundColor: brandColorPrimary }}
                        >
                            <IconSearch className="w-4 h-4" />
                            Show Search Panel
                        </button>
                    </div>
                )}

                {/* Results Section */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Task Data</h3>
                            <p className="text-gray-500">Please wait while we fetch task information from the server</p>
                        </div>
                    </div>
                ) : searchLoading ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Searching Task Data</h3>
                            <p className="text-gray-500">Please wait while we fetch the task information based on your criteria</p>
                        </div>
                    </div>
                ) : appliedFilters && filteredData.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Task Report Results</h3>
                                    <p className="text-gray-600">
                                        Showing {filteredData.length} tasks
                                        {showDateFilter && filters.startDate && filters.toDate
                                            ? ` from ${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
                                            : ' (All Time)'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <Table
                                columns={taskColumns}
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
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorSecondary}15` }}>
                                <IconSearch className="w-12 h-12" style={{ color: brandColorSecondary }} />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Tasks Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">No tasks match your current search criteria. Try adjusting your filters or search terms.</p>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold"
                                style={{ backgroundColor: brandColorPrimary }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                <IconSearch className="w-12 h-12" style={{ color: brandColorPrimary }} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Task Report Dashboard</h3>
                            <p className="text-gray-600 text-lg max-w-md mb-6">
                                {tasks.length > 0
                                    ? `Ready to search through ${tasks.length} tasks. Use the search filters above to generate detailed reports.`
                                    : 'No task data available. Try loading data first.'}
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold text-lg shadow-lg"
                                style={{ backgroundColor: brandColorSecondary }}
                            >
                                Start Searching
                            </button>
                        </div>
                    </div>
                )}

                {/* Task Details Modal */}
                <ModelViewBox
                    modal={showDetailsModal}
                    modelHeader={`Task Details: ${selectedTask?.taskId || ''}`}
                    setModel={closeDetailsModal}
                    modelSize="max-w-4xl"
                    submitBtnText="Close"
                    loading={false}
                    hideSubmit={true}
                    saveBtn={false}
                >
                    {selectedTask && (
                        <div className="p-4">
                            <div className="mb-4 p-4 rounded-lg border border-gray-200" style={{ backgroundColor: `${brandColorPrimary}05` }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">Task Name:</span> {selectedTask.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Client:</span> {selectedTask.client || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Department:</span> {selectedTask.department}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                                            {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Priority:</span> {selectedTask.priority}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Assigned To:</span> {selectedTask.assignedTo}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Assigned By:</span> {selectedTask.assignedBy}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Start Date:</span> {moment(selectedTask.startDate).format('DD/MM/YYYY')}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Due Date:</span> {moment(selectedTask.dueDate).format('DD/MM/YYYY')}
                                    </div>
                                    {selectedTask.completionDate && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Completion Date:</span> {moment(selectedTask.completionDate).format('DD/MM/YYYY')}
                                        </div>
                                    )}
                                    {selectedTask.totalDaysToComplete > 0 && selectedTask.status === 'completed' && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Days to Complete:</span> {selectedTask.totalDaysToComplete} days
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold text-gray-700">Progress:</span> {selectedTask.progress}%
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Checklists:</span> {selectedTask.completedChecklists}/{selectedTask.totalChecklists} completed
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Estimated Hours:</span> {selectedTask.estimatedHours} hrs
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Actual Hours:</span> {selectedTask.actualHours} hrs
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">{selectedTask.remarks}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Checklists</h4>
                                <div className="space-y-2">
                                    {selectedTask.checklists &&
                                        selectedTask.checklists.map((item) => (
                                            <div key={item.id} className="flex items-center">
                                                <div
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                        item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                                    }`}
                                                >
                                                    {item.completed && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`ml-2 ${item.completed ? 'text-green-600 line-through' : 'text-gray-700'}`}>{item.text}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <span className="font-semibold text-gray-700">Assigned Staff:</span>
                                    <ul className="mt-1 space-y-1">
                                        {selectedTask.staff &&
                                            selectedTask.staff.map((staff, index) => (
                                                <li key={index} className="text-gray-600">
                                                    • {staff}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <span className="font-semibold text-gray-700">Task Summary:</span>
                                    <ul className="mt-1 space-y-1">
                                        <li className="text-gray-600">
                                            • Checklist Completion: {selectedTask.completedChecklists} of {selectedTask.totalChecklists}
                                        </li>
                                        {selectedTask.status === 'completed' && <li className="text-gray-600">• Completed in: {selectedTask.totalDaysToComplete} days</li>}
                                        <li className="text-gray-600">• Status: {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}</li>
                                    </ul>
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
