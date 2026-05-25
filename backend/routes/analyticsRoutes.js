import express from "express"
import {
  getOverview, getRevenueChart,
  getTopProducts, getPaymentStats, getRegionStats
} from "../controllers/analyticsController.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/overview", protect, adminOnly, getOverview)
router.get("/revenue", protect, adminOnly, getRevenueChart)
router.get("/top-products", protect, adminOnly, getTopProducts)
router.get("/payment-stats", protect, adminOnly, getPaymentStats)
router.get("/regions", protect, adminOnly, getRegionStats)

export default router