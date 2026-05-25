import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"

// @GET /api/analytics/overview
export const getOverview = async function(req, res) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      monthOrders,
      lastMonthOrders,
      allOrders
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.find({ createdAt: { $gte: startOfMonth } }),
      Order.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.find({ status: { $ne: "cancelled" } })
    ])

    const totalRevenue = allOrders.reduce(function(sum, o) {
      return sum + o.totalPrice
    }, 0)

    const monthRevenue = monthOrders.reduce(function(sum, o) {
      return o.status !== "cancelled" ? sum + o.totalPrice : sum
    }, 0)

    const lastMonthRevenue = lastMonthOrders.reduce(function(sum, o) {
      return o.status !== "cancelled" ? sum + o.totalPrice : sum
    }, 0)

    const revenueGrowth = lastMonthRevenue > 0
      ? (((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : 0

    res.json({
      success: true,
      overview: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
        monthRevenue,
        lastMonthRevenue,
        revenueGrowth,
        pendingOrders: await Order.countDocuments({ status: "pending" }),
        deliveredOrders: await Order.countDocuments({ status: "delivered" }),
        cancelledOrders: await Order.countDocuments({ status: "cancelled" }),
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/analytics/revenue — monthly revenue for chart
export const getRevenueChart = async function(req, res) {
  try {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: { $ne: "cancelled" }
      })

      const revenue = orders.reduce(function(sum, o) { return sum + o.totalPrice }, 0)

      months.push({
        month: start.toLocaleString("en-GH", { month: "short" }),
        revenue: Math.round(revenue),
        orders: orders.length
      })
    }

    res.json({ success: true, data: months })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/analytics/top-products
export const getTopProducts = async function(req, res) {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ])
    res.json({ success: true, products: topProducts })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/analytics/payment-methods
export const getPaymentStats = async function(req, res) {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      }
    ])
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/analytics/regions
export const getRegionStats = async function(req, res) {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$shippingAddress.region",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { orders: -1 } },
      { $limit: 10 }
    ])
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}