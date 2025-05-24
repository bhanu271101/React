import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
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
        background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
        backgroundSize: "800% 800%",
        animation: "gradientShift 20s ease infinite",
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
          bgcolor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 4,
          py: 8,
          boxShadow: "0 8px 24px rgba(101, 81, 255, 0.3)",
          animation: "fadeInUp 1s ease forwards",
          opacity: 0,
          transform: "translateY(30px)",
        }}
      >
        <SmartphoneIcon
          sx={{
            fontSize: 100,
            color: "#5e35b1",
            mb: 3,
            transition: "transform 0.4s ease, color 0.4s ease",
            "&:hover": {
              color: "#311b92",
              transform: "scale(1.3) rotate(10deg)",
            },
            cursor: "pointer",
          }}
          onClick={handleClick}
          aria-label="Go to gallery"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleClick();
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", mb: 1, color: "#4527a0" }}
        >
          Welcome to Store
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ color: "#7e57c2", fontWeight: 500, mb: 4 }}
        >
          Explore our exclusive collection
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleClick}
          sx={{
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            color: "#fff",
            fontWeight: 600,
            px: 5,
            py: 1.5,
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(101, 81, 255, 0.4)",
            transition: "background 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #5e35b1, #4527a0)",
              boxShadow: "0 6px 20px rgba(101, 81, 255, 0.6)",
            },
          }}
          aria-label="Explore gallery"
        >
          Explore Gallery
        </Button>
      </Container>

      {/* Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default WelcomePage;
