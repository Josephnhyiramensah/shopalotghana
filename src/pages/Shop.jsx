import { trackSearch } from "../utils/analytics"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, Link } from "react-router-dom"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { formatGHS } from "../utils/formatCurrency"
import {
  FiShoppingCart, FiHeart, FiStar, FiFilter,
  FiX, FiChevronDown, FiSearch, FiGrid, FiList
} from "react-icons/fi"

const CATEGORIES = [
  "Kitchen Appliances",
  "Plumbing Materials",
  "Electronics",
  "Fashion",
]

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "top-rated" },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <FiStar
            key={star}
            size={12}
            className={star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"}
          />
        )
      })}
    </div>
  )
}

function ProductCard({ product, view }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const inWishlist = isInWishlist(product._id)
  const image = product.images && product.images.length > 0
    ? product.images[0].url
    : "https://placehold.co/300x300?text=No+Image"
  const hasDiscount = product.discountPrice && product.discountPrice > 0

  if (view === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 flex gap-4 p-4">
        <Link to={"/product/" + product._id} className="flex-shrink-0">
          <img
            src={image}
            alt={product.name}
            className="w-32 h-42 object-cover rounded-xl"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#E63946] font-medium mb-1">{product.category}</p>
            <Link to={"/product/" + product._id}>
              <h3 className="font-semibold text-gray-800 hover:text-[#E63946] transition mb-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={product.ratings || 0} />
              <span className="text-xs text-gray-400">({product.numReviews || 0} reviews)</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-xl font-bold text-[#1D3557]">
                {formatGHS(hasDiscount ? product.discountPrice : product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {formatGHS(product.price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={function() {
                  inWishlist ? removeFromWishlist(product._id) : addToWishlist(product)
                }}
                className="border border-gray-200 p-2 rounded-xl hover:border-[#E63946] transition"
              >
                <FiHeart
                  size={16}
                  className={inWishlist ? "text-[#E63946] fill-[#E63946]" : "text-gray-400"}
                />
              </button>
              <button
                onClick={function() { addToCart(product) }}
                disabled={product.stock === 0}
                className="bg-[#E63946] hover:bg-red-700 disabled:bg-gray-300
                           text-white px-4 py-2 rounded-xl text-sm font-medium transition
                           flex items-center gap-2"
              >
                <FiShoppingCart size={15} />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300
                    overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden">
        <Link to={"/product/" + product._id}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#E63946] text-white text-xs font-bold px-2 py-1 rounded-lg">
            SALE
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs px-2 py-1 rounded-lg">
            Out of Stock
          </span>
        )}
        <button
          onClick={function() {
            inWishlist ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md
                     hover:scale-110 transition"
        >
          <FiHeart
            size={16}
            className={inWishlist ? "text-[#E63946] fill-[#E63946]" : "text-gray-400"}
          />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#E63946] font-medium mb-1">{product.category}</p>
        <Link to={"/product/" + product._id}>
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2
                         hover:text-[#E63946] transition">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.ratings || 0} />
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#1D3557]">
              {formatGHS(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through ml-2">
                {formatGHS(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={function() { addToCart(product) }}
            disabled={product.stock === 0}
            className="bg-[#E63946] hover:bg-red-700 disabled:bg-gray-300
                       text-white p-2 rounded-xl transition"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
      <div className="w-full h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-9 w-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [view, setView] = useState("grid")
  const [filterOpen, setFilterOpen] = useState(false)

  const keyword = searchParams.get("keyword") || ""
  const category = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || "newest"
  const page = parseInt(searchParams.get("page") || "1")
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)
  const [localKeyword, setLocalKeyword] = useState(keyword)

  const fetchProducts = useCallback(async function() {
  setLoading(true)
  try {
    let url = "/products?page=" + page + "&sort=" + sort
    if (keyword) url += "&keyword=" + keyword
    if (category) url += "&category=" + encodeURIComponent(category)
    if (minPrice) url += "&minPrice=" + minPrice
    if (maxPrice) url += "&maxPrice=" + maxPrice

    const { data } = await axios.get(url)
    setProducts(data.products || [])
    setTotalPages(data.pages || 1)
    setTotalProducts(data.total || 0)
  } catch (err) {
    console.log("Will load when backend is connected")
    setProducts([])
  } finally {
    setLoading(false)
  }
}, [keyword, category, sort, page, minPrice, maxPrice])

useEffect(function() {
  fetchProducts()
}, [fetchProducts])

  const updateParam = function(key, value) {
    const params = Object.fromEntries(searchParams.entries())
    if (value) {
      params[key] = value
    } else {
      delete params[key]
    }
    params.page = "1"
    setSearchParams(params)
  }

  const applyPriceFilter = function() {
    const params = Object.fromEntries(searchParams.entries())
    if (localMin) params.minPrice = localMin
    else delete params.minPrice
    if (localMax) params.maxPrice = localMax
    else delete params.maxPrice
    params.page = "1"
    setSearchParams(params)
    setFilterOpen(false)
  }

  const clearAllFilters = function() {
    setSearchParams({})
    setLocalMin("")
    setLocalMax("")
    setLocalKeyword("")
  }

  const handleSearch = function(e) {
    e.preventDefault()
    updateParam("keyword", localKeyword) 
    {
trackSearch(localKeyword)
  }
  }
  const hasFilters = keyword || category || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#1D3557]">
          {category || "All Products"}
        </h1>
        <p className="text-gray-500 mt-1">
          {loading ? "Loading..." : totalProducts + " products found"}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex flex-1 border-2 border-gray-200 focus-within:border-[#E63946]
                        rounded-xl overflow-hidden transition">
          <input
            type="text"
            value={localKeyword}
            onChange={function(e) { setLocalKeyword(e.target.value) }}
            placeholder="Search products..."
            className="flex-1 px-4 py-3 text-sm outline-none"
          />
          <button type="submit"
            className="bg-[#E63946] text-white px-5 hover:bg-red-700 transition">
            <FiSearch size={18} />
          </button>
        </div>
      </form>

      <div className="flex gap-6">

        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
              {hasFilters && (
                <button onClick={clearAllFilters}
                  className="text-xs text-[#E63946] hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Category
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={function() { updateParam("category", "") }}
                    className={"w-full text-left text-sm px-3 py-2 rounded-lg transition " +
                      (!category ? "bg-[#E63946] text-white" : "text-gray-600 hover:bg-gray-50")}
                  >
                    All Categories
                  </button>
                </li>
                {CATEGORIES.map(function(cat) {
                  return (
                    <li key={cat}>
                      <button
                        onClick={function() { updateParam("category", cat) }}
                        className={"w-full text-left text-sm px-3 py-2 rounded-lg transition " +
                          (category === cat
                            ? "bg-[#E63946] text-white"
                            : "text-gray-600 hover:bg-gray-50")}
                      >
                        {cat}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Price Range (GHS)
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={function(e) { setLocalMin(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E63946]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={function(e) { setLocalMax(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E63946]"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full bg-[#1D3557] text-white py-2 rounded-lg text-sm
                           font-medium hover:bg-blue-900 transition"
              >
                Apply Price Filter
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">

            {/* Active filters */}
            <div className="flex flex-wrap gap-2">
              {category && (
                <span className="flex items-center gap-1 bg-[#E63946]/10 text-[#E63946]
                                 text-xs px-3 py-1.5 rounded-full font-medium">
                  {category}
                  <button onClick={function() { updateParam("category", "") }}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {keyword && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-600
                                 text-xs px-3 py-1.5 rounded-full font-medium">
                  "{keyword}"
                  <button onClick={function() {
                    updateParam("keyword", "")
                    setLocalKeyword("")
                  }}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 bg-green-50 text-green-600
                                 text-xs px-3 py-1.5 rounded-full font-medium">
                  GHS {minPrice || "0"} - {maxPrice || "∞"}
                  <button onClick={function() {
                    updateParam("minPrice", "")
                    updateParam("maxPrice", "")
                    setLocalMin("")
                    setLocalMax("")
                  }}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Mobile filter button */}
              <button
                onClick={function() { setFilterOpen(true) }}
                className="lg:hidden flex items-center gap-2 border border-gray-200
                           px-3 py-2 rounded-xl text-sm hover:border-[#E63946] transition"
              >
                <FiFilter size={15} /> Filters
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={function(e) { updateParam("sort", e.target.value) }}
                  className="appearance-none border border-gray-200 rounded-xl px-4 py-2
                             text-sm pr-8 outline-none focus:border-[#E63946] bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map(function(opt) {
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>
                  })}
                </select>
                <FiChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={function() { setView("grid") }}
                  className={"p-2 transition " + (view === "grid" ? "bg-[#E63946] text-white" : "text-gray-400 hover:bg-gray-50")}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={function() { setView("list") }}
                  className={"p-2 transition " + (view === "list" ? "bg-[#E63946] text-white" : "text-gray-400 hover:bg-gray-50")}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products grid/list */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(function(i) { return <ProductSkeleton key={i} /> })}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={clearAllFilters}
                className="bg-[#E63946] text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={view === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 gap-6"
              : "flex flex-col gap-4"}>
              {products.map(function(product) {
                return <ProductCard key={product._id} product={product} view={view} />
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={function() { updateParam("page", String(page - 1)) }}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                           disabled:opacity-40 hover:border-[#E63946] transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, function(_, i) { return i + 1 }).map(function(p) {
                return (
                  <button
                    key={p}
                    onClick={function() { updateParam("page", String(p)) }}
                    className={"px-4 py-2 rounded-xl text-sm font-medium transition " +
                      (p === page
                        ? "bg-[#E63946] text-white"
                        : "border border-gray-200 hover:border-[#E63946]")}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={function() { updateParam("page", String(page + 1)) }}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                           disabled:opacity-40 hover:border-[#E63946] transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={function() { setFilterOpen(false) }} />
          <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={function() { setFilterOpen(false) }}>
                <FiX size={22} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Category
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={function() { updateParam("category", ""); setFilterOpen(false) }}
                    className={"w-full text-left text-sm px-3 py-2 rounded-lg transition " +
                      (!category ? "bg-[#FF8C00] text-white" : "text-gray-600 hover:bg-red bg-orange-700-50")}
                  >
                    All Categories
                  </button>
                </li>
                {CATEGORIES.map(function(cat) {
                  return (
                    <li key={cat}>
                      <button
                        onClick={function() { updateParam("category", cat); setFilterOpen(false) }}
                        className={"w-full text-left text-sm px-3 py-2 rounded-lg transition " +
                          (category === cat
                            ? "bg-[#FF8C00] text-orange"
                            : "text-gray-600 hover:bg-orange-50")}
                      >
                        {cat}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Price Range (GHS)
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={function(e) { setLocalMin(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={function(e) { setLocalMax(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full bg-[#1D3557] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}