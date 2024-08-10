// const mongoose = require("mongoose"); 

// // Declare the Schema of the Mongo model
// var enqSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//   },
//   mobile: {
//     type: String,
//     required: true,
//   },
//   comment: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     default: "Submitted",
//     enum: ["Submitted", "Contacted", "In Progress", "Resolved"],
//   },
// });

// //Export the model
// module.exports = mongoose.model("Enquiry", enqSchema);






const mongoose = require("mongoose"); 

var enqSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  status: {
    type: String,
    default: "Submitted",
    enum: ["Submitted", "Contacted", "In Progress", "Resolved"],
  },
});

module.exports = mongoose.model("Enquiry", enqSchema);