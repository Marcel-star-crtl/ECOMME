// require('dotenv').config();
// const express = require('express');
// const asyncHandler = require("express-async-handler");
// const paypal = require("@paypal/checkout-server-sdk");
// const Order = require("../models/orderModel");
// const { paypalClient } = require("../config/paypalConfig");
// const crypto = require('crypto');
// const sendSMS = require('../utils/smsService');
// const axios = require('axios');

// // Helper function to calculate total amount
// const calculateTotalAmount = (cartItems) => {
//   return cartItems.reduce(
//     (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
//     0
//   ).toFixed(2);
// };

// // Helper function to generate a unique transaction reference
// const generateUniqueTransactionRef = () => {
//   return 'txn-' + Math.random().toString(36).substr(2, 9);
// };

// // Function to get authentication token from Tranzak
// const getToken = async () => {
//   try {
//     console.log('Attempting to get token with credentials:', {
//       appId: 'ap7nlsts1nkr69',
//       appKey: 'PROD_AD8AE6C44BE7491AAB4642DABBBB76CE'
//     });

//     const response = await axios.post('https://dsapi.tranzak.me/auth/token', {
//       appId: 'ap7nlsts1nkr69',
//       appKey: 'PROD_AD8AE6C44BE7491AAB4642DABBBB76CE'
//     }, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('Full Tranzak API response:', JSON.stringify(response.data, null, 2));

//     if (response.data && response.data.data && response.data.data.token) {
//       console.log('Retrieved token:', response.data.data.token);
//       return response.data.data.token;
//     } else {
//       throw new Error('Token not found in response: ' + JSON.stringify(response.data));
//     }
//   } catch (error) {
//     console.error('Error fetching token:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// // Function to initiate Mobile Money payment
// const initiateMobileMoneyPayment = async (amount, phoneNumber) => {
//   try {
//     const token = await getToken();
//     console.log('Using token:', token);
    
//     const response = await axios.post(
//       'https://dsapi.tranzak.me/xp021/v1/request/create',
//       {
//         amount: amount,
//         currencyCode: 'XAF',
//         description: 'Mobile Money Payment',
//         mchTransactionRef: generateUniqueTransactionRef(),
//         returnUrl: 'http://yourwebsite.com/payment-callback',
//         customerPhone: phoneNumber
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('Mobile Money API response:', JSON.stringify(response.data, null, 2));

//     if (response.data && response.data.success) {
//       return {
//         transactionId: response.data.data.requestId,
//         paymentAuthUrl: response.data.data.links.paymentAuthUrl
//       };
//     } else {
//       throw new Error(response.data.errorMsg || 'Failed to initiate payment');
//     }
//   } catch (error) {
//     console.error('Error initiating mobile money payment:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// // Controller to create an order
// const createOrder = asyncHandler(async (req, res) => {
//   try {
//     console.log('Received order creation request:', JSON.stringify(req.body, null, 2));

//     const { cartItems, userDetails, paymentMethod, totalPrice } = req.body;

//     if (!cartItems || !userDetails || !paymentMethod || !totalPrice) {
//       console.log('Invalid order data:', { cartItems, userDetails, paymentMethod, totalPrice });
//       return res.status(400).json({ message: "Invalid order data" });
//     }

//     let paymentIntent = "Cash on Delivery";
//     let paypalOrderId = null;
//     let mobileMoneyTransactionId = null;
//     let paymentAuthUrl = null;

//     if (paymentMethod === 'PayPal') {
//       try {
//         console.log('Creating PayPal order...');
//         const request = new paypal.orders.OrdersCreateRequest();
//         request.prefer("return=representation");
//         request.requestBody({
//           intent: 'CAPTURE',
//           purchase_units: [{
//             amount: {
//               currency_code: 'USD',
//               value: totalPrice.toString()
//             }
//           }]
//         });

//         const order = await paypalClient().execute(request);
//         console.log('PayPal order created:', order.result);
//         paypalOrderId = order.result.id;
//         paymentIntent = "PayPal";
//         paymentAuthUrl = `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`;
//       } catch (paypalError) {
//         console.error('PayPal order creation error:', paypalError);
//         return res.status(500).json({ message: "Failed to create PayPal order", error: paypalError.toString() });
//       }
//     } else if (paymentMethod === 'Mobile Money') {
//       try {
//         console.log('Initiating Mobile Money payment...');
//         const mobileMoneyResponse = await initiateMobileMoneyPayment(totalPrice, userDetails.phone);
//         mobileMoneyTransactionId = mobileMoneyResponse.transactionId;
//         paymentIntent = "Mobile Money";
//         paymentAuthUrl = mobileMoneyResponse.paymentAuthUrl;
//       } catch (mobileMoneyError) {
//         console.error('Mobile Money payment initiation error:', mobileMoneyError);
//         return res.status(500).json({ message: "Failed to initiate Mobile Money payment", error: mobileMoneyError.toString() });
//       }
//     }

