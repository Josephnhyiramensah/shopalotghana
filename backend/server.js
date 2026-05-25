import process from "node:process"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import couponRoutes from "./routes/couponRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import exportRoutes from "./routes/exportRoutes.js"
import auditRoutes from "./routes/auditRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
dotenv.config()
connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(helmet())
app.use(morgan("dev"))



app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/users", userRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/export", exportRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/", function(_req, res) {
  res.json({ message: "Shopalotghana API running ✅" })
})

app.use(function(err, _req, res, _next) {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  })
})

const PORT = Number(process.env.PORT) || 5000
app.listen(PORT, function() {
  console.log("Server running on port " + PORT + " 🚀")
})