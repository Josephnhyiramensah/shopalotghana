import express from "express";
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon }
  from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/validate", validateCoupon);
router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getAllCoupons);
router.delete("/:id", protect, adminOnly, deleteCoupon);
export default router;