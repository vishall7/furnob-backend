import { Router } from "express";
import { signup, login, getUsers, logout, sendOtp, verifyOtp, getCurrentUser, orderInfoEmail, updateUserAddress } from "../controllers/user.controller.js"; 
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

//get users
router.route("/").get(getUsers);

//signup
router.route("/signup").post(signup);

//login
router.route("/login").post(login);

//protected route
router.route("/protected").get(verifyToken, (req, res) => {
    return res
        .status(200)
        .json({
            success: true,
            message: "Protected route",
            user: req.user,
        });
});

//logout
router.route("/logout").post(verifyToken, logout);

router.route("/order").post(verifyToken, orderInfoEmail);

//sendOtp
router.route("/send-otp").post(verifyToken, sendOtp);

//verify otp
router.route("/verify-otp").post(verifyToken, verifyOtp);

// get current user
router.route("/current").get(verifyToken, getCurrentUser);

router.route("/update-address").post(verifyToken, updateUserAddress);


export default router;