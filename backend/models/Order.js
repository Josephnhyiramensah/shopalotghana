import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
  }],
  shippingAddress: {
    street: String,
    city: String,
    region: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ["mobile_money", "card", "cash_on_delivery"],
    required: true,
  },
  itemsPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentReference: { type: String },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)
export default Order