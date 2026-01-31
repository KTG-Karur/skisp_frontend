import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../../api/ApiConfig';

// Import your custom icons
import IconPayment from '../../components/Icon/IconRupee';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconError from '../../components/Icon/IconXCircle';
import IconSecurity from '../../components/Icon/IconShield';
import IconFlash from '../../components/Icon/IconSpeed';
import IconVerified from '../../components/Icon/IconCheck';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconBank from '../../components/Icon/IconBuilding';
import IconLock from '../../components/Icon/IconLock';
import IconQrCode from '../../components/Icon/IconSquareCheck';
import IconSpeed from '../../components/Icon/IconZap';
import IconRupee from '../../components/Icon/IconRupee';
import IconSmartphone from '../../components/Icon/IconPhone';
import IconHelp from '../../components/Icon/IconHelpCircle';
import IconArrowBack from '../../components/Icon/IconArrowLeft';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconInfo from '../../components/Icon/IconInfoCircle';
import IconCancel from '../../components/Icon/IconX';
import IconPerson from '../../components/Icon/IconUser';
import IconMail from '../../components/Icon/IconMail';
import IconPhone from '../../components/Icon/IconPhone';
import IconLocation from '../../components/Icon/IconMapPin';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconTimer from '../../components/Icon/IconClock';
import IconShield from '../../components/Icon/IconShield';
import IconDownload from '../../components/Icon/IconDownload';
import { color } from 'framer-motion';

