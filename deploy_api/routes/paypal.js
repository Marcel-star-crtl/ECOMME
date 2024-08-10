// // routes/paypal.js

// const express = require('express');
// const router = express.Router();
// const paypalController = require('../controllers/paypalController');

// // Route for creating a PayPal order
// router.post('/create-order', paypalController.createOrder);

// // Route for capturing a PayPal payment
// router.post('/capture-payment', paypalController.capturePayment);

// // Route for handling PayPal webhook events (optional)
// router.post('/webhook', paypalController.handleWebhook);

// module.exports = router;


const express = require('express');
const {
    createOrder,
    capturePayment
} = require ("../controller/paypalController");
const { isAmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

// Route to create a PayPal order
router.post('/create-order', authMiddleware, createOrder);

// Route to capture payment for a PayPal order
router.post('/capture-payment', authMiddleware, capturePayment);

module.exports = router;
