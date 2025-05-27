import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, Radio, RadioGroup,
  FormControlLabel, Paper, Box, Divider, CircularProgress,
  Alert, Snackbar, Card, CardContent, Stack, Avatar, Chip,
  Backdrop
} from '@mui/material';
import { Add, ArrowBack, CheckCircle } from '@mui/icons-material';

const ChangeAddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [fromCart, setFromCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const User = import.meta.env.VITE_USER;
  const token = localStorage.getItem('token');

  // Initialize product data from location state
  useEffect(() => {
    if (location.state) {
      if (location.state.fromCart) {
        setProducts(location.state.products || []);
        setFromCart(true);
      } else {
        setProduct(location.state.product || null);
        setFromCart(false);
      }
    }
  }, [location.state]);

  // Robust image handling function - same as PaymentPage
  const getProductImage = (product) => {
    if (product.image) {
      if (product.image.startsWith("data:image")) {
        return product.image;
      }
      // If it's already a URL (starts with http), use as is
      if (product.image.startsWith("http")) {
        return product.image;
      }
      // Otherwise, treat as base64 string
      return `data:image/jpeg;base64,${product.image}`;
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return "https://via.placeholder.com/60x60?text=Mobile";
  };

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get(`${User}/getAllAddresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allAddresses = location.state?.newAddress
          ? [...response.data, location.state.newAddress]
          : response.data;

        setAddresses(allAddresses);

        const defaultAddress = allAddresses.find(addr =>
          location.state?.newAddress
            ? addr.addressId === location.state.newAddress.addressId
            : addr.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress.addressId);
        }
      } catch (err) {
        setError('Failed to load addresses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [User, navigate, token, location.state]);

  const setDefaultAddress = async (addressId) => {
    try {
      const params = new URLSearchParams();
      params.append('addressId', addressId);

      await axios.post(
        `${User}/setDefaultAddress`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      setSnackbar({
        open: true,
        message: 'Please select an address first',
        severity: 'warning'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // First set the selected address as default
      await setDefaultAddress(selectedAddress);

      // Then proceed to payment with the correct data structure
      const selectedAddr = addresses.find(addr => addr.addressId === selectedAddress);

      if (fromCart) {
        // Cart Flow - pass array of products
        navigate('/payment', {
          state: {
            products: products,
            address: selectedAddr,
            fromCart: true
          }
        });
      } else {
        // Buy Now Flow - pass single product and fromCart false
        navigate('/payment', {
          state: {
            product: product,
            address: selectedAddr,
            fromCart: false
          }
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to proceed to payment',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNewAddress = () => {
    navigate('/addaddress', {
      state: {
        ...location.state,
        redirectTo: '/changeaddress',
        requireAddress: true
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
        py: 4,
      }}
    >
      {/* Backdrop for processing */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isProcessing}
      >
        <CircularProgress color="inherit" size={70} thickness={4} />
        <Typography variant="h6" sx={{ ml: 3 }}>Processing...</Typography>
      </Backdrop>

      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: '#1976d2',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNewAddress}
            sx={{
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
              }
            }}
          >
            Add New Address
          </Button>
        </Box>

        {/* Order Summary Section - Updated to match PaymentPage style */}
        {(fromCart && products.length > 0) ? (
          <Paper elevation={3} sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '18px',
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Box sx={{ maxHeight: '240px', overflowY: 'auto' }}>
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
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        ) : product && (
          <Paper elevation={3} sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '18px',
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Card elevation={0} sx={{
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              background: "#f8f9fa"
            }}>
              <CardContent sx={{ p: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={getProductImage(product)}
                    alt={product.mobileName}
                    variant="rounded"
                    sx={{ width: 80, height: 80, bgcolor: "#e0e0e0" }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{
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
              </CardContent>
            </Card>
          </Paper>
        )}

        <Typography variant="h4" gutterBottom sx={{
          fontWeight: 'bold',
          mb: 3,
          color: '#2d3436'
        }}>
          Select Shipping Address
        </Typography>

        {addresses.length === 0 ? (
          <Paper elevation={3} sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: '18px',
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              No addresses found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              You haven't added any addresses yet. Please add an address to continue.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNewAddress}
              size="large"
              sx={{
                background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                }
              }}
            >
              Add Your First Address
            </Button>
          </Paper>
        ) : (
          <>
            <RadioGroup
              value={selectedAddress}
              onChange={handleAddressChange}
              sx={{ mb: 3 }}
            >
              {addresses.map((address) => (
                <Paper
                  key={address.addressId}
                  elevation={3}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderLeft: address.isDefault ? '6px solid #43cea2' : '6px solid #e0e0e0',
                    borderRadius: '18px',
                    background: "rgba(255,255,255,0.85)",
                    boxShadow: address.isDefault
                      ? "0 6px 24px 0 rgba(67,206,162,0.15)"
                      : "0 2px 8px 0 rgba(67,206,162,0.07)",
                    position: 'relative',
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  <FormControlLabel
                    value={address.addressId}
                    control={<Radio color="primary" />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#222" }}>
                            {address.userName}
                          </Typography>
                          {address.isDefault && (
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              ml: 2,
                              backgroundColor: '#e8f5e9',
                              px: 1,
                              borderRadius: 1
                            }}>
                              <CheckCircle sx={{
                                color: '#43cea2',
                                fontSize: '1rem',
                                mr: 0.5
                              }} />
                              <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                                Default
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ color: '#555', mt: 0.5 }}>
                          {address.houseNumber}, {address.streetName}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555' }}>
                          {address.city}, {address.district}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555' }}>
                          {address.state} - {address.pincode}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555', mt: 1 }}>
                          Phone: {address.phoneNumber}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      width: '100%',
                      alignItems: 'flex-start',
                      margin: 0
                    }}
                  />
                </Paper>
              ))}
            </RadioGroup>

            <Divider sx={{ my: 3 }} />

            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2
            }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNewAddress}
                sx={{
                  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                  }
                }}
              >
                Add New Address
              </Button>
              <Button
                variant="contained"
                onClick={handleProceedToPayment}
                disabled={!selectedAddress || isProcessing}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'action.disabled'
                  },
                  '&:hover': {
                    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </Box>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={(props) => <Slide {...props} direction="up" />}
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

export default ChangeAddressPage;