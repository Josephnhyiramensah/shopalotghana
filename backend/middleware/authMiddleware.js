import jwt from "jsonwebtoken"
import process from "node:process"
import User from "../models/User.js"
import AuditLog from "../models/AuditLog.js"

// Full auth — requires valid token
export const protect = async function(req, res, next) {
  let token
  if (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select("-password")
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }
    if (req.user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned"
      })
    }
    next()
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid" })
  }
}

// Optional auth — attaches user if token exists, continues without if not
export const optionalAuth = async function(req, res, next) {
  let token
  if (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select("-password")
    } catch {
      req.user = null
    }
  }
  next()
}

// Admin only — must be admin or superadmin
export const adminOnly = function(req, res, next) {
  if (!["admin", "superadmin"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    })
  }
  next()
}

// Super admin only
export const superAdminOnly = function(req, res, next) {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required"
    })
  }
  next()
}

// Permission check for staff
export const hasPermission = function(permission) {
  return function(req, res, next) {
    if (req.user?.role === "superadmin") return next()
    if (req.user?.role === "admin") return next()
    if (req.user?.permissions?.[permission]) return next()
    return res.status(403).json({
      success: false,
      message: "You do not have permission for this action"
    })
  }
}

// Log admin actions
export const auditLog = function(action, category) {
  return async function(req, res, next) {
    const originalJson = res.json.bind(res)
    res.json = async function(data) {
      if (req.user && ["admin", "superadmin", "staff"].includes(req.user.role)) {
        try {
          await AuditLog.create({
            admin: req.user._id,
            adminName: req.user.name,
            adminEmail: req.user.email,
            action: action,
            category: category,
            details: JSON.stringify(req.body).slice(0, 200),
            ipAddress: req.ip,
            status: data.success ? "success" : "failed"
          })
        } catch {
          // Don't block response if audit fails
        }
      }
      return originalJson(data)
    }
    next()
  }
}