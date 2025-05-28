import React from "react";
import { Button, Box, Typography, Stack, Paper, Zoom } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ThankYou = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(true);
  }, []);

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

      <Zoom in={checked}>
        <Paper
          elevation={10}
          sx={{
            maxWidth: 480,
            p: 5,
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
            Order Placed Successfully!
          </Typography>

          <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your order. We're getting it ready to be shipped!
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
      </Zoom>
    </Box>
  );
};

export default ThankYou;