//     const newOrder = new Order({
//       products: cartItems.map((cartItem) => ({
//         product: cartItem.item._id,
//         count: cartItem.quantity,
//         color: cartItem.color,
//       })),
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       orderby: req.user._id,
//       userDetails: {
//         email: userDetails.email,
//         lastName: userDetails.lastName,
//         address: userDetails.address,
//         suite: userDetails.suite,
//         city: userDetails.city,
//         country: userDetails.country,
//         phone: userDetails.phone,
//       },
//       orderStatus: 'Not Processed',
//       totalAmount: totalPrice,
//     });

//     console.log('Saving new order:', newOrder);
//     await newOrder.save();
//     console.log('Order saved successfully');

//     res.status(201).json({
//       orderId: newOrder._id,
//       clientId: process.env.PAYPAL_CLIENT_ID,
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       paymentAuthUrl,
//     });
//   } catch (error) {
//     console.error('Detailed error in createOrder:', error);
//     res.status(500).json({ message: 'Error creating order', error: error.toString() });
//   }
// });



// // Controller to update order status
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { orderId, status, dispatchedAt, expectedDeliveryAt } = req.body;

//   console.log('Received update request:', { orderId, status, dispatchedAt, expectedDeliveryAt });

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   if (!status) {
//     return res.status(400).json({ message: "Status is required" });
//   }

//   try {
//     const updateData = { orderStatus: status };

//     if (status === 'Dispatched') {
//       updateData.dispatchedAt = dispatchedAt || new Date();
//       updateData.expectedDeliveryAt = expectedDeliveryAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       updateData,
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ 
//       message: "Order status updated successfully", 
//       orderId: updatedOrder._id,
//       status: updatedOrder.orderStatus,
//       dispatchedAt: updatedOrder.dispatchedAt,
//       expectedDeliveryAt: updatedOrder.expectedDeliveryAt
//     });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ message: 'Error updating order status', error: error.toString() });
//   }
// });

// // Controller to capture PayPal order
// const captureOrder = asyncHandler(async (req, res) => {
//   const { orderId, paypalOrderId } = req.body;

//   if (!orderId || !paypalOrderId) {
//     return res.status(400).json({ message: "Invalid order data" });
//   }

//   try {
//     const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
//     request.requestBody({});

//     const capture = await paypalClient().execute(request);
    
//     // Update order status in the database
//     await Order.findByIdAndUpdate(orderId, { 
//       orderStatus: 'Processing',
//       paymentStatus: 'Paid'
//     });

//     res.status(200).json({ message: "Order captured successfully", captureId: capture.result.id });
//   } catch (error) {
//     console.error('Error capturing order:', error);
//     res.status(500).json({ message: 'Error capturing order', error: error.toString() });
//   }
// });

// const getOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ orderby: req.user._id })
//     .populate('products.product')
//     .lean();  

//   console.log("Orders being sent:", orders); 
//   res.json({ orders });
// });


// const getOrderByUserId = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const userOrders = await Order.find({ orderby: id })
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     res.json(userOrders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });




// // Controller to initiate order confirmation
// const initiateOrderConfirmation = asyncHandler(async (req, res) => {
//   console.log('Initiating order confirmation');
//   const { orderId } = req.body;
//   console.log('Order ID:', orderId);
  
//   try {
//     const order = await Order.findById(orderId);
//     console.log('Found order:', order);
//     if (!order || order.orderby.toString() !== req.user._id.toString()) {
//       console.log('Unauthorized access');
//       return res.status(403).json({ message: "Unauthorized" });
//     }
//     const confirmationCode = crypto.randomInt(100000, 999999).toString();
//     const codeExpiry = new Date(Date.now() + 15*60*1000); 
//     console.log('Generated confirmation code:', confirmationCode);
//     await Order.findByIdAndUpdate(orderId, {
//       confirmationCode,
//       codeExpiry
//     });
//     console.log('Order updated with confirmation code');
//     // Send SMS with the confirmation code
//     const smsSent = await sendSMS(order.userDetails.phone, confirmationCode);
//     console.log('SMS sent result:', smsSent);
//     if (smsSent) {
//       console.log('Confirmation code sent successfully');
//       res.status(200).json({ message: "Confirmation code sent" });
//     } else {
//       console.log('Failed to send confirmation code');
//       res.status(500).json({ message: "Failed to send confirmation code" });
//     }
//   } catch (error) {
//     console.error('Error in initiateOrderConfirmation:', error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// });



// // Controller to confirm order receipt
// // const confirmOrderReceipt = asyncHandler(async (req, res) => {
// //   const { orderId, confirmationCode } = req.body;

// //   const order = await Order.findById(orderId);

