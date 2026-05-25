import AuditLog from "../models/AuditLog.js"

// @GET /api/audit — superadmin
export const getAuditLogs = async function(req, res) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.category) filter.category = req.query.category
    if (req.query.admin) filter.admin = req.query.admin

    const total = await AuditLog.countDocuments(filter)
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/audit — superadmin
export const clearAuditLogs = async function(req, res) {
  try {
    await AuditLog.deleteMany({})
    res.json({ success: true, message: "Audit logs cleared" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}