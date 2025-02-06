import { Router } from "express";
import {
  createCategory,
  createSubCategory,
  getCategories,
  getSubCategories,
  getSubCategoriesByCategoryId,
  updateCategory,
  updateSubCategory,
  deleteCategory,
  deleteSubCategory,
} from "../controllers/category.controller.js";

const router = Router();

// category
router.route("/").post(createCategory).get(getCategories);

// update and delete category
router.route("/:categoryId").patch(updateCategory).delete(deleteCategory);

// sub category
router.route("/sub-category").post(createSubCategory).get(getSubCategories);

// update and delete sub category
router
  .route("/sub-category/:subCategoryId")
  .patch(updateSubCategory)
  .delete(deleteSubCategory);

// get sub categories by category id
router.route("/sub-category/:categoryId").get(getSubCategoriesByCategoryId);

export default router;
