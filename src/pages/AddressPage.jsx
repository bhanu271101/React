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
  Card,
  CardContent,
  CardMedia,
  Stack,
  Divider
} from "@mui/material";

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
    isDefault: true, // Default to true since this is often required for checkout
  });

  // Initialize state from location
  useEffect(() => {
    if (location.state) {
      // Handle both single product (from PDP) and multiple products (from Cart)
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
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.userName || !formData.phoneNumber || !formData.pincode) {
      setError("Please fill all required fields");
      setLoading(false);
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
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 3, color: "#4527a0" }}>
            {products.length > 0 ? "Confirm Your Order" : "Add New Address"}
          </Typography>

          {/* Display product summary if coming from PDP or Cart */}
          {products.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>
              {fromCart ? (
                <Stack spacing={2}>
                  {products.map((product, index) => (
                    <Card key={index} sx={{ display: 'flex', mb: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 100, objectFit: 'contain', p: 1 }}
                        image={product.image || "https://via.placeholder.com/100"}
                        alt={product.mobileName}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {product.mobileName}
                        </Typography>
                        <Typography variant="body2">
                          ₹{product.price.toLocaleString()} × {product.quantity}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ₹{(product.price * product.quantity).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card sx={{ display: 'flex', mb: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 150, objectFit: 'contain', p: 2 }}
                    image={products[0].image || "https://via.placeholder.com/150"}
                    alt={products[0].mobileName}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {products[0].mobileName}
                    </Typography>
                    <Typography variant="body1">
                      ₹{products[0].price.toLocaleString()}
                      {products[0].discount > 0 && (
                        <span style={{ color: 'green', marginLeft: '8px' }}>
                          ({products[0].discount}% OFF)
                        </span>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {products[0].quantity}
                    </Typography>
                  </CardContent>
                </Card>
              )}
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
            Shipping Address
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <TextField
              label="Full Name"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="House/Apartment Number"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Street Name"
              name="streetName"
              value={formData.streetName}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
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
              sx={{ mt: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Address & Continue"}
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
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AddressPage;