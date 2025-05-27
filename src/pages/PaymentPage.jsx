import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Button, Divider, Paper, Grid, Container,
  CircularProgress, Alert, Snackbar, Slide, FormControlLabel,
  Stack, Chip, RadioGroup, Radio, Avatar, Backdrop
} from '@mui/material';
import { ArrowBack, LocalShipping, CheckCircle } from '@mui/icons-material';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const User = import.meta.env.VITE_USER;
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        if (state?.fromCart) {
          setProducts(state.products || []);
          setProduct(null);
        } else {
          setProduct(state.product || null);
          setProducts([]);
        }

        if (state?.address) {
          setAddress(state.address);
        } else {
          const response = await axios.get(`${User}/getDefaultAddress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAddress(response.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No default address found. Please add an address.');
        } else {
          setError('Failed to load data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [User, Product, navigate, state]);

  const calculateOrderTotal = () => {
    if (state?.fromCart) {
      return products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    } else if (product) {
      return product.price * product.quantity;
    }
    return 0;
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!address) {
      setSnackbar({
        open: true,
        message: 'Please set a default address first',
        severity: 'error'
      });
      return;
    }

    setPlacingOrder(true);

    try {
      if (state?.fromCart) {
        const cartIds = products.map(item => item.id || item.cartItemId);
        const formData = new URLSearchParams();
        cartIds.forEach(id => formData.append('ids', id));
        
        await axios.post(
          `${Orders}/buyFromCart`,
          formData.toString(),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      } else {
        const orderData = {
          orderStatus: "Order placed",
          mobileId: product.mobileId,
          quantity: product.quantity,
          addressId: address.addressId,
          paymentMethod
        };
        await axios.post(
          `${Orders}/create`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      navigate('/thankyou', { 
        state: { 
          products: state?.fromCart ? products : [product],
          address,
          orderTotal: calculateOrderTotal(),
          paymentMethod
        } 
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to place order',
        severity: 'error'
      });
      setPlacingOrder(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangeAddress = () => {
    if (state?.fromCart) {
      navigate('/changeaddress', {
        state: {
          products: products,
          fromCart: true
        }
      });
    } else {
      navigate('/changeaddress', {
        state: {
          product: product,
          fromCart: false
        }
      });
    }
  };

  const getProductImage = (product) => {
    if (product.image) {
      if (product.image.startsWith("data:image")) {
        return product.image;
      }
      if (product.image.startsWith("http")) {
        return product.image;
      }
      return `data:image/jpeg;base64,${product.image}`;
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return "https://via.placeholder.com/60x60?text=Mobile";
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
          backgroundSize: "800% 800%",
          animation: "gradientShift 20s ease infinite",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/addaddress', { state })}
          sx={{ mr: 2 }}
        >
          Add Address
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const subtotal = calculateOrderTotal();
  const shipping = 0;
  const total = subtotal + shipping;
  const renderProducts = state?.fromCart ? products : product ? [product] : [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
        backgroundSize: "800% 800%",
        animation: "gradientShift 20s ease infinite",
        py: 4,
      }}
    >
      {/* Backdrop for placing order */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={placingOrder}
      >
        <CircularProgress color="inherit" size={70} thickness={4} />
        <Typography variant="h6" sx={{ ml: 3 }}>Placing your order...</Typography>
      </Backdrop>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(state?.fromCart ? '/cartpage' : -1)}
            sx={{
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {state?.fromCart ? 'Back to Cart' : 'Back to Product'}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShipping sx={{ color: '#43cea2', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
              Secure checkout
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Delivery Address */}
            <Paper elevation={3} sx={{
              p: 3,
              mb: 3,
              borderRadius: '18px',
              background: "rgba(255,255,255,0.93)",
              boxShadow: "0 8px 32px 0 rgba(101, 81, 255, 0.17)",
              backdropFilter: "blur(4.5px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#2d3436',
                pb: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CheckCircle sx={{ color: '#43cea2', mr: 1.5 }} />
                1. Delivery Address
              </Typography>
              {address ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    minWidth: 260,
                    flexGrow: 1,
                  }}>
                    <Typography variant="subtitle1" sx={{
                      fontWeight: 600,
                      color: '#222',
                      fontSize: '1.1rem'
                    }}>
                      {address.userName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                      {address.houseNumber}, {address.streetName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      {address.city}, {address.district}, {address.state} - {address.pincode}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
                      <strong>Phone:</strong> {address.phoneNumber}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      mt: { xs: 2, md: 0 },
                      borderColor: '#5e35b1',
                      color: '#5e35b1',
                      '&:hover': {
                        borderColor: '#4527a0',
                        backgroundColor: 'rgba(94, 53, 177, 0.04)'
                      }
                    }}
                    onClick={handleChangeAddress}
                  >
                    Change Address
                  </Button>
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No address found. Please add a delivery address.
                </Alert>
              )}
            </Paper>

            {/* Payment Method */}
            <Paper elevation={3} sx={{
              p: 3,
              borderRadius: '18px',
              background: "rgba(255,255,255,0.93)",
              boxShadow: "0 8px 32px 0 rgba(101, 81, 255, 0.17)",
              backdropFilter: "blur(4.5px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#2d3436',
                pb: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CheckCircle sx={{ color: '#43cea2', mr: 1.5 }} />
                2. Payment Method
              </Typography>
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel 
                  value="cod" 
                  control={<Radio color="primary" />} 
                  label={
                    <Typography sx={{ fontWeight: 500, color: '#2d3436' }}>
                      Cash on Delivery
                    </Typography>
                  } 
                />
              </RadioGroup>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{
              p: 3,
              position: { md: 'sticky' },
              top: { md: 20 },
              borderRadius: '18px',
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 16px 40px 0 rgba(101, 81, 255, 0.24)",
              border: "1px solid rgba(255,255,255,0.2)",
              minWidth: 320
            }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#2d3436',
                pb: 1,
                mb: 2
              }}>
                Order Summary
              </Typography>
              <Box sx={{ maxHeight: '240px', overflowY: 'auto', mb: 2 }}>
                {renderProducts.map((product, index) => (
                  <Paper key={index} elevation={0} sx={{
                    mb: 2,
                    p: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    background: "#f8f9fa"
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        src={getProductImage(product)}
                        alt={product.mobileName}
                        variant="rounded"
                        sx={{ width: 60, height: 60, bgcolor: "#e0e0e0" }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 600,
                          color: '#222',
                          mb: 0.5
                        }}>
                          {product.mobileName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                          <Chip label={`Qty: ${product.quantity}`} size="small" />
                          <Chip
                            label={`₹${(product.price * product.quantity).toLocaleString('en-IN')}`}
                            size="small"
                            color="primary"
                          />
                        </Stack>
                        {product.discount > 0 && (
                          <Chip 
                            label={`${product.discount}% OFF`} 
                            size="small" 
                            color="success" 
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Box>
              <Divider sx={{ my: 1, borderColor: '#e0e0e0' }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3436' }}>
                  Subtotal:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3436' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3436' }}>
                  Shipping:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3436' }}>
                  Free
                </Typography>
              </Stack>
              <Divider sx={{ my: 1, borderColor: '#e0e0e0' }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3436' }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3436' }}>
                  ₹{total.toLocaleString('en-IN')}
                </Typography>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={!address || placingOrder}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  borderRadius: "14px",
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  boxShadow: "0 4px 20px 0 rgba(101, 81, 255, 0.10)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(90deg, #5e35b1 0%, #4527a0 100%)"
                  },
                  "&:disabled": {
                    background: "#e0e0e0",
                    color: "#9e9e9e"
                  }
                }}
              >
                {placingOrder ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Place Order'
                )}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(101, 81, 255, 0.15)"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Box>
  );
};

export default PaymentPage;