// //   if (!order || order.orderby.toString() !== req.user._id.toString()) {
// //     return res.status(403).json({ message: "Unauthorized" });
// //   }

// //   if (order.confirmationCode !== confirmationCode) {
// //     return res.status(400).json({ message: "Invalid confirmation code" });
// //   }

// //   if (new Date() > order.codeExpiry) {
// //     return res.status(400).json({ message: "Confirmation code expired" });
// //   }

// //   order.orderStatus = "Delivered";
// //   order.confirmationCode = undefined;
// //   order.codeExpiry = undefined;
// //   await order.save();

// //   res.status(200).json({ message: "Order receipt confirmed", order });
// // });

// const confirmOrderReceipt = asyncHandler(async (req, res) => {
//   const { orderId, confirmationCode } = req.body;
  
//   if (!orderId || !confirmationCode) {
//     return res.status(400).json({ message: "Order ID and confirmation code are required" });
//   }
  
//   try {
//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }
    
//     // Here you would typically validate the confirmation code
//     // For this example, we're assuming any code is valid
    
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { deliveryConfirmed: true, orderStatus: 'Delivered' },
//       { new: true }
//     );
    
//     res.status(200).json({ message: "Order marked as delivered", order: updatedOrder });
//   } catch (error) {
//     console.error('Error confirming delivery:', error);
//     res.status(500).json({ message: 'Error confirming delivery', error: error.toString() });
//   }
// });



// // Controller to handle mobile money callback
// const mobileMoneyCallback = asyncHandler(async (req, res) => {
//   const { transactionId, status } = req.body;

//   try {
//     const order = await Order.findOne({ mobileMoneyTransactionId: transactionId });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (status === 'SUCCESS') {
//       order.orderStatus = 'Processing';
//       order.paymentStatus = 'Paid';
//     } else {
//       order.orderStatus = 'Cancelled';
//       order.paymentStatus = 'Failed';
//     }

//     await order.save();

//     res.status(200).json({ message: "Mobile Money payment status updated" });
//   } catch (error) {
//     console.error('Error processing mobile money callback:', error);
//     res.status(500).json({ message: 'Error processing mobile money callback', error: error.toString() });
//   }
// });



// const getTotalIncome = asyncHandler(async (req, res) => {
//   try {
//     const totalIncome = await Order.aggregate([
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } }
//     ]);
    
//     res.json(totalIncome[0]?.total || 0);
//   } catch (error) {
//     console.error('Error calculating total income:', error);
//     res.status(500).json({ message: 'Error calculating total income', error: error.toString() });
//   }
// });

// const getSingleOrder = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   console.log(`Attempting to fetch order with ID: ${id}`);
//   try {
//     validateMongoDbId(id);
//     const order = await Order.findById(id)
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     if (!order) {
//       console.log(`Order not found for ID: ${id}`);
//       res.status(404);
//       throw new Error("Order not found");
//     }
//     console.log(`Successfully fetched order: ${JSON.stringify(order)}`);
//     res.json(order);
//   } catch (error) {
//     console.error(`Error fetching order: ${error.message}`);
//     res.status(500).json({ message: error.message });
//   }
// });

// const confirmDelivery = asyncHandler(async (req, res) => {
//   const { orderId } = req.body;
  
//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }
  
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { deliveryConfirmed: true, orderStatus: 'Delivered' },
//       { new: true }
//     );
    
//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }
    
//     res.status(200).json({ message: "Order marked as delivered", order: updatedOrder });
//   } catch (error) {
//     console.error('Error confirming delivery:', error);
//     res.status(500).json({ message: 'Error confirming delivery', error: error.toString() });
//   }
// });

// module.exports = { 
//   createOrder, 
//   updateOrderStatus, 
//   captureOrder, 
//   getOrders,
//   getOrderByUserId,
//   initiateOrderConfirmation,
//   confirmOrderReceipt,
//   initiateMobileMoneyPayment,
//   mobileMoneyCallback,
//   confirmDelivery,
//   getSingleOrder,
//   getTotalIncome
// };

















// // controller/orderController.js
// require('dotenv').config();
// const express = require('express');
// const asyncHandler = require("express-async-handler");
// const paypal = require("@paypal/checkout-server-sdk");
// const Order = require("../models/orderModel");
// const { paypalClient } = require("../config/paypalConfig");
// const crypto = require('crypto');
// const sendSMS = require('../utils/smsService');
// const axios = require('axios');

// // Helper function to calculate total amount
// const calculateTotalAmount = (cartItems) => {
//   return cartItems.reduce(
//     (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
//     0
//   ).toFixed(2);
// };

// // Helper function to generate a unique transaction reference
// const generateUniqueTransactionRef = () => {
//   return 'txn-' + Math.random().toString(36).substr(2, 9);
// };

// // Function to get authentication token from Tranzak
// // const getToken = async () => {
// //   try {
// //     const response = await axios.post('https://dsapi.tranzak.me/auth/token', {
// //       appId: 'ap7nlsts1nkr69',
// //       appKey: 'PROD_AD8AE6C44BE7491AAB4642DABBBB76CE'
// //     }, {
// //       headers: {
// //         'Content-Type': 'application/json'
// //       }
// //     });

// //     if (response.data && response.data.data && response.data.data.token) {
// //       return response.data.data.token;
// //     } else {
// //       throw new Error('Token not found in response: ' + JSON.stringify(response.data));
// //     }
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// // Function to initiate Mobile Money payment
// // const initiateMobileMoneyPayment = async (amount, phoneNumber) => {
// //   try {
// //     const token = await getToken();
    
// //     const response = await axios.post(
// //       'https://dsapi.tranzak.me/xp021/v1/request/create',
// //       {
// //         amount: amount,
// //         currencyCode: 'XAF',
// //         description: 'Mobile Money Payment',
// //         mchTransactionRef: generateUniqueTransactionRef(),
// //         returnUrl: 'http://yourwebsite.com/payment-callback',
// //         customerPhone: phoneNumber
// //       },
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       }
// //     );

