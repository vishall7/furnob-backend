import { asyncHandler } from "../utils/asyncHandler.js";
import { Brand } from "../models/brand.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateMongooseId } from "../utils/validations.js";

// create

export const createBrand = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const existedBrand = await Brand.findOne({ name });

    if (existedBrand) {
        throw new ApiError(400, "Brand already existed");
    }

    const brand = await Brand.create({ name, description });

    if (!brand) {
        throw new ApiError(400, "brand not created");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "brand created successfully", brand));
});

// get

export const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find();

    if (brands.length === 0) {
        throw new ApiError(400, "brands not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "brands fetched successfully", brands));
});

// update

export const updateBrand = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const { brandId } = req.params;

    if (!brandId) {
        throw new ApiError(400, "brand id is required");
    }

    if (!validateMongooseId(brandId)) {
        throw new ApiError(400, "brand id is invalid");
    }

    const brand = await Brand.findByIdAndUpdate(
        brandId,
        { name, description },
        { new: true }
    );

    if (!brand) {
        throw new ApiError(400, "brand not updated");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "brand updated successfully", brand));
});

// delete

export const deleteBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;

    if (!brandId) {
        throw new ApiError(400, "brand id is required");
    }

    if (!validateMongooseId(brandId)) {
        throw new ApiError(400, "brand id is invalid");
    }

    const brand = await Brand.findByIdAndDelete(brandId);

    if (!brand) {
        throw new ApiError(400, "brand not deleted");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "brand deleted successfully", brand));
});