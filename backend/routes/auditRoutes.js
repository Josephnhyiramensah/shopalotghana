import express from "express"
import { getAuditLogs, clearAuditLogs } from "../controllers/auditController.js"
import { protect, superAdminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", protect, superAdminOnly, getAuditLogs)
router.delete("/", protect, superAdminOnly, clearAuditLogs)

export default router