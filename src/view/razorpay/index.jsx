import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Snackbar
} from '@mui/material';
import {
  Payment,
  Receipt,
  CheckCircle,
  Error as ErrorIcon,
  Security,
  Warning
} from '@mui/icons-material';
import axios from 'axios';

const LivePaymentTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [order, setOrder] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  const [paymentData, setPaymentData] = useState({
    userId: '7010019846',
    amount: 1, // Minimum 1 rupees for live
    paymentFor: 'internet_recharge',
    serviceType: 'bandwidth_plan',
    serviceId: 'PLAN001',
    description: 'Live payment for SKISP Internet Services'
  });

  // Live Razorpay key (from your config)
  const LIVE_RAZORPAY_KEY = 'rzp_live_RzMWnfAqbigGAh';

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5043/payments/health', {
        timeout: 5000
      });
      setBackendStatus(response.data);
    } catch (error) {
      setBackendStatus({
        status: 'error',
        message: 'Backend not responding. Make sure server is running on http://localhost:5043'
      });
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

  const handleInputChange = (field) => (event) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };
const createOrder = async () => {
  try {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOrder(null);
    setPaymentResult(null);
    
    console.log('Creating live order with data:', paymentData);
    
    const response = await axios.post(
      'http://localhost:5043/payments/create-order',
      {
        ...paymentData,
        environment: 'live'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Full live order response:', response.data);
    
    // Check if data exists and has order_id
    if (response.data && response.data.data) {
      const orderData = response.data.data;
      
      // DEBUG: Log the structure
      console.log('Order data structure:', {
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        keys: Object.keys(orderData)
      });
      
      if (!orderData.order_id) {
        throw new Error('Order ID not found in response data');
      }
      
      setOrder(orderData);
      return orderData;
    } else {
      throw new Error(response.data?.message || 'Invalid response structure');
    }
    
  } catch (error) {
    console.error('Error creating live order:', error.response || error);
    
    let errorMsg = 'Failed to create payment order';
    if (error.response) {
      // Try to extract more detailed error info
      if (error.response.data?.error?.description) {
        errorMsg = error.response.data.error.description;
      } else if (error.response.data?.message) {
        errorMsg = error.response.data.message;
      } else {
        errorMsg = JSON.stringify(error.response.data);
      }
    } else if (error.request) {
      errorMsg = 'No response from server. Check if backend is running on port 5043.';
    } else {
      errorMsg = error.message;
    }
    
    setError(errorMsg);
    setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    throw error;
    
  } finally {
    setLoading(false);
  }
};
  // const createOrder = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     setSuccess(false);
  //     setOrder(null);
  //     setPaymentResult(null);

  //     console.log('Creating live order with data:', paymentData);
      
  //     const response = await axios.post(
  //       'http://localhost:5043/payments/create-order',
  //       {
  //         ...paymentData,
  //         environment: 'live' // Ensure backend uses live keys
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );

  //     console.log('Live order response:', response.data);
      
  //     if (response.data && response.data.data) {
  //       setOrder(response.data.data);
  //       return response.data.data;
  //     } else {
  //       throw new Error(response.data?.message || 'Failed to create order');
  //     }
  //   } catch (error) {
  //     console.error('Error creating live order:', error.response || error);
  //     let errorMsg = 'Failed to create payment order';
      
  //     if (error.response) {
  //       errorMsg = error.response.data?.message || 
  //                  error.response.data?.error?.description || 
  //                  JSON.stringify(error.response.data);
  //     } else if (error.request) {
  //       errorMsg = 'No response from server. Check if backend is running.';
  //     } else {
  //       errorMsg = error.message;
  //     }
      
  //     setError(errorMsg);
  //     setSnackbar({
  //       open: true,
  //       message: errorMsg,
  //       severity: 'error'
  //     });
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const openRazorpayCheckout = async (orderData) => {
  try {
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError('Razorpay SDK failed to load');
      return;
    }

    // Validate live key
    if (!LIVE_RAZORPAY_KEY || !LIVE_RAZORPAY_KEY.startsWith('rzp_live_')) {
      const msg = 'Invalid live Razorpay key configuration';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
      return;
    }

    // DEBUG: Log the order data
    console.log('Order data for Razorpay:', orderData);
    
    // Check if order ID exists
    if (!orderData.order_id) {
      setError('Order ID is missing from order data');
      setSnackbar({ 
        open: true, 
        message: 'Order ID not found. Check backend response.', 
        severity: 'error' 
      });
      return;
    }

    const options = {
      key: LIVE_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: "SKISP Internet Services",
      description: paymentData.description,
      order_id: orderData.order_id, // This should be "order_S7Z43ZA2mrWeGm"
      handler: async (response) => {
        console.log('Live payment response:', response);
        await verifyPayment(response);
      },
      prefill: {
        name: "Customer",
        email: "customer@skisp.com",
        contact: paymentData.userId
      },
      notes: {
        userId: paymentData.userId,
        paymentFor: paymentData.paymentFor,
        environment: 'live'
      },
      theme: {
        color: "#10b981"
      },
      modal: {
        ondismiss: () => {
          setSnackbar({ 
            open: true, 
            message: 'Payment was cancelled. You can try again.', 
            severity: 'warning' 
          });
        }
      }
    };

    console.log('Live Razorpay options:', options);
    
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
  // const openRazorpayCheckout = async (orderData) => {
  //   try {
  //     const loaded = await loadRazorpay();
  //     if (!loaded) {
  //       setError('Razorpay SDK failed to load');
  //       return;
  //     }

  //     // Validate live key
  //     if (!LIVE_RAZORPAY_KEY || !LIVE_RAZORPAY_KEY.startsWith('rzp_live_')) {
  //       const msg = 'Invalid live Razorpay key configuration';
  //       setError(msg);
  //       setSnackbar({
  //         open: true,
  //         message: msg,
  //         severity: 'error'
  //       });
  //       return;
  //     }

  //     const options = {
  //       key: LIVE_RAZORPAY_KEY,
  //       amount: orderData.amount,
  //       currency: orderData.currency || 'INR',
  //       name: "SKISP Internet Services",
  //       description: paymentData.description,
  //       order_id: orderData.order_id,
  //       handler: async (response) => {
  //         console.log('Live payment response:', response);
  //         await verifyPayment(response);
  //       },
  //       prefill: {
  //         name: "Customer",
  //         email: "customer@skisp.com",
  //         contact: paymentData.userId
  //       },
  //       notes: {
  //         userId: paymentData.userId,
  //         paymentFor: paymentData.paymentFor,
  //         environment: 'live'
  //       },
  //       theme: {
  //         color: "#10b981"
  //       },
  //       modal: {
  //         ondismiss: () => {
  //           setSnackbar({
  //             open: true,
  //             message: 'Payment was cancelled. You can try again.',
  //             severity: 'warning'
  //           });
  //         }
  //       }
  //     };

  //     console.log('Live Razorpay options:', options);
      
  //     const rzp = new window.Razorpay(options);
      
  //     rzp.on('payment.failed', (response) => {
  //       console.error('Live payment failed:', response.error);
  //       const errorMsg = `Payment failed: ${response.error.description || response.error.reason}`;
  //       setError(errorMsg);
  //       setSnackbar({
  //         open: true,
  //         message: errorMsg,
  //         severity: 'error'
  //       });
  //     });
      
  //     rzp.open();
  //   } catch (error) {
  //     console.error('Error opening live Razorpay:', error);
  //     const errorMsg = 'Failed to open payment gateway: ' + error.message;
  //     setError(errorMsg);
  //     setSnackbar({
  //       open: true,
  //       message: errorMsg,
  //       severity: 'error'
  //     });
  //   }
  // };

  const verifyPayment = async (paymentResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        environment: 'live'
      };
      
      console.log('Verifying live payment:', payload);
      
      const response = await axios.post(
        'http://localhost:5043/payments/verify',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Live verification response:', response.data);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setPaymentResult(response.data.data);
        setSnackbar({
          open: true,
          message: '✅ Payment successful and verified!',
          severity: 'success'
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Live payment verification error:', error);
      const errorMsg = 'Payment verification failed: ' + 
        (error.response?.data?.message || error.message);
      setError(errorMsg);
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLivePayment = async () => {
    try {
      // Confirm live payment
      const confirmed = window.confirm(
        '⚠️ LIVE PAYMENT WARNING!\n\n' +
        'You are about to make a REAL payment.\n' +
        `Amount: ₹${paymentData.amount}\n\n` +
        '• Real money will be charged\n' +
        '• Use real credit/debit cards only\n' +
        '• Test cards will NOT work\n\n' +
        'Are you sure you want to proceed?'
      );
      
      if (!confirmed) {
        setSnackbar({
          open: true,
          message: 'Payment cancelled',
          severity: 'info'
        });
        return;
      }
      
      const orderData = await createOrder();
      if (orderData) {
        await openRazorpayCheckout(orderData);
      }
    } catch (error) {
      console.log('Live payment flow error:', error);
    }
  };

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5043/payments/health');
      
      if (response.data.status === 'ok') {
        setSnackbar({
          open: true,
          message: '✅ Backend is connected and running',
          severity: 'success'
        });
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: '❌ Backend connection failed: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h5" gutterBottom align="center">
            ⚠️ LIVE PAYMENT TESTING
          </Typography>
          <Typography variant="body2" align="center">
            Real money transactions only. Use real credit/debit cards.
          </Typography>
        </Paper>

        {/* Status Card */}
        <Card sx={{ mb: 3, border: '2px solid', 
          borderColor: backendStatus?.status === 'ok' ? 'success.main' : 'error.main' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Security color={backendStatus?.status === 'ok' ? 'success' : 'error'} />
              </Grid>
              <Grid item xs>
                <Typography variant="h6">
                  Backend Status: {backendStatus?.status === 'ok' ? '✅ Connected' : '❌ Disconnected'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {backendStatus?.message || 'Checking backend connection...'}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={testBackendConnection}
                  disabled={loading}
                >
                  Test Connection
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            ⚠️ IMPORTANT LIVE PAYMENT WARNINGS
          </Typography>
          <Typography variant="body2">
            • This is a REAL payment gateway using production keys
          </Typography>
          <Typography variant="body2">
            • Real money will be charged to your card
          </Typography>
          <Typography variant="body2">
            • Minimum amount: ₹1 (for live testing)
          </Typography>
          <Typography variant="body2">
            • Test cards (4111 1111 1111 1111) will NOT work
          </Typography>
          <Typography variant="body2">
            • Use only real credit/debit cards that you own
          </Typography>
        </Alert>

        {/* Payment Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Live Payment Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="User ID"
                value={paymentData.userId}
                onChange={handleInputChange('userId')}
                size="small"
              >
                <MenuItem value="7010019846">Customer (7010019846)</MenuItem>
                <MenuItem value="live_user_001">Live User 001</MenuItem>
                <MenuItem value="live_user_002">Live User 002</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Payment Type"
                value={paymentData.paymentFor}
                onChange={handleInputChange('paymentFor')}
                size="small"
              >
                <MenuItem value="internet_recharge">Internet Recharge</MenuItem>
                <MenuItem value="smart_bytes">Smart Bytes</MenuItem>
                <MenuItem value="bill_payment">Bill Payment</MenuItem>
                <MenuItem value="plan_renewal">Plan Renewal</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={paymentData.amount}
                onChange={handleInputChange('amount')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 1, step: 1 }
                }}
                size="small"
                helperText="Minimum ₹1 for live payments"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service ID"
                value={paymentData.serviceId}
                onChange={handleInputChange('serviceId')}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={paymentData.description}
                onChange={handleInputChange('description')}
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="success"
              onClick={handleLivePayment}
              disabled={loading || paymentData.amount < 1}
              startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {loading ? 'Processing...' : `Make Live Payment (₹${paymentData.amount})`}
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/test-payment')}
              startIcon={<Receipt />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Back to Test Mode
            </Button>
          </Grid>
        </Grid>

        {/* Success/Error Display */}
        {success && paymentResult && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            <Typography variant="subtitle2">✅ LIVE PAYMENT SUCCESSFUL!</Typography>
            <Typography variant="body2">
              Transaction ID: {paymentResult.payment_id}
            </Typography>
            <Typography variant="body2">
              Amount: ₹{paymentData.amount} | Status: {paymentResult.status}
            </Typography>
          </Alert>
        )}

        {/* Debug Info */}
        <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Live Environment Details:</strong><br />
            • Backend URL: http://localhost:5043<br />
            • Razorpay Mode: LIVE (Production)<br />
            • Razorpay Key: {LIVE_RAZORPAY_KEY.substring(0, 15)}...<br />
            • User ID: {paymentData.userId}<br />
            • Minimum Amount: ₹2.00<br />
            {order && `• Order ID: ${order.order_id}`}
          </Typography>
        </Paper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default LivePaymentTest;