import { asyncHandler } from "../utils/asyncHandler.js";
import { Category, SubCategory } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongooseId } from "../utils/validations.js";

// create

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const existedCategory = await Category.findOne({ name });

  if (existedCategory) {
    throw new ApiError(400, "Category already existed");
  }

  const category = await Category.create({ name, description });

  if (!category) {
    throw new ApiError(400, "category not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "category created successfully", category));
});

export const createSubCategory = asyncHandler(async (req, res) => {
  const { name, description, categoryId } = req.body;

  if ([name, categoryId].some((feild) => feild?.trim() === "")) {
    throw new ApiError(400, "all feilds are manditory");
  }

  const existedSubCategory = await SubCategory.findOne({ name });

  if (existedSubCategory) {
    throw new ApiError(400, "sub Category already existed");
  }

  const subCategory = await SubCategory.create({
    name,
    description,
    categoryId,
  });

  if (!subCategory) {
    throw new ApiError(400, "sub category not created");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "sub category created successfully", subCategory)
    );
});

// get

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  if (categories.length === 0) {
    throw new ApiError(400, "categories not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "categories fetched successfully", categories));
});

export const getSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find({});

  if (subCategories.length === 0) {
    throw new ApiError(400, "sub categories not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "sub categories fetched successfully", subCategories)
    );
});

// find sub categories by category id

export const getSubCategoriesByCategoryId = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "category id is required");
  }

  if (!validateMongooseId(categoryId)) {
    throw new ApiError(400, "category id is invalid");
  }

  const subCategories = await SubCategory.find({ categoryId });

  if (subCategories.length === 0) {
    throw new ApiError(400, "sub categories not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "sub categories fetched successfully", subCategories)
    );
});

// update

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "category id is required");
  }

  if (!validateMongooseId(categoryId)) {
    throw new ApiError(400, "category id is invalid");
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { name, description },
    { new: true }
  );

  if (!category) {
    throw new ApiError(400, "category not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "category updated successfully", category));
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { subCategoryId } = req.params;

  if (!subCategoryId) {
    throw new ApiError(400, "sub category id is required");
  }

  if (!validateMongooseId(subCategoryId)) {
    throw new ApiError(400, "sub category id is invalid");
  }

  const subCategory = await SubCategory.findByIdAndUpdate(
    subCategoryId,
    { name, description },
    { new: true }
  );

  if (!subCategory) {
    throw new ApiError(400, "sub category not updated");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "sub category updated successfully", subCategory)
    );
});

// delete

export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "category id is required");
  }

  if (!validateMongooseId(categoryId)) {
    throw new ApiError(400, "category id is invalid");
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(400, "category not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "category deleted successfully", category));
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { subCategoryId } = req.params;

  if (!subCategoryId) {
    throw new ApiError(400, "sub category id is required");
  }

  if (!validateMongooseId(subCategoryId)) {
    throw new ApiError(400, "sub category id is invalid");
  }

  const subCategory = await SubCategory.findByIdAndDelete(subCategoryId);

  if (!subCategory) {
    throw new ApiError(400, "sub category not deleted");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "sub category deleted successfully", subCategory)
    );
});
