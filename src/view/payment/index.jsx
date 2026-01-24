import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import IconWifi from '../../components/Icon/IconWifi';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconAlertCircle from '../../components/Icon/IconAlertCircle';
import IconUsers from '../../components/Icon/IconUsers';
import IconSearch from '../../components/Icon/IconSearch';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import moment from 'moment';
import { getReport } from '../../redux/reportSlice';
import { getRecharge, createRecharge, resetRechargeStatus, clearPlanDetails } from '../../redux/rechargeSlice';

const getSettingId = () => {
    const loginInfoStr = localStorage.getItem('loginInfo');
    if (!loginInfoStr) {
        return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    }
    try {
        const loginInfo = JSON.parse(loginInfoStr);
        return loginInfo?.settingId || '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    } catch (error) {
        return '25c1c6c1-3ea7-439c-bf0b-b03e42f21a5d';
    }
};

const Index = () => {
    const dispatch = useDispatch();
    const { reportData, loading: reportLoading } = useSelector((state) => state.ReportSlice);
    const {
        planDetails,
        loading: rechargeLoading,
        createRechargeSuccess,
        createRechargeFailed,
        error: rechargeError,
        getRechargeSuccess,
        getRechargeFailed,
    } = useSelector((state) => state.RechargeSlice);

    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [rechargeModal, setRechargeModal] = useState(false);
    const [paymentSuccessModal, setPaymentSuccessModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);
    const [processingRecharge, setProcessingRecharge] = useState(false);
    const [localPlanDetails, setLocalPlanDetails] = useState(null);
    const [successPlanName, setSuccessPlanName] = useState('');

    const [paymentState, setPaymentState] = useState({
        customAmount: '',
        agreeToTerms: false,
    });

    useEffect(() => {
        dispatch(setPageTitle('Payment & Recharge Management'));

        const filters = {
            settingId: getSettingId(),
            daysThreshold: 50000,
            accountState: '',
            page: 1,
            limit: 50000,
            search: '',
            planName: '',
            userId: '',
        };
        dispatch(getReport(filters));
    }, [dispatch]);

    const handleCloseModal = () => {
        setRechargeModal(false);
        setSelectedCustomer(null);
        setLocalPlanDetails(null);
        setPaymentState({
            customAmount: '',
            agreeToTerms: false,
        });
        setLoadingPlanDetails(false);
        setProcessingRecharge(false);
        dispatch(resetRechargeStatus());
        dispatch(clearPlanDetails());
    };

    useEffect(() => {
        if (createRechargeSuccess) {
            showMessage('success', 'Recharge processed successfully!');
            setProcessingRecharge(false);
            setRechargeModal(false);
            setPaymentSuccessModal(true);
            setSuccessPlanName(localPlanDetails?.plan_name || '');

            const filters = {
                settingId: getSettingId(),
                daysThreshold: 30,
                accountState: '',
                page: 1,
                limit: 500,
                search: '',
                planName: '',
                userId: '',
            };
            dispatch(getReport(filters));

            setTimeout(() => {
                dispatch(resetRechargeStatus());
            }, 1000);
        }

        if (createRechargeFailed && rechargeError) {
            showMessage('error', rechargeError || 'Failed to process recharge');
            setProcessingRecharge(false);
        }
    }, [createRechargeSuccess, createRechargeFailed, rechargeError, dispatch, localPlanDetails]);

    const transformApiData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map((item, index) => {
            const userDetails = item.user_details || {};
            const daysRemaining = item.days_remaining || 0;

            let displayStatus = 'active';
            if (daysRemaining < 0) {
                displayStatus = 'expired';
            } else if (daysRemaining <= 30) {
                displayStatus = 'expiring_soon';
            } else {
                displayStatus = 'active';
            }

            return {
                id: item.mapping_id || `customer-${index}`,
                user_id: item.user_id,
                first_name: userDetails.first_name || '',
                last_name: userDetails.last_name || '',
                email_addr: userDetails.email || '',
                mobile_num: userDetails.mobile || '',
                pri_bandwidth_plan_name: userDetails.plan_name || '',
                current_plan: userDetails.plan_name || '',
                expiry_date: item.expiry_date || '',
                status: displayStatus,
                account_balance: 0,
                last_payment_date: null,
                payment_method: 'credit_card',
                isActive: userDetails.account_state === 'Active' ? 1 : 0,
                mapping_id: item.mapping_id,
                originalData: item,
                days_remaining: daysRemaining,
            };
        });
    };

    useEffect(() => {
        if (reportData?.data?.items) {
            const transformedCustomers = transformApiData(reportData.data.items);
            setCustomers(transformedCustomers);
        }
    }, [reportData]);

    const columns = [
        {
            Header: 'Customer',
            accessor: 'customer',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {row.original.first_name?.[0] || 'C'}
                        {row.original.last_name?.[0] || ''}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{`${row.original.first_name || ''} ${row.original.last_name || ''}`.trim() || 'Unknown Customer'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {row.original.user_id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.mobile_num || 'No phone'}</div>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Current Plan',
            accessor: 'current_plan',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <IconWifi className="w-5 h-5 text-blue-500" />
                    <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{row.original.pri_bandwidth_plan_name || 'No Plan'}</span>
                        {row.original.originalData?.user_details?.price && <div className="text-xs text-gray-500">₹{parseFloat(row.original.originalData.user_details.price).toFixed(2)}/month</div>}
                    </div>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Expiry Status',
            accessor: 'expiry_status',
            Cell: ({ row }) => {
                const daysRemaining = row.original.days_remaining || 0;

                if (daysRemaining < 0) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconAlertCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium text-red-600">Expired</span>
                            </div>
                            <div className="text-xs text-red-500">{Math.abs(daysRemaining)} days ago</div>
                        </div>
                    );
                } else if (daysRemaining <= 30) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconAlertCircle className="w-5 h-5 text-yellow-500" />
                                <span className="font-medium text-yellow-600">Expiring Soon</span>
                            </div>
                            <div className="text-xs text-yellow-600">{daysRemaining} days left</div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <IconCheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-green-600">Active</span>
                            </div>
                            <div className="text-xs text-green-600">{daysRemaining} days left</div>
                        </div>
                    );
                }
            },
            sort: true,
        },
        {
            Header: 'Account State',
            accessor: 'account_state',
            Cell: ({ row }) => {
                const accountState = row.original.originalData?.user_details?.account_state || 'Unknown';
                const isActive = accountState === 'Active';
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{accountState}</span>;
            },
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const customer = row.original;
                const accountState = customer.originalData?.user_details?.account_state || 'Unknown';
                const isActive = accountState === 'Active';

                return (
                    <div className="flex items-center space-x-2">
                        <Tippy content="Recharge/Extend Plan">
                            <button
                                onClick={() => handleRechargePlan(customer)}
                                className="btn btn-sm btn-success hover:scale-105 transition-transform duration-200"
                                disabled={!isActive || loadingPlanDetails}
                            >
                                {loadingPlanDetails && selectedCustomer?.user_id === customer.user_id ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <IconRefresh className="w-4 h-4 mr-1" />
                                        Recharge
                                    </>
                                )}
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 200,
        },
    ];

    const fetchPlanDetails = async (userId) => {
        try {
            setLoadingPlanDetails(true);
            const request = {
                userId: userId,
                settingId: getSettingId(),
            };

            const result = await dispatch(getRecharge(request)).unwrap();

            if (result?.data?.results) {
                const apiPlanDetails = result.data.results;

                const mappedPlanDetails = {
                    ...apiPlanDetails,
                    first_name: apiPlanDetails.f_name || '',
                    last_name: apiPlanDetails.l_name || '',
                    mobile: apiPlanDetails.mobile || '',
                    email: apiPlanDetails.email || '',
                    address: apiPlanDetails.address || '',
                    plan_name: apiPlanDetails.plan_name || '',
                    plan_price: apiPlanDetails.plan_price || '0',
                    base_price: apiPlanDetails.base_price || '0',
                    tax_price: apiPlanDetails.tax_price || '0',
                    payment_type: apiPlanDetails.payment_type || '',
                    account_state: apiPlanDetails.account_state || '',
                    num_days_txt: apiPlanDetails.num_days_txt || 30,
                    post_ok: apiPlanDetails.post_ok || '',
                    post_code: apiPlanDetails.post_code || '',
                };

                setLocalPlanDetails(mappedPlanDetails);
                return mappedPlanDetails;
            } else {
                throw new Error('No plan details found in response');
            }
        } catch (error) {
            showMessage('error', 'Failed to fetch plan details');
            setLoadingPlanDetails(false);
            return null;
        }
    };

    const handleRechargePlan = async (customer) => {
        try {
            setSelectedCustomer(customer);

            setPaymentState({
                customAmount: '',
                agreeToTerms: false,
            });

            setLocalPlanDetails(null);

            const planDetails = await fetchPlanDetails(customer.user_id);

            if (!planDetails) {
                showMessage('error', 'Could not fetch plan details');
                setLoadingPlanDetails(false);
                return;
            }

            if (planDetails.post_ok !== 'ok') {
                showMessage('error', 'Account is not enabled for recharge.');
                setLoadingPlanDetails(false);
                return;
            }

            if (planDetails.post_code == '') {
                showMessage('error', 'Plan activation code is missing.');
                setLoadingPlanDetails(false);
                return;
            }

            const totalAmount = parseFloat(planDetails.plan_price) || 0;
            setPaymentState({
                customAmount: totalAmount.toFixed(2),
                agreeToTerms: false,
            });

            setRechargeModal(true);
            setLoadingPlanDetails(false);
        } catch (error) {
            showMessage('error', 'Failed to load recharge details');
            setLoadingPlanDetails(false);
        }
    };

    const handleRechargeSubmit = async () => {
        if (!selectedCustomer || !paymentState.customAmount) {
            showMessage('error', 'Please enter a valid amount');
            return;
        }

        if (!paymentState.agreeToTerms) {
            showMessage('error', 'Please agree to the terms and conditions');
            return;
        }

        try {
            setProcessingRecharge(true);

            const rechargeRequest = {
                settingId: getSettingId(),
                userId: selectedCustomer.user_id,
                totalAmount: paymentState.customAmount,
                renewType: 'normal',
                orderId: `ORDER-${Date.now()}`,
                mappingId: selectedCustomer.mapping_id,
                ...(localPlanDetails?.post_code && { postCode: localPlanDetails.post_code }),
            };

            await dispatch(createRecharge(rechargeRequest)).unwrap();
        } catch (error) {
            showMessage('error', error.message || 'Failed to process recharge');
            setProcessingRecharge(false);
        }
    };

    const getFilteredData = () => {
        let filtered = customers;

        if (filterStatus === 'active') {
            filtered = filtered.filter((item) => item.status === 'active');
        } else if (filterStatus === 'expired') {
            filtered = filtered.filter((item) => item.status === 'expired');
        } else if (filterStatus === 'expiring_soon') {
            filtered = filtered.filter((item) => item.status === 'expiring_soon');
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.user_id?.toLowerCase().includes(term) ||
                    item.first_name?.toLowerCase().includes(term) ||
                    item.last_name?.toLowerCase().includes(term) ||
                    item.email_addr?.toLowerCase().includes(term) ||
                    item.mobile_num?.includes(term) ||
                    item.current_plan?.toLowerCase().includes(term),
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
        const filteredData = getFilteredData();
        const totalCustomers = filteredData.length;
        const expiredCustomers = filteredData.filter((c) => c.status === 'expired').length;
        const expiringSoonCustomers = filteredData.filter((c) => c.status === 'expiring_soon').length;
        const activeCustomers = filteredData.filter((c) => c.status === 'active').length;

        return { totalCustomers, expiredCustomers, expiringSoonCustomers, activeCustomers };
    };

    const { totalCustomers, expiredCustomers, expiringSoonCustomers, activeCustomers } = getStats();

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Customers</p>
                            <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
                        </div>
                        <IconUsers className="w-10 h-10 opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Active</p>
                            <p className="text-3xl font-bold mt-2">{activeCustomers}</p>
                        </div>
                        <IconCheckCircle className="w-10 h-10 opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Expiring Soon</p>
                            <p className="text-3xl font-bold mt-2">{expiringSoonCustomers}</p>
                        </div>
                        <IconAlertCircle className="w-10 h-10 opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Expired</p>
                            <p className="text-3xl font-bold mt-2">{expiredCustomers}</p>
                        </div>
                        <IconAlertCircle className="w-10 h-10 opacity-80" />
                    </div>
                </div>
            </div>

            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none">
                                <IconSearch className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-12 pr-10 py-3 w-full md:w-80 rounded-xl"
                            />

                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500" title="Clear search">
                                    ✕
                                </button>
                            )}
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
                            <option value="expiring_soon">Expiring Soon</option>
                            <option value="expired">Expired Only</option>
                        </select>

                        {(searchTerm || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setCurrentPage(0);
                                }}
                                className="btn btn-outline-danger px-4 py-3 rounded-xl"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="datatables">
                {reportLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading customer data...</p>
                    </div>
                ) : (
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
                )}
            </div>

            {rechargeModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCloseModal}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Recharge Plan</h3>
                                        <p className="text-white/80 mt-1">
                                            Extend current plan for {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </p>
                                        <p className="text-white/60 text-sm">Customer ID: {selectedCustomer.user_id}</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl" disabled={processingRecharge}>
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {loadingPlanDetails ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                        <p className="mt-4 text-gray-600">Loading plan details...</p>
                                    </div>
                                ) : localPlanDetails ? (
                                    <div className="space-y-6">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                                            <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Current Plan Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{localPlanDetails.plan_name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Plan Name</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">₹{localPlanDetails.plan_price}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly Price</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{localPlanDetails.num_days_txt || 30} days</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Validity</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Payment Type</p>
                                                    <p className="font-medium">{localPlanDetails.payment_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Account State</p>
                                                    <p className={`font-medium ${localPlanDetails.account_state === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{localPlanDetails.account_state}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Base Price</p>
                                                    <p className="font-medium">₹{localPlanDetails.pre_tax_price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Tax</p>
                                                    <p className="font-medium">₹{localPlanDetails.tax_price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Price</p>
                                                    <p className="font-medium">₹{localPlanDetails.base_price}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
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
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="rechargeTerms"
                                                checked={paymentState.agreeToTerms}
                                                onChange={(e) => setPaymentState({ ...paymentState, agreeToTerms: e.target.checked })}
                                                className="form-checkbox rounded mt-1"
                                            />
                                            <label htmlFor="rechargeTerms" className="ml-2 text-gray-700 dark:text-gray-300">
                                                I agree to recharge the plan and authorize payment of ₹{parseFloat(paymentState.customAmount).toFixed(2)}
                                            </label>
                                        </div>

                                        {rechargeError && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                                <p className="text-red-600 dark:text-red-400 text-sm">{rechargeError}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full">
                                            <IconAlertCircle className="w-8 h-8 text-red-500" />
                                        </div>
                                        <p className="text-gray-600">Unable to load plan details. Please try again.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount to Pay</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">₹{parseFloat(paymentState.customAmount).toFixed(2)}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={handleCloseModal} className="btn btn-outline-secondary" disabled={processingRecharge}>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRechargeSubmit}
                                        className="btn btn-success relative overflow-hidden"
                                        disabled={!paymentState.agreeToTerms || processingRecharge || !paymentState.customAmount}
                                    >
                                        {processingRecharge ? (
                                            <>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                </div>
                                                <span className="opacity-0">Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IconRefresh className="w-4 h-4 mr-2" />
                                                Recharge Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {paymentSuccessModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setPaymentSuccessModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <IconCheckCircle className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white animate-slide-up">Recharge Successful!</h3>
                                <p className="text-white/80 mt-2 animate-slide-up delay-100">Plan recharge has been processed successfully</p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center animate-slide-up delay-150">
                                        <span className="text-gray-600 dark:text-gray-300">Customer</span>
                                        <span className="font-medium">
                                            {selectedCustomer?.first_name} {selectedCustomer?.last_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center animate-slide-up delay-200">
                                        <span className="text-gray-600 dark:text-gray-300">Customer ID</span>
                                        <span className="font-medium">{selectedCustomer?.user_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center animate-slide-up delay-250">
                                        <span className="text-gray-600 dark:text-gray-300">Plan Name</span>
                                        <span className="font-medium">{successPlanName}</span>
                                    </div>
                                    <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4 animate-slide-up delay-300">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Amount Paid</span>
                                            <span>₹{parseFloat(paymentState.customAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 animate-slide-up delay-350">
                                    <button
                                        onClick={() => {
                                            setPaymentSuccessModal(false);
                                            handleCloseModal();
                                        }}
                                        className="btn btn-primary w-full transform transition-transform hover:scale-105"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slide-up {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes bounce {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(10px);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.4s ease-out forwards;
                    opacity: 0;
                }

                .animate-bounce {
                    animation: bounce 1s infinite;
                }

                .delay-100 {
                    animation-delay: 0.1s;
                }

                .delay-150 {
                    animation-delay: 0.15s;
                }

                .delay-200 {
                    animation-delay: 0.2s;
                }

                .delay-250 {
                    animation-delay: 0.25s;
                }

                .delay-300 {
                    animation-delay: 0.3s;
                }

                .delay-350 {
                    animation-delay: 0.35s;
                }
            `}</style>
        </div>
    );
};

export default Index;
