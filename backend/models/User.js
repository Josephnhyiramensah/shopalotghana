import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  role: {
    type: String,
    enum: ["user", "staff", "admin", "superadmin"],
    default: "user"
  },
  permissions: {
    manageProducts: { type: Boolean, default: false },
    manageOrders: { type: Boolean, default: false },
    manageCoupons: { type: Boolean, default: false },
    viewFinancials: { type: Boolean, default: false },
    manageUsers: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
  },
  isBanned: { type: Boolean, default: false },
  bannedReason: { type: String },
  addresses: [{
    label: String,
    street: String,
    city: String,
    region: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true })

userSchema.pre("save", async function() {
  if (!this.isModified("password")) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)
export default User