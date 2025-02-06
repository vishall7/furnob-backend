import { Router } from "express";
import {
    createBrand,
    getBrands,
    updateBrand,
    deleteBrand,
} from "../controllers/brand.controller.js";

const router = Router();

// create and get brand
router.route("/").post(createBrand).get(getBrands);

// update and delete brand
router.route("/:brandId").patch(updateBrand).delete(deleteBrand);

export default router;