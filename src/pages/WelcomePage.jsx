import React from "react";
import { Box, IconButton, Container, Typography } from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/gallery");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          textAlign: "center",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 3,
          py: 6,
          boxShadow: 3,
        }}
      >
        <IconButton
          onClick={handleClick}
          aria-label="Go to gallery"
          sx={{
            color: "#5e35b1",
            fontSize: 80,
            mb: 2,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              color: "#311b92",
              transform: "scale(1.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            },
          }}
        >
          <SmartphoneIcon fontSize="inherit" />
        </IconButton>

        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", mb: 1, color: "#4527a0" }}
        >
          Welcome to Store
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ color: "#7e57c2", fontWeight: 500 }}
        >
          Explore our exclusive collection
        </Typography>
      </Container>
    </Box>
  );
};

export default WelcomePage;
