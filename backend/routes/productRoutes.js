import express from "express";
import { getProducts, getProductById, getFeaturedProducts, getRecommendations,
         createProduct, updateProduct, deleteProduct, addReview, getReviews }
  from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router();
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/:id/recommendations", getRecommendations);
router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", protect, addReview);
router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
export default router;