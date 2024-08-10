// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     products: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//         },
//         count: Number,
//         color: String,
//       },
//     ],
//     paymentIntent: {
//       type: String,
//       required: true,
//       enum: ["Cash on Delivery", "PayPal"],
//     },
//     orderStatus: {
//       type: String,
//       default: "Not Processed",
//       enum: [
//         "Not Processed",
//         "Processing",
//         "Dispatched",
//         "Cancelled",
//         "Delivered",
//       ],
//     },
//     orderby: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     userDetails: {
//       email: String,
//       lastName: String,
//       address: String,
//       suite: String,
//       city: String,
//       country: String,
//       phone: String,
//     },
//     totalAmount: Number,
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Order", orderSchema);












// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     products: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//         },
//         count: Number,
//         color: String,
//       },
//     ],
//     paymentIntent: {
//       type: String,
//       required: true,
//       enum: ["Cash on Delivery", "PayPal", "Mobile Money"],
//     },
//     paypalOrderId: {
//       type: String,
//       required: function() {
//         return this.paymentIntent === "PayPal";
//       },
//     },
//     mobileMoneyTransactionId: {
//       type: String,
//       required: function() {
//         return this.paymentIntent === "Mobile Money";
//       },
//     },
//     orderStatus: {
//       type: String,
//       default: "Not Processed",
//       enum: [
//         "Not Processed",
//         "Processing",
//         "Dispatched",
//         "Cancelled",
//         "Delivered",
//       ],
//     },
//     dispatchTime: {
//       type: Date,
//     },
//     dispatchedAt: {
//       type: Date,
//     },
//     expectedDeliveryAt: {
//       type: Date,
//     },
//     deliveryConfirmed: {
//       type: Boolean,
//       default: false, 
//     },
//     orderby: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     userDetails: {
//       email: String,
//       lastName: String,
//       address: String,
//       suite: String,
//       city: String,
//       country: String,
//       phone: String,
//     },
//     totalAmount: Number,
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Order", orderSchema);








const mongoose = require("mongoose");
const shortid = require('shortid');

const orderSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      default: shortid.generate,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: Number,
        color: String,
      },
    ],
    paymentIntent: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "PayPal", "Mobile Money"],
    },
    paypalOrderId: {
      type: String,
      required: function () {
        return this.paymentIntent === "PayPal";
      },
    },
    mobileMoneyTransactionId: {
      type: String,
      required: function () {
        return this.paymentIntent === "Mobile Money";
      },
    },
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
      ],
    },
    dispatchTime: {
      type: Date,
    },
    dispatchedAt: {
      type: Date,
    },
    expectedDeliveryAt: {
      type: Date,
    },
    deliveryConfirmed: {
      type: Boolean,
      default: false,
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userDetails: {
      email: String,
      name: String,
      address: String,
      postalCode: String,
      city: String,
      country: String,
      phone: String,
    },
    totalAmount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
