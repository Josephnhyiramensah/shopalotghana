import Product from "../models/Product.js"
import InventoryLog from "../models/InventoryLog.js"
import { checkLowStock } from "../utils/checkLowStock.js"

// @GET /api/inventory
export const getInventory = async function(req, res) {
  try {
    const { search, stockFilter } = req.query

    const filter = {}
    if (search) {
      filter.name = { $regex: search, $options: "i" }
    }
    if (stockFilter === "low") {
      filter.stock = { $gt: 0, $lte: 5 }
    } else if (stockFilter === "out") {
      filter.stock = 0
    } else if (stockFilter === "in") {
      filter.stock = { $gt: 5 }
    }

    const products = await Product.find(filter)
      .select("name category stock price images")
      .sort({ stock: 1 })

    const totalProducts = await Product.countDocuments()
    const lowStock      = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } })
    const outOfStock    = await Product.countDocuments({ stock: 0 })
    const inStock       = await Product.countDocuments({ stock: { $gt: 5 } })

    res.json({
      success: true,
      products,
      stats: { totalProducts, lowStock, outOfStock, inStock },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/inventory/low-stock
export const getLowStockProducts = async function(req, res) {
  try {
    const products = await Product.find({ stock: { $lte: 5 } })
      .select("name category stock images")
      .sort({ stock: 1 })

    res.json({ success: true, products, total: products.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/inventory/logs
export const getAllLogs = async function(req, res) {
  try {
    const page  = Number(req.query.page)  || 1
    const limit = Number(req.query.limit) || 20
    const skip  = (page - 1) * limit

    const filter = {}
    if (req.query.type) filter.type = req.query.type

    const total = await InventoryLog.countDocuments(filter)
    const logs  = await InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/inventory/:productId/logs
export const getProductLogs = async function(req, res) {
  try {
    const logs = await InventoryLog.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ success: true, logs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/inventory/:productId/stock-in
export const stockIn = async function(req, res) {
  try {
    const { quantity, reason, note } = req.body
    const qty = Number(quantity)

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      })
    }

    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    const stockBefore = product.stock
    const stockAfter  = stockBefore + qty

    await Product.findByIdAndUpdate(req.params.productId, { stock: stockAfter })

    await InventoryLog.create({
      product:       product._id,
      productName:   product.name,
      type:          "stock_in",
      quantity:      qty,
      stockBefore,
      stockAfter,
      reason:        reason || "Stock replenishment",
      note:          note || "",
      createdBy:     req.user._id,
      createdByName: req.user.name,
    })

    res.json({
      success: true,
      message: qty + " units added to " + product.name,
      newStock: stockAfter,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/inventory/:productId/stock-out
export const stockOut = async function(req, res) {
  try {
    const { quantity, reason, note } = req.body
    const qty = Number(quantity)

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      })
    }

    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock. Available: " + product.stock
      })
    }

    const stockBefore = product.stock
    const stockAfter  = stockBefore - qty

    await Product.findByIdAndUpdate(req.params.productId, { stock: stockAfter })

    await InventoryLog.create({
      product:       product._id,
      productName:   product.name,
      type:          "stock_out",
      quantity:      qty,
      stockBefore,
      stockAfter,
      reason:        reason || "Manual stock out",
      note:          note || "",
      createdBy:     req.user._id,
      createdByName: req.user.name,
    })

    // ✅ Auto low stock check
    await checkLowStock(req.params.productId)

    res.json({
      success: true,
      message: qty + " units removed from " + product.name,
      newStock: stockAfter,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/inventory/:productId/adjust
export const adjustStock = async function(req, res) {
  try {
    const { newStock, reason, note } = req.body
    const qty = Number(newStock)

    if (qty < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative"
      })
    }

    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    const stockBefore = product.stock

    await Product.findByIdAndUpdate(req.params.productId, { stock: qty })

    await InventoryLog.create({
      product:       product._id,
      productName:   product.name,
      type:          "adjustment",
      quantity:      Math.abs(qty - stockBefore),
      stockBefore,
      stockAfter:    qty,
      reason:        reason || "Manual adjustment",
      note:          note || "",
      createdBy:     req.user._id,
      createdByName: req.user.name,
    })

    // ✅ Auto low stock check
    await checkLowStock(req.params.productId)

    res.json({
      success: true,
      message: product.name + " stock adjusted to " + qty,
      newStock: qty,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/inventory/:productId/note
export const addNote = async function(req, res) {
  try {
    const { note } = req.body

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: "Note cannot be empty" })
    }

    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    await InventoryLog.create({
      product:       product._id,
      productName:   product.name,
      type:          "note",
      quantity:      0,
      stockBefore:   product.stock,
      stockAfter:    product.stock,
      reason:        "Note",
      note:          note.trim(),
      createdBy:     req.user._id,
      createdByName: req.user.name,
    })

    res.json({ success: true, message: "Note added successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}