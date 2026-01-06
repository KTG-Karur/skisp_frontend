import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotificationsApi, getUnreadCountApi, markNotificationAsReadApi, markAllNotificationsAsReadApi, deleteNotificationApi } from '../api/NotificationApi';

// Async Thunks
export const getNotifications = createAsyncThunk('notification/getNotifications', async (options = {}, { rejectWithValue }) => {
    try {
        return await getNotificationsApi(options);
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const getUnreadCount = createAsyncThunk('notification/getUnreadCount', async (_, { rejectWithValue }) => {
    try {
        return await getUnreadCountApi();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const markNotificationAsRead = createAsyncThunk('notification/markAsRead', async (notificationId, { rejectWithValue }) => {
    try {
        const response = await markNotificationAsReadApi(notificationId);
        return { notificationId, ...response };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const markAllNotificationsAsRead = createAsyncThunk('notification/markAllAsRead', async (_, { rejectWithValue }) => {
    try {
        return await markAllNotificationsAsReadApi();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const deleteNotification = createAsyncThunk('notification/delete', async (notificationId, { rejectWithValue }) => {
    try {
        const response = await deleteNotificationApi(notificationId);
        return { notificationId, ...response };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    reducers: {
        addNotification: (state, action) => {
            // Check if notification already exists
            const exists = state.notifications.some((n) => n.notificationId === action.payload.notificationId);

            if (!exists) {
                state.notifications.unshift(action.payload);
                if (!action.payload.isRead) {
                    state.unreadCount += 1;
                }
            }
        },
        addMultipleNotifications: (state, action) => {
            action.payload.forEach((notification) => {
                const exists = state.notifications.some((n) => n.notificationId === notification.notificationId);

                if (!exists) {
                    state.notifications.unshift(notification);
                    if (!notification.isRead) {
                        state.unreadCount += 1;
                    }
                }
            });
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        decrementUnreadCount: (state) => {
            if (state.unreadCount > 0) {
                state.unreadCount -= 1;
            }
        },
        setLastUpdated: (state, action) => {
            state.lastUpdated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET NOTIFICATIONS
            .addCase(getNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload?.data || [];
                state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // GET UNREAD COUNT
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload?.data?.count || 0;
            })

            // MARK NOTIFICATION AS READ
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notificationId = action.payload.notificationId;
                const notification = state.notifications.find((n) => n.notificationId === notificationId);

                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            // MARK ALL NOTIFICATIONS AS READ
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((notification) => ({
                    ...notification,
                    isRead: true,
                }));
                state.unreadCount = 0;
            })

            // DELETE NOTIFICATION
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notificationId = action.payload.notificationId;
                const notification = state.notifications.find((n) => n.notificationId === notificationId);

                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }

                state.notifications = state.notifications.filter((n) => n.notificationId !== notificationId);
            });
    },
});

export const { addNotification, addMultipleNotifications, clearNotifications, incrementUnreadCount, decrementUnreadCount, setLastUpdated } = notificationSlice.actions;

export default notificationSlice.reducer;
