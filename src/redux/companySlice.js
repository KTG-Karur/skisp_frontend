import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyInfo, updateCompanyInfo } from '../api/CompanyApi';

export const getCompany = createAsyncThunk('company/getCompany', async (request) => {
    return await getCompanyInfo(request);
});

export const updateCompany = createAsyncThunk('company/updateCompany', async ({ request, companyInfoId }) => {
    return await updateCompanyInfo(request, companyInfoId);
});

const companySlice = createSlice({
    name: 'company',
    initialState: {
        companyData: [],
        loading: false,
        error: null,
        getCompanySuccess: false,
        getCompanyFailed: false,
        updateCompanySuccess: false,
        updateCompanyFailed: false,
    },
    reducers: {
        resetCompanyStatus: (state) => {
            state.getCompanySuccess = false;
            state.getCompanyFailed = false;
            state.updateCompanySuccess = false;
            state.updateCompanyFailed = false;
            state.error = null;
            state.loading = false;
            state.companyData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCompanySuccess = false;
                state.getCompanyFailed = false;
            })
            .addCase(getCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.companyData = action.payload;
                state.getCompanySuccess = true;
                state.getCompanyFailed = false;
            })
            .addCase(getCompany.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getCompanySuccess = false;
                state.getCompanyFailed = true;
            })

            // UPDATE
            .addCase(updateCompany.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateCompanySuccess = false;
                state.updateCompanyFailed = false;
            })
            .addCase(updateCompany.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.companyData.findIndex((company) => company.id === action.payload.id);
                if (index !== -1) state.companyData[index] = action.payload;
                state.updateCompanySuccess = true;
                state.updateCompanyFailed = false;
            })
            .addCase(updateCompany.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateCompanySuccess = false;
                state.updateCompanyFailed = true;
            })
    },
});

export const { resetCompanyStatus } = companySlice.actions;
export default companySlice.reducer;
