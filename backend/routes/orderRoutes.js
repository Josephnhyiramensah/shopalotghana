import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js"
import {
  protect,
  adminOnly,
  superAdminOnly,
  optionalAuth
} from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/", optionalAuth, createOrder)
router.get("/my-orders", protect, getMyOrders)
router.get("/", protect, adminOnly, getAllOrders)
router.get("/:id", optionalAuth, getOrderById)
router.put("/:id/status", protect, adminOnly, updateOrderStatus)
router.delete("/:id", protect, superAdminOnly, deleteOrder)

export default router