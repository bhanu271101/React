import React, { useState } from "react";
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
  Paper
} from "@mui/material";

const AddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
    isDefault: false,
  });

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

    try {
      const response = await axios.post(
        `${User}/addNewAddress`,
        {
          ...formData,
          phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/changeaddress", {
        state: {
          ...location.state,
          newAddress: response.data,
          message: "Address added successfully!",
        },
      });
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
      <Container maxWidth="sm">
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
            Add New Address
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Address"}
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
