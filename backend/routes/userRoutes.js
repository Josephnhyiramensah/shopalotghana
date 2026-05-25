import express from "express"
import {
  getAllUsers, getAllAdmins, banUser, unbanUser,
  deleteUser, promoteUser, getUserOrders
} from "../controllers/userController.js"
import { protect, adminOnly, superAdminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", protect, adminOnly, getAllUsers)
router.get("/admins", protect, superAdminOnly, getAllAdmins)
router.put("/:id/ban", protect, adminOnly, banUser)
router.put("/:id/unban", protect, adminOnly, unbanUser)
router.delete("/:id", protect, superAdminOnly, deleteUser)
router.put("/:id/promote", protect, superAdminOnly, promoteUser)
router.get("/:id/orders", protect, adminOnly, getUserOrders)
router.put("/:id/promote", protect, adminOnly, promoteUser)

export default router