import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Badge, Spinner, ListGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit } from 'react-icons/fa';

const statusOptions = ['Accept', 'Send', 'Out for delivery', 'Delivered'];
const finalStatusFlow = ['Ready for delivery', 'Out for delivery', 'Delivered'];

const OrderManagementDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    orderId: null,
    currentStatus: '',
    nextStatus: null,
    trackingId: null,
    trackingEvents: [],
    activeHub: null,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8082/getAllOrders');
      setOrders(response.data.map(item => item.orderDto));
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingDetails = async (orderId) => {
    try {
      const response = await axios.get('http://localhost:8082/getTrackingDetails', {
        params: { orderId },
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching tracking details:', err);
      setError('Failed to fetch tracking details.');
      return null;
    }
  };

  const fetchTrackingEvents = async (trackingId) => {
    try {
      const response = await axios.get('http://localhost:8082/getAllTrackingEvents', {
        params: { trackingId },
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching tracking events:', err);
      setError('Failed to fetch tracking events.');
      return [];
    }
  };

  const determineNextStatusAndActiveHub = (orderStatus, trackingEvents) => {
    const orderStatusLower = orderStatus.toLowerCase();

    if (finalStatusFlow.map(s => s.toLowerCase()).includes(orderStatusLower)) {
      const idx = finalStatusFlow.findIndex(s => s.toLowerCase() === orderStatusLower);
      if (idx === finalStatusFlow.length - 1) return { nextStatus: null, activeHub: null };
      return { nextStatus: finalStatusFlow[idx + 1], activeHub: null };
    }

    if (!trackingEvents || trackingEvents.length === 0) {
      return { nextStatus: 'Accept', activeHub: null };
    }

    // Get hubs in order of first occurrence
    const hubs = [];
    trackingEvents.forEach(ev => {
      if (!hubs.includes(ev.location)) {
        hubs.push(ev.location);
      }
    });

    // Iterate hubs in order, find first hub where Accept or Send missing
    for (const hub of hubs) {
      const eventsAtHub = trackingEvents.filter(ev => ev.location === hub);
      const hasAccept = eventsAtHub.some(ev => ev.status.toLowerCase() === 'accept');
      const hasSend = eventsAtHub.some(ev => ev.status.toLowerCase() === 'send');

      if (!hasAccept) {
        return { nextStatus: 'Accept', activeHub: hub };
      }
      if (!hasSend) {
        return { nextStatus: 'Send', activeHub: hub };
      }
    }

    // All hubs processed but order status not updated yet, wait for backend
    return { nextStatus: null, activeHub: hubs[hubs.length - 1] };
  };

  const openStatusModal = async (order) => {
    setError('');
    setModalLoading(true);
    try {
      const trackingDetails = await fetchTrackingDetails(order.orderId);
      if (!trackingDetails) throw new Error('No tracking details');
      const trackingEvents = await fetchTrackingEvents(trackingDetails.trackingId);

      const { nextStatus, activeHub } = determineNextStatusAndActiveHub(
        trackingDetails.orderStatus,
        trackingEvents
      );

      setCurrentOrder({
        orderId: order.orderId,
        currentStatus: trackingDetails.orderStatus,
        nextStatus,
        trackingId: trackingDetails.trackingId,
        trackingEvents,
        activeHub,
      });

      setSelectedStatus(nextStatus || ''); // Default to next logical status

      setShowModal(true);
    } catch (err) {
      setError('Failed to load tracking info.');
    } finally {
      setModalLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedStatus) {
      setError('Please select a status to update.');
      return;
    }
    setModalLoading(true);
    setError('');
    try {
      const requestData = {
        orderId: currentOrder.orderId,
        orderStatus: selectedStatus,
      };
      await axios.put('http://localhost:8082/updateOrderStatus', requestData);
      await loadOrders();
      await openStatusModal({ orderId: currentOrder.orderId });
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return 'secondary';
    switch (status.toLowerCase()) {
      case 'order placed':
        return 'primary';
      case 'accept':
        return 'info';
      case 'send':
        return 'warning';
      case 'ready for delivery':
        return 'secondary';
      case 'out for delivery':
        return 'danger';
      case 'delivered':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold" style={{ color: '#343a40' }}>
          Order Management Dashboard
        </h1>
        <p className="lead text-muted">Manage and update your orders seamlessly</p>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Orders</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover bordered striped className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Delivery Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId}>
                        <td className="fw-bold">{order.orderId}</td>
                        <td>{order.mobileName}</td>
                        <td>{formatPrice(order.price)}</td>
                        <td>{order.address.userName}</td>
                        <td>
                          <Badge pill bg={getStatusBadgeVariant(order.orderStatus)} className="fs-6">
                            {formatStatus(order.orderStatus)}
                          </Badge>
                        </td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'normal' }}>
                          {order.address.houseNumber}, {order.address.streetName},<br />
                          {order.address.city}, {order.address.district},<br />
                          {order.address.state} - {order.address.pincode}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openStatusModal(order)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FaEdit /> Update Status
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
            </div>
          ) : (
            <>
              <p>
                <strong>Current Status:</strong>{' '}
                <Badge pill bg={getStatusBadgeVariant(currentOrder.currentStatus)} className="fs-6">
                  {formatStatus(currentOrder.currentStatus)}
                </Badge>
              </p>

              <Form.Group controlId="statusSelect" className="mb-3">
                <Form.Label><strong>Select Status to Update</strong></Form.Label>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Select status"
                >
                  <option value="" disabled>
                    -- Select Status --
                  </option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <hr />

              <h6>Tracking History</h6>
              {currentOrder.trackingEvents.length === 0 ? (
                <p className="text-muted">No tracking events available.</p>
              ) : (
                <ListGroup variant="flush" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {currentOrder.trackingEvents.map((event) => (
                    <ListGroup.Item key={event.id}>
                      <strong>{formatStatus(event.status)}</strong> at <em>{event.location}</em> on{' '}
                      {new Date(event.timestamp).toLocaleString()}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={modalLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={updateOrderStatus}
            disabled={modalLoading || !selectedStatus}
          >
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagementDashboard;
