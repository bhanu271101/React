import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { ShoppingCart, FlashOn, ArrowBack, CheckCircle } from "@mui/icons-material";

const PDP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productImage, setProductImage] = useState(state?.image);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [cartDialogOpen, setCartDialogOpen] = useState(false);

  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;
  const User = import.meta.env.VITE_USER;

  const productImages = [
    productImage || "https://via.placeholder.com/600x800?text=Product+Image",
    "https://via.placeholder.com/600x800?text=Side+View",
    "https://via.placeholder.com/600x800?text=Back+View",
    "https://via.placeholder.com/600x800?text=Detail+View",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${Product}/product/getProductById/${id}`);
        setProduct(response.data);
        setProductImage(response.data.imageUrl || productImage);
      } catch {
        setSnackbarMessage("Error fetching product data");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, productImage]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const cartDTO = {
      mobileId: id,
      mobileName: product?.mobileName,
      quantity,
    };
    try {
      await axios.post(`${Orders}/addToCart`, cartDTO, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLastAddedProduct(product);
      setCartDialogOpen(true);
    } catch {
      setSnackbarMessage("Failed to add item to cart. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
const handleBuyNow = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  // Prepare product details consistently
  const productDetails = {
    mobileId: id,
    mobileName: product?.mobileName,
    price: product?.price,
    discount: product?.discount,
    description: product?.descreption,
    image: productImage || product?.imageUrl, // Fallback to product.imageUrl if productImage is null
    quantity,
    actionType: "buy", // This indicates it's a buy-now flow
  };

  try {
    // Attempt to get default address
    const addressRes = await axios.get(`${User}/getDefaultAddress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (addressRes.data) {
      // Address exists - go directly to payment
      navigate("/payment", { 
        state: { 
          product: productDetails, 
          address: addressRes.data 
        } 
      });
    } else {
      // No address - go to add address with product details
      navigate("/addaddress", { 
        state: { 
          product: productDetails,
          redirectTo: "/payment", // Tell addaddress where to go after saving
          requireAddress: true // Explicit flag that address is required
        } 
      });
    }
  } catch (error) {
    // API failed or no address - go to add address
    navigate("/addaddress", { 
      state: { 
        product: productDetails,
        redirectTo: "/payment",
        requireAddress: true
      } 
    });
  }
};

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    setQuantity(newQuantity);
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
        background: `linear-gradient(270deg, #667eea 0%, #764ba2 100%)`,
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
            color: "#5e35b1",
            "&:hover": {
              background: "rgba(255,255,255,0.9)",
              color: "#4527a0",
            },
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
                overflow: "hidden",
                background: "rgba(255,255,255,0.93)",
                boxShadow: "0 8px 32px 0 rgba(101, 81, 255, 0.17)",
                backdropFilter: "blur(3px)",
              }}
            >
              <CardMedia
                component="img"
                image={productImages[selectedImage]}
                alt={product.mobileName}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 500,
                  objectFit: "contain",
                  p: 2,
                  backgroundColor: "#f9f9f9",
                }}
              />
            </Card>
            <Box sx={{ display: "flex", gap: 2, mt: 2, overflowX: "auto", py: 1 }}>
              {productImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    border: selectedImage === index ? `2.5px solid #5e35b1` : "1px solid #ddd",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow:
                      selectedImage === index ? "0 4px 20px 0 rgba(101,81,255,0.22)" : undefined,
                    transition: "all 0.2s",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={img}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 1, color: "#4527a0", textShadow: "0 2px 16px #fff9" }}
              >
                {product.mobileName}
              </Typography>
            </Box>
            <Box
              sx={{
                background: "rgba(255,255,255,0.85)",
                p: 3,
                borderRadius: 3,
                mb: 3,
                boxShadow: "0 4px 24px 0 rgba(101,81,255,0.08)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#333" }}>
                Product Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: "#333" }}>
                {product.description || "No description available for this product."}
              </Typography>
            </Box>

            <Box
              sx={{
                background: "rgba(255,255,255,0.90)",
                p: 3,
                borderRadius: 3,
                mb: 3,
                boxShadow: "0 2px 12px 0 rgba(101,81,255,0.06)",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#5e35b1", mb: 2 }}>
                ₹{product.price?.toLocaleString()}
                {product.discount && (
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{
                      fontWeight: 500,
                      color: "error.main",
                      fontSize: "1rem",
                      ml: 1,
                    }}
                  >
                    ({product.discount}% OFF)
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Inclusive of all taxes
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
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
                      borderColor: "#5e35b1",
                      color: "#5e35b1",
                    },
                  }}
                >
                  -
                </Button>
                <Typography
                  variant="body1"
                  sx={{ mx: 2, fontWeight: 600, fontSize: "1.1rem", color: "#333" }}
                >
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
                      borderColor: "#5e35b1",
                      color: "#5e35b1",
                    },
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
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "14px",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 20px 0 rgba(101,81,255,0.10)",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #5e35b1 0%, #4527a0 100%)",
                  },
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
                    background: "linear-gradient(90deg, #ff5e62 0%, #ff9966 100%)",
                  },
                }}
              >
                Buy Now
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Cart Confirmation Dialog */}
        <Dialog
          open={cartDialogOpen}
          onClose={() => setCartDialogOpen(false)}
          aria-labelledby="cart-dialog-title"
          aria-describedby="cart-dialog-description"
          sx={{
            "& .MuiDialog-paper": {
              width: "100%",
              maxWidth: "400px",
              borderRadius: "16px",
              padding: "24px",
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              margin: 0,
            },
          }}
        >
          <DialogTitle
            id="cart-dialog-title"
            sx={{ p: 0, mb: 2, textAlign: "center" }}
          >
            <Stack alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: "#5e35b1", width: 48, height: 48 }}>
                <CheckCircle fontSize="large" sx={{ color: "#fff" }} />
              </Avatar>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4527a0" }}>
              Item Added to Cart
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0, mb: 2 }}>
            <DialogContentText id="cart-dialog-description" sx={{ textAlign: "center" }}>
              <b>{lastAddedProduct?.mobileName}</b> has been added to your cart.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 0, justifyContent: "space-between" }}>
            <Button
              onClick={() => setCartDialogOpen(false)}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setCartDialogOpen(false);
                navigate("/cartpage");
              }}
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              Go to Cart
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={(_, reason) => {
            if (reason !== "clickaway") setSnackbarOpen(false);
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PDP;
