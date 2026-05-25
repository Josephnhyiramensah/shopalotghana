import Product from "../models/Product.js"
import Notification from "../models/Notification.js"

export async function checkLowStock(productId) {
  try {
    const product = await Product.findById(productId)
    if (!product) return

    const LOW_THRESHOLD = 5

    if (product.stock === 0) {
      // Check if we already have an unread out-of-stock notification
      const existing = await Notification.findOne({
        "data.productId": productId.toString(),
        type: "low_stock",
        "data.alertType": "out_of_stock",
        isRead: false,
      })

      if (!existing) {
        await Notification.create({
          type:    "low_stock",
          title:   "🚨 Out of Stock!",
          message: product.name + " is completely out of stock — restock immediately!",
          link:    "/admin/inventory",
          data: {
            productId:  productId.toString(),
            alertType:  "out_of_stock",
            stock:      0,
            productName: product.name,
          }
        })
      }
    } else if (product.stock <= LOW_THRESHOLD) {
      // Check if we already have an unread low-stock notification
      const existing = await Notification.findOne({
        "data.productId": productId.toString(),
        type: "low_stock",
        "data.alertType": "low_stock",
        isRead: false,
      })

      if (!existing) {
        await Notification.create({
          type:    "low_stock",
          title:   "⚠️ Low Stock Alert",
          message: product.name + " only has " + product.stock +
                   " unit(s) left — consider restocking soon.",
          link:    "/admin/inventory",
          data: {
            productId:   productId.toString(),
            alertType:   "low_stock",
            stock:       product.stock,
            productName: product.name,
          }
        })
      }
    }
  } catch (err) {
    console.log("Low stock check error:", err.message)
  }
}