import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showMessage, showConfirmationDialog, findArrObj } from '../util/AllFunction';
import IconUsers from '../components/Icon/IconUsers';
import IconCalendar from '../components/Icon/IconCalendar';
import IconCheckCircle from '../components/Icon/IconChecks';
import IconClock from '../components/Icon/IconClock';
import IconList from '../components/Icon/IconListCheck';
import IconUserPlus from '../components/Icon/IconUserPlus';
import IconPlus from '../components/Icon/IconPlus';
import IconMenu from '../components/Icon/IconMenu';
import IconEdit from '../components/Icon/IconEdit';
import IconTrash from '../components/Icon/IconTrash';
import IconCalendarDays from '../components/Icon/IconCalendar';
import IconBell from '../components/Icon/IconBell';
import IconSearch from '../components/Icon/IconSearch';
import IconX from '../components/Icon/IconX';
import IconChevronDown from '../components/Icon/IconCaretDown';
import IconRefresh from '../components/Icon/IconRefresh';
import { getTasks, createTask, updateTask, getTasksByClient, getDashboardMetrics, updateChecklistStatus, resetTaskStatus } from '../redux/taskSlice';
import { getClient } from '../redux/clientSlice';
import { getEmployee } from '../redux/employeeSlice';
import _ from 'lodash';

// Enhanced debug logging
const debugLog = (label, data) => {
    console.log(`🔍 [${label}]`, data);
    return data;
};

