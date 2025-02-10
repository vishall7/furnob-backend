import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { slugToName, validateMongooseId } from "../utils/validations.js";
import agenda from "../db/agenda.js";

// create
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    shortDescription,
    longDescription,
    price,
    discount,
    brandId,
    categoryId,
    subCategoryId,
    colors,
    status,
    ratings,
    tags,
  } = req.body;

  if (
    [
      name,
      shortDescription,
      price,
      brandId,
      categoryId,
      status,
    ].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "all feilds are manditory");
  }

  const categoryIds = categoryId?.split(",") || [];
  const subCategoryIds = subCategoryId?.split(",") || [];

  const mainImage =  req.files.mainImage && req.files.mainImage[0]?.path;
  const images = req.files.images?.map((image) => image?.path) || [];   

  if (!mainImage) {
    throw new ApiError(400, "main image is required");
  }  

  const existedProduct = await Product.findOne({ name });    

  if (existedProduct) {
    throw new ApiError(400, "Product already existed");
  }

  const product = await Product.create({
    name,
    shortDescription,
    longDescription,
    price,
    discount,
    brandId,
    categoryIds,
    subCategoryIds,
    colors: colors.split(","),
    status,
    ratings,
    tags: tags.split(","),
  });

  if (!product) {
    throw new ApiError(400, "product not created");
  }

  await agenda.now("upload-images", {mainImage, images, productId: product._id });

  return res
    .status(201)
    .json(new ApiResponse(201, "product created successfully", product));
});

// get
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    {
      $project: {
        name: 1,
        id: 1,
        price: 1,
        discount: 1,
        mainImage: 1,
        images: 1,
        status: 1,
        ratings: 1
      }
    }    
  ]);
  if (!products) {
    throw new ApiError(400, "products not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "products fetched successfully", products));
});

// get by id

export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  if (!validateMongooseId(productId)) {
    throw new ApiError(400, "product id is invalid");
  }

  const product = await Product.aggregate([
    {
      $match: {
        _id: validateMongooseId(productId),
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryIds",
        foreignField: "_id",
        as: "categories",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategoryIds",
        foreignField: "_id",
        as: "subcategories",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brand",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        categories: "$categories",
        subcategories: "$subcategories",
        brand: { $arrayElemAt: ["$brand", 0] },
      },
    },
    {
      $project: {
        categoryIds: 0,
        subCategoryIds: 0,
        brandId: 0,
        __v: 0,
      },
    },
  ]);

  if (!product) {
    throw new ApiError(400, "product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "product fetched successfully", product));
});

// get by category

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "category is required");
  }

  if (!validateMongooseId(categoryId)) {
    throw new ApiError(400, "category id is invalid");
  }

  const products = await Product.aggregate([
    {
      $match: {
        categoryIds: validateMongooseId(categoryId),
      },
    },
    {
      $project: {
        name: 1,
        id: 1,
        price: 1,
        discount: 1,
        mainImage: 1,
        status: 1,
        ratings: 1
      }
    }
  ]);  

  if (!products) {
    throw new ApiError(400, "products not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "products fetched successfully", products));
});

// get products by sub category

export const getProductsBySubCategory = asyncHandler(async (req, res) => {
  const { subCategoryId } = req.params;

  if (!subCategoryId) {
    throw new ApiError(400, "sub category is required");
  }

  if (!validateMongooseId(subCategoryId)) {
    throw new ApiError(400, "sub category id is invalid");
  }

  const products = await Product.aggregate([
    {
      $match: {
        subCategoryIds: validateMongooseId(subCategoryId),
      },
    },
    {
      $project: {
        name: 1,
        id: 1,
        price: 1,
        discount: 1,
        mainImage: 1,
        images: 1,
        status: 1,
        ratings: 1
      }
    }
  ]);

  if (!products) {
    throw new ApiError(400, "products not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "products fetched successfully", products));
});

// update

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const {
    name,
    shortDescription,
    longDescription,
    price,
    discount,
    brandId,
    categoryId,
    subCategoryId,
    colors,
    status,
    tags,
    mainImage,
    images,
  } = req.body;

  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  if (!validateMongooseId(productId)) {
    throw new ApiError(400, "product id is invalid");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      name,
      shortDescription,
      longDescription,
      price,
      discount,
      brandId,
      categoryId,
      subCategoryId,
      colors,
      status,
      tags,
      mainImage,
      images,
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(400, "product not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "product updated successfully", product));
});


// delete 

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  if (!validateMongooseId(productId)) {
    throw new ApiError(400, "product id is invalid");
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(400, "product not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "product deleted successfully", product));
});

// product query

export const productQuery = asyncHandler(async (req, res) => {

  const { brands, categories, subcategories, colors, minPrice, maxPrice } = req.query;
  let matchStage = {};

    if (brands) matchStage.brandId = { $in: brands.split(",").map(id => validateMongooseId(id)) };
    if (categories) matchStage.categoryIds = { $in: categories.split(",").map(id => validateMongooseId(id)) };
    if (subcategories) matchStage.subCategoryIds = { $in: subcategories.split(",").map(id => validateMongooseId(id))};
    if (colors) matchStage.colors = { $in: colors.split(",") };
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }

    const product = await Product.aggregate([
      {
        $match: matchStage
      },      
      {
        $project: {
          name: 1,
          id: 1,
          price: 1,
          discount: 1,
          mainImage: 1,
          images: 1,
          status: 1,
          ratings: 1
        }
      }
    ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "product fetched successfully", product));
})