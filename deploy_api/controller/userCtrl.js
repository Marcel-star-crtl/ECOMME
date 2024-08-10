const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const paypal = require('@paypal/checkout-server-sdk');
const { paypalClient } = require("../config/paypalConfig");

const express = require('express');
const sendSMS = require('../utils/smsService');
const axios = require('axios');


// const asyncHandler = require("express-async-handler");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");

const dotenv = require('dotenv');
dotenv.config()

// const environment = new paypal.core.SandboxEnvironment(
//   process.env.PAYPAL_CLIENT_ID,
//   process.env.PAYPAL_CLIENT_SECRET
// );

// const client = new paypal.core.PayPalHttpClient(environment);


// const clientId = process.env.PAYPAL_CLIENT_ID;
// const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Set up PayPal environment
// const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
// const client = new paypal.core.PayPalHttpClient(environment);


// paypal.configure({
//   'mode': 'sandbox', 
//   'client_id': paypalClientId,
//   'client_secret': paypalClientSecret
// });



// Create a User ----------------------------------------------

// Function to initiate Mobile Money payment
// const initiateMobileMoneyPayment = async (amount, phoneNumber) => {
//   try {
//     const token = await getToken();
//     console.log('Using token:', token);
    
//     const response = await axios.post(
//       'https://sandbox.dsapi.tranzak.me/xp021/v1/request/create',
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


const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  
  const refreshToken = cookie.refreshToken;
  
  // Check if user exists with the provided refreshToken
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(403);
  }

  await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
  
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); 
});


// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid for 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; 

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if productId is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add productId to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('[addToWishlist]', error.message);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};


const deleteWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body; 
    const userId = req.user.id; 

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product not found in wishlist' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('[deleteWishlistItem]', error.message);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};



const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);

    let existingCart = await Cart.findOne({ orderby: user._id });

    if (existingCart) {
      for (let i = 0; i < cart.products.length; i++) {
        let object = {};
        object.product = cart.products[i].product;
        object.count = cart.products[i].count;
        object.color = cart.products[i].color;
        object.price = cart.products[i].price;
        products.push(object);
      }

      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }

      existingCart.products = products;
      existingCart.cartTotal = cartTotal;
      
      // Save the updated cart
      existingCart = await existingCart.save();
      
      res.json(existingCart);
    } else {
      // If the user doesn't have an existing cart, create a new one
      for (let i = 0; i < cart.products.length; i++) {
        let object = {};
        object.product = cart.products[i].product;
        object.count = cart.products[i].count;
        object.color = cart.products[i].color;
        object.price = cart.products[i].price;
        products.push(object);
      }

      // Calculate cartTotal for the new products
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }

      // Create a new cart
      const newCart = await new Cart({
        products,
        cartTotal,
        orderby: user._id,
      }).save();
      
      res.json(newCart);
    }
  } catch (error) {
    throw new Error(error);
  }
});


const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndDelete({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});


const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);

    const userCart = await Cart.findOne({ orderby: user._id }).populate("products.product");

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: userCart.totalAfterDiscount ? userCart.totalAfterDiscount : userCart.cartTotal
        }
      }]
    });

    // Make the API call to create the PayPal order
    const response = await client.execute(request);

    // Extract the PayPal order ID from the response
    const orderId = response.result.id;

    // Construct the approval URL
    const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;

    // Return the PayPal order ID and approval URL to the client
    res.json({ orderId, approvalUrl });
  } catch (error) {
    throw new Error(error);
  }
});



// const getOrders = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   validateMongoDbId(_id);
//   try {
//     const userorders = await Order.find({ orderby: _id })  
//       .populate("products.product")
//       .populate("orderby")
//       .exec();
//     res.json({ orders: userorders });  
//   } catch (error) {
//     throw new Error(error);
//   }
// });


const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderby: req.user._id })
    .populate('products.product')
    .lean();  

  console.log("Orders being sent:", orders); 
  res.json({ orders });
});