// Get local date string (YYYY-MM-DD) from any date input - SIMPLIFIED VERSION
const getLocalDateString = (dateInput) => {
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string') {
        // If it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateInput);
        }
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) {
        console.error('❌ Invalid date in getLocalDateString:', dateInput);
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TaskManagementDashboard = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const pageAccessData = localData?.pagePermission ? findArrObj(localData.pagePermission, 'label', 'Task Report') : [];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const staffId = localData?.staffId;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Brand colors
    const brandColorPrimary = '#1d7dbe';
    const brandColorSecondary = '#f5903a';
    const brandColorLight = '#4a9fe4';

    // Get data from Redux stores
    const { tasks, tasksByClient, dashboardMetrics, loading, error, createTaskSuccess, updateTaskSuccess } = useSelector((state) => state.TaskSlice);
    const { clientData: clients } = useSelector((state) => state.ClientSlice);
    const { employeeData: employees } = useSelector((state) => state.EmployeeSlice);

    // State variables
    const [showTaskFormModal, setShowTaskFormModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    // CHANGED: Renamed to showCompletedTasksToggle for clarity - default false (show pending/in-progress)
    const [showCompletedTasksToggle, setShowCompletedTasksToggle] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => {
        const todayLocal = getLocalDateString(new Date());
        debugLog('Initial selectedDate', { todayLocal, now: new Date() });
        return todayLocal;
    });
    const [viewMode, setViewMode] = useState('desktop');
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [completedTaskId, setCompletedTaskId] = useState(null);
    const [taskDescription, setTaskDescription] = useState('');
    const [dateSearch, setDateSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Search and filter state - UPDATED
    const [showSearch, setShowSearch] = useState(true);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedStaff: null,
        selectedClient: null,
        startDate: '',
        toDate: '',
    });
    const [appliedFilters, setAppliedFilters] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [staffFilterList, setStaffFilterList] = useState([]);
    const [staffScrollRef, setStaffScrollRef] = useState(null);

    // Form state
    const [formState, setFormState] = useState({
        taskName: '',
        clientId: '',
        description: '',
        staff: [],
        date: getLocalDateString(new Date()),
        enableNotifications: false,
        enableChecklist: false,
    });

    // Optional sections state
    const [notifications, setNotifications] = useState([]);
    const [checklists, setChecklists] = useState([{ id: Date.now(), text: '', completed: false }]);
    const [formErrors, setFormErrors] = useState([]);

    // UI states for dropdowns
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showStaffDropdown, setShowStaffDropdown] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');

    const clientDropdownRef = useRef(null);
    const staffDropdownRef = useRef(null);
    const dateScrollRef = useRef(null);
    const dateSearchInputRef = useRef(null);
    const dateItemRefs = useRef([]); // NEW: Refs for each date item

    // Get the current month and year from selectedDate
    const getCurrentMonthYear = useCallback(() => {
        const date = new Date(selectedDate);
        return {
            month: date.getMonth(),
            year: date.getFullYear(),
        };
    }, [selectedDate]);

    // Generate month dates for the calendar view - UPDATED TO USE selectedDate's month/year
    const monthDates = useMemo(() => {
        const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dates = [];
        const todayLocal = getLocalDateString(new Date());

        debugLog('monthDates - Generating', {
            selectedDate,
            currentMonth,
            currentYear,
            daysInMonth,
            todayLocal,
        });

        // Also get dates from previous month (for display purposes)
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

        // Get first day of current month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        // Add dates from previous month to fill the grid
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const date = new Date(prevMonthYear, prevMonth, day);
            const dateString = getLocalDateString(date);
            dates.push({
                date: dateString,
                day,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday: dateString === todayLocal,
                isSelected: dateString === selectedDate,
                fullDate: date,
                isCurrentMonth: false,
                isPrevMonth: true,
            });
        }

        // Add dates for current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = getLocalDateString(date);
            const isToday = dateString === todayLocal;
            const isSelected = dateString === selectedDate;
            dates.push({
                date: dateString,
                day: day,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday,
                isSelected,
                fullDate: date,
                isCurrentMonth: true,
                isPrevMonth: false,
            });
        }

        // Add dates from next month to complete the grid (up to 42 dates total for 6 rows)
        const totalDates = dates.length;
        const remainingDates = 42 - totalDates;
        for (let day = 1; day <= remainingDates; day++) {
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const date = new Date(nextMonthYear, nextMonth, day);
            const dateString = getLocalDateString(date);
            dates.push({
                date: dateString,
                day: day,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday: dateString === todayLocal,
                isSelected: dateString === selectedDate,
                fullDate: date,
                isCurrentMonth: false,
                isPrevMonth: false,
                isNextMonth: true,
            });
        }

        debugLog('monthDates - Final', {
            datesLength: dates.length,
            firstDayOfMonth,
            selectedDate,
        });

        return dates;
    }, [selectedDate, getCurrentMonthYear]);

    // Scroll to selected date when it changes - CORRECTED VERSION
    useEffect(() => {
        if (!dateScrollRef.current || !monthDates.length) return;

        const index = monthDates.findIndex((d) => d.date === selectedDate);
        if (index === -1) return;

        const container = dateScrollRef.current;
        const item = dateItemRefs.current[index];

        if (!item) {
            // If item ref not available yet, wait a bit and retry
            setTimeout(() => {
                const retryItem = dateItemRefs.current[index];
                if (retryItem) {
                    const containerWidth = container.offsetWidth;
                    const itemWidth = retryItem.offsetWidth;
                    const itemLeft = retryItem.offsetLeft;

                    const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

                    container.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth',
                    });
                }
            }, 50);
            return;
        }

        const containerWidth = container.offsetWidth;
        const itemWidth = item.offsetWidth;
        const itemLeft = item.offsetLeft;

        const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
        });
    }, [selectedDate, monthDates]);

    // Transform employee data if needed
    const transformedEmployees = useMemo(() => {
        if (!employees) return [];

        if (Array.isArray(employees)) {
            return employees.map((emp) => ({
                employeeId: emp.employeeId || emp.id || emp.value || '',
                employeeName: emp.employeeName || emp.name || emp.label || 'Unknown',
                roleName: emp.roleName || emp.role || 'Employee',
            }));
        }

        if (employees.data && Array.isArray(employees.data)) {
            return employees.data.map((emp) => ({
                employeeId: emp.employeeId || emp.id || emp.value || '',
                employeeName: emp.employeeName || emp.name || emp.label || 'Unknown',
                roleName: emp.roleName || emp.role || 'Employee',
            }));
        }

        return [];
    }, [employees]);

    // Transform client data if needed
    const transformedClients = useMemo(() => {
        if (!clients) return [];

        if (Array.isArray(clients)) {
            return clients.map((client) => ({
                clientId: client.clientId || client.id || client.value || '',
                clientName: client.clientName || client.name || client.label || 'Unknown Client',
            }));
        }

        if (clients.data && Array.isArray(clients.data)) {
            return clients.data.map((client) => ({
                clientId: client.clientId || client.id || client.value || '',
                clientName: client.clientName || client.name || client.label || 'Unknown Client',
            }));
        }

        return [];
    }, [clients]);

    // Initialize staff filter list
    useEffect(() => {
        if (transformedEmployees && Array.isArray(transformedEmployees)) {
            // Create staff filter list with "All" option first
            const staffList = [
                {
                    id: 'all',
                    name: 'All',
                    value: null,
                    isSelected: filters.selectedStaff === null
                },
                ...transformedEmployees.map((emp) => ({
                    id: emp.employeeId,
                    name: emp.employeeName,
                    value: emp.employeeId,
                    isSelected: filters.selectedStaff === emp.employeeId
                }))
            ];
            setStaffFilterList(staffList);
            
            // For non-Super Admin, auto-select current user
            if (roleIdforRole !== 'Super Admin' && staffId) {
                setFilters((prev) => ({
                    ...prev,
                    selectedStaff: staffId
                }));
                
                // Find and select current user in staff list
                const updatedList = staffList.map(staff => ({
                    ...staff,
                    isSelected: staff.id === staffId
                }));
                setStaffFilterList(updatedList);
            }
        }
    }, [transformedEmployees, roleIdforRole, staffId, filters.selectedStaff]);

    // Handle staff filter selection - UPDATED TO TRIGGER API CALL
    const handleStaffFilterSelect = async (staffId) => {
        const newSelectedStaff = staffId === 'all' ? null : staffId;
        
        // Update filters
        const updatedFilters = {
            ...filters,
            selectedStaff: newSelectedStaff
        };
        setFilters(updatedFilters);
        
        // Update staff filter list with selection
        const updatedList = staffFilterList.map(staff => ({
            ...staff,
            isSelected: (staffId === 'all' && staff.id === 'all') || 
                       (staffId !== 'all' && staff.id === staffId)
        }));
        setStaffFilterList(updatedList);
        
        // Trigger API call with updated filters
        await applyFilters(updatedFilters);
    };

    // Apply filters function - NEW
    const applyFilters = async (filterParams) => {
        setSearchLoading(true);
        
        try {
            const searchFilters = {
                isActive: 1,
                date: selectedDate, // Always include selected date
            };

            if (filterParams.selectedStaff) {
                searchFilters.assignedTo = filterParams.selectedStaff;
            } else if (roleIdforRole !== 'Super Admin' && staffId) {
                // For non-Super Admin, always filter by their staff ID
                searchFilters.assignedTo = staffId;
            }

            if (filterParams.selectedClient) {
                searchFilters.clientId = filterParams.selectedClient;
            }

            if (filterParams.startDate) {
                searchFilters.startDate = filterParams.startDate;
            }

            if (filterParams.toDate) {
                searchFilters.toDate = filterParams.toDate;
            }

            if (filterParams.searchQuery) {
                searchFilters.taskName = filterParams.searchQuery;
            }

            debugLog('Applying filters', searchFilters);
            await dispatch(getTasks(searchFilters));
            setAppliedFilters(filterParams);
        } catch (error) {
            console.error('Error applying filters:', error);
            showMessage('error', 'Failed to apply filters');
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle date search input
    useEffect(() => {
        if (!dateSearch || dateSearch.trim() === '') return;

        let parsedDate;

        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateSearch)) {
            const [year, month, day] = dateSearch.split('-').map(Number);
            parsedDate = new Date(year, month - 1, day);
        } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateSearch)) {
            const parts = dateSearch.split(/[\/\-]/);
            const date1 = new Date(parts[2], parts[1] - 1, parts[0]);
            const date2 = new Date(parts[2], parts[0] - 1, parts[1]);
            parsedDate = !isNaN(date1.getTime()) ? date1 : date2;
        } else if (/^\d{1,2}$/.test(dateSearch)) {
            const day = parseInt(dateSearch, 10);
            const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
            parsedDate = new Date(currentYear, currentMonth, day);
        } else if (/today|tomorrow|yesterday/i.test(dateSearch)) {
            const today = new Date();
            if (dateSearch.toLowerCase() === 'today') {
                parsedDate = new Date(today);
            } else if (dateSearch.toLowerCase() === 'tomorrow') {
                parsedDate = new Date(today);
                parsedDate.setDate(today.getDate() + 1);
            } else if (dateSearch.toLowerCase() === 'yesterday') {
                parsedDate = new Date(today);
                parsedDate.setDate(today.getDate() - 1);
            }
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
            const formattedDate = getLocalDateString(parsedDate);

            const exists = monthDates.some((date) => date.date === formattedDate);

            if (exists) {
                setSelectedDate(formattedDate);
                // Trigger API call with new date
                handleDateSelect(formattedDate);
                showMessage('success', `Navigated to ${formattedDate}`);
            } else {
                setSelectedDate(formattedDate);
                handleDateSelect(formattedDate);
                showMessage('info', `Date ${formattedDate} is outside current view`);
            }

            setDateSearch('');
            if (dateSearchInputRef.current) {
                dateSearchInputRef.current.blur();
            }
        } else {
            const matchingDate = monthDates.find((date) => {
                if (/^\d{1,2}$/.test(dateSearch)) {
                    const day = parseInt(dateSearch, 10);
                    return date.day === day && date.isCurrentMonth;
                }
                return date.date.includes(dateSearch);
            });

            if (matchingDate) {
                setSelectedDate(matchingDate.date);
                handleDateSelect(matchingDate.date);
                showMessage('success', `Navigated to ${matchingDate.date}`);
                setDateSearch('');
                if (dateSearchInputRef.current) {
                    dateSearchInputRef.current.blur();
                }
            } else {
                showMessage('error', 'Date not found. Try format: YYYY-MM-DD or day number');
            }
        }
    }, [dateSearch, monthDates, getCurrentMonthYear]);

    // Get selected client name
    const selectedClientName = useMemo(() => {
        if (!formState.clientId || !transformedClients) return '';
        const client = transformedClients.find((c) => c.clientId === formState.clientId);
        return client ? client.clientName : '';
    }, [formState.clientId, transformedClients]);

    // Fetch all data on component mount and when selectedDate changes - UPDATED
    useEffect(() => {
        const fetchData = async () => {
            try {
                debugLog('fetchData - Starting', { selectedDate });
                
                // Fetch tasks with current filters
                await applyFilters({...filters, date: selectedDate});
                
                // Fetch other data
                await dispatch(getTasksByClient());
                await dispatch(getDashboardMetrics());
                await dispatch(getClient());
                await dispatch(getEmployee());
                debugLog('fetchData - Completed', { selectedDate });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [dispatch]); // Removed selectedDate from dependency to prevent auto-refresh on date change

    // Fetch tasks when selectedDate changes - NEW
    useEffect(() => {
        const fetchTasksForDate = async () => {
            try {
                await applyFilters({...filters, date: selectedDate});
            } catch (error) {
                console.error('Error fetching tasks for date:', error);
            }
        };

        fetchTasksForDate();
    }, [selectedDate]);

    // Handle task creation/update success
    useEffect(() => {
        if (createTaskSuccess) {
            showMessage('success', 'Task created successfully!');
            setShowTaskFormModal(false);
            resetForm();
            dispatch(resetTaskStatus());
            // Refresh tasks with current filters
            applyFilters(filters);
        }

        if (updateTaskSuccess) {
            showMessage('success', 'Task updated successfully!');
            setShowTaskFormModal(false);
            resetForm();
            dispatch(resetTaskStatus());
            // Refresh tasks with current filters
            applyFilters(filters);
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetTaskStatus());
        }
    }, [createTaskSuccess, updateTaskSuccess, error, dispatch]);

    // Responsive view handling
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setViewMode('mobile');
            else if (width < 1024) setViewMode('tablet');
            else setViewMode('desktop');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
                setShowClientDropdown(false);
            }
            if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target)) {
                setShowStaffDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calculate metrics from fetched data - UPDATED to show active tasks by default
    const calculateMetrics = useMemo(() => {
        // Use all tasks for metrics, not filtered by date
        const activeTasks = tasks.filter(task => 
            task.status === 'pending' || task.status === 'in-progress'
        );
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const totalTasks = tasks.length;

        return {
            totalTasks: {
                value: totalTasks.toString(),
                percentage: Math.min(totalTasks * 2, 100),
                description: 'Total Tasks',
            },
            pendingTasks: {
                value: activeTasks.length.toString(),
                percentage: totalTasks > 0 ? Math.round((activeTasks.length / totalTasks) * 100) : 0,
                description: 'Active Tasks',
            },
            inProgressTasks: {
                value: activeTasks.filter(task => task.status === 'in-progress').length.toString(),
                percentage: totalTasks > 0 ? Math.round((activeTasks.filter(task => task.status === 'in-progress').length / totalTasks) * 100) : 0,
                description: 'In Progress',
            },
            completedTasks: {
                value: completedTasks.length.toString(),
                percentage: totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0,
                description: 'Completed',
            },
        };
    }, [tasks]);

    // Get tasks for selected date - UPDATED to filter by toggle state
    const tasksForSelectedDate = useMemo(() => {
        debugLog('tasksForSelectedDate - Starting', {
            tasksCount: tasks.length,
            selectedDate,
            showCompletedTasksToggle,
        });

        const filteredTasks = tasks.filter((task) => {
            if (!task.dueDate) {
                return false;
            }
            const taskDueDate = new Date(task.dueDate);
            const taskDateLocal = getLocalDateString(taskDueDate);
            
            // Check if task matches selected date
            const dateMatches = taskDateLocal === selectedDate;
            
            // Filter by toggle state
            if (showCompletedTasksToggle) {
                // Show only completed tasks when toggle is ON
                return dateMatches && task.status === 'completed';
            } else {
                // Show pending/in-progress tasks when toggle is OFF (default)
                return dateMatches && (task.status === 'pending' || task.status === 'in-progress');
            }
        });

        debugLog('tasksForSelectedDate - Result', {
            filteredTasksCount: filteredTasks.length,
            selectedDate,
            showCompletedTasksToggle,
        });

        return filteredTasks;
    }, [tasks, selectedDate, showCompletedTasksToggle]);

    // Get pending tasks (active tasks) - UPDATED
    const activeTasks = useMemo(() => {
        return tasksForSelectedDate.filter((task) => 
            task.status === 'pending' || task.status === 'in-progress'
        );
    }, [tasksForSelectedDate]);

    // Get completed tasks - NEW
    const completedTasks = useMemo(() => {
        return tasksForSelectedDate.filter((task) => task.status === 'completed');
    }, [tasksForSelectedDate]);

    // Reset form
    const resetForm = () => {
        setFormState({
            taskName: '',
            clientId: '',
            description: '',
            staff: roleIdforRole === 'Super Admin' ? [] : staffId ? [staffId] : [],
            date: getLocalDateString(new Date()),
            enableNotifications: false,
            enableChecklist: false,
        });
        setNotifications([]);
        setChecklists([{ id: Date.now(), text: '', completed: false }]);
        setEditingTask(null);
        setFormErrors([]);
        setClientSearch('');
        setStaffSearch('');
        setShowClientDropdown(false);
        setShowStaffDropdown(false);
    };

    // Open task form for editing
    const openEditTaskForm = (task) => {
        debugLog('openEditTaskForm', { task });
        setEditingTask(task);
        setFormState({
            taskName: task.taskName,
            clientId: task.clientId,
            description: task.description || '',
            staff: task.assignedTo || [],
            date: task.dueDate ? getLocalDateString(new Date(task.dueDate)) : getLocalDateString(new Date()),
            enableNotifications: task.enableNotifications || false,
            enableChecklist: task.enableChecklist || false,
        });

        if (task.checklists && task.checklists.length > 0) {
            setChecklists(
                task.checklists.map((item) => ({
                    id: item.checklistId || Date.now(),
                    text: item.text,
                    completed: item.completed,
                }))
            );
        } else {
            setChecklists([{ id: Date.now(), text: '', completed: false }]);
        }

        if (task.reminders && task.reminders.length > 0) {
            setNotifications(
                task.reminders.map((reminder) => ({
                    id: reminder.reminderId || Date.now(),
                    date: reminder.date,
                    time: reminder.time,
                    enabled: reminder.enabled,
                }))
            );
        } else {
            setNotifications([]);
        }

        const newSelectedDate = task.dueDate ? getLocalDateString(new Date(task.dueDate)) : getLocalDateString(new Date());
        setSelectedDate(newSelectedDate);
        setShowTaskFormModal(true);
    };

    // Handle staff selection - only for Super Admin
    const handleStaffToggle = (staffId) => {
        if (roleIdforRole === 'Super Admin') {
            setFormState((prev) => ({
                ...prev,
                staff: prev.staff.includes(staffId) ? prev.staff.filter((id) => id !== staffId) : [...prev.staff, staffId],
            }));
        }
    };

    // Add checklist item
    const addChecklistItem = () => {
        setChecklists([...checklists, { id: Date.now(), text: '', completed: false }]);
    };

    // Remove checklist item
    const removeChecklistItem = (index) => {
        const updatedChecklists = checklists.filter((_, i) => i !== index);
        setChecklists(updatedChecklists);
    };

    // Handle checklist change
    const handleChecklistChange = (index, value) => {
        const updatedChecklists = [...checklists];
        updatedChecklists[index] = { ...updatedChecklists[index], text: value };
        setChecklists(updatedChecklists);
    };

    // Add notification
    const addNotification = () => {
        setNotifications([
            ...notifications,
            {
                id: Date.now(),
                date: getLocalDateString(new Date()),
                time: '09:00',
                enabled: true,
            },
        ]);
    };

    // Remove notification
    const removeNotification = (index) => {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(updatedNotifications);
    };

    // Handle notification change
    const handleNotificationChange = (index, field, value) => {
        const updatedNotifications = [...notifications];
        updatedNotifications[index] = { ...updatedNotifications[index], [field]: value };
        setNotifications(updatedNotifications);
    };

    // Handle search form submission - UPDATED
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await applyFilters(filters);
    };

    // Clear search filters - UPDATED
    const handleClearSearch = async () => {
        const clearedFilters = {
            searchQuery: '',
            selectedStaff: roleIdforRole !== 'Super Admin' && staffId ? staffId : null,
            selectedClient: null,
            startDate: '',
            toDate: '',
        };
        
        setFilters(clearedFilters);
        setAppliedFilters(null);
        setShowDateFilter(false);
        
        // Update staff filter list
        if (staffFilterList.length > 0) {
            const updatedList = staffFilterList.map(staff => ({
                ...staff,
                isSelected: (roleIdforRole !== 'Super Admin' && staff.id === staffId) || 
                           (roleIdforRole === 'Super Admin' && staff.id === 'all')
            }));
            setStaffFilterList(updatedList);
        }
        
        // Apply cleared filters
        await applyFilters(clearedFilters);
    };

    // Toggle date filter - UPDATED
    const toggleDateFilter = () => {
        const newShowDateFilter = !showDateFilter;
        setShowDateFilter(newShowDateFilter);
        
        const updatedFilters = {
            ...filters,
            startDate: newShowDateFilter ? getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) : '',
            toDate: newShowDateFilter ? getLocalDateString(new Date()) : '',
        };
        
        setFilters(updatedFilters);
        
        // Apply filters if date filter is turned on
        if (newShowDateFilter) {
            applyFilters(updatedFilters);
        } else {
            // If turning off date filter, remove date range and reapply
            const filtersWithoutDate = {...updatedFilters, startDate: '', toDate: ''};
            setFilters(filtersWithoutDate);
            applyFilters(filtersWithoutDate);
        }
    };

    // Handle form submission
    const handleSubmitTask = async () => {
        setFormErrors([]);
        const errors = [];

        if (!formState.taskName || formState.taskName.trim() === '') {
            errors.push('taskName');
        }

        if (!formState.clientId || String(formState.clientId).trim() === '') {
            errors.push('client');
        }

        // For non-Super Admin users, staff is automatically assigned
        if (roleIdforRole === 'Super Admin' && (!formState.staff || formState.staff.length === 0)) {
            errors.push('staff');
        }

        if (errors.length > 0) {
            setFormErrors(errors);
            showMessage('error', 'Please fill in all required fields');
            return;
        }

        const taskData = {
            taskName: formState.taskName.trim(),
            clientId: String(formState.clientId).trim(),
            description: formState.description?.trim() || '',
            assignedTo: roleIdforRole === 'Super Admin' ? formState.staff : staffId ? [staffId] : [],
            dueDate: formState.date,
            enableNotifications: formState.enableNotifications,
            enableChecklist: formState.enableChecklist,
            status: editingTask ? editingTask.status : 'pending',
        };

        if (formState.enableChecklist) {
            taskData.checklists = checklists
                .filter((item) => item.text.trim() !== '')
                .map((item) => ({
                    text: item.text,
                    completed: item.completed || false,
                }));
        }

        if (formState.enableNotifications) {
            taskData.reminders = notifications
                .filter((notification) => notification.date && notification.time)
                .map((notification) => ({
                    date: notification.date,
                    time: notification.time,
                    enabled: notification.enabled !== false,
                }));
        }

        debugLog('handleSubmitTask', { taskData, editingTask, roleIdforRole, staffId });

        try {
            if (editingTask) {
                await dispatch(
                    updateTask({
                        taskId: editingTask.taskId,
                        request: taskData,
                    })
                );
            } else {
                await dispatch(createTask(taskData));
            }
        } catch (error) {
            console.error('Error saving task:', error);
            showMessage('error', 'Failed to save task');
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        const confirm = await showConfirmationDialog('Are you sure you want to delete this task?');
        if (confirm) {
            try {
                await dispatch(
                    updateTask({
                        taskId,
                        request: { isActive: false },
                    })
                );
                showMessage('success', 'Task deleted successfully!');
                // Refresh tasks after deletion
                await applyFilters(filters);
            } catch (error) {
                showMessage('error', 'Failed to delete task');
            }
        }
    };

    // Toggle checklist item
    const toggleChecklistItem = async (taskId, checklistId, isCompleted) => {
        try {
            await dispatch(
                updateChecklistStatus({
                    checklistId,
                    request: { isCompleted: !isCompleted },
                })
            );
            await applyFilters(filters);

            const task = tasks.find((t) => t.taskId === taskId);

            if (task && task.enableChecklist && task.checklists) {
                const allCompleted = task.checklists.every((item) => item.completed);
                if (allCompleted) {
                    const confirm = await showConfirmationDialog('All checklist items are completed! Would you like to mark the task as completed?');
                    if (confirm) {
                        setCompletedTaskId(taskId);
                        setTaskDescription(task.description || '');
                        setShowDescriptionModal(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating checklist:', error);
            showMessage('error', 'Failed to update checklist');
        }
    };

    // Mark all checklists as completed
    const markAllChecklistsCompleted = async (taskId) => {
        const task = tasks.find((t) => t.taskId === taskId);
        if (!task || !task.checklists) return;

        try {
            for (const checklist of task.checklists) {
                if (!checklist.completed && checklist.checklistId) {
                    await dispatch(
                        updateChecklistStatus({
                            checklistId: checklist.checklistId,
                            request: { isCompleted: true },
                        })
                    );
                }
            }
            setCompletedTaskId(taskId);
            setTaskDescription(task.description || '');
            setShowDescriptionModal(true);
            await applyFilters(filters);
        } catch (error) {
            console.error('Error completing all checklists:', error);
            showMessage('error', 'Failed to update checklists');
        }
    };

    // Navigate to today
    const goToToday = async () => {
        const today = new Date();
        const todayString = getLocalDateString(today);
        debugLog('goToToday', {
            today,
            todayString,
            currentSelectedDate: selectedDate,
        });
        setSelectedDate(todayString);
        setDateSearch('');
        // Trigger API call for today's tasks
        handleDateSelect(todayString);
    };

    // Get month name for display
    const getMonthName = () => {
        const date = new Date(selectedDate);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Handle date selection from the scrollable list - UPDATED
    const handleDateSelect = async (dateString) => {
        debugLog('handleDateSelect', { dateString });
        setSelectedDate(dateString);
        setDateSearch('');
        // Apply current filters with new date
        await applyFilters({...filters, date: dateString});
    };

    // Handle date selection from calendar modal
    const handleCalendarDateSelect = async (dateString) => {
        debugLog('handleCalendarDateSelect', { dateString });
        setSelectedDate(dateString);
        setDateSearch('');
        setShowCalendarModal(false);
        // Apply current filters with new date
        await applyFilters({...filters, date: dateString});
    };

    // Handle date search input key press (Enter key)
    const handleDateSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    // Clear date search
    const clearDateSearch = () => {
        setDateSearch('');
        if (dateSearchInputRef.current) {
            dateSearchInputRef.current.focus();
        }
    };

    // Task Card Component - UPDATED to show different status indicators
    const TaskCard = ({ task }) => {
        const client = transformedClients?.find((c) => c.clientId === task.clientId);
        const clientColor = client ? '#1d7dbe' : brandColorPrimary;
        const completedChecklists = task.checklists?.filter((item) => item.completed).length || 0;
        const totalChecklists = task.checklists?.length || 0;
        const progress = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;
        const canMarkAsCompleted = !task.enableChecklist || (task.enableChecklist && totalChecklists > 0 && progress === 100);
        const hasChecklists = task.enableChecklist && task.checklists && task.checklists.length > 0;
        
        // Different status styles
        const getStatusStyle = () => {
            if (task.status === 'completed') {
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-600',
                    icon: '✓',
                    label: 'Completed'
                };
            } else if (task.status === 'in-progress') {
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-600',
                    icon: '↻',
                    label: 'In Progress'
                };
            } else {
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-600',
                    icon: '●',
                    label: 'Pending'
                };
            }
        };
        
        const statusStyle = getStatusStyle();

        return (
            <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-md border border-gray-200 mb-3 lg:mb-4 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-2 lg:mb-3">
                    <div className="flex-1">
                       <div className="flex flex-wrap items-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                            <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: clientColor }}></div>
                            <span
                                className="text-xs font-medium px-1 lg:px-2 py-0.5 lg:py-1 rounded"
                                style={{
                                    backgroundColor: `${clientColor}15`,
                                    color: clientColor,
                                }}
                            >
                                {client?.clientName || task.clientName || 'Unknown Client'}
                            </span>
                            <span
                                className={`text-xs font-medium px-1 lg:px-2 py-0.5 lg:py-1 rounded ${statusStyle.bg} ${statusStyle.text}`}
                            >
                                {statusStyle.icon} {statusStyle.label}
                            </span>
                            {task.startDate && (
                                <span
                                    className="text-xs font-medium px-1 lg:px-2 py-0.5 lg:py-1 rounded bg-gray-100 text-gray-600"
                                    title={`Start Date: ${new Date(task.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}`}
                                >
                                    📅 {new Date(task.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            )}
                        </div>
                        <h4 className="font-semibold text-sm lg:text-base text-gray-900 mb-1">{task.taskName}</h4>
                        {task.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>}
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                        {(task.status === 'pending' || task.status === 'in-progress') && (
                            <button
                                onClick={() => {
                                    if (canMarkAsCompleted) {
                                        setCompletedTaskId(task.taskId);
                                        setTaskDescription(task.description || '');
                                        setShowDescriptionModal(true);
                                    } else {
                                        showMessage('info', hasChecklists ? 'Please complete all checklist items first' : 'Task completion requires description');
                                    }
                                }}
                                className={`p-1 lg:p-2 rounded transition-colors ${
                                    canMarkAsCompleted ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                title={canMarkAsCompleted ? 'Mark task as completed' : hasChecklists ? 'Complete all checklist items first' : 'Task completion requires description'}
                                disabled={!canMarkAsCompleted}
                            >
                                <IconCheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                        )}
                        {hasChecklists && task.status !== 'completed' && (
                            <button
                                onClick={() => markAllChecklistsCompleted(task.taskId)}
                                className="p-1 lg:p-2 rounded transition-colors bg-blue-100 text-blue-600 hover:bg-blue-200"
                                title="Complete all checklists"
                            >
                                <IconList className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2 lg:mb-4">
                    <IconUserPlus className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex -space-x-2 overflow-hidden">
                        {task.staffDetails?.slice(0, viewMode === 'mobile' ? 2 : 3).map((staff, index) => (
                            <div
                                key={staff.employeeId}
                                className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                style={{
                                    backgroundColor: brandColorLight,
                                    color: 'white',
                                    zIndex: 10 - index,
                                }}
                                title={staff.employeeName}
                            >
                                {staff.employeeName?.charAt(0) || 'U'}
                            </div>
                        ))}
                        {task.staffDetails?.length > (viewMode === 'mobile' ? 2 : 3) && (
                            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold bg-gray-300 text-gray-700 flex-shrink-0">
                                +{task.staffDetails.length - (viewMode === 'mobile' ? 2 : 3)}
                            </div>
                        )}
                    </div>
                </div>

                {task.enableNotifications && task.reminders && task.reminders.length > 0 && (
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                        <IconBell className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                            {task.reminders.slice(0, viewMode === 'mobile' ? 1 : 2).map((reminder, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {new Date(reminder.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{reminder.time}</span>
                                </div>
                            ))}
                            {task.reminders.length > (viewMode === 'mobile' ? 1 : 2) && <span className="text-xs text-gray-500">+{task.reminders.length - (viewMode === 'mobile' ? 1 : 2)} more</span>}
                        </div>
                    </div>
                )}

                {task.enableChecklist && totalChecklists > 0 && (
                    <div className="mb-2 lg:mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress: {progress === 100 ? '100% (Completed)' : `${progress}%`}</span>
                            <span>
                                {progress === 100 ? 'All' : completedChecklists}/{totalChecklists}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 lg:h-2">
                            <div
                                className="h-1 lg:h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: progress === 100 ? '#10b981' : clientColor,
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {task.enableChecklist && task.checklists && task.checklists.length > 0 && task.status !== 'completed' && (
                    <div className="space-y-1 lg:space-y-2 mb-2 lg:mb-3">
                        {task.checklists.slice(0, viewMode === 'mobile' ? 2 : 3).map((item, index) => (
                            <div key={item.checklistId || index} className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleChecklistItem(task.taskId, item.checklistId, item.completed)}
                                    className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                                        item.completed ? 'bg-green-500 border-green-500 hover:bg-green-600' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {item.completed && (
                                        <svg className="w-2 h-2 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                                <span className={`text-xs lg:text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'} truncate`}>{item.text}</span>
                            </div>
                        ))}
                        {task.checklists.length > (viewMode === 'mobile' ? 2 : 3) && (
                            <div className="text-xs text-gray-500 pl-6 lg:pl-7">+{task.checklists.length - (viewMode === 'mobile' ? 2 : 3)} more items</div>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                              })
                            : 'No date'}
                    </div>
                    <div className="flex justify-end gap-2">
                        {(task.status === 'pending' || task.status === 'in-progress') && (
                            <button
                                onClick={() => {
                                    if (canMarkAsCompleted) {
                                        setCompletedTaskId(task.taskId);
                                        setTaskDescription(task.description || '');
                                        setShowDescriptionModal(true);
                                    } else {
                                        showMessage('info', hasChecklists ? 'Please complete all checklist items first' : 'Task completion requires description');
                                    }
                                }}
                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                                    canMarkAsCompleted ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!canMarkAsCompleted}
                            >
                                <IconCheckCircle className="w-3 h-3" />
                                <span>Complete</span>
                            </button>
                        )}
                        {roleIdforRole === 'Super Admin' && (
                        <button
                            onClick={() => openEditTaskForm(task)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            style={{ color: brandColorPrimary }}
                        >
                            <IconEdit className="w-3 h-3" />
                            <span>Edit</span>
                        </button>
                        )}
                        {roleIdforRole === 'Super Admin' && (
                        <button onClick={() => deleteTask(task.taskId)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                            <IconTrash className="w-3 h-3" />
                            <span>Delete</span>
                        </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Main Stats Card
    const MainStatCard = ({ title, value, percentage, description, icon: Icon, onClick, isOrange = false }) => {
        const primaryColor = isOrange ? brandColorSecondary : brandColorPrimary;

        return (
            <div
                className="relative bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                onClick={onClick}
            >
                <div className="absolute inset-0 opacity-5" style={{ backgroundColor: primaryColor }}></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 lg:mb-4">
                        <div className="p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300" style={{ backgroundColor: `${primaryColor}15` }}>
                            <Icon style={{ color: primaryColor }} className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                    </div>
                    <h3 className="text-gray-600 text-xs lg:text-sm font-medium uppercase tracking-wider mb-1 lg:mb-2">{title}</h3>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">{value}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1 lg:h-2 mb-1 lg:mb-2">
                        <div className="h-1 lg:h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%`, backgroundColor: primaryColor }}></div>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{description}</p>
                </div>
            </div>
        );
    };

    // Calendar Modal Component
    const CalendarModal = () => {
        const today = new Date();
        const [currentMonth, setCurrentMonth] = useState(today.getMonth());
        const [currentYear, setCurrentYear] = useState(today.getFullYear());

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const getDaysInMonth = (year, month) => {
            return new Date(year, month + 1, 0).getDate();
        };

        const getFirstDayOfMonth = (year, month) => {
            return new Date(year, month, 1).getDay();
        };

        const handlePrevMonth = () => {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        };

        const handleNextMonth = () => {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        };

        const handleDateSelect = (day) => {
            const selectedDate = new Date(currentYear, currentMonth, day);
            const formattedDate = getLocalDateString(selectedDate);
            handleCalendarDateSelect(formattedDate);
        };

        const renderCalendar = () => {
            const daysInMonth = getDaysInMonth(currentYear, currentMonth);
            const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
            const days = [];

            for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="h-8 lg:h-10"></div>);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateStr = getLocalDateString(date);
                const today = new Date();
                const todayStr = getLocalDateString(today);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasTasks = tasks.some((task) => {
                    if (!task.dueDate) return false;
                    const taskDate = getLocalDateString(new Date(task.dueDate));
                    return taskDate === dateStr;
                });

                days.push(
                    <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`h-8 lg:h-10 rounded-lg flex items-center justify-center text-sm lg:text-base font-medium transition-all hover:scale-105 relative ${
                            isSelected ? 'text-white' : isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                        }`}
                        style={{
                            backgroundColor: isSelected ? brandColorPrimary : isToday ? '#dbeafe' : hasTasks ? '#f3f4f6' : 'transparent',
                        }}
                    >
                        {day}
                        {hasTasks && !isSelected && !isToday && <div className="absolute bottom-1 w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full" style={{ backgroundColor: brandColorSecondary }}></div>}
                    </button>
                );
            }

            return days;
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-md">
                    <div className="p-4 lg:p-6 border-b border-gray-200" style={{ backgroundColor: brandColorPrimary, color: 'white' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg lg:text-xl font-bold">Select Date</h2>
                            <button onClick={() => setShowCalendarModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                                {months[currentMonth]} {currentYear}
                            </h3>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-xs lg:text-sm font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 lg:gap-2">{renderCalendar()}</div>
                    </div>
                </div>
            </div>
        );
    };

    // Description Modal Component
    // Description Modal Component - CORRECTED VERSION
    const DescriptionModal = () => {
        const task = tasks.find((t) => t.taskId === completedTaskId);
        const [localDescription, setLocalDescription] = useState(taskDescription);

        // Update localDescription when taskDescription changes
        useEffect(() => {
            setLocalDescription(taskDescription);
        }, [taskDescription]);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-md lg:max-w-lg">
                    <div className="p-4 lg:p-6 border-b border-gray-200" style={{ backgroundColor: brandColorPrimary, color: 'white' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg lg:text-xl font-bold">Task Completion</h2>
                            <button
                                onClick={() => {
                                    setShowDescriptionModal(false);
                                    setCompletedTaskId(null);
                                    setTaskDescription('');
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 lg:p-6">
                        <div className="mb-4 lg:mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                    <IconCheckCircle style={{ color: brandColorPrimary }} className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">{task?.taskName || 'Task'}</h3>
                                    <p className="text-sm text-gray-600">Marking as completed</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional) <span className="text-xs text-gray-500 ml-2">Add notes about the completed task</span>
                                </label>
                                <textarea
                                    value={localDescription}
                                    onChange={(e) => setLocalDescription(e.target.value)}
                                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-offset-1 lg:focus:ring-offset-2 focus:border-transparent transition-all resize-none"
                                    style={{ '--tw-ring-color': brandColorPrimary }}
                                    placeholder="Enter optional description about the completed task..."
                                    rows={4}
                                />
                                <p className="text-xs text-gray-500 mt-1">This description will be saved with the completed task for future reference.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDescriptionModal(false);
                                    setCompletedTaskId(null);
                                    setTaskDescription('');
                                }}
                                className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all text-sm lg:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!completedTaskId) return;

                                    try {
                                        const task = tasks.find((t) => t.taskId === completedTaskId);
                                        if (task && task.taskId) {
                                            await dispatch(
                                                updateTask({
                                                    taskId: task.taskId,
                                                    request: {
                                                        status: 'completed',
                                                        description: localDescription,
                                                        completionDate: new Date().toISOString(),
                                                    },
                                                })
                                            );
                                            showMessage('success', 'Task marked as completed!');
                                            // Update parent state
                                            setTaskDescription(localDescription);
                                            // Refresh tasks after completion
                                            await applyFilters(filters);
                                        }
                                    } catch (error) {
                                        showMessage('error', error.message || 'Failed to complete task');
                                    }

                                    setShowDescriptionModal(false);
                                    setCompletedTaskId(null);
                                }}
                                className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-medium text-white transition-all hover:scale-105 text-sm lg:text-base"
                                style={{ backgroundColor: brandColorSecondary }}
                            >
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
                    <div className="mb-3 lg:mb-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 lg:mb-2" style={{ color: brandColorPrimary }}>
                            Task Manager
                        </h1>
                        <p className="text-sm lg:text-base text-gray-600">Manage team tasks and track progress efficiently</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                        <div className="flex items-center gap-2">
                            {/* CHANGED: Updated toggle label and functionality */}
                            <span className="text-xs lg:text-sm text-gray-600">
                                {showCompletedTasksToggle ? 'Show Active Tasks' : 'Show Completed Tasks'}
                            </span>
                            <button
                                onClick={() => setShowCompletedTasksToggle(!showCompletedTasksToggle)}
                                className={`relative inline-flex h-5 lg:h-6 w-9 lg:w-11 items-center rounded-full transition-colors ${
                                    showCompletedTasksToggle ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                                title={showCompletedTasksToggle ? 'Switch to view active tasks' : 'Switch to view completed tasks'}
                            >
                                <span
                                    className={`inline-block h-3 lg:h-4 w-3 lg:w-4 transform rounded-full bg-white transition ${
                                        showCompletedTasksToggle ? 'translate-x-4 lg:translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>


                {/* Date Navigation */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-2 lg:p-4 shadow-lg border border-gray-100 mb-4 lg:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 lg:mb-4 gap-3">
                        <div>
                            <h2 className="text-sm lg:text-base font-semibold text-gray-700">
                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">{getMonthName()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToToday}
                                className="px-2 lg:px-3 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium text-white transition-all hover:scale-105"
                                style={{ backgroundColor: brandColorPrimary }}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setShowCalendarModal(true)}
                                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 lg:py-2 rounded-lg text-xs lg:text-sm font-medium text-white transition-all hover:scale-105"
                                style={{ backgroundColor: brandColorPrimary }}
                            >
                                <IconCalendarDays className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span className="hidden sm:inline">Calendar</span>
                            </button>
                        </div>
                    </div>

                    {/* Month Dates - Scrollable with CENTERED DATE */}
                    <div className="relative">
                        <div
                            ref={dateScrollRef}
                            className="overflow-x-auto pb-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            <div className="flex space-x-1 lg:space-x-2 min-w-max px-1">
                                {monthDates.map((date, index) => {
                                    const hasTasks = tasks.some((task) => {
                                        if (!task.dueDate) return false;
                                        const taskDate = getLocalDateString(new Date(task.dueDate));
                                        return taskDate === date.date;
                                    });

                                    return (
                                        <button
                                            key={date.date}
                                            ref={(el) => (dateItemRefs.current[index] = el)}
                                            onClick={() => handleDateSelect(date.date)}
                                            className={`flex flex-col items-center align-center p-2 mt-5 lg:p-3 rounded-full lg:rounded-full w-10 h-28 transition-all duration-200 flex-shrink-0 min-w-[60px] lg:min-w-[80px] ${
                                                date.isSelected ? 'scale-105 ring-2 ring-blue-500' : 'hover:scale-105'
                                            }`}
                                            style={{
                                                backgroundColor: date.isSelected
                                                    ? brandColorPrimary
                                                    : date.isToday
                                                    ? `${brandColorPrimary}15`
                                                    : hasTasks && date.isCurrentMonth
                                                    ? '#f3f4f6'
                                                    : !date.isCurrentMonth
                                                    ? '#f9fafb'
                                                    : 'transparent',
                                                color: date.isSelected
                                                    ? 'white'
                                                    : date.isToday
                                                    ? brandColorPrimary
                                                    : hasTasks && date.isCurrentMonth
                                                    ? '#374151'
                                                    : !date.isCurrentMonth
                                                    ? '#9ca3af'
                                                    : '#6b7280',
                                                opacity: date.isCurrentMonth ? 1 : 0.6,
                                            }}
                                        >
                                            <span className="text-xs lg:text-lg text-current opacity-80 mb-2">{date.dayName}</span>
                                            <span
                                                className={`text-lg lg:text-2xl p-3 w-15 h-15 rounded-full font-bold ${
                                                    date.isToday && !date.isSelected ? `text-${brandColorPrimary.replace('#', '')}` : ''
                                                }`}
                                                style={{ backgroundColor: '#ffffff', color: brandColorPrimary }}
                                            >
                                                {date.day}
                                            </span>
                                            <div className="flex gap-1 mt-1">
                                                {date.isToday && !date.isSelected && date.isCurrentMonth && (
                                                    <div className="w-1 h-1 lg:w-2 lg:h-2 rounded-full" style={{ backgroundColor: brandColorPrimary }}></div>
                                                )}
                                                {hasTasks && !date.isSelected && !date.isToday && date.isCurrentMonth && (
                                                    <div className="w-1 h-1 lg:w-2 lg:h-2 rounded-full" style={{ backgroundColor: brandColorSecondary }}></div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <style>{`
    [ref="dateScrollRef"]::-webkit-scrollbar {
      display: none;
    }
  `}</style>

                        {/* Gradient fades for better UX */}
                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
                    </div>
                </div>
                {/* Staff Filter - Only for Super Admin */}
                {roleIdforRole === 'Super Admin' && staffFilterList.length > 0 && (
                    <div className="mb-4 lg:mb-6">
                        <div className="relative">
                            <div
                                ref={staffScrollRef}
                                className="overflow-x-auto pb-1"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                }}
                            >
                                <div className="flex space-x-1.5 lg:space-x-2 min-w-max px-1">
                                    {staffFilterList.map((staff) => (
                                        <button
                                            key={staff.id}
                                            onClick={() => handleStaffFilterSelect(staff.id)}
                                            className={`relative px-3 lg:px-4 py-1.5 lg:py-2 transition-all duration-200 flex-shrink-0 min-w-[70px] lg:min-w-[80px] group ${
                                                staff.isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'
                                            }`}
                                            style={{
                                                backgroundColor: staff.isSelected ? brandColorPrimary : '#f8f9fa',
                                                color: staff.isSelected ? 'white' : '#374151',
                                                border: staff.isSelected ? 'none' : '1px solid #e2e8f0',
                                                borderRadius: '20px',
                                            }}
                                        >
                                            {/* White background inside the text for selected state */}
                                            {staff.isSelected && (
                                                <div className="absolute inset-1 bg-white/10 rounded-[16px]"></div>
                                            )}
                                            
                                            <span className="relative text-xs lg:text-sm font-medium px-1 py-0.5 rounded-[12px]"
                                                style={{
                                                    backgroundColor: staff.isSelected ? 'rgba(255, 255, 255, 0.15)' : 'white',
                                                    display: 'inline-block',
                                                }}
                                            >
                                                {staff.name}
                                            </span>
                                            
                                            {/* Hover effect */}
                                            {!staff.isSelected && (
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[20px]"
                                                    style={{
                                                        backgroundColor: `${brandColorPrimary}10`,
                                                    }}
                                                ></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <style>{`
                                [ref="staffScrollRef"]::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>

                            {/* Gradient fades for better UX - Mobile only */}
                            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
                        </div>
                    </div>
                )}

                {/* Add Task Button */}
                <div className="flex justify-center mb-4 lg:mb-8">
                    <button
                        onClick={() => {
                            resetForm();
                            setFormState((prev) => ({ ...prev, date: selectedDate }));
                            setShowTaskFormModal(true);
                        }}
                        className="text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold flex items-center space-x-2 lg:space-x-3 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: brandColorSecondary }}
                    >
                        <IconPlus className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-sm lg:text-base">Add New Task</span>
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 mx-auto" style={{ borderColor: brandColorPrimary }}></div>
                        <p className="text-gray-600 mt-2 text-sm lg:text-base">Loading dashboard data...</p>
                    </div>
                )}

                {/* Main Stats Grid */}
                {!loading && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
                            <MainStatCard
                                onClick={() => navigate('/tasks')}
                                title="TOTAL TASKS"
                                value={calculateMetrics.totalTasks.value}
                                percentage={calculateMetrics.totalTasks.percentage}
                                description={calculateMetrics.totalTasks.description}
                                icon={IconList}
                            />
                            {/* CHANGED: Updated to show Active Tasks instead of Pending Tasks */}
                            <MainStatCard
                                onClick={() => navigate('/tasks?status=active')}
                                title="ACTIVE TASKS"
                                value={calculateMetrics.pendingTasks.value}
                                percentage={calculateMetrics.pendingTasks.percentage}
                                description={calculateMetrics.pendingTasks.description}
                                icon={IconClock}
                                isOrange={true}
                            />
                            <MainStatCard
                                onClick={() => navigate('/tasks?status=in-progress')}
                                title="IN PROGRESS"
                                value={calculateMetrics.inProgressTasks.value}
                                percentage={calculateMetrics.inProgressTasks.percentage}
                                description={calculateMetrics.inProgressTasks.description}
                                icon={IconUsers}
                            />
                            <MainStatCard
                                onClick={() => navigate('/tasks?status=completed')}
                                title="COMPLETED"
                                value={calculateMetrics.completedTasks.value}
                                percentage={calculateMetrics.completedTasks.percentage}
                                description={calculateMetrics.completedTasks.description}
                                icon={IconCheckCircle}
                                isOrange={true}
                            />
                        </div>

                        {/* Task List for Selected Date */}
                        <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-lg border border-gray-100 mb-4 lg:mb-8">
                            <div className="flex items-center justify-between mb-3 lg:mb-6">
                                <div>
                                    <h2 className="text-base lg:text-xl font-bold text-gray-900">
                                        {showCompletedTasksToggle ? 'Completed Tasks' : 'Active Tasks'} for{' '}
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h2>
                                    <p className="text-xs lg:text-sm text-gray-600 mt-1">
                                        {showCompletedTasksToggle ? completedTasks.length : activeTasks.length} task
                                        {(showCompletedTasksToggle ? completedTasks.length : activeTasks.length) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Task List - UPDATED to show tasks based on toggle state */}
                            {viewMode === 'mobile' ? (
                                <div className="space-y-3">
                                    {showCompletedTasksToggle
                                        ? completedTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                        : activeTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                    }
                                </div>
                            ) : viewMode === 'tablet' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                    {showCompletedTasksToggle
                                        ? completedTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                        : activeTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className="space-y-3 lg:space-y-4">
                                    {showCompletedTasksToggle
                                        ? completedTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                        : activeTasks.map((task) => (
                                            <TaskCard key={task.taskId} task={task} />
                                        ))
                                    }
                                </div>
                            )}

                            {/* Empty state messages - UPDATED */}
                            {showCompletedTasksToggle && completedTasks.length === 0 && (
                                <div className="text-center py-6 lg:py-12">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3 lg:mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                        <IconCheckCircle style={{ color: brandColorPrimary }} className="w-8 h-8 lg:w-10 lg:h-10" />
                                    </div>
                                    <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-1 lg:mb-2">No completed tasks for this date</h3>
                                    <p className="text-gray-500 text-sm lg:text-base">Switch to "Active Tasks" to see pending and in-progress tasks</p>
                                </div>
                            )}

                            {!showCompletedTasksToggle && activeTasks.length === 0 && (
                                <div className="text-center py-6 lg:py-12">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3 lg:mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                        <IconCalendar style={{ color: brandColorPrimary }} className="w-8 h-8 lg:w-10 lg:h-10" />
                                    </div>
                                    <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-1 lg:mb-2">No active tasks for this date</h3>
                                    <p className="text-gray-500 text-sm lg:text-base">
                                        Switch to "Completed Tasks" or click the "+ Add New Task" button to create your first task
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Client Distribution */}
                        <div className="bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-lg border border-gray-100">
                            <h3 className="text-gray-600 text-xs lg:text-sm font-medium uppercase tracking-wider mb-3 lg:mb-4">TASKS BY CLIENT</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 lg:gap-4">
                                {tasksByClient.map((clientTask, index) => (
                                    <div key={clientTask.clientId} className="text-center p-2 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl hover:shadow-md transition-shadow duration-300">
                                        <div
                                            className="w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-2"
                                            style={{ backgroundColor: `${brandColorPrimary}15` }}
                                        >
                                            <IconList style={{ color: brandColorPrimary }} className="w-4 h-4 lg:w-6 lg:h-6" />
                                        </div>
                                        <span className="text-xs lg:text-sm font-medium text-gray-700 block truncate">{clientTask.clientName}</span>
                                        <span className="text-xs text-gray-500">
                                            {clientTask.taskCount} task{clientTask.taskCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Task Form Modal */}
            {showTaskFormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-xl lg:rounded-2xl w-full max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 50 }}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 rounded-t-xl lg:rounded-t-2xl" style={{ borderTopColor: brandColorPrimary, zIndex: 60 }}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg lg:text-2xl font-bold" style={{ color: brandColorPrimary }}>
                                    {editingTask ? 'Edit Task' : 'Create New Task'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowTaskFormModal(false);
                                        resetForm();
                                    }}
                                    className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">{editingTask ? 'Update task details' : 'Create a new task with all necessary details'}</p>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitTask();
                            }}
                            className="p-4 lg:p-6 space-y-4 lg:space-y-6"
                        >
                            {/* General Information */}
                            <div>
                                <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 flex items-center gap-2">
                                    <div className="p-1 lg:p-2 rounded-lg" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                        <IconMenu style={{ color: brandColorPrimary }} className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </div>
                                    General Information
                                    <span className="text-red-500 text-sm">(Required)</span>
                                </h3>
                                <div className="space-y-3 lg:space-y-4">
                                    {/* Task Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Task Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formState.taskName || ''}
                                            onChange={(e) => setFormState((prev) => ({ ...prev, taskName: e.target.value }))}
                                            className={`w-full px-3 lg:px-4 py-2 lg:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:ring-offset-1 lg:focus:ring-offset-2 focus:border-transparent transition-all ${
                                                formErrors.includes('taskName') ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            style={{ '--tw-ring-color': brandColorPrimary }}
                                            placeholder="Enter task name"
                                            required
                                        />
                                        {formErrors.includes('taskName') && <p className="text-red-500 text-xs mt-1">Please enter task name</p>}
                                    </div>

                                    {/* Client Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative" ref={clientDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowClientDropdown(!showClientDropdown)}
                                                className={`w-full px-3 lg:px-4 py-2 lg:py-3 border rounded-lg lg:rounded-xl flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors ${
                                                    formErrors.includes('client') ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            >
                                                {formState.clientId ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{selectedClientName || 'Select a client'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Select a client</span>
                                                )}
                                                <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showClientDropdown && (
                                                <div
                                                    className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg lg:rounded-xl shadow-lg max-h-60 overflow-auto"
                                                    style={{ zIndex: 9999 }}
                                                >
                                                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                                                        <div className="relative">
                                                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={clientSearch}
                                                                onChange={(e) => setClientSearch(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent text-sm"
                                                                style={{ '--tw-ring-color': brandColorPrimary }}
                                                                placeholder="Search clients..."
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            {clientSearch && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setClientSearch('')}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    <IconX className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="py-1">
                                                        {transformedClients.map((client) => (
                                                            <button
                                                                key={client.clientId}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    debugLog('Selecting client', { clientId: client.clientId });
                                                                    setFormState((prev) => ({ ...prev, clientId: client.clientId }));
                                                                    setShowClientDropdown(false);
                                                                    setClientSearch('');
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left ${
                                                                    formState.clientId === client.clientId ? 'bg-blue-50' : ''
                                                                }`}
                                                            >
                                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: brandColorPrimary }}></div>
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium text-gray-900">{client.clientName}</span>
                                                                </div>
                                                                {formState.clientId === client.clientId && (
                                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.includes('client') && <p className="text-red-500 text-xs mt-1">Please select a client</p>}
                                    </div>

                                    {/* Staff Selection - Only for Super Admin */}
                                    {roleIdforRole === 'Super Admin' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assign Staff <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative" ref={staffDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                                                    className={`w-full px-3 lg:px-4 py-2 lg:py-3 border rounded-lg lg:rounded-xl flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors ${
                                                        formErrors.includes('staff') ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                        {formState.staff.length > 0 ? (
                                                            <>
                                                                <IconUserPlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span className="text-sm truncate">
                                                                    {formState.staff.length} staff member{formState.staff.length !== 1 ? 's' : ''} selected
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">Select staff members</span>
                                                        )}
                                                    </div>
                                                    <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                {showStaffDropdown && (
                                                    <div
                                                        className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg lg:rounded-xl shadow-lg max-h-60 overflow-auto"
                                                        style={{ zIndex: 9999 }}
                                                    >
                                                        <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    value={staffSearch}
                                                                    onChange={(e) => setStaffSearch(e.target.value)}
                                                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0 focus:border-transparent text-sm"
                                                                    style={{ '--tw-ring-color': brandColorPrimary }}
                                                                    placeholder="Search staff by name or role..."
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                {staffSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setStaffSearch('')}
                                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <IconX className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {formState.staff.length > 0 && (
                                                            <div className="p-2 border-b border-gray-200">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {formState.staff.map((staffId) => {
                                                                        const staff = transformedEmployees?.find((e) => e.employeeId === staffId);
                                                                        return (
                                                                            <div key={staffId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                                                <span>{staff?.employeeName || staffId}</span>
                                                                                <button type="button" onClick={() => handleStaffToggle(staffId)} className="text-blue-600 hover:text-blue-800">
                                                                                    <IconX className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="py-1">
                                                            {transformedEmployees.map((staff) => (
                                                                <div
                                                                    key={staff.employeeId}
                                                                    className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                                        formState.staff.includes(staff.employeeId) ? 'bg-blue-50' : ''
                                                                    }`}
                                                                    onClick={() => handleStaffToggle(staff.employeeId)}
                                                                >
                                                                    <div
                                                                        className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                                                                        style={{ backgroundColor: brandColorLight, color: 'white' }}
                                                                    >
                                                                        {staff.employeeName?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-medium text-gray-900 truncate">{staff.employeeName}</div>
                                                                        <div className="text-xs text-gray-500 truncate">{staff.roleName}</div>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formState.staff.includes(staff.employeeId)}
                                                                            onChange={() => handleStaffToggle(staff.employeeId)}
                                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {formErrors.includes('staff') && <p className="text-red-500 text-xs mt-1">Please select at least one staff member</p>}
                                        </div>
                                    ) : (
                                        // For non-Super Admin users, show assigned staff info
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assigned To
                                            </label>
                                            <div className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: brandColorLight, color: 'white' }}
                                                    >
                                                        {localData?.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{localData?.userName || 'You'}</div>
                                                        <div className="text-xs text-gray-500 truncate">{roleIdforRole || 'User'}</div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        Auto-assigned
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Task will be automatically assigned to you</p>
                                        </div>
                                    )}

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Task Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={formState.date}
                                                onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                                                className="flex-1 px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:border-transparent transition-all"
                                                style={{ '--tw-ring-color': brandColorPrimary }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Section Toggles */}
                            <div className="space-y-4">
                                {/* Enable Notifications */}
                                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 lg:p-2 rounded-lg" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                            <IconBell style={{ color: brandColorPrimary }} className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Enable Notifications</label>
                                            <p className="text-xs text-gray-500">Add specific date and time reminders</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormState({ ...formState, enableNotifications: !formState.enableNotifications })}
                                        className={`relative inline-flex h-6 lg:h-7 w-11 lg:w-12 items-center rounded-full transition-colors ${
                                            formState.enableNotifications ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 lg:h-5 w-4 lg:w-5 transform rounded-full bg-white transition ${
                                                formState.enableNotifications ? 'translate-x-6 lg:translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Conditional rendering of notifications section */}
                                {formState.enableNotifications && (
                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg lg:rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Settings</h4>
                                        <div className="space-y-3">
                                            {notifications.map((notification, index) => (
                                                <div key={notification.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="date"
                                                                value={notification.date}
                                                                onChange={(e) => handleNotificationChange(index, 'date', e.target.value)}
                                                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                            <input
                                                                type="time"
                                                                value={notification.time}
                                                                onChange={(e) => handleNotificationChange(index, 'time', e.target.value)}
                                                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => removeNotification(index)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addNotification}
                                                className="w-full py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                                                style={{ backgroundColor: brandColorSecondary }}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <IconPlus className="w-4 h-4" />
                                                    Add Notification
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Enable Checklist */}
                                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg lg:rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 lg:p-2 rounded-lg" style={{ backgroundColor: `${brandColorPrimary}15` }}>
                                            <IconCheckCircle style={{ color: brandColorPrimary }} className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Enable Checklist</label>
                                            <p className="text-xs text-gray-500">Add checklist items for this task</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormState({ ...formState, enableChecklist: !formState.enableChecklist })}
                                        className={`relative inline-flex h-6 lg:h-7 w-11 lg:w-12 items-center rounded-full transition-colors ${
                                            formState.enableChecklist ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 lg:h-5 w-4 lg:w-5 transform rounded-full bg-white transition ${
                                                formState.enableChecklist ? 'translate-x-6 lg:translate-x-7' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Conditional rendering of checklists section */}
                                {formState.enableChecklist && (
                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg lg:rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Checklist Items</h4>
                                        <div className="space-y-2">
                                            {checklists.map((item, index) => (
                                                <div key={item.id} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-gray-300 flex-shrink-0"></div>
                                                    <input
                                                        type="text"
                                                        value={item.text}
                                                        onChange={(e) => handleChecklistChange(index, e.target.value)}
                                                        className="flex-1 px-3 lg:px-4 py-1 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm lg:text-base"
                                                        style={{ '--tw-ring-color': brandColorPrimary }}
                                                        placeholder={`Checklist item ${index + 1}`}
                                                    />
                                                    {checklists.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChecklistItem(index)}
                                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <IconTrash className="w-3 h-3 lg:w-4 lg:h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={addChecklistItem} className="flex items-center gap-1 lg:gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                                <IconPlus className="w-3 h-3 lg:w-4 lg:h-4" />
                                                Add checklist item
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="sticky bottom-0 bg-white pt-4 lg:pt-6 border-t border-gray-200">
                                <div className="flex justify-end gap-2 lg:gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTaskFormModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 lg:px-6 py-2 lg:py-3 mb-5 border border-gray-300 rounded-lg lg:rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all text-sm lg:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl mb-5 font-medium text-white transition-all hover:scale-105 text-sm lg:text-base"
                                        style={{ backgroundColor: brandColorSecondary }}
                                    >
                                        {editingTask ? 'Update Task' : 'Create Task'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendarModal && <CalendarModal />}

            {/* Description Modal */}
            {showDescriptionModal && <DescriptionModal />}
        </div>
    );
};

export default TaskManagementDashboard;