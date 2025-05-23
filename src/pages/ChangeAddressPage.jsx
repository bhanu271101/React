import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, Radio, RadioGroup,
  FormControlLabel, Paper, Box, Divider, CircularProgress,
  Alert, Snackbar
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

  const User = import.meta.env.VITE_USER;
  const token = localStorage.getItem('token');

  // Handle address selection change
  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  // Close snackbar
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
      setAddresses(response.data);

      // Select the new address if just added, else default
      if (location.state?.newAddress) {
        setSelectedAddress(location.state.newAddress.addressId);
      } else {
        const defaultAddress = response.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.addressId);
        }
      }
    } catch (err) {
      setError('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  fetchAddresses();
}, [User, navigate, token, location.state]);



  const handleSetDefaultAddress = async () => {
    if (!selectedAddress) {
      setSnackbar({
        open: true,
        message: 'Please select an address first',
        severity: 'warning'
      });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const addressId = Number(selectedAddress);
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
      // Navigate back to payment with original state + selected address
      navigate('/payment', {
        state: {
          ...location.state?.originalState,
          address: addresses.find(addr => addr.addressId === selectedAddress)
        }
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to set default address',
        severity: 'error'
      });
    }
  };

  const handleAddNewAddress = () => {
    navigate('/addaddress', {
      state: {
        from: '/changeaddress',
        originalState: location.state?.originalState
      }
    });
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
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
        background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: '#4527a0',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(69, 39, 160, 0.06)'
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

        <Typography variant="h4" gutterBottom sx={{
          fontWeight: 'bold',
          mb: 3,
          color: '#4527a0'
        }}>
          Your Addresses
        </Typography>

        {addresses.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
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
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.82)",
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
                onClick={handleSetDefaultAddress}
                disabled={!selectedAddress || addresses.find(addr => addr.addressId === selectedAddress)?.isDefault}
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
                Set as Default
              </Button>
            </Box>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ChangeAddressPage;
