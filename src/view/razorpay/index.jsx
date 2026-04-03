import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../../api/ApiConfig';
// Import your custom icons
import IconRupee from '../../components/Icon/IconRupee';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconError from '../../components/Icon/IconXCircle';
import IconShield from '../../components/Icon/IconShield';
import IconCheck from '../../components/Icon/IconCheck';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconLock from '../../components/Icon/IconLock';
import IconSquareCheck from '../../components/Icon/IconSquareCheck';
import IconZap from '../../components/Icon/IconZap';
import IconPhone from '../../components/Icon/IconPhone';
import IconHelpCircle from '../../components/Icon/IconHelpCircle';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconX from '../../components/Icon/IconX';
import IconUser from '../../components/Icon/IconUser';
import IconMail from '../../components/Icon/IconMail';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDownload from '../../components/Icon/IconDownload';
import SkispLogo from '../../../public/assets/images/skisp-new-logo copy.png';
// Import ModelViewBox component
import ModelViewBox from '../../util/ModelViewBox';

const LivePaymentTest = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [expiryMessage, setExpiryMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [expiryInfo, setExpiryInfo] = useState({
    expiryDate: null,
    daysRemaining: 0,
    isWithinWindow: false,
    formattedDate: '',
    expiryString: '',
  });
  // New state to track if plan is rechargeable (amount > 0)
  const [isRechargeable, setIsRechargeable] = useState(true);
  const [paymentData, setPaymentData] = useState({
    userId: '',
    amount: 0,
    paymentFor: 'internet_recharge',
    serviceType: 'bandwidth_plan',
    serviceId: '',
    description: '',
  });

  const LIVE_RAZORPAY_KEY = 'rzp_live_RzMWnfAqbigGAh';

  // Function to parse expiry date from API response
  const parseExpiryDate = (apiResponse) => {
    try {
      let expiryDate = null;
      let expiryString = '';

      // First try to get from userDetails.results
      if (apiResponse.userDetails?.results) {
        const expiryField = apiResponse.userDetails.results.find(
          (item) => item.fid === 'expire_time'
        );
        if (expiryField?.value) {
          expiryString = expiryField.value;
          expiryDate = new Date(expiryString);
          console.log('Found expiry from expire_time:', expiryString);
        }
      }

      // If not found, try validity_end_ts (Unix timestamp)
      if (!expiryDate || isNaN(expiryDate.getTime())) {
        if (apiResponse.validity_end_ts) {
          // Convert Unix timestamp (seconds) to milliseconds
          expiryDate = new Date(apiResponse.validity_end_ts * 1000);
          expiryString = expiryDate.toLocaleString();
          console.log('Found expiry from validity_end_ts:', expiryString);
        }
      }

      // If still no valid date, return null
      if (!expiryDate || isNaN(expiryDate.getTime())) {
        console.log('No valid expiry date found in API response');
        return null;
      }

      return {
        date: expiryDate,
        string: expiryString,
      };
    } catch (error) {
      console.error('Error parsing expiry date from API:', error);
      return null;
    }
  };

  // Function to check if plan is rechargeable (amount > 0)
  const checkPlanRechargeable = (amount) => {
    const isRechargeableAmount = amount > 0;
    setIsRechargeable(isRechargeableAmount);
    return isRechargeableAmount;
  };

  // Updated function to check expiry date and rechargeable status
  const checkExpiryAndRechargeStatus = (expiryData, planAmount) => {
    try {
      const isRechargeableAmount = checkPlanRechargeable(planAmount);
      
      if (!isRechargeableAmount) {
        setCanMakePayment(false);
        setExpiryMessage('⚠️ This plan is not rechargeable. Please contact admin for assistance.');
        setExpiryInfo({
          expiryDate: null,
          daysRemaining: null,
          isWithinWindow: false,
          formattedDate: 'Not Available',
          expiryString: '',
        });
        return false;
      }

      if (!expiryData) {
        console.log('No expiry date data provided');
        setCanMakePayment(true);
        setExpiryMessage('Expiry date not available. Payment allowed.');
        setExpiryInfo({
          expiryDate: null,
          daysRemaining: null,
          isWithinWindow: true,
          formattedDate: 'Not Available',
          expiryString: '',
        });
        return true;
      }

      const expiryDate = expiryData.date;
      const expiryString = expiryData.string;

      if (isNaN(expiryDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const currentDate = new Date();
      const timeDiff = expiryDate.getTime() - currentDate.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      console.log(`Expiry Date: ${expiryDate}, Days Remaining: ${daysRemaining}`);
      
      const isWithinPaymentWindow = daysRemaining <= 10;
      
      const formattedDate = expiryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      setExpiryInfo({
        expiryDate: expiryDate,
        daysRemaining: daysRemaining,
        isWithinWindow: isWithinPaymentWindow,
        formattedDate: formattedDate,
        expiryString: expiryString,
      });

      let message = '';
      if (daysRemaining < 0) {
        message = `⚠️ Your account expired ${Math.abs(daysRemaining)} day(s) ago. Payment is allowed to renew.`;
        setCanMakePayment(true);
      } else if (daysRemaining === 0) {
        message = '⚠️ Your account expires today! Please renew now.';
        setCanMakePayment(true);
      } else if (daysRemaining <= 10) {
        message = `✅ Your account expires in ${daysRemaining} day(s). You can make payment now.`;
        setCanMakePayment(true);
      } else {
        message = `⏳ Your account expires in ${daysRemaining} days. Payment available within 10 days of expiry.`;
        setCanMakePayment(false);
      }

      setExpiryMessage(message);
      return isWithinPaymentWindow;
    } catch (error) {
      console.error('Error checking expiry date:', error);
      setCanMakePayment(true);
      setExpiryMessage('Unable to verify expiry date. Payment may be available.');
      setExpiryInfo({
        expiryDate: null,
        daysRemaining: null,
        isWithinWindow: true,
        formattedDate: 'Date Parse Error',
        expiryString: '',
      });
      return true;
    }
  };

  const confirmAndProceedPayment = async () => {
    setShowPaymentConfirmModal(false);
    try {
      const orderData = await createOrder();
      if (orderData) {
        await openRazorpayCheckout(orderData);
      }
    } catch (error) {
      console.log('Live payment flow error:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id) => {
    try {
      setUserLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/hs5200/user/plan-details?userId=${id}`);
      
      if (response.data?.data?.success) {
        const userDetails = response.data.data.results;
        console.log('User Data:', userDetails);
        
        // Get the total amount
        const totalAmount = parseFloat(userDetails.total_price) || 0;
        
        setUserData(userDetails);
        
        // Parse expiry date from API response
        const expiryData = parseExpiryDate(userDetails);
        
        // Check both expiry and rechargeable status
        checkExpiryAndRechargeStatus(expiryData, totalAmount);
        
        setPaymentData({
          userId: userDetails.user_id || id,
          amount: totalAmount,
          paymentFor: 'internet_recharge',
          serviceType: 'bandwidth_plan',
          serviceId: userDetails.post_code || `PLAN_${userDetails.user_id}`,
          description: `Payment for ${userDetails.plan_name || 'Internet Plan'} - Premium Internet Services`,
        });
      } else {
        throw new Error(response.data?.data?.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setCanMakePayment(true);
      setExpiryMessage('Failed to fetch user data. Payment may be available.');
      setPaymentData({
        userId: id,
        amount: 590,
        paymentFor: 'internet_recharge',
        serviceType: 'bandwidth_plan',
        serviceId: `PLAN_${id}`,
        description: 'Payment for Premium Internet Services',
      });
      setError('Failed to load user data. Payment may proceed.');
    } finally {
      setUserLoading(false);
    }
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
        `${baseURL}/payments/create-order`,
        {
          ...paymentData,
          environment: 'live',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
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
          contact: userData?.mobile || paymentData.userId,
        },
        theme: {
          color: '#667eea',
        },
        modal: {
          ondismiss: () => {
            setActiveStep(0);
            setError('Payment cancelled by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setActiveStep(0);
      });
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      setError('Failed to open payment gateway: ' + error.message);
      setActiveStep(0);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/payments/verify`, {
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
      setError('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleLivePayment = async () => {
    if (!canMakePayment) {
      setShowWarningModal(true);
      return;
    }
    setShowPaymentConfirmModal(true);
  };

  // Responsive styles (keeping your existing styles)
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

  // CSS Animation Styles
  const KeyframesStyle = () => (
    <style>
      {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        /* Expiry warning styles */
        .expiry-warning {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-left: 6px solid #f59e0b;
        }
        .expiry-success {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #10b981;
          border-left: 6px solid #10b981;
        }
        .expiry-danger {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #ef4444;
          border-left: 6px solid #ef4444;
        }
        .expiry-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid #3b82f6;
          border-left: 6px solid #3b82f6;
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
                  background:
                    'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
                  background:
                    'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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

  // Determine expiry status class
  const getExpiryStatusClass = () => {
    if (!expiryInfo.daysRemaining && expiryInfo.daysRemaining !== 0) return 'expiry-info';
    if (expiryInfo.daysRemaining < 0) return 'expiry-danger';
    if (expiryInfo.daysRemaining <= 10) return 'expiry-warning';
    return 'expiry-success';
  };

  const steps = [
    { number: 1, label: 'Payment Details' },
    { number: 2, label: 'Security Check' },
    { number: 3, label: 'Complete' },
  ];

  return (
    <>
      <KeyframesStyle />
      {/* Expiry Warning Modal */}
      <ModelViewBox
        modal={showWarningModal}
        setModel={setShowWarningModal}
        modelHeader="Payment Window Information"
        cancelBtn={true}
        modelSize="md"
        saveBtn={false}
        backgroundColor="bg-white"
        headerBg="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
        closeIconColor="text-white"
        showBackdropBlur={true}
      >
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <IconInfoCircle size={24} className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-3">
            {canMakePayment ? 'Payment Available' : 'Payment Window Not Open'}
          </h3>
          <div className={`p-4 rounded-lg mb-4 ${getExpiryStatusClass()}`}>
            <div className="space-y-2">
              <p className="text-sm text-gray-800">
                <strong>Account Expiry:</strong>{' '}
                {expiryInfo.formattedDate || expiryInfo.expiryString || 'Not Available'}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Days Remaining:</strong> {expiryInfo.daysRemaining ?? 'N/A'} day(s)
              </p>
              <p className="text-sm text-gray-800">
                <strong>Payment Window:</strong> {canMakePayment ? 'OPEN' : 'CLOSED'}
              </p>
              <p className="text-sm text-gray-800">
                <strong>Plan Status:</strong> {isRechargeable ? 'Rechargeable' : 'Not Rechargeable'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              <strong>Payment Policy:</strong> You can make payments only when your account expiry is
              within 10 days or has already expired, and the plan amount is greater than zero.
            </p>
            {canMakePayment ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  ✅ You are eligible to make a payment. Your account expiry falls within the
                  payment window.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  {!isRechargeable
                    ? '⚠️ This plan is not rechargeable. Please contact admin for assistance.'
                    : `⏳ Payment will be available from ${
                        expiryInfo.expiryDate
                          ? new Date(
                              expiryInfo.expiryDate.getTime() - 10 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()
                          : 'when 10 days before expiry'
                      }.`}
                </p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Contact Support:</strong> info@skisp.in | +91-9965699903
              </p>
            </div>
          </div>
        </div>
      </ModelViewBox>

      {/* Payment Confirmation Modal */}
      <ModelViewBox
        modal={showPaymentConfirmModal}
        setModel={setShowPaymentConfirmModal}
        modelHeader="Live Payment Confirmation"
        cancelBtn={true}
        modelSize="md"
        saveBtn={true}
        handleSubmit={confirmAndProceedPayment}
        btnName="Proceed with Payment"
        backgroundColor="bg-white"
        headerBg="bg-gradient-to-r from-[#ef4444] to-[#f87171]"
        closeIconColor="text-white"
        showBackdropBlur={true}
      >
        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <IconInfoCircle size={24} className="text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-3">
            ⚠️ LIVE PAYMENT WARNING!
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 mb-2">
              <strong>You are about to make a REAL payment of ₹{paymentData.amount}.</strong>
            </p>
            <p className="text-sm text-red-700">
              This is a LIVE transaction using real money. Please ensure you want to proceed.
            </p>
          </div>
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>Important Notes:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Real money will be deducted from your account</li>
                <li>• Use only valid payment methods</li>
                <li>• Save transaction ID for reference</li>
                <li>• Refunds are subject to company policy</li>
              </ul>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">
                <strong>Payment Details:</strong>
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium">{paymentData.userId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-red-600">₹{paymentData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{paymentData.description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModelViewBox>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <img src={SkispLogo} alt="company logo" width="150px" />
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
              {/* Expiry Status Banner - Updated for non-rechargeable plans */}
              {!isRechargeable ? (
                <div
                  style={{
                    ...styles.alert,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.2)',
                    color: '#7f1d1d',
                    marginBottom: isMobile ? '16px' : '24px',
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
                      Plan Not Rechargeable
                    </div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px' }}>
                      This plan is not rechargeable. Please contact admin for assistance.
                    </div>
                  </div>
                </div>
              ) : expiryMessage && (
                <div
                  style={{
                    ...styles.alert,
                    background:
                      expiryInfo.daysRemaining === null
                        ? 'rgba(59, 130, 246, 0.1)'
                        : expiryInfo.daysRemaining < 0
                        ? 'rgba(239, 68, 68, 0.1)'
                        : expiryInfo.daysRemaining <= 10
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                    border:
                      expiryInfo.daysRemaining === null
                        ? '2px solid rgba(59, 130, 246, 0.2)'
                        : expiryInfo.daysRemaining < 0
                        ? '2px solid rgba(239, 68, 68, 0.2)'
                        : expiryInfo.daysRemaining <= 10
                        ? '2px solid rgba(245, 158, 11, 0.2)'
                        : '2px solid rgba(16, 185, 129, 0.2)',
                    color:
                      expiryInfo.daysRemaining === null
                        ? '#1e40af'
                        : expiryInfo.daysRemaining < 0
                        ? '#7f1d1d'
                        : expiryInfo.daysRemaining <= 10
                        ? '#7c2d12'
                        : '#065f46',
                    marginBottom: isMobile ? '16px' : '24px',
                  }}
                >
                  <IconCalendar size={isMobile ? 18 : 20} />
                  <div>
                    <div
                      style={{
                        fontWeight: '600',
                        marginBottom: '4px',
                        fontSize: isMobile ? '14px' : '16px',
                      }}
                    >
                      Account Status
                    </div>
                    <div style={{ fontSize: isMobile ? '13px' : '14px' }}>{expiryMessage}</div>
                    {expiryInfo.expiryString && (
                      <div
                        style={{
                          fontSize: isMobile ? '11px' : '12px',
                          marginTop: '4px',
                          color:
                            expiryInfo.daysRemaining === null
                              ? '#3b82f6'
                              : expiryInfo.daysRemaining < 0
                              ? '#ef4444'
                              : expiryInfo.daysRemaining <= 10
                              ? '#d97706'
                              : '#059669',
                          fontStyle: 'italic',
                        }}
                      >
                        Expiry: {expiryInfo.expiryString}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  <div
                    key={step.number}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: isMobile ? '6px' : '8px',
                      zIndex: '2',
                    }}
                  >
                    <div
                      style={{
                        ...styles.stepCircle,
                        background:
                          activeStep > index
                            ? '#10b981'
                            : activeStep === index
                            ? '#667eea'
                            : '#e2e8f0',
                        color:
                          activeStep > index || activeStep === index ? 'white' : '#94a3b8',
                      }}
                    >
                      {activeStep > index ? <IconCheckCircle size={isMobile ? 16 : 20} /> : step.number}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        color:
                          activeStep > index
                            ? '#10b981'
                            : activeStep === index
                            ? '#667eea'
                            : '#94a3b8',
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
                    <div
                      style={{
                        display: 'grid',
                        gap: isMobile ? '12px' : '16px',
                        marginBottom: isMobile ? '20px' : '24px',
                      }}
                    >
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
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
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
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
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

                    {/* Conditional Payment Button */}
                    {!isRechargeable ? (
                      <div
                        style={{
                          padding: isMobile ? '16px' : '20px',
                          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                          border: '2px solid #ef4444',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <IconX size={isMobile ? 20 : 24} style={{ color: '#dc2626', marginBottom: '12px' }} />
                        <h4
                          style={{
                            color: '#7f1d1d',
                            marginBottom: '8px',
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: '600',
                          }}
                        >
                          Payment Not Available
                        </h4>
                        <p
                          style={{
                            color: '#991b1b',
                            fontSize: isMobile ? '13px' : '14px',
                            marginBottom: '16px',
                          }}
                        >
                          This plan is not rechargeable. Please contact admin for assistance.
                        </p>
                        <button
                          onClick={() => setShowWarningModal(true)}
                          style={{
                            ...styles.backButton,
                            background: 'white',
                            borderColor: '#ef4444',
                            color: '#dc2626',
                            fontWeight: '600',
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    ) : canMakePayment ? (
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
                            <div
                              style={{
                                ...styles.loadingSpinner,
                                width: isMobile ? '16px' : '20px',
                                height: isMobile ? '16px' : '20px',
                                borderWidth: '2px',
                              }}
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <IconLock size={isMobile ? 16 : 20} />
                            Pay ₹{paymentData.amount} Now
                          </>
                        )}
                      </button>
                    ) : (
                      <div
                        style={{
                          padding: isMobile ? '16px' : '20px',
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          border: '2px solid #f59e0b',
                          borderRadius: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <IconCalendar size={isMobile ? 20 : 24} style={{ color: '#d97706', marginBottom: '12px' }} />
                        <h4
                          style={{
                            color: '#7c2d12',
                            marginBottom: '8px',
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: '600',
                          }}
                        >
                          Payment Not Available
                        </h4>
                        <p
                          style={{
                            color: '#92400e',
                            fontSize: isMobile ? '13px' : '14px',
                            marginBottom: '16px',
                          }}
                        >
                          You can make payment only when your account expiry is within 10 days.
                        </p>
                        <button
                          onClick={() => setShowWarningModal(true)}
                          style={{
                            ...styles.backButton,
                            background: 'white',
                            borderColor: '#f59e0b',
                            color: '#d97706',
                            fontWeight: '600',
                          }}
                        >
                          View Expiry Details
                        </button>
                      </div>
                    )}
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
                  <div
                    style={{
                      height: '8px',
                      background: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
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
                <div
                  style={{
                    textAlign: 'center',
                    padding: isMobile ? '32px 0' : '48px 0',
                    animation: 'slideUp 0.6s ease-out',
                  }}
                >
                  <div
                    style={{
                      ...styles.successIcon,
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  >
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
                      <IconDownload size={isMobile ? 16 : 18} />
                      Receipt
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
                      <IconRefresh size={isMobile ? 16 : 18} />
                      New Payment
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
                  <IconHelpCircle size={isMobile ? 20 : 24} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: isMobile ? '13px' : '14px' }}>
                    Need Help?
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '12px' : '13px',
                      color: '#64748b',
                      marginTop: '2px',
                    }}
                  >
                    Contact: info@skisp.in <br />
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
                  <IconUser size={isMobile ? 16 : 18} style={{ color: '#667eea' }} />
                  Customer Information
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
                        <IconUser size={isMobile ? 14 : 16} />
                        {userData.f_name || 'N/A'}
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
                        <IconMail size={isMobile ? 14 : 16} />
                        {userData.email || 'N/A'}
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
                          color: parseFloat(userData.total_price) === 0 ? '#fbbf24' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <IconRupee size={isMobile ? 14 : 16} />
                        ₹{userData.total_price || '0.00'}
                        {parseFloat(userData.total_price) === 0 && (
                          <span
                            style={{
                              fontSize: isMobile ? '10px' : '11px',
                              color: '#fbbf24',
                              marginLeft: '4px',
                            }}
                          >
                            (Not Rechargeable)
                          </span>
                        )}
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
                        ₹{userData.pre_tax_price || '0.00'}
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
                          color: parseFloat(userData.total_price) === 0 ? '#fbbf24' : 'white',
                        }}
                      >
                        ₹{userData.total_price || '0.00'}
                        {parseFloat(userData.total_price) === 0 && (
                          <span
                            style={{
                              fontSize: isMobile ? '10px' : '12px',
                              marginLeft: '8px',
                              color: '#fbbf24',
                            }}
                          >
                            (Not Rechargeable)
                          </span>
                        )}
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
                <IconInfoCircle size={isMobile ? 16 : 18} style={{ color: '#fbbf24' }} />
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
                    • Real money will be charged <br />
                    • Use real payment methods only <br />• Save transaction ID for reference
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
          <div style={{ marginTop: '4px', fontSize: isMobile ? '11px' : '12px' }}>
            Secured by Razorpay • User ID: {userId} •{' '}
            {!isRechargeable
              ? 'Plan not rechargeable'
              : `Expiry: ${expiryInfo.daysRemaining ?? 'N/A'} days remaining`}
          </div>
        </div>
      </div>
    </>
  );
};

export default LivePaymentTest;