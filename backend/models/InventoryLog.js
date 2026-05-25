import mongoose from "mongoose"

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  type: {
    type: String,
    enum: ["stock_in", "stock_out", "adjustment", "note"],
    required: true,
  },
  quantity: { type: Number, default: 0 },
  stockBefore: { type: Number, default: 0 },
  stockAfter: { type: Number, default: 0 },
  reason: { type: String, default: "" },
  note: { type: String, default: "" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdByName: { type: String, default: "Admin" },
}, { timestamps: true })

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema)
export default InventoryLog