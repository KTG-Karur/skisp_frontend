import { apiReturnCallBack } from './ApiConfig';

// GET all notifications for current user
export async function getNotificationsApi(options = {}) {
    try {
        const { limit = 20, offset = 0, unreadOnly = false } = options;
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unreadOnly: unreadOnly.toString(),
        }).toString();

        const response = await apiReturnCallBack('GET', `/notifications?${queryParams}`);
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
        console.error('Error in getNotificationsApi:', error);
        throw error;
    }
}

// GET unread notification count
export async function getUnreadCountApi() {
    try {
        const response = await apiReturnCallBack('GET', '/notifications/unread-count');
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
        console.error('Error in getUnreadCountApi:', error);
        throw error;
    }
}

// Mark notification as read - Send empty JSON object
export async function markNotificationAsReadApi(notificationId) {
    try {
        const response = await apiReturnCallBack('PUT', `/notifications/${notificationId}/read`, {});
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
        console.error('Error in markNotificationAsReadApi:', error);
        throw error;
    }
}

// Mark all notifications as read - Send empty JSON object
export async function markAllNotificationsAsReadApi() {
    try {
        const response = await apiReturnCallBack('PUT', '/notifications/mark-all-read', {});
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
        console.error('Error in markAllNotificationsAsReadApi:', error);
        throw error;
    }
}

// Delete notification - Send empty JSON object
export async function deleteNotificationApi(notificationId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/notifications/${notificationId}`, {});
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
        console.error('Error in deleteNotificationApi:', error);
        throw error;
    }
}
