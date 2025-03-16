import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {validateMongooseId } from "../utils/validations.js";
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
    [name, shortDescription, price, brandId, categoryId, status].some(
      (feild) => feild?.trim() === ""
    )
  ) {
    throw new ApiError(400, "all feilds are manditory");
  }

  const categoryIds = categoryId !== "" ? categoryId.split(",") : [];
  const subCategoryIds = subCategoryId !== "" ? subCategoryId.split(",") : [];

  const images = req.files?.map((file) => file.path);

  if (!images?.length) {
    throw new ApiError(400, "images are required");
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

  agenda.now("upload-images", { images, productId: product._id });

  return res
    .status(201)
    .json(new ApiResponse(201, "product created successfully", product));
});

// get
export const getProducts = asyncHandler(async (req, res) => {
  const {
    brands,
    categories,
    subcategories,
    colors,
    minPrice,
    maxPrice,
    status,
    sort,
    page = 1,
    limit = 30,
  } = req.query;
  let matchStage = {};

  if (brands)
    matchStage.brandId = {
      $in: brands.split(",").map((id) => validateMongooseId(id)),
    };
  if (categories)
    matchStage.categoryIds = {
      $in: categories.split(",").map((id) => validateMongooseId(id)),
    };
  if (subcategories)
    matchStage.subCategoryIds = {
      $in: subcategories.split(",").map((id) => validateMongooseId(id)),
    };
  if (colors) matchStage.colors = { $in: colors.split(",") };
  if (status) matchStage.status = status;
  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = Number(minPrice);
    if (maxPrice) matchStage.price.$lte = Number(maxPrice);
  }

  let sortStage = {};
  if (sort === "asc") sortStage.price = 1;
  if (sort === "desc") sortStage.price = -1;
  if (sort === "latest") sortStage.createdAt = -1;
  if(sort === "popularity") sortStage.ratings = -1;

  const aggregation = Product.aggregate([
    {
      $match: matchStage,
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
        ratings: 1,
      },
    },
    {
      $sort: { createdAt: -1 , ...sortStage},
    },
  ]);

  const options = { page: Number(page), limit: Number(limit)};

  const products = await Product.aggregatePaginate(aggregation, options);

  return res
    .status(200)
    .json(new ApiResponse(200, "product fetched successfully", products));
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
    }    
  ]);

  if (product.length === 0) {
    throw new ApiError(400, "product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "product fetched successfully", product[0]));
});

// get by category

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    brands,
    colors,
    minPrice,
    maxPrice,
    status,
    sort,
    page = 1,
    limit = 30,
  } = req.query;

  if (!categoryId) {
    throw new ApiError(400, "category is required");
  }

  if (!validateMongooseId(categoryId)) {
    throw new ApiError(400, "category id is invalid");
  }

  let matchStage = { categoryIds: validateMongooseId(categoryId) };

  if (brands)
    matchStage.brandId = {
      $in: brands.split(",").map((id) => validateMongooseId(id)),
    };
  if (colors) matchStage.colors = { $in: colors.split(",") };
  if (status) matchStage.status = status;
  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = Number(minPrice);
    if (maxPrice) matchStage.price.$lte = Number(maxPrice);
  }

  let sortStage = {};
  if (sort === "asc") sortStage.price = 1;
  if (sort === "desc") sortStage.price = -1;
  if (sort === "latest") sortStage.createdAt = -1;
  if(sort === "popularity") sortStage.ratings = -1;

  const aggregation = Product.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        name: 1,
        id: 1,
        price: 1,
        discount: 1,
        images: 1,
        status: 1,
        ratings: 1,
      },
    },
    {
      $sort: { createdAt: -1, ...sortStage },
    },
  ]);

  const options = { page: Number(page), limit: Number(limit) };

  const products = await Product.aggregatePaginate(aggregation, options);

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
        ratings: 1,
      },
    },
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

export const filteration = asyncHandler(async (req, res) => {
  const { categoryId, subcategoryId } = req.query;
  const matchStage = {};
  if (categoryId) matchStage.categoryIds = validateMongooseId(categoryId);
  if (subcategoryId)
    matchStage.subCategoryIds = validateMongooseId(subcategoryId);
  const filters = await Product.aggregate([
    { $match: matchStage },
    {
      $facet: {
        colors: [
          { $unwind: "$colors" },
          { $group: { _id: "$colors", count: { $sum: 1 } } },
        ],
        brands: [
          { $group: { _id: "$brandId", count: { $sum: 1 } } },
          {
            $lookup: {
              from: "brands",
              localField: "_id",
              foreignField: "_id",
              as: "brand",
            },
          },
          { $unwind: "$brand" },
          { $project: { _id: "$brand._id", name: "$brand.name", count: 1 } },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "filters fetched successfully", filters[0]));
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { categoryIds, subCategoryIds, productId, colors, tags } = req.query;

  console.log("categoryIds received:", categoryIds);

  



  if (!productId) throw new ApiError(400, "Product ID is required");
  if (!validateMongooseId(productId)) throw new ApiError(400, "Invalid Product ID");

  const matchStrict = { _id: { $ne: validateMongooseId(productId) } };
  if (categoryIds) matchStrict.categoryIds = { $in: categoryIds.split(",") };
  if (subCategoryIds) matchStrict.subCategoryIds = { $in: subCategoryIds.split(",") };
  if (colors) matchStrict.colors = { $in: colors.split(",") };
  if (tags) matchStrict.tags = { $in: tags.split(",") };

  const matchLoose = { _id: { $ne: validateMongooseId(productId) } };
  if (categoryIds) matchLoose.categoryIds = { $in: categoryIds.split(",") };
  if (subCategoryIds) matchLoose.subCategoryIds = { $in: subCategoryIds.split(",") };

  const products = await Product.aggregate([
    {
      $facet: {
        strictMatch: [{ $match: matchStrict }, { $sample: { size: 3 } }],
        looseMatch: [{ $match: matchLoose }, { $sample: { size: 3 } }],
      },
    },
    {
      $project: {
        products: { $concatArrays: ["$strictMatch", "$looseMatch"] },
      },
    },
    { $unwind: "$products" },
    { $replaceRoot: { newRoot: "$products" } },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        discount: 1,
        mainImage: { $arrayElemAt: ["$images", 0] },
        createdAt: 1,
        status: 1,
      },
    },
    { $limit: 3 },
  ]);

  if (!products.length) throw new ApiError(400, "No related products found");

  return res.status(200).json(new ApiResponse(200, "Products fetched", products));
});
