import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    ResponsiveContainer, LabelList, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import IconUsers from '../components/Icon/IconUser';
import IconCreditCard from '../components/Icon/IconCreditCard';
import IconNetwork from '../components/Icon/IconNetwork';
import IconPackage from '../components/Icon/IconPackage';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
// import IconCalendar from '../components/Icon/IconCalendar';
import IconUserCheck from '../components/Icon/IconUserCheck';
import IconDollarSign from '../components/Icon/IconDollarSign';
import IconArrowUp from '../components/Icon/IconArrowForward';
import IconArrowDown from '../components/Icon/IconArrowBackward';
import IconRefresh from '../components/Icon/IconRefresh';
import IconFilter from '../components/Icon/IconFilter';
import IconDownload from '../components/Icon/IconDownload';
import IconEye from '../components/Icon/IconEye';
import IconMoreVertical from '../components/Icon/IconMoreVertical';
import IconActivity from '../components/Icon/IconActivity';
import IconServer from '../components/Icon/IconServer';
import IconChartBar from '../components/Icon/IconChartBar';
import IconWifi from '../components/Icon/IconWifi';
import IconChartPie from '../components/Icon/IconChartPie';
import IconChartLine from '../components/Icon/IconChartLine';
// ISP Dashboard Component with Sample Data
const ISPDashboard = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('month'); // day, week, month, quarter, year
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, performance, analytics

    // ISP Brand colors
    const brandColors = {
        primary: '#4a90e2',     // Softer blue that fits warm bg (Internet)
        secondary: '#2ecc9a',   // Mint-green softer success tone (Support/Connectivity)
        accent: '#a78bfa',      // Light pastel purple (Premium/Premium plans)
        warning: '#f4b860',     // Warm golden-amber that blends with beige (Alerts)
        danger: '#f87171',      // Soft coral red instead of harsh red (Critical issues)
        success: '#2ecc9a',     // Same as secondary, calm green success
        info: '#4a90e2',        // Same as primary, consistent soft blue
        dark: '#2d3748',        // Less harsh dark gray for text/icons
        light: '#faf7f3'        // Cream-white highlight, matches #f6efe6 family
    };


    // Sample Dashboard Data
    const sampleData = {
        // Main Metrics
        dashboardMetrics: {
            totalCustomers: 12543,
            activeSubscriptions: 11892,
            monthlyRevenue: 458750,
            collectionRate: 94.2,
            avgRevenuePerUser: 38.52,
            churnRate: 2.8,
            newCustomers: 324,
            churnedCustomers: 89,
            mrrGrowth: 15.2,
            customerLifetimeValue: 1824,
            referralRate: 12.5,
            operatingCosts: 187500,
            previousTotalCustomers: 12045,
            previousActiveSubscriptions: 11432,
            previousMonthlyRevenue: 398450,
            previousCollectionRate: 91.7,
            previousAvgRevenuePerUser: 34.82,
            previousChurnRate: 3.2
        },

        // Employee Performance
        employeePerformance: {
            topPerformers: [
                { employeeId: 'EMP001', employeeName: 'John Smith', salesCount: 142, revenueGenerated: 54890, customerSatisfaction: 96 },
                { employeeId: 'EMP002', employeeName: 'Sarah Johnson', salesCount: 128, revenueGenerated: 49850, customerSatisfaction: 95 },
                { employeeId: 'EMP003', employeeName: 'Mike Wilson', salesCount: 115, revenueGenerated: 42875, customerSatisfaction: 94 },
                { employeeId: 'EMP004', employeeName: 'Emma Davis', salesCount: 98, revenueGenerated: 38760, customerSatisfaction: 97 },
                { employeeId: 'EMP005', employeeName: 'Robert Brown', salesCount: 87, revenueGenerated: 32480, customerSatisfaction: 93 }
            ],
            avgResolutionTime: '4.2h',
            avgSatisfaction: 95.2
        },

        // Plan Analytics
        planAnalytics: {
            revenueByPlan: [
                { planName: 'Basic 50Mbps', revenue: 125480, subscribers: 3245 },
                { planName: 'Standard 100Mbps', revenue: 187650, subscribers: 4521 },
                { planName: 'Premium 200Mbps', revenue: 98560, subscribers: 1876 },
                { planName: 'Ultra 500Mbps', revenue: 75620, subscribers: 985 },
                { planName: 'Business 1Gbps', revenue: 62430, subscribers: 456 }
            ],
            popularity: [
                { planName: 'Standard 100Mbps', subscriberCount: 4521, revenue: 187650, growthRate: 12.5 },
                { planName: 'Basic 50Mbps', subscriberCount: 3245, revenue: 125480, growthRate: 8.2 },
                { planName: 'Premium 200Mbps', subscriberCount: 1876, revenue: 98560, growthRate: 15.8 },
                { planName: 'Business 1Gbps', subscriberCount: 456, revenue: 62430, growthRate: 22.4 },
                { planName: 'Ultra 500Mbps', subscriberCount: 985, revenue: 75620, growthRate: 18.7 }
            ]
        },

        // Provider Stats
        providerStats: {
            performance: [
                { providerId: 'PROV001', providerName: 'FiberTech', uptimePercentage: 99.8, customerCount: 5421, revenueGenerated: 214850, issueCount: 12 },
                { providerId: 'PROV002', providerName: 'NetConnect', uptimePercentage: 99.5, customerCount: 4215, revenueGenerated: 165420, issueCount: 18 },
                { providerId: 'PROV003', providerName: 'SpeedWave', uptimePercentage: 99.2, customerCount: 3874, revenueGenerated: 142580, issueCount: 24 },
                { providerId: 'PROV004', providerName: 'BroadBand Plus', uptimePercentage: 98.9, customerCount: 2154, revenueGenerated: 87560, issueCount: 31 }
            ],
            totalProviders: 4,
            avgUptime: 99.35
        },

        // Customer Growth
        customerGrowth: {
            data: [
                { date: 'Jan', newCustomers: 285, totalCustomers: 11458, churnedCustomers: 42 },
                { date: 'Feb', newCustomers: 312, totalCustomers: 11728, churnedCustomers: 38 },
                { date: 'Mar', newCustomers: 298, totalCustomers: 11988, churnedCustomers: 45 },
                { date: 'Apr', newCustomers: 325, totalCustomers: 12268, churnedCustomers: 51 },
                { date: 'May', newCustomers: 342, totalCustomers: 12559, churnedCustomers: 47 },
                { date: 'Jun', newCustomers: 324, totalCustomers: 12836, churnedCustomers: 43 },
                { date: 'Jul', newCustomers: 356, totalCustomers: 13149, churnedCustomers: 52 },
                { date: 'Aug', newCustomers: 389, totalCustomers: 13486, churnedCustomers: 48 },
                { date: 'Sep', newCustomers: 412, totalCustomers: 13850, churnedCustomers: 56 },
                { date: 'Oct', newCustomers: 395, totalCustomers: 14189, churnedCustomers: 61 },
                { date: 'Nov', newCustomers: 378, totalCustomers: 14506, churnedCustomers: 53 },
                { date: 'Dec', newCustomers: 412, totalCustomers: 14865, churnedCustomers: 59 }
            ]
        },

        // Payment Analytics
        paymentAnalytics: {
            paymentStatus: {
                paid: 11425,
                paidAmount: 432890,
                pending: 328,
                pendingAmount: 12480
            },
            monthlyTrend: [
                { month: 'Jan', revenue: 398450, target: 420000 },
                { month: 'Feb', revenue: 412580, target: 430000 },
                { month: 'Mar', revenue: 425670, target: 440000 },
                { month: 'Apr', revenue: 438920, target: 450000 },
                { month: 'May', revenue: 452150, target: 460000 },
                { month: 'Jun', revenue: 468750, target: 470000 },
                { month: 'Jul', revenue: 478920, target: 480000 },
                { month: 'Aug', revenue: 492150, target: 490000 },
                { month: 'Sep', revenue: 508420, target: 500000 },
                { month: 'Oct', revenue: 518750, target: 510000 },
                { month: 'Nov', revenue: 532150, target: 520000 },
                { month: 'Dec', revenue: 548920, target: 530000 }
            ],
            collectionRate: 94.2,
            avgDaysToPay: 18.5
        },

        // Service Metrics
        serviceMetrics: {
            avgSpeedDelivered: '85 Mbps',
            serviceReliability: '99.2%',
            ticketResolutionRate: '96.7%',
            customerSupportRating: '4.8/5',
            networkUptime: '99.8%',
            avgResponseTime: '2.4h'
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Format number with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Calculate percentage change
    const calculatePercentageChange = (current, previous) => {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    };

    // Main metrics cards data
    const mainMetrics = useMemo(() => {
        const data = sampleData.dashboardMetrics;

        return [
            {
                id: 'totalCustomers',
                title: 'Total Customers',
                value: formatNumber(data.totalCustomers || 0),
                change: calculatePercentageChange(data.totalCustomers || 0, data.previousTotalCustomers || 0),
                icon: IconUsers,
                color: brandColors.primary,
                chartData: sampleData.customerGrowth.data || [],
                trend: 'up'
            },
            {
                id: 'activeSubscriptions',
                title: 'Active Subscriptions',
                value: formatNumber(data.activeSubscriptions || 0),
                change: calculatePercentageChange(data.activeSubscriptions || 0, data.previousActiveSubscriptions || 0),
                icon: IconUserCheck,
                color: brandColors.secondary,
                trend: 'up'
            },
            {
                id: 'monthlyRevenue',
                title: 'Monthly Revenue',
                value: formatCurrency(data.monthlyRevenue || 0),
                change: calculatePercentageChange(data.monthlyRevenue || 0, data.previousMonthlyRevenue || 0),
                icon: IconDollarSign,
                color: brandColors.accent,
                trend: 'up'
            },
            {
                id: 'collectionRate',
                title: 'Collection Rate',
                value: `${(data.collectionRate || 0).toFixed(1)}%`,
                change: calculatePercentageChange(data.collectionRate || 0, data.previousCollectionRate || 0),
                icon: IconCreditCard,
                color: brandColors.warning,
                trend: 'up'
            },
            {
                id: 'avgRevenuePerUser',
                title: 'Avg Revenue/User',
                value: formatCurrency(data.avgRevenuePerUser || 0),
                change: calculatePercentageChange(data.avgRevenuePerUser || 0, data.previousAvgRevenuePerUser || 0),
                icon: IconTrendingUp,
                color: brandColors.success,
                trend: 'up'
            },
            {
                id: 'churnRate',
                title: 'Churn Rate',
                value: `${(data.churnRate || 0).toFixed(1)}%`,
                change: calculatePercentageChange(data.churnRate || 0, data.previousChurnRate || 0),
                icon: IconArrowDown,
                color: brandColors.danger,
                trend: 'down' // Lower is better
            }
        ];
    }, []);

    // Revenue by plan type data for pie chart
    const revenueByPlanData = useMemo(() => {
        return sampleData.planAnalytics.revenueByPlan.map((plan, index) => ({
            name: plan.planName,
            value: plan.revenue,
            subscribers: plan.subscribers,
            color: [
                brandColors.primary,
                brandColors.secondary,
                brandColors.accent,
                brandColors.warning,
                brandColors.danger,
                '#8b5cf6',
                '#ec4899'
            ][index % 7]
        }));
    }, []);

    // Customer growth data for area chart
    const customerGrowthData = useMemo(() => {
        return sampleData.customerGrowth.data;
    }, []);

    // Payment status data for bar chart
    const paymentStatusData = useMemo(() => {
        const data = sampleData.paymentAnalytics.paymentStatus;

        return [
            {
                status: 'Paid',
                count: data.paid || 0,
                amount: data.paidAmount || 0,
                color: brandColors.secondary
            },
            {
                status: 'Pending',
                count: data.pending || 0,
                amount: data.pendingAmount || 0,
                color: brandColors.warning
            },
        ];
    }, []);

    // Top performing employees data
    const topEmployeesData = useMemo(() => {
        return sampleData.employeePerformance.topPerformers.slice(0, 5).map(emp => ({
            name: emp.employeeName,
            sales: emp.salesCount,
            revenue: emp.revenueGenerated,
            satisfaction: emp.customerSatisfaction,
            avatarColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }));
    }, []);

    // Provider performance data
    const providerPerformanceData = useMemo(() => {
        return sampleData.providerStats.performance.map(provider => ({
            name: provider.providerName,
            uptime: provider.uptimePercentage,
            customers: provider.customerCount,
            revenue: provider.revenueGenerated,
            issues: provider.issueCount
        }));
    }, []);

    // Plan popularity data
    const planPopularityData = useMemo(() => {
        return sampleData.planAnalytics.popularity.map(plan => ({
            name: plan.planName,
            subscribers: plan.subscriberCount,
            revenue: plan.revenue,
            growth: plan.growthRate
        }));
    }, []);

    // Monthly revenue trend data
    const revenueTrendData = useMemo(() => {
        return sampleData.paymentAnalytics.monthlyTrend;
    }, []);

    // Network performance data
    const networkPerformanceData = useMemo(() => {
        return [
            { metric: 'Uptime', value: 99.8, target: 99.5 },
            { metric: 'Speed', value: 95, target: 90 },
            { metric: 'Latency', value: 92, target: 85 },
            { metric: 'Reliability', value: 98, target: 95 },
            { metric: 'Coverage', value: 94, target: 90 },
            { metric: 'Support', value: 96, target: 92 }
        ];
    }, []);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.dataKey === 'revenue' || entry.dataKey === 'amount'
                                ? formatCurrency(entry.value)
                                : entry.dataKey === 'subscribers' || entry.dataKey === 'count'
                                    ? formatNumber(entry.value)
                                    : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Metric Card Component
    const MetricCard = ({ metric }) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;

        return (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="p-2 rounded-lg inline-block" style={{ backgroundColor: `${metric.color}15` }}>
                            <Icon className="w-5 h-5" style={{ color: metric.color }} />
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">{Math.abs(metric.change).toFixed(1)}%</span>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-sm text-gray-600">{metric.title}</p>

                {/* Mini chart for customer growth */}
                {metric.id === 'totalCustomers' && metric.chartData && (
                    <div className="mt-3 h-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metric.chartData.slice(-7)}>
                                <Area
                                    type="monotone"
                                    dataKey="totalCustomers"
                                    stroke={metric.color}
                                    fill={`${metric.color}20`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    };

    // Refresh dashboard data
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <IconWifi className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ISP Provider Dashboard</h1>
                        </div>
                        <p className="text-gray-600">Real-time insights for internet service business management</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Time Range Filter */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <IconFilter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Time Range:</span>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['day', 'week', 'month', 'quarter', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${timeRange === range
                                    ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: IconChartPie },
                            { id: 'performance', label: 'Performance', icon: IconActivity },
                            { id: 'analytics', label: 'Analytics', icon: IconChartLine },
                            { id: 'network', label: 'Network', icon: IconServer }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Overview Tab */}
            {!isLoading && activeTab === 'overview' && (
                <>
                    {/* Main Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {mainMetrics.map((metric) => (
                            <MetricCard key={metric.id} metric={metric} />
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Revenue by Plan Type */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <IconChartPie className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan Type</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <IconMoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={revenueByPlanData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {revenueByPlanData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Customer Growth Trend */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <IconTrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Customer Growth Trend</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <IconMoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={customerGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="totalCustomers"
                                            name="Total Customers"
                                            stroke={brandColors.primary}
                                            fill={`${brandColors.primary}20`}
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="newCustomers"
                                            name="New Customers"
                                            stroke={brandColors.secondary}
                                            fill={`${brandColors.secondary}20`}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Payment Status */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-100">
                                        <IconCreditCard className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <IconMoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={paymentStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="status" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="amount"
                                            name="Amount"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {paymentStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                            <LabelList
                                                dataKey="amount"
                                                position="top"
                                                formatter={(value) => formatCurrency(value)}
                                                className="text-xs font-medium"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Revenue Trend */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <IconChartLine className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <IconMoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Actual Revenue"
                                            stroke={brandColors.primary}
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="target"
                                            name="Target Revenue"
                                            stroke={brandColors.warning}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Performing Employees */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-indigo-100">
                                        <IconUserCheck className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Employees</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/employees')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {topEmployeesData.map((employee, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                                style={{ backgroundColor: employee.avatarColor }}
                                            >
                                                {employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{employee.name}</h4>
                                                <p className="text-sm text-gray-500">{employee.sales} sales</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{formatCurrency(employee.revenue)}</p>
                                            <p className="text-sm text-green-600">{employee.satisfaction}% satisfaction</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Plan Popularity */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <IconPackage className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Plan Popularity</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/plans')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-4">
                                {planPopularityData.map((plan, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{plan.name}</span>
                                            <span className="text-sm font-semibold">{formatNumber(plan.subscribers)} subs</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(plan.subscribers / Math.max(...planPopularityData.map(p => p.subscribers))) * 100}%`,
                                                    backgroundColor: brandColors.primary
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>Revenue: {formatCurrency(plan.revenue)}</span>
                                            <span className={plan.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {plan.growth >= 0 ? '+' : ''}{plan.growth.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Provider Performance */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-cyan-100">
                                        <IconNetwork className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Provider Performance</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/providers')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {providerPerformanceData.map((provider, index) => (
                                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                                            <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                {provider.uptime}% uptime
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-600">Customers:</div>
                                            <div className="font-medium text-right">{formatNumber(provider.customers)}</div>

                                            <div className="text-gray-600">Revenue:</div>
                                            <div className="font-medium text-right">{formatCurrency(provider.revenue)}</div>

                                            <div className="text-gray-600">Issues:</div>
                                            <div className="font-medium text-right">{provider.issues}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Performance Tab */}
            {!isLoading && activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Network Uptime', value: '99.8%', change: 0.3, icon: IconServer, color: 'green' },
                            { title: 'Avg Speed', value: '85 Mbps', change: 12.5, icon: IconActivity, color: 'blue' },
                            { title: 'Ticket Resolution', value: '96.7%', change: 4.2, icon: IconUserCheck, color: 'purple' },
                            { title: 'Support Rating', value: '4.8/5', change: 0.8, icon: IconUsers, color: 'amber' }
                        ].map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${`bg-${metric.color}-100`}`}>
                                        <metric.icon className={`w-5 h-5 ${`text-${metric.color}-600`}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                                    <div className={`flex items-center gap-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.change >= 0 ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
                                        <span className="text-sm font-medium">{Math.abs(metric.change).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Employee Performance Chart */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Performance</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topEmployeesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Revenue Generated" fill={brandColors.primary} />
                                        <Bar dataKey="sales" name="Sales Count" fill={brandColors.secondary} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Provider Uptime Chart */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Uptime Comparison</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={providerPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[95, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="uptime"
                                            name="Uptime %"
                                            fill={brandColors.accent}
                                            radius={[4, 4, 0, 0]}
                                        >
                                            <LabelList
                                                dataKey="uptime"
                                                position="top"
                                                formatter={(value) => `${value}%`}
                                                className="text-xs font-medium"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Network Performance Radar Chart */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance Analysis</h3>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={networkPerformanceData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis domain={[0, 100]} />
                                    <Radar
                                        name="Current"
                                        dataKey="value"
                                        stroke={brandColors.primary}
                                        fill={brandColors.primary}
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name="Target"
                                        dataKey="target"
                                        stroke={brandColors.warning}
                                        fill={brandColors.warning}
                                        fillOpacity={0.1}
                                        strokeDasharray="5 5"
                                    />
                                    <Legend />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {!isLoading && activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Customer Analytics */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'New Customers', value: sampleData.dashboardMetrics.newCustomers || 0, change: 15.2 },
                                    { label: 'Churned Customers', value: sampleData.dashboardMetrics.churnedCustomers || 0, change: -5.7 },
                                    { label: 'Customer Lifetime Value', value: sampleData.dashboardMetrics.customerLifetimeValue || 0, change: 8.3 },
                                    { label: 'Referral Rate', value: sampleData.dashboardMetrics.referralRate || 0, change: 12.1 }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                {item.label.includes('Value') ? formatCurrency(item.value) : formatNumber(item.value)}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Analytics */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Analytics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'ARPU', value: sampleData.dashboardMetrics.avgRevenuePerUser || 0, change: 4.5 },
                                    { label: 'MRR Growth', value: sampleData.dashboardMetrics.mrrGrowth || 0, change: 18.2 },
                                    { label: 'Collection Efficiency', value: sampleData.dashboardMetrics.collectionRate || 0, change: 2.8 },
                                    { label: 'Operating Costs', value: sampleData.dashboardMetrics.operatingCosts || 0, change: -3.1 }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                {item.label.includes('Costs') || item.label.includes('ARPU') ? formatCurrency(item.value) : `${item.value.toFixed(1)}%`}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Service Analytics */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Analytics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Avg Speed Delivered', value: sampleData.serviceMetrics.avgSpeedDelivered, change: 12.3 },
                                    { label: 'Service Reliability', value: sampleData.serviceMetrics.serviceReliability, change: 0.8 },
                                    { label: 'Ticket Resolution Rate', value: sampleData.serviceMetrics.ticketResolutionRate, change: 4.2 },
                                    { label: 'Customer Support Rating', value: sampleData.serviceMetrics.customerSupportRating, change: 0.3 }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <span className="text-sm text-gray-600">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{item.value}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.change >= 0 ? '+' : ''}{item.change}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Analytics Chart */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth vs Churn Analysis</h3>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={customerGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="newCustomers"
                                        name="New Customers"
                                        stroke={brandColors.primary}
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="churnedCustomers"
                                        name="Churned Customers"
                                        stroke={brandColors.danger}
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Network Tab */}
            {!isLoading && activeTab === 'network' && (
                <div className="space-y-6">
                    {/* Network Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Network Uptime', value: '99.8%', icon: IconServer, color: 'green', status: 'Excellent' },
                            { title: 'Avg Latency', value: '24ms', icon: IconActivity, color: 'blue', status: 'Good' },
                            { title: 'Packet Loss', value: '0.2%', icon: IconNetwork, color: 'purple', status: 'Excellent' },
                            { title: 'Peak Bandwidth', value: '92%', icon: IconWifi, color: 'amber', status: 'High' }
                        ].map((metric, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${`bg-${metric.color}-100`}`}>
                                        <metric.icon className={`w-5 h-5 ${`text-${metric.color}-600`}`} />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${metric.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                                        metric.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                        {metric.status}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                                <p className="text-sm text-gray-600">{metric.title}</p>
                            </div>
                        ))}
                    </div>

                    {/* Network Map Visualization */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Network Coverage Map</h3>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Full Map
                            </button>
                        </div>
                        <div className="h-96 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <IconWifi className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                <h4 className="text-xl font-semibold text-gray-700 mb-2">Network Coverage Visualization</h4>
                                <p className="text-gray-600">Interactive network map showing coverage areas</p>
                                <p className="text-sm text-gray-500 mt-2">94% of target areas covered</p>
                            </div>
                        </div>
                    </div>

                    {/* Network Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Usage Statistics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Data Transfer (Monthly)', value: '45.2 TB', usage: 85 },
                                    { label: 'Peak Concurrent Users', value: '8,542', usage: 72 },
                                    { label: 'Avg Bandwidth Usage', value: '1.2 Gbps', usage: 68 },
                                    { label: 'Network Capacity', value: '92%', usage: 92 }
                                ].map((stat, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{stat.label}</span>
                                            <span className="font-semibold text-gray-900">{stat.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${stat.usage}%`,
                                                    backgroundColor: stat.usage > 80 ? brandColors.warning : brandColors.primary
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Health Status</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Core Router', status: 'Healthy', issues: 0, uptime: '99.9%' },
                                    { name: 'Edge Switch', status: 'Warning', issues: 2, uptime: '99.2%' },
                                    { name: 'DNS Server', status: 'Healthy', issues: 0, uptime: '99.8%' },
                                    { name: 'Load Balancer', status: 'Critical', issues: 5, uptime: '98.5%' },
                                    { name: 'Firewall', status: 'Healthy', issues: 0, uptime: '99.7%' }
                                ].map((device, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{device.name}</h4>
                                            <p className="text-sm text-gray-500">{device.uptime} uptime</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${device.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                                                device.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {device.status}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">{device.issues} issues</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Add New Customer', icon: IconUserCheck, color: 'blue', action: () => navigate('/customers/add') },
                        { label: 'Create Invoice', icon: IconCreditCard, color: 'green', action: () => navigate('/invoices/create') },
                        { label: 'View Reports', icon: IconTrendingUp, color: 'purple', action: () => navigate('/reports') },
                        { label: 'Manage Network', icon: IconServer, color: 'amber', action: () => navigate('/network') }
                    ].map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300"
                        >
                            <div className={`p-3 rounded-lg mb-2 ${`bg-${action.color}-100`}`}>
                                <action.icon className={`w-6 h-6 ${`text-${action.color}-600`}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div> */}
        </div>
    );
};

export default ISPDashboard;