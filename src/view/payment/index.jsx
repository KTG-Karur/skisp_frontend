import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconWifi from '../../components/Icon/IconWifi';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconAlertCircle from '../../components/Icon/IconAlertCircle';
import IconDollarSign from '../../components/Icon/IconRupee';
import IconShield from '../../components/Icon/IconShield';
import IconZap from '../../components/Icon/IconShield';
import IconUsers from '../../components/Icon/IconUsers';
import IconClock from '../../components/Icon/IconClock';
import IconSearch from '../../components/Icon/IconSearch';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';

// Static customer data with payment info
const staticCustomers = [
    {
        id: 1,
        user_id: 'testuser01',
        first_name: 'John',
        last_name: 'Doe',
        email_addr: 'john.doe@example.com',
        mobile_num: '9876543210',
        pri_bandwidth_plan_name: 'Guest WiFi',
        current_plan: 'Guest WiFi',
        expiry_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired 2 days ago
        status: 'expired',
        account_balance: -150,
        last_payment_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'credit_card',
        isActive: 1,
    },
    {
        id: 2,
        user_id: 'businessuser02',
        first_name: 'Sarah',
        last_name: 'Smith',
        email_addr: 'sarah.smith@business.com',
        mobile_num: '9876543211',
        pri_bandwidth_plan_name: 'Premium WiFi',
        current_plan: 'Premium WiFi',
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 5 days
        status: 'active',
        account_balance: 500,
        last_payment_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'bank_transfer',
        isActive: 1,
    },
    {
        id: 3,
        user_id: 'enterprise04',
        first_name: 'Michael',
        last_name: 'Chen',
        email_addr: 'michael.chen@enterprise.com',
        mobile_num: '9876543213',
        pri_bandwidth_plan_name: 'Business WiFi',
        current_plan: 'Business WiFi',
        expiry_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expired 10 days ago
        status: 'expired',
        account_balance: -1200,
        last_payment_date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'credit_card',
        isActive: 1,
    },
    {
        id: 4,
        user_id: 'student05',
        first_name: 'Emma',
        last_name: 'Wilson',
        email_addr: 'emma.wilson@university.edu',
        mobile_num: '9876543214',
        pri_bandwidth_plan_name: 'Unlimited WiFi',
        current_plan: 'Unlimited WiFi',
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
        status: 'active',
        account_balance: 0,
        last_payment_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'paypal',
        isActive: 1,
    },
    {
        id: 5,
        user_id: 'hotelguest06',
        first_name: 'David',
        last_name: 'Brown',
        email_addr: 'david.b@traveler.com',
        mobile_num: '9876543215',
        pri_bandwidth_plan_name: 'Guest WiFi',
        current_plan: 'Guest WiFi',
        expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
        status: 'expired',
        account_balance: -50,
        last_payment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'cash',
        isActive: 1,
    },
    {
        id: 6,
        user_id: 'conference07',
        first_name: 'Lisa',
        last_name: 'Taylor',
        email_addr: 'lisa.t@conference.com',
        mobile_num: '9876543216',
        pri_bandwidth_plan_name: 'Premium WiFi',
        current_plan: 'Premium WiFi',
        expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 15 days
        status: 'active',
        account_balance: 300,
        last_payment_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'credit_card',
        isActive: 1,
    },
];

