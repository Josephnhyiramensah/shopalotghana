import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "Shopalotghana" },
  tagline: { type: String, default: "Quality Living, Locally Delivered" },
  email: { type: String, default: "support@shopalotghana.com" },
  phone: { type: String, default: "+233 XX XXX XXXX" },
  linkedin: { type: String, default: "" },
  address: { type: String, default: "Accra, Ghana" },
  facebook: { type: String, default: "" },
  instagram: { type: String, default: "" },
  tiktok: { type: String, default: "" },
  youtube: { type: String, default: "" },
  twitter: { type: String, default: "" },
  deliveryFee: { type: Number, default: 30 },
  freeDeliveryThreshold: { type: Number, default: 0.00 },
}, { timestamps: true })

const Settings = mongoose.model("Settings", settingsSchema)
export default Settings