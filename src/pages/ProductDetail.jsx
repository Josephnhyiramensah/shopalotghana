import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { useAuth } from "../hooks/useAuth"
import { formatGHS } from "../utils/formatCurrency"
import { trackViewProduct, trackAddToCart } from "../utils/analytics"
import toast from "react-hot-toast"
import {
  FiShoppingCart, FiHeart, FiStar, FiTruck,
  FiShield, FiRefreshCw, FiMinus, FiPlus,
  FiShare2, FiChevronRight
} from "react-icons/fi"

function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <FiStar
            key={star}
            size={size}
            className={star <= Math.round(rating) ? "" : "text-gray-300"}
            style={star <= Math.round(rating)
              ? { color: "#FF6F00", fill: "#FF6F00" } : {}}
          />
        )
      })}
    </div>
  )
}

function ReviewForm({ productId, onReviewAdded }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hovered, setHovered] = useState(0)
  const [loading, setLoading] = useState(false)

  const submitReview = async function(e) {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to leave a review")
      return
    }
    setLoading(true)
    try {
      await axios.post("/products/" + productId + "/reviews", { rating, comment })
      toast.success("Review submitted!")
      setComment("")
      setRating(5)
      onReviewAdded()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <h4 className="font-bold text-gray-800 mb-4">Write a Review</h4>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(function(star) {
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={function() { setHovered(star) }}
                onMouseLeave={function() { setHovered(0) }}
                onClick={function() { setRating(star) }}
              >
                <FiStar
                  size={28}
                  className={(hovered || rating) >= star
                    ? "text-[#FFA07A] fill-[#FFA07A]"
                    : "text-gray-300"}
                />
              </button>
            )
          })}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={function(e) { setComment(e.target.value) }}
        placeholder="Share your experience with this product..."
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                   outline-none focus:border-[#FF4500] resize-none mb-4"
      />
      <button
        onClick={submitReview}
        disabled={loading || !comment.trim()}
        className="bg-[#FF4500] hover:bg-red-700 disabled:bg-gray-300
                   text-white px-6 py-2.5 rounded-xl font-medium text-sm transition"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  )
}

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const image = product.images && product.images.length > 0
    ? product.images[0].url
    : "https://placehold.co/300x300?text=No+Image"
  const hasDiscount = product.discountPrice && product.discountPrice > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all
                    duration-300 overflow-hidden group border border-gray-100">
      <Link to={"/product/" + product._id}>
        <img
          src={image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105
                     transition-transform duration-500"
        />
      </Link>
      <div className="p-3">
        <Link to={"/product/" + product._id}>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2
                         hover:text-[#FF4500] transition mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1D3557] text-sm">
            {formatGHS(hasDiscount ? product.discountPrice : product.price)}
          </span>
          <button
            onClick={function() {
              addToCart(product)
              trackAddToCart(product)
              toast.success("Added to cart!")
            }}
            className="bg-[#FF4500] text-white p-1.5 rounded-lg hover:bg-red-700 transition"
          >
            <FiShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, items } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")

  const inWishlist = product ? isInWishlist(product._id) : false
  const inCart = product ? items.some(function(i) { return i._id === product._id }) : false

  const fetchProduct = useCallback(async function() {
    setLoading(true)
    try {
      const { data } = await axios.get("/products/" + id)
      setProduct(data.product)
      trackViewProduct(data.product)
      setReviews(data.product?.reviews || [])
      try {
        const recRes = await axios.get("/products/" + id + "/recommendations")
        setRecommendations(recRes.data.products || [])
      } catch {
        setRecommendations([])
      }
    } catch (err) {
      console.log("Product fetch error:", err.message)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(function() {
    fetchProduct()
  }, [fetchProduct])

  const handleAddToCart = function() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    trackAddToCart(product)
    toast.success(product.name + " added to cart!")
  }

  const handleBuyNow = function() {
    handleAddToCart()
    navigate("/cart")
  }

  const handleShare = function() {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h2>
        <Link to="/shop"
          className="bg-[#FF4500] text-white font-bold px-6 py-3 rounded-xl
                     hover:bg-red-700 transition inline-block">
          Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://placehold.co/600x600?text=No+Image" }]

  const hasDiscount = product.discountPrice && product.discountPrice > 0
  const savings = hasDiscount ? product.price - product.discountPrice : 0
  const displayPrice = hasDiscount ? product.discountPrice : product.price

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-[#FF4500] transition">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/shop" className="hover:text-[#FF4500] transition">Shop</Link>
        <FiChevronRight size={14} />
        <Link
          to={"/shop?category=" + encodeURIComponent(product.category)}
          className="hover:text-[#FF4500] transition"
        >
          {product.category}
        </Link>
        <FiChevronRight size={14} />
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Product section */}
      <div className="flex flex-col lg:flex-row gap-10 mb-16">

        {/* Images */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-4
                          border border-gray-100">
            <img
              src={images[selectedImage]?.url || images[0].url}
              alt={product.name}
              className="w-full h-96 object-contain p-4"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#E63946] text-white
                               text-sm font-bold px-3 py-1 rounded-xl">
                SALE
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map(function(img, i) {
                return (
                  <button
                    key={i}
                    onClick={function() { setSelectedImage(i) }}
                    className={"flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden " +
                      "border-2 transition " +
                      (selectedImage === i
                        ? "border-[#E63946]"
                        : "border-gray-200 hover:border-gray-400")}
                  >
                    <img src={img.url} alt={"Image " + (i + 1)}
                      className="w-full h-full object-cover" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-sm text-[#E63946] font-semibold mb-2">{product.category}</p>
          <h1 className="text-3xl font-extrabold text-[#1D3557] mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.ratings || 0} size={20} />
            <span className="text-sm text-gray-500">
              {(product.ratings || 0).toFixed(1)} ({product.numReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-extrabold text-[#E63946]">
              {formatGHS(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through mb-1">
                {formatGHS(product.price)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-green-600 font-semibold text-sm mb-4">
              You save {formatGHS(savings)}!
            </p>
          )}

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="bg-green-100 text-green-700 text-sm font-semibold
                               px-3 py-1 rounded-full">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 text-sm font-semibold
                               px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl
                              overflow-hidden">
                <button
                  onClick={function() {
                    setQuantity(function(q) { return Math.max(1, q - 1) })
                  }}
                  className="px-4 py-2 hover:bg-gray-100 transition text-gray-600"
                >
                  <FiMinus size={16} />
                </button>
                <span className="px-5 py-2 font-bold text-gray-800
                                 border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={function() {
                    setQuantity(function(q) { return Math.min(product.stock, q + 1) })
                  }}
                  className="px-4 py-2 hover:bg-gray-100 transition text-gray-600"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E63946]
                         hover:bg-red-700 disabled:bg-gray-300 text-white font-bold
                         py-3 rounded-xl transition text-sm"
            >
              <FiShoppingCart size={18} />
              {inCart ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-[#1D3557] hover:bg-blue-900 disabled:bg-gray-300
                         text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Buy Now
            </button>
            <button
              onClick={function() {
                inWishlist ? removeFromWishlist(product._id) : addToWishlist(product)
                toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist!")
              }}
              className={"border-2 p-3 rounded-xl transition " +
                (inWishlist
                  ? "border-[#E63946] bg-red-50"
                  : "border-gray-200 hover:border-[#E63946]")}
            >
              <FiHeart
                size={20}
                className={inWishlist
                  ? "text-[#E63946] fill-[#E63946]" : "text-gray-400"}
              />
            </button>
            <button
              onClick={handleShare}
              className="border-2 border-gray-200 hover:border-gray-400
                         p-3 rounded-xl transition"
            >
              <FiShare2 size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <FiTruck size={18} />, label: "Fast Delivery", color: "text-blue-500" },
              { icon: <FiShield size={18} />, label: "Secure Payment", color: "text-green-500" },
              { icon: <FiRefreshCw size={18} />, label: "7-Day Returns", color: "text-orange-500" },
            ].map(function(item) {
              return (
                <div key={item.label}
                  className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl
                             p-3 text-center border border-gray-100">
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          {["description", "reviews"].map(function(tab) {
            return (
              <button
                key={tab}
                onClick={function() { setActiveTab(tab) }}
                className={"pb-3 text-sm font-semibold capitalize transition border-b-2 " +
                  (activeTab === tab
                    ? "border-[#E63946] text-[#E63946]"
                    : "border-transparent text-gray-500 hover:text-gray-800")}
              >
                {tab === "reviews"
                  ? "Reviews (" + reviews.length + ")"
                  : "Description"}
              </button>
            )
          })}
        </div>

        {activeTab === "description" && (
          <div className="text-gray-600 leading-relaxed">
            <p>{product.description}</p>
            {product.brand && (
              <p className="mt-4">
                <span className="font-semibold text-gray-800">Brand:</span> {product.brand}
              </p>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map(function(tag) {
                  return (
                    <span key={tag}
                      className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-6
                            border border-gray-100">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#1D3557]">
                  {(product.ratings || 0).toFixed(1)}
                </div>
                <StarRating rating={product.ratings || 0} size={20} />
                <p className="text-sm text-gray-500 mt-1">
                  {product.numReviews || 0} reviews
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map(function(review) {
                return (
                  <div key={review._id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E63946] text-white
                                        flex items-center justify-center font-bold">
                          {review.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {review.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("en-GH", {
                              year: "numeric", month: "long", day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )
              })
            )}

            <ReviewForm productId={id} onReviewAdded={fetchProduct} />
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map(function(rec) {
              return <ProductCard key={rec._id} product={rec} />
            })}
          </div>
        </div>
      )}
    </div>
  )
}