// Available plans with pricing
const availablePlans = [
    {
        id: 1,
        name: 'Guest WiFi',
        description: 'Basic internet access for temporary users',
        price: 50,
        duration: 30, // days
        speed: '10 Mbps',
        data_limit: '10 GB',
        concurrent_users: 1,
        features: ['Basic Support', 'Email Access', 'Web Browsing'],
        popular: false,
        color: 'blue',
    },
    {
        id: 2,
        name: 'Premium WiFi',
        description: 'Enhanced speed for personal and business use',
        price: 150,
        duration: 30,
        speed: '50 Mbps',
        data_limit: 'Unlimited',
        concurrent_users: 3,
        features: ['Priority Support', 'HD Streaming', 'Online Gaming', 'VPN Support'],
        popular: true,
        color: 'purple',
    },
    {
        id: 3,
        name: 'Business WiFi',
        description: 'Enterprise-grade connectivity for businesses',
        price: 300,
        duration: 30,
        speed: '100 Mbps',
        data_limit: 'Unlimited',
        concurrent_users: 5,
        features: ['24/7 Support', 'Static IP', 'Advanced Security', 'Multiple Devices', 'Business VPN'],
        popular: false,
        color: 'green',
    },
    {
        id: 4,
        name: 'Unlimited WiFi',
        description: 'Top-tier unlimited high-speed internet',
        price: 500,
        duration: 30,
        speed: '200 Mbps',
        data_limit: 'Unlimited',
        concurrent_users: 10,
        features: ['Premium Support', '4K Streaming', 'Gaming Priority', 'Family Pack', 'No Throttling'],
        popular: false,
        color: 'red',
    },
];

