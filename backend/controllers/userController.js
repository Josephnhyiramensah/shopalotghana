import User from "../models/User.js"
import Order from "../models/Order.js"

// @GET /api/users — admin
export const getAllUsers = async function(req, res) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    const keyword = req.query.keyword

    const filter = { role: "user" }
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ]
    }

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/users/admins — superadmin
export const getAllAdmins = async function(req, res) {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "staff", "superadmin"] }
    }).select("-password").sort({ createdAt: -1 })
    res.json({ success: true, admins })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/users/:id/ban — admin
export const banUser = async function(req, res) {
  try {
    const { reason } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, bannedReason: reason || "Violation of terms" },
      { new: true }
    ).select("-password")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.json({ success: true, message: "User banned", user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/users/:id/unban — admin
export const unbanUser = async function(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, bannedReason: "" },
      { new: true }
    ).select("-password")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    res.json({ success: true, message: "User unbanned", user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/users/:id — superadmin
export const deleteUser = async function(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
    if (user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot delete super admin" })
    }
    await user.deleteOne()
    res.json({ success: true, message: "User deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/users/:id/promote
export const promoteUser = async function(req, res) {
  try {
    const { role } = req.body
    const validRoles = ["user", "staff", "admin", "superadmin"]

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      })
    }

    // Only superadmin can assign superadmin or admin role
    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can assign this role"
      })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.json({ success: true, user, message: "Role updated to " + role })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}




// @GET /api/users/:id/orders — admin
export const getUserOrders = async function(req, res) {
  try {
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}