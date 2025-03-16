import mongoose, {Schema} from "mongoose";

const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"],
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product id is required"],
    },
}, {timestamps: true, toJSON: {virtuals: false}});

wishlistSchema.index({userId: 1, productId: 1}, {unique: true});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);