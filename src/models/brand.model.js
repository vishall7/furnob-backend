import mongoose, { Schema } from "mongoose"; 

// brand name, description

const brandSchema = new Schema(
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
    },
    { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);