// const Category = require("../models/prodcategoryModel.js");
// const asyncHandler = require("express-async-handler");
// const validateMongoDbId = require("../utils/validateMongodbId");

// const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const newCategory = await Category.create(req.body);
//     res.json(newCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.json(updatedCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// const deleteCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const deletedCategory = await Category.findByIdAndDelete(id);
//     res.json(deletedCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// const getCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const getaCategory = await Category.findById(id);
//     res.json(getaCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     const getallCategory = await Category.find();
//     res.json(getallCategory);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// module.exports = {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategory,
//   getallCategory,
// };





const Category = require("../models/prodcategoryModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg } = require("../utils/cloudinary");

const createCategory = asyncHandler(async (req, res) => {
  try {
    let newCategory;
    if (req.file) {
      const file = req.file.path;
      const uploadResult = await cloudinaryUploadImg(file, 'categories');
      newCategory = await Category.create({
        title: req.body.title,
        image: {
          public_id: uploadResult.public_id,
          url: uploadResult.url,
        },
      });
    } else {
      newCategory = await Category.create({
        title: req.body.title,
      });
    }
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    let updatedCategory;
    if (req.file) {
      const file = req.file.path;
      const uploadResult = await cloudinaryUploadImg(file, 'categories');
      updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          title: req.body.title,
          image: {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
          },
        },
        { new: true }
      );
    } else {
      updatedCategory = await Category.findByIdAndUpdate(
        id,
        { title: req.body.title },
        { new: true }
      );
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const category = await Category.findById(id);
    if (category) {
      // Perform any necessary cleanup like deleting associated images from Cloudinary
      await Category.findByIdAndDelete(id);
      res.json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// const getCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const category = await Category.findById(id);
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const category = await Category.findById(id).populate('products');
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

const getallCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().populate('products');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
};






// const Category = require("../models/prodcategoryModel.js");
// const asyncHandler = require("express-async-handler");
// const validateMongoDbId = require("../utils/validateMongodbId");
// const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");

// const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const { title } = req.body;
//     const file = req.file.path;

//     const uploadResult = await cloudinaryUploadImg(file, 'categories');
//     const newCategory = await Category.create({
//       title,
//       image: {
//         public_id: uploadResult.public_id,
//         url: uploadResult.url,
//       },
//     });

//     res.json(newCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const { title } = req.body;
//     let updatedCategory;

//     if (req.file) {
//       const file = req.file.path;
//       const uploadResult = await cloudinaryUploadImg(file, 'categories');

//       updatedCategory = await Category.findByIdAndUpdate(
//         id,
//         {
//           title,
//           image: {
//             public_id: uploadResult.public_id,
//             url: uploadResult.url,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true });
//     }

//     res.json(updatedCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const deleteCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const category = await Category.findById(id);
//     if (category) {
//       await cloudinaryDeleteImg(category.image.public_id);
//       await Category.findByIdAndDelete(id);
//       res.json({ message: "Category deleted successfully" });
//     } else {
//       res.status(404).json({ message: "Category not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const getCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const category = await Category.findById(id);
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategory,
//   getallCategory,
// };









// const Category = require("../models/prodcategoryModel.js");
// const asyncHandler = require("express-async-handler");
// const validateMongoDbId = require("../utils/validateMongodbId");
// const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");

// const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const { title } = req.body;
//     const file = req.file ? req.file.path : null;

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const uploadResult = await cloudinaryUploadImg(file, 'categories');
//     const newCategory = await Category.create({
//       title,
//       image: {
//         public_id: uploadResult.public_id,
//         url: uploadResult.url,
//       },
//     });

//     res.json(newCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const { title } = req.body;
//     let updatedCategory;

//     if (req.file) {
//       const file = req.file.path;
//       const uploadResult = await cloudinaryUploadImg(file, 'categories');

//       updatedCategory = await Category.findByIdAndUpdate(
//         id,
//         {
//           title,
//           image: {
//             public_id: uploadResult.public_id,
//             url: uploadResult.url,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true });
//     }

//     res.json(updatedCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const deleteCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const category = await Category.findById(id);
//     if (category) {
//       await cloudinaryDeleteImg(category.image.public_id);
//       await Category.findByIdAndDelete(id);
//       res.json({ message: "Category deleted successfully" });
//     } else {
//       res.status(404).json({ message: "Category not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const getCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const category = await Category.findById(id);
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// const getallCategory = asyncHandler(async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = {
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategory,
//   getallCategory,
// };

