import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconEye from '../../../components/Icon/IconEye';
import IconClock from '../../../components/Icon/IconClock';
import IconAlertTriangle from '../../../components/Icon/IconAlertTriangle';
import IconCheckCircle from '../../../components/Icon/IconChecks';
import IconList from '../../../components/Icon/IconListCheck';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconRefresh from '../../../components/Icon/IconRefresh';
import IconMenu from '../../../components/Icon/IconMenu';
import IconX from '../../../components/Icon/IconX';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { findArrObj } from '../../../util/AllFunction';
import { getReport, resetReportStatus } from '../../../redux/reportSlice';
import { getEmployee, resetEmployeeStatus } from '../../../redux/employeeSlice';
import { getClient, resetClientStatus } from '../../../redux/clientSlice';
import _ from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

const PendingLateTaskReport = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Task Report') : [];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const staffId = localData?.staffId;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Brand colors
    const brandColorPrimary = '#1d7dbe'; // Primary blue
    const brandColorSecondary = '#f5903a'; // Secondary orange
    const brandColorDanger = '#ef4444'; // Red for overdue
    const brandColorWarning = '#f59e0b'; // Yellow for approaching
    const brandColorSuccess = '#10b981'; // Green for completed
    const brandColorInfo = '#3b82f6'; // Blue for info

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

    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((task, index) => {
            const checklists = task.checklists || [];
            const completedChecklists = checklists.filter((item) => item.completed).length;
            const totalChecklists = checklists.length;

            const staffNames = task.staffDetails?.map((staff) => staff.employeeName) || [];

            const progress = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

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

            const department = task.staffDetails?.[0]?.departmentName || 'Not specified';

            const dueDate = moment(task.dueDate);
            const today = moment();
            const completionDate = task.completionDate ? moment(task.completionDate) : null;

            // Calculate days from start date to current date
            let runningDays = 0;
            let startDate = moment(task.startDate || task.dueDate); // Use dueDate if startDate is null
            
            if (task.status !== 'completed') {
                runningDays = Math.max(0, today.diff(startDate, 'days') + 1); // +1 to include start day
            }

            let overdueDays = 0;
            let isLate = false;
            let lateCompletion = false;

            if (task.status === 'completed' && completionDate) {
                overdueDays = Math.max(0, completionDate.diff(dueDate, 'days'));
                isLate = overdueDays > 0;
                lateCompletion = isLate;
                
                // For completed tasks, running days = days from start to completion
                runningDays = Math.max(1, completionDate.diff(startDate, 'days') + 1);
            } else if (task.status !== 'completed') {
                overdueDays = Math.max(0, today.diff(dueDate, 'days'));
                isLate = overdueDays > 0;
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
                date: task.startDate ? moment(task.startDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
                dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD'),
                completedDate: task.completionDate ? moment(task.completionDate).format('YYYY-MM-DD') : null,
                checklists: checklists.map((item) => ({
                    id: item.checklistId,
                    text: item.text,
                    completed: item.completed || false,
                })),
                completedChecklists,
                totalChecklists,
                remarks: task.description || 'No description provided',
                status: task.status || 'pending',
                priority: getPriorityText(task.priorityLevel),
                progress,
                estimatedHours: 8,
                actualHours: 8,
                department,
                tags: [task.category || 'General'],
                overdueDays,
                isLate,
                lateCompletion,
                runningDays, // NEW: Days from start date to current/completion date
                startDate: task.startDate ? moment(task.startDate).format('YYYY-MM-DD') : null, // NEW: Store start date
                originalData: task,
            };
        });
    };

    const [allTasks, setAllTasks] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [reportType, setReportType] = useState('pending');
    const [dateRangeType, setDateRangeType] = useState('last30');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedEmployee: null,
        selectedClient: null,
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
    });

    const [optionListState, setOptionListState] = useState({
        employeeList: [],
        clientList: [],
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [chartData, setChartData] = useState({
        pendingByDay: [],
        lateCompletionByDay: [],
        pendingVsCompleted: {
            pending: 0,
            inProgress: 0,
            completed: 0,
            lateCompleted: 0,
            onTimeCompleted: 0,
            totalCompleted: 0,
        },
    });

    // State to prevent multiple API calls
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = async () => {
            await dispatch(getEmployee());
            await dispatch(getClient());
            setInitialLoad(false);
        };
        
        initializeData();
    }, []);

    // Initialize employee list with proper filtering
    useEffect(() => {
        if (employeeData && Array.isArray(employeeData)) {
            let employeeOptions = employeeData.map((emp) => ({
                value: emp.employeeId || emp.id,
                label: emp.employeeName || emp.name,
            }));

            // For non-Super Admin, filter to only current user
            if (roleIdforRole !== 'Super Admin' && staffId) {
                employeeOptions = employeeOptions.filter((emp) => emp.value === staffId);
                
                // Auto-select current user
                const currentUserEmployee = employeeOptions.find((emp) => emp.value === staffId);
                if (currentUserEmployee) {
                    setFilters((prev) => ({
                        ...prev,
                        selectedEmployee: currentUserEmployee,
                    }));
                }
            }

            setOptionListState((prev) => ({
                ...prev,
                employeeList: employeeOptions,
            }));
        }

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
    }, [employeeData, clientData, roleIdforRole, staffId]);

    // Handle API data transformation
    useEffect(() => {
        if (reportData && reportData.data && Array.isArray(reportData.data)) {
            const transformedTasks = transformApiData(reportData.data);
            setAllTasks(transformedTasks);
            setFilteredData(transformedTasks);
            generateChartData(transformedTasks);
            setIsSearching(false);
        } else {
            setAllTasks([]);
            setFilteredData([]);
            setIsSearching(false);
        }
    }, [reportData]);

    // Initial search when component mounts and employee data is loaded
    useEffect(() => {
        if (!initialLoad && !isSearching && !loading && optionListState.employeeList.length > 0) {
            handleAutoSearch();
        }
    }, [initialLoad, optionListState.employeeList]);

    // Generate chart data
    useEffect(() => {
        if (filteredData.length > 0) {
            generateChartData(filteredData);
        }
    }, [reportType, filteredData]);

    // Function to handle automatic search (only called on initial load)
    const handleAutoSearch = async () => {
        if (isSearching) return;
        
        setIsSearching(true);
        setSearchLoading(true);
        const backendFilters = buildBackendFilters();

        try {
            await dispatch(getReport(backendFilters));
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
        } catch (error) {
            console.error('Error fetching filtered tasks:', error);
            setIsSearching(false);
        } finally {
            setSearchLoading(false);
        }
    };

    // Build backend filters according to your API
    const buildBackendFilters = () => {
        const backendFilters = {
            isActive: 1,
        };

        // Set status based on report type
        if (reportType === 'pending') {
            backendFilters.status = 'pending'; // Include both pending and in-progress
        } else if (reportType === 'late') {
            backendFilters.status = 'completed';
            if (filters.startDate) {
                backendFilters.fromDate = filters.startDate;
            }
            if (filters.toDate) {
                backendFilters.toDate = filters.toDate;
            }
        }

        // Add employee filter
        if (filters.selectedEmployee && filters.selectedEmployee.value) {
            backendFilters.assignedTo = filters.selectedEmployee.value;
        }

        // Add search query filter
        if (filters.searchQuery) {
            backendFilters.taskId = filters.searchQuery;
        }

        // Add client filter
        if (filters.selectedClient && filters.selectedClient.value) {
            backendFilters.clientId = filters.selectedClient.value;
        }

        return backendFilters;
    };

    const generateChartData = (tasks) => {
        if (reportType === 'pending') {
            const pendingByDay = [];
            const today = moment();

            for (let i = 6; i >= 0; i--) {
                const date = moment().subtract(i, 'days');
                const dateStr = date.format('YYYY-MM-DD');

                const pendingTasks = tasks.filter((task) => (task.status === 'pending' || task.status === 'in-progress') && moment(task.date).isSame(date, 'day')).length;

                pendingByDay.push({
                    date: dateStr,
                    day: date.format('ddd'),
                    count: pendingTasks,
                    isToday: dateStr === today.format('YYYY-MM-DD'),
                });
            }

            const allPending = tasks.filter((task) => task.status === 'pending' || task.status === 'in-progress');
            const allCompleted = tasks.filter((task) => task.status === 'completed');

            setChartData({
                pendingByDay,
                pendingVsCompleted: {
                    pending: allPending.filter((t) => t.status === 'pending').length,
                    inProgress: allPending.filter((t) => t.status === 'in-progress').length,
                    completed: allCompleted.length,
                },
            });
        } else if (reportType === 'late') {
            const lateCompletionByDay = [];
            const today = moment();

            for (let i = 6; i >= 0; i--) {
                const date = moment().subtract(i, 'days');
                const dateStr = date.format('YYYY-MM-DD');

                const lateTasks = tasks.filter((task) => task.status === 'completed' && task.isLate && task.completedDate && moment(task.completedDate).isSame(date, 'day')).length;

                lateCompletionByDay.push({
                    date: dateStr,
                    day: date.format('ddd'),
                    count: lateTasks,
                    isToday: dateStr === today.format('YYYY-MM-DD'),
                });
            }

            const allLateCompleted = tasks.filter((task) => task.status === 'completed' && task.isLate);
            const allOnTimeCompleted = tasks.filter((task) => task.status === 'completed' && !task.isLate);

            setChartData({
                lateCompletionByDay,
                pendingVsCompleted: {
                    lateCompleted: allLateCompleted.length,
                    onTimeCompleted: allOnTimeCompleted.length,
                    totalCompleted: allLateCompleted.length + allOnTimeCompleted.length,
                },
            });
        }
    };

    const getFilteredTasks = (tasks) => {
        let results = [...tasks];

        if (reportType === 'pending') {
            results = results.filter((task) => task.status === 'pending' || task.status === 'in-progress');
        } else if (reportType === 'late') {
            results = results.filter((task) => task.status === 'completed' && task.isLate);
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            results = results.filter(
                (task) =>
                    task.name.toLowerCase().includes(query) ||
                    task.taskId.toLowerCase().includes(query) ||
                    (task.category && task.category.toLowerCase().includes(query)) ||
                    task.assignedTo.toLowerCase().includes(query) ||
                    (task.department && task.department.toLowerCase().includes(query)) ||
                    task.status.toLowerCase().includes(query) ||
                    (task.priority && task.priority.toLowerCase().includes(query)) ||
                    (task.remarks && task.remarks.toLowerCase().includes(query)) ||
                    (task.client && task.client.toLowerCase().includes(query))
            );
        }

        if (filters.selectedEmployee && filters.selectedEmployee.value) {
            results = results.filter((task) => 
                task.originalData?.assignedTo?.includes(filters.selectedEmployee.value)
            );
        }

        if (filters.selectedClient && filters.selectedClient.value) {
            const selectedClientName = filters.selectedClient.label.toLowerCase();
            results = results.filter((task) => task.client && task.client.toLowerCase().includes(selectedClientName));
        }

        // For late completion, filter by date range
        if (reportType === 'late' && filters.startDate && filters.toDate) {
            results = results.filter((task) => {
                if (!task.completedDate) return false;
                const completedDate = moment(task.completedDate);
                const startDate = moment(filters.startDate);
                const endDate = moment(filters.toDate);
                return completedDate.isBetween(startDate, endDate, 'day', '[]');
            });
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
            await dispatch(getReport(backendFilters));
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
        } catch (error) {
            console.error('Error fetching filtered tasks:', error);
            setIsSearching(false);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClear = () => {
        let clearFilters = {
            searchQuery: '',
            selectedClient: null,
            startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
        };

        // Keep employee selection based on role
        if (roleIdforRole !== 'Super Admin' && staffId && optionListState.employeeList.length > 0) {
            const currentUserEmployee = optionListState.employeeList.find((emp) => emp.value === staffId);
            if (currentUserEmployee) {
                clearFilters.selectedEmployee = currentUserEmployee;
            }
        } else {
            clearFilters.selectedEmployee = null;
        }

        setFilters(clearFilters);
        setAppliedFilters(null);
        setCurrentPage(0);
    };

    const handleReportTypeChange = async (type) => {
        setReportType(type);
        setCurrentPage(0);

        const newFilters = {
            ...filters,
            searchQuery: '',
            selectedClient: null,
            startDate: type === 'late' ? moment().subtract(30, 'days').format('YYYY-MM-DD') : moment().subtract(30, 'days').format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
        };

        setFilters(newFilters);
        setAppliedFilters(null);
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

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTask(null);
    };

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

    const getOverdueColor = (overdueDays) => {
        if (overdueDays === 0) return 'text-green-600';
        if (overdueDays <= 2) return 'text-yellow-600';
        if (overdueDays <= 5) return 'text-orange-600';
        return 'text-red-600';
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
            Header: 'Task',
            accessor: 'taskDetails',
            sort: true,
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <span className="font-semibold text-gray-900 block text-sm">{row.original.name}</span>
                    <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(row.original.status)}`}>{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">{row.original.client}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Assigned To',
            accessor: 'assignedTo',
            sort: true,
            Cell: ({ value }) => <div className="text-sm text-gray-700">{value.length > 20 ? `${value.substring(0, 20)}...` : value}</div>,
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-sm text-gray-700">
                    {value ? moment(value).format('DD/MM/YYYY') : 'N/A'}
                </div>
            ),
        },
        {
            Header: 'Running Days',
            accessor: 'runningDays',
            sort: true,
            Cell: ({ value, row }) => {
                return (
                    <div className="text-center">
                        <div className="font-semibold text-sm" style={{ color: brandColorPrimary }}>
                            {value} day{value !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                            From {row.original.startDate ? moment(row.original.startDate).format('DD/MM/YYYY') : 'start'}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Due Date',
            accessor: 'dueDate',
            sort: true,
            Cell: ({ value, row }) => {
                const dueDate = moment(value);
                const today = moment();
                const daysDiff = dueDate.diff(today, 'days');

                return (
                    <div className="space-y-1">
                        <div className={`font-semibold text-sm ${daysDiff < 0 ? 'text-red-600' : daysDiff === 0 ? 'text-orange-600' : daysDiff <= 2 ? 'text-yellow-600' : 'text-gray-700'}`}>
                            {dueDate.format('DD/MM/YYYY')}
                        </div>
                        {row.original.overdueDays > 0 && <div className={`text-xs ${getOverdueColor(row.original.overdueDays)}`}>{row.original.overdueDays}d overdue</div>}
                    </div>
                );
            },
        },
        {
            Header: reportType === 'late' ? 'Completed' : 'Status',
            accessor: reportType === 'late' ? 'completedDate' : 'status',
            sort: true,
            Cell: ({ value, row }) => {
                if (reportType === 'late') {
                    return (
                        <div className="space-y-1">
                            {value ? (
                                <>
                                    <div className="font-semibold text-sm text-gray-700">{moment(value).format('DD/MM/YYYY')}</div>
                                    <div className={`text-xs ${getOverdueColor(row.original.overdueDays)}`}>{row.original.overdueDays}d late</div>
                                </>
                            ) : (
                                <div className="text-gray-400 text-sm">-</div>
                            )}
                        </div>
                    );
                } else {
                    return (
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 min-w-0">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{value.charAt(0).toUpperCase() + value.slice(1)}</div>
                            </div>
                        </div>
                    );
                }
            },
        },
        {
            Header: 'Progress',
            accessor: 'progress',
            sort: true,
            Cell: ({ value }) => (
                <div className="flex items-center space-x-2">
                    <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-1.5 rounded-full"
                                style={{
                                    backgroundColor: value === 100 ? brandColorSuccess : brandColorPrimary,
                                }}
                            ></motion.div>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{value}%</span>
                </div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 80,
            Cell: ({ row }) => {
                const task = row.original;
                return (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(task)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors"
                        title="View Task Details"
                        style={{ color: brandColorPrimary }}
                    >
                        <IconEye className="w-4 h-4" />
                    </motion.button>
                );
            },
        },
    ];

    // Calculate metrics
    const calculateMetrics = {
        totalTasks: filteredData.length,
        pendingTasks: reportType === 'pending' ? filteredData.filter((t) => t.status === 'pending').length : 0,
        inProgressTasks: reportType === 'pending' ? filteredData.filter((t) => t.status === 'in-progress').length : 0,
        completedTasks: reportType === 'late' ? filteredData.filter((t) => t.status === 'completed').length : 0,
        lateTasks: filteredData.filter((t) => t.isLate).length,
        overdueTasks: filteredData.filter((t) => t.overdueDays > 0).length,
        avgOverdueDays:
            filteredData.filter((t) => t.overdueDays > 0).length > 0
                ? Math.round(filteredData.filter((t) => t.overdueDays > 0).reduce((sum, t) => sum + t.overdueDays, 0) / filteredData.filter((t) => t.overdueDays > 0).length)
                : 0,
        onTimeCompletions: reportType === 'late' ? allTasks.filter((t) => t.status === 'completed' && !t.isLate).length : 0,
        lateCompletionRate: reportType === 'late' && filteredData.length > 0 ? Math.round((filteredData.filter((t) => t.isLate).length / filteredData.length) * 100) : 0,
        avgRunningDays: filteredData.length > 0 
            ? Math.round(filteredData.reduce((sum, t) => sum + (t.runningDays || 0), 0) / filteredData.length) 
            : 0,
    };

    const onDownload = () => {
        const yearMonth = reportType === 'late' ? `${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}` : 'Pending Tasks Report';

        const additionalDetails = `${reportType === 'pending' ? 'Pending Tasks' : 'Late Completion'} Report ${reportType === 'late' ? `for ${yearMonth}` : ''}`;
        const reportGeneratedDate = `Report Generated On: ${moment().format('DD-MM-YYYY')}`;

        const data = filteredData.map((task, index) => ({
            ['S.No']: index + 1,
            ['Task ID']: task.taskId,
            ['Task Name']: task.name,
            ['Client']: task.client || 'N/A',
            ['Category']: task.category,
            ['Assigned To']: task.assignedTo,
            ['Assigned By']: task.assignedBy,
            ['Department']: task.department,
            ['Status']: task.status.charAt(0).toUpperCase() + task.status.slice(1),
            ['Progress']: `${task.progress}%`,
            ['Checklist Completed']: `${task.completedChecklists}/${task.totalChecklists}`,
            ['Start Date']: task.startDate ? moment(task.startDate).format('DD/MM/YYYY') : 'N/A',
            ['Running Days']: task.runningDays,
            ['Due Date']: moment(task.dueDate).format('DD/MM/YYYY'),
            ['Completed Date']: task.completedDate ? moment(task.completedDate).format('DD/MM/YYYY') : 'Not Completed',
            ['Overdue Days']: task.overdueDays,
            ['Late Completion']: task.isLate ? 'Yes' : 'No',
            ['Remarks']: task.remarks,
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
                'Category',
                'Assigned To',
                'Assigned By',
                'Department',
                'Status',
                'Progress',
                'Checklist Completed',
                'Start Date',
                'Running Days',
                'Due Date',
                'Completed Date',
                'Overdue Days',
                'Late Completion',
                'Remarks',
            ],
        ];

        const rows = data.map((item) => Object.values(item));

        const summaryRows = [
            [],
            ['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['Total Tasks', calculateMetrics.totalTasks, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            reportType === 'pending' ? ['Pending Tasks', calculateMetrics.pendingTasks, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] : null,
            reportType === 'pending' ? ['In Progress Tasks', calculateMetrics.inProgressTasks, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] : null,
            reportType === 'late' ? ['Late Tasks', calculateMetrics.lateTasks, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] : null,
            reportType === 'late' ? ['On-time Completions', calculateMetrics.onTimeCompletions, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] : null,
            ['Average Overdue Days', calculateMetrics.avgOverdueDays, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['Average Running Days', calculateMetrics.avgRunningDays, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            reportType === 'late' ? ['Late Completion Rate', `${calculateMetrics.lateCompletionRate}%`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] : null,
        ].filter((row) => row !== null);

        const allRows = [...header, ...rows, ...summaryRows];

        const worksheet = XLSX.utils.aoa_to_sheet(allRows);

        if (!worksheet['!merges']) worksheet['!merges'] = [];

        worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } });
        worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 17 } });

        const summaryStartRow = header.length + rows.length + 1;
        for (let i = 0; i < summaryRows.length; i++) {
            if (summaryRows[i] && summaryRows[i].length > 0) {
                worksheet['!merges'].push({ s: { r: summaryStartRow + i, c: 0 }, e: { r: summaryStartRow + i, c: 1 } });
            }
        }

        worksheet['!cols'] = [
            { wch: 8 },
            { wch: 12 },
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 12 },
            { wch: 10 },
            { wch: 18 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
            { wch: 30 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Report');

        const fileName =
            reportType === 'late'
                ? `late-completion-report-${moment(filters.startDate).format('DD-MM-YYYY')}-to-${moment(filters.toDate).format('DD-MM-YYYY')}.xlsx`
                : `pending-tasks-report-${moment().format('DD-MM-YYYY')}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/print-task', {
            state: {
                filteredData: filteredData,
                filters: filters,
                reportType: reportType,
                chartData: chartData,
                metrics: calculateMetrics,
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
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            minHeight: '42px',
            backgroundColor: state.isDisabled ? '#f3f4f6' : 'white',
            fontSize: '14px',
            '&:hover': {
                borderColor: '#d1d5db',
            },
            cursor: state.isDisabled ? 'not-allowed' : 'default',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? brandColorPrimary : state.isFocused ? `${brandColorPrimary}15` : 'white',
            color: state.isSelected ? 'white' : '#374151',
            fontSize: '14px',
            '&:hover': {
                backgroundColor: `${brandColorPrimary}15`,
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        indicatorSeparator: (provided, state) => ({
            ...provided,
            backgroundColor: state.isDisabled ? '#d1d5db' : provided.backgroundColor,
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isDisabled ? '#9ca3af' : provided.color,
        }),
    };

    // Mobile optimized columns
    const mobileColumns = [
        {
            Header: 'Task',
            accessor: 'mobileTask',
            Cell: ({ row }) => (
                <div className="space-y-2">
                    <div>
                        <span className="font-semibold text-gray-900 block text-sm">{row.original.name}</span>
                        <span className="text-xs text-gray-600 block">
                            {row.original.client} • {row.original.assignedTo.split(',')[0]}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(row.original.status)}`}>{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}</div>
                        <div
                            className={`text-xs font-semibold ${
                                moment(row.original.dueDate).diff(moment(), 'days') < 0
                                    ? 'text-red-600'
                                    : moment(row.original.dueDate).diff(moment(), 'days') === 0
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                            }`}
                        >
                            {moment(row.original.dueDate).format('DD/MM')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${row.original.progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: row.original.progress === 100 ? brandColorSuccess : brandColorPrimary,
                                    }}
                                ></motion.div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-700">{row.original.progress}%</span>
                    </div>
                    {row.original.overdueDays > 0 && <div className={`text-xs ${getOverdueColor(row.original.overdueDays)} font-medium`}>{row.original.overdueDays} days overdue</div>}
                    <div className="text-xs text-gray-600">
                        Running: {row.original.runningDays} day{row.original.runningDays !== 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={() => handleViewDetails(row.original)}
                        className="w-full mt-2 px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        style={{
                            backgroundColor: `${brandColorPrimary}15`,
                            color: brandColorPrimary,
                        }}
                    >
                        <IconEye className="w-3.5 h-3.5" />
                        View Details
                    </button>
                </div>
            ),
        },
    ];

    // Render Employee Filter differently based on role
    const renderEmployeeFilter = () => {
        if (roleIdforRole === 'Super Admin') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <Select
                        options={[{ value: '', label: 'All Employee' }, ...optionListState.employeeList]}
                        value={filters.selectedEmployee}
                        onChange={(selectedOption) => {
                            setFilters({ ...filters, selectedEmployee: selectedOption });
                        }}
                        placeholder="Select Employee"
                        isSearchable
                        isClearable
                        styles={customStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            );
        } 
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: brandColorPrimary }}></div>
                <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: brandColorSecondary }}></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full opacity-5 animate-ping" style={{ backgroundColor: brandColorSuccess }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-lg p-4">
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: brandColorPrimary }}>
                                Task Reports
                            </h1>
                            <p className="text-xs text-gray-600">Performance & Compliance</p>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                            {mobileMenuOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobile && mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-xl shadow-xl mb-6 overflow-hidden">
                            <div className="p-4 space-y-3">
                                <button
                                    onClick={() => {
                                        handleReportTypeChange('pending');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${reportType === 'pending' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'}`}
                                    style={{ backgroundColor: reportType === 'pending' ? brandColorPrimary : 'white', border: reportType === 'pending' ? 'none' : '1px solid #e5e7eb' }}
                                >
                                    Pending Tasks
                                </button>
                                <button
                                    onClick={() => {
                                        handleReportTypeChange('late');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${reportType === 'late' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'}`}
                                    style={{ backgroundColor: reportType === 'late' ? brandColorDanger : 'white', border: reportType === 'late' ? 'none' : '1px solid #e5e7eb' }}
                                >
                                    Late Completions
                                </button>
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="w-full px-4 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    {showSearch ? 'Hide Filters' : 'Show Filters'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Header */}
                {!isMobile && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: brandColorPrimary }}>
                            Task Performance & Compliance Report
                        </h1>
                        <p className="text-gray-600">Track pending tasks and late completions with detailed analysis</p>
                    </motion.div>
                )}

                {/* Report Type Selector - Desktop */}
                {!isMobile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleReportTypeChange('pending')}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                    reportType === 'pending' ? 'text-white shadow-lg scale-105' : 'text-gray-700 hover:bg-gray-50 hover:scale-[1.02]'
                                }`}
                                style={{ backgroundColor: reportType === 'pending' ? brandColorPrimary : 'white', border: reportType === 'pending' ? 'none' : '1px solid #e5e7eb' }}
                                disabled={searchLoading}
                            >
                                {searchLoading && reportType === 'pending' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <IconList className="w-4 h-4" />
                                        Pending Tasks Report
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleReportTypeChange('late')}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                    reportType === 'late' ? 'text-white shadow-lg scale-105' : 'text-gray-700 hover:bg-gray-50 hover:scale-[1.02]'
                                }`}
                                style={{ backgroundColor: reportType === 'late' ? brandColorDanger : 'white', border: reportType === 'late' ? 'none' : '1px solid #e5e7eb' }}
                                disabled={searchLoading}
                            >
                                {searchLoading && reportType === 'late' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <IconAlertTriangle className="w-4 h-4" />
                                        Late Completion Report
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Charts Section */}
                {!isMobile && (
                    <AnimatePresence>
                        {(reportType === 'pending' || reportType === 'late') && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Pie Chart */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{reportType === 'pending' ? 'Task Status Distribution' : 'Completion Type Distribution'}</h3>
                                        <div className="flex items-center justify-center">
                                            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-2xl sm:text-3xl font-bold" style={{ color: reportType === 'pending' ? brandColorPrimary : brandColorDanger }}>
                                                            {reportType === 'pending'
                                                                ? chartData.pendingVsCompleted.pending + chartData.pendingVsCompleted.inProgress + chartData.pendingVsCompleted.completed
                                                                : chartData.pendingVsCompleted.totalCompleted || 0}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-600">{reportType === 'pending' ? 'Total Tasks' : 'Total Completions'}</div>
                                                    </div>
                                                </div>

                                                {/* Animated Pie Segments */}
                                                {reportType === 'pending' && (
                                                    <>
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-8"
                                                            style={{
                                                                borderColor: brandColorWarning,
                                                                clipPath: `inset(0 0 0 50%)`,
                                                            }}
                                                            animate={{
                                                                rotate:
                                                                    (chartData.pendingVsCompleted.pending /
                                                                        (chartData.pendingVsCompleted.pending + chartData.pendingVsCompleted.inProgress + chartData.pendingVsCompleted.completed)) *
                                                                    360,
                                                            }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                        ></motion.div>
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-8"
                                                            style={{
                                                                borderColor: brandColorPrimary,
                                                                clipPath: `inset(0 0 0 50%)`,
                                                            }}
                                                            animate={{
                                                                rotate:
                                                                    ((chartData.pendingVsCompleted.pending + chartData.pendingVsCompleted.inProgress) /
                                                                        (chartData.pendingVsCompleted.pending + chartData.pendingVsCompleted.inProgress + chartData.pendingVsCompleted.completed)) *
                                                                    360,
                                                            }}
                                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                                        ></motion.div>
                                                    </>
                                                )}
                                                {reportType === 'late' && (
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border-8"
                                                        style={{
                                                            borderColor: brandColorDanger,
                                                            clipPath: `inset(0 0 0 50%)`,
                                                        }}
                                                        animate={{
                                                            rotate: ((chartData.pendingVsCompleted.lateCompleted || 0) / (chartData.pendingVsCompleted.totalCompleted || 1)) * 360,
                                                        }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                    ></motion.div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                                            {reportType === 'pending' ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorWarning }}></div>
                                                        <span className="text-sm">Pending: {chartData.pendingVsCompleted.pending}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorPrimary }}></div>
                                                        <span className="text-sm">In Progress: {chartData.pendingVsCompleted.inProgress}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorSuccess }}></div>
                                                        <span className="text-sm">Completed: {chartData.pendingVsCompleted.completed}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorDanger }}></div>
                                                        <span className="text-sm">Late: {chartData.pendingVsCompleted.lateCompleted || 0}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColorSuccess }}></div>
                                                        <span className="text-sm">On Time: {chartData.pendingVsCompleted.onTimeCompleted || 0}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {reportType === 'pending' ? 'Daily Pending Tasks (Last 7 Days)' : 'Daily Late Completions (Last 7 Days)'}
                                        </h3>
                                        <div className="flex items-end h-40 sm:h-48 gap-1 sm:gap-2">
                                            {(reportType === 'pending' ? chartData.pendingByDay : chartData.lateCompletionByDay || [])?.map((day, index) => (
                                                <div key={index} className="flex-1 flex flex-col items-center">
                                                    <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${Math.min(day.count * 15, 100)}%` }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                        className={`w-full sm:w-10 rounded-t-lg transition-all duration-300 hover:opacity-80 ${day.isToday ? 'ring-2' : ''}`}
                                                        style={{
                                                            backgroundColor: day.isToday
                                                                ? reportType === 'pending'
                                                                    ? brandColorPrimary
                                                                    : brandColorDanger
                                                                : reportType === 'pending'
                                                                ? brandColorWarning
                                                                : '#ef444480',
                                                            opacity: day.isToday ? 1 : 0.7,
                                                            borderColor: day.isToday ? (reportType === 'pending' ? brandColorPrimary : brandColorDanger) : 'transparent',
                                                        }}
                                                        title={`${day.count} ${reportType === 'pending' ? 'tasks' : 'late completions'} on ${day.date}`}
                                                    ></motion.div>
                                                    <div className="text-xs font-medium mt-1">{day.count}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Summary Cards */}
                {searchLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
                            >
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total Tasks Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${reportType === 'pending' ? brandColorPrimary : brandColorDanger}15` }}>
                                    <IconList style={{ color: reportType === 'pending' ? brandColorPrimary : brandColorDanger }} className="w-5 h-5" />
                                </div>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full animate-pulse"
                                    style={{
                                        backgroundColor: `${reportType === 'pending' ? brandColorPrimary : brandColorDanger}15`,
                                        color: reportType === 'pending' ? brandColorPrimary : brandColorDanger,
                                    }}
                                >
                                    Live
                                </span>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">{reportType === 'pending' ? 'Pending Tasks' : 'Late Completions'}</h3>
                            <p className="text-2xl font-bold text-gray-900">{calculateMetrics.totalTasks}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: reportType === 'pending' ? brandColorWarning : brandColorDanger,
                                    }}
                                ></motion.div>
                            </div>
                        </motion.div>

                        {/* Overdue/Average Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${brandColorDanger}15` }}>
                                    <IconAlertTriangle style={{ color: brandColorDanger }} className="w-5 h-5" />
                                </div>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full animate-pulse"
                                    style={{
                                        backgroundColor: `${brandColorDanger}15`,
                                        color: brandColorDanger,
                                    }}
                                >
                                    Live
                                </span>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">{reportType === 'pending' ? 'Overdue Tasks' : 'Avg Overdue Days'}</h3>
                            <p className="text-2xl font-bold text-gray-900">{reportType === 'pending' ? calculateMetrics.overdueTasks : `${calculateMetrics.avgOverdueDays}d`}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width:
                                            reportType === 'pending'
                                                ? `${calculateMetrics.totalTasks > 0 ? (calculateMetrics.overdueTasks / calculateMetrics.totalTasks) * 100 : 0}%`
                                                : `${calculateMetrics.avgOverdueDays > 10 ? 100 : calculateMetrics.avgOverdueDays * 10}%`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    className="h-1.5 rounded-full"
                                    style={{ backgroundColor: brandColorDanger }}
                                ></motion.div>
                            </div>
                        </motion.div>

                        {/* Running Days Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: `${brandColorInfo}15`,
                                    }}
                                >
                                    <IconClock style={{ color: brandColorInfo }} className="w-5 h-5" />
                                </div>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full animate-pulse"
                                    style={{
                                        backgroundColor: `${brandColorInfo}15`,
                                        color: brandColorInfo,
                                    }}
                                >
                                    Live
                                </span>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">Avg Running Days</h3>
                            <p className="text-2xl font-bold text-gray-900">{calculateMetrics.avgRunningDays}d</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(calculateMetrics.avgRunningDays * 5, 100)}%`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                    className="h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: brandColorInfo,
                                    }}
                                ></motion.div>
                            </div>
                        </motion.div>

                        {/* Rate Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: `${reportType === 'late' ? brandColorWarning : brandColorSuccess}15`,
                                    }}
                                >
                                    {reportType === 'late' ? (
                                        <IconTrendingUp style={{ color: brandColorWarning }} className="w-5 h-5" />
                                    ) : (
                                        <IconCheckCircle style={{ color: brandColorSuccess }} className="w-5 h-5" />
                                    )}
                                </div>
                                <span
                                    className="text-xs font-semibold px-2 py-1 rounded-full animate-pulse"
                                    style={{
                                        backgroundColor: `${reportType === 'late' ? brandColorWarning : brandColorSuccess}15`,
                                        color: reportType === 'late' ? brandColorWarning : brandColorSuccess,
                                    }}
                                >
                                    Live
                                </span>
                            </div>
                            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-1">{reportType === 'late' ? 'Late Completion Rate' : 'Completion Rate'}</h3>
                            <p className="text-2xl font-bold text-gray-900">
                                {reportType === 'late'
                                    ? `${calculateMetrics.lateCompletionRate}%`
                                    : `${calculateMetrics.totalTasks > 0 ? Math.round((calculateMetrics.completedTasks / (calculateMetrics.totalTasks + calculateMetrics.completedTasks)) * 100) : 0}%`}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width:
                                            reportType === 'late'
                                                ? `${calculateMetrics.lateCompletionRate}%`
                                                : `${calculateMetrics.totalTasks > 0 ? (calculateMetrics.completedTasks / (calculateMetrics.totalTasks + calculateMetrics.completedTasks)) * 100 : 0}%`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                    className="h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: reportType === 'late' ? (calculateMetrics.lateCompletionRate > 30 ? brandColorDanger : brandColorWarning) : brandColorSuccess,
                                    }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Search Panel */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <IconSearch className="w-5 h-5" style={{ color: brandColorPrimary }} />
                                    {reportType === 'pending' ? 'Filter Pending Tasks' : 'Filter Late Completions'}
                                </h2>
                                <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded">
                                    ▲ Hide
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                                    {/* Date Range Filters for Late Completion */}
                                    {reportType === 'late' && (
                                        <>
                                            <div className={`${isMobile ? 'col-span-1' : 'md:col-span-1'}`}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{
                                                        '--tw-ring-color': brandColorPrimary,
                                                    }}
                                                    value={filters.startDate}
                                                    onChange={(e) => {
                                                        setFilters({ ...filters, startDate: e.target.value });
                                                    }}
                                                />
                                            </div>
                                            <div className={`${isMobile ? 'col-span-1' : 'md:col-span-1'}`}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{
                                                        '--tw-ring-color': brandColorPrimary,
                                                    }}
                                                    value={filters.toDate}
                                                    onChange={(e) => {
                                                        setFilters({ ...filters, toDate: e.target.value });
                                                    }}
                                                />
                                            </div>
                                            <div className={`${isMobile ? 'col-span-1' : 'md:col-span-2'}`}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Quick Date Range</label>
                                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {['last7', 'last30', 'last60', 'last90', 'custom'].map((range) => (
                                                        <button
                                                            key={range}
                                                            type="button"
                                                            onClick={() => handleDateRangeChange(range)}
                                                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                                                dateRangeType === range ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                            style={{
                                                                backgroundColor: dateRangeType === range ? brandColorPrimary : 'white',
                                                                border: dateRangeType === range ? 'none' : '1px solid #e5e7eb',
                                                            }}
                                                        >
                                                            {range === 'last7' ? '7D' : range === 'last30' ? '30D' : range === 'last60' ? '60D' : range === 'last90' ? '90D' : 'Custom'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Employee Filter */}
                                    {renderEmployeeFilter()}

                                    {/* Client Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                        <Select
                                            options={[{ value: '', label: 'All Clients' }, ...optionListState.clientList]}
                                            value={filters.selectedClient}
                                            onChange={(selectedOption) => {
                                                setFilters({ ...filters, selectedClient: selectedOption });
                                            }}
                                            placeholder="Select Client"
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
                                    <div className={reportType === 'pending' && !isMobile ? '' : isMobile ? 'col-span-1' : 'md:col-span-2'}>
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
                                            placeholder={reportType === 'pending' ? 'Search pending tasks...' : 'Search late completions...'}
                                            value={filters.searchQuery}
                                            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <motion.button
                                            type="button"
                                            onClick={handleClear}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
                                            disabled={searchLoading}
                                        >
                                            <IconRefresh className="w-4 h-4" />
                                            <span>Reset Filters</span>
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="px-4 sm:px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2 order-1 sm:order-2"
                                            style={{ backgroundColor: brandColorPrimary }}
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
                                                    <span>Search</span>
                                                </>
                                            )}
                                        </motion.button>
                                        {appliedFilters && filteredData.length > 0 && (
                                            <div className="flex flex-col sm:flex-row gap-3 order-3">
                                                {_.includes(accessIds, '5') && (
                                                    <motion.button
                                                        type="button"
                                                        onClick={onDownload}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
                                                        disabled={searchLoading}
                                                    >
                                                        <IconPrinter className="w-4 h-4" />
                                                        <span>Excel</span>
                                                    </motion.button>
                                                )}
                                                {_.includes(accessIds, '9') && (
                                                    <motion.button
                                                        type="button"
                                                        onClick={onDownloadPDF}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="px-4 sm:px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
                                                        disabled={searchLoading}
                                                    >
                                                        <IconPrinter className="w-4 h-4" />
                                                        <span>PDF</span>
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Show Search Button when search panel is hidden */}
                {!showSearch && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-6">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
                            style={{ backgroundColor: brandColorPrimary }}
                        >
                            <IconSearch className="w-4 h-4" />
                            Show Filters
                        </button>
                    </motion.div>
                )}

                {/* Results Section */}
                {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Task Data</h3>
                            <p className="text-gray-500">Please wait while we fetch task information</p>
                        </div>
                    </motion.div>
                ) : searchLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderColor: brandColorPrimary }}></div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Searching Tasks</h3>
                            <p className="text-gray-500">Fetching data based on your criteria</p>
                        </div>
                    </motion.div>
                ) : appliedFilters && filteredData.length > 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{reportType === 'pending' ? 'Pending Tasks Report' : 'Late Completion Report'}</h3>
                                    <p className="text-sm text-gray-600">
                                        Showing {filteredData.length} tasks
                                        {reportType === 'late' && ` from ${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="hidden sm:inline">Last updated:</span>
                                    <span className="font-medium">{moment().format('HH:mm')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4">
                            {isMobile ? (
                                <div className="space-y-3">
                                    {getPaginatedData().map((task, index) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{task.taskId}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                                                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-gray-900 text-sm">{task.name}</h4>
                                                        <p className="text-xs text-gray-600 mt-1">{task.client}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-gray-500">Assigned To:</span>
                                                        <p className="font-medium truncate">{task.assignedTo}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Start Date:</span>
                                                        <p className="font-medium">{task.startDate ? moment(task.startDate).format('DD MMM') : 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Running Days:</span>
                                                        <p className="font-medium" style={{ color: brandColorPrimary }}>
                                                            {task.runningDays} day{task.runningDays !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Due Date:</span>
                                                        <p className={`font-medium ${moment(task.dueDate).diff(moment(), 'days') < 0 ? 'text-red-600' : ''}`}>
                                                            {moment(task.dueDate).format('DD MMM YY')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-600">Progress</span>
                                                        <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${task.progress}%` }}
                                                            transition={{ duration: 0.5 }}
                                                            className="h-1.5 rounded-full"
                                                            style={{
                                                                backgroundColor: task.progress === 100 ? brandColorSuccess : brandColorPrimary,
                                                            }}
                                                        ></motion.div>
                                                    </div>
                                                </div>

                                                {task.overdueDays > 0 && (
                                                    <div className={`text-xs font-medium flex items-center gap-1 ${getOverdueColor(task.overdueDays)}`}>
                                                        <IconAlertTriangle className="w-3 h-3" />
                                                        {task.overdueDays} day{task.overdueDays !== 1 ? 's' : ''} overdue
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleViewDetails(task)}
                                                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
                                                    style={{
                                                        backgroundColor: `${brandColorPrimary}15`,
                                                        color: brandColorPrimary,
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
                                    mobileView={false}
                                />
                            )}

                            {/* Mobile Pagination */}
                            {isMobile && filteredData.length > 0 && (
                                <div className="flex items-center justify-between mt-6 px-2">
                                    <button
                                        onClick={() => handlePaginationChange(currentPage - 1, pageSize)}
                                        disabled={currentPage === 0}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage + 1} of {Math.ceil(getTotalCount() / pageSize)}
                                    </span>
                                    <button
                                        onClick={() => handlePaginationChange(currentPage + 1, pageSize)}
                                        disabled={currentPage >= Math.ceil(getTotalCount() / pageSize) - 1}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : appliedFilters && filteredData.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorSecondary}15` }}>
                                <IconSearch className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: brandColorSecondary }} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">No Tasks Found</h3>
                            <p className="text-gray-600 text-sm sm:text-base max-w-md mb-6">No tasks match your current search criteria. Try adjusting your filters.</p>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                style={{ backgroundColor: brandColorPrimary }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                <IconSearch className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: brandColorPrimary }} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Task Performance Dashboard</h3>
                            <p className="text-gray-600 text-sm sm:text-base max-w-md mb-6">Select a report type and use the search filters to analyze task performance.</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                    style={{ backgroundColor: brandColorPrimary }}
                                >
                                    Start Searching
                                </button>
                                {!isMobile && (
                                    <>
                                        <button
                                            onClick={() => handleReportTypeChange('pending')}
                                            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                            style={{ backgroundColor: brandColorWarning }}
                                        >
                                            View Pending Tasks
                                        </button>
                                        <button
                                            onClick={() => handleReportTypeChange('late')}
                                            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-lg"
                                            style={{ backgroundColor: brandColorDanger }}
                                        >
                                            View Late Completions
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Task Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Task Details`}
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
                                    <span className="font-semibold text-gray-700">Task ID:</span> {selectedTask.taskId}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Task Name:</span> {selectedTask.name}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Client:</span> {selectedTask.client || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Assigned To:</span> {selectedTask.assignedTo}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                                        {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Start Date:</span> {selectedTask.startDate ? moment(selectedTask.startDate).format('DD/MM/YYYY') : 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Running Days:</span>
                                    <span className="ml-2 font-medium" style={{ color: brandColorPrimary }}>
                                        {selectedTask.runningDays} day{selectedTask.runningDays !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Due Date:</span> {moment(selectedTask.dueDate).format('DD/MM/YYYY')}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Completed Date:</span>
                                    {selectedTask.completedDate ? ` ${moment(selectedTask.completedDate).format('DD/MM/YYYY')}` : ' Not Completed'}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Overdue Days:</span>
                                    <span className={`ml-2 ${getOverdueColor(selectedTask.overdueDays)} font-medium`}>
                                        {selectedTask.overdueDays} day{selectedTask.overdueDays !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-semibold text-gray-700">Remarks:</span> {selectedTask.remarks}
                                </div>
                            </div>
                        </div>

                        {/* Checklist Information */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Checklists</h4>
                            <div className="space-y-2">
                                {selectedTask.checklists &&
                                    selectedTask.checklists.map((item, index) => (
                                        <div key={index} className="flex items-center">
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
                            <div className="mt-3 text-sm text-gray-600">
                                Checklist Completion: {selectedTask.completedChecklists} of {selectedTask.totalChecklists} ({selectedTask.progress}%)
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default PendingLateTaskReport;