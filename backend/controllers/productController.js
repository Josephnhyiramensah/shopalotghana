import Product from "../models/Product.js"
import Review from "../models/Review.js"
import { uploadToCloudinary } from "../middleware/uploadMiddleware.js"

// @GET /api/products
export const getProducts = async function(req, res) {
  try {
    const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 16 } = req.query

    const query = {}
    if (keyword) query.$text = { $search: keyword }
    if (category) query.category = category
    if (minPrice || maxPrice) query.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) })
    }

    const sortOptions = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "newest": { createdAt: -1 },
      "top-rated": { ratings: -1 },
    }

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, total, pages: Math.ceil(total / limit), products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/products/featured
export const getFeaturedProducts = async function(req, res) {
  const products = await Product.find({ featured: true }).limit(8)
  res.json({ success: true, products })
}

// @GET /api/products/:id
export const getProductById = async function(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: "Product not found" })
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/products/:id/recommendations
export const getRecommendations = async function(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4)
    res.json({ success: true, products: related })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/products [ADMIN]
export const createProduct = async function(req, res) {
  try {
    const imageUrls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer)
        imageUrls.push({ url: result.secure_url, public_id: result.public_id })
      }
    }
    const product = await Product.create({ ...req.body, images: imageUrls })
    res.status(201).json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/products/:id [ADMIN]
export const updateProduct = async function(req, res) {
  try {
    const imageUrls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer)
        imageUrls.push({ url: result.secure_url, public_id: result.public_id })
      }
    }
    const updateData = imageUrls.length > 0
      ? { ...req.body, images: imageUrls }
      : req.body

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!product) return res.status(404).json({ success: false, message: "Product not found" })
    res.json({ success: true, product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @DELETE /api/products/:id [ADMIN]
export const deleteProduct = async function(req, res) {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Product deleted" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/products/:id/reviews
export const addReview = async function(req, res) {
  try {
    const { rating, comment } = req.body
    const existing = await Review.findOne({ product: req.params.id, user: req.user.id })
    if (existing) return res.status(400).json({ success: false, message: "Already reviewed" })

    await Review.create({
      product: req.params.id,
      user: req.user.id,
      name: req.user.name,
      rating,
      comment
    })
    res.status(201).json({ success: true, message: "Review added" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/products/:id/reviews
export const getReviews = async function(req, res) {
  const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 })
  res.json({ success: true, reviews })
}