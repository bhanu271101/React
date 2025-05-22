import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Divider,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const User = import.meta.env.VITE_USER;
  const Product = import.meta.env.VITE_PRODUCT;
  const Orders = import.meta.env.VITE_ORDERS;

  const navigate = useNavigate();
  const theme = useTheme();

  const handleCardClick = (id, image) => {
    navigate(`/product/${id}`, { state: { image } });
  };

  const formatAmazonDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const dateIST = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" });
      const nowIST = DateTime.now().setZone("Asia/Kolkata");
      const diffDays = Math.floor(nowIST.diff(dateIST, "days").days);
      const deliveryDate = dateIST.plus({ days: 3 });

      if (diffDays <= 7) {
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {diffDays === 0
                ? "Ordered today"
                : diffDays === 1
                ? "Ordered yesterday"
                : `Ordered ${diffDays} days ago`}{" "}
              at {dateIST.toFormat("hh:mm a")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Arriving {deliveryDate.toFormat("MMMM d")}
            </Typography>
          </Box>
        );
      }

      return (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Ordered on {dateIST.toFormat("MMMM d, yyyy")} at {dateIST.toFormat("hh:mm a")}
        </Typography>
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date not available";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const ordersResponse = await axios.get(`${Orders}/getAllOrders`, {
          headers: { Authorization: `Bearer ${token}` },
          
        });

         console.log("ordersResponse.data:", ordersResponse.data);
        const sortedOrders = ordersResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
       


        const mobileIds = [...new Set(sortedOrders.map(order => order.mobileId))];
        const imagesQuery = mobileIds.map(id => `mobileId=${id}`).join('&');
        const imagesResponse = await axios.get(`${Product}/imagesByIds?${imagesQuery}`);

        const newImagesMap = {};
        imagesResponse.data.forEach(image => {
          newImagesMap[image.id] = image.image;
        });
        setImagesMap(newImagesMap);
      } catch (error) {
        console.error("Error fetching orders:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { state: { message: "Session expired. Please log in again." } });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Delivered"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            icon={<CancelIcon />}
            label="Cancelled"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return (
          <Chip
            icon={<HourglassEmptyIcon />}
            label={status || "Processing"}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[100], // subtle light grey background
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            letterSpacing: 1,
            color: theme.palette.primary.main,
            mb: 5,
            textAlign: "center",
          }}
        >
          Your Orders
        </Typography>

        {orders.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: theme.palette.text.secondary }}>
              You haven't placed any orders yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/gallery")}
              sx={{
                px: 5,
                py: 1.5,
                fontWeight: "bold",
                boxShadow: theme.shadows[4],
                "&:hover": {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <>
            <Stack spacing={4}>
              {currentOrders.map((order) => {
                const imageSrc = imagesMap[order.mobileId]
                  ? `data:image/jpeg;base64,${imagesMap[order.mobileId]}`
                  : null;

                return (
                  <Card
                    key={order.orderId}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => handleCardClick(order.mobileId, imageSrc)}
                    elevation={4}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Box>{formatAmazonDate(order.createdAt)}</Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
                      >
                        Order # {order.orderId}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: "100%", md: 200 },
                          height: 200,
                          flexShrink: 0,
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                          boxShadow: theme.shadows[1],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {imageSrc ? (
                          <CardMedia
                            component="img"
                            image={imageSrc}
                            alt={`Product ${order.mobileId}`}
                            sx={{
                              width: "auto",
                              height: "auto",
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              transition: "opacity 0.3s ease",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No image available
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: "bold", mb: 1, color: theme.palette.text.primary }}
                        >
                          {order.mobileName || `Product ${order.mobileId}`}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Typography
                            variant="h6"
                            color={theme.palette.primary.main}
                            sx={{ fontWeight: "bold" }}
                          >
                            ₹{order.price?.toLocaleString("en-IN") || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            × {order.quantity}
                          </Typography>
                        </Box>

                        {getStatusChip(order.orderStatus)}

                        {order.address && (
                          <Typography
                            variant="body2"
                            paragraph
                            sx={{ mt: 2, color: theme.palette.text.secondary }}
                          >
                            <strong>Delivery Address:</strong>{" "}
                            {[order.address.houseNumber, order.address.streetName, order.address.city, order.address.state, order.address.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={2} mt={3}>
                          <Tooltip title="View detailed order information">
                            <Button
                              variant="outlined"
                              size="medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orderdetailspage/${order.orderId}`, {
                                  state: { order },
                                });
                              }}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                                borderColor: theme.palette.primary.main,
                                "&:hover": {
                                  backgroundColor: theme.palette.primary.light,
                                  borderColor: theme.palette.primary.dark,
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </Tooltip>

                          <Tooltip title="Buy this product again">
                            <Button
                              variant="contained"
                              size="medium"
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(order.mobileId, imageSrc);
                              }}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: "bold",
                                boxShadow: theme.shadows[3],
                                "&:hover": {
                                  boxShadow: theme.shadows[6],
                                },
                              }}
                            >
                              Buy Again
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Stack>

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={5}
              gap={3}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                sx={{
                  minWidth: 120,
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:disabled": {
                    borderColor: theme.palette.action.disabled,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                Previous
              </Button>
              <Typography
                variant="body1"
                align="center"
                sx={{ lineHeight: "36px", fontWeight: "bold", color: theme.palette.text.secondary }}
              >
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                sx={{
                  minWidth: 120,
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 2,
                  "&:disabled": {
                    borderColor: theme.palette.action.disabled,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default OrdersPage;
