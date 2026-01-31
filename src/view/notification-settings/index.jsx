import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { getNotificationSetting, updateNotificationSetting } from '../../redux/notificationSettingSlice';
import { showMessage } from '../../util/AllFunction';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconBell from '../../components/Icon/IconBell';
import IconMail from '../../components/Icon/IconMail';
import IconSettings from '../../components/Icon/IconSettings';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconClock from '../../components/Icon/IconClock';
import IconRefresh from '../../components/Icon/IconRefresh';
import Select from 'react-select';

const RazorpayReminderSettings = () => {
    const dispatch = useDispatch();
    const { notificationSettingData, loading, getNotificationSettingSuccess, updateNotificationSettingSuccess, error } = useSelector((state) => state.NotificationSettingSlice);
    
    console.log("notificationSettingData from API:", notificationSettingData);

    const [reminderSettings, setReminderSettings] = useState({
        before_expiration_days: [],
        before_enabled: false,
        after_expiration_days: [],
        after_enabled: false,
        notification_time: "09:00",
        whatsapp_enabled: false,
        email_enabled: false
    });

    const daysOptions = [
        { value: 1, label: '1 Day' },
        { value: 2, label: '2 Days' },
        { value: 3, label: '3 Days' },
        { value: 4, label: '4 Days' },
        { value: 5, label: '5 Days' },
        { value: 6, label: '6 Days' },
        { value: 7, label: '7 Days' },
        { value: 10, label: '10 Days' },
        { value: 14, label: '14 Days' },
        { value: 21, label: '21 Days' },
        { value: 30, label: '30 Days' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Razorpay Reminder Settings'));
        // Fetch notification settings on component mount
        fetchNotificationSettings();
    }, [dispatch]);

    useEffect(() => {
        // If data is fetched successfully, update the state
        if (getNotificationSettingSuccess && notificationSettingData) {
            console.log("Processing notificationSettingData:", notificationSettingData);
            loadSettingsFromApi();
        }
    }, [getNotificationSettingSuccess, notificationSettingData]);

    const loadSettingsFromApi = () => {
        try {
            // Check if data is in data property (from response structure)
            const apiData = notificationSettingData.data || notificationSettingData;
            
            if (!apiData) {
                console.log("No data available from API");
                return;
            }
            
            console.log("API Data for settings:", apiData);
            
            // Parse the arrays - they might already be arrays or stringified
            let beforeDays = apiData.before_expiration_days || [];
            let afterDays = apiData.after_expiration_days || [];
            
            // If they're strings, parse them
            if (typeof beforeDays === 'string') {
                beforeDays = JSON.parse(beforeDays);
            }
            
            if (typeof afterDays === 'string') {
                afterDays = JSON.parse(afterDays);
            }
            
            // Ensure they're arrays
            beforeDays = Array.isArray(beforeDays) ? beforeDays : [];
            afterDays = Array.isArray(afterDays) ? afterDays : [];
            
            // Format time to HH:mm format
            let notificationTime = apiData.notification_time || "09:00";
            if (notificationTime && notificationTime.length > 5) {
                notificationTime = notificationTime.substring(0, 5);
            }
            
            console.log("Processed days:", {
                beforeDays,
                afterDays,
                notificationTime
            });
            
            // Map day values to react-select options
            const beforeDayOptions = beforeDays.map(day => {
                const foundOption = daysOptions.find(opt => opt.value === day);
                return foundOption || { value: day, label: `${day} Day${day > 1 ? 's' : ''}` };
            });
            
            const afterDayOptions = afterDays.map(day => {
                const foundOption = daysOptions.find(opt => opt.value === day);
                return foundOption || { value: day, label: `${day} Day${day > 1 ? 's' : ''}` };
            });
            
            setReminderSettings({
                before_expiration_days: beforeDayOptions,
                before_enabled: apiData.before_enabled !== undefined ? Boolean(apiData.before_enabled) : false,
                after_expiration_days: afterDayOptions,
                after_enabled: apiData.after_enabled !== undefined ? Boolean(apiData.after_enabled) : false,
                notification_time: notificationTime,
                whatsapp_enabled: apiData.whatsapp_enabled !== undefined ? Boolean(apiData.whatsapp_enabled) : false,
                email_enabled: apiData.email_enabled !== undefined ? Boolean(apiData.email_enabled) : false,
            });
            
            console.log("Settings loaded into state:", {
                before_enabled: apiData.before_enabled,
                after_enabled: apiData.after_enabled,
                before_expiration_days: beforeDayOptions,
                after_expiration_days: afterDayOptions,
                notification_time: notificationTime,
                whatsapp_enabled: apiData.whatsapp_enabled,
                email_enabled: apiData.email_enabled
            });
            
        } catch (error) {
            console.error('Error loading notification settings:', error);
            showMessage('error', 'Error loading saved settings. Using defaults.');
        }
    };

    const fetchNotificationSettings = () => {
        dispatch(getNotificationSetting({}))
            .unwrap()
            .catch((error) => {
                console.error('Failed to fetch notification settings:', error);
                showMessage('error', 'Failed to load notification settings');
            });
    };

    const handleSaveSettings = async () => {
        try {
            // Extract just the values from react-select options
            const beforeDaysValues = reminderSettings.before_expiration_days.map(option => option.value);
            const afterDaysValues = reminderSettings.after_expiration_days.map(option => option.value);
            
            // Create the settings object as expected by backend
            const settingsData = {
                before_expiration_days: beforeDaysValues,
                before_enabled: reminderSettings.before_enabled,
                after_expiration_days: afterDaysValues,
                after_enabled: reminderSettings.after_enabled,
                notification_time: reminderSettings.notification_time,
                whatsapp_enabled: reminderSettings.whatsapp_enabled,
                email_enabled: reminderSettings.email_enabled
            };
            
            console.log("Saving data to API:", settingsData);
            
            await dispatch(updateNotificationSetting({ request: settingsData })).unwrap();
            
            showMessage('success', 'Reminder settings saved successfully!');
            
            // Refresh the data after successful update
            setTimeout(() => {
                fetchNotificationSettings();
            }, 500);
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            showMessage('error', error || 'Failed to save settings');
        }
    };

    const handleResetToDefaults = () => {
        const defaultBeforeDays = [5, 3, 1].map(day => daysOptions.find(opt => opt.value === day));
        const defaultAfterDays = [1, 3, 5].map(day => daysOptions.find(opt => opt.value === day));
        
        setReminderSettings({
            before_expiration_days: defaultBeforeDays,
            before_enabled: true,
            after_expiration_days: defaultAfterDays,
            after_enabled: true,
            notification_time: "09:00",
            whatsapp_enabled: true,
            email_enabled: true
        });
        showMessage('info', 'Settings reset to defaults');
    };

    const handleToggleChange = (field) => {
        setReminderSettings(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleMultiSelectChange = (field, selectedOptions) => {
        setReminderSettings(prev => ({
            ...prev,
            [field]: selectedOptions || []
        }));
    };

    const handleTimeChange = (e) => {
        setReminderSettings(prev => ({
            ...prev,
            notification_time: e.target.value
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Razorpay Payment Reminder Settings</h1>
                    <p className="text-gray-600">Configure automated payment reminder notifications for customers</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleSaveSettings} 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <IconRefresh className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <IconCheckCircle className="w-5 h-5 mr-2" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Indicators */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Error: {error}</p>
                </div>
            )}

            {updateNotificationSettingSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">✓ Settings updated successfully!</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Before Expiration Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                <IconCalendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Before Expiration</h3>
                                <p className="text-sm text-gray-600">Pre-payment reminders</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${reminderSettings.before_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reminderSettings.before_enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {reminderSettings.before_enabled && reminderSettings.before_expiration_days.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Reminder Days:</span>
                                <div className="flex flex-wrap gap-1">
                                    {reminderSettings.before_expiration_days.map((option) => (
                                        <span key={option.value} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
                                            {option.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* After Expiration Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                <IconBell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">After Expiration</h3>
                                <p className="text-sm text-gray-600">Post-payment reminders</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${reminderSettings.after_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reminderSettings.after_enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {reminderSettings.after_enabled && reminderSettings.after_expiration_days.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Reminder Days:</span>
                                <div className="flex flex-wrap gap-1">
                                    {reminderSettings.after_expiration_days.map((option) => (
                                        <span key={option.value} className="px-2 py-1 bg-red-50 border border-red-200 rounded text-xs">
                                            {option.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Channels Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                <IconMail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Notification Channels</h3>
                                <p className="text-sm text-gray-600">Delivery methods</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reminderSettings.whatsapp_enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <span className={`text-sm font-semibold ${reminderSettings.whatsapp_enabled ? 'text-green-600' : 'text-gray-400'}`}>WA</span>
                                </div>
                                <span className="text-gray-700">WhatsApp</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${reminderSettings.whatsapp_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {reminderSettings.whatsapp_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reminderSettings.email_enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <IconMail className={`w-4 h-4 ${reminderSettings.email_enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                                </div>
                                <span className="text-gray-700">Email</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${reminderSettings.email_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {reminderSettings.email_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Settings Summary Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                <IconSettings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Settings Summary</h3>
                                <p className="text-sm text-gray-600">Overview of configuration</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Before Expiration Reminders:</span>
                            <span className="font-semibold">{reminderSettings.before_enabled ? (reminderSettings.before_expiration_days?.length || 0) : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">After Expiration Reminders:</span>
                            <span className="font-semibold">{reminderSettings.after_enabled ? (reminderSettings.after_expiration_days?.length || 0) : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Total Reminders Per Payment:</span>
                            <span className="font-semibold text-purple-600">
                                {(reminderSettings.before_enabled ? (reminderSettings.before_expiration_days?.length || 0) : 0) +
                                    (reminderSettings.after_enabled ? (reminderSettings.after_expiration_days?.length || 0) : 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Notification Time:</span>
                            <span className="font-semibold flex items-center space-x-2">
                                <IconClock className="w-4 h-4 text-gray-500" />
                                <span>{reminderSettings.notification_time}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Configure Reminder Settings</h2>
                    <p className="text-gray-600 mt-1">Set up automated payment reminders for Razorpay payments</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Before Expiration Settings */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Before Expiration Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Enable Before Expiration Reminders</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={reminderSettings.before_enabled} 
                                                onChange={() => handleToggleChange('before_enabled')} 
                                            />
                                            <div
                                                className={`w-11 h-6 rounded-full peer ${reminderSettings.before_enabled ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                                            ></div>
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Days Before Expiration
                                        </label>
                                        <Select
                                            isMulti
                                            options={daysOptions}
                                            value={reminderSettings.before_expiration_days}
                                            onChange={(selected) => handleMultiSelectChange('before_expiration_days', selected)}
                                            placeholder="Select days (e.g., 5, 3, 1 days before)"
                                            className="react-select"
                                            classNamePrefix="select"
                                            isDisabled={!reminderSettings.before_enabled}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* After Expiration Settings */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">After Expiration Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Enable After Expiration Reminders</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={reminderSettings.after_enabled} 
                                                onChange={() => handleToggleChange('after_enabled')} 
                                            />
                                            <div
                                                className={`w-11 h-6 rounded-full peer ${reminderSettings.after_enabled ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                                            ></div>
                                        </label>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Days After Expiration
                                        </label>
                                        <Select
                                            isMulti
                                            options={daysOptions}
                                            value={reminderSettings.after_expiration_days}
                                            onChange={(selected) => handleMultiSelectChange('after_expiration_days', selected)}
                                            placeholder="Select days (e.g., 1, 3, 5 days after)"
                                            className="react-select"
                                            classNamePrefix="select"
                                            isDisabled={!reminderSettings.after_enabled}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Notification Configuration</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notification Time
                                        </label>
                                        <input
                                            type="time"
                                            value={reminderSettings.notification_time}
                                            onChange={handleTimeChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">Enable WhatsApp Notifications</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={reminderSettings.whatsapp_enabled} 
                                                    onChange={() => handleToggleChange('whatsapp_enabled')} 
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full peer ${reminderSettings.whatsapp_enabled ? 'bg-green-600' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600`}
                                                ></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">Enable Email Notifications</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={reminderSettings.email_enabled} 
                                                    onChange={() => handleToggleChange('email_enabled')} 
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full peer ${reminderSettings.email_enabled ? 'bg-blue-600' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                                                ></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-600">
                                {notificationSettingData && (notificationSettingData.data || notificationSettingData).updatedAt
                                    ? `Last updated: ${new Date((notificationSettingData.data || notificationSettingData).updatedAt).toLocaleString()}`
                                    : 'No saved settings found'
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleResetToDefaults}
                                className="btn btn-outline-primary"
                                disabled={loading}
                            >
                                <IconRefresh className="w-4 h-4 mr-2" />
                                Reset to Defaults
                            </button>
                            <button 
                                onClick={handleSaveSettings} 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <IconRefresh className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <IconCheckCircle className="w-5 h-5 mr-2" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RazorpayReminderSettings;