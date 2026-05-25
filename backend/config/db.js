import mongoose from "mongoose"
import dotenv from "dotenv"
import process from "node:process"

dotenv.config()

export const connectDB = async function() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected: " + conn.connection.host + " ✅")
  } catch (err) {
    console.error("MongoDB connection error: " + err.message)
    process.exit(1)
  }
}