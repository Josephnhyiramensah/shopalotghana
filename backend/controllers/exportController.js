import Order from "../models/Order.js"
import User from "../models/User.js"
import Product from "../models/Product.js"

// Helper to convert array to CSV
function toCSV(headers, rows) {
  const headerRow = headers.join(",")
  const dataRows = rows.map(function(row) {
    return headers.map(function(h) {
      const val = row[h] !== undefined ? String(row[h]) : ""
      return '"' + val.replace(/"/g, '""') + '"'
    }).join(",")
  })
  return [headerRow, ...dataRows].join("\n")
}

// @GET /api/export/orders
export const exportOrders = async function(req, res) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    const rows = orders.map(function(o) {
      return {
        "Order ID": o._id.toString().slice(-6).toUpperCase(),
        "Customer": o.user?.name || o.guestInfo?.name || "Guest",
        "Email": o.user?.email || o.guestInfo?.email || "",
        "Phone": o.shippingAddress?.phone || "",
        "Region": o.shippingAddress?.region || "",
        "City": o.shippingAddress?.city || "",
        "Items": o.items?.length || 0,
        "Subtotal": o.itemsPrice || 0,
        "Discount": o.discount || 0,
        "Delivery Fee": o.deliveryFee || 0,
        "Total": o.totalPrice || 0,
        "Payment Method": o.paymentMethod || "",
        "Status": o.status || "",
        "Date": new Date(o.createdAt).toLocaleDateString("en-GH")
      }
    })

    const headers = Object.keys(rows[0] || {
      "Order ID": "", "Customer": "", "Email": "",
      "Phone": "", "Region": "", "City": "",
      "Items": "", "Subtotal": "", "Discount": "",
      "Delivery Fee": "", "Total": "", "Payment Method": "",
      "Status": "", "Date": ""
    })

    const csv = toCSV(headers, rows)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv")
    res.send(csv)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/export/users
export const exportUsers = async function(req, res) {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })

    const rows = users.map(function(u) {
      return {
        "Name": u.name || "",
        "Email": u.email || "",
        "Phone": u.phone || "",
        "Status": u.isBanned ? "Banned" : "Active",
        "Joined": new Date(u.createdAt).toLocaleDateString("en-GH")
      }
    })

    const headers = ["Name", "Email", "Phone", "Status", "Joined"]
    const csv = toCSV(headers, rows)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=users.csv")
    res.send(csv)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/export/financial
export const exportFinancial = async function(req, res) {
  try {
    const orders = await Order.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })

    const rows = orders.map(function(o) {
      return {
        "Date": new Date(o.createdAt).toLocaleDateString("en-GH"),
        "Order ID": o._id.toString().slice(-6).toUpperCase(),
        "Subtotal (GHS)": o.itemsPrice || 0,
        "Discount (GHS)": o.discount || 0,
        "Delivery Fee (GHS)": o.deliveryFee || 0,
        "Total (GHS)": o.totalPrice || 0,
        "Payment Method": o.paymentMethod || "",
        "Status": o.status || ""
      }
    })

    const totalRevenue = orders.reduce(function(sum, o) {
      return sum + o.totalPrice
    }, 0)

    rows.push({
      "Date": "",
      "Order ID": "TOTAL",
      "Subtotal (GHS)": "",
      "Discount (GHS)": "",
      "Delivery Fee (GHS)": "",
      "Total (GHS)": totalRevenue,
      "Payment Method": "",
      "Status": ""
    })

    const headers = [
      "Date", "Order ID", "Subtotal (GHS)", "Discount (GHS)",
      "Delivery Fee (GHS)", "Total (GHS)", "Payment Method", "Status"
    ]

    const csv = toCSV(headers, rows)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=financial-report.csv")
    res.send(csv)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/export/products
export const exportProducts = async function(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 })

    const rows = products.map(function(p) {
      return {
        "Name": p.name || "",
        "Category": p.category || "",
        "Price (GHS)": p.price || 0,
        "Discount Price (GHS)": p.discountPrice || 0,
        "Stock": p.stock || 0,
        "Rating": (p.ratings || 0).toFixed(1),
        "Reviews": p.numReviews || 0,
        "Featured": p.featured ? "Yes" : "No",
        "Date Added": new Date(p.createdAt).toLocaleDateString("en-GH")
      }
    })

    const headers = [
      "Name", "Category", "Price (GHS)", "Discount Price (GHS)",
      "Stock", "Rating", "Reviews", "Featured", "Date Added"
    ]

    const csv = toCSV(headers, rows)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=products.csv")
    res.send(csv)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}