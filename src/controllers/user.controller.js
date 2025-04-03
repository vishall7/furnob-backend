import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/resend.js";
import { hashedOtp, generateOtp } from "../utils/otp.js";
import agenda from "../db/agenda.js";
import {validateMongooseId} from "../utils/validations.js";

const generateTokens = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const httpOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "None"
};

//create
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((feild) => feild?.trim() === "")) {
    throw new ApiError(400, "all feilds are manditory");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "user already existed");
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (!user) {
    throw new ApiError(400, "user not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "user created successfully", user));
});

//login
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if ([identifier, password].some((feild) => feild?.trim() === "")) {
    throw new ApiError(400, "all feilds are manditory");
  }

  const user = await User.findOne({
    [identifier.match(/@/g) ? "email" : "username"]: identifier,
  });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "password is incorrect");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return res
    .status(200)
    .cookie("AccessToken", accessToken, httpOptions)
    .cookie("RefreshToken", refreshToken, httpOptions)
    .json(new ApiResponse(200, "user logged in successfully", user));
});

//logout
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: "" },
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  return res
    .status(200)
    .clearCookie("AccessToken", httpOptions)
    .clearCookie("RefreshToken", httpOptions)
    .json(new ApiResponse(200, "user logged out successfully", user));
});

//get users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  if (users.length === 0) {
    throw new ApiError(400, "users not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "users fetched successfully", users));
});

// sendOtp
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const otp = generateOtp();

  // const user = await User.findOneAndUpdate(
  //   { email },
  //   {
  //     $set: {
  //       otp: await hashedOtp(otp),
  //       otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
  //     },
  //   },
  //   { new: true }
  // );

  // if (!user) {
  //   throw new ApiError(400, "user not found");
  // }

  const emailSended = await sendEmail({
    to: email,
    subject: "OTP",
    text: `Your OTP is ${otp}`,
  });

  if (!emailSended) {
    throw new ApiError(400, "email not sended");
  }

  // agenda.now("send-otp", { email, otp: 123 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "otp sent successfully to the user email",
        emailSended
      )
    );
});

//verify otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const email = req.user?.email;
  const { otp } = req.body;

  if (!email?.trim() || !otp?.trim()) {
    throw new ApiError(400, "All fields are mandatory");
  }

  const user = await User.findOne({
    email,
    otpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "User not found or OTP expired");
  }

  const isOtpCorrect = await user.verifyOtp(otp);
  if (!isOtpCorrect) {
    throw new ApiError(400, "OTP is incorrect");
  }

  user.otp = null;
  user.otpExpiry = null;
  user.isVerified = true;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP verified successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  return res
    .status(200)
    .json(new ApiResponse(200, "user fetched successfully", user));
});


export const updateUserAddress = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { addressObject } = req.body;

  const {address, zipcode} = addressObject;

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  if (!validateMongooseId(userId)) {
    throw new ApiError(400, "user id is invalid");
  }

  if(!address || !zipcode) {
    throw new ApiError(400, "All fields are mandatory");
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        address: {
          address,
          zipcode
        }
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "user address updated successfully", user));
});


export const orderInfoEmail = asyncHandler(async (req, res) => {
  const { order } = req.body;

  if (!order) {
    throw new ApiError(400, "order info are mandatory");
  }

  const generateOrderEmail = (order) => {
    const { name, email, adress, zipcode, notes, checkoutSubmission } = order;
    const { itemOrdered, subCartTotal, cartTotal, shippingDiscount } = checkoutSubmission;

    const itemsList = itemOrdered
      .map((item) => `• ${item.name} – ${item.quantity} x $${item.totalPrice}`)
      .join("\n");

    return {
      to: email,
      subject: "🛒 Order Confirmation – Thank You for Your Purchase!",
      text: `Dear ${name},

Thank you for your order! Here are your order details:

📍 Shipping Address:
${adress}, ${zipcode}

📌 Order Notes: ${notes}

🛍️ Items Ordered:
${itemsList}

💰 Subtotal: $${subCartTotal}
🚚 Shipping Charge: $${shippingDiscount}
💳 Total Amount: $${cartTotal}

Your order is being processed. We'll notify you once it’s shipped.

For any inquiries, contact us at support@example.com.

🔹 Thank you for shopping with us!

Best regards,  
[Your Store Name]`,
    };
  };

  agenda.now("order-info-email", generateOrderEmail(order));

  return res
    .status(200)
    .json(new ApiResponse(200, "order info email sent successfully"));
});
