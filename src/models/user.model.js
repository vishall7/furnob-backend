import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// username, email, password, role, phone, address

const addressShcema = new Schema({
    _id: false,
    address: {
        type: String,
        required: true,
    },
    zipcode: {
        type: String,
        required: true,
    },
})

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowerCase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: addressShcema,
            default: null,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        otp: {
          type: String,
          default: null,  
        },
        otpExpiry: {
            type: Date,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.otp;
        delete ret.otpExpiry;
        delete ret.__v;
        return ret;
    }
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    return next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.verifyOtp = async function (otp) {
    return await bcrypt.compare(otp, this.otp);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            isAdmin: this.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};

export const User = mongoose.model("User", userSchema);