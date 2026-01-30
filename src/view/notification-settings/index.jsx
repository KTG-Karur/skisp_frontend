import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import FormLayout from '../../util/formLayout';
import { showMessage } from '../../util/AllFunction';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconBell from '../../components/Icon/IconBell';
import IconMail from '../../components/Icon/IconMail';
import IconMessageCircle from '../../components/Icon/IconMail';
import IconSettings from '../../components/Icon/IconSettings';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconClock from '../../components/Icon/IconClock';

const RazorpayReminderSettings = () => {
    const dispatch = useDispatch();

    // Reminder settings state - loaded from localStorage or default
    const [reminderSettings, setReminderSettings] = useState(() => {
        const saved = localStorage.getItem('razorpay_reminder_settings');
        return saved
            ? JSON.parse(saved)
            : {
                  // Before expiration reminders - just days
                  before_expiration_days: [5, 3, 1],
                  before_enabled: true,

                  // After expiration reminders - just days
                  after_expiration_days: [1, 3, 5],
                  after_enabled: true,

                  // Notification time (single time for all reminders)
                  notification_time: '09:00',

                  // Notification channels
                  whatsapp_enabled: true,
                  email_enabled: true,

                  // Message templates
                  whatsapp_template: 'Dear {customer_name}, your payment of ₹{amount} for {description} will expire on {expiration_date}. Please complete the payment at: {payment_link}',
                  email_subject: 'Payment Expiry Reminder - {description}',
                  email_template: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Payment Expiry Reminder</h2>
                    <p>Dear {customer_name},</p>
                    <p>This is a reminder that your payment of <strong>₹{amount}</strong> for <strong>{description}</strong> will expire on <strong>{expiration_date}</strong>.</p>
                    <p>Please complete the payment at your earliest convenience:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="{payment_link}" style="background: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Pay Now (₹{amount})
                        </a>
                    </p>
                    <br>
                    <p>Best regards,<br>Your Company</p>
                    </div>`,
              };
    });

    useEffect(() => {
        dispatch(setPageTitle('Razorpay Reminder Settings'));
    }, [dispatch]);

    // Form configuration for reminder settings
    const reminderSettingsForm = [
        {
            formFields: [
                {
                    title: 'Before Expiration Reminders',
                    inputType: 'title',
                    fontSize: '18px',
                    classStyle: 'col-span-12 mb-6 text-gray-800 font-semibold',
                },
                {
                    label: 'Enable Before Expiration Reminders',
                    name: 'before_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Days Before Expiration',
                    name: 'before_expiration_days',
                    inputType: 'multiSelect',
                    optionList: 'daysOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select days before expiration',
                    require: true,
                    classStyle: 'col-span-12 lg:col-span-8 mb-6',
                },
                {
                    label: 'Reminder Time',
                    name: 'notification_time',
                    inputType: 'time',
                    placeholder: 'Select time',
                    require: true,
                    classStyle: 'col-span-12 lg:col-span-4 mb-6',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'After Expiration Reminders',
                    inputType: 'title',
                    fontSize: '18px',
                    classStyle: 'col-span-12 mb-6 text-gray-800 font-semibold',
                },
                {
                    label: 'Enable After Expiration Reminders',
                    name: 'after_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Days After Expiration',
                    name: 'after_expiration_days',
                    inputType: 'multiSelect',
                    optionList: 'daysOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select days after expiration',
                    require: true,
                    classStyle: 'col-span-12 lg:col-span-8 mb-6',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'Notification Channels',
                    inputType: 'title',
                    fontSize: '18px',
                    classStyle: 'col-span-12 mb-6 text-gray-800 font-semibold',
                },
                {
                    label: 'Send WhatsApp Notifications',
                    name: 'whatsapp_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
                {
                    label: 'Send Email Notifications',
                    name: 'email_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'Message Templates',
                    inputType: 'title',
                    fontSize: '18px',
                    classStyle: 'col-span-12 mb-6 text-gray-800 font-semibold',
                },
                {
                    label: 'WhatsApp Message Template',
                    name: 'whatsapp_template',
                    inputType: 'textarea',
                    placeholder: 'Enter WhatsApp message template',
                    rows: 4,
                    classStyle: 'col-span-12 mb-6',
                    description: 'Available variables: {customer_name}, {amount}, {description}, {expiration_date}, {payment_link}',
                },
                {
                    label: 'Email Subject Template',
                    name: 'email_subject',
                    inputType: 'text',
                    placeholder: 'Enter email subject template',
                    classStyle: 'col-span-12 mb-4',
                    description: 'Available variables: {customer_name}, {amount}, {description}, {expiration_date}',
                },
                {
                    label: 'Email Body Template (HTML)',
                    name: 'email_template',
                    inputType: 'textarea',
                    placeholder: 'Enter email HTML template',
                    rows: 8,
                    classStyle: 'col-span-12 mb-6',
                    description: 'Available variables: {customer_name}, {amount}, {description}, {expiration_date}, {payment_link}',
                },
            ],
        },
    ];

    // Option lists
    const optionListState = {
        daysOptions: [
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
        ],
    };

    const handleSaveSettings = () => {
        // Save settings to localStorage
        localStorage.setItem('razorpay_reminder_settings', JSON.stringify(reminderSettings));
        showMessage('success', 'Reminder settings saved successfully!');
    };

    const handleTestReminder = () => {
        showMessage('info', 'Test reminder would be sent to configured test numbers/emails');
        // In real implementation, you would call an API to send test reminders
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Razorpay Payment Reminder Settings</h1>
                    <p className="text-gray-600">Configure automated payment reminder notifications for customers</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleTestReminder} className="btn btn-secondary">
                        <IconBell className="w-5 h-5 mr-2" />
                        Test Reminder
                    </button>
                    <button onClick={handleSaveSettings} className="btn btn-success">
                        <IconCheckCircle className="w-5 h-5 mr-2" />
                        Save Settings
                    </button>
                </div>
            </div>

            {/* Settings Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Before Expiration Card */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                <IconCalendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-800">Before Expiration</h3>
                                <p className="text-sm text-blue-600">{reminderSettings.before_enabled ? 'Enabled' : 'Disabled'}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${reminderSettings.before_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reminderSettings.before_enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {reminderSettings.before_enabled && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Reminder Days:</span>
                                <div className="flex flex-wrap gap-1">
                                    {reminderSettings.before_expiration_days.map((day) => (
                                        <span key={day} className="px-2 py-1 bg-white border border-blue-200 rounded text-xs">
                                            {day} day{day > 1 ? 's' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Time:</span>
                                <span className="flex items-center space-x-2">
                                    <IconClock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{reminderSettings.notification_time}</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* After Expiration Card */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                <IconBell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-800">After Expiration</h3>
                                <p className="text-sm text-red-600">{reminderSettings.after_enabled ? 'Enabled' : 'Disabled'}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${reminderSettings.after_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reminderSettings.after_enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {reminderSettings.after_enabled && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Reminder Days:</span>
                                <div className="flex flex-wrap gap-1">
                                    {reminderSettings.after_expiration_days.map((day) => (
                                        <span key={day} className="px-2 py-1 bg-white border border-red-200 rounded text-xs">
                                            {day} day{day > 1 ? 's' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Time:</span>
                                <span className="flex items-center space-x-2">
                                    <IconClock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{reminderSettings.notification_time}</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Channels Card */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                <IconMessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800">Notification Channels</h3>
                                <p className="text-sm text-green-600">Message delivery methods</p>
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

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                <IconSettings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-purple-800">Settings Summary</h3>
                                <p className="text-sm text-purple-600">Total reminders configured</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Before Expiration Reminders:</span>
                            <span className="font-semibold">{reminderSettings.before_enabled ? reminderSettings.before_expiration_days.length : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">After Expiration Reminders:</span>
                            <span className="font-semibold">{reminderSettings.after_enabled ? reminderSettings.after_expiration_days.length : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Total Reminders Per Payment:</span>
                            <span className="font-semibold text-purple-600">
                                {(reminderSettings.before_enabled ? reminderSettings.before_expiration_days.length : 0) +
                                    (reminderSettings.after_enabled ? reminderSettings.after_expiration_days.length : 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Daily Notification Time:</span>
                            <span className="font-semibold">{reminderSettings.notification_time}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Configure Reminder Settings</h2>
                    <p className="text-gray-600 mt-1">Set up automated payment reminders for Razorpay payments</p>
                </div>
                <div className="p-6">
                    <FormLayout
                        dynamicForm={reminderSettingsForm}
                        state={reminderSettings}
                        setState={setReminderSettings}
                        optionListState={optionListState}
                        handleSubmit={handleSaveSettings}
                        noOfColumns={2}
                    />
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Settings are automatically saved to your browser's local storage</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const defaultSettings = {
                                        before_expiration_days: [5, 3, 1],
                                        before_enabled: true,
                                        after_expiration_days: [1, 3, 5],
                                        after_enabled: true,
                                        notification_time: '09:00',
                                        whatsapp_enabled: true,
                                        email_enabled: true,
                                        whatsapp_template:
                                            'Dear {customer_name}, your payment of ₹{amount} for {description} will expire on {expiration_date}. Please complete the payment at: {payment_link}',
                                        email_subject: 'Payment Expiry Reminder - {description}',
                                        email_template: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                            <h2>Payment Expiry Reminder</h2>
                                            <p>Dear {customer_name},</p>
                                            <p>This is a reminder that your payment of <strong>₹{amount}</strong> for <strong>{description}</strong> will expire on <strong>{expiration_date}</strong>.</p>
                                            <p>Please complete the payment at your earliest convenience.</p>
                                            <p style="text-align: center; margin: 20px 0;">
                                                <a href="{payment_link}" style="background: #4361ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                                    Pay Now (₹{amount})
                                                </a>
                                            </p>
                                            <br>
                                            <p>Best regards,<br>Your Company</p>
                                            </div>`,
                                    };
                                    setReminderSettings(defaultSettings);
                                    showMessage('info', 'Settings reset to defaults');
                                }}
                                className="btn btn-outline-secondary"
                            >
                                Reset to Defaults
                            </button>
                            <button onClick={handleSaveSettings} className="btn btn-success">
                                <IconCheckCircle className="w-5 h-5 mr-2" />
                                Save All Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Variables Help */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-4">Available Template Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{customer_name}'}</code>
                            <span className="text-sm text-gray-700">Customer's full name</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{amount}'}</code>
                            <span className="text-sm text-gray-700">Payment amount (₹5000)</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{description}'}</code>
                            <span className="text-sm text-gray-700">Payment description</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{expiration_date}'}</code>
                            <span className="text-sm text-gray-700">Expiration date (Dec 31, 2024)</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{payment_link}'}</code>
                            <span className="text-sm text-gray-700">Razorpay payment link</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{'{invoice_number}'}</code>
                            <span className="text-sm text-gray-700">Invoice number (INV-2024-001)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RazorpayReminderSettings;