// //     if (response.data && response.data.success) {
// //       return {
// //         transactionId: response.data.data.requestId,
// //         paymentAuthUrl: response.data.data.links.paymentAuthUrl
// //       };
// //     } else {
// //       throw new Error(response.data.errorMsg || 'Failed to initiate payment');
// //     }
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// // Controller to create an order
// const createOrder = asyncHandler(async (req, res) => {
//   try {
//     const { cartItems, userDetails, paymentMethod, totalPrice } = req.body;

//     if (!cartItems || !userDetails || !paymentMethod || !totalPrice) {
//       return res.status(400).json({ message: "Invalid order data" });
//     }

//     let paymentIntent = "Cash on Delivery";
//     let paypalOrderId = null;
//     let mobileMoneyTransactionId = null;
//     let paymentAuthUrl = null;

//     if (paymentMethod === 'PayPal') {
//       try {
//         const request = new paypal.orders.OrdersCreateRequest();
//         request.prefer("return=representation");
//         request.requestBody({
//           intent: 'CAPTURE',
//           purchase_units: [{
//             amount: {
//               currency_code: 'USD',
//               value: totalPrice.toString()
//             }
//           }]
//         });

//         const order = await paypalClient().execute(request);
//         paypalOrderId = order.result.id;
//         paymentIntent = "PayPal";
//         paymentAuthUrl = `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`;
//       } catch (paypalError) {
//         return res.status(500).json({ message: "Failed to create PayPal order", error: paypalError.toString() });
//       }
//     } else if (paymentMethod === 'Mobile Money') {
//       try {
//         const mobileMoneyResponse = await initiateMobileMoneyPayment(totalPrice, userDetails.phone);
//         mobileMoneyTransactionId = mobileMoneyResponse.transactionId;
//         paymentIntent = "Mobile Money";
//         paymentAuthUrl = mobileMoneyResponse.paymentAuthUrl;
//       } catch (mobileMoneyError) {
//         return res.status(500).json({ message: "Failed to initiate Mobile Money payment", error: mobileMoneyError.toString() });
//       }
//     }

//     const newOrder = new Order({
//       products: cartItems.map((cartItem) => ({
//         product: cartItem.item._id,
//         count: cartItem.quantity,
//         color: cartItem.color,
//       })),
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       orderby: req.user._id,
//       userDetails: {
//         email: userDetails.email,
//         name: userDetails.name,
//         address: userDetails.address,
//         postalCode: userDetails.postalCode,
//         city: userDetails.city,
//         country: userDetails.country,
//         phone: userDetails.phone,
//       },
//       orderStatus: 'Not Processed',
//       totalAmount: totalPrice,
//     });

//     await newOrder.save();

//     res.status(201).json({
//       orderId: newOrder._id,
//       clientId: process.env.PAYPAL_CLIENT_ID,
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       paymentAuthUrl,
//     });
//   } catch (error) {
//     console.error("Detailed error:", error);
//     res.status(500).json({ message: 'Error creating order', error: error.toString() });
//   }
// });