const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userOrders = await Order.find({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});

// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       id,
//       {
//         orderStatus: status,
//         paymentIntent: {
//           status: status,
//         },
//       },
//       { new: true }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     throw new Error(error);
//   }
// });


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, status, dispatchedAt, expectedDeliveryAt } = req.body;

  console.log('Received update request:', { orderId, status, dispatchedAt, expectedDeliveryAt });

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
      updateData.expectedDeliveryAt = expectedDeliveryAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: "Order status updated successfully", 
      order: updatedOrder,
      orderId: updatedOrder._id,
      status: updatedOrder.orderStatus,
      dispatchedAt: updatedOrder.dispatchedAt,
      expectedDeliveryAt: updatedOrder.expectedDeliveryAt
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.toString() });
  }
});


// Controller to initiate order confirmation
const initiateOrderConfirmation = asyncHandler(async (req, res) => {
  console.log('Initiating order confirmation');
  const { orderId } = req.body;
  console.log('Order ID:', orderId);
  
  try {
    const order = await Order.findById(orderId);
    console.log('Found order:', order);
    if (!order || order.orderby.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access');
      return res.status(403).json({ message: "Unauthorized" });
    }
    const confirmationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 15*60*1000); 
    console.log('Generated confirmation code:', confirmationCode);
    console.log('Code expiry:', codeExpiry);

    order.confirmationCode = confirmationCode;
    order.codeExpiry = codeExpiry;
    await order.save();

    console.log('Order updated with confirmation code');
    // Send SMS with the confirmation code
    const smsSent = await sendSMS(order.userDetails.phone, confirmationCode);
    console.log('SMS sent result:', smsSent);
    if (smsSent) {
      console.log('Confirmation code sent successfully');
      res.status(200).json({ message: "Confirmation code sent" });
    } else {
      console.log('Failed to send confirmation code');
      res.status(500).json({ message: "Failed to send confirmation code" });
    }
  } catch (error) {
    console.error('Error in initiateOrderConfirmation:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// Controller to confirm order receipt
const confirmOrderReceipt = asyncHandler(async (req, res) => {
  console.log('Confirming order receipt');
  const { orderId, confirmationCode } = req.body;
  console.log('Order ID:', orderId);
  console.log('Confirmation Code:', confirmationCode);

  const order = await Order.findById(orderId);
  console.log('Found order:', order);

  if (!order) {
    console.log('Order not found');
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.orderby.toString() !== req.user._id.toString()) {
    console.log('Unauthorized access');
    return res.status(403).json({ message: "Unauthorized" });
  }

  console.log('Stored confirmation code:', order.confirmationCode);
  console.log('Code expiry:', order.codeExpiry);

  if (!order.confirmationCode || order.confirmationCode !== confirmationCode) {
    console.log('Invalid confirmation code');
    return res.status(400).json({ message: "Invalid confirmation code" });
  }

  if (!order.codeExpiry || new Date() > order.codeExpiry) {
    console.log('Confirmation code expired');
    return res.status(400).json({ message: "Confirmation code expired" });
  }

  order.orderStatus = "Delivered";
  order.confirmationCode = undefined;
  order.codeExpiry = undefined;
  await order.save();

  console.log('Order receipt confirmed');
  res.status(200).json({ message: "Order receipt confirmed", order });
});


const confirmDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        deliveryConfirmed: true, 
        orderStatus: 'Delivered',
        deliveredAt: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: "Order marked as delivered", 
      order: updatedOrder,
      orderId: updatedOrder._id,
      deliveryConfirmed: updatedOrder.deliveryConfirmed,
      deliveredAt: updatedOrder.deliveredAt
    });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    res.status(500).json({ message: 'Error confirming delivery', error: error.toString() });
  }
});



module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderByUserId,
  addToWishlist,
  deleteWishlistItem,
  confirmDelivery,
  initiateOrderConfirmation,
  confirmOrderReceipt,
  // initiateMobileMoneyPayment
};



