import React, { useState, useEffect } from 'react';
import './myorders.css';
import { VIBECART_URI } from '../../../commoncomponents/service';
 
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${VIBECART_URI}/api/v1/vibe-cart/scm/orders/getAllOrders`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
 
        if (result.success && Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('There was a problem fetching your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
 
    fetchOrders();
  }, []);
 
  const handleOrderClick = (order) => {
    setActiveOrder(order);
  };
 
  if (loading) return <div className="loading">Loading your orders...</div>;
  if (error) return <div className="error">{error}</div>;
 
  return (
    <div className="my-orders-container">
      <div className="orders-list-container">
        <ul className="orders-list">
          {orders.map((order) => (
            <li
              key={order.orderId}
              className={`order-card ${activeOrder?.orderId === order.orderId ? 'active' : ''}`}
              onClick={() => handleOrderClick(order)}
            >
              <div className="order-header">
                <h3>Order #{order.orderId}</h3>
                <span>Total: ${order.totalAmount.toFixed(2)}</span>
                <span>Date: {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
               <span>Estimated Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
               })}</span>
 
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="order-details-container">
        {activeOrder ? (
          <table className="order-details-table">
            <thead>
              <tr>
                <th colSpan="2">Order Details - #{activeOrder.orderId}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="2">
                  <h6><b>Customer Details</b></h6>
                  <p>Name: {activeOrder.customer.customerName}</p>
                  <p>Email: {activeOrder.email}</p>
                  <p>Phone: {activeOrder.customer.phoneNumber}</p>
                  <p>Address: {activeOrder.customer.customerAddress}</p>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <h6><b>Order Items</b></h6>
                  {activeOrder.orderItems.length === 0 ? (
                    <p>No items in this order</p>
                  ) : (
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Item Image</th>
                          <th>Item Name</th>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrder.orderItems.map((item) => (
                          <tr key={item.orderItemId}>
                            <td>
                              <img src={item.imageUrl} alt={item.itemName} className="item-image" />
                            </td>
                            <td>{item.itemName}</td>
                            <td>{item.size}</td>
                            <td>{item.color}</td>
                            <td>{item.quantity}</td>
                            <td>${item.unitPrice.toFixed(2)}</td>
                            <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <p>Order Status: {activeOrder.orderStatus}</p>
                  <p>Payment Status: {activeOrder.paymentStatus}</p>
                  <p>Payment Method: {activeOrder.paymentMethod}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <h6><b>Shipping Address</b></h6>
                  <p>{activeOrder.shippingAddress.address}, {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zipcode}</p>
                  <p>Estimated Delivery: {new Date(activeOrder.estimatedDeliveryDate).toLocaleDateString('en-IN')}</p>
                </td>
                <td>
                  <h6><b>Billing Address</b></h6>
                  <p>{activeOrder.billingAddress.address}, {activeOrder.billingAddress.city}, {activeOrder.billingAddress.state} {activeOrder.billingAddress.zipcode}</p>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="select-order">Select an order to view details</p>
        )}
      </div>
    </div>
  );
};
 
export default MyOrders;
 