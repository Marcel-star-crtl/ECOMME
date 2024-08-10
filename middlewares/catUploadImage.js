const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const expressAsyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const Product = require("../models/productModel");
const Category = require("../models/prodcategoryModel");

// Setup storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

// Filter for image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

// Setup multer
const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Increase file size limit to 5MB
});

// Resize image middleware
const productImgResize = async (req, res, next) => {
  if (!req.file) return next();
  const outputPath = `public/images/products/${req.file.filename}`;
  await sharp(req.file.path)
    .resize(300, 300)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(outputPath);
  fs.unlinkSync(req.file.path); 
  req.file.path = outputPath; 
  next();
};

// Upload category images to Cloudinary
const uploadCategoryImages = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "categories");
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { path } = file;
    const newPath = await uploader(path);
    fs.unlinkSync(path);

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        image: {
          public_id: newPath.public_id,
          url: newPath.url,
        },
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { uploadPhoto, productImgResize, uploadCategoryImages };