// // Controller to update order status
// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { orderId, status, dispatchedAt, expectedDeliveryAt } = req.body;

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   if (!status) {
//     return res.status(400).json({ message: "Status is required" });
//   }

//   try {
//     const updateData = { orderStatus: status };

//     if (status === 'Dispatched') {
//       updateData.dispatchedAt = dispatchedAt || new Date();
//       updateData.expectedDeliveryAt = expectedDeliveryAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       updateData,
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ 
//       message: "Order status updated successfully", 
//       orderId: updatedOrder._id,
//       status: updatedOrder.orderStatus,
//       dispatchedAt: updatedOrder.dispatchedAt,
//       expectedDeliveryAt: updatedOrder.expectedDeliveryAt
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating order status', error: error.toString() });
//   }
// });

// // Controller to capture PayPal order
// const captureOrder = asyncHandler(async (req, res) => {
//   const { orderId, paypalOrderId } = req.body;

//   if (!orderId || !paypalOrderId) {
//     return res.status(400).json({ message: "Invalid order data" });
//   }

//   try {
//     const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
//     request.requestBody({});

//     const capture = await paypalClient().execute(request);
    
//     // Update order status in the database
//     await Order.findByIdAndUpdate(orderId, { 
//       orderStatus: 'Processing',
//       paymentStatus: 'Paid'
//     });

//     res.status(200).json({ message: "Order captured successfully", captureId: capture.result.id });
//   } catch (error) {
//     res.status(500).json({ message: 'Error capturing order', error: error.toString() });
//   }
// });

// // Controller to get orders
// // const getOrders = asyncHandler(async (req, res) => {
// //   const { _id } = req.user;
// //   validateMongoDbId(_id);
// //   try {
// //     const userorders = await Order.find({ orderby: _id })  
// //       .populate("products.product")
// //       .populate("orderby")
// //       .exec();
// //     res.json({ orders: userorders });  
// //   } catch (error) {
// //     throw new Error(error);
// //   }
// // });


// const getOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ orderby: req.user._id })
//     .populate('products.product')
//     .lean();  

//   console.log("Orders being sent:", orders); 
//   res.json({ orders });
// });


// // Controller to get a single order by ID
// const getSingleOrder = asyncHandler(async (req, res) => {
//   const orderId = req.params.id;

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   try {
//     const order = await Order.findById(orderId).populate('products.product').exec();

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ order });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching order', error: error.toString() });
//   }
// });

// // Controller to confirm delivery
// const confirmDelivery = asyncHandler(async (req, res) => {
//   const { orderId } = req.body;

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { orderStatus: 'Delivered' },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ 
//       message: "Order marked as delivered", 
//       orderId: updatedOrder._id,
//       status: updatedOrder.orderStatus
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error confirming delivery', error: error.toString() });
//   }
// });

// // Controller to initiate order confirmation
// const initiateOrderConfirmation = asyncHandler(async (req, res) => {
//   const { orderId, phoneNumber, expectedDeliveryAt } = req.body;

//   if (!orderId || !phoneNumber || !expectedDeliveryAt) {
//     return res.status(400).json({ message: "Invalid data" });
//   }

//   try {
//     const message = `Dear customer, your order with ID: ${orderId} has been dispatched and is expected to be delivered on ${expectedDeliveryAt}. Please confirm receipt by replying to this message.`;

//     await sendSMS(phoneNumber, message);

//     res.status(200).json({ message: 'Order confirmation initiated', orderId });
//   } catch (error) {
//     res.status(500).json({ message: 'Error initiating order confirmation', error: error.toString() });
//   }
// });

// // Controller to confirm order receipt
// const confirmOrderReceipt = asyncHandler(async (req, res) => {
//   const { orderId, confirmed } = req.body;

//   if (!orderId || typeof confirmed === 'undefined') {
//     return res.status(400).json({ message: "Invalid data" });
//   }

//   try {
//     const updateData = confirmed ? { orderStatus: 'Received' } : { orderStatus: 'Delivery Failed' };

//     const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ 
//       message: `Order marked as ${confirmed ? 'received' : 'delivery failed'}`, 
//       orderId: updatedOrder._id,
//       status: updatedOrder.orderStatus
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error confirming order receipt', error: error.toString() });
//   }
// });

// // Controller for handling mobile money payment callback
// const mobileMoneyCallback = asyncHandler(async (req, res) => {
//   const { transactionId, status, message } = req.body;

//   if (!transactionId || !status) {
//     return res.status(400).json({ message: "Invalid data" });
//   }

//   try {
//     const order = await Order.findOne({ mobileMoneyTransactionId: transactionId });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     let updatedStatus = '';
//     let paymentStatus = '';

//     if (status === 'SUCCESSFUL') {
//       updatedStatus = 'Processing';
//       paymentStatus = 'Paid';
//     } else if (status === 'FAILED') {
//       updatedStatus = 'Failed';
//       paymentStatus = 'Failed';
//     } else {
//       updatedStatus = 'Pending';
//       paymentStatus = 'Pending';
//     }

//     order.orderStatus = updatedStatus;
//     order.paymentStatus = paymentStatus;
//     await order.save();

//     res.status(200).json({ message: "Order status updated", orderId: order._id, status: updatedStatus, paymentStatus });
//   } catch (error) {
//     res.status(500).json({ message: 'Error handling mobile money callback', error: error.toString() });
//   }
// });

