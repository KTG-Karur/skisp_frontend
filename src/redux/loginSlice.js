import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLoginApi } from '../api/LoginApi';

export const getLogin = createAsyncThunk('login/getLogin', async (request, { rejectWithValue }) => {
    try {
        return await getLoginApi(request);
    } catch (error) {
        // Return error message for the component to handle
        return rejectWithValue(error.message || 'Authentication failed');
    }
});

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        loginData: [],
        loading: false,
        error: null,
        getLoginSuccess: false,
        getLoginFailed: false,
    },
    reducers: {
        resetLoginStatus: (state) => {
            state.getLoginSuccess = false;
            state.getLoginFailed = false;
            state.error = null;
            state.loading = false;
            state.loginData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getLoginSuccess = false;
                state.getLoginFailed = false;
            })
            .addCase(getLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.loginData = action.payload;
                state.getLoginSuccess = true;
                state.getLoginFailed = false;
                state.error = null;
            })
            .addCase(getLogin.rejected, (state, action) => {
                state.loading = false;
                state.getLoginSuccess = false;
                state.getLoginFailed = true;
                // Use the error message from rejectWithValue
                state.error = action.payload || action.error.message || 'Authentication failed';
            })
    },
});

export const { resetLoginStatus } = loginSlice.actions;
export default loginSlice.reducer;