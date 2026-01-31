import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotificationSettingApi, createNotificationSettingApi, updateNotificationSettingApi } from '../api/NotificationSettingApi';

export const getNotificationSetting = createAsyncThunk('notificationSetting/getNotificationSetting', async (request) => {
    return await getNotificationSettingApi(request);
});

export const createNotificationSetting = createAsyncThunk('notificationSetting/createNotificationSetting', async (request) => {
    return await createNotificationSettingApi(request);
});

export const updateNotificationSetting = createAsyncThunk('notificationSetting/updateNotificationSetting', async ({ request }) => {
    return await updateNotificationSettingApi(request);
});

const notificationSettingSlice = createSlice({
    name: 'notificationSetting',
    initialState: {
        notificationSettingData: [],
        loading: false,
        error: null,
        getNotificationSettingSuccess: false,
        getNotificationSettingFailed: false,
        createNotificationSettingSuccess: false,
        createNotificationSettingFailed: false,
        updateNotificationSettingSuccess: false,
        updateNotificationSettingFailed: false,
    },
    reducers: {
        resetNotificationSettingStatus: (state) => {
            state.getNotificationSettingSuccess = false;
            state.getNotificationSettingFailed = false;
            state.createNotificationSettingSuccess = false;
            state.createNotificationSettingFailed = false;
            state.updateNotificationSettingSuccess = false;
            state.updateNotificationSettingFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getNotificationSetting.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getNotificationSettingSuccess = false;
                state.getNotificationSettingFailed = false;
            })
            .addCase(getNotificationSetting.fulfilled, (state, action) => {
                state.loading = false;
                state.notificationSettingData = action.payload.data || action.payload;
                state.getNotificationSettingSuccess = true;
                state.getNotificationSettingFailed = false;
            })
            .addCase(getNotificationSetting.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getNotificationSettingSuccess = false;
                state.getNotificationSettingFailed = true;
            })
            // CREATE
            .addCase(createNotificationSetting.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createNotificationSettingSuccess = false;
                state.createNotificationSettingFailed = false;
            })
            .addCase(createNotificationSetting.fulfilled, (state, action) => {
                state.loading = false;
                const newNotificationSetting = action.payload.data || action.payload;
                state.notificationSettingData.push(newNotificationSetting);
                state.createNotificationSettingSuccess = true;
                state.createNotificationSettingFailed = false;
            })
            .addCase(createNotificationSetting.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createNotificationSettingSuccess = false;
                state.createNotificationSettingFailed = true;
            })
            // UPDATE
            .addCase(updateNotificationSetting.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateNotificationSettingSuccess = false;
                state.updateNotificationSettingFailed = false;
            })
            .addCase(updateNotificationSetting.fulfilled, (state, action) => {
                state.loading = false;
                const updatedNotificationSetting = action.payload.data || action.payload;
                const index = state.notificationSettingData.findIndex(
                    (notificationSetting) => notificationSetting.notificationSettingId === updatedNotificationSetting.notificationSettingId
                );
                if (index !== -1) {
                    state.notificationSettingData[index] = updatedNotificationSetting;
                }
                state.updateNotificationSettingSuccess = true;
                state.updateNotificationSettingFailed = false;
            })
            .addCase(updateNotificationSetting.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateNotificationSettingSuccess = false;
                state.updateNotificationSettingFailed = true;
            });
    },
});

export const { resetNotificationSettingStatus } = notificationSettingSlice.actions;
export default notificationSettingSlice.reducer;