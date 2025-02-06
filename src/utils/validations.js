import mongoose from "mongoose";

export const validateMongooseId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};