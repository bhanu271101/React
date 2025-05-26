import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Link,
  Stack,
  Alert,
  Collapse,
} from "@mui/material";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const User = import.meta.env.VITE_USER;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(`${User}/user/login`, {
        email,
        password,
      });

      const { userId, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user_id", userId);

      navigate("/gallery");
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        // Backend returned a response (error status)
        if (typeof err.response.data === "string") {
          // Plain string error message
          setError(err.response.data);
        } else if (err.response.data && err.response.data.message) {
          // JSON object with message field
          setError(err.response.data.message);
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else if (err.request) {
        // No response from server
        setError("No response from server. Please try again.");
      } else {
        // Other errors
        setError("Login error. Please try again.");
      }
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/register");
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
        {/* Optional Logo */}
        {/* <Box sx={{ mb: 3 }}>
          <img src="/logo192.png" alt="MobileStore Logo" width={64} />
        </Box> */}

        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#4527a0", fontWeight: 700 }}
        >
          Login
        </Typography>

        <Collapse in={!!error} sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
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
          />

          <TextField
            label="Password"
            id="password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
          >
            Login
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Link
            href="#"
            underline="hover"
            sx={{ fontSize: "0.875rem", color: "#4527a0", cursor: "pointer" }}
            onClick={(e) => e.preventDefault()}
          >
            Forgot password?
          </Link>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 4 }}
        >
          <Typography variant="body2" color="text.secondary">
            Don’t have an account?
          </Typography>
          <Button
            variant="text"
            onClick={handleSignUpRedirect}
            sx={{
              color: "#4527a0",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                textDecoration: "underline",
                backgroundColor: "transparent",
              },
            }}
          >
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default Login;
