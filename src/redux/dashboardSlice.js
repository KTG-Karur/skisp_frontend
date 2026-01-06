import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardDataApi, getDashboardStatisticsApi, getRecentEnquiriesApi, getTopProductsApi, getCountrySummaryApi, getExpoPerformanceApi, getQuickStatsApi } from '../api/DashboardApi';

// Thunks for all dashboard data
export const getDashboardData = createAsyncThunk('dashboard/getDashboardData', async (request = {}) => {
    return await getDashboardDataApi(request);
});

export const getDashboardStatistics = createAsyncThunk('dashboard/getDashboardStatistics', async (request = {}) => {
    return await getDashboardStatisticsApi(request);
});

export const getRecentEnquiries = createAsyncThunk('dashboard/getRecentEnquiries', async (limit = 5) => {
    return await getRecentEnquiriesApi(limit);
});

export const getTopProducts = createAsyncThunk('dashboard/getTopProducts', async (limit = 5) => {
    return await getTopProductsApi(limit);
});

export const getCountrySummary = createAsyncThunk('dashboard/getCountrySummary', async (limit = 10) => {
    return await getCountrySummaryApi(limit);
});

export const getExpoPerformance = createAsyncThunk('dashboard/getExpoPerformance', async () => {
    return await getExpoPerformanceApi();
});

