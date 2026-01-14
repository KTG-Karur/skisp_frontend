import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer, LabelList } from 'recharts';
import moment from 'moment';
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
import IconClock from '../components/Icon/IconClock';
import IconAlertCircle from '../components/Icon/IconAlertCircle';
import { getReport } from '../redux/reportSlice';

// ISP Dashboard Component with Integrated Report API
const ISPDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [timeRange, setTimeRange] = useState('month');
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [statsVisible, setStatsVisible] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Get report data from Redux store
    const { loading, reportData: reduxReportData } = useSelector((state) => ({
        loading: state.ReportSlice.loading,
        reportData: state.ReportSlice.reportData,
    }));

    useEffect(() => {
        // Trigger animations after mount
        setTimeout(() => setStatsVisible(true), 300);

        // Load initial report data
        const getSettingId = () => {
            const loginInfoStr = localStorage.getItem('loginInfo');
            if (!loginInfoStr) {
                return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
            }
            try {
                const loginInfo = JSON.parse(loginInfoStr);
                if (loginInfo?.settingId) {
                    return loginInfo.settingId;
                }
                return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
            } catch (error) {
                console.error('Invalid loginInfo JSON', error);
                return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
            }
        };

        const initialFilters = {
            settingId: getSettingId(),
            daysThreshold: 30,
            accountState: '',
            page: 1,
            limit: 500,
            search: '',
            planName: '',
            userId: '',
        };

        dispatch(getReport(initialFilters));
    }, [dispatch]);

    useEffect(() => {
        // Update report data when Redux data changes
        if (reduxReportData?.data) {
            setReportData(reduxReportData.data);
        }
    }, [reduxReportData]);

    // Warm Color Palette based on #FFF4E2 (Creamy warm beige)
    const brandColors = {
        primary: '#E67E22', // Warm orange (Carrot orange)
        secondary: '#D35400', // Dark orange (Pumpkin)
        accent: '#F39C12', // Bright orange (Sunflower)
        warning: '#E74C3C', // Red orange (Alizarin)
        danger: '#C0392B', // Deep red (Pomegranate)
        success: '#27AE60', // Emerald green
        info: '#3498DB', // Soft blue (Peter River)
        dark: '#2C3E50', // Midnight blue
        light: '#FFF4E2', // Creamy warm beige (Base color)
        muted: '#ECF0F1', // Light gray
        card: '#FFFFFF', // White for cards
        border: '#FDE3A7', // Warm light orange border
    };

    // Gradient backgrounds for cards - Warm color palette
    const cardGradients = {
        primary: 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
        secondary: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
        accent: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)',
        warning: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
        success: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
        danger: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
        info: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
    };

    // Transform report data for dashboard
    const transformDashboardData = useMemo(() => {
        if (!reportData) return null;

        const summary = reportData.summary || {};
        const insights = reportData.insights || {};
        const items = reportData.items || [];

        // Calculate additional metrics from report data
        const activeSubscribers = summary.active_count || 0;
        const expiringSoon = summary.expiring_soon_count || 0;
        const expired = summary.expired_count || 0;
        const totalUsers = summary.total_users || 0;

        // Calculate revenue metrics
        const activeRevenue = parseFloat(insights.active_revenue) || 0;
        const revenueAtRisk = parseFloat(insights.potential_revenue_at_risk) || 0;
        const lostRevenue = parseFloat(insights.lost_revenue) || 0;
        const totalPotentialRevenue = parseFloat(insights.total_potential_revenue) || 0;

        // Calculate ARPU (Average Revenue Per User)
        const arpu = activeSubscribers > 0 ? (activeRevenue / activeSubscribers).toFixed(2) : 0;

        // Calculate renewal rate (estimated)
        const renewalRate = totalUsers > 0 ? (((activeSubscribers + expiringSoon) / totalUsers) * 100).toFixed(1) : 0;

        // Calculate churn rate
        const churnRate = totalUsers > 0 ? ((expired / totalUsers) * 100).toFixed(1) : 0;
        // Helper function to get color based on plan name
        const getPlanColor = (planName) => {
            const colors = [brandColors.primary, brandColors.secondary, brandColors.accent, brandColors.info, brandColors.success, brandColors.warning, '#FF8C42', '#FF6B35'];

            if (!planName) return colors[0];

            // Simple hash function for consistent colors
            let hash = 0;
            for (let i = 0; i < planName.length; i++) {
                hash = planName.charCodeAt(i) + ((hash << 5) - hash);
            }

            return colors[Math.abs(hash) % colors.length];
        };

        // Plan distribution analysis
        const planDistribution = insights.expiring_plan_distribution || {};
        const planData = Object.entries(planDistribution).map(([planName, count]) => ({
            name: planName,
            count: count,
            value: count,
            color: getPlanColor(planName),
        }));

        // Sort plans by count
        planData.sort((a, b) => b.count - a.count);

        // Customer status distribution for pie chart
        const statusDistribution = [
            { name: 'Active', value: activeSubscribers, color: brandColors.success },
            { name: 'Expiring Soon', value: expiringSoon, color: brandColors.warning },
            { name: 'Expired', value: expired, color: brandColors.danger },
        ];

        // Revenue distribution
        const revenueDistribution = [
            { name: 'Active Revenue', value: activeRevenue, color: brandColors.success },
            { name: 'At Risk', value: revenueAtRisk, color: brandColors.warning },
            { name: 'Lost', value: lostRevenue, color: brandColors.danger },
        ];

        // Monthly trend simulation (since API doesn't provide historical data)
        const currentMonth = moment().format('MMM');
        const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
            const month = moment()
                .subtract(5 - i, 'months')
                .format('MMM');
            const baseRevenue = activeRevenue / 6;
            const variation = 1 + (Math.random() * 0.3 - 0.15); // ±15% variation
            return {
                month: month,
                revenue: Math.round(baseRevenue * variation),
                target: Math.round(baseRevenue * 1.1), // 10% higher target
            };
        });

        // Expiry timeline data
        const expiryTimeline = items
            .filter((item) => item.days_remaining > 0 && item.days_remaining <= 30)
            .sort((a, b) => a.days_remaining - b.days_remaining)
            .slice(0, 10)
            .map((item, index) => ({
                id: item.user_id,
                name: item.user_details?.first_name || 'Customer',
                plan: item.user_details?.plan_name || 'Unknown Plan',
                days: item.days_remaining,
                amount: parseFloat(item.user_details?.price) || 0,
            }));

        // Top revenue plans
        const planRevenueData = items
            .filter((item) => item.days_remaining > 0) // Active plans
            .reduce((acc, item) => {
                const planName = item.user_details?.plan_name || 'Unknown';
                const price = parseFloat(item.user_details?.price) || 0;

                if (!acc[planName]) {
                    acc[planName] = {
                        name: planName,
                        revenue: 0,
                        subscribers: 0,
                        color: getPlanColor(planName),
                    };
                }

                acc[planName].revenue += price;
                acc[planName].subscribers += 1;

                return acc;
            }, {});

        const topPlans = Object.values(planRevenueData)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            // Main metrics
            metrics: {
                totalCustomers: totalUsers,
                activeSubscriptions: activeSubscribers,
                expiringSoon: expiringSoon,
                expired: expired,
                monthlyRevenue: activeRevenue,
                revenueAtRisk: revenueAtRisk,
                lostRevenue: lostRevenue,
                arpu: arpu,
                renewalRate: renewalRate,
                churnRate: churnRate,
                averageDaysToExpiry: parseFloat(insights.average_days_to_expiry) || 0,
                closestExpiry: insights.closest_expiry || 0,
                urgencyLevel: insights.urgency_level || 'medium',
            },

            // Charts data
            charts: {
                statusDistribution,
                revenueDistribution,
                planDistribution: planData.slice(0, 5),
                monthlyTrend,
                expiryTimeline,
                topPlans,
            },

            // Raw data for tables
            rawData: {
                expiringSoonItems: items.filter((item) => item.days_remaining > 0 && item.days_remaining <= 30),
                expiredItems: items.filter((item) => item.days_remaining <= 0),
                activeItems: items.filter((item) => item.days_remaining > 30),
            },
        };
    }, [reportData, brandColors]);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format number with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Main metrics cards data
    const mainMetrics = useMemo(() => {
        if (!transformDashboardData) return [];

        const { metrics } = transformDashboardData;

        return [
            {
                id: 'totalCustomers',
                title: 'Total Customers',
                value: formatNumber(metrics.totalCustomers || 0),
                change: 0,
                icon: IconUsers,
                color: brandColors.primary,
                gradient: cardGradients.primary,
                trend: 'stable',
            },
            {
                id: 'activeSubscriptions',
                title: 'Active Subscriptions',
                value: formatNumber(metrics.activeSubscriptions || 0),
                change: metrics.totalCustomers > 0 ? ((metrics.activeSubscriptions / metrics.totalCustomers) * 100).toFixed(1) : 0,
                icon: IconUserCheck,
                color: brandColors.secondary,
                gradient: cardGradients.secondary,
                trend: 'up',
            },
            {
                id: 'monthlyRevenue',
                title: 'Monthly Revenue',
                value: formatCurrency(metrics.monthlyRevenue || 0),
                change: 0,
                icon: IconDollarSign,
                color: brandColors.accent,
                gradient: cardGradients.accent,
                trend: 'up',
            },
            {
                id: 'expiringSoon',
                title: 'Expiring Soon',
                value: formatNumber(metrics.expiringSoon || 0),
                change: metrics.totalCustomers > 0 ? ((metrics.expiringSoon / metrics.totalCustomers) * 100).toFixed(1) : 0,
                icon: IconAlertCircle,
                color: brandColors.warning,
                gradient: cardGradients.warning,
                trend: 'warning',
            },
            {
                id: 'revenueAtRisk',
                title: 'Revenue at Risk',
                value: formatCurrency(metrics.revenueAtRisk || 0),
                change: 0,
                icon: IconShield,
                color: brandColors.danger,
                gradient: cardGradients.danger,
                trend: 'down',
            },
        ];
    }, [transformDashboardData, brandColors, cardGradients]);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            {entry.name}:{' '}
                            {entry.dataKey === 'revenue' || entry.dataKey === 'value' || entry.dataKey === 'amount'
                                ? formatCurrency(entry.value)
                                : entry.dataKey === 'count' || entry.dataKey === 'subscribers'
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
        const isPositive = metric.trend === 'up';
        const isWarning = metric.trend === 'warning';

        return (
            <div
                className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${
                    statsVisible ? 'animate-fadeInUp' : 'opacity-0'
                }`}
                style={{
                    background: metric.gradient,
                    animationDelay: `${index * 100}ms`,
                    borderColor: brandColors.border,
                }}
                onMouseEnter={() => setHoveredCard(metric.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        {metric.change > 0 && (
                            <div
                                className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm ${
                                    isWarning ? 'text-yellow-100' : isPositive ? 'text-green-100' : 'text-red-100'
                                }`}
                            >
                                {isWarning ? '⚠️' : isPositive ? <IconArrowUp className="w-4 h-4" /> : <IconArrowDown className="w-4 h-4" />}
                                <span className="text-sm font-semibold">{metric.change}%</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{metric.value}</h3>
                    <p className="text-white/90 font-medium">{metric.title}</p>

                    {/* Progress bar indicator */}
                    <div className="mt-4 w-full bg-white/30 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-white transition-all duration-300" style={{ width: `${Math.min(Math.abs(metric.change) + 20, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        );
    };

    // Refresh dashboard data
    const handleRefresh = () => {
        setIsLoading(true);

        const getSettingId = () => {
            const loginInfoStr = localStorage.getItem('loginInfo');
            if (!loginInfoStr) return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
            try {
                const loginInfo = JSON.parse(loginInfoStr);
                return loginInfo?.settingId || '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
            } catch (error) {
                return '25c1c6c1-3ea7-439c-f0b-b03e42f21a5d';
            }
        };

        const filters = {
            settingId: getSettingId(),
            daysThreshold: 30,
            accountState: '',
            page: 1,
            limit: 500,
        };

        dispatch(getReport(filters)).finally(() => {
            setTimeout(() => setIsLoading(false), 500);
        });
    };

    // Navigate to detailed reports
    const navigateToReport = (type) => {
        navigate('/reports/plan-report', {
            state: {
                defaultFilter: type === 'expiring' ? 'expiring_soon' : type === 'expired' ? 'Expired' : 'active',
            },
        });
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
                                    ISP Analytics Dashboard
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Real-time insights from plan expiry report data
                                    {transformDashboardData && ` • Last updated: ${moment().format('DD MMM YYYY, hh:mm A')}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 animate-slideInRight">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading || loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                            style={{ borderColor: brandColors.border }}
                        >
                            <IconRefresh className={`w-4 h-4 ${isLoading || loading ? 'animate-spin' : ''}`} style={{ color: brandColors.primary }} />
                            <span className="text-sm font-semibold" style={{ color: brandColors.dark }}>
                                Refresh
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {(isLoading || loading) && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4" style={{ borderColor: brandColors.primary, borderTopColor: 'transparent' }}></div>
                        <p className="text-gray-600 font-medium">Updating dashboard data...</p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div>
                {/* Animated Main Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                    {mainMetrics.map((metric, index) => (
                        <MetricCard key={metric.id} metric={metric} index={index} />
                    ))}
                </div>

                {transformDashboardData ? (
                    <>
                        {/* Top Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Customer Status Distribution */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-slideInLeft" style={{ borderColor: brandColors.border }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.secondary }}>
                                            <IconChartPie className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Customer Status Distribution
                                            </h3>
                                            <p className="text-sm text-gray-500">Active vs Expiring vs Expired</p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigateToReport('all')} className="text-sm font-semibold transition-colors hover:underline" style={{ color: brandColors.primary }}>
                                        View Details →
                                    </button>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={transformDashboardData.charts.statusDistribution}
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
                                                {transformDashboardData.charts.statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} className="transition-all duration-500 hover:opacity-80" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Revenue Distribution */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-slideInRight" style={{ borderColor: brandColors.border }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.accent }}>
                                            <IconDollarSign className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Revenue Distribution
                                            </h3>
                                            <p className="text-sm text-gray-500">Active, At Risk, and Lost Revenue</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={transformDashboardData.charts.revenueDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="value" name="Revenue" radius={[8, 8, 0, 0]} animationBegin={1200} animationDuration={1500}>
                                                {transformDashboardData.charts.revenueDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80" />
                                                ))}
                                                <LabelList dataKey="value" position="top" formatter={(value) => formatCurrency(value)} className="text-sm font-semibold" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Middle Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Expiring Soon Timeline */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp" style={{ borderColor: brandColors.border }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.warning }}>
                                            <IconClock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Upcoming Expiries
                                            </h3>
                                            <p className="text-sm text-gray-500">Next 10 subscriptions expiring soon</p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigateToReport('expiring')} className="text-sm font-semibold transition-colors hover:underline" style={{ color: brandColors.primary }}>
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                    {transformDashboardData.charts.expiryTimeline.length > 0 ? (
                                        transformDashboardData.charts.expiryTimeline.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 border rounded-xl hover:border-orange-300 transition-all duration-300 hover:shadow-sm"
                                                style={{ borderColor: brandColors.border, backgroundColor: brandColors.muted }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ background: cardGradients.warning }}>
                                                        {item.days}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold" style={{ color: brandColors.dark }}>
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{item.plan}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold" style={{ color: brandColors.dark }}>
                                                        {formatCurrency(item.amount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">per month</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">No upcoming expiries within 30 days</div>
                                    )}
                                </div>
                            </div>

                            {/* Top Revenue Plans */}
                            <div
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp"
                                style={{ borderColor: brandColors.border, animationDelay: '300ms' }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.info }}>
                                            <IconPackage className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Top Revenue Plans
                                            </h3>
                                            <p className="text-sm text-gray-500">Highest revenue generating plans</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    {transformDashboardData.charts.topPlans.map((plan, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold" style={{ color: brandColors.dark }}>
                                                    {plan.name}
                                                </span>
                                                <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${brandColors.primary}20`, color: brandColors.primary }}>
                                                    {formatNumber(plan.subscribers)} subs
                                                </span>
                                            </div>
                                            <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: brandColors.muted }}>
                                                <div
                                                    className="h-3 rounded-full transition-all duration-1000"
                                                    style={{
                                                        width: `${(plan.revenue / Math.max(...transformDashboardData.charts.topPlans.map((p) => p.revenue))) * 100}%`,
                                                        background: `linear-gradient(90deg, ${plan.color} 0%, ${brandColors.secondary} 100%)`,
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">{formatCurrency(plan.revenue)}</span>
                                                <span className="text-gray-600">ARPU: {formatCurrency(plan.revenue / plan.subscribers)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Stats Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Key Performance Indicators */}
                            <div
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp"
                                style={{ borderColor: brandColors.border, animationDelay: '600ms' }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.success }}>
                                            <IconTrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Performance Metrics
                                            </h3>
                                            <p className="text-sm text-gray-500">Key business indicators</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Average Days to Expiry', value: `${transformDashboardData.metrics.averageDaysToExpiry} days`, color: brandColors.info },
                                        { label: 'Renewal Rate', value: `${transformDashboardData.metrics.renewalRate}%`, color: brandColors.success },
                                        { label: 'Churn Rate', value: `${transformDashboardData.metrics.churnRate}%`, color: brandColors.danger },
                                        { label: 'ARPU (Average Revenue)', value: `₹${transformDashboardData.metrics.arpu}`, color: brandColors.accent },
                                        { label: 'Closest Expiry', value: `${transformDashboardData.metrics.closestExpiry} days`, color: brandColors.warning },
                                    ].map((metric, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all duration-300">
                                            <span className="text-gray-700">{metric.label}</span>
                                            <span className="font-bold" style={{ color: metric.color }}>
                                                {metric.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Plan Distribution */}
                            <div
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp"
                                style={{ borderColor: brandColors.border, animationDelay: '900ms' }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.secondary }}>
                                            <IconChartBar className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Expiring Plan Distribution
                                            </h3>
                                            <p className="text-sm text-gray-500">Plans expiring within 30 days</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {transformDashboardData.charts.planDistribution.map((plan, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium" style={{ color: brandColors.dark }} title={plan.name}>
                                                    {plan.name.length > 20 ? `${plan.name.substring(0, 20)}...` : plan.name}
                                                </span>
                                                <span className="text-sm font-semibold px-2 py-1 rounded" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                                                    {plan.count} plans
                                                </span>
                                            </div>
                                            <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: brandColors.muted }}>
                                                <div
                                                    className="h-2 rounded-full transition-all duration-1000"
                                                    style={{
                                                        width: `${(plan.count / Math.max(...transformDashboardData.charts.planDistribution.map((p) => p.count))) * 100}%`,
                                                        backgroundColor: plan.color,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border animate-fadeInUp"
                                style={{ borderColor: brandColors.border, animationDelay: '1200ms' }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl" style={{ background: cardGradients.primary }}>
                                            <IconActivity className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                                                Quick Actions
                                            </h3>
                                            <p className="text-sm text-gray-500">Manage your subscriptions</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigateToReport('expiring')}
                                        className="w-full text-left p-4 border rounded-xl hover:border-orange-300 transition-all duration-300 hover:shadow-sm flex items-center justify-between group"
                                        style={{ borderColor: brandColors.border, backgroundColor: brandColors.muted }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-100">
                                                <IconAlertCircle className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold" style={{ color: brandColors.dark }}>
                                                    Expiring Soon
                                                </h4>
                                                <p className="text-sm text-gray-500">{transformDashboardData.metrics.expiringSoon} subscriptions</p>
                                            </div>
                                        </div>
                                        <IconArrowUp className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => navigateToReport('expired')}
                                        className="w-full text-left p-4 border rounded-xl hover:border-red-300 transition-all duration-300 hover:shadow-sm flex items-center justify-between group"
                                        style={{ borderColor: brandColors.border, backgroundColor: brandColors.muted }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-red-100">
                                                <IconShield className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold" style={{ color: brandColors.dark }}>
                                                    Expired
                                                </h4>
                                                <p className="text-sm text-gray-500">{transformDashboardData.metrics.expired} subscriptions</p>
                                            </div>
                                        </div>
                                        <IconArrowUp className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/reports/plan-report')}
                                        className="w-full text-left p-4 border rounded-xl hover:border-blue-300 transition-all duration-300 hover:shadow-sm flex items-center justify-between group"
                                        style={{ borderColor: brandColors.border, backgroundColor: brandColors.muted }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-100">
                                                <IconEye className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold" style={{ color: brandColors.dark }}>
                                                    Full Report
                                                </h4>
                                                <p className="text-sm text-gray-500">Detailed plan expiry analysis</p>
                                            </div>
                                        </div>
                                        <IconArrowUp className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/customers')}
                                        className="w-full text-left p-4 border rounded-xl hover:border-green-300 transition-all duration-300 hover:shadow-sm flex items-center justify-between group"
                                        style={{ borderColor: brandColors.border, backgroundColor: brandColors.muted }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100">
                                                <IconUsers className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold" style={{ color: brandColors.dark }}>
                                                    Customer Management
                                                </h4>
                                                <p className="text-sm text-gray-500">Manage all customers</p>
                                            </div>
                                        </div>
                                        <IconArrowUp className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Initial Loading State */
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 mb-6" style={{ borderColor: brandColors.primary }}></div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Dashboard Data</h3>
                            <p className="text-gray-500 max-w-md">Fetching plan expiry information and analytics from the server...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
                .animate-slideInLeft {
                    animation: slideInLeft 0.6s ease-out;
                }
                .animate-slideInRight {
                    animation: slideInRight 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ISPDashboard;
