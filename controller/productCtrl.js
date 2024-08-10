// const Product = require("../models/productModel");
// const User = require("../models/userModel");
// const asyncHandler = require("express-async-handler");
// const slugify = require("slugify");
// const validateMongoDbId = require("../utils/validateMongodbId");
// const cloudinaryUploadingImg = require("../utils/cloudinary");

// const createProduct = asyncHandler(async (req, res) => {
//   try {
//     if (req.body.title) {
//       req.body.slug = slugify(req.body.title);
//     }
//     const newProduct = await Product.create(req.body);
//     res.json(newProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const updateProduct = asyncHandler(async (req, res) => {
//   const id = req.params;
//   validateMongoDbId(id);
//   try {
//     if (req.body.title) {
//       req.body.slug = slugify(req.body.title);
//     }
//     const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
//       new: true,
//     });
//     res.json(updateProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const deleteProduct = asyncHandler(async (req, res) => {
//   const id = req.params;
//   validateMongoDbId(id);
//   try {
//     const deleteProduct = await Product.findOneAndDelete(id);
//     res.json(deleteProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// // const getaProduct = asyncHandler(async (req, res) => {
// //   const { id } = req.params;
// //   validateMongoDbId(id);
// //   try {
// //     const findProduct = await Product.findById(id);
// //     res.json(findProduct);
// //   } catch (error) {
// //     throw new Error(error);
// //   }
// // });

// const getaProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params; 
//   validateMongoDbId(id);
//   try {
//     const findProduct = await Product.findById(id); 
//     res.json(findProduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });


// const getAllProduct = asyncHandler(async (req, res) => {
//   try {
//     // Filtering
//     const queryObj = { ...req.query };
//     const excludeFields = ["page", "sort", "limit", "fields"];
//     excludeFields.forEach((el) => delete queryObj[el]);
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     let query = Product.find(JSON.parse(queryStr));

//     // Search by title
//     if (req.query.title) {
//       query = query.where('title', new RegExp(req.query.title, 'i'));
//     }

//     // Sorting
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // limiting the fields
//     if (req.query.fields) {
//       const fields = req.query.fields.split(",").join(" ");
//       query = query.select(fields);
//     } else {
//       query = query.select("-__v");
//     }

//     // pagination
//     const page = req.query.page;
//     const limit = req.query.limit;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);
//     if (req.query.page) {
//       const productCount = await Product.countDocuments();
//       if (skip >= productCount) throw new Error("This Page does not exists");
//     }
//     const product = await query;
//     res.json(product);
//   } catch (error) {
//     throw new Error(error);
//   }
// });


// const addToWishlist = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { prodId } = req.body;
//   try {
//     const user = await User.findById(_id);
//     const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
//     if (alreadyadded) {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $pull: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     } else {
//       let user = await User.findByIdAndUpdate(
//         _id,
//         {
//           $push: { wishlist: prodId },
//         },
//         {
//           new: true,
//         }
//       );
//       res.json(user);
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const rating = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const { star, prodId, comment } = req.body;
//   try {
//     const product = await Product.findById(prodId);
//     let alreadyRated = product.ratings.find(
//       (userId) => userId.postedby.toString() === _id.toString()
//     );
//     if (alreadyRated) {
//       const updateRating = await Product.updateOne(
//         {
//           ratings: { $elemMatch: alreadyRated },
//         },
//         {
//           $set: { "ratings.$.star": star, "ratings.$.comment": comment },
//         },
//         {
//           new: true,
//         }
//       );
//     } else {
//       const rateProduct = await Product.findByIdAndUpdate(
//         prodId,
//         {
//           $push: {
//             ratings: {
//               star: star,
//               comment: comment,
//               postedby: _id,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     }
//     const getallratings = await Product.findById(prodId);
//     let totalRating = getallratings.ratings.length;
//     let ratingsum = getallratings.ratings
//       .map((item) => item.star)
//       .reduce((prev, curr) => prev + curr, 0);
//     let actualRating = Math.round(ratingsum / totalRating);
//     let finalproduct = await Product.findByIdAndUpdate(
//       prodId,
//       {
//         totalrating: actualRating,
//       },
//       { new: true }
//     );
//     res.json(finalproduct);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// // const uploadImages = asyncHandler(async (req, res) => {
// //   console.log(req.files);
// // })

