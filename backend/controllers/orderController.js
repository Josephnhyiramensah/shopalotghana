import process from "node:process"
import Order from "../models/Order.js"
import User from "../models/User.js"
import Notification from "../models/Notification.js"
import sendEmail from "../utils/sendEmail.js"
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from "../utils/emailTemplates.js"

// @POST /api/orders
export const createOrder = async function(req, res) {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      subtotal,
      discount,
      deliveryFee,
      totalPrice,
      coupon,
      guestInfo,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items"
      })
    }

    if (!totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Total price is required"
      })
    }

    const order = await Order.create({
      user:        req.user?._id || null,
      guestInfo:   guestInfo || null,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice:  itemsPrice || subtotal || 0,
      discount:    discount || 0,
      deliveryFee: deliveryFee || 0,
      totalPrice,
      coupon:  coupon || null,
      status:  "pending",
      isPaid:  false,
    })

    // ── Admin notification ──
    try {
      const customerName = guestInfo?.name || req.user?.name || "Guest"
      await Notification.create({
        type:    "new_order",
        title:   "New Order Received! 🛍️",
        message: customerName + " placed an order worth GH₵" +
                 (totalPrice || 0).toFixed(2),
        link:    "/admin/orders",
        data: {
          orderId: order._id,
          customerName,
          totalPrice,
        }
      })
    } catch (notifErr) {
      console.log("Notification error:", notifErr.message)
    }

    // ── Send confirmation email ──
    try {
      let emailTo = guestInfo?.email || null

      if (!emailTo && req.user?._id) {
        const fullUser = await User.findById(req.user._id).select("email")
        emailTo = fullUser?.email || null
      }

      if (emailTo) {
        const orderWithEmail = {
          ...order.toObject(),
          user: { name: req.user?.name || "Customer", email: emailTo }
        }
        const emailData = orderConfirmationEmail(orderWithEmail)
        await sendEmail(emailData)
        console.log("Confirmation email sent to:", emailTo)
      } else {
        console.log("No email found for order:", order._id)
      }
    } catch (emailErr) {
      console.log("Email send failed:", emailErr.message)
    }

    console.log("Order created successfully:", order._id)
    res.status(201).json({ success: true, order })

  } catch (err) {
    console.log("CREATE ORDER ERROR:", err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/orders/my-orders
export const getMyOrders = async function(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/orders/:id
export const getOrderById = async function(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/orders [ADMIN]
export const getAllOrders = async function(req, res) {
  try {
    const page  = Number(req.query.page)  || 1
    const limit = Number(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.keyword) {
      filter["$or"] = [
        { "guestInfo.name":  { $regex: req.query.keyword, $options: "i" } },
        { "guestInfo.email": { $regex: req.query.keyword, $options: "i" } },
      ]
    }

    const total  = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      orders,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/orders/:id/status [ADMIN]
export const updateOrderStatus = async function(req, res) {
  try {
    const { status } = req.body

    const validStatuses = [
      "pending", "processing", "shipped", "delivered", "cancelled"
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      })
    }

    const update = { status }
    if (status === "delivered") {
      update.isDelivered = true
      update.deliveredAt = Date.now()
      update.isPaid      = true
      update.paidAt      = Date.now()
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate("user", "name email")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    // ── Status change email ──
    try {
      const emailTo = order.guestInfo?.email || order.user?.email
      if (emailTo) {
        if (status === "shipped") {
          await sendEmail(orderShippedEmail(order))
        } else if (status === "delivered") {
          await sendEmail(orderDeliveredEmail(order))
        } else if (status === "cancelled") {
          await sendEmail(orderCancelledEmail(order))
        }
        console.log("Status email sent:", status, "→", emailTo)
      }
    } catch (emailErr) {
      console.log("Status email failed:", emailErr.message)
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/orders/:id [SUPERADMIN]
export const deleteOrder = async function(req, res) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    await order.deleteOne()
    console.log("Order deleted:", req.params.id)
    res.json({ success: true, message: "Order deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// suppress unused import warning
const _p = process
void _p