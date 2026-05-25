import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0 },
  category: {
    type: String,
    required: true,
    enum: ["Kitchen Appliances", "Plumbing Materials", "Electronics", "Fashion"]
  },
  subCategory: { type: String },  // e.g. "Air Fryers", "Faucets"
  brand: { type: String },
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  images: [{
    url: { type: String, required: true },   // Cloudinary URL
    public_id: { type: String }              // For deletion
  }],
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  tags: [String],     // e.g. ["sale", "new arrival", "bestseller"]
  sizes: [String],    // For fashion
  colors: [String],
}, { timestamps: true });

// Text search index
productSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
