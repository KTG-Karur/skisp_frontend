import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../util/ModelViewBox';
import FormLayout from '../../util/formLayout';
import { showMessage, showConfirmationDialog } from '../../util/AllFunction';
import Accordians from '../../util/Accordians';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconBell from '../../components/Icon/IconBell';
import IconMail from '../../components/Icon/IconMail';
import IconMessageCircle from '../../components/Icon/IconMail';
import IconSettings from '../../components/Icon/IconSettings';
import IconPlus from '../../components/Icon/IconPlus';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEdit from '../../components/Icon/IconEdit';
import IconEye from '../../components/Icon/IconEye';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconClock from '../../components/Icon/IconClock';
import IconSun from '../../components/Icon/IconSun';
import IconMoon from '../../components/Icon/IconMoon';
import IconSunset from '../../components/Icon/IconSun';
import IconSearch from '../../components/Icon/IconMoon';
import IconPay from '../../components/Icon/IconRupee';

const RazorpayPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [settingsModal, setSettingsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [activeAccordion, setActiveAccordion] = useState(0);

    // Form state for new payment
    const [formState, setFormState] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        amount: '',
        description: '',
        currency: 'INR',
        expiration_date: '',
        payment_status: 'pending',
        customer_id: '',
        invoice_number: '',
    });

    // Reminder settings state
    const [reminderSettings, setReminderSettings] = useState({
        // Before expiration reminders
        before_expiration_days: [5, 3, 1],
        before_times_of_day: ['morning', 'evening', 'midnight'],
        before_enabled: true,

        // After expiration reminders
        after_expiration_days: [1, 3, 5],
        after_times_of_day: ['morning', 'evening', 'midnight'],
        after_enabled: true,

        // Notification channels
        whatsapp_enabled: true,
        email_enabled: true,

        // Message templates
        whatsapp_template: 'Dear {customer_name}, your payment of ₹{amount} for {description} will expire on {expiration_date}. Please complete the payment.',
        email_subject: 'Payment Expiry Reminder - {description}',
        email_template: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Expiry Reminder</h2>
      <p>Dear {customer_name},</p>
      <p>This is a reminder that your payment of <strong>₹{amount}</strong> for <strong>{description}</strong> will expire on <strong>{expiration_date}</strong>.</p>
      <p>Please complete the payment at your earliest convenience.</p>
      <p>Payment Link: {payment_link}</p>
      <br>
      <p>Best regards,<br>Your Company Name</p>
    </div>`,
    });

    // Static payment data
    const [payments, setPayments] = useState([
        {
            id: 1,
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            customer_phone: '+919876543210',
            amount: 5000,
            description: 'Monthly Subscription',
            currency: 'INR',
            expiration_date: '2024-12-31',
            created_date: '2024-01-15',
            payment_status: 'pending',
            razorpay_order_id: 'order_123456',
            customer_id: 'CUST001',
            invoice_number: 'INV-2024-001',
            reminders_sent: 2,
        },
        {
            id: 2,
            customer_name: 'Jane Smith',
            customer_email: 'jane@example.com',
            customer_phone: '+919123456780',
            amount: 7500,
            description: 'Annual Plan',
            currency: 'INR',
            expiration_date: '2024-12-25',
            created_date: '2024-01-14',
            payment_status: 'completed',
            razorpay_order_id: 'order_123457',
            customer_id: 'CUST002',
            invoice_number: 'INV-2024-002',
            reminders_sent: 0,
        },
        {
            id: 3,
            customer_name: 'Bob Johnson',
            customer_email: 'bob@example.com',
            customer_phone: '+919987654321',
            amount: 3000,
            description: 'Service Charge',
            currency: 'INR',
            expiration_date: '2024-12-20',
            created_date: '2024-01-13',
            payment_status: 'failed',
            razorpay_order_id: 'order_123458',
            customer_id: 'CUST003',
            invoice_number: 'INV-2024-003',
            reminders_sent: 5,
        },
        {
            id: 4,
            customer_name: 'Alice Brown',
            customer_email: 'alice@example.com',
            customer_phone: '+919876512345',
            amount: 10000,
            description: 'Project Fee',
            currency: 'INR',
            expiration_date: '2024-12-28',
            created_date: '2024-01-12',
            payment_status: 'pending',
            razorpay_order_id: 'order_123459',
            customer_id: 'CUST004',
            invoice_number: 'INV-2024-004',
            reminders_sent: 1,
        },
    ]);

    useEffect(() => {
        dispatch(setPageTitle('Razorpay Payment Management'));
    }, [dispatch]);

    // Calculate statistics
    const calculateStats = () => {
        const total = payments.length;
        const pending = payments.filter((p) => p.payment_status === 'pending').length;
        const completed = payments.filter((p) => p.payment_status === 'completed').length;
        const failed = payments.filter((p) => p.payment_status === 'failed').length;
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = payments.filter((p) => p.payment_status === 'pending').reduce((sum, p) => sum + p.amount, 0);

        return { total, pending, completed, failed, totalAmount, pendingAmount };
    };

    const stats = calculateStats();

    // Form configuration for payment
    const paymentForm = [
        {
            formFields: [
                {
                    label: 'Customer Name',
                    name: 'customer_name',
                    inputType: 'text',
                    placeholder: 'Enter customer name',
                    require: true,
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Customer Email',
                    name: 'customer_email',
                    inputType: 'text',
                    placeholder: 'Enter customer email',
                    require: true,
                    validation: {
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email format',
                        },
                    },
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Customer Phone',
                    name: 'customer_phone',
                    inputType: 'text',
                    placeholder: 'Enter customer phone',
                    require: true,
                    mask: '(999) 999-9999',
                    validation: {
                        pattern: {
                            value: /^[0-9]{10}$/,
                            message: '10 digit phone number required',
                        },
                    },
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Amount (₹)',
                    name: 'amount',
                    inputType: 'number',
                    placeholder: 'Enter amount',
                    require: true,
                    min: 1,
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Currency',
                    name: 'currency',
                    inputType: 'select',
                    optionList: 'currencies',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    require: true,
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Expiration Date',
                    name: 'expiration_date',
                    inputType: 'date',
                    require: true,
                    minmumDate: new Date().toISOString().split('T')[0],
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Description',
                    name: 'description',
                    inputType: 'textarea',
                    placeholder: 'Enter payment description',
                    require: true,
                    classStyle: 'col-span-12',
                },
                {
                    label: 'Customer ID',
                    name: 'customer_id',
                    inputType: 'text',
                    placeholder: 'Enter customer ID',
                    classStyle: 'col-span-12 lg:col-span-6',
                },
                {
                    label: 'Invoice Number',
                    name: 'invoice_number',
                    inputType: 'text',
                    placeholder: 'Enter invoice number',
                    classStyle: 'col-span-12 lg:col-span-6',
                },
            ],
        },
    ];

    // Form configuration for reminder settings
    const reminderSettingsForm = [
        {
            formFields: [
                {
                    title: 'Before Expiration Reminders',
                    inputType: 'title',
                    fontSize: '16px',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Enabled',
                    name: 'before_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 mb-2',
                },
                {
                    label: 'Days Before Expiration',
                    name: 'before_expiration_days',
                    inputType: 'multiSelect',
                    optionList: 'daysOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select days',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
                {
                    label: 'Times of Day',
                    name: 'before_times_of_day',
                    inputType: 'multiSelect',
                    optionList: 'timeOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select times',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'After Expiration Reminders',
                    inputType: 'title',
                    fontSize: '16px',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Enabled',
                    name: 'after_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 mb-2',
                },
                {
                    label: 'Days After Expiration',
                    name: 'after_expiration_days',
                    inputType: 'multiSelect',
                    optionList: 'daysOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select days',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
                {
                    label: 'Times of Day',
                    name: 'after_times_of_day',
                    inputType: 'multiSelect',
                    optionList: 'timeOptions',
                    uniqueKey: 'value',
                    displayKey: 'label',
                    placeholder: 'Select times',
                    classStyle: 'col-span-12 lg:col-span-6 mb-4',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'Notification Channels',
                    inputType: 'title',
                    fontSize: '16px',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'WhatsApp Notifications',
                    name: 'whatsapp_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 lg:col-span-6 mb-2',
                },
                {
                    label: 'Email Notifications',
                    name: 'email_enabled',
                    inputType: 'checkbox',
                    classStyle: 'col-span-12 lg:col-span-6 mb-2',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'WhatsApp Message Template',
                    inputType: 'title',
                    fontSize: '16px',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Message Template',
                    name: 'whatsapp_template',
                    inputType: 'textarea',
                    placeholder: 'Enter WhatsApp message template',
                    rows: 4,
                    classStyle: 'col-span-12 mb-4',
                },
            ],
        },
        {
            formFields: [
                {
                    title: 'Email Template',
                    inputType: 'title',
                    fontSize: '16px',
                    classStyle: 'col-span-12 mb-4',
                },
                {
                    label: 'Email Subject',
                    name: 'email_subject',
                    inputType: 'text',
                    placeholder: 'Enter email subject',
                    classStyle: 'col-span-12 mb-2',
                },
                {
                    label: 'Email Template',
                    name: 'email_template',
                    inputType: 'textarea',
                    placeholder: 'Enter email HTML template',
                    rows: 8,
                    classStyle: 'col-span-12 mb-4',
                },
            ],
        },
    ];

    // Option lists
    const optionListState = {
        currencies: [
            { value: 'INR', label: 'Indian Rupee (₹)' },
            { value: 'USD', label: 'US Dollar ($)' },
            { value: 'EUR', label: 'Euro (€)' },
        ],
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
        timeOptions: [
            { value: 'morning', label: 'Morning (9:00 AM)' },
            { value: 'afternoon', label: 'Afternoon (2:00 PM)' },
            { value: 'evening', label: 'Evening (6:00 PM)' },
            { value: 'midnight', label: 'Midnight (12:00 AM)' },
        ],
        statusOptions: [
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
            { value: 'expired', label: 'Expired' },
        ],
    };

    // Table columns
    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: (row) => <div className="text-center">{row.row.index + 1}</div>,
            width: 70,
        },
        {
            Header: 'Customer',
            accessor: 'customer_name',
            Cell: ({ row }) => {
                const payment = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {payment.customer_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="font-medium">{payment.customer_name}</div>
                            <div className="text-xs text-gray-500">{payment.customer_email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value, row }) => {
                const payment = row.original;
                return (
                    <div>
                        <div className="font-bold text-gray-800">₹{value.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-500">{payment.currency}</div>
                    </div>
                );
            },
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ value }) => <div className="text-sm text-gray-700">{value}</div>,
        },
        {
            Header: 'Expiration Date',
            accessor: 'expiration_date',
            Cell: ({ value }) => (
                <div className="flex items-center space-x-2">
                    <IconCalendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(value).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'payment_status',
            Cell: ({ value }) => {
                const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    completed: 'bg-green-100 text-green-800',
                    failed: 'bg-red-100 text-red-800',
                    expired: 'bg-gray-100 text-gray-800',
                };
                return <span className={`px-2 py-1 text-xs rounded-full ${statusColors[value] || 'bg-gray-100'}`}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>;
            },
        },
        {
            Header: 'Reminders',
            accessor: 'reminders_sent',
            Cell: ({ value }) => (
                <div className="flex items-center space-x-2">
                    <IconBell className="w-4 h-4 text-gray-400" />
                    <span>{value}</span>
                </div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const payment = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Tippy content="View Details">
                            <button onClick={() => handleViewPayment(payment)} className="btn btn-sm btn-outline-info">
                                <span>Pay</span>
                                <IconPay className="w-4 h-4" />
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 180,
        },
    ];

    // Handle functions
    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setViewModal(true);
    };

    const handleEditPayment = (payment) => {
        setFormState({
            ...payment,
            amount: payment.amount.toString(),
        });
        setModal(true);
    };

    const handleDeletePayment = async (id) => {
        const confirm = await showConfirmationDialog('Are you sure you want to delete this payment?');
        if (confirm) {
            setPayments(payments.filter((p) => p.id !== id));
            showMessage('success', 'Payment deleted successfully');
        }
    };

    const handleSendReminder = (payment) => {
        // Simulate sending reminder
        const newLog = {
            id: reminderLogs.length + 1,
            payment_id: payment.id,
            customer_name: payment.customer_name,
            reminder_type: 'before_expiration',
            days_before: 1,
            time_of_day: 'morning',
            channel: 'whatsapp',
            status: 'sent',
            sent_at: new Date().toISOString(),
            message: `Reminder sent for payment of ₹${payment.amount}`,
        };

        setReminderLogs([newLog, ...reminderLogs]);

        // Update reminders count
        setPayments(payments.map((p) => (p.id === payment.id ? { ...p, reminders_sent: p.reminders_sent + 1 } : p)));

        showMessage('success', 'Reminder sent successfully');
    };

    const handleSubmit = () => {
        if (formState.id) {
            // Update existing payment
            setPayments(
                payments.map((p) =>
                    p.id === formState.id
                        ? {
                              ...p,
                              ...formState,
                              amount: parseFloat(formState.amount),
                              updated_date: new Date().toISOString().split('T')[0],
                          }
                        : p,
                ),
            );
            showMessage('success', 'Payment updated successfully');
        } else {
            // Create new payment
            const newPayment = {
                id: payments.length + 1,
                ...formState,
                amount: parseFloat(formState.amount),
                created_date: new Date().toISOString().split('T')[0],
                payment_status: 'pending',
                razorpay_order_id: `order_${Date.now()}`,
                reminders_sent: 0,
            };
            setPayments([newPayment, ...payments]);
            showMessage('success', 'Payment created successfully');
        }
        closeModal();
    };

    const handleSaveSettings = () => {
        // Save settings to localStorage or API
        localStorage.setItem('razorpay_reminder_settings', JSON.stringify(reminderSettings));
        showMessage('success', 'Reminder settings saved successfully');
        setSettingsModal(false);
    };

    const closeModal = () => {
        setModal(false);
        setFormState({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            amount: '',
            description: '',
            currency: 'INR',
            expiration_date: '',
            payment_status: 'pending',
            customer_id: '',
            invoice_number: '',
        });
    };

    const closeViewModal = () => {
        setViewModal(false);
        setSelectedPayment(null);
    };

    const closeSettingsModal = () => {
        setSettingsModal(false);
    };

    // Get time icon based on time of day
    const getTimeIcon = (time) => {
        switch (time) {
            case 'morning':
                return <IconSun className="w-4 h-4" />;
            case 'afternoon':
                return <IconSunset className="w-4 h-4" />;
            case 'evening':
                return <IconMoon className="w-4 h-4" />;
            case 'midnight':
                return <IconClock className="w-4 h-4" />;
            default:
                return <IconClock className="w-4 h-4" />;
        }
    };

    // Filter data
    const getFilteredData = () => {
        let filtered = payments;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (payment) =>
                    payment.customer_name.toLowerCase().includes(term) ||
                    payment.customer_email.toLowerCase().includes(term) ||
                    payment.description.toLowerCase().includes(term) ||
                    payment.invoice_number.toLowerCase().includes(term),
            );
        }
        return filtered;
    };

    const getPaginatedData = () => {
        const dataArray = getFilteredData();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Razorpay Payment Management</h1>
                <p className="text-gray-600">Manage payments and set up expiration reminders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Payments</p>
                            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                            <p className="text-sm text-blue-600">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <IconCalendar className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                            <p className="text-sm text-yellow-600">₹{stats.pendingAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <IconClock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                        </div>
                        <IconCheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Failed</p>
                            <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
                        </div>
                        <IconXCircle className="w-8 h-8 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Search and Action Bar */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <IconSearch className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by customer, description, or invoice..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-12 pr-4 py-3 w-full md:w-80"
                            />
                        </div>
                        <button onClick={() => setSettingsModal(true)} className="btn btn-secondary">
                            <IconSettings className="w-5 h-5 mr-2" />
                            Reminder Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payments Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">Payment List</h2>
                        </div>
                        <div className="p-6">
                            <Table
                                columns={columns}
                                data={getPaginatedData()}
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                totalCount={getFilteredData().length}
                                totalPages={Math.ceil(getFilteredData().length / pageSize)}
                                onPaginationChange={(pageIndex, newPageSize) => {
                                    setCurrentPage(pageIndex);
                                    setPageSize(newPageSize);
                                }}
                                pagination={true}
                                isSearchable={false}
                                isSortable={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Reminder Settings Preview */}
                <div className="bg-white rounded-xl shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Reminder Settings</h2>
                        <p className="text-sm text-gray-600">Current configuration</p>
                    </div>
                    <div className="p-6">
                        <Accordians
                            tabs={[
                                {
                                    label: 'Before Expiration',
                                    icon: <IconBell className="w-4 h-4" />,
                                },
                                {
                                    label: 'After Expiration',
                                    icon: <IconBell className="w-4 h-4" />,
                                },
                                {
                                    label: 'Notification Channels',
                                    icon: <IconMessageCircle className="w-4 h-4" />,
                                },
                            ]}
                            cols={1}
                            Title=""
                            toggleAcc={() => {}}
                            handleSubmit={() => {}}
                            btnName=""
                            saveBtn={false}
                        >
                            {activeAccordion === 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Enabled</span>
                                        <span className={`px-2 py-1 rounded ${reminderSettings.before_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {reminderSettings.before_enabled ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Reminder Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {reminderSettings.before_expiration_days.map((day) => (
                                                <span key={day} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {day} day{day > 1 ? 's' : ''} before
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Times of Day</label>
                                        <div className="space-y-2">
                                            {reminderSettings.before_times_of_day.map((time) => (
                                                <div key={time} className="flex items-center space-x-2">
                                                    {getTimeIcon(time)}
                                                    <span className="capitalize">{time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeAccordion === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Enabled</span>
                                        <span className={`px-2 py-1 rounded ${reminderSettings.after_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {reminderSettings.after_enabled ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Reminder Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {reminderSettings.after_expiration_days.map((day) => (
                                                <span key={day} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                                    {day} day{day > 1 ? 's' : ''} after
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Times of Day</label>
                                        <div className="space-y-2">
                                            {reminderSettings.after_times_of_day.map((time) => (
                                                <div key={time} className="flex items-center space-x-2">
                                                    {getTimeIcon(time)}
                                                    <span className="capitalize">{time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeAccordion === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">WhatsApp</span>
                                        <span className={`px-2 py-1 rounded ${reminderSettings.whatsapp_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {reminderSettings.whatsapp_enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Email</span>
                                        <span className={`px-2 py-1 rounded ${reminderSettings.email_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {reminderSettings.email_enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <label className="block text-sm font-medium mb-2">Sample Message</label>
                                        <div className="p-3 bg-gray-50 rounded text-sm">
                                            {reminderSettings.whatsapp_template
                                                .replace('{customer_name}', 'John Doe')
                                                .replace('{amount}', '5,000')
                                                .replace('{description}', 'Monthly Subscription')
                                                .replace('{expiration_date}', '31 Dec 2024')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Accordians>
                    </div>
                </div>
            </div>

            {/* Create/Edit Payment Modal */}
            <ModelViewBox
                modal={modal}
                modelHeader={formState.id ? 'Edit Payment' : 'Create New Payment'}
                setModel={closeModal}
                handleSubmit={handleSubmit}
                modelSize="lg"
                submitBtnText={formState.id ? 'Update Payment' : 'Create Payment'}
            >
                <div className="p-6">
                    <FormLayout dynamicForm={paymentForm} state={formState} setState={setFormState} optionListState={optionListState} handleSubmit={handleSubmit} noOfColumns={2} />
                </div>
            </ModelViewBox>

            {/* View Payment Modal */}
            <ModelViewBox modal={viewModal} modelHeader="Payment Details" setModel={closeViewModal} modelSize="lg" showSubmit={false}>
                {selectedPayment && (
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-xl text-white font-bold">{selectedPayment.customer_name?.[0]?.toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedPayment.customer_name}</h3>
                                    <p className="text-gray-600">{selectedPayment.customer_email}</p>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Amount</label>
                                    <p className="text-lg font-bold">₹{selectedPayment.amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Status</label>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            selectedPayment.payment_status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : selectedPayment.payment_status === 'pending'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : selectedPayment.payment_status === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {selectedPayment.payment_status.charAt(0).toUpperCase() + selectedPayment.payment_status.slice(1)}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Expiration Date</label>
                                    <p className="font-medium">{new Date(selectedPayment.expiration_date).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Reminders Sent</label>
                                    <p className="font-medium">{selectedPayment.reminders_sent}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Invoice Number</label>
                                    <p className="font-medium">{selectedPayment.invoice_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-500">Razorpay Order ID</label>
                                    <p className="font-medium font-mono">{selectedPayment.razorpay_order_id}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-500">Description</label>
                                <p className="text-gray-800">{selectedPayment.description}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-4 border-t">
                                <button onClick={() => handleSendReminder(selectedPayment)} className="btn btn-success">
                                    <IconPay className="w-4 h-4 mr-2" />
                                    Pay
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Reminder Settings Modal */}
            <ModelViewBox
                modal={settingsModal}
                modelHeader="Reminder Settings Configuration"
                setModel={closeSettingsModal}
                handleSubmit={handleSaveSettings}
                modelSize="xl"
                submitBtnText="Save Settings"
            >
                <div className="p-6">
                    <FormLayout
                        dynamicForm={reminderSettingsForm}
                        state={reminderSettings}
                        setState={setReminderSettings}
                        optionListState={optionListState}
                        handleSubmit={handleSaveSettings}
                        noOfColumns={2}
                    />

                    {/* Preview Section */}
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">Preview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-700 mb-3">Before Expiration</h4>
                                <div className="space-y-2">
                                    {reminderSettings.before_expiration_days.map((day) =>
                                        reminderSettings.before_times_of_day.map((time) => (
                                            <div key={`${day}-${time}`} className="flex items-center justify-between text-sm">
                                                <span>
                                                    {day} day{day > 1 ? 's' : ''} before • {time}
                                                </span>
                                                <span className="text-green-600">✓</span>
                                            </div>
                                        )),
                                    )}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-red-700 mb-3">After Expiration</h4>
                                <div className="space-y-2">
                                    {reminderSettings.after_expiration_days.map((day) =>
                                        reminderSettings.after_times_of_day.map((time) => (
                                            <div key={`${day}-${time}`} className="flex items-center justify-between text-sm">
                                                <span>
                                                    {day} day{day > 1 ? 's' : ''} after • {time}
                                                </span>
                                                <span className="text-green-600">✓</span>
                                            </div>
                                        )),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModelViewBox>
        </div>
    );
};

export default RazorpayPayment;
