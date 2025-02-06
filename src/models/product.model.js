import mongoose, { Schema } from "mongoose";

// product schema
// name, short description, long description, price, discount, reviews id, brand id, [category id], sub category id,
// images, main-image, colors, quantity, status(in stock, out of stock), tags 

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shortDescription: {
            type: String,            
            trim: true,
            default: '',
        },
        longDescription: {
            type: String,
            trim: true,
            default: '',
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
            ref: 'Brand',
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',        
        },
        main_image: {
            type: String,
            // required: [true, 'image url required']
        },
        images: {
            type: [String],
        },
        colors: {
            type: [String],
        },
        status: {
            type: String,
            enum: ['in stock', 'out of stock'],
            default: 'in stock',
            required: [true, 'quantity is required']
        },
        tags: {
            type: [String],
        }
    },
    {timestamps: true}
);

export const Product = mongoose.model('Product', productSchema);

