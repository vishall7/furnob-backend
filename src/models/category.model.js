import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category id is required"],
    },
  },
  { timestamps: true }
);

// Category Schema
// name, product id, sub cateogry id
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

categorySchema.set("toJSON", {
  transform: (doc, ret) => {  
    delete ret.__v;
    return ret;
  }
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
const Category = mongoose.model("Category", categorySchema);

export { SubCategory, Category };
