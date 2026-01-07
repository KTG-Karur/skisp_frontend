import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../redux/themeStore';
import { toggleRTL, toggleTheme, toggleSidebar } from '../../redux/themeStore/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import IconCalendar from '../Icon/IconCalendar';
import IconEdit from '../Icon/IconEdit';
import IconChatNotification from '../Icon/IconChatNotification';
import IconSearch from '../Icon/IconSearch';
import IconXCircle from '../Icon/IconXCircle';
import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';
import IconMailDot from '../Icon/IconMailDot';
import IconArrowLeft from '../Icon/IconArrowLeft';
import IconInfoCircle from '../Icon/IconInfoCircle';
import IconBellBing from '../Icon/IconBellBing';
import IconUser from '../Icon/IconUser';
import IconMail from '../Icon/IconMail';
import IconLockDots from '../Icon/IconLockDots';
import IconLogout from '../Icon/IconLogout';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMenuApps from '../Icon/Menu/IconMenuApps';
import IconMenuComponents from '../Icon/Menu/IconMenuComponents';
import IconMenuElements from '../Icon/Menu/IconMenuElements';
import IconMenuDatatables from '../Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../Icon/Menu/IconMenuForms';
import IconMenuPages from '../Icon/Menu/IconMenuPages';
import IconMenuMore from '../Icon/Menu/IconMenuMore';
import IconCheckCircle from '../Icon/IconCircleCheck';
import IconClock from '../Icon/IconClock';

// Import Redux actions
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNotification,
    incrementUnreadCount,
    decrementUnreadCount,
} from '../../redux/notificationSlice';

