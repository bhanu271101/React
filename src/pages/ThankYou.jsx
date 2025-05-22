import React from "react";
import { Button, Box, Typography, Stack, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CelebrationIcon from '@mui/icons-material/Celebration';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const ThankYou = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Confetti animation */}
      <Confetti width={width} height={height} recycle={false} numberOfPieces={150} />

      <Paper
        elevation={10}
        sx={{
          maxWidth: 480,
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          animation: "fadeInUp 0.8s ease forwards",
          "@keyframes fadeInUp": {
            "0%": { opacity: 0, transform: "translateY(30px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <CelebrationIcon color="primary" sx={{ fontSize: 60 }} />
        </Box>

        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
          Thank you for your order!
        </Typography>

        <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 4 }}>
          Your order has been placed successfully.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ListAltIcon />}
            size="large"
            onClick={() => navigate("/orderspage")}
            sx={{ px: 4, fontWeight: "bold" }}
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            size="large"
            onClick={() => navigate("/gallery")}
            sx={{ px: 4, fontWeight: "bold" }}
          >
            Continue Shopping
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ThankYou;
