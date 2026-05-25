import { Link } from "react-router-dom"
import { useWishlist } from "../hooks/useWishlist"
import { useCart } from "../hooks/useCart"
import { formatGHS } from "../utils/formatCurrency"
import toast from "react-hot-toast"
import {
  FiHeart, FiShoppingCart, FiTrash2,
  FiArrowRight, FiStar
} from "react-icons/fi"

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">💝</div>
        <h2 className="text-3xl font-extrabold text-[#1D3557] mb-3">
          Your Wishlist is Empty
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-red-700
                     text-white font-bold px-8 py-4 rounded-xl transition text-lg"
        >
          <FiHeart size={20} />
          Discover Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1D3557]">My Wishlist</h1>
          <p className="text-gray-500 mt-1">
            {items.length} saved item{items.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-[#E63946] font-semibold
                     hover:gap-2 transition-all text-sm"
        >
          Continue Shopping <FiArrowRight size={16} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(function(product) {
          const image = product.images && product.images.length > 0
            ? product.images[0].url
            : "https://placehold.co/300x300?text=No+Image"
          const hasDiscount = product.discountPrice && product.discountPrice > 0
          const price = hasDiscount ? product.discountPrice : product.price

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all
                         duration-300 overflow-hidden border border-gray-100 group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <Link to={"/product/" + product._id}>
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-52 object-cover group-hover:scale-105
                               transition-transform duration-500"
                  />
                </Link>
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-[#E63946] text-white
                                   text-xs font-bold px-2 py-1 rounded-lg">
                    SALE
                  </span>
                )}
                <button
                  onClick={function() {
                    removeFromWishlist(product._id)
                    toast.success("Removed from wishlist")
                  }}
                  className="absolute top-3 right-3 bg-white rounded-full p-2
                             shadow-md hover:bg-red-50 transition"
                >
                  <FiTrash2 size={15} className="text-red-500" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-[#E63946] font-medium mb-1">
                  {product.category}
                </p>
                <Link to={"/product/" + product._id}>
                  <h3 className="font-semibold text-gray-800 text-sm mb-2
                                 line-clamp-2 hover:text-[#E63946] transition">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(function(star) {
                    return (
                      <FiStar
                        key={star}
                        size={12}
                        className={star <= Math.round(product.ratings || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"}
                      />
                    )
                  })}
                  <span className="text-xs text-gray-400 ml-1">
                    ({product.numReviews || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#1D3557]">
                      {formatGHS(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {formatGHS(product.price)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={function() {
                      addToCart(product)
                      toast.success("Added to cart!")
                    }}
                    disabled={product.stock === 0}
                    className="bg-[#E63946] hover:bg-red-700 disabled:bg-gray-300
                               text-white p-2 rounded-xl transition"
                  >
                    <FiShoppingCart size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}