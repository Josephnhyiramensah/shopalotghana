import express from "express"
import {
  getInventory,
  getLowStockProducts,
  getAllLogs,
  getProductLogs,
  stockIn,
  stockOut,
  adjustStock,
  addNote,
} from "../controllers/inventoryController.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/",                        protect, adminOnly, getInventory)
router.get("/low-stock",               protect, adminOnly, getLowStockProducts)
router.get("/logs",                    protect, adminOnly, getAllLogs)
router.get("/:productId/logs",         protect, adminOnly, getProductLogs)
router.post("/:productId/stock-in",    protect, adminOnly, stockIn)
router.post("/:productId/stock-out",   protect, adminOnly, stockOut)
router.post("/:productId/adjust",      protect, adminOnly, adjustStock)
router.post("/:productId/note",        protect, adminOnly, addNote)

export default router