// // const uploadImages = asyncHandler(async (req, res) => {
// //   const { id } = req.params;
// //   validateMongoDbId(id);
// //   try {
// //     const uploader = (path) => cloudinaryUploadingImg.cloudinaryUploadImg(path, "Images");
// //     const urls = [];
// //     const files = req.files;
// //     for ( const file of files ) {
// //       const { path } = files;
// //       const newpath = await uploader(path);
// //       urls.push(newpath);
// //     }
// //     const findProduct = await Product.findByIdAndUpdate(id, 
      
// //       {
// //         images: urls.map((file) => {
// //           return file;
// //         }), 
// //       }, {
// //         new: true,
// //       }
// //     );
// //     res.json(findProduct);
// //   }catch (error) {
// //     throw new Error(error)
// //   }
// // })



// const uploadImages = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const uploader = (path) => cloudinaryUploadImg(path);
//     const urls = [];
//     const files = req.files;
//     for (const file of files) {
//       const { path } = file;
//       const newPath = await uploader(path);
//       urls.push(newPath);
//       fs.unlinkSync(path); // Remove the file from the local filesystem after uploading to Cloudinary
//     }
//     const product = await Product.findByIdAndUpdate(
//       id,
//       {
//         $push: { images: { $each: urls } }, 
//       },
//       { new: true }
//     );
//     res.json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// module.exports = {
//   createProduct,
//   getaProduct,
//   getAllProduct,
//   updateProduct,
//   deleteProduct,
//   addToWishlist,
//   rating,
//   uploadImages
// };





















const Product = require("../models/productModel");
const User = require("../models/userModel");
const Category = require("../models/prodcategoryModel.js");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadingImg = require("../utils/cloudinary");
const shuffleArray = require("../utils/shuffleArray");


const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const category = await Category.findOne({ title: req.body.category });
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    req.body.category = category._id;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        cloudinary.uploader.upload(file.buffer.toString('base64'), {
          folder: "products",
        })
      );
      
      const uploadedImages = await Promise.all(uploadPromises);

      req.body.images = uploadedImages.map(img => ({
        public_id: img.public_id,
        url: img.secure_url
      }));
    }

    const newProduct = await Product.create({
      ...req.body,
      isFinalSale: req.body.isFinalSale || false,
      size: req.body.size,
    });

    await Category.findByIdAndUpdate(category._id, {
      $push: { products: newProduct._id }
    });

    res.json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message });
  }
});


const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const foundProduct = await Product.findById(id);
    res.json(foundProduct);
  } catch (error) {
    throw new Error(error);
  }
});


const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr)).populate('category');

    if (req.query.title) {
      query = query.where('title', new RegExp(req.query.title, 'i'));
    }

    if (req.query.tags) {
      query = query.where('tags', req.query.tags);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exist");
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});


const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: productId },
    });

    // Shuffle the related products
    relatedProducts = shuffleArray(relatedProducts);

    // Limit the number of related products returned
    relatedProducts = relatedProducts.slice(0, 10);

    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if productId is in the wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product not found in wishlist' });
    }

    // Remove productId from wishlist
    user.wishlist = user.wishlist.filter(id => id !== productId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('[deleteWishlistItem]', error.message);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};



const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;

  if (!star || !prodId || !comment) {
    return res.status(400).json({ message: 'Star rating, product ID, and comment are required' });
  }

  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );

    const currentDate = new Date();

    if (alreadyRated) {
      await Product.updateOne(
        { _id: prodId, "ratings._id": alreadyRated._id },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.date": currentDate } },
        { new: true }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star,
              comment,
              date: currentDate,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
    }

    const allRatings = await Product.findById(prodId);
    const totalRating = allRatings.ratings.length;
    const ratingSum = allRatings.ratings.reduce((acc, item) => acc + item.star, 0);
    const actualRating = Math.round(ratingSum / totalRating);
    const finalProduct = await Product.findByIdAndUpdate(
      prodId,
      { totalrating: actualRating },
      { new: true }
    );

    res.json(finalProduct);
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});




const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path);
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const product = await Product.findByIdAndUpdate(
      id,
      {
        $push: { images: { $each: urls } },
      },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  deleteWishlistItem,
  getRelatedProducts
};
