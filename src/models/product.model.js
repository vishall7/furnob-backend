import mongoose, { Schema } from "mongoose";
import { fileUploadToCloudinary } from "../utils/cloudinary.js";

// product schema
// name, short description, long description, price, discount, reviews id, brand id, [category id], sub category id,
// images, main-image, colors, quantity, status(in stock, out of stock), tags

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
      required: [true, "short description is required"],
    },
    longDescription: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "category id is required"],
      },
    ],
    subCategoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    mainImage: {
      type: String,
      default: "",
    },
    images: {
      type: [String]
    },
    colors: { type: [String] },
    status: {
      type: String,
      enum: ["in stock", "out of stock"],
      default: "in stock",
      required: [true, "quantity is required"],
    },
    ratings: { type: Number, default: 0 },
    tags: { type: [String] },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.updatedAt;
    delete ret.createdAt;
    return ret;
  },
});

export const Product = mongoose.model("Product", productSchema);
