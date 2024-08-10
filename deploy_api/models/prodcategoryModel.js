// const mongoose = require("mongoose");

// var prodcategorySchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },
//     image: {
//       public_id: {
//         type: String,
//       },
//       url: {
//         type: String,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// //Export the model
// module.exports = mongoose.model("PCategory", prodcategorySchema);






const mongoose = require("mongoose");

var prodcategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PCategory", prodcategorySchema);
