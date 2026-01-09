import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    ResponsiveContainer, LabelList
} from 'recharts';
import IconUsers from '../components/Icon/IconUser';
import IconCreditCard from '../components/Icon/IconCreditCard';
import IconNetwork from '../components/Icon/IconNetwork';
import IconPackage from '../components/Icon/IconPackage';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
import IconCalendar from '../components/Icon/IconCalendar';
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
import IconShield from '../components/Icon/IconShield';
import IconZap from '../components/Icon/IconZap';
import IconGlobe from '../components/Icon/IconGlobe';

// ISP Dashboard Component with Sample Data
const ISPDashboard = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('month'); // day, week, month, quarter, year
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        // Trigger animations after mount
        setTimeout(() => setStatsVisible(true), 300);
    }, []);

    // Warm Color Palette based on #FFF4E2 (Creamy warm beige)
    const brandColors = {
        primary: '#E67E22',     // Warm orange (Carrot orange)
        secondary: '#D35400',   // Dark orange (Pumpkin)
        accent: '#F39C12',      // Bright orange (Sunflower)
        warning: '#E74C3C',     // Red orange (Alizarin)
        danger: '#C0392B',      // Deep red (Pomegranate)
        success: '#27AE60',     // Emerald green
        info: '#3498DB',        // Soft blue (Peter River)
        dark: '#2C3E50',        // Midnight blue
        light: '#FFF4E2',       // Creamy warm beige (Base color)
        muted: '#ECF0F1',       // Light gray
        card: '#FFFFFF',        // White for cards
        border: '#FDE3A7'       // Warm light orange border
    };

    // Gradient backgrounds for cards - Warm color palette
    const cardGradients = {
        primary: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
        secondary: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
        accent: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)',
        warning: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
        success: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
        danger: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
        info: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)'
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
            leftCustomerRate: 2.8,
            newCustomers: 324,
            leftCustomer: 89,
            mrrGrowth: 15.2,
            customerLifetimeValue: 1824,
            referralRate: 12.5,
            operatingCosts: 187500,
            previousTotalCustomers: 12045,
            previousActiveSubscriptions: 11432,
            previousMonthlyRevenue: 398450,
            previousCollectionRate: 91.7,
            previousAvgRevenuePerUser: 34.82,
            previousleftCustomerRate: 3.2,
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
                { date: 'Jan', newCustomers: 285, totalCustomers: 11458, leftCustomer: 42 },
                { date: 'Feb', newCustomers: 312, totalCustomers: 11728, leftCustomer: 38 },
                { date: 'Mar', newCustomers: 298, totalCustomers: 11988, leftCustomer: 45 },
                { date: 'Apr', newCustomers: 325, totalCustomers: 12268, leftCustomer: 51 },
                { date: 'May', newCustomers: 342, totalCustomers: 12559, leftCustomer: 47 },
                { date: 'Jun', newCustomers: 324, totalCustomers: 12836, leftCustomer: 43 },
                { date: 'Jul', newCustomers: 356, totalCustomers: 13149, leftCustomer: 52 },
                { date: 'Aug', newCustomers: 389, totalCustomers: 13486, leftCustomer: 48 },
                { date: 'Sep', newCustomers: 412, totalCustomers: 13850, leftCustomer: 56 },
                { date: 'Oct', newCustomers: 395, totalCustomers: 14189, leftCustomer: 61 },
                { date: 'Nov', newCustomers: 378, totalCustomers: 14506, leftCustomer: 53 },
                { date: 'Dec', newCustomers: 412, totalCustomers: 14865, leftCustomer: 59 }
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

    // Main metrics cards data
    const mainMetrics = useMemo(() => {
        const data = sampleData.dashboardMetrics;

        return [
            {
                id: 'totalCustomers',
                title: 'Total Customers',
                value: formatNumber(data.totalCustomers || 0),
                change: 12.5,
                icon: IconUsers,
                color: brandColors.primary,
                gradient: cardGradients.primary,
                trend: 'up'
            },
            {
                id: 'activeSubscriptions',
                title: 'Active Subscriptions',
                value: formatNumber(data.activeSubscriptions || 0),
                change: 8.7,
                icon: IconUserCheck,
                color: brandColors.secondary,
                gradient: cardGradients.secondary,
                trend: 'up'
            },
            {
                id: 'monthlyRevenue',
                title: 'Revenue',
                value: formatCurrency(data.monthlyRevenue || 0),
                change: 15.2,
                icon: IconDollarSign,
                color: brandColors.accent,
                gradient: cardGradients.accent,
                trend: 'up'
            },
            {
                id: 'Customer leftRate',
                title: 'Customer left Rate',
                value: `${(data.leftCustomerRate || 0).toFixed(1)}%`,
                change: -5.3,
                icon: IconArrowDown,
                color: brandColors.danger,
                gradient: cardGradients.danger,
                trend: 'down'
            },
            {
                id: 'New Customer',
                title: 'New Customer',
                value: formatNumber(data.newCustomers || 0),
                change: 18.4,
                icon: IconUsers,
                color: brandColors.success,
                gradient: cardGradients.success,
                trend: 'up'
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
                '#FF8C42',
                '#FF6B35'
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
                color: brandColors.success
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

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
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

    // Animated Metric Card Component
    const MetricCard = ({ metric, index }) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;

        return (
            <div
                className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${statsVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
                style={{
                    background: metric.gradient,
                    animationDelay: `${index * 100}ms`,
                    borderColor: brandColors.border
                }}
                onMouseEnter={() => setHoveredCard(metric.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm ${isPositive ? 'text-green-100' : 'text-red-100'}`}>
                            {isPositive ?
                                <IconArrowUp className="w-4 h-4" /> :
                                <IconArrowDown className="w-4 h-4" />
                            }
                        </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{metric.value}</h3>
                    <p className="text-white/90 font-medium">{metric.title}</p>

                    {/* Progress bar indicator */}
                    <div className="mt-4 w-full bg-white/30 rounded-full h-1.5">
                        <div
                            className="h-1.5 rounded-full bg-white transition-all duration-300"
                            style={{
                                width: `${Math.min(Math.abs(metric.change) + 20, 100)}%`
                            }}
                        ></div>
                    </div>
                </div>
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

    // Quick Stats Card
    const QuickStatCard = ({ title, value, icon: Icon, color, change }) => {

        const colorClass = colorClasses[color] || colorClasses.orange;

        return (
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                        <Icon className={`w-5 h-5 ${colorClass.text}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-sm text-gray-600">{title}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: brandColors.light }}>
            {/* Header */}
            <div className="relative mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="animate-slideInLeft">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.primary }}>
                                    <IconWifi className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: brandColors.dark }}>
                                    Analytics Dashboard
                                </h1>
                                <p className="text-gray-600 mt-2">Real-time insights for internet service business management</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 animate-slideInRight">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                            style={{ borderColor: brandColors.border }}
                        >
                            <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} style={{ color: brandColors.primary }} />
                            <span className="text-sm font-semibold" style={{ color: brandColors.dark }}>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Time Range Filter with Animation */}
                <div className="flex items-center justify-between mb-8 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <IconFilter className="w-5 h-5" style={{ color: brandColors.primary }} />
                        <span className="text-sm font-medium" style={{ color: brandColors.dark }}>Time Range:</span>
                    </div>
                    <div className="flex p-1 rounded-xl" style={{ backgroundColor: brandColors.muted }}>
                        {['day', 'week', 'month', 'quarter', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 capitalize ${timeRange === range
                                    ? 'bg-white shadow-sm border'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                style={timeRange === range ? {
                                    color: brandColors.primary,
                                    borderColor: brandColors.border
                                } : {}}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4" style={{
                            borderColor: brandColors.primary,
                            borderTopColor: 'transparent'
                        }}></div>
                        <p className="text-gray-600 font-medium">Updating dashboard data...</p>
                    </div>
                </div>
            )}

            {/* Single Overview Page */}
            <div>
                {/* Animated Main Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                    {mainMetrics.map((metric, index) => (
                        <MetricCard key={metric.id} metric={metric} index={index} />
                    ))}
                </div>

                {/* Top Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Revenue by Plan Type */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-slideInLeft" style={{ borderColor: brandColors.border }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.secondary }}>
                                    <IconChartPie className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Revenue by Plan Type</h3>
                                    <p className="text-sm text-gray-500">Distribution across service plans</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IconMoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueByPlanData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        innerRadius={40}
                                        paddingAngle={2}
                                        dataKey="value"
                                        animationBegin={800}
                                        animationDuration={1500}
                                    >
                                        {revenueByPlanData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="white"
                                                strokeWidth={2}
                                                className="transition-all duration-500 hover:opacity-80"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Growth Trend */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-slideInRight" style={{ borderColor: brandColors.border }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.accent }}>
                                    <IconTrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Customer Growth Trend</h3>
                                    <p className="text-sm text-gray-500">Monthly growth analytics</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IconMoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={customerGrowthData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={brandColors.primary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={brandColors.primary} stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={brandColors.secondary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={brandColors.secondary} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
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
                                        fill="url(#colorTotal)"
                                        strokeWidth={3}
                                        animationBegin={600}
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="newCustomers"
                                        name="New Customers"
                                        stroke={brandColors.secondary}
                                        fill="url(#colorNew)"
                                        strokeWidth={2}
                                        animationBegin={900}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Middle Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Payment Status */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{ borderColor: brandColors.border }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.warning }}>
                                    <IconCreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Payment Status</h3>
                                    <p className="text-sm text-gray-500">Current payment distribution</p>
                                </div>
                            </div>
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
                                        radius={[8, 8, 0, 0]}
                                        animationBegin={1200}
                                        animationDuration={1500}
                                    >
                                        {paymentStatusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                className="transition-all duration-300 hover:opacity-80"
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="amount"
                                            position="top"
                                            formatter={(value) => formatCurrency(value)}
                                            className="text-sm font-semibold"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Acquisition vs Customer left */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{
                        borderColor: brandColors.border,
                        animationDelay: '300ms'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.info }}>
                                    <IconChartLine className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Customer Acquisition vs Customer left</h3>
                                    <p className="text-sm text-gray-500">Monthly customer movement analysis</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-72">
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
                                        animationDuration={1500}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="leftCustomer"
                                        name="Customer left"
                                        stroke={brandColors.danger}
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Revenue vs Target Chart */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{
                        borderColor: brandColors.border,
                        animationDelay: '600ms'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.success }}>
                                    <IconChartLine className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Revenue vs Target</h3>
                                    <p className="text-sm text-gray-500">Monthly performance tracking</p>
                                </div>
                            </div>
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
                                        dot={{ r: 5, fill: brandColors.primary }}
                                        activeDot={{ r: 8, fill: brandColors.primary }}
                                        animationBegin={1500}
                                        animationDuration={1500}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="target"
                                        name="Target Revenue"
                                        stroke={brandColors.warning}
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 4, fill: brandColors.warning }}
                                        animationBegin={1800}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Performing Employees */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{
                        borderColor: brandColors.border,
                        animationDelay: '900ms'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.info }}>
                                    <IconUserCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Top Performers</h3>
                                    <p className="text-sm text-gray-500">Employee performance ranking</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/employees')}
                                className="text-sm font-semibold transition-colors"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {topEmployeesData.map((employee, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-300 group"
                                    style={{ backgroundColor: brandColors.muted }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform duration-300"
                                            style={{
                                                background: `linear-gradient(135deg, ${employee.avatarColor} 0%, ${employee.avatarColor}80 100%)`
                                            }}
                                        >
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold" style={{ color: brandColors.dark }}>{employee.name}</h4>
                                            <p className="text-sm text-gray-500">{employee.sales} sales</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold" style={{ color: brandColors.dark }}>{formatCurrency(employee.revenue)}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${employee.satisfaction}%`,
                                                        backgroundColor: brandColors.success
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold" style={{ color: brandColors.success }}>{employee.satisfaction}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Popularity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{
                        borderColor: brandColors.border,
                        animationDelay: '1200ms'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.secondary }}>
                                    <IconPackage className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Plan Popularity</h3>
                                    <p className="text-sm text-gray-500">Subscriber distribution</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/plans')}
                                className="text-sm font-semibold transition-colors"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-5">
                            {planPopularityData.map((plan, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold" style={{ color: brandColors.dark }}>{plan.name}</span>
                                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{
                                            backgroundColor: `${brandColors.primary}20`,
                                            color: brandColors.primary
                                        }}>
                                            {formatNumber(plan.subscribers)}
                                        </span>
                                    </div>
                                    <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: brandColors.muted }}>
                                        <div
                                            className="h-3 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${(plan.subscribers / Math.max(...planPopularityData.map(p => p.subscribers))) * 100}%`,
                                                background: `linear-gradient(90deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{formatCurrency(plan.revenue)}</span>
                                        <span className={`font-semibold ${plan.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {plan.growth >= 0 ? '↑' : '↓'} {Math.abs(plan.growth).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Provider Performance */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{
                        borderColor: brandColors.border,
                        animationDelay: '1500ms'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: cardGradients.accent }}>
                                    <IconNetwork className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>Network Providers</h3>
                                    <p className="text-sm text-gray-500">Performance overview</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/providers')}
                                className="text-sm font-semibold transition-colors"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {providerPerformanceData.map((provider, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-xl hover:border-blue-300 transition-all duration-300 hover:shadow-sm"
                                    style={{
                                        borderColor: brandColors.border,
                                        backgroundColor: brandColors.muted
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold" style={{ color: brandColors.dark }}>{provider.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: brandColors.light }}>
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${provider.uptime}%`,
                                                            background: `linear-gradient(90deg, ${brandColors.success} 0%, ${brandColors.primary} 100%)`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-semibold ml-2" style={{ color: brandColors.success }}>
                                                    {provider.uptime}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-gray-600">Customers</span>
                                            <span className="font-semibold" style={{ color: brandColors.dark }}>{formatNumber(provider.customers)}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-gray-600">Revenue</span>
                                            <span className="font-semibold" style={{ color: brandColors.dark }}>{formatCurrency(provider.revenue)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-600">Issues</span>
                                            <span className="font-semibold" style={{
                                                color: provider.issues > 20 ? brandColors.danger :
                                                    provider.issues > 10 ? brandColors.warning :
                                                        brandColors.success
                                            }}>
                                                {provider.issues}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-gray-600">Health</span>
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{
                                                backgroundColor: provider.uptime > 99.5 ? `${brandColors.success}20` :
                                                    provider.uptime > 99 ? `${brandColors.warning}20` :
                                                        `${brandColors.danger}20`,
                                                color: provider.uptime > 99.5 ? brandColors.success :
                                                    provider.uptime > 99 ? brandColors.warning :
                                                        brandColors.danger
                                            }}>
                                                {provider.uptime > 99.5 ? 'Excellent' : provider.uptime > 99 ? 'Good' : 'Fair'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ISPDashboard;