interface Notification {
    notificationId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    priority?: string;
    createdAt: string;
    [key: string]: any;
}

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    // Get notification data from Redux store
    const notificationState = useSelector((state: any) => state.NotificationSlice);
    const allNotifications = notificationState.notifications || [];
    const unreadCount = notificationState.unreadCount || 0;
    const notificationLoading = notificationState.loading || false;

    // Local state for UI - ONLY SHOW UNREAD NOTIFICATIONS
    const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

    // State for UI
    const [search, setSearch] = useState(false);
    const [flag, setFlag] = useState(themeConfig.locale);

    // Polling interval for notifications (every 30 seconds)
    const POLLING_INTERVAL = 30000;
    const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    // Filter to show only unread notifications
    useEffect(() => {
        const unreadNotifications = allNotifications.filter((n: Notification) => !n.isRead);
        setDisplayNotifications(unreadNotifications);
    }, [allNotifications]);

    // Load notifications on component mount
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Start polling for new notifications
        startPolling();

        // Clean up polling interval on unmount
        return () => {
            stopPolling();
        };
    }, []);

    // Fetch notifications from backend
    const fetchNotifications = async (options: any = {}) => {
        try {
            // Always fetch only unread notifications for dropdown
            await dispatch((getNotifications as any)({ ...options, unreadOnly: true }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Fetch unread count from backend
    const fetchUnreadCount = async () => {
        try {
            await dispatch(getUnreadCount() as any);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Start polling for new notifications
    const startPolling = () => {
        const intervalId = setInterval(() => {
            if (!notificationDropdownOpen) {
                // Only poll if dropdown is closed
                fetchNotifications({ limit: 20, unreadOnly: true });
                fetchUnreadCount();
            }
        }, POLLING_INTERVAL);

        setPollingIntervalId(intervalId);
    };

    // Stop polling
    const stopPolling = () => {
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
        }
    };

    // Mark notification as read and remove from display
    // Update just the handleMarkAsRead function to fix the TypeScript error
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            // Add 'as any' to fix the TypeScript error
            await dispatch((markNotificationAsRead as any)(notificationId));

            // Immediately remove from display
            setDisplayNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));

            // Refresh unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead() as any);

            // Clear all displayed notifications
            setDisplayNotifications([]);

            // Refresh unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Fix all TypeScript errors by placing 'as any' in the correct position
    const handleDeleteNotification = async (notificationId: string) => {
        try {
            // Move 'as any' inside the dispatch call
            await dispatch((deleteNotification as any)(notificationId));

            // Immediately remove from display
            setDisplayNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));

            // Refresh unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Active navigation highlighting
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);

    // Login data
    const loginDataString = localStorage.getItem('loginInfo');
    const loginData = loginDataString ? JSON.parse(loginDataString) : null;

    // Original functions (kept for compatibility)
    function createMarkup(messages: any) {
        return { __html: messages };
    }

    function handleLogout() {
        localStorage.removeItem('loginInfo');
        navigate('/auth/boxed-signin?');
    }

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    // Navigate to task or relevant page based on notification data
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read when clicked
        if (!notification.isRead) {
            await handleMarkAsRead(notification.notificationId);
        }

        // Navigate based on notification type
        if (notification.data?.taskId) {
            navigate('/'); // Navigate to task dashboard
        } else if (notification.data?.type === 'task') {
            navigate('/'); // Navigate to task dashboard
        } else {
            // Default navigation
            navigate('/');
        }
    };

    // Get priority color based on notification priority
    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return '#dc2626'; // red-600
            case 'medium':
                return '#f59e0b'; // amber-500
            case 'low':
                return '#10b981'; // emerald-500
            default:
                return '#3b82f6'; // blue-500
        }
    };

    // Get priority text
    const getPriorityText = (priority?: string) => {
        if (!priority) return 'Normal';
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    // Format time for display (relative time)
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Filter notifications by date (for display grouping)
    const todayNotifications = displayNotifications.filter((n: Notification) => {
        const notifDate = new Date(n.createdAt);
        const today = new Date();
        return notifDate.toDateString() === today.toDateString();
    });

    const olderNotifications = displayNotifications.filter((n: Notification) => {
        const notifDate = new Date(n.createdAt);
        const today = new Date();
        return notifDate.toDateString() !== today.toDateString();
    });

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-[#fff4e2] flex w-full items-center px-5 py-2.5 dark:bg-black">
                    {/* Logo and Mobile Menu - UNCHANGED */}
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img style={{ width: '100px', height: '30px' }} className="flex-none" src="/assets/images/skisp-new-logo copy.png" alt="logo" />
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            onClick={() => {
                                dispatch(toggleSidebar());
                            }}
                        >
                            <IconMenu className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search and Actions - UNCHANGED */}
                    <div className="ltr:mr-2 rtl:ml-2 hidden sm:block">{/* Original icons commented out */}</div>

                    {/* Right side icons - MODIFIED to use backend notifications */}
                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        {/* Search - UNCHANGED (commented out) */}
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto">{/* Search form remains commented out */}</div>

                        {/* NOTIFICATIONS DROPDOWN - USING BACKEND DATA */}
                        <div className="dropdown shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                button={
                                    <span>
                                        <IconBellBing />
                                        {unreadCount > 0 && (
                                            <span className="flex absolute w-3 h-3 ltr:right-0 rtl:left-0 top-0">
                                                <span className="animate-ping absolute ltr:-left-[3px] rtl:-right-[3px] -top-[3px] inline-flex h-full w-full rounded-full bg-danger/50 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-danger"></span>
                                            </span>
                                        )}
                                    </span>
                                }
                                onToggle={(isOpen: boolean) => {
                                    setNotificationDropdownOpen(isOpen);

                                    // When dropdown opens, refresh notifications
                                    if (isOpen) {
                                        fetchNotifications({ limit: 20, unreadOnly: true });
                                        fetchUnreadCount();
                                    }
                                }}
                            >
                                <ul className="!py-0 text-dark dark:text-white-dark w-[300px] sm:w-[380px] max-h-[500px] overflow-y-auto divide-y dark:divide-white/10">
                                    {/* Header */}
                                    <li onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center px-4 py-3 justify-between font-semibold border-b dark:border-white/10">
                                            <h4 className="text-lg">Notifications</h4>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && <span className="badge bg-danger/80">{unreadCount} New</span>}
                                                {displayNotifications.length > 0 && unreadCount > 0 && (
                                                    <button type="button" onClick={handleMarkAllAsRead} className="text-xs text-primary hover:text-primary-dark">
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>

                                    {notificationLoading ? (
                                        <li className="px-4 py-8 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#1d7dbe' }}></div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading notifications...</p>
                                        </li>
                                    ) : displayNotifications.length > 0 ? (
                                        <>
                                            {/* Today's Notifications */}
                                            {todayNotifications.length > 0 && (
                                                <li onClick={(e) => e.stopPropagation()}>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today</h5>
                                                    </div>
                                                    {todayNotifications.map((notification: Notification) => (
                                                        <div
                                                            key={notification.notificationId}
                                                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                                                                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                                        notification.type === 'task_completed'
                                                                            ? 'bg-green-100 dark:bg-green-900/30'
                                                                            : notification.type === 'task_reminder'
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                                                            : notification.type.includes('task')
                                                                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                                                            : 'bg-gray-100 dark:bg-gray-900/30'
                                                                    }`}
                                                                >
                                                                    {notification.type === 'task_completed' ? (
                                                                        <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                                    ) : notification.type === 'task_reminder' ? (
                                                                        <IconClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                    ) : notification.type.includes('task') ? (
                                                                        <IconBellBing className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                                    ) : (
                                                                        <IconInfoCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h6 className="font-semibold text-sm truncate">{notification.title}</h6>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{notification.message}</p>
                                                                    {notification.priority && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                                                                style={{ backgroundColor: getPriorityColor(notification.priority) }}
                                                                            >
                                                                                {getPriorityText(notification.priority)} Priority
                                                                            </span>
                                                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                                                                                {notification.type?.replace('_', ' ') || 'Notification'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteNotification(notification.notificationId);
                                                                    }}
                                                                    className="text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <IconXCircle className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </li>
                                            )}

                                            {/* Older Notifications */}
                                            {olderNotifications.length > 0 && (
                                                <li onClick={(e) => e.stopPropagation()}>
                                                    <div className="px-4 pt-3 pb-1">
                                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Older</h5>
                                                    </div>
                                                    {olderNotifications.map((notification: Notification) => (
                                                        <div
                                                            key={notification.notificationId}
                                                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                                                                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                                        notification.type === 'task_completed'
                                                                            ? 'bg-green-100 dark:bg-green-900/30'
                                                                            : notification.type === 'task_reminder'
                                                                            ? 'bg-blue-100 dark:bg-blue-900/30'
                                                                            : notification.type.includes('task')
                                                                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                                                            : 'bg-gray-100 dark:bg-gray-900/30'
                                                                    }`}
                                                                >
                                                                    {notification.type === 'task_completed' ? (
                                                                        <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                                    ) : notification.type === 'task_reminder' ? (
                                                                        <IconCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                                    ) : notification.type.includes('task') ? (
                                                                        <IconBellBing className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                                    ) : (
                                                                        <IconInfoCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h6 className="font-semibold text-sm truncate">{notification.title}</h6>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">{notification.message}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteNotification(notification.notificationId);
                                                                    }}
                                                                    className="text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <IconXCircle className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </li>
                                            )}
                                        </>
                                    ) : (
                                        <li className="px-4 py-8 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <IconCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Caught Up!</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">No unread notifications.</p>
                                        </li>
                                    )}

                                    {/* Footer */}
                                    {displayNotifications.length > 0 && (
                                        <li>
                                            <div className="p-4 border-t dark:border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        {displayNotifications.length} unread notification{displayNotifications.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div>

                        {/* User Profile Dropdown - UNCHANGED */}
                        <div className="dropdown shrink-0 flex">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group block"
                                button={<img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/skisp-new-logo Icon.png" alt="userProfile" />}
                            >
                                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <img className="rounded-md w-10 h-10 object-cover" src="/assets/images/skisp-new-logo Icon.png" alt="userProfile" />
                                            <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                <h4 className="text-base">
                                                    {loginData?.roleName || 'No role'}
                                                    <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2"></span>
                                                </h4>
                                                <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                    {loginData?.staffName || 'No staffName'}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button className="text-danger !py-3" onClick={handleLogout}>
                                            <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                                            Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* Horizontal Menu - COMPLETELY UNCHANGED */}
                {/* ... (Keep all the existing menu code as is) ... */}
            </div>
        </header>
    );
};

export default Header;
