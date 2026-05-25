import express from "express"
import {
  exportOrders, exportUsers,
  exportFinancial, exportProducts
} from "../controllers/exportController.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/orders", protect, adminOnly, exportOrders)
router.get("/users", protect, adminOnly, exportUsers)
router.get("/financial", protect, adminOnly, exportFinancial)
router.get("/products", protect, adminOnly, exportProducts)

export default router