// // controllers/paypalController.js

// const paypal = require('@paypal/checkout-server-sdk');

// // Function to create a PayPal order
// const createOrder = async (req, res) => {
//   try {
//     // Implement logic to create a PayPal order using PayPal SDK
//     // Construct the order request, send it to PayPal, and return the order ID
//   } catch (error) {
//     // Handle errors
//     console.error('Error creating PayPal order:', error);
//     res.status(500).json({ error: 'Failed to create PayPal order' });
//   }
// };

// // Function to capture a PayPal payment
// const capturePayment = async (req, res) => {
//   try {
//     // Implement logic to capture a PayPal payment using PayPal SDK
//     // Get the order ID from the request, capture the payment, and return the payment details
//   } catch (error) {
//     // Handle errors
//     console.error('Error capturing PayPal payment:', error);
//     res.status(500).json({ error: 'Failed to capture PayPal payment' });
//   }
// };

// // Function to handle PayPal webhook events (optional)
// const handleWebhook = async (req, res) => {
//   try {
//     // Implement logic to handle PayPal webhook events
//     // Verify the webhook signature, parse the event data, and handle the event accordingly
//   } catch (error) {
//     // Handle errors
//     console.error('Error handling PayPal webhook:', error);
//     res.status(500).json({ error: 'Failed to handle PayPal webhook' });
//   }
// };

// module.exports = {
//   createOrder,
//   capturePayment,
//   handleWebhook,
// };




// controllers/paypalController.js

// const paypal = require('@paypal/checkout-server-sdk');
// const { clientId, clientSecret } = require('../config/paypalConfig'); 
// const paypalClient = require('../config/paypalClient'); 

// // Function to create a PayPal order
// const createOrder = async (req, res) => {
//   try {
//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer("return=representation");
//     request.requestBody({
//       intent: 'CAPTURE',
//       purchase_units: [{
//         amount: {
//           currency_code: 'USD',
//           value: '100.00' // Total amount for the order
//         }
//       }]
//     });
//     const response = await paypalClient.client().execute(request);
//     res.json({ orderId: response.result.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// };

// // Function to capture payment for a PayPal order
// const capturePayment = async (req, res) => {
//   const orderId = req.body.orderId; // Order ID received from the client
//   try {
//     const request = new paypal.orders.OrdersCaptureRequest(orderId);
//     request.requestBody({});
//     const response = await paypalClient.client().execute(request);
//     // Handle successful payment capture
//     res.json({ status: 'success', paymentId: response.result.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to capture payment' });
//   }
// };

// module.exports = {
//   createOrder,
//   capturePayment,
// };




const paypal = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');
dotenv.config();

// Retrieve PayPal credentials from environment variables
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Set up PayPal environment
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

// Function to create PayPal order
const createOrder = async (req, res) => {
  try {
    // Construct the request body for creating the order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00' 
        }
      }]
    });

    // Make the API call to create the order
    const response = await client.execute(request);

    // Extract the order ID from the response
    const orderId = response.result.id;

    // Return the order ID to the client
    res.json({ orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create PayPal order' });
  }
};

// Function to capture PayPal order
const capturePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Construct the request body for capturing the order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    // Make the API call to capture the order
    const response = await client.execute(request);

    // Extract relevant information from the response
    const captureId = response.result.purchase_units[0].payments.captures[0].id;

    // Return the capture ID to the client
    res.json({ captureId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to capture PayPal order' });
  }
};

module.exports = {
    createOrder,
    capturePayment
};

