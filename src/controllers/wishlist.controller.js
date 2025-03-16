import { asyncHandler } from "../utils/asyncHandler.js";
import { Wishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongooseId } from "../utils/validations.js";
import mongoose from "mongoose";

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  if (!validateMongooseId(productId)) {
    throw new ApiError(400, "product id is invalid");
  }

  const wishlistItem = await Wishlist.findOne({
    userId: req.user._id,
    productId,
  });

  if (wishlistItem) {
    throw new ApiError(400, "product already added to wishlist");
  }

  const wishlist = await Wishlist.create({
    userId: req.user._id,
    productId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "product added to wishlist successfully", wishlist.productId)
    );
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.aggregate([
    { $match: { userId: validateMongooseId(req.user?._id) } },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $replaceRoot: { newRoot: "$product" } },
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
  ]);
  

  return res
    .status(200)
    .json(new ApiResponse(200, "wishlist fetched successfully", wishlist));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, "product id is required");
  }

  if (!validateMongooseId(productId)) {
    throw new ApiError(400, "product id is invalid");
  }

  const wishlist = await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId,
  });

  if (!wishlist) {
    throw new ApiError(400, "product not removed from wishlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "product removed from wishlist successfully", wishlist.productId));
});