// // Controller to get total income
// const getTotalIncome = asyncHandler(async (req, res) => {
//   try {
//     const orders = await Order.find({ orderStatus: 'Delivered' });

//     const totalIncome = orders.reduce((acc, order) => {
//       const totalAmount = calculateTotalAmount(order.cartItems);
//       return acc + parseFloat(totalAmount);
//     }, 0);

//     res.status(200).json({ totalIncome });
//   } catch (error) {
//     res.status(500).json({ message: 'Error calculating total income', error: error.toString() });
//   }
// });


// const getMonthlyIncome = asyncHandler(async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const monthlyIncome = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) },
//           orderStatus: 'Delivered'
//         }
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalAmount: { $sum: "$totalAmount" }
//         }
//       },
//       {
//         $sort: { _id: 1 }
//       }
//     ]);

//     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const formattedData = monthNames.map((month, index) => ({
//       type: month,
//       sales: monthlyIncome.find(item => item._id === index + 1)?.totalAmount || 0
//     }));

//     res.status(200).json(formattedData);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching monthly income', error: error.toString() });
//   }
// });




// module.exports = {
//   createOrder,
//   captureOrder,
//   getOrders,
//   updateOrderStatus,
//   initiateOrderConfirmation,
//   confirmOrderReceipt,
//   mobileMoneyCallback,
//   confirmDelivery,
//   getTotalIncome,
//   getSingleOrder,
//   getMonthlyIncome
// };












// controller/orderController.js
require('dotenv').config();
const express = require('express');
const asyncHandler = require("express-async-handler");
const paypal = require("@paypal/checkout-server-sdk");
const Order = require("../models/orderModel");
const { paypalClient } = require("../config/paypalConfig");
const crypto = require('crypto');
const sendSMS = require('../utils/smsService');
const axios = require('axios');
const socketManager = require("../socketManager");
const shortMongoId = require('short-mongo-id');

// Helper function to calculate total amount
const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0
  ).toFixed(2);
};

// Helper function to generate a unique transaction reference
const generateUniqueTransactionRef = () => {
  return 'txn-' + Math.random().toString(36).substr(2, 9);
};


// Controller to create an order
// const createOrder = asyncHandler(async (req, res) => {
//   try {
//     const { cartItems, userDetails, paymentMethod, totalPrice } = req.body;

//     if (!cartItems || !userDetails || !paymentMethod || !totalPrice) {
//       return res.status(400).json({ message: "Invalid order data" });
//     }

//     let paymentIntent = "Cash on Delivery";
//     let paypalOrderId = null;
//     let mobileMoneyTransactionId = null;
//     let paymentAuthUrl = null;

//     if (paymentMethod === 'PayPal') {
//       try {
//         const request = new paypal.orders.OrdersCreateRequest();
//         request.prefer("return=representation");
//         request.requestBody({
//           intent: 'CAPTURE',
//           purchase_units: [{
//             amount: {
//               currency_code: 'USD',
//               value: totalPrice.toString()
//             }
//           }]
//         });

//         const order = await paypalClient().execute(request);
//         paypalOrderId = order.result.id;
//         paymentIntent = "PayPal";
//         paymentAuthUrl = `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`;
//       } catch (paypalError) {
//         return res.status(500).json({ message: "Failed to create PayPal order", error: paypalError.toString() });
//       }
//     } else if (paymentMethod === 'Mobile Money') {
//       try {
//         const mobileMoneyResponse = await initiateMobileMoneyPayment(totalPrice, userDetails.phone);
//         mobileMoneyTransactionId = mobileMoneyResponse.transactionId;
//         paymentIntent = "Mobile Money";
//         paymentAuthUrl = mobileMoneyResponse.paymentAuthUrl;
//       } catch (mobileMoneyError) {
//         return res.status(500).json({ message: "Failed to initiate Mobile Money payment", error: mobileMoneyError.toString() });
//       }
//     }

//     const newOrder = new Order({
//       products: cartItems.map((cartItem) => ({
//         product: cartItem.item._id,
//         count: cartItem.quantity,
//         color: cartItem.color,
//       })),
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       orderby: req.user._id,
//       userDetails: {
//         email: userDetails.email,
//         name: userDetails.name,
//         address: userDetails.address,
//         postalCode: userDetails.postalCode,
//         city: userDetails.city,
//         country: userDetails.country,
//         phone: userDetails.phone,
//       },
//       orderStatus: 'Not Processed',
//       totalAmount: totalPrice,
//     });

//     await newOrder.save();

//     socketManager.emitNewOrder(newOrder._id, newOrder.orderStatus);

