import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiUpload,
  FiSearch, FiStar, FiPackage
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const CATEGORIES = [
  "Kitchen Appliances",
  "Plumbing Materials",
  "Electronics",
  "Fashion",
]

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  stock: "",
  featured: false,
}

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async function() {
    setLoading(true)
    try {
      const { data } = await axios.get(
        "/products?page=" + page + "&limit=10" +
        (search ? "&keyword=" + search : "")
      )
      setProducts(data.products || [])
      setTotalPages(data.pages || 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(function() {
    fetchProducts()
  }, [fetchProducts])

  function openAdd() {
    setEditProduct(null)
    setForm(emptyForm)
    setImages([])
    setPreviews([])
    setShowModal(true)
  }

  function openEdit(product) {
    setEditProduct(product)
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      category: product.category || "",
      stock: product.stock || "",
      featured: product.featured || false,
    })
    setImages([])
    setPreviews(product.images ? product.images.map(function(img) {
      return img.url
    }) : [])
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditProduct(null)
    setForm(emptyForm)
    setImages([])
    setPreviews([])
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(function(prev) {
      return { ...prev, [name]: type === "checkbox" ? checked : value }
    })
  }

  function handleImages(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(function(f) { return URL.createObjectURL(f) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error("Please fill in all required fields")
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach(function(key) {
        formData.append(key, form[key])
      })
      images.forEach(function(img) {
        formData.append("images", img)
      })

      if (editProduct) {
        await axios.put("/products/" + editProduct._id, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Product updated!")
      } else {
        await axios.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Product added!")
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    setDeleting(id)
    try {
      await axios.delete("/products/" + id)
      toast.success("Product deleted!")
      fetchProducts()
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store inventory
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#E63946] hover:bg-red-700
                     text-white font-bold px-5 py-2.5 rounded-xl transition"
        >
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={function(e) {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search products..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5
                       text-sm outline-none focus:border-[#E63946] transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded-xl w-20" />
                </div>
              )
            })}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiPackage size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No products found</p>
            <p className="text-sm">Add your first product to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3">Product</th>
                    <th className="text-left px-6 py-3">Category</th>
                    <th className="text-left px-6 py-3">Price</th>
                    <th className="text-left px-6 py-3">Stock</th>
                    <th className="text-left px-6 py-3">Rating</th>
                    <th className="text-left px-6 py-3">Featured</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(function(product) {
                    const image = product.images && product.images.length > 0
                      ? product.images[0].url
                      : "https://placehold.co/56x56?text=No+Img"
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                #{product._id.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 text-xs
                                           px-2.5 py-1 rounded-lg font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#1D3557]">
                            {formatGHS(product.discountPrice || product.price)}
                          </p>
                          {product.discountPrice > 0 && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatGHS(product.price)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={"text-xs font-bold px-2.5 py-1 rounded-lg " +
                            (product.stock === 0
                              ? "bg-red-100 text-red-600"
                              : product.stock < 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700")}>
                            {product.stock === 0 ? "Out of Stock" : product.stock + " left"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <FiStar size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">
                              {(product.ratings || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({product.numReviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.featured ? (
                            <span className="bg-yellow-100 text-yellow-700 text-xs
                                             font-bold px-2.5 py-1 rounded-lg">
                              ⭐ Yes
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={function() { openEdit(product) }}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600
                                         hover:bg-blue-100 transition"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={function() { handleDelete(product._id) }}
                              disabled={deleting === product._id}
                              className="p-2 rounded-xl bg-red-50 text-red-500
                                         hover:bg-red-100 transition disabled:opacity-50"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4 border-t">
                {Array.from({ length: totalPages }, function(_, i) {
                  return (
                    <button
                      key={i + 1}
                      onClick={function() { setPage(i + 1) }}
                      className={"w-9 h-9 rounded-xl text-sm font-bold transition " +
                        (page === i + 1
                          ? "bg-[#E63946] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-lg font-extrabold text-[#1D3557]">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Thermocool 2-Door Fridge"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#E63946] transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the product..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#E63946] transition resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#E63946] transition bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(function(cat) {
                    return (
                      <option key={cat} value={cat}>{cat}</option>
                    )
                  })}
                </select>
              </div>

              {/* Price + Discount Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    Price (GHS) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                               text-sm outline-none focus:border-[#E63946] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    Discount Price (GHS)
                  </label>
                  <input
                    name="discountPrice"
                    type="number"
                    value={form.discountPrice}
                    onChange={handleChange}
                    placeholder="Leave empty if no sale"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                               text-sm outline-none focus:border-[#E63946] transition"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Stock Quantity *
                </label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#E63946] transition"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border
                              border-yellow-100">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#E63946]"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  ⭐ Mark as Featured Product
                  <span className="text-xs text-gray-500 ml-1 font-normal">
                    (shows on homepage)
                  </span>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Product Images
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32
                                  border-2 border-dashed border-gray-200 rounded-xl
                                  cursor-pointer hover:border-[#E63946] transition bg-gray-50">
                  <FiUpload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload images</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImages}
                    className="hidden"
                  />
                </label>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {previews.map(function(src, i) {
                      return (
                        <img
                          key={i}
                          src={src}
                          alt={"Preview " + (i + 1)}
                          className="w-16 h-16 object-cover rounded-xl border"
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-5 border-t">
              <button
                onClick={closeModal}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-bold
                           py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-[#E63946] hover:bg-red-700 disabled:bg-gray-300
                           text-white font-bold py-3 rounded-xl transition"
              >
                {saving
                  ? "Saving..."
                  : editProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}