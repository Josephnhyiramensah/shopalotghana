import express from "express"
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/update-profile", protect, updateProfile)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:token", resetPassword)

export default router