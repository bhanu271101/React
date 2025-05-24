import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Container,
  Button,
  Chip,
  useTheme,
  Snackbar,
  Slide,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, CheckCircle } from "@mui/icons-material";

const Gallery = () => {
  const [products, setProducts] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  useEffect(() => {
    // Axios interceptor for 401 Unauthorized handling
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchProductsAndImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsResponse = await axios.get(`${Product}/product/getAllProducts`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        setProducts(productsResponse.data);

        const mobileIds = productsResponse.data.map(product => product.mobileId);
        const query = mobileIds.map(id => `mobileId=${id}`).join('&');
        const imagesResponse = await axios.get(`${Product}/imagesByIds?${query}`);

        if (imagesResponse.data) {
          const images = imagesResponse.data.reduce((acc, image) => {
            acc[image.id] = image.image;
            return acc;
          }, {});
          setImagesMap(images);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          setError("Failed to load products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductsAndImages();
  }, [Product]);

  const handleCardClick = (id, image) => {
    navigate(`/product/${id}`, { state: { image } });
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const cartDTO = {
      mobileId: product.mobileId,
      mobileName: product.mobileName,
      quantity: 1,
    };
    try {
      await axios.post(`${Orders}/addToCart`, cartDTO, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastAddedProduct(product);
      setCartDialogOpen(true);
    } catch (error) {
      if (error.response?.status !== 401) {
        showSnackbar("Failed to add item to cart. Please try again.", "error");
      }
    }
  };

  const handleContinueShopping = () => setCartDialogOpen(false);
  const handleGoToCart = () => {
    setCartDialogOpen(false);
    navigate("/cartpage");
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
          backgroundSize: "800% 800%",
          animation: "gradientShift 20s ease infinite",
        }}
      >
        <CircularProgress size={60} />
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
          backgroundSize: "800% 800%",
          animation: "gradientShift 20s ease infinite",
        }}
      >
        <Typography color="error" variant="h6">{error}</Typography>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(270deg, #667eea, #764ba2, #5e35b1, #4527a0)`,
        backgroundSize: "800% 800%",
        animation: "gradientShift 20s ease infinite",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
       <Typography
  variant="h3"
  component="h1"
  gutterBottom
  sx={{
    fontWeight: 'bold',
    textAlign: 'center',
    mb: 5,
    color: "#fff", // Pure white for best contrast
    letterSpacing: 1,
    textShadow: "0 2px 16px #4527a0, 0 1px 1px #2228" // Subtle purple and dark shadow for glow
  }}
>
  Our Latest Collection
</Typography>


        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, minmax(250px, 320px))' },
          gap: 4,
          justifyContent: 'center',
          width: '100%'
        }}>
          {products.map((product) => (
            <Card
              key={product.mobileId}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                borderRadius: '22px',
                overflow: 'hidden',
                height: '100%',
                maxWidth: 320,
                background: "rgba(255,255,255,0.93)",
                boxShadow: "0 8px 32px 0 rgba(101, 81, 255, 0.17)",
                backdropFilter: "blur(4.5px)",
                border: "1px solid rgba(255,255,255,0.15)",
                "&:hover": {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: "0 16px 40px 0 rgba(101, 81, 255, 0.24)"
                }
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: 220,
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: "hidden"
                }}
                onClick={() => handleCardClick(
                  product.mobileId,
                  imagesMap[product.mobileId]
                    ? `data:image/jpeg;base64,${imagesMap[product.mobileId]}`
                    : 'https://via.placeholder.com/400x300?text=No+Image'
                )}
              >
                <CardMedia
                  component="img"
                  sx={{
                    maxWidth: '85%',
                    maxHeight: '85%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'scale-down',
                    transition: "transform 0.4s cubic-bezier(.25,.8,.25,1)",
                    "&:hover": { transform: "scale(1.08)" }
                  }}
                  image={imagesMap[product.mobileId]
                    ? `data:image/jpeg;base64,${imagesMap[product.mobileId]}`
                    : 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.mobileName}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="subtitle1" component="h2" sx={{
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontSize: '1.08rem',
                  mb: 1,
                  color: "#4527a0"
                }}>
                  {product.mobileName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    color: "#5e35b1",
                    fontSize: '1.13rem'
                  }}>
                    ₹{product.price.toLocaleString()}
                  </Typography>
                  {product.discount && (
                    <Chip
                      label={`${product.discount}% OFF`}
                      color="error"
                      size="small"
                      sx={{ ml: 1, fontSize: '0.8rem', fontWeight: 500 }}
                    />
                  )}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={() => handleAddToCart(product)}
                  sx={{
                    textTransform: 'none',
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 1.2,
                    borderRadius: "14px",
                    boxShadow: "0 4px 20px 0 rgba(101, 81, 255, 0.10)",
                    color: "#fff",
                    "&:hover": {
                      background: "linear-gradient(90deg, #5e35b1 0%, #4527a0 100%)"
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Cart Confirmation Dialog */}
        <Dialog
          open={cartDialogOpen}
          onClose={handleContinueShopping}
          aria-labelledby="cart-dialog-title"
          aria-describedby="cart-dialog-description"
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '400px',
              borderRadius: '16px',
              padding: '24px',
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              margin: 0
            }
          }}
        >
          <DialogTitle id="cart-dialog-title" sx={{ p: 0, mb: 2, textAlign: "center" }}>
            <Stack alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#5e35b1", width: 48, height: 48 }}>
                <CheckCircle fontSize="large" sx={{ color: "#fff" }} />
              </Avatar>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: "#4527a0" }}>
              Item Added to Cart
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0, mb: 2 }}>
            <DialogContentText id="cart-dialog-description" sx={{ textAlign: "center" }}>
              <b>{lastAddedProduct?.mobileName}</b> has been added to your cart.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 0, justifyContent: 'space-between' }}>
            <Button
              onClick={handleContinueShopping}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1
              }}
            >
              Continue Shopping
            </Button>
            <Button
              onClick={handleGoToCart}
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                fontWeight: 600,
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(90deg, #5e35b1 0%, #4527a0 100%)"
                }
              }}
            >
              Go to Cart
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for errors and messages */}
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
              boxShadow: "0 2px 8px rgba(101, 81, 255, 0.15)"
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
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

export default Gallery;
