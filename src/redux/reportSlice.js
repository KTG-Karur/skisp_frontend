import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getReportApi} from '../api/ReportApi';

export const getReport = createAsyncThunk('report/getReport', async (request) => {
    return await getReportApi(request);
});


const reportSlice = createSlice({
    name: 'report',
    initialState: {
        reportData: [],
        loading: false,
        error: null,
        getReportSuccess: false,
        getReportFailed: false,
    },
    reducers: {
        resetReportStatus: (state) => {
            state.getReportSuccess = false;
            state.getReportFailed = false;
            state.error = null;
            state.loading = false;
            state.reportData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getReportSuccess = false;
                state.getReportFailed = false;
            })
            .addCase(getReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reportData = action.payload;
                state.getReportSuccess = true;
                state.getReportFailed = false;
            })
            .addCase(getReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getReportSuccess = false;
                state.getReportFailed = true;
            })
    },
});

export const { resetReportStatus } = reportSlice.actions;
export default reportSlice.reducer;