//     res.status(201).json({
//       orderId: newOrder._id,
//       clientId: process.env.PAYPAL_CLIENT_ID,
//       paymentIntent,
//       paypalOrderId,
//       mobileMoneyTransactionId,
//       paymentAuthUrl,
//     });
//   } catch (error) {
//     console.error("Detailed error:", error);
//     res.status(500).json({ message: 'Error creating order', error: error.toString() });
//   }
// });


// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { orderId, status, dispatchedAt, expectedDeliveryAt } = req.body;

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   if (!status) {
//     return res.status(400).json({ message: "Status is required" });
//   }

//   try {
//     const updateData = { orderStatus: status };

//     if (status === 'Dispatched') {
//       updateData.dispatchedAt = dispatchedAt || new Date();
//       updateData.expectedDeliveryAt = expectedDeliveryAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       updateData,
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const io = socketManager.getIO();
//     io.emit("orderStatusUpdate", { 
//       orderId: updatedOrder._id, 
//       status: updatedOrder.orderStatus,
//       dispatchedAt: updatedOrder.dispatchedAt,
//       expectedDeliveryAt: updatedOrder.expectedDeliveryAt
//     });

//     res.status(200).json({ 
//       message: "Order status updated successfully", 
//       orderId: updatedOrder._id,
//       status: updatedOrder.orderStatus,
//       dispatchedAt: updatedOrder.dispatchedAt,
//       expectedDeliveryAt: updatedOrder.expectedDeliveryAt
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating order status', error: error.toString() });
//   }
// });



const createOrder = asyncHandler(async (req, res) => {
  try {
    const { cartItems, userDetails, paymentMethod, totalPrice } = req.body;

    if (!cartItems || !userDetails || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    let paymentIntent = "Cash on Delivery";
    let paypalOrderId = null;
    let mobileMoneyTransactionId = null;
    let paymentAuthUrl = null;

    if (paymentMethod === 'PayPal') {
      try {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: totalPrice.toString()
            }
          }]
        });

        const order = await paypalClient().execute(request);
        paypalOrderId = order.result.id;
        paymentIntent = "PayPal";
        paymentAuthUrl = `https://www.paypal.com/checkoutnow?token=${paypalOrderId}`;
      } catch (paypalError) {
        return res.status(500).json({ message: "Failed to create PayPal order", error: paypalError.toString() });
      }
    } else if (paymentMethod === 'Mobile Money') {
      try {
        const mobileMoneyResponse = await initiateMobileMoneyPayment(totalPrice, userDetails.phone);
        mobileMoneyTransactionId = mobileMoneyResponse.transactionId;
        paymentIntent = "Mobile Money";
        paymentAuthUrl = mobileMoneyResponse.paymentAuthUrl;
      } catch (mobileMoneyError) {
        return res.status(500).json({ message: "Failed to initiate Mobile Money payment", error: mobileMoneyError.toString() });
      }
    }

    const newOrder = new Order({
      products: cartItems.map((cartItem) => ({
        product: cartItem.item._id,
        count: cartItem.quantity,
        color: cartItem.color,
      })),
      paymentIntent,
      paypalOrderId,
      mobileMoneyTransactionId,
      orderby: req.user._id,
      userDetails: {
        email: userDetails.email,
        name: userDetails.name,
        address: userDetails.address,
        postalCode: userDetails.postalCode,
        city: userDetails.city,
        country: userDetails.country,
        phone: userDetails.phone,
      },
      orderStatus: 'Not Processed',
      totalAmount: totalPrice,
    });

    await newOrder.save();

    // Log new order creation instead of using Socket.IO
    console.log('New order created:', newOrder._id);

    res.status(201).json({
      orderId: newOrder._id,
      clientId: process.env.PAYPAL_CLIENT_ID,
      paymentIntent,
      paypalOrderId,
      mobileMoneyTransactionId,
      paymentAuthUrl,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ message: 'Error creating order', error: error.toString() });
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, status, dispatchedAt, expectedDeliveryAt } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updateData = { orderStatus: status };

    if (status === 'Dispatched') {
      updateData.dispatchedAt = dispatchedAt || new Date();
      updateData.expectedDeliveryAt = expectedDeliveryAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Log order status update instead of using Socket.IO
    console.log('Order status updated:', {
      orderId: updatedOrder._id,
      status: updatedOrder.orderStatus,
      dispatchedAt: updatedOrder.dispatchedAt,
      expectedDeliveryAt: updatedOrder.expectedDeliveryAt
    });

    res.status(200).json({ 
      message: "Order status updated successfully", 
      orderId: updatedOrder._id,
      status: updatedOrder.orderStatus,
      dispatchedAt: updatedOrder.dispatchedAt,
      expectedDeliveryAt: updatedOrder.expectedDeliveryAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.toString() });
  }
});