export const getQuickStats = createAsyncThunk('dashboard/getQuickStats', async () => {
    return await getQuickStatsApi();
});

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        // Main dashboard data
        dashboardData: null,

        // Individual data components
        statistics: {
            totalVisitors: 0,
            activeEnquiries: 0,
            totalProducts: 0,
            sampleRequests: 0,
        },
        recentEnquiries: [],
        topProducts: [],
        countrySummary: [],
        expoPerformance: [],
        quickStats: {
            avgProducts: '0.0',
            conversionRate: '0.0',
            topCountry: 'N/A',
        },

        // Loading states
        loading: false,
        statisticsLoading: false,
        enquiriesLoading: false,
        productsLoading: false,
        countryLoading: false,
        expoLoading: false,
        statsLoading: false,

        // Error states
        error: null,
        statisticsError: null,
        enquiriesError: null,
        productsError: null,
        countryError: null,
        expoError: null,
        statsError: null,

        // Success states
        getDashboardDataSuccess: false,
        getDashboardDataFailed: false,
        getStatisticsSuccess: false,
        getStatisticsFailed: false,
        getEnquiriesSuccess: false,
        getEnquiriesFailed: false,
        getTopProductsSuccess: false,
        getTopProductsFailed: false,
        getCountrySummarySuccess: false,
        getCountrySummaryFailed: false,
        getExpoPerformanceSuccess: false,
        getExpoPerformanceFailed: false,
        getQuickStatsSuccess: false,
        getQuickStatsFailed: false,
    },
    reducers: {
        resetDashboardStatus: (state) => {
            state.getDashboardDataSuccess = false;
            state.getDashboardDataFailed = false;
            state.getStatisticsSuccess = false;
            state.getStatisticsFailed = false;
            state.getEnquiriesSuccess = false;
            state.getEnquiriesFailed = false;
            state.getTopProductsSuccess = false;
            state.getTopProductsFailed = false;
            state.getCountrySummarySuccess = false;
            state.getCountrySummaryFailed = false;
            state.getExpoPerformanceSuccess = false;
            state.getExpoPerformanceFailed = false;
            state.getQuickStatsSuccess = false;
            state.getQuickStatsFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearDashboardData: (state) => {
            state.dashboardData = null;
            state.statistics = {
                totalVisitors: 0,
                activeEnquiries: 0,
                totalProducts: 0,
                sampleRequests: 0,
            };
            state.recentEnquiries = [];
            state.topProducts = [];
            state.countrySummary = [];
            state.expoPerformance = [];
            state.quickStats = {
                avgProducts: '0.0',
                conversionRate: '0.0',
                topCountry: 'N/A',
            };
        },
        setAnimatedValues: (state, action) => {
            state.animatedValues = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET DASHBOARD DATA (All data at once)
            .addCase(getDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDashboardDataSuccess = false;
                state.getDashboardDataFailed = false;
            })
            .addCase(getDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardData = action.payload.data;
                state.statistics = action.payload.data?.statistics || state.statistics;
                state.recentEnquiries = action.payload.data?.recentEnquiries || [];
                state.topProducts = action.payload.data?.topProducts || [];
                state.countrySummary = action.payload.data?.countrySummary || [];
                state.expoPerformance = action.payload.data?.expoPerformance || [];
                state.quickStats = action.payload.data?.quickStats || state.quickStats;
                state.getDashboardDataSuccess = true;
                state.getDashboardDataFailed = false;
            })
            .addCase(getDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard data';
                state.getDashboardDataSuccess = false;
                state.getDashboardDataFailed = true;
            })

            // GET STATISTICS
            .addCase(getDashboardStatistics.pending, (state) => {
                state.statisticsLoading = true;
                state.statisticsError = null;
                state.getStatisticsSuccess = false;
                state.getStatisticsFailed = false;
            })
            .addCase(getDashboardStatistics.fulfilled, (state, action) => {
                state.statisticsLoading = false;
                state.statistics = action.payload.data;
                state.getStatisticsSuccess = true;
                state.getStatisticsFailed = false;
            })
            .addCase(getDashboardStatistics.rejected, (state, action) => {
                state.statisticsLoading = false;
                state.statisticsError = action.error.message || 'Failed to fetch statistics';
                state.getStatisticsSuccess = false;
                state.getStatisticsFailed = true;
            })

            // GET RECENT ENQUIRIES
            .addCase(getRecentEnquiries.pending, (state) => {
                state.enquiriesLoading = true;
                state.enquiriesError = null;
                state.getEnquiriesSuccess = false;
                state.getEnquiriesFailed = false;
            })
            .addCase(getRecentEnquiries.fulfilled, (state, action) => {
                state.enquiriesLoading = false;
                state.recentEnquiries = action.payload.data || [];
                state.getEnquiriesSuccess = true;
                state.getEnquiriesFailed = false;
            })
            .addCase(getRecentEnquiries.rejected, (state, action) => {
                state.enquiriesLoading = false;
                state.enquiriesError = action.error.message || 'Failed to fetch recent enquiries';
                state.getEnquiriesSuccess = false;
                state.getEnquiriesFailed = true;
            })

            // GET TOP PRODUCTS
            .addCase(getTopProducts.pending, (state) => {
                state.productsLoading = true;
                state.productsError = null;
                state.getTopProductsSuccess = false;
                state.getTopProductsFailed = false;
            })
            .addCase(getTopProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.topProducts = action.payload.data || [];
                state.getTopProductsSuccess = true;
                state.getTopProductsFailed = false;
            })
            .addCase(getTopProducts.rejected, (state, action) => {
                state.productsLoading = false;
                state.productsError = action.error.message || 'Failed to fetch top products';
                state.getTopProductsSuccess = false;
                state.getTopProductsFailed = true;
            })

            // GET COUNTRY SUMMARY
            .addCase(getCountrySummary.pending, (state) => {
                state.countryLoading = true;
                state.countryError = null;
                state.getCountrySummarySuccess = false;
                state.getCountrySummaryFailed = false;
            })
            .addCase(getCountrySummary.fulfilled, (state, action) => {
                state.countryLoading = false;
                state.countrySummary = action.payload.data || [];
                state.getCountrySummarySuccess = true;
                state.getCountrySummaryFailed = false;
            })
            .addCase(getCountrySummary.rejected, (state, action) => {
                state.countryLoading = false;
                state.countryError = action.error.message || 'Failed to fetch country summary';
                state.getCountrySummarySuccess = false;
                state.getCountrySummaryFailed = true;
            })

            // GET EXPO PERFORMANCE
            .addCase(getExpoPerformance.pending, (state) => {
                state.expoLoading = true;
                state.expoError = null;
                state.getExpoPerformanceSuccess = false;
                state.getExpoPerformanceFailed = false;
            })
            .addCase(getExpoPerformance.fulfilled, (state, action) => {
                state.expoLoading = false;
                state.expoPerformance = action.payload.data || [];
                state.getExpoPerformanceSuccess = true;
                state.getExpoPerformanceFailed = false;
            })
            .addCase(getExpoPerformance.rejected, (state, action) => {
                state.expoLoading = false;
                state.expoError = action.error.message || 'Failed to fetch expo performance';
                state.getExpoPerformanceSuccess = false;
                state.getExpoPerformanceFailed = true;
            })

            // GET QUICK STATS
            .addCase(getQuickStats.pending, (state) => {
                state.statsLoading = true;
                state.statsError = null;
                state.getQuickStatsSuccess = false;
                state.getQuickStatsFailed = false;
            })
            .addCase(getQuickStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.quickStats = action.payload.data || state.quickStats;
                state.getQuickStatsSuccess = true;
                state.getQuickStatsFailed = false;
            })
            .addCase(getQuickStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.statsError = action.error.message || 'Failed to fetch quick stats';
                state.getQuickStatsSuccess = false;
                state.getQuickStatsFailed = true;
            });
    },
});

export const { resetDashboardStatus, clearDashboardData, setAnimatedValues } = dashboardSlice.actions;
export default dashboardSlice.reducer;
