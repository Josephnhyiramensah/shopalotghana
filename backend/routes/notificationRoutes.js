import express from "express"
import {
  getNotifications,
  markAllRead,
  markOneRead,
  clearAll,
} from "../controllers/notificationController.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/",                   protect, adminOnly, getNotifications)
router.put("/mark-all-read",      protect, adminOnly, markAllRead)
router.put("/:id/read",           protect, adminOnly, markOneRead)
router.delete("/clear",           protect, adminOnly, clearAll)

export default router