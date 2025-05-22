import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  CardMedia,
  Card,
  Grid,
  Chip,
  Divider,
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Alert,
  Snackbar
} from "@mui/material";
import {
  ArrowBack,
  LocalShipping,
  AssignmentReturn,
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Delete,
  Cancel,
  DoneAll
} from '@mui/icons-material';
import axios from "axios";
import { DateTime } from "luxon";

// Tracking Dialog Component
const TrackingDialog = ({ open, onClose, trackingId }) => {
  const theme = useTheme();
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTrackingDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" });
      return date.toFormat("EEE, MMM d, h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  useEffect(() => {
    const fetchTrackingEvents = async () => {
      try {
        const response = await axios.get(
          `http://192.168.0.200:8082/getAllTrackingEvents?trackingId=${trackingId}`
        );
        setTrackingEvents(response.data);
      } catch (error) {
        console.error("Error fetching tracking events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && trackingId) {
      fetchTrackingEvents();
    }
  }, [open, trackingId]);

  const getStatusIcon = (event, index) => {
    if (index === 0) {
      return <RadioButtonChecked color="primary" />;
    }
    return event.status ? <RadioButtonChecked color="primary" /> : <RadioButtonUnchecked />;
  };

  const getStatusText = (event) => {
    if (!event.status) return "Tracking information received";
    switch (event.status) {
      case "Accept":
        return `Package arrived at ${event.location} facility`;
      case "Send":
        return `Package departed from ${event.location} facility`;
      default:
        return event.status;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
        <Box display="flex" alignItems="center">
          <LocalShipping color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Track Package
          </Typography>
          <Button onClick={onClose} size="small" startIcon={<ArrowBack />}>
            Back to order
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ p: 2 }}>
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f7f7f7', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Tracking ID: {trackingId}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {trackingEvents.length > 0 
                    ? `Last update: ${formatTrackingDate(trackingEvents[0].timestamp)}`
                    : 'No tracking information available'}
                </Typography>
              </Box>
            </Box>

            <List sx={{ width: '100%' }}>
              {trackingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      {getStatusIcon(event, index)}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getStatusText(event)}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {formatTrackingDate(event.timestamp)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < trackingEvents.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 5 }} />
                  )}
                </React.Fragment>
              ))}
            </List>

            {trackingEvents.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No tracking information available yet
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, py: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Order Details Component
const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatAmazonDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const dateIST = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" });
      return dateIST.toFormat("MMMM d, yyyy 'at' hh:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date not available";
    }
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Fetch order details
        const orderResponse = await axios.get(`${import.meta.env.VITE_ORDERS}/${orderId}`);
        setOrder(orderResponse.data);

        // Fetch tracking details
        const trackingResponse = await axios.get(`http://192.168.0.200:8082/getTrackingDetails?orderId=${orderId}`);
        setEstimatedDelivery(trackingResponse.data.estmatedDeliveryTime);
        setDeliveryDate(trackingResponse.data.deliveryDate);
        setTrackingId(trackingResponse.data.trackingId);
        setOrderStatus(trackingResponse.data.orderStatus);

        // Fetch product images
        const imagesResponse = await axios.get(
          `${import.meta.env.VITE_PRODUCT}/imagesByIds?mobileId=${orderResponse.data.mobileId}`
        );
        if (imagesResponse.data.length > 0) {
          const images = imagesResponse.data.map(img => `data:image/jpeg;base64,${img.image}`);
          setProductImages(images);
        } else {
          setProductImages(orderResponse.data.imageUrl ? [orderResponse.data.imageUrl] : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_ORDERS}/deleteOrder?orderId=${orderId}`);
      setSnackbar({
        open: true,
        message: 'Order deleted successfully',
        severity: 'success'
      });
      setTimeout(() => navigate("/orderspage"), 1500);
    } catch (error) {
      console.error("Error deleting order:", error);
      setSnackbar({
        open: true,
        message: 'Failed to delete order. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Order not found.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate("/orderspage")}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  const isDelivered = orderStatus === "Delivered";
  const isCancelled = orderStatus === "Cancelled";
  const isReturned = orderStatus === "Retruned";

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/orderspage")}
        sx={{ 
          mb: 2, 
          textTransform: 'none',
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        Back to Orders
      </Button>

      {/* Order Header Section */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}>
            Order #{order.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {formatAmazonDate(order.orderDate || order.createdAt)}
          </Typography>
        </Box>
        {/* Only show Cancel Order button if order is not delivered, cancelled, or returned */}
        {!isDelivered && !isCancelled && !isReturned && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteConfirmOpen(true)}
            sx={{ 
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            Cancel Order
          </Button>
        )}
      </Box>

      {/* Order Status Card */}
      <Card sx={{ 
        p: 3, 
        mb: 4, 
        borderLeft: `4px solid ${
          isDelivered ? theme.palette.success.main : 
          isCancelled ? theme.palette.error.main :
          isReturned ? theme.palette.warning.main :
          theme.palette.primary.main
        }`,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {isDelivered ? (
            <DoneAll color="success" sx={{ mr: 1.5, fontSize: '28px' }} />
          ) : isCancelled ? (
            <Cancel color="error" sx={{ mr: 1.5, fontSize: '28px' }} />
          ) : isReturned ? (
            <AssignmentReturn color="warning" sx={{ mr: 1.5, fontSize: '28px' }} />
          ) : (
            <CheckCircle color="primary" sx={{ mr: 1.5, fontSize: '28px' }} />
          )}
          
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}>
              {isDelivered ? 'Delivered' : 
               isCancelled ? 'Cancelled' : 
               isReturned ? 'Returned' :
               orderStatus || 'Order Confirmed'}
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: isDelivered ? theme.palette.success.dark :
                     isCancelled ? theme.palette.error.dark :
                     isReturned ? theme.palette.warning.dark :
                     theme.palette.text.secondary,
              mt: 0.5
            }}>
              {isDelivered ? (
                `Delivered on ${deliveryDate ? formatAmazonDate(deliveryDate) : formatAmazonDate(estimatedDelivery)}`
              ) : isCancelled ? (
                `Cancelled on ${formatAmazonDate(estimatedDelivery)}`
              ) : isReturned ? (
                `Returned on ${formatAmazonDate(estimatedDelivery)}`
              ) : estimatedDelivery ? (
                `Expected delivery: ${formatAmazonDate(estimatedDelivery)}`
              ) : (
                "Delivery date will be updated soon"
              )}
            </Typography>
          </Box>
        </Box>

        {!isDelivered && !isCancelled && !isReturned && trackingId && (
          <Button
            variant="outlined"
            startIcon={<LocalShipping />}
            onClick={() => setTrackingDialogOpen(true)}
            sx={{
              mt: 2,
              textTransform: 'none',
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Track Package
          </Button>
        )}
      </Card>

      {/* Product Details Section */}
      <Grid container spacing={3}>
        {/* Product Images Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            p: 2, 
            height: '100%',
            borderRadius: '8px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {productImages.length > 0 ? (
              <>
                <CardMedia
                  component="img"
                  image={productImages[selectedImage]}
                  alt={order.mobileName}
                  sx={{
                    width: '100%', 
                    height: 300,
                    objectFit: 'contain',
                    mb: 2,
                    borderRadius: '4px'
                  }}
                />
                
                {/* Thumbnail Gallery */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  overflowX: 'auto',
                  py: 1,
                  '&::-webkit-scrollbar': {
                    height: '6px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.grey[400],
                    borderRadius: '3px'
                  }
                }}>
                  {productImages.map((img, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: selectedImage === index ? "0 2px 8px rgba(25, 118, 210, 0.18)" : undefined,
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
              </>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f7f7f7',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info Column */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            p: 3, 
            borderRadius: '8px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {order.mobileName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {order.description || "No description available."}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                  ₹{order.price?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quantity
                </Typography>
                <Chip label={order.quantity} color="primary" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₹{(order.price * order.quantity)?.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Shipping Address
            </Typography>
            <Typography variant="body2" sx={{ color: "#222", mb: 0.5 }}>
              {order.address?.userName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              {order.address?.houseNumber}, {order.address?.streetName}, {order.address?.city}, {order.address?.district}, {order.address?.state} - {order.address?.pincode}
            </Typography>
            <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
              Phone: {order.address?.phoneNumber}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Dialog */}
      <TrackingDialog
        open={trackingDialogOpen}
        onClose={() => setTrackingDialogOpen(false)}
        trackingId={trackingId}
      />

      {/* Snackbar */}
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
  );
};

export default OrderDetailsPage;
