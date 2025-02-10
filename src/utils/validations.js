import mongoose from "mongoose";

export const validateMongooseId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id);
};

export const slugToName = (slug) => {
  return slug
    .split("-")
    .join(" ");
};