const LivePaymentTest = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [order, setOrder] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [timer, setTimer] = useState(300);
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
        { id: 'card', name: 'Credit/Debit Card', icon: <IconCreditCard />, color: '#667eea' },
        { id: 'upi', name: 'UPI', icon: <IconQrCode />, color: '#9c27b0' },
        { id: 'netbanking', name: 'Net Banking', icon: <IconBank />, color: '#10b981' },
        { id: 'wallet', name: 'Wallet', icon: <IconSmartphone />, color: '#f59e0b' },
    ];

    const steps = [
        { number: 1, label: 'Payment Details' },
        { number: 2, label: 'Security Check' },
        { number: 3, label: 'Complete' },
    ];

    // Responsive styles
    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '16px' : '24px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh',
            fontSize: isMobile ? '14px' : '16px',
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? '24px' : '40px',
            padding: '0 8px',
            gap: isMobile ? '16px' : '0',
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff',
            border: '2px solid #e2e8f0',
            color: '#475569',
            padding: isMobile ? '10px 16px' : '12px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: isMobile ? '13px' : '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        titleContainer: {
            textAlign: isMobile ? 'left' : 'center',
            flexGrow: 1,
            width: isMobile ? '100%' : 'auto',
        },
        secureTitle: {
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '800',
            color: '#64748b',
            marginBottom: '8px',
            lineHeight: isMobile ? '1.2' : '1.3',
        },
        subtitle: {
            color: '#64748b',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '500',
            letterSpacing: '0.5px',
        },
        liveBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #f56565 0%, #ed8936 100%)',
            color: 'white',
            padding: isMobile ? '4px 12px' : '6px 16px',
            borderRadius: '20px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: '700',
            marginLeft: isMobile ? '8px' : '12px',
            animation: 'pulse 2s infinite',
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '16px' : '24px',
        },
        card: {
            background: 'white',
            borderRadius: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px' : '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            transition: 'all 0.3s ease',
        },
        gradientCard: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid transparent',
            borderRadius: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px' : '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            position: 'relative',
        },
        statusCard: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            borderRadius: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px' : '32px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden',
        },
        primaryButton: {
            padding: isMobile ? '14px 24px' : '16px 32px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        },
        input: {
            width: '100%',
            padding: isMobile ? '12px' : '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: isMobile ? '14px' : '16px',
            transition: 'all 0.3s ease',
            background: 'white',
            fontFamily: 'inherit',
        },
        textarea: {
            width: '100%',
            padding: isMobile ? '12px' : '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: isMobile ? '14px' : '16px',
            transition: 'all 0.3s ease',
            resize: 'vertical',
            minHeight: isMobile ? '100px' : '120px',
            background: 'white',
            fontFamily: 'inherit',
        },
        paymentMethodCard: {
            padding: isMobile ? '16px' : '20px',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'white',
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: 'center',
            gap: isMobile ? '12px' : '12px',
            textAlign: 'center',
        },
        stepContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: isMobile ? '24px 0' : '32px 0',
            position: 'relative',
        },
        stepCircle: {
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: isMobile ? '16px' : '18px',
            background: '#e2e8f0',
            color: '#94a3b8',
            border: isMobile ? '3px solid white' : '4px solid white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        alert: {
            padding: isMobile ? '12px' : '16px',
            borderRadius: '12px',
            margin: '16px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? '8px' : '12px',
            fontSize: isMobile ? '13px' : 'inherit',
        },
        loadingSpinner: {
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
        },
        successIcon: {
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'white',
            fontSize: isMobile ? '24px' : '36px',
            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)',
        },
    };

 

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    const fetchUserData = async (id) => {
        try {
            setUserLoading(true);
            setError(null);

            const response = await axios.get(`http://localhost:5043/hs5200/user/plan-details?userId=${id}`);

            if (response.data?.data?.success) {
                const userDetails = response.data.data.results;
                setUserData(userDetails);

                setPaymentData({
                    userId: userDetails.user_id,
                    amount: parseFloat(userDetails.total_price) || 1,
                    paymentFor: 'internet_recharge',
                    serviceType: 'bandwidth_plan',
                    serviceId: userDetails.post_code || `PLAN_${userDetails.user_id}`,
                    description: `Payment for ${userDetails.plan_name} - Premium Internet Services`,
                });
            } else {
                throw new Error(response.data?.data?.message || 'Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);

            setPaymentData({
                userId: id,
                amount: 1,
                paymentFor: 'internet_recharge',
                serviceType: 'bandwidth_plan',
                serviceId: `PLAN_${id}`,
                description: 'Payment for Premium Internet Services',
            });
        } finally {
            setUserLoading(false);
        }
    };


    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

            if (response.data?.data?.order_id) {
                const orderData = response.data.data;
                setOrder(orderData);
                return orderData;
            } else {
                throw new Error(response.data?.message || 'Invalid response structure');
            }
        } catch (error) {
            console.error('Error creating live order:', error);
            let errorMsg = 'Failed to create payment order';
            if (error.response) {
                errorMsg = error.response.data?.error?.description || error.response.data?.message || errorMsg;
            } else if (error.request) {
                errorMsg = 'No response from server. Check if backend is running.';
            }
            setError(errorMsg);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const openRazorpayCheckout = async (orderData) => {
        try {
            const loaded = await loadRazorpay();
            if (!loaded || !LIVE_RAZORPAY_KEY || !LIVE_RAZORPAY_KEY.startsWith('rzp_live_')) {
                setError('Payment gateway configuration error');
                return;
            }

            const options = {
                key: LIVE_RAZORPAY_KEY,
                amount: orderData.amount,
                currency: 'INR',
                name: 'Premium Internet Services',
                description: paymentData.description,
                order_id: orderData.order_id,
                handler: async (response) => {
                    await verifyPayment(response);
                },
                prefill: {
                    name: userData?.f_name || 'Customer',
                    email: userData?.email || 'customer@example.com',
                    contact: paymentData.userId,
                },
                theme: {
                    color: '#667eea',
                },
                modal: {
                    ondismiss: () => {
                        window.location.href = '/pages/maintenence';
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                window.location.href = '/pages/maintenence';
            });
            rzp.open();
        } catch (error) {
            console.error('Error opening Razorpay:', error);
            setError('Failed to open payment gateway: ' + error.message);
        }
    };

    const verifyPayment = async (paymentResponse) => {
        try {
            setLoading(true);

            const response = await axios.post('http://localhost:5043/payments/verify', {
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                environment: 'live',
            });

            if (response.data?.success) {
                setSuccess(true);
                setPaymentResult(response.data.data);
                setActiveStep(2);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLivePayment = async () => {
        if (!window.confirm(`⚠️ LIVE PAYMENT WARNING!\n\nYou are about to make a REAL payment of ₹${paymentData.amount}.\n\nAre you sure you want to proceed?`)) {
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

    // CSS Animation Styles
    const KeyframesStyle = () => (
        <style>
            {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Responsive font sizes */
        @media (max-width: 640px) {
          .responsive-text {
            font-size: 14px;
          }
          .responsive-heading {
            font-size: 20px;
          }
          .responsive-subheading {
            font-size: 16px;
          }
        }
        
        @media (max-width: 768px) {
          .responsive-text {
            font-size: 15px;
          }
          .responsive-heading {
            font-size: 24px;
          }
          .responsive-subheading {
            font-size: 18px;
          }
        }
      `}
        </style>
    );

    if (userLoading) {
        return (
            <>
                <KeyframesStyle />
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '100px 20px' }}>
                        <div style={styles.loadingSpinner} />
                        <div style={{ marginTop: '24px' }}>
                            <div
                                style={{
                                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                    backgroundSize: '1000px 100%',
                                    animation: 'shimmer 2s infinite',
                                    borderRadius: '8px',
                                    height: isMobile ? '20px' : '24px',
                                    width: isMobile ? '150px' : '200px',
                                    margin: '12px auto',
                                }}
                            />
                            <div
                                style={{
                                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                    backgroundSize: '1000px 100%',
                                    animation: 'shimmer 2s infinite',
                                    borderRadius: '8px',
                                    height: isMobile ? '14px' : '16px',
                                    width: isMobile ? '200px' : '300px',
                                    margin: '8px auto',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <KeyframesStyle />
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.titleContainer}>
                        <h1 style={styles.secureTitle}>
                            Secure Payment Gateway
                            <span style={styles.liveBadge}>LIVE</span>
                        </h1>
                        <p style={styles.subtitle}>User ID: {userId} • Real-time Payment Processing</p>
                    </div>
                </div>

                {/* Main Content */}
                <div style={styles.mainGrid}>
                    {/* Left Column */}
                    <div>
                        <div
                            style={styles.gradientCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
                            }}
                        >
                            {/* Progress Steps */}
                            <div style={styles.stepContainer}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: isMobile ? '20px' : '24px',
                                        left: '0',
                                        right: '0',
                                        height: '2px',
                                        background: '#e2e8f0',
                                        zIndex: '1',
                                    }}
                                />
                                {steps.map((step, index) => (
                                    <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '6px' : '8px', zIndex: '2' }}>
                                        <div
                                            style={{
                                                ...styles.stepCircle,
                                                background: activeStep > index ? '#10b981' : activeStep === index ? '#667eea' : '#e2e8f0',
                                                color: activeStep > index || activeStep === index ? 'white' : '#94a3b8',
                                            }}
                                        >
                                            {activeStep > index ? <IconCheckCircle size={isMobile ? 16 : 20} /> : step.number}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: isMobile ? '12px' : '14px',
                                                fontWeight: '600',
                                                color: activeStep > index ? '#10b981' : activeStep === index ? '#667eea' : '#94a3b8',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {step.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {activeStep === 0 && (
                                <>
                                    <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                                        <h3
                                            style={{
                                                marginBottom: isMobile ? '16px' : '24px',
                                                color: '#1e293b',
                                                fontSize: isMobile ? '18px' : '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <IconRupee size={isMobile ? 18 : 20} style={{ color: '#667eea' }} />
                                            Payment Details
                                        </h3>

                                        <div style={{ display: 'grid', gap: isMobile ? '12px' : '16px', marginBottom: isMobile ? '20px' : '24px' }}>
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#64748b',
                                                        fontWeight: '600',
                                                        fontSize: isMobile ? '13px' : '14px',
                                                    }}
                                                >
                                                    User ID
                                                </label>
                                                <input
                                                    value={paymentData.userId}
                                                    disabled
                                                    style={{
                                                        ...styles.input,
                                                        background: '#f8fafc',
                                                        color: '#94a3b8',
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#64748b',
                                                        fontWeight: '600',
                                                        fontSize: isMobile ? '13px' : '14px',
                                                    }}
                                                >
                                                    Amount (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    style={{
                                                        ...styles.input,
                                                        background: '#f8fafc',
                                                        color: '#94a3b8',
                                                    }}
                                                    value={paymentData.amount}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                    min="1"
                                                    step="0.01"
                                                    disabled
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#667eea';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#e2e8f0';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#64748b',
                                                        fontWeight: '600',
                                                        fontSize: isMobile ? '13px' : '14px',
                                                    }}
                                                >
                                                    Description
                                                </label>
                                                <textarea
                                                    value={paymentData.description}
                                                    onChange={(e) => setPaymentData((prev) => ({ ...prev, description: e.target.value }))}
                                                    style={styles.textarea}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#667eea';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#e2e8f0';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLivePayment}
                                            disabled={loading || paymentData.amount < 1}
                                            style={{
                                                ...styles.primaryButton,
                                                opacity: loading || paymentData.amount < 1 ? 0.6 : 1,
                                                cursor: loading || paymentData.amount < 1 ? 'not-allowed' : 'pointer',
                                                fontSize: isMobile ? '14px' : '16px',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!loading && paymentData.amount >= 1) {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.4)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!loading && paymentData.amount >= 1) {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
                                                }
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <div style={{ ...styles.loadingSpinner, width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', borderWidth: '2px' }} />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <IconLock size={isMobile ? 16 : 20} /> Pay ₹{paymentData.amount} Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {activeStep === 1 && (
                                <div style={{ textAlign: 'center', padding: isMobile ? '32px 0' : '48px 0' }}>
                                    <div style={styles.loadingSpinner} />
                                    <h3
                                        style={{
                                            margin: isMobile ? '16px 0 8px' : '24px 0 12px',
                                            color: '#1e293b',
                                            fontSize: isMobile ? '18px' : '20px',
                                        }}
                                    >
                                        Processing Your Payment
                                    </h3>
                                    <p
                                        style={{
                                            color: '#64748b',
                                            marginBottom: isMobile ? '24px' : '32px',
                                            fontSize: isMobile ? '14px' : '16px',
                                        }}
                                    >
                                        Please wait while we securely process your transaction.
                                    </p>
                                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: '60%',
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                animation: 'gradientShift 2s ease infinite',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeStep === 2 && success && (
                                <div style={{ textAlign: 'center', padding: isMobile ? '32px 0' : '48px 0', animation: 'slideUp 0.6s ease-out' }}>
                                    <div style={{ ...styles.successIcon, animation: 'float 3s ease-in-out infinite' }}>
                                        <IconCheckCircle size={isMobile ? 24 : 32} />
                                    </div>

                                    <h2
                                        style={{
                                            marginBottom: isMobile ? '12px' : '16px',
                                            color: '#10b981',
                                            fontSize: isMobile ? '20px' : '24px',
                                        }}
                                    >
                                        Payment Successful! 🎉
                                    </h2>

                                    <p
                                        style={{
                                            color: '#64748b',
                                            marginBottom: isMobile ? '24px' : '32px',
                                            fontSize: isMobile ? '14px' : '16px',
                                        }}
                                    >
                                        Your payment of ₹{paymentData.amount} has been processed successfully.
                                    </p>

                                    <div
                                        style={{
                                            background: '#f8fafc',
                                            borderRadius: '16px',
                                            padding: isMobile ? '16px' : '24px',
                                            margin: isMobile ? '24px auto' : '32px auto',
                                            maxWidth: '500px',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {[
                                            { label: 'User ID:', value: paymentData.userId },
                                            { label: 'Amount:', value: `₹${paymentData.amount}`, valueStyle: { color: '#10b981' } },
                                            { label: 'Transaction ID:', value: paymentResult?.payment_id || 'N/A' },
                                            { label: 'Status:', value: 'Completed', isChip: true },
                                        ].map((item, index, arr) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    flexDirection: isMobile ? 'column' : 'row',
                                                    alignItems: isMobile ? 'flex-start' : 'center',
                                                    padding: isMobile ? '8px 0' : '12px 0',
                                                    borderBottom: index < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                                                    gap: isMobile ? '4px' : '0',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: '#64748b',
                                                        fontSize: isMobile ? '13px' : '14px',
                                                    }}
                                                >
                                                    {item.label}
                                                </span>
                                                {item.isChip ? (
                                                    <span
                                                        style={{
                                                            fontWeight: '600',
                                                            color: '#10b981',
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: isMobile ? '12px' : '14px',
                                                            marginTop: isMobile ? '4px' : '0',
                                                        }}
                                                    >
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontWeight: '600',
                                                            ...item.valueStyle,
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            wordBreak: 'break-word',
                                                            textAlign: isMobile ? 'left' : 'right',
                                                        }}
                                                    >
                                                        {item.value}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: isMobile ? '8px' : '12px',
                                            justifyContent: 'center',
                                            flexDirection: isMobile ? 'column' : 'row',
                                        }}
                                    >
                                        <button
                                            onClick={() => console.log('Download receipt')}
                                            style={{
                                                ...styles.backButton,
                                                padding: isMobile ? '10px 20px' : '12px 24px',
                                            }}
                                        >
                                            <IconDownload size={isMobile ? 16 : 18} /> Receipt
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveStep(0);
                                                setSuccess(false);
                                                setPaymentResult(null);
                                            }}
                                            style={{
                                                ...styles.primaryButton,
                                                width: isMobile ? '100%' : 'auto',
                                                padding: isMobile ? '10px 20px' : '12px 24px',
                                            }}
                                        >
                                            <IconRefresh size={isMobile ? 16 : 18} /> New Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div
                                    style={{
                                        ...styles.alert,
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '2px solid rgba(239, 68, 68, 0.2)',
                                        color: '#7f1d1d',
                                        animation: 'slideUp 0.3s ease',
                                    }}
                                >
                                    <IconError size={isMobile ? 18 : 20} />
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: '600',
                                                marginBottom: '4px',
                                                fontSize: isMobile ? '14px' : '16px',
                                            }}
                                        >
                                            Payment Error
                                        </div>
                                        <div style={{ fontSize: isMobile ? '13px' : '14px' }}>{error}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Need Help Card */}
                        <div
                            style={{
                                ...styles.card,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                marginTop: isMobile ? '16px' : '24px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                    style={{
                                        width: isMobile ? '40px' : '48px',
                                        height: isMobile ? '40px' : '48px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}
                                >
                                    <IconHelp size={isMobile ? 20 : 24} />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontWeight: '700',
                                            fontSize: isMobile ? '13px' : '14px',
                                        }}
                                    >
                                        Need Help?
                                    </div>
                                    <div
                                        style={{
                                            fontSize: isMobile ? '12px' : '13px',
                                            color: '#64748b',
                                            marginTop: '2px',
                                        }}
                                    >
                                        Contact: info@skisp.in
                                        <br />
                                        Phone: +91-9965699903
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* User Information */}
                        {userData && (
                            <div
                                style={{
                                    ...styles.statusCard,
                                    marginBottom: isMobile ? '16px' : '24px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
                                }}
                            >
                                <h3
                                    style={{
                                        marginBottom: isMobile ? '16px' : '24px',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: isMobile ? '16px' : '18px',
                                    }}
                                >
                                    <IconPerson size={isMobile ? 16 : 18} style={{ color: '#667eea' }} /> Customer Information
                                </h3>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: isMobile ? '12px' : '16px',
                                        marginBottom: isMobile ? '16px' : '24px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            gap: isMobile ? '4px' : '0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '11px' : '12px',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                Full Name
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                <IconPerson size={isMobile ? 14 : 16} /> {userData.f_name || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            gap: isMobile ? '4px' : '0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '11px' : '12px',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                Email Address
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                <IconMail size={isMobile ? 14 : 16} /> {userData.email || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            gap: isMobile ? '4px' : '0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '11px' : '12px',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                Selected Plan
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                }}
                                            >
                                                {userData.plan_name}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            gap: isMobile ? '4px' : '0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '11px' : '12px',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                Total Amount
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}
                                            >
                                                <IconRupee size={isMobile ? 14 : 16} /> {userData.total_price || '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div style={styles.statusCard}>
                            <h3
                                style={{
                                    marginBottom: isMobile ? '16px' : '24px',
                                    color: 'white',
                                    fontSize: isMobile ? '16px' : '18px',
                                }}
                            >
                                Order Summary
                            </h3>

                            {userData ? (
                                <>
                                    <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                paddingBottom: '12px',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                gap: isMobile ? '4px' : '0',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                }}
                                            >
                                                Plan:
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    textAlign: isMobile ? 'left' : 'right',
                                                }}
                                            >
                                                {userData.plan_name}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                padding: '12px 0',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                gap: isMobile ? '4px' : '0',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                }}
                                            >
                                                Base Price:
                                            </span>
                                            <span
                                                style={{
                                                    color: 'white',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                }}
                                            >
                                                ₹{userData.base_price || '0.00'}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                padding: '12px 0',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                                gap: isMobile ? '4px' : '0',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '13px' : '14px',
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                }}
                                            >
                                                Tax (GST):
                                            </span>
                                            <span
                                                style={{
                                                    color: 'white',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                }}
                                            >
                                                ₹{userData.tax_price || '0.00'}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                height: '1px',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                margin: isMobile ? '12px 0' : '16px 0',
                                            }}
                                        />

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                paddingTop: '12px',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                gap: isMobile ? '8px' : '0',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '16px' : '18px',
                                                    fontWeight: '700',
                                                    color: 'white',
                                                }}
                                            >
                                                Total:
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: isMobile ? '20px' : '24px',
                                                    fontWeight: '800',
                                                    color: 'white',
                                                }}
                                            >
                                                ₹{userData.total_price || '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            padding: '16px 0',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            gap: isMobile ? '8px' : '0',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: isMobile ? '16px' : '18px',
                                                fontWeight: '700',
                                                color: 'white',
                                            }}
                                        >
                                            Amount:
                                        </span>
                                        <span
                                            style={{
                                                fontSize: isMobile ? '20px' : '24px',
                                                fontWeight: '800',
                                                color: 'white',
                                            }}
                                        >
                                            ₹{paymentData.amount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Live Payment Alert */}
                            <div
                                style={{
                                    ...styles.alert,
                                    margin: isMobile ? '16px 0' : '24px 0',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <IconInfo size={isMobile ? 16 : 18} style={{ color: '#fbbf24' }} />
                                <div style={{ color: '#fef3c7' }}>
                                    <div
                                        style={{
                                            fontWeight: '600',
                                            marginBottom: '4px',
                                            fontSize: isMobile ? '13px' : '14px',
                                        }}
                                    >
                                        Live Payment
                                    </div>
                                    <div style={{ fontSize: isMobile ? '12px' : '13px' }}>
                                        • Real money will be charged
                                        <br />
                                        • Use real payment methods only
                                        <br />• Save transaction ID for reference
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        marginTop: isMobile ? '32px' : '48px',
                        textAlign: 'center',
                        padding: isMobile ? '16px' : '24px',
                        color: '#64748b',
                        fontSize: isMobile ? '12px' : '14px',
                        borderTop: '1px solid #e2e8f0',
                    }}
                >
                    <div>© {new Date().getFullYear()} Premium Internet Services. All rights reserved.</div>
                    <div style={{ marginTop: '4px', fontSize: isMobile ? '11px' : '12px' }}>Secured by Razorpay • User ID: {userId}</div>
                </div>
            </div>
        </>
    );
};

export default LivePaymentTest;
