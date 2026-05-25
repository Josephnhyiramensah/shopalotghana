import Notification from "../models/Notification.js"

// @GET /api/notifications
export const getNotifications = async function(req, res) {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({ isRead: false })

    res.json({ success: true, notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/notifications/mark-all-read
export const markAllRead = async function(req, res) {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true })
    res.json({ success: true, message: "All marked as read" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/notifications/:id/read
export const markOneRead = async function(req, res) {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/notifications/clear
export const clearAll = async function(req, res) {
  try {
    await Notification.deleteMany({})
    res.json({ success: true, message: "All notifications cleared" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}