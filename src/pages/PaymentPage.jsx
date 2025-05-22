import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Button, Divider, Paper, Grid, Container,
  CircularProgress, Alert, Snackbar, Slide, FormControlLabel,
  Card, CardContent, Stack, Chip, RadioGroup, Radio, Avatar
} from '@mui/material';
import {
  Payment, ArrowBack, LocalShipping,
  CreditCard, AccountBalanceWallet
} from '@mui/icons-material';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const isFromCart = Array.isArray(state?.products);
  const directBuyProduct = state?.product;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (state?.products) {
          setProducts(state.products);
        } else if (state?.product) {
          const response = await axios.get(`${Product}/product/getProductById/${state.product.mobileId}`);
          setProducts([{
            ...response.data,
            quantity: state.product.quantity || 1
          }]);
        } else {
          setError('No product specified.');
          setLoading(false);
          return;
        }

        if (state?.address) {
          setAddress(state.address);
        } else {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }
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
    try {
      if (isFromCart) {
        const cartIds = state.products.map(item => item.id);
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
          mobileId: products[0].mobileId,
          quantity: products[0].quantity,
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
      navigate('/thankyou', { state: { products, address } });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to place order',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading || !products.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
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
        <Button variant="contained" onClick={() => navigate('/addAddress')}>
          Add Address
        </Button>
      </Container>
    );
  }

  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const shipping = 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(isFromCart ? '/cartpage' : -1)}
            sx={{
              color: '#1976d2',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                textDecoration: 'underline'
              }
            }}
          >
            {isFromCart ? 'Back to Cart' : 'Back to Product'}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShipping sx={{ color: '#43cea2', mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
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
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
            }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#2d3436',
                pb: 1,
                mb: 2
              }}>
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
                      mt: { xs: 2, md: 0 }
                    }}
                    onClick={() => navigate('/changeaddress', {
                      state: {
                        products: isFromCart ? state.products : [state.product],
                        fromPayment: true,
                        originalState: state
                      }
                    })}
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
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
            }}>
              <Typography variant="h5" gutterBottom sx={{
                fontWeight: 'bold',
                color: '#2d3436',
                pb: 1,
                mb: 2
              }}>
                2. Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mt: 2 }}
              >
                <Paper elevation={0} sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  background: "#f8f9fa"
                }}>
                  <FormControlLabel
                    value="cod"
                    control={<Radio color="primary" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Payment sx={{ color: '#43cea2', mr: 1 }} />
                        <Typography sx={{ fontWeight: 600, color: '#222' }}>
                          Cash on Delivery (COD)
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="body2" sx={{ color: '#555', ml: 4 }}>
                    Pay when you receive your order
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  background: "#f8f9fa"
                }}>
                  <FormControlLabel
                    value="card"
                    control={<Radio color="primary" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard sx={{ color: '#43cea2', mr: 1 }} />
                        <Typography sx={{ fontWeight: 600, color: '#222' }}>
                          Credit/Debit Card
                        </Typography>
                      </Box>
                    }
                    disabled
                  />
                  <Typography variant="body2" sx={{ color: '#555', ml: 4 }}>
                    Coming soon
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  background: "#f8f9fa"
                }}>
                  <FormControlLabel
                    value="wallet"
                    control={<Radio color="primary" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWallet sx={{ color: '#43cea2', mr: 1 }} />
                        <Typography sx={{ fontWeight: 600, color: '#222' }}>
                          Digital Wallet
                        </Typography>
                      </Box>
                    }
                    disabled
                  />
                  <Typography variant="body2" sx={{ color: '#555', ml: 4 }}>
                    Coming soon
                  </Typography>
                </Paper>
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
              boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
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
                {products.map((product, index) => (
                  <Card key={index} elevation={0} sx={{
                    mb: 2,
                    p: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    background: "#f8f9fa"
                  }}>
                    <CardContent sx={{ p: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          src={product.imageUrl || "https://via.placeholder.com/60x60?text=Mobile"}
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
                          <Typography variant="caption" sx={{ color: '#43cea2', fontWeight: 500 }}>
                            In stock
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#555' }}>Subtotal:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#555' }}>Shipping:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#43cea2' }}>
                    FREE
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#555' }}>Tax (18% GST):</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ₹{tax.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3436' }}>
                    Order Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#B12704' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', mt: 1 }}>
                  Includes ₹{tax.toLocaleString('en-IN')} GST
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={!address}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  borderRadius: "14px",
                  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                  textTransform: "none",
                  boxShadow: "0 4px 20px 0 rgba(67,206,162,0.13)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                  }
                }}
              >
                Place Order
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
              boxShadow: "0 2px 8px rgba(67,206,162,0.15)"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PaymentPage;
