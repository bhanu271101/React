import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Stack,
  Checkbox,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const User = import.meta.env.VITE_USER;
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    return token;
  };

  const checkDefaultAddress = async () => {
    const token = getToken();
    if (!token) return false;

    try {
      setCheckingAddress(true);
      const response = await axios.get(`${User}/getDefaultAddress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error checking default address:", error);
      return null;
    } finally {
      setCheckingAddress(false);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [cartResponse, address] = await Promise.all([
          axios.get(`${Orders}/getAllCart`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          checkDefaultAddress()
        ]);

        const cartItemsData = cartResponse.data;
        setCartItems(cartItemsData);
        setSelectedItems(cartItemsData.map(item => item.id.toString()));

        // Only proceed with product details if there are items in cart
        if (cartItemsData.length > 0) {
          const productDetailsMap = {};
          const mobileIds = [];

          for (const item of cartItemsData) {
            const productRes = await axios.get(`${Product}/product/getProductById/${item.mobileId}`);
            productDetailsMap[item.mobileId] = productRes.data;
            mobileIds.push(item.mobileId);
          }

          if (mobileIds.length > 0) {
            const query = mobileIds.map(id => `mobileId=${id}`).join("&");
            const imageRes = await axios.get(`${Product}/imagesByIds?${query}`);

            const images = imageRes.data.reduce((acc, imageObj) => {
              acc[imageObj.id] = imageObj.image;
              return acc;
            }, {});

            const updatedProductDetails = { ...productDetailsMap };
            for (const id of mobileIds) {
              if (updatedProductDetails[id]) {
                updatedProductDetails[id].image = images[id] || null;
              }
            }
            setProductDetails(updatedProductDetails);
          }
        } else {
          setProductDetails({});
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { state: { message: "Session expired. Please log in again." } });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
    // eslint-disable-next-line
  }, []);

  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id.toString()))
      .reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  };

  const calculateTotalItems = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id.toString()))
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSelectionChange = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = (event) => {
    setSelectedItems(
      event.target.checked
        ? cartItems.map(item => item.id.toString())
        : []
    );
  };

  const handleBuyFromCart = async () => {
    if (selectedItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one item to purchase",
        severity: "warning"
      });
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const address = await checkDefaultAddress();
      if (!address) {
        navigate("/addaddress", {
          state: {
            from: "/cart",
            message: "Please add a default address to complete your purchase"
          }
        });
        return;
      }

      const selectedCartItems = cartItems
        .filter(item => selectedItems.includes(item.id.toString()))
        .map(item => ({
          ...item,
          mobileName: productDetails[item.mobileId]?.mobileName || "Product",
          price: item.amount,
          image: productDetails[item.mobileId]?.image || null,
          id: item.id
        }));

      navigate("/payment", {
        state: {
          products: selectedCartItems,
          address: address,
          fromCart: true
        }
      });

    } catch (error) {
      console.error("Error buying from cart:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { state: { message: "Session expired. Please log in again." } });
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/gallery");
  };

  const handleRemoveItem = async (itemId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(`${Orders}/deleteCartById`, {
        params: { cartId: itemId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId.toString()));
      setSnackbar({
        open: true,
        message: "Item removed from cart",
        severity: "success"
      });
    } catch (error) {
      console.error("Error removing item:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove item. Please try again.",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{
          mb: 3,
          fontWeight: 600,
          color: '#2E3B4E'
        }}>
          Your Shopping Cart
        </Typography>

        {cartItems.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueShopping}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                borderRadius: 2,
                '&:hover': {
                  background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                }
              }}
            >
              Browse Products
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              p: 3,
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 2,
              boxShadow: '0px 2px 8px rgba(67,206,162,0.10)'
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total: ₹{calculateSelectedTotal().toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'} selected
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBuyFromCart}
                  disabled={selectedItems.length === 0 || checkingAddress}
                  sx={{
                    minWidth: 180,
                    py: 1.5,
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    borderRadius: 2,
                    '&:hover': {
                      background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0'
                    }
                  }}
                >
                  {checkingAddress ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Checking...
                    </>
                  ) : "Proceed to Checkout"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleContinueShopping}
                  sx={{
                    minWidth: 180,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </Box>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < cartItems.length}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedItems.length === cartItems.length ? "Deselect All" : "Select All"}
                  </Typography>
                }
              />
            </FormControl>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4
            }}>
              {cartItems.map(item => {
                const product = productDetails[item.mobileId];
                if (!product) return null;

                return (
                  <Card key={item.id} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: "rgba(255,255,255,0.92)",
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <Checkbox
                        checked={selectedItems.includes(item.id.toString())}
                        onChange={() => handleSelectionChange(item.id.toString())}
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.mobileName}
                      </Typography>
                    </Box>

                    <CardMedia
                      component="img"
                      image={
                        product.image
                          ? (product.image.startsWith("data:image")
                            ? product.image
                            : `data:image/jpeg;base64,${product.image}`)
                          : "https://via.placeholder.com/300x300?text=No+Image"
                      }
                      alt={product.mobileName}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'contain',
                        p: 2
                      }}
                    />

                    <CardContent sx={{
                      p: 2,
                      borderTop: '1px solid #f0f0f0',
                      flexGrow: 1
                    }}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ₹{(item.amount * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>

                      {item.quantity > 1 && (
                        <Typography variant="body2" color="text.secondary">
                          (₹{item.amount.toLocaleString()} each)
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        sx={{
                          mt: 2,
                          textTransform: 'none'
                        }}
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove from Cart
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4
            }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleContinueShopping}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBuyFromCart}
                disabled={selectedItems.length === 0 || checkingAddress}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                  '&:hover': {
                    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0'
                  }
                }}
              >
                {checkingAddress ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Checking...
                  </>
                ) : "Proceed to Checkout"}
              </Button>
            </Box>
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CartPage;
