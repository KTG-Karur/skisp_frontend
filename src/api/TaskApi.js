import { apiReturnCallBack } from './ApiConfig';

// GET all tasks with filters
export async function getTasksApi(request = {}) {
    try {
        const queryParams = new URLSearchParams();

        // Add filters if provided
        if (request.status) queryParams.append('status', request.status);
        if (request.clientId) queryParams.append('clientId', request.clientId);
        if (request.category) queryParams.append('category', request.category);
        if (request.date) queryParams.append('date', request.date);
        if (request.today) queryParams.append('today', request.today);
        if (request.upcoming) queryParams.append('upcoming', request.upcoming);
        if (request.pending) queryParams.append('pending', request.pending);
        if (request.assignedTo) queryParams.append('assignedTo', request.assignedTo);

        const url = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiReturnCallBack('GET', url);
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getTasksApi:', error);
        throw error;
    }
}

// GET task statistics
export async function getTaskStatisticsApi(request = {}) {
    try {
        const queryParams = new URLSearchParams();

        if (request.status) queryParams.append('status', request.status);
        if (request.assignedTo) queryParams.append('assignedTo', request.assignedTo);

        const url = `/tasks/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiReturnCallBack('GET', url);
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getTaskStatisticsApi:', error);
        throw error;
    }
}

// GET task notifications
export async function getTaskNotificationsApi() {
    try {
        const response = await apiReturnCallBack('GET', '/tasks/notifications');
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getTaskNotificationsApi:', error);
        throw error;
    }
}

// CREATE task
export async function createTaskApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/tasks', request);
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in createTaskApi:', error);
        throw error;
    }
}

// UPDATE task
export async function updateTaskApi(taskId, request) {
    try {
        const response = await apiReturnCallBack('PUT', `/tasks/${taskId}`, request);
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in updateTaskApi:', error);
        throw error;
    }
}

// UPDATE checklist status
export async function updateChecklistStatusApi(checklistId, request) {
    try {
        const response = await apiReturnCallBack('PUT', `/tasks/checklist/${checklistId}`, request);
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in updateChecklistStatusApi:', error);
        throw error;
    }
}

// GET tasks by client
export async function getTasksByClientApi() {
    try {
        const response = await apiReturnCallBack('GET', '/tasks/by-client');
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getTasksByClientApi:', error);
        throw error;
    }
}

// GET dashboard metrics
export async function getDashboardMetricsApi() {
    try {
        const response = await apiReturnCallBack('GET', '/tasks/dashboard-metrics');
        const data = await response.json();

        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getDashboardMetricsApi:', error);
        throw error;
    }
}
