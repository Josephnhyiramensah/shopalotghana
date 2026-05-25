import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["new_order", "low_stock", "new_user", "payment"],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: "" },
  isRead:  { type: Boolean, default: false },
  data:    { type: Object, default: {} },
}, { timestamps: true })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification