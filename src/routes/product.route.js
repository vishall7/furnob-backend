import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySubCategory,
  productQuery,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// query
router.route("/filter").get(productQuery);

// create product
router
  .route("/")
  .post(
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    createProduct
  )
  .get(getProducts);

router
  .route("/:productId")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

// get product by category
router.route("/category/:categoryId").get(getProductsByCategory);

// get product by sub category

router.route("/sub-category/:subCategoryId").get(getProductsBySubCategory);

export default router;
