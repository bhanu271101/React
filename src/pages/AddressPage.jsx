import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Slide,
  Paper,
  Divider,
  Avatar,
  Chip,
  Stack,
  Backdrop,
  Grid
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

const AddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [products, setProducts] = useState([]);
  const [fromCart, setFromCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const User = import.meta.env.VITE_USER;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    houseNumber: "",
    streetName: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    userName: "",
    isDefault: true,
  });

  // Robust image handling function
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

  // Initialize state from location
  useEffect(() => {
    if (location.state) {
      if (location.state.product) {
        setProducts([location.state.product]);
      } else if (location.state.products) {
        setProducts(location.state.products);
        setFromCart(true);
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    // Basic validation
    if (!formData.userName || !formData.phoneNumber || !formData.pincode) {
      setError("Please fill all required fields");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post(
        `${User}/addNewAddress`,
        {
          ...formData,
          phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Determine where to navigate next
      const redirectTo = location.state?.redirectTo || "/payment";
      const requireAddress = location.state?.requireAddress || false;

      // Prepare navigation state
      const navState = {
        address: response.data,
        requireAddress,
        message: "Address added successfully!",
      };

      // Include product data if it exists
      if (products.length > 0) {
        if (fromCart) {
          navState.products = products;
          navState.fromCart = true;
        } else {
          navState.product = products[0];
        }
      }

      navigate(redirectTo, { state: navState });

    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address");
      setSnackbarMessage(err.response?.data?.message || "Failed to save address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
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
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: '18px',
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 8px 32px 0 rgba(67,206,162,0.10)",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: "bold", 
            mb: 3, 
            color: "#2d3436",
            borderBottom: '2px solid #43cea2',
            pb: 1
          }}>
            {products.length > 0 ? "Confirm Your Order" : "Add New Address"}
          </Typography>

          {/* Display product summary if coming from PDP or Cart */}
          {products.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600,
                color: '#2d3436',
                pb: 1
              }}>
                Order Summary
              </Typography>
              {fromCart ? (
                <Box sx={{ maxHeight: '240px', overflowY: 'auto', mb: 2 }}>
                  {products.map((product, index) => (
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
              ) : (
                <Paper elevation={0} sx={{
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  background: "#f8f9fa"
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={getProductImage(products[0])}
                      alt={products[0].mobileName}
                      variant="rounded"
                      sx={{ width: 80, height: 80, bgcolor: "#e0e0e0" }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        color: '#222',
                        mb: 0.5
                      }}>
                        {products[0].mobileName}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                        <Chip label={`Qty: ${products[0].quantity}`} size="small" />
                        <Chip
                          label={`₹${(products[0].price * products[0].quantity).toLocaleString('en-IN')}`}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                      {products[0].discount > 0 && (
                        <Chip 
                          label={`${products[0].discount}% OFF`} 
                          size="small" 
                          color="success" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Paper>
              )}
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            color: '#2d3436',
            pb: 1
          }}>
            Shipping Address
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="House/Apartment Number"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Street Name"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  name="isDefault"
                  color="primary"
                />
              }
              label="Set as default address"
              sx={{ mt: 2, mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isProcessing}
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
              {isProcessing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Address & Continue"
              )}
            </Button>
          </form>
        </Paper>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{
              width: "100%",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(67,206,162,0.15)"
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AddressPage;