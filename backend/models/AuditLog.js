import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  adminName: { type: String },
  adminEmail: { type: String },
  action: { type: String, required: true },
  category: {
    type: String,
    enum: ["product", "order", "user", "coupon", "settings", "auth", "export"],
    default: "product"
  },
  details: { type: String },
  ipAddress: { type: String },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success"
  }
}, { timestamps: true })

const AuditLog = mongoose.model("AuditLog", auditLogSchema)
export default AuditLog