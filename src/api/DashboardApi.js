import { apiReturnCallBack } from './ApiConfig';

// GET dashboard data
export async function getDashboardDataApi(request = {}) {
    try {
        const response = await apiReturnCallBack('GET', '/dashboard', request);
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET dashboard statistics
export async function getDashboardStatisticsApi(request = {}) {
    try {
        const response = await apiReturnCallBack('GET', '/dashboard/statistics', request);
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET recent enquiries
export async function getRecentEnquiriesApi(limit = 5) {
    try {
        const response = await apiReturnCallBack('GET', `/dashboard/recent-enquiries?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET top products
export async function getTopProductsApi(limit = 5) {
    try {
        const response = await apiReturnCallBack('GET', `/dashboard/top-products?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET country summary
export async function getCountrySummaryApi(limit = 10) {
    try {
        const response = await apiReturnCallBack('GET', `/dashboard/country-summary?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET expo performance
export async function getExpoPerformanceApi() {
    try {
        const response = await apiReturnCallBack('GET', '/dashboard/expo-performance');
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET quick stats
export async function getQuickStatsApi() {
    try {
        const response = await apiReturnCallBack('GET', '/dashboard/quick-stats');
        const data = await response.json();

        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