// Controller to capture PayPal order
const captureOrder = asyncHandler(async (req, res) => {
  const { orderId, paypalOrderId } = req.body;

  if (!orderId || !paypalOrderId) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient().execute(request);
    
    // Update order status in the database
    await Order.findByIdAndUpdate(orderId, { 
      orderStatus: 'Processing',
      paymentStatus: 'Paid'
    });

    res.status(200).json({ message: "Order captured successfully", captureId: capture.result.id });
  } catch (error) {
    res.status(500).json({ message: 'Error capturing order', error: error.toString() });
  }
});

// const getOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({ orderby: req.user._id })
//     .populate('products.product')
//     .lean();  

//   console.log("Orders being sent:", orders); 
//   res.json({ orders });
// });


// // Controller to get a single order by ID
// const getSingleOrder = asyncHandler(async (req, res) => {
//   const orderId = req.params.id;

//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   try {
//     const order = await Order.findById(orderId).populate('products.product').exec();

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ order });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching order', error: error.toString() });
//   }
// });

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderby: req.user._id })
    .populate('products.product')
    .lean();  

  const ordersWithShortId = orders.map(order => ({
    ...order,
    shortId: shortMongoId(order._id)
  }));

  console.log("Orders being sent:", ordersWithShortId); 
  res.json({ orders: ordersWithShortId });
});

const getSingleOrder = asyncHandler(async (req, res) => {
  const shortId = req.params.id;

  if (!shortId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const orders = await Order.find().populate('products.product').lean();
    const order = orders.find(o => shortMongoId(o._id) === shortId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order: { ...order, shortId } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.toString() });
  }
});

// Controller to confirm delivery
const confirmDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: 'Delivered' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: "Order marked as delivered", 
      orderId: updatedOrder._id,
      status: updatedOrder.orderStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming delivery', error: error.toString() });
  }
});

// Controller to initiate order confirmation
const initiateOrderConfirmation = asyncHandler(async (req, res) => {
  const { orderId, phoneNumber, expectedDeliveryAt } = req.body;

  if (!orderId || !phoneNumber || !expectedDeliveryAt) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const message = `Dear customer, your order with ID: ${orderId} has been dispatched and is expected to be delivered on ${expectedDeliveryAt}. Please confirm receipt by replying to this message.`;

    await sendSMS(phoneNumber, message);

    res.status(200).json({ message: 'Order confirmation initiated', orderId });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating order confirmation', error: error.toString() });
  }
});

// Controller to confirm order receipt
const confirmOrderReceipt = asyncHandler(async (req, res) => {
  const { orderId, confirmed } = req.body;

  if (!orderId || typeof confirmed === 'undefined') {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const updateData = confirmed ? { orderStatus: 'Received' } : { orderStatus: 'Delivery Failed' };

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: `Order marked as ${confirmed ? 'received' : 'delivery failed'}`, 
      orderId: updatedOrder._id,
      status: updatedOrder.orderStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming order receipt', error: error.toString() });
  }
});

// Controller for handling mobile money payment callback
const mobileMoneyCallback = asyncHandler(async (req, res) => {
  const { transactionId, status, message } = req.body;

  if (!transactionId || !status) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const order = await Order.findOne({ mobileMoneyTransactionId: transactionId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let updatedStatus = '';
    let paymentStatus = '';

    if (status === 'SUCCESSFUL') {
      updatedStatus = 'Processing';
      paymentStatus = 'Paid';
    } else if (status === 'FAILED') {
      updatedStatus = 'Failed';
      paymentStatus = 'Failed';
    } else {
      updatedStatus = 'Pending';
      paymentStatus = 'Pending';
    }

    order.orderStatus = updatedStatus;
    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({ message: "Order status updated", orderId: order._id, status: updatedStatus, paymentStatus });
  } catch (error) {
    res.status(500).json({ message: 'Error handling mobile money callback', error: error.toString() });
  }
});

const getTotalIncome = asyncHandler(async (req, res) => {
  try {
    const totalIncome = await Order.aggregate([
      {
        $match: { orderStatus: 'Delivered' } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalIncomeValue = totalIncome.length > 0 ? totalIncome[0].total : 0;

    res.status(200).json({ totalIncome: totalIncomeValue });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total income', error: error.toString() });
  }
});


const getMonthlyIncome = asyncHandler(async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyIncome = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) },
          orderStatus: 'Delivered'
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = monthNames.map((month, index) => ({
      type: month,
      sales: monthlyIncome.find(item => item._id === index + 1)?.totalAmount || 0
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly income', error: error.toString() });
  }
});

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product'); 
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};


module.exports = {
  createOrder,
  captureOrder,
  getOrders,
  updateOrderStatus,
  initiateOrderConfirmation,
  confirmOrderReceipt,
  mobileMoneyCallback,
  confirmDelivery,
  getTotalIncome,
  getSingleOrder,
  getMonthlyIncome,
  getOrderById
};
