import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsBySubCategory,
  filteration,
  getRelatedProducts,
  searchProducts,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// create product
router
  .route("/")
  .post(
    upload.array("images", 5),
    createProduct
  )
  .get(getProducts);

router.route('/filter').get(filteration); 

router.route('/related').get(getRelatedProducts);

router.route('/search').get(searchProducts);

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
