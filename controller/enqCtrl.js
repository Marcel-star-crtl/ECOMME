const Enquiry = require("../models/enqModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const socketManager = require("../socketManager");

// const createEnquiry = asyncHandler(async (req, res) => {
//   try {
//     const newEnquiry = await Enquiry.create(req.body);
//     res.json(newEnquiry);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const createEnquiry = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, city, country, comment } = req.body;
    const newEnquiry = await Enquiry.create({
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      mobile,
      city,
      country,
      comment
    });

    // Emit a Socket.IO event for the new enquiry
    socketManager.getIO().emit('newEnquiry', newEnquiry);

    res.status(201).json(newEnquiry);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Error creating enquiry', error: error.message });
  }
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedEnquiry);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
    res.json(deletedEnquiry);
  } catch (error) {
    throw new Error(error);
  }
});
const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaEnquiry = await Enquiry.findById(id);
    res.json(getaEnquiry);
  } catch (error) {
    throw new Error(error);
  }
});
const getallEnquiry = asyncHandler(async (req, res) => {
  try {
    const getallEnquiry = await Enquiry.find();
    res.json(getallEnquiry);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
};
