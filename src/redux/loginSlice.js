import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLoginApi} from '../api/LoginApi';

export const getLogin = createAsyncThunk('login/getLogin', async (request) => {
    return await getLoginApi(request);
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
            // FETCH
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
            })
            .addCase(getLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getLoginSuccess = false;
                state.getLoginFailed = true;
            })
    },
});

export const { resetLoginStatus } = loginSlice.actions;
export default loginSlice.reducer;
