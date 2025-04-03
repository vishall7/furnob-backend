import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userCache } from "../utils/ttlCached.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.AccessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log(token)

  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let user = userCache.get(verified._id);
        
    if (!user) {
      user = await User.findById(verified._id, "-password -refreshToken -otp -otpExpiry");
      if(!user){
        throw new ApiError(401, "User not found");
      }
      userCache.set(verified._id, user);
    } 
      
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid token");
    } else {
      throw new ApiError(401, error.message);
    }
  }
});
