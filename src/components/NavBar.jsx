import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { ShoppingCart, AccountCircle } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("username");
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Use proxy prefix for API calls
 const Orders = import.meta.env.VITE_ORDERS;

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!token) {
        setCartCount(0);
        return;
      }

      const url = `${Orders}/getCount`;
      console.log("Fetching cart count from:", url);

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (typeof response.data === "number") {
          setCartCount(response.data);
        } else {
          console.warn("Unexpected cart count response:", response.data);
          setCartCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [token, location.pathname]);

  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isHubPage = location.pathname === "/hubpage";

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    handleMenuClose();
    navigate("/");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#FFEB3B", color: "#000" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {isHomePage || isRegisterPage || isHubPage ? (
          <Typography variant="h6" sx={{ fontWeight: "bold", cursor: "default" }}>
            Mobile Store
          </Typography>
        ) : (
          <Typography
            variant="h6"
            component={Link}
            to="/welcome"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
          >
            Mobile Store
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!token && !isLoginPage && (
            <Button component={Link} to="/login" sx={{ color: "#000", fontWeight: "500" }}>
              Login
            </Button>
          )}

          {token && !isHubPage && (
            <>
              <Button component={Link} to="/orderspage" sx={{ color: "#000", fontWeight: "500" }}>
                Orders
              </Button>

              <IconButton component={Link} to="/cartpage" sx={{ color: "#000" }}>
                <Badge
                  badgeContent={cartCount > 0 ? cartCount : null}
                  color="error"
                  showZero={false}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </>
          )}

          {token && !isHubPage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handleMenuOpen} sx={{ color: "#000", p: 0 }}>
                <AccountCircle sx={{ fontSize: 28 }} />
              </IconButton>
              <Typography variant="body1" fontWeight={500}>
                {userName || "User"}
              </Typography>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
