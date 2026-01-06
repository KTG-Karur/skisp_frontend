import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasksApi, getTaskStatisticsApi, getTaskNotificationsApi, createTaskApi, updateTaskApi, updateChecklistStatusApi, getTasksByClientApi, getDashboardMetricsApi } from '../api/TaskApi';

// Async Thunks
export const getTasks = createAsyncThunk('task/getTasks', async (request = {}) => {
    return await getTasksApi(request);
});

export const getTaskStatistics = createAsyncThunk('task/getTaskStatistics', async (request = {}) => {
    return await getTaskStatisticsApi(request);
});

export const getTaskNotifications = createAsyncThunk('task/getTaskNotifications', async () => {
    return await getTaskNotificationsApi();
});

export const createTask = createAsyncThunk('task/createTask', async (request) => {
    return await createTaskApi(request);
});

export const updateTask = createAsyncThunk('task/updateTask', async ({ taskId, request }) => {
    return await updateTaskApi(taskId, request);
});

export const updateChecklistStatus = createAsyncThunk('task/updateChecklistStatus', async ({ checklistId, request }) => {
    return await updateChecklistStatusApi(checklistId, request);
});

export const getTasksByClient = createAsyncThunk('task/getTasksByClient', async () => {
    return await getTasksByClientApi();
});

export const getDashboardMetrics = createAsyncThunk('task/getDashboardMetrics', async () => {
    return await getDashboardMetricsApi();
});

const taskSlice = createSlice({
    name: 'task',
    initialState: {
        tasks: [],
        taskStatistics: {},
        taskNotifications: [],
        tasksByClient: [],
        dashboardMetrics: {},
        loading: false,
        error: null,
        getTasksSuccess: false,
        createTaskSuccess: false,
        updateTaskSuccess: false,
    },
    reducers: {
        resetTaskStatus: (state) => {
            state.getTasksSuccess = false;
            state.createTaskSuccess = false;
            state.updateTaskSuccess = false;
            state.error = null;
            state.loading = false;
        },
        updateTaskInState: (state, action) => {
            const index = state.tasks.findIndex((task) => task.taskId === action.payload.taskId);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        updateChecklistInState: (state, action) => {
            const { taskId, checklistId, isCompleted } = action.payload;
            const taskIndex = state.tasks.findIndex((task) => task.taskId === taskId);
            if (taskIndex !== -1) {
                const checklistIndex = state.tasks[taskIndex].checklists.findIndex((checklist) => checklist.checklistId === checklistId);
                if (checklistIndex !== -1) {
                    state.tasks[taskIndex].checklists[checklistIndex].completed = isCompleted;
                }
            }
        },
        markNotificationAsRead: (state, action) => {
            const notificationId = action.payload;
            state.taskNotifications = state.taskNotifications.filter((notification) => notification.reminderId !== notificationId);
        },
        clearTaskData: (state) => {
            state.tasks = [];
            state.taskStatistics = {};
            state.taskNotifications = [];
            state.tasksByClient = [];
            state.dashboardMetrics = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // GET TASKS
            .addCase(getTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getTasksSuccess = false;
            })
            .addCase(getTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload?.data || [];
                state.getTasksSuccess = true;
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch tasks';
                state.getTasksSuccess = false;
            })

            // GET TASK STATISTICS
            .addCase(getTaskStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTaskStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.taskStatistics = action.payload?.data || {};
            })
            .addCase(getTaskStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch task statistics';
            })

            // GET TASK NOTIFICATIONS
            .addCase(getTaskNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTaskNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.taskNotifications = action.payload?.data || [];
            })
            .addCase(getTaskNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch task notifications';
            })

            // CREATE TASK
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createTaskSuccess = false;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                const newTask = action.payload?.data?.[0];
                if (newTask) {
                    state.tasks.push(newTask);
                }
                state.createTaskSuccess = true;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create task';
                state.createTaskSuccess = false;
            })

            // UPDATE TASK
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateTaskSuccess = false;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTask = action.payload?.data?.[0];
                if (updatedTask) {
                    const index = state.tasks.findIndex((task) => task.taskId === updatedTask.taskId);
                    if (index !== -1) {
                        state.tasks[index] = updatedTask;
                    }
                }
                state.updateTaskSuccess = true;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update task';
                state.updateTaskSuccess = false;
            })

            // GET TASKS BY CLIENT
            .addCase(getTasksByClient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTasksByClient.fulfilled, (state, action) => {
                state.loading = false;
                state.tasksByClient = action.payload?.data || [];
            })
            .addCase(getTasksByClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch tasks by client';
            })

            // GET DASHBOARD METRICS
            .addCase(getDashboardMetrics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardMetrics = action.payload?.data || {};
            })
            .addCase(getDashboardMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard metrics';
            });
    },
});

export const { resetTaskStatus, updateTaskInState, updateChecklistInState, markNotificationAsRead, clearTaskData } = taskSlice.actions;

export default taskSlice.reducer;
