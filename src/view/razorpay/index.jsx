import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Alert,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputAdornment,
    CircularProgress,
    Paper,
    Divider,
    Snackbar,
    Avatar,
    Chip,
    IconButton,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Payment,
    Receipt,
    CheckCircle,
    Error as ErrorIcon,
    Security,
    FlashOn,
    Verified,
    CreditCard,
    AccountBalance,
    Lock,
    QrCode,
    Speed,
    CurrencyRupee,
    Smartphone,
    HelpOutline,
    ArrowBack,
    Refresh,
    Info,
    Cancel,
    Person,
    Email,
    Phone,
    LocationOn,
    CalendarMonth,
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    '&.MuiStepConnector-root': {
        top: 22,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    '& .MuiStepConnector-line': {
        height: 3,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
    '&.Mui-active .MuiStepConnector-line': {
        background: 'linear-gradient(90deg, #ff6b35 0%, #ffa500 100%)',
    },
    '&.Mui-completed .MuiStepConnector-line': {
        background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)',
    },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        background: 'linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, className, icon } = props;

    const icons = {
        1: <CreditCard />,
        2: <Lock />,
        3: <Verified />,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(icon)]}
        </ColorlibStepIconRoot>
    );
}

const LivePaymentTest = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Get userId from URL params
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [order, setOrder] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [timer, setTimer] = useState(300);
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({
        userId: '',
        amount: 0,
        paymentFor: 'internet_recharge',
        serviceType: 'bandwidth_plan',
        serviceId: '',
        description: '',
    });

    const LIVE_RAZORPAY_KEY = 'rzp_live_RzMWnfAqbigGAh';

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard />, color: '#2196F3' },
        { id: 'upi', name: 'UPI', icon: <QrCode />, color: '#9C27B0' },
        { id: 'netbanking', name: 'Net Banking', icon: <AccountBalance />, color: '#4CAF50' },
        { id: 'wallet', name: 'Wallet', icon: <Smartphone />, color: '#FF9800' },
    ];

    const steps = ['Payment Details', 'Security Check', 'Complete Payment'];

    useEffect(() => {
        checkBackendStatus();
        const statusInterval = setInterval(checkBackendStatus, 30000);

        const timerInterval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(timerInterval);
        };
    }, []);

    useEffect(() => {
        // Fetch user data when userId from URL changes
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    const fetchUserData = async (id) => {
        try {
            setUserLoading(true);
            setError(null);

            const response = await axios.get(`http://localhost:5043/hs5200/user/plan-details?userId=${id}`);

            if (response.data && response.data.data && response.data.data.success) {
                const userDetails = response.data.data.results;
                setUserData(userDetails);

                // Update payment data with dynamic values from API
                setPaymentData({
                    userId: userDetails.user_id,
                    amount: parseFloat(userDetails.total_price) || 1,
                    paymentFor: 'internet_recharge',
                    serviceType: 'bandwidth_plan',
                    serviceId: userDetails.post_code || `PLAN_${userDetails.user_id}`,
                    description: `Live payment for ${userDetails.plan_name} - SKISP Internet Services`,
                });
            } else {
                throw new Error(response.data?.data?.message || 'Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);

            let errorMessage = 'Failed to load user details. ';
            if (error.response?.status === 404) {
                errorMessage = `User with ID "${userId}" not found.`;
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
            }

            setError(errorMessage);
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error',
            });

            // Set default values for testing if API fails
            setPaymentData({
                userId: id,
                amount: 1,
                paymentFor: 'internet_recharge',
                serviceType: 'bandwidth_plan',
                serviceId: `PLAN_${id}`,
                description: 'Live payment for SKISP Internet Services',
            });
        } finally {
            setUserLoading(false);
        }
    };

    const checkBackendStatus = async () => {
        try {
            const response = await axios.get('http://localhost:5043/payments/health', { timeout: 5000 });
            setBackendStatus(response.data);
        } catch (error) {
            setBackendStatus({
                status: 'error',
                message: 'Backend not responding',
            });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => {
                setError('Failed to load Razorpay SDK');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const createOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            setOrder(null);
            setPaymentResult(null);
            setActiveStep(1);

            const response = await axios.post(
                'http://localhost:5043/payments/create-order',
                {
                    ...paymentData,
                    environment: 'live',
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            if (response.data && response.data.data) {
                const orderData = response.data.data;
                if (!orderData.order_id) {
                    throw new Error('Order ID not found in response data');
                }
                setOrder(orderData);
                return orderData;
            } else {
                throw new Error(response.data?.message || 'Invalid response structure');
            }
        } catch (error) {
            console.error('Error creating live order:', error);
            let errorMsg = 'Failed to create payment order';
            if (error.response) {
                if (error.response.data?.error?.description) {
                    errorMsg = error.response.data.error.description;
                } else if (error.response.data?.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.request) {
                errorMsg = 'No response from server. Check if backend is running.';
            }
            setError(errorMsg);
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const openRazorpayCheckout = async (orderData) => {
        try {
            const loaded = await loadRazorpay();
            if (!loaded) {
                setError('Razorpay SDK failed to load');
                return;
            }

            if (!LIVE_RAZORPAY_KEY || !LIVE_RAZORPAY_KEY.startsWith('rzp_live_')) {
                const msg = 'Invalid live Razorpay key configuration';
                setError(msg);
                setSnackbar({ open: true, message: msg, severity: 'error' });
                return;
            }

            if (!orderData.order_id) {
                setError('Order ID is missing from order data');
                setSnackbar({ open: true, message: 'Order ID not found.', severity: 'error' });
                return;
            }

            const options = {
                key: LIVE_RAZORPAY_KEY,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'SKISP Internet Services',
                description: paymentData.description,
                order_id: orderData.order_id,
                handler: async (response) => {
                    console.log('Live payment response:', response);
                    await verifyPayment(response);
                },
                prefill: {
                    name: userData?.f_name ? userData.f_name : 'Customer',
                    email: userData?.email ? userData.email : 'customer@skisp.com',
                    contact: paymentData.userId,
                },
                notes: {
                    userId: paymentData.userId,
                    paymentFor: paymentData.paymentFor,
                    environment: 'live',
                    planName: userData?.plan_name || 'Internet Plan',
                },
                theme: {
                    color: '#ff6b35',
                },
                modal: {
                    ondismiss: () => {
                        setSnackbar({
                            open: true,
                            message: 'Payment was cancelled.',
                            severity: 'warning',
                        });
                    },
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', (response) => {
                console.error('Live payment failed:', response.error);
                const errorMsg = `Payment failed: ${response.error.description || response.error.reason}`;
                setError(errorMsg);
                setSnackbar({ open: true, message: errorMsg, severity: 'error' });
            });

            rzp.open();
        } catch (error) {
            console.error('Error opening live Razorpay:', error);
            const errorMsg = 'Failed to open payment gateway: ' + error.message;
            setError(errorMsg);
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        }
    };

    const verifyPayment = async (paymentResponse) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                environment: 'live',
            };

            const response = await axios.post('http://localhost:5043/payments/verify', payload, { headers: { 'Content-Type': 'application/json' } });

            if (response.data && response.data.success) {
                setSuccess(true);
                setPaymentResult(response.data.data);
                setActiveStep(2);
                setSnackbar({
                    open: true,
                    message: '✅ Payment successful and verified!',
                    severity: 'success',
                });
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Live payment verification error:', error);
            const errorMsg = 'Payment verification failed: ' + (error.response?.data?.message || error.message);
            setError(errorMsg);
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLivePayment = async () => {
        const confirmed = window.confirm(
            '⚠️ LIVE PAYMENT WARNING!\n\n' +
                'You are about to make a REAL payment.\n' +
                `Amount: ₹${paymentData.amount}\n\n` +
                '• Real money will be charged\n' +
                '• Use real credit/debit cards only\n' +
                '• Test cards will NOT work\n\n' +
                'Are you sure you want to proceed?',
        );

        if (!confirmed) {
            setSnackbar({ open: true, message: 'Payment cancelled', severity: 'info' });
            return;
        }

        try {
            const orderData = await createOrder();
            if (orderData) {
                await openRazorpayCheckout(orderData);
            }
        } catch (error) {
            console.log('Live payment flow error:', error);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (userLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: '#ff6b35',
                            mb: 3,
                        }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Loading User Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Fetching details for user: {userId}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, position: 'relative' }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/test-payment')}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#666',
                        }}
                    >
                        Back
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
                            <Avatar sx={{ bgcolor: '#ff6b35', width: 40, height: 40 }}>
                                <Payment />
                            </Avatar>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #ff6b35 0%, #ffa500 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Live Payment Gateway
                            </Typography>
                        </Box>
                        <Typography variant="subtitle1" color="text.secondary">
                            User ID: {userId} • Secure Payment Processing
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column - Payment Details */}
                    <Grid item xs={12} lg={8}>
                        <Paper
                            sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            {/* Status Bar */}
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: '#fff',
                                    borderBottom: '1px solid #e0e0e0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip label="LIVE MODE" color="error" size="small" icon={<FlashOn fontSize="small" />} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: backendStatus?.status === 'ok' ? '#4CAF50' : '#f44336',
                                                animation: 'pulse 2s infinite',
                                            }}
                                        />
                                        <Typography variant="caption">{backendStatus?.status === 'ok' ? 'Connected' : 'Disconnected'}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Session expires in:
                                    </Typography>
                                    <Chip
                                        label={formatTime(timer)}
                                        size="small"
                                        sx={{
                                            bgcolor: timer < 60 ? '#ffebee' : '#e8f5e9',
                                            color: timer < 60 ? '#d32f2f' : '#2e7d32',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Content */}
                            <Box sx={{ p: 3 }}>
                                {/* Progress Stepper */}
                                <Stepper activeStep={activeStep} alternativeLabel connector={<ColorlibConnector />} sx={{ mb: 4 }}>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel StepIconComponent={ColorlibStepIcon}>
                                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>

                                {/* User Info Display */}
                                {userData && (
                                    <Fade in={true}>
                                        <Paper
                                            sx={{
                                                p: 3,
                                                mb: 3,
                                                bgcolor: '#f8f9fa',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Person sx={{ color: '#ff6b35' }} />
                                                Customer Information
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Full Name:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {userData.f_name || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Email sx={{ fontSize: 16, color: '#666' }} />
                                                        <Typography variant="body2">{userData.email || 'N/A'}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            User ID:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600} color="#ff6b35">
                                                            {userData.user_id}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <CalendarMonth sx={{ fontSize: 16, color: '#666' }} />
                                                        <Typography variant="body2">Plan valid until: {formatDate(userData.validity_end_ts)}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                                                        <Typography variant="body2">Address: {userData.address || 'N/A'}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Current Plan
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={600}>
                                                                {userData.plan_name}
                                                            </Typography>
                                                        </Box>
                                                        <Chip label={userData.account_state?.toUpperCase() || 'N/A'} color={userData.account_state === 'active' ? 'success' : 'warning'} size="small" />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Fade>
                                )}

                                {/* Payment Form */}
                                {activeStep === 0 && (
                                    <Fade in={true}>
                                        <Box>
                                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                                                <CurrencyRupee sx={{ mr: 1, color: '#ff6b35' }} />
                                                Payment Details
                                            </Typography>

                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="User ID"
                                                        value={paymentData.userId}
                                                        size="medium"
                                                        sx={{ mb: 2 }}
                                                        disabled
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Person sx={{ color: '#ff6b35' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <TextField fullWidth label="Service Type" value="Internet Recharge" size="medium" sx={{ mb: 2 }} disabled />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Amount"
                                                        type="number"
                                                        value={paymentData.amount}
                                                        onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <CurrencyRupee sx={{ color: '#ff6b35' }} />
                                                                </InputAdornment>
                                                            ),
                                                            inputProps: { min: 1, step: 0.01 },
                                                        }}
                                                        size="medium"
                                                        sx={{ mb: 2 }}
                                                        helperText="Amount based on your current plan"
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Description"
                                                        value={paymentData.description}
                                                        onChange={(e) => setPaymentData((prev) => ({ ...prev, description: e.target.value }))}
                                                        size="medium"
                                                        multiline
                                                        rows={3}
                                                        sx={{ mb: 3 }}
                                                    />
                                                </Grid>
                                            </Grid>

                                            {/* Payment Methods */}
                                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
                                                Select Payment Method
                                            </Typography>

                                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                                {paymentMethods.map((method) => (
                                                    <Grid item xs={6} sm={3} key={method.id}>
                                                        <Card
                                                            onClick={() => setPaymentMethod(method.id)}
                                                            sx={{
                                                                p: 2,
                                                                cursor: 'pointer',
                                                                border: paymentMethod === method.id ? '2px solid #ff6b35' : '1px solid #e0e0e0',
                                                                borderRadius: 2,
                                                                transition: 'all 0.3s',
                                                                bgcolor: paymentMethod === method.id ? '#fff5f2' : '#fff',
                                                                '&:hover': {
                                                                    borderColor: '#ff6b35',
                                                                    transform: 'translateY(-2px)',
                                                                },
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <Avatar sx={{ bgcolor: method.color, width: 40, height: 40 }}>{method.icon}</Avatar>
                                                                <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 500 }}>
                                                                    {method.name}
                                                                </Typography>
                                                            </Box>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            {/* Action Button */}
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={handleLivePayment}
                                                    disabled={loading || paymentData.amount < 1}
                                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                                                    sx={{
                                                        px: 6,
                                                        py: 1.5,
                                                        background: 'linear-gradient(90deg, #ff6b35 0%, #ffa500 100%)',
                                                        borderRadius: 2,
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(90deg, #ff5722 0%, #ff8a00 100%)',
                                                            boxShadow: '0 6px 25px rgba(255, 107, 53, 0.4)',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                        '&:disabled': {
                                                            background: '#ccc',
                                                        },
                                                    }}
                                                >
                                                    {loading ? 'Processing...' : `Pay ₹${paymentData.amount} Now`}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Fade>
                                )}

                                {/* Processing Step */}
                                {activeStep === 1 && (
                                    <Fade in={true}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <CircularProgress
                                                size={80}
                                                thickness={4}
                                                sx={{
                                                    color: '#ff6b35',
                                                    mb: 3,
                                                }}
                                            />
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Processing Your Payment
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                Please wait while we securely process your transaction.
                                                <br />
                                                Do not close this window or refresh the page.
                                            </Typography>
                                            <LinearProgress
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: '#f0f0f0',
                                                    '& .MuiLinearProgress-bar': {
                                                        background: 'linear-gradient(90deg, #ff6b35 0%, #ffa500 100%)',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* Success Step */}
                                {activeStep === 2 && success && (
                                    <Zoom in={true}>
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: '#4CAF50',
                                                    width: 80,
                                                    height: 80,
                                                    mx: 'auto',
                                                    mb: 3,
                                                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                                                }}
                                            >
                                                <CheckCircle sx={{ fontSize: 48 }} />
                                            </Avatar>

                                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#2e7d32' }}>
                                                Payment Successful! 🎉
                                            </Typography>

                                            <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                                                Your payment of ₹{paymentData.amount} has been processed successfully.
                                            </Typography>

                                            <Card
                                                sx={{
                                                    maxWidth: 400,
                                                    mx: 'auto',
                                                    mb: 4,
                                                    border: '1px solid #e0e0e0',
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                                        Transaction Details
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            '& > div': {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                py: 1,
                                                                borderBottom: '1px solid #f5f5f5',
                                                            },
                                                        }}
                                                    >
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                User ID:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {paymentData.userId}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Amount:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                ₹{paymentData.amount}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Transaction ID:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {paymentResult?.payment_id || 'N/A'}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Plan:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {userData?.plan_name || 'N/A'}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Status:
                                                            </Typography>
                                                            <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 500 }} />
                                                        </div>
                                                        <div>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Time:
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {new Date().toLocaleTimeString()}
                                                            </Typography>
                                                        </div>
                                                    </Box>
                                                </CardContent>
                                            </Card>

                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Receipt />}
                                                    onClick={() => {
                                                        // Handle receipt download
                                                        const receiptData = {
                                                            userId: paymentData.userId,
                                                            amount: paymentData.amount,
                                                            transactionId: paymentResult?.payment_id,
                                                            planName: userData?.plan_name,
                                                            date: new Date().toLocaleString(),
                                                        };
                                                        console.log('Download receipt:', receiptData);
                                                        setSnackbar({
                                                            open: true,
                                                            message: 'Receipt download started',
                                                            severity: 'info',
                                                        });
                                                    }}
                                                >
                                                    Download Receipt
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Refresh />}
                                                    onClick={() => {
                                                        setActiveStep(0);
                                                        setSuccess(false);
                                                        setPaymentResult(null);
                                                    }}
                                                    sx={{
                                                        bgcolor: '#ff6b35',
                                                        '&:hover': { bgcolor: '#ff5722' },
                                                    }}
                                                >
                                                    Make Another Payment
                                                </Button>
                                                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/test-payment')}>
                                                    Back to Dashboard
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Zoom>
                                )}

                                {/* Error State */}
                                {error && (
                                    <Fade in={true}>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mt: 3,
                                                borderRadius: 2,
                                                border: '1px solid #ffcdd2',
                                            }}
                                            action={
                                                <IconButton size="small" onClick={() => setError(null)}>
                                                    <Cancel fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <Typography variant="body2" fontWeight={500}>
                                                {error}
                                            </Typography>
                                        </Alert>
                                    </Fade>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Summary & Info */}
                    <Grid item xs={12} lg={4}>
                        {/* Order Summary */}
                        <Paper
                            sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                                Order Summary
                            </Typography>

                            {userData ? (
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Plan Name:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {userData.plan_name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Base Price:
                                        </Typography>
                                        <Typography variant="body1">₹{userData.base_price || '0.00'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Tax (GST):
                                        </Typography>
                                        <Typography variant="body1">₹{userData.tax_price || '0.00'}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Total Amount:
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} color="#ff6b35">
                                            ₹{userData.total_price || '0.00'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        Billing Cycle: {userData.bill_cycle || 'Monthly'}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Total Amount:
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} color="#ff6b35">
                                        ₹{paymentData.amount}
                                    </Typography>
                                </Box>
                            )}

                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: '#fff8e1',
                                    borderRadius: 2,
                                    border: '1px solid #ffecb3',
                                    mt: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Info sx={{ color: '#ff8f00', fontSize: 20 }} />
                                    <Typography variant="caption" fontWeight={600} color="#ff8f00">
                                        Payment Instructions
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="#5d4037">
                                    • This is a LIVE payment transaction
                                    <br />• Real money will be deducted from your account
                                    <br />• Keep your transaction ID for future reference
                                    <br />• Service activation may take 5-10 minutes
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Security Features */}
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                                <Security sx={{ mr: 1, color: '#4CAF50' }} />
                                Security Features
                            </Typography>

                            <Box sx={{ '& > div': { mb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#e3f2fd', width: 40, height: 40 }}>
                                        <Lock sx={{ color: '#2196F3' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            256-bit SSL Encryption
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Bank-level security
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#e8f5e9', width: 40, height: 40 }}>
                                        <Verified sx={{ color: '#4CAF50' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            PCI DSS Compliant
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Certified secure payments
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#fff3e0', width: 40, height: 40 }}>
                                        <Speed sx={{ color: '#FF9800' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            Real-time Processing
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Instant verification
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    mt: 2,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Powered by
                                </Typography>
                                <Avatar src="https://razorpay.com/assets/razorpay-glyph.svg" sx={{ width: 24, height: 24 }} />
                                <Typography variant="caption" fontWeight={600}>
                                    Razorpay
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Support Card */}
                        <Paper
                            sx={{
                                p: 2,
                                mt: 3,
                                borderRadius: 2,
                                bgcolor: '#f5f7fa',
                                border: '1px solid #e0e0e0',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#ff6b35' }}>
                                    <HelpOutline />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        Need Help?
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Contact: support@skisp.com
                                        <br />
                                        Phone: +91-1234567890
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        © {new Date().getFullYear()} SKISP Internet Services. All rights reserved.
                        <br />
                        All transactions are secured by Razorpay. User ID: {userId}
                    </Typography>
                </Box>

                {/* Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* Add global styles */}
                <style jsx global>{`
                    @keyframes pulse {
                        0%,
                        100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }

                    @keyframes slideIn {
                        from {
                            transform: translateY(20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}</style>
            </Container>
        </Box>
    );
};

export default LivePaymentTest;
