import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  Collapse,
} from "@mui/material";
import axios from "axios";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const User = import.meta.env.VITE_USER; // Your backend base URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${User}/resetPassword`, {
        email: email.trim(),
      });

      // Assuming backend returns a success message string
      setSuccess(response.data || "Password reset instructions sent to your email.");
      setError(null);
    } catch (err) {
      console.error("Reset password error:", err);

      if (err.response && err.response.data) {
        // Handle backend error message (string or object)
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to reset password. Please try again.");
        }
      } else if (err.request) {
        setError("No response from server. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: 4,
          borderRadius: 3,
          boxShadow: 6,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#4527a0", fontWeight: 700 }}
        >
          Reset Password
        </Typography>

        <Collapse in={!!error} sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Collapse>

        <Collapse in={!!success} sx={{ mb: 2 }}>
          <Alert severity="success">{success}</Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            id="email"
            type="email"
            fullWidth
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            sx={{
              backgroundColor: "#f7f7f7",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#4527a0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4527a0",
                  boxShadow: "0 0 8px rgba(101, 78, 163, 0.4)",
                },
              },
            }}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: "#4527a0",
              padding: "0.75rem",
              fontWeight: 700,
              fontSize: "1rem",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: "#311b92",
              },
            }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