// Payment methods
const paymentMethods = [
    { id: 1, name: 'Credit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
    { id: 2, name: 'PayPal', icon: '📱', description: 'PayPal Wallet' },
    { id: 3, name: 'Bank Transfer', icon: '🏦', description: 'Direct Bank Transfer' },
    { id: 4, name: 'Digital Wallet', icon: '👛', description: 'Google Pay, Apple Pay' },
    { id: 5, name: 'Cash', icon: '💵', description: 'Cash Payment' },
];

// Payment durations
const paymentDurations = [
    { id: 1, name: '30 Days', days: 30, discount: 0 },
    { id: 2, name: '90 Days', days: 90, discount: 10 },
    { id: 3, name: '180 Days', days: 180, discount: 15 },
    { id: 4, name: '365 Days', days: 365, discount: 20 },
];

const Index = () => {
    const dispatch = useDispatch();
    const [customers, setCustomers] = useState(staticCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [rechargeModal, setRechargeModal] = useState(false);
    const [switchModal, setSwitchModal] = useState(false);
    const [paymentSuccessModal, setPaymentSuccessModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Payment state
    const [paymentState, setPaymentState] = useState({
        selectedPlan: null,
        selectedDuration: paymentDurations[0],
        selectedPaymentMethod: paymentMethods[0],
        customAmount: '',
        applyPromoCode: false,
        promoCode: '',
        savePaymentMethod: false,
        autoRenew: false,
        agreeToTerms: false,
    });

    useEffect(() => {
        dispatch(setPageTitle('Payment & Recharge Management'));
    }, [dispatch]);

    const columns = [
        {
            Header: 'Customer',
            accessor: 'customer',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {row.original.first_name?.[0]}
                        {row.original.last_name?.[0]}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{`${row.original.first_name || ''} ${row.original.last_name || ''}`.trim()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.user_id}</div>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Current Plan',
            accessor: 'current_plan',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <IconWifi
                        className={`w-5 h-5 ${
                            row.original.pri_bandwidth_plan_name === 'Premium WiFi'
                                ? 'text-purple-500'
                                : row.original.pri_bandwidth_plan_name === 'Business WiFi'
                                ? 'text-green-500'
                                : row.original.pri_bandwidth_plan_name === 'Unlimited WiFi'
                                ? 'text-red-500'
                                : 'text-blue-500'
                        }`}
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{row.original.pri_bandwidth_plan_name}</span>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Expiry Status',
            accessor: 'expiry_status',
            Cell: ({ row }) => {
                const expiryDate = new Date(row.original.expiry_date);
                const today = new Date();
                const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                if (daysDiff < 0) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconAlertCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium text-red-600">Expired</span>
                            </div>
                            <div className="text-xs text-red-500">{Math.abs(daysDiff)} days ago</div>
                        </div>
                    );
                } else if (daysDiff <= 7) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconAlertCircle className="w-5 h-5 text-yellow-500" />
                                <span className="font-medium text-yellow-600">Expiring Soon</span>
                            </div>
                            <div className="text-xs text-yellow-600">{daysDiff} days left</div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconCheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                            <div className="text-xs text-green-600">{daysDiff} days left</div>
                        </div>
                    );
                }
            },
            sort: true,
        },
        {
            Header: 'Account Balance',
            accessor: 'account_balance',
            Cell: ({ row }) => (
                <div className={`text-lg font-bold ${row.original.account_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ₹{Math.abs(row.original.account_balance).toFixed(2)}
                    {row.original.account_balance < 0 && <span className="text-xs font-normal text-red-500 ml-1">(Due)</span>}
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Last Payment',
            accessor: 'last_payment',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{new Date(row.original.last_payment_date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.payment_method.replace('_', ' ').toUpperCase()}</div>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const customer = row.original;
                const expiryDate = new Date(customer.expiry_date);
                const today = new Date();
                const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                return (
                    <div className="flex items-center space-x-2">

                        <Tippy content="Recharge/Extend Plan">
                            <button onClick={() => handleRechargePlan(customer)} className="btn btn-sm btn-success hover:scale-105 transition-transform duration-200">
                                <IconRefresh className="w-4 h-4 mr-1" />
                                Recharge
                            </button>
                        </Tippy>

                        <Tippy content="Switch Plan">
                            <button onClick={() => handleSwitchPlan(customer)} className="btn btn-sm btn-info hover:scale-105 transition-transform duration-200">
                                <IconZap className="w-4 h-4 mr-1" />
                                Switch
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 200,
        },
    ];

    const handleMakePayment = (customer) => {
        setSelectedCustomer(customer);
        setPaymentState({
            ...paymentState,
            selectedPlan: availablePlans.find((p) => p.name === customer.current_plan),
            customAmount: Math.abs(customer.account_balance).toString(),
        });
        setPaymentModal(true);
    };

    const handleRechargePlan = (customer) => {
        setSelectedCustomer(customer);
        setPaymentState({
            ...paymentState,
            selectedPlan: availablePlans.find((p) => p.name === customer.current_plan),
            selectedDuration: paymentDurations[0],
        });
        setRechargeModal(true);
    };

    const handleSwitchPlan = (customer) => {
        setSelectedCustomer(customer);
        setPaymentState({
            ...paymentState,
            selectedPlan: availablePlans.find((p) => p.name === customer.current_plan),
            selectedDuration: paymentDurations[0],
        });
        setSwitchModal(true);
    };

    const handlePaymentSubmit = () => {
        // Process payment
        const amount = parseFloat(paymentState.customAmount) || 0;

        if (amount <= 0) {
            showMessage('error', 'Please enter a valid payment amount');
            return;
        }

        if (!paymentState.agreeToTerms) {
            showMessage('error', 'Please agree to the terms and conditions');
            return;
        }

        // Update customer balance
        setCustomers((prev) =>
            prev.map((c) =>
                c.id === selectedCustomer.id
                    ? {
                          ...c,
                          account_balance: c.account_balance + amount,
                          last_payment_date: new Date().toISOString(),
                          payment_method: paymentState.selectedPaymentMethod.name.toLowerCase().replace(' ', '_'),
                      }
                    : c
            )
        );

        showMessage('success', `Payment of ₹${amount.toFixed(2)} processed successfully!`);
        setPaymentModal(false);
        setPaymentSuccessModal(true);
    };

    const handleRechargeSubmit = () => {
        if (!paymentState.selectedPlan || !paymentState.selectedDuration) {
            showMessage('error', 'Please select a plan and duration');
            return;
        }

        if (!paymentState.agreeToTerms) {
            showMessage('error', 'Please agree to the terms and conditions');
            return;
        }

        const price = paymentState.selectedPlan.price;
        const duration = paymentState.selectedDuration.days;
        const discount = paymentState.selectedDuration.discount;
        const finalPrice = price * (duration / 30) * ((100 - discount) / 100);

        // Update customer expiry date and balance
        const newExpiryDate = new Date();
        if (selectedCustomer.status === 'expired') {
            newExpiryDate.setDate(newExpiryDate.getDate() + duration);
        } else {
            const currentExpiry = new Date(selectedCustomer.expiry_date);
            newExpiryDate.setTime(currentExpiry.getTime() + duration * 24 * 60 * 60 * 1000);
        }

        setCustomers((prev) =>
            prev.map((c) =>
                c.id === selectedCustomer.id
                    ? {
                          ...c,
                          expiry_date: newExpiryDate.toISOString(),
                          account_balance: c.account_balance - finalPrice,
                          last_payment_date: new Date().toISOString(),
                          payment_method: paymentState.selectedPaymentMethod.name.toLowerCase().replace(' ', '_'),
                          status: 'active',
                      }
                    : c
            )
        );

        showMessage('success', `Plan recharged successfully! Extended by ${duration} days.`);
        setRechargeModal(false);
        setPaymentSuccessModal(true);
    };

    const handleSwitchPlanSubmit = () => {
        if (!paymentState.selectedPlan) {
            showMessage('error', 'Please select a new plan');
            return;
        }

        if (!paymentState.agreeToTerms) {
            showMessage('error', 'Please agree to the terms and conditions');
            return;
        }

        const price = paymentState.selectedPlan.price;
        const duration = paymentState.selectedDuration.days;
        const discount = paymentState.selectedDuration.discount;
        const finalPrice = price * (duration / 30) * ((100 - discount) / 100);

        // Calculate new expiry date
        const newExpiryDate = new Date();
        if (selectedCustomer.status === 'expired') {
            newExpiryDate.setDate(newExpiryDate.getDate() + duration);
        } else {
            const currentExpiry = new Date(selectedCustomer.expiry_date);
            newExpiryDate.setTime(currentExpiry.getTime() + duration * 24 * 60 * 60 * 1000);
        }

        setCustomers((prev) =>
            prev.map((c) =>
                c.id === selectedCustomer.id
                    ? {
                          ...c,
                          pri_bandwidth_plan_name: paymentState.selectedPlan.name,
                          current_plan: paymentState.selectedPlan.name,
                          expiry_date: newExpiryDate.toISOString(),
                          account_balance: c.account_balance - finalPrice,
                          last_payment_date: new Date().toISOString(),
                          payment_method: paymentState.selectedPaymentMethod.name.toLowerCase().replace(' ', '_'),
                          status: 'active',
                      }
                    : c
            )
        );

        showMessage('success', `Switched to ${paymentState.selectedPlan.name} plan successfully!`);
        setSwitchModal(false);
        setPaymentSuccessModal(true);
    };

    const calculateTotalAmount = () => {
        if (!paymentState.selectedPlan || !paymentState.selectedDuration) return 0;

        const price = paymentState.selectedPlan.price;
        const duration = paymentState.selectedDuration.days;
        const discount = paymentState.selectedDuration.discount;

        return price * (duration / 30) * ((100 - discount) / 100);
    };

    const getFilteredData = () => {
        let filtered = customers;

        if (filterStatus === 'active') {
            filtered = filtered.filter((item) => item.status === 'active');
        } else if (filterStatus === 'expired') {
            filtered = filtered.filter((item) => item.status === 'expired');
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.user_id?.toLowerCase().includes(term) ||
                    item.first_name?.toLowerCase().includes(term) ||
                    item.last_name?.toLowerCase().includes(term) ||
                    item.email_addr?.toLowerCase().includes(term) ||
                    item.current_plan?.toLowerCase().includes(term)
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

    const getTotalCount = () => getFilteredData().length;

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getStats = () => {
        const totalCustomers = customers.length;
        const expiredCustomers = customers.filter((c) => c.status === 'expired').length;
        const totalDue = customers.filter((c) => c.account_balance < 0).reduce((sum, c) => sum + Math.abs(c.account_balance), 0);
        const totalCredit = customers.filter((c) => c.account_balance > 0).reduce((sum, c) => sum + c.account_balance, 0);

        return { totalCustomers, expiredCustomers, totalDue, totalCredit };
    };

    const { totalCustomers, expiredCustomers, totalDue, totalCredit } = getStats();

    return (
        <div>
            {/* Search and Filter Bar */}
         <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                {/* Search Icon */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none">
                    <IconSearch className="w-5 h-5" />
                </span>

                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-12 pr-4 py-3 w-full md:w-80 rounded-xl 
                               border-0 bg-gray-50 dark:bg-gray-700/50 
                               text-gray-800 dark:text-gray-200 
                               focus:ring-2 focus:ring-primary dark:focus:ring-primary-light 
                               focus:bg-white dark:focus:bg-gray-700"
                />
            </div>

            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select py-3 rounded-xl border-0 
                           bg-gray-50 dark:bg-gray-700/50 
                           text-gray-800 dark:text-gray-200 
                           focus:ring-2 focus:ring-primary dark:focus:ring-primary-light 
                           focus:bg-white dark:focus:bg-gray-700"
            >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
            </select>
        </div>
    </div>
</div>


            {/* Main Table */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Payment & Recharge Management'}
                    toggle={null}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    btnName=""
                    loadings={false}
                />
            </div>

            {/* Make Payment Modal */}
            {paymentModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setPaymentModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Make Payment</h3>
                                        <p className="text-white/80 mt-1">
                                            Pay outstanding amount for {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </p>
                                    </div>
                                    <button onClick={() => setPaymentModal(false)} className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl">
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Customer</p>
                                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Current Balance</p>
                                                <p className={`text-2xl font-bold ${selectedCustomer.account_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{selectedCustomer.account_balance.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Amount *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-500 text-xl">₹</span>
                                            <input
                                                type="number"
                                                value={paymentState.customAmount}
                                                onChange={(e) => setPaymentState({ ...paymentState, customAmount: e.target.value })}
                                                className="form-input pl-10 pr-4 py-3 w-full rounded-xl"
                                                placeholder="Enter amount"
                                                min="1"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {[50, 100, 200, 500, 1000].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setPaymentState({ ...paymentState, customAmount: amount.toString() })}
                                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                                >
                                                    ₹{amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Payment Method *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {paymentMethods.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentState({ ...paymentState, selectedPaymentMethod: method })}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                        paymentState.selectedPaymentMethod?.id === method.id
                                                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                                    }`}
                                                >
                                                    <div className="text-2xl mb-2">{method.icon}</div>
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{method.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{method.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional Options */}
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="savePayment"
                                                checked={paymentState.savePaymentMethod}
                                                onChange={(e) => setPaymentState({ ...paymentState, savePaymentMethod: e.target.checked })}
                                                className="form-checkbox rounded"
                                            />
                                            <label htmlFor="savePayment" className="ml-2 text-gray-700 dark:text-gray-300">
                                                Save payment method for future transactions
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="autoRenew"
                                                checked={paymentState.autoRenew}
                                                onChange={(e) => setPaymentState({ ...paymentState, autoRenew: e.target.checked })}
                                                className="form-checkbox rounded"
                                            />
                                            <label htmlFor="autoRenew" className="ml-2 text-gray-700 dark:text-gray-300">
                                                Enable auto-renewal for this customer
                                            </label>
                                        </div>
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={paymentState.agreeToTerms}
                                                onChange={(e) => setPaymentState({ ...paymentState, agreeToTerms: e.target.checked })}
                                                className="form-checkbox rounded mt-1"
                                                required
                                            />
                                            <label htmlFor="terms" className="ml-2 text-gray-700 dark:text-gray-300">
                                                I agree to the terms and conditions and authorize this payment
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Payment</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">₹{(parseFloat(paymentState.customAmount) || 0).toFixed(2)}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={() => setPaymentModal(false)} className="btn btn-outline-secondary">
                                        Cancel
                                    </button>
                                    <button onClick={handlePaymentSubmit} className="btn btn-primary" disabled={!paymentState.agreeToTerms || !paymentState.customAmount}>
                                        <IconCreditCard className="w-4 h-4 mr-2" />
                                        Process Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recharge Plan Modal */}
            {rechargeModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setRechargeModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Recharge Plan</h3>
                                        <p className="text-white/80 mt-1">
                                            Extend current plan for {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </p>
                                    </div>
                                    <button onClick={() => setRechargeModal(false)} className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl">
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Current Plan Info */}
                                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Current Plan</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{selectedCustomer.current_plan}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Plan Name</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{new Date(selectedCustomer.expiry_date).toLocaleDateString()}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Expiry Date</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-3xl font-bold ${selectedCustomer.status === 'expired' ? 'text-red-600' : 'text-green-600'}`}>
                                                    {selectedCustomer.status === 'expired' ? 'Expired' : 'Active'}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Duration *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {paymentDurations.map((duration) => (
                                                <button
                                                    key={duration.id}
                                                    onClick={() => setPaymentState({ ...paymentState, selectedDuration: duration })}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                                        paymentState.selectedDuration?.id === duration.id
                                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-green-500/50'
                                                    }`}
                                                >
                                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{duration.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{duration.days} days</div>
                                                    {duration.discount > 0 && (
                                                        <div className="mt-2">
                                                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                                                Save {duration.discount}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    {paymentState.selectedPlan && paymentState.selectedDuration && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                                            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Payment Summary</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Base Price</span>
                                                    <span className="font-medium">₹{paymentState.selectedPlan.price}.00</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Duration ({paymentState.selectedDuration.days} days)</span>
                                                    <span className="font-medium">× {(paymentState.selectedDuration.days / 30).toFixed(1)}</span>
                                                </div>
                                                {paymentState.selectedDuration.discount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Discount ({paymentState.selectedDuration.discount}%)</span>
                                                        <span>
                                                            -₹
                                                            {(paymentState.selectedPlan.price * (paymentState.selectedDuration.days / 30) * (paymentState.selectedDuration.discount / 100)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total Amount</span>
                                                        <span>₹{calculateTotalAmount().toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms Agreement */}
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="rechargeTerms"
                                            checked={paymentState.agreeToTerms}
                                            onChange={(e) => setPaymentState({ ...paymentState, agreeToTerms: e.target.checked })}
                                            className="form-checkbox rounded mt-1"
                                            required
                                        />
                                        <label htmlFor="rechargeTerms" className="ml-2 text-gray-700 dark:text-gray-300">
                                            I agree to recharge the plan and authorize payment of ₹{calculateTotalAmount().toFixed(2)}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">New Expiry Date</p>
                                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {(() => {
                                            const newDate = new Date();
                                            if (selectedCustomer.status === 'expired') {
                                                newDate.setDate(newDate.getDate() + (paymentState.selectedDuration?.days || 0));
                                            } else {
                                                const currentExpiry = new Date(selectedCustomer.expiry_date);
                                                newDate.setTime(currentExpiry.getTime() + (paymentState.selectedDuration?.days || 0) * 24 * 60 * 60 * 1000);
                                            }
                                            return newDate.toLocaleDateString();
                                        })()}
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={() => setRechargeModal(false)} className="btn btn-outline-secondary">
                                        Cancel
                                    </button>
                                    <button onClick={handleRechargeSubmit} className="btn btn-success" disabled={!paymentState.agreeToTerms || !paymentState.selectedDuration}>
                                        <IconRefresh className="w-4 h-4 mr-2" />
                                        Recharge Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Switch Plan Modal */}
            {switchModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setSwitchModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Switch Plan</h3>
                                        <p className="text-white/80 mt-1">
                                            Change plan for {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </p>
                                    </div>
                                    <button onClick={() => setSwitchModal(false)} className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl">
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Available Plans */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select New Plan *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {availablePlans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setPaymentState({ ...paymentState, selectedPlan: plan })}
                                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                                                        paymentState.selectedPlan?.id === plan.id
                                                            ? `border-${plan.color}-500 bg-${plan.color}-50 dark:bg-${plan.color}-900/20`
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-500/50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <IconWifi className={`w-6 h-6 text-${plan.color}-500`} />
                                                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{plan.name}</h4>
                                                                {plan.popular && (
                                                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                                                                        Most Popular
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                                                ₹{plan.price}
                                                                <span className="text-sm text-gray-500">/month</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                                        <div className="flex items-center space-x-2">
                                                            <IconZap className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{plan.speed}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <IconShield className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{plan.data_limit}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <IconUsers className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{plan.concurrent_users} users</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <IconClock className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{plan.duration} days</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <ul className="space-y-1">
                                                            {plan.features.map((feature, index) => (
                                                                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                                    <IconCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Duration *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {paymentDurations.map((duration) => (
                                                <button
                                                    key={duration.id}
                                                    onClick={() => setPaymentState({ ...paymentState, selectedDuration: duration })}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                                                        paymentState.selectedDuration?.id === duration.id
                                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-500/50'
                                                    }`}
                                                >
                                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">{duration.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{duration.days} days</div>
                                                    {duration.discount > 0 && (
                                                        <div className="mt-2">
                                                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                                                                Save {duration.discount}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    {paymentState.selectedPlan && paymentState.selectedDuration && (
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                                            <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">Payment Summary</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">{paymentState.selectedPlan.name} Plan</span>
                                                    <span className="font-medium">₹{paymentState.selectedPlan.price}.00</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Duration ({paymentState.selectedDuration.days} days)</span>
                                                    <span className="font-medium">× {(paymentState.selectedDuration.days / 30).toFixed(1)}</span>
                                                </div>
                                                {paymentState.selectedDuration.discount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Discount ({paymentState.selectedDuration.discount}%)</span>
                                                        <span>
                                                            -₹
                                                            {(paymentState.selectedPlan.price * (paymentState.selectedDuration.days / 30) * (paymentState.selectedDuration.discount / 100)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total Amount</span>
                                                        <span>₹{calculateTotalAmount().toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms Agreement */}
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="switchTerms"
                                            checked={paymentState.agreeToTerms}
                                            onChange={(e) => setPaymentState({ ...paymentState, agreeToTerms: e.target.checked })}
                                            className="form-checkbox rounded mt-1"
                                            required
                                        />
                                        <label htmlFor="switchTerms" className="ml-2 text-gray-700 dark:text-gray-300">
                                            I agree to switch to {paymentState.selectedPlan?.name || 'selected plan'} and authorize payment
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-6 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Current Plan</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{selectedCustomer.current_plan}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">New Plan</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{paymentState.selectedPlan?.name || 'Select a plan'}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={() => setSwitchModal(false)} className="btn btn-outline-secondary">
                                        Cancel
                                    </button>
                                    <button onClick={handleSwitchPlanSubmit} className="btn btn-primary" disabled={!paymentState.agreeToTerms || !paymentState.selectedPlan}>
                                        <IconZap className="w-4 h-4 mr-2" />
                                        Switch Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Success Modal */}
            {paymentSuccessModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setPaymentSuccessModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconCheckCircle className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                                <p className="text-white/80 mt-2">Your transaction has been processed successfully</p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Transaction ID</span>
                                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">TXN{Date.now().toString().slice(-8)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Date & Time</span>
                                        <span className="font-medium">{new Date().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-300">Payment Method</span>
                                        <span className="font-medium">{paymentState.selectedPaymentMethod?.name}</span>
                                    </div>
                                    {selectedCustomer && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300">Customer</span>
                                            <span className="font-medium">
                                                {selectedCustomer.first_name} {selectedCustomer.last_name}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total Amount</span>
                                            <span>₹{calculateTotalAmount().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex space-x-3">
                                    <button onClick={() => setPaymentSuccessModal(false)} className="btn btn-outline-secondary flex-1">
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPaymentSuccessModal(false);
                                            showMessage('info', 'Receipt sent to customer email');
                                        }}
                                        className="btn btn-primary flex-1"
                                    >
                                        Send Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;
