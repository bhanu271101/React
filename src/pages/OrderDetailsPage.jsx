import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  CardMedia,
  Card,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  Delete,
  LocalShipping,
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  DoneAll,
  Cancel,
  AssignmentReturn,
} from "@mui/icons-material";
import axios from "axios";
import { DateTime } from "luxon";

const TrackingDialog = ({ open, onClose, trackingId }) => {
  const theme = useTheme();
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const Hub = import.meta.env.VITE_HUB;

  const formatTrackingDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" });
      return date.toFormat("EEE, MMM d, h:mm a");
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchTrackingEvents = async () => {
      try {
        const response = await axios.get(
          `${Hub}/getAllTrackingEvents?trackingId=${trackingId}`
        );
        setTrackingEvents(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching tracking events:", error);
        setTrackingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (open && trackingId) {
      fetchTrackingEvents();
    }
  }, [open, trackingId, Hub]);

  const getStatusIcon = (event, index) => {
    if (index === 0) {
      return <RadioButtonChecked color="primary" />;
    }
    return event.status ? (
      <RadioButtonChecked color="primary" />
    ) : (
      <RadioButtonUnchecked />
    );
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
            <Box sx={{ mb: 3, p: 2, backgroundColor: "#f7f7f7", borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Tracking ID: {trackingId}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircle color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {trackingEvents.length > 0
                    ? `Last update: ${formatTrackingDate(trackingEvents[0].timestamp)}`
                    : "No tracking information available"}
                </Typography>
              </Box>
            </Box>

            <List sx={{ width: "100%" }}>
              {trackingEvents.map((event, index) => (
                <React.Fragment key={event.id || index}>
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

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const Orders = import.meta.env.VITE_ORDERS;
  const Product = import.meta.env.VITE_PRODUCT;
  const Hub = import.meta.env.VITE_HUB;

  const formatAmazonDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const dateIST = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" });
      return dateIST.toFormat("MMMM d, yyyy 'at' hh:mm a");
    } catch {
      return "Date not available";
    }
  };

  useEffect(() => {
    const fetchOrderAndImageAndTracking = async () => {
      setLoading(true);
      try {
        // Get order data from location state or API
        let orderData = location.state?.order;
        if (!orderData) {
          const orderResponse = await axios.get(`${Orders}/${orderId}`);
          orderData = orderResponse.data;
        }
        setOrder(orderData);

        // Fetch image for this mobileId
        if (orderData?.mobileId) {
          const imagesResponse = await axios.get(
            `${Product}/imagesByIds?mobileId=${orderData.mobileId}`
          );
          const imageObj = Array.isArray(imagesResponse.data)
            ? imagesResponse.data.find((img) => img.id === orderData.mobileId)
            : null;
          if (imageObj && imageObj.image) {
            setImageSrc(`data:image/jpeg;base64,${imageObj.image}`);
          } else {
            setImageSrc(null);
          }
        }

        // Fetch tracking details
        try {
          const trackingResponse = await axios.get(
            `${Hub}/getTrackingDetails?orderId=${orderId}`
          );
          setEstimatedDelivery(trackingResponse.data.estmatedDeliveryTime || null);
          setTrackingId(trackingResponse.data.trackingId || null);
          setOrderStatus(trackingResponse.data.orderStatus || null);
        } catch (error) {
          console.error("Error fetching tracking details:", error);
          setEstimatedDelivery(null);
          setTrackingId(null);
          setOrderStatus(null);
        }
      } catch (error) {
        setOrder(null);
        setImageSrc(null);
        setEstimatedDelivery(null);
        setTrackingId(null);
        setOrderStatus(null);
        console.error("Error fetching order or image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndImageAndTracking();
  }, [orderId, Orders, Product, Hub, location.state]);

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`${Orders}/deleteOrder?orderId=${orderId}`);
      setSnackbar({
        open: true,
        message: "Order deleted successfully",
        severity: "success",
      });
      setTimeout(() => navigate("/orderspage"), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete order. Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
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
        <Button variant="contained" onClick={() => navigate("/orderspage")} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  const isDelivered = orderStatus === "Delivered";
  const isCancelled = orderStatus === "Cancelled";
  const isReturned = orderStatus === "Returned";
  const showCancelButton = !isCancelled && !isDelivered && !isReturned;
  const showTrackButton = trackingId && (isDelivered || (!isCancelled && !isReturned));

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/orderspage")}
        sx={{
          mb: 2,
          textTransform: "none",
        }}
      >
        Back to Orders
      </Button>

      <Card sx={{ p: 3, mb: 4, borderRadius: "8px" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Order #{order.orderId}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Placed on {formatAmazonDate(order.orderDate || order.createdAt)}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                width: "100%",
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {imageSrc ? (
                <CardMedia
                  component="img"
                  image={imageSrc}
                  alt={order.mobileName}
                  sx={{
                    width: "auto",
                    height: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {order.mobileName}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {order.description || "No description available."}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mt: 2 }}>
              ₹{order.price?.toLocaleString("en-IN") || "N/A"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Quantity: {order.quantity}
            </Typography>
            {order.address && (
              <Typography variant="body2" paragraph sx={{ mt: 2, color: "#555" }}>
                <strong>Delivery Address:</strong>{" "}
                {[order.address.houseNumber, order.address.streetName, order.address.city, order.address.state, order.address.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            )}

            {/* Order Status and Expected Delivery */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.grey[100],
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Order Status:{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDelivered
                      ? theme.palette.success.main
                      : isCancelled
                      ? theme.palette.error.main
                      : isReturned
                      ? theme.palette.warning.main
                      : theme.palette.text.primary,
                    fontWeight: 700,
                  }}
                >
                  {orderStatus || "Processing"}
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {estimatedDelivery
                  ? `Expected Delivery: ${formatAmazonDate(estimatedDelivery)}`
                  : "Expected delivery date not available"}
              </Typography>

              {/* Show Track Package button if trackingId exists and order is not cancelled or returned */}
              {showTrackButton && (
                <Button
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  onClick={() => setTrackingDialogOpen(true)}
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Track Package
                </Button>
              )}
            </Box>

            {/* Show Cancel Order button only if order is not already cancelled, delivered, or returned */}
            {showCancelButton && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteConfirmOpen(true)}
                sx={{
                  mt: 3,
                  textTransform: "none",
                }}
              >
                Cancel Order
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>No</Button>
          <Button color="error" onClick={handleDeleteOrder}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Dialog */}
      <TrackingDialog
        open={trackingDialogOpen}
        onClose={() => setTrackingDialogOpen(false)}
        trackingId={trackingId}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailsPage;