import { Router } from "express";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// add to wishlist
router.route("/").post(verifyToken, addToWishlist);

// get wishlist
router.route("/").get(verifyToken, getWishlist);

// remove from wishlist
router.route("/:productId").delete(verifyToken, removeFromWishlist);

export default router;