// const express = require("express");
// const {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategory,
//   getallCategory,
// } = require("../controller/prodcategoryCtrl");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const router = express.Router();

// router.post("/", authMiddleware, isAdmin, createCategory);
// router.put("/:id", authMiddleware, isAdmin, updateCategory);
// router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
// router.get("/:id", getCategory);
// router.get("/", getallCategory);

// module.exports = router;



const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
} = require("../controller/prodcategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize, uploadCategoryImages } = require("../middlewares/catUploadImage");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.single("image"), 
  createCategory
);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.single("image"), 
  productImgResize,
  uploadCategoryImages
);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/", getallCategory);

module.exports = router;





// const express = require("express");
// const {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategory,
//   getallCategory,
// } = require("../controller/prodcategoryCtrl");
// const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
// const { uploadPhoto, productImgResize, uploadCategoryImages } = require("../middlewares/uploadImages");

// const router = express.Router();

// router.post("/", authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, createCategory);
// router.put("/:id", authMiddleware, isAdmin, uploadPhoto.single('image'), productImgResize, updateCategory);
// router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
// router.get("/:id", getCategory);
// router.get("/", getallCategory);

// module.exports = router;
