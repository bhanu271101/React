import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Container,
  Button,
  Stack,
  Snackbar,
  Slide,
  Alert,
  Grid,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart,
  FlashOn,
  ArrowBack
} from '@mui/icons-material';

const PDP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productImage, setProductImage] = useState(state?.image);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addressLoading, setAddressLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const User = import.meta.env.VITE_USER;
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  // Mock product images gallery
  const productImages = [
    productImage || "https://via.placeholder.com/600x800?text=Product+Image",
    "https://via.placeholder.com/600x800?text=Side+View",
    "https://via.placeholder.com/600x800?text=Back+View",
    "https://via.placeholder.com/600x800?text=Detail+View"
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${Product}/product/getProductById/${id}`);
        setProduct(response.data);
        setProductImage(response.data.imageUrl || productImage);
      } catch (error) {
        console.error("Error fetching product data", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, productImage]);

  const checkDefaultAddress = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { 
        state: { 
          message: "Please log in to continue",
          from: window.location.pathname 
        } 
      });
      return null;
    }
  
    try {
      setAddressLoading(true);
      const response = await axios.get(`${User}/getDefaultAddress`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 401 || status === 404;
        }
      });
  
      if (response.status === 401) {
        throw new Error("SESSION_EXPIRED");
      }
      if (response.status === 404) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error("Error during fetching address:", error);
      if (error.message === "SESSION_EXPIRED" || 
          error.response?.status === 401 ||
          error.response?.data?.message?.includes("session expired")) {
        localStorage.removeItem("token");
        navigate("/login", { 
          state: { 
            message: "Your session has expired. Please log in again.",
            from: window.location.pathname
          } 
        });
        return null;
      }
      showSnackbar(
        error.response?.data?.message || "Failed to fetch address. Please try again.",
        "error"
      );
      return null;
    } finally {
      setAddressLoading(false);
    }
  };
  
  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { 
        state: { 
          message: "Please log in to continue",
          from: window.location.pathname
        } 
      });
      return;
    }
    try {
      const address = await checkDefaultAddress();
      if (address === null) {
        navigate("/addAddress", { 
          state: { 
            from: `/product/${id}`,
            message: "Please set a default address to complete your purchase",
            product: { 
              mobileId: id, 
              quantity: 1 
            }
          } 
        });
        return;
      }
      const productData = {
        mobileId: id,
        mobileName: product?.name || 'Product',
        price: product?.price || 0,
        quantity: 1,
        image: product?.images?.[0] || product?.imageUrl || '/default-product-image.jpg'
      };
      navigate("/payment", {
        state: {
          product: productData,
          address: address,
          from: window.location.pathname
        }
      });
    } catch (error) {
      console.error("Error during purchase:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { 
          state: { 
            message: "Your session expired during checkout. Please log in again.",
            from: window.location.pathname
          } 
        });
        return;
      }
      showSnackbar(
        error.response?.data?.message || "Failed to proceed to payment. Please try again.",
        "error"
      );
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `${Orders}/addToCart`,
        {
          mobileId: product.mobileId,
          mobileName: product.mobileName,
          quantity: quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar("Item added to cart!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { state: { message: "Session expired. Please log in again." } });
        return;
      }
      showSnackbar(
        error.response?.data?.message || "Failed to add item to cart. Please try again.",
        "error"
      );
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) return;
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          Product not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 2,
            fontWeight: 600,
            color: "#ff6f00",
            "&:hover": {
              background: "rgba(255,255,255,0.9)",
              color: "#ff9800"
            }
          }}
        >
          Back to Products
        </Button>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: "rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                backdropFilter: "blur(3px)"
              }}
            >
              <CardMedia
                component="img"
                image={productImages[selectedImage]}
                alt={product.mobileName}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 500,
                  objectFit: 'contain',
                  p: 2,
                  backgroundColor: '#f9f9f9'
                }}
              />
            </Card>
            
            {/* Thumbnail Gallery */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', py: 1 }}>
              {productImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    border: selectedImage === index ? `2.5px solid #ff9800` : '1px solid #ddd',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: selectedImage === index ? "0 4px 20px 0 rgba(255,152,0,0.22)" : undefined,
                    transition: "all 0.2s"
                  }}
                >
                  <CardMedia
                    component="img"
                    image={img}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: "#ff9800" }}>
                {product.mobileName}
              </Typography>
            </Box>
            <Box sx={{
              background: "rgba(255,255,255,0.85)",
              p: 3,
              borderRadius: 3,
              mb: 3,
              boxShadow: "0 4px 24px 0 rgba(255,152,0,0.08)"
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#333" }}>
                Product Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: "#333" }}>
                {product.description || 'No description available for this product.'}
              </Typography>
            </Box>

            <Box sx={{
              background: "rgba(255,255,255,0.90)",
              p: 3,
              borderRadius: 3,
              mb: 3,
              boxShadow: "0 2px 12px 0 rgba(255,152,0,0.06)"
            }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800", mb: 2 }}>
                ₹{product.price.toLocaleString()}
                {product.discount && (
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: 'error.main',
                      fontSize: '1rem',
                      ml: 1
                    }}
                  >
                    ({product.discount}% OFF)
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Inclusive of all taxes
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mr: 2, color: "#333" }}>
                  Quantity:
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  sx={{
                    minWidth: 36,
                    borderRadius: "50%",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#333",
                    borderColor: "#ccc",
                    "&:hover": {
                      borderColor: "#ff9800",
                      color: "#ff9800"
                    }
                  }}
                >
                  -
                </Button>
                <Typography variant="body1" sx={{ mx: 2, fontWeight: 600, fontSize: "1.1rem", color: "#333" }}>
                  {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  sx={{
                    minWidth: 36,
                    borderRadius: "50%",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#333",
                    borderColor: "#ccc",
                    "&:hover": {
                      borderColor: "#ff9800",
                      color: "#ff9800"
                    }
                  }}
                >
                  +
                </Button>
              </Box>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={addressLoading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                  borderRadius: "14px",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 20px 0 rgba(67,206,162,0.10)",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                  }
                }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<FlashOn />}
                onClick={handleBuyNow}
                disabled={addressLoading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: "14px",
                  fontSize: "1.1rem",
                  background: "linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)",
                  textTransform: "none",
                  boxShadow: "0 4px 20px 0 rgba(255,152,0,0.10)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #ff5e62 0%, #ff9966 100%)"
                  }
                }}
              >
                {addressLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Buy Now"
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{
              width: '100%',
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(255,152,0,0.10)"
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PDP;
