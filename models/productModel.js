
// const mongoose = require("mongoose");

// var productSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'PCategory',
//       required: true,
//     },
//     brand: {
//       type: String,
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//     },
//     sold: {
//       type: Number,
//       default: 0,
//     },
//     images: [
//       {
//         public_id: String,
//         url: String,
//       },
//     ],
//     color: [],
//     tags: String,
//     ratings: [
//       {
//         star: Number,
//         comment: String,
//         postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       },
//     ],
//     totalrating: {
//       type: String,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);







const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'PCategory', required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    images: [{ public_id: String, url: String }],
    color: [],
    tags: { type: String, required: true },
    ratings: [
      {
        star: Number,
        comment: String,
        date: { type: Date, default: Date.now },
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      }
    ],
    totalrating: { type: String, default: 0 },
    isFinalSale: { type: Boolean, default: false },
    size: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);


