
const express = require("express");
const { uploadImages, deleteImages } = require("../controller/prodcategoryCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/catUploadImage");
const router = express.Router();

router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.single('image'), 
  productImgResize,
  uploadImages
);

router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;

