import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiPackage, FiSearch, FiPlus, FiMinus,
  FiSliders, FiFileText, FiX, FiClock,
  FiAlertTriangle, FiCheckCircle, FiTrendingUp,
  FiTrendingDown
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const TYPE_COLORS = {
  stock_in:   "bg-green-100 text-green-700 border-green-200",
  stock_out:  "bg-red-100 text-red-700 border-red-200",
  adjustment: "bg-blue-100 text-blue-700 border-blue-200",
  note:       "bg-yellow-100 text-yellow-700 border-yellow-200",
}

const TYPE_ICONS = {
  stock_in:   <FiTrendingUp size={13} />,
  stock_out:  <FiTrendingDown size={13} />,
  adjustment: <FiSliders size={13} />,
  note:       <FiFileText size={13} />,
}

const REASONS_IN = [
  "Stock replenishment",
  "New stock arrival",
  "Returned from customer",
  "Stock transfer in",
  "Correction",
  "Other",
]

const REASONS_OUT = [
  "Damaged goods",
  "Expired stock",
  "Stolen/Lost",
  "Stock transfer out",
  "Sample given",
  "Correction",
  "Other",
]

export default function InventoryManager() {
  const [products, setProducts]         = useState([])
  const [stats, setStats]               = useState({})
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState("")
  const [stockFilter, setStockFilter]   = useState("all")
  const [selectedProduct, setSelected] = useState(null)
  const [logs, setLogs]                 = useState([])
  const [logsLoading, setLogsLoading]   = useState(false)
  const [modal, setModal]               = useState(null)
  // modal types: "stock_in" | "stock_out" | "adjust" | "note"

  const [form, setForm] = useState({
    quantity: "",
    newStock: "",
    reason:   "",
    note:     "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchInventory = useCallback(async function() {
    setLoading(true)
    try {
      const params = {}
      if (search)                    params.search      = search
      if (stockFilter !== "all")     params.stockFilter = stockFilter
      const { data } = await axios.get("/inventory", { params })
      setProducts(data.products || [])
      setStats(data.stats || {})
    } catch {
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }, [search, stockFilter])

  useEffect(function() {
    fetchInventory()
  }, [fetchInventory])

  async function fetchLogs(productId) {
    setLogsLoading(true)
    try {
      const { data } = await axios.get("/inventory/" + productId + "/logs")
      setLogs(data.logs || [])
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  function selectProduct(product) {
    setSelected(product)
    fetchLogs(product._id)
  }

  function openModal(type) {
    setForm({ quantity: "", newStock: "", reason: "", note: "" })
    setModal(type)
  }

  async function submitModal() {
    if (!selectedProduct) return
    setSubmitting(true)
    try {
      let url  = "/inventory/" + selectedProduct._id + "/"
      let body = {}

      if (modal === "stock_in") {
        if (!form.quantity) {
          toast.error("Enter quantity")
          setSubmitting(false)
          return
        }
        url  += "stock-in"
        body  = {
          quantity: form.quantity,
          reason:   form.reason || "Stock replenishment",
          note:     form.note,
        }
      } else if (modal === "stock_out") {
        if (!form.quantity) {
          toast.error("Enter quantity")
          setSubmitting(false)
          return
        }
        url  += "stock-out"
        body  = {
          quantity: form.quantity,
          reason:   form.reason || "Manual stock out",
          note:     form.note,
        }
      } else if (modal === "adjust") {
        if (form.newStock === "") {
          toast.error("Enter new stock value")
          setSubmitting(false)
          return
        }
        url  += "adjust"
        body  = {
          newStock: form.newStock,
          reason:   form.reason || "Manual adjustment",
          note:     form.note,
        }
      } else if (modal === "note") {
        if (!form.note.trim()) {
          toast.error("Note cannot be empty")
          setSubmitting(false)
          return
        }
        url  += "note"
        body  = { note: form.note }
      }

      const { data } = await axios.post(url, body)
      toast.success(data.message)
      setModal(null)

      // Refresh stock on selected product
      if (data.newStock !== undefined) {
        setSelected(function(prev) {
          return { ...prev, stock: data.newStock }
        })
        setProducts(function(prev) {
          return prev.map(function(p) {
            return p._id === selectedProduct._id
              ? { ...p, stock: data.newStock }
              : p
          })
        })
      }

      fetchLogs(selectedProduct._id)
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    } finally {
      setSubmitting(false)
    }
  }

  function stockBadge(stock) {
    if (stock === 0)  return "bg-red-100 text-red-700 border border-red-200"
    if (stock <= 5)   return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    return "bg-green-100 text-green-700 border border-green-200"
  }

  function stockLabel(stock) {
    if (stock === 0)  return "Out of Stock"
    if (stock <= 5)   return "Low Stock"
    return "In Stock"
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">
            Inventory Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track stock levels, movements and product notes
          </p>
        </div>
      </div>

      {/* Stats */}
    {/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  {[
    {
      label:  "Total Products",
      value:  stats.totalProducts || 0,
      icon:   <FiPackage size={22} />,
      color:  "text-blue-600",
      bg:     "bg-blue-50",
      filter: "all",
    },
    {
      label:  "In Stock",
      value:  stats.inStock || 0,
      icon:   <FiCheckCircle size={22} />,
      color:  "text-green-600",
      bg:     "bg-green-50",
      filter: "in",
    },
    {
      label:  "Low Stock",
      value:  stats.lowStock || 0,
      icon:   <FiAlertTriangle size={22} />,
      color:  "text-yellow-600",
      bg:     "bg-yellow-50",
      filter: "low",
    },
    {
      label:  "Out of Stock",
      value:  stats.outOfStock || 0,
      icon:   <FiX size={22} />,
      color:  "text-red-600",
      bg:     "bg-red-50",
      filter: "out",
    },
  ].map(function(stat) {
    const isActive = stockFilter === stat.filter
    return (
      <button
        key={stat.label}
        onClick={function() { setStockFilter(stat.filter) }}
        className={"w-full text-left bg-white rounded-2xl shadow-sm p-5 " +
          "flex items-center gap-4 transition-all duration-200 cursor-pointer " +
          (isActive
            ? "border-2 border-[#FF4500] shadow-lg scale-[1.02]"
            : "border border-gray-100 hover:border-gray-300 hover:shadow-md")}
      >
        <div className={"p-3 rounded-xl " + stat.bg + " " + stat.color}>
          {stat.icon}
        </div>
        <div className="flex-1">
          <p className={"text-2xl font-extrabold " +
            (isActive ? "text-[#FF4500]" : "text-[#1D3557]")}>
            {stat.value}
          </p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
        {isActive && (
          <div className="w-2 h-2 rounded-full bg-[#FF4500] flex-shrink-0" />
        )}
      </button>
    )
  })}
</div>
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Product list */}
        <div className="flex-1">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch size={16}
                  className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={function(e) { setSearch(e.target.value) }}
                  placeholder="Search products..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                             py-2.5 text-sm outline-none focus:border-[#FF4500]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "in", "low", "out"].map(function(f) {
                  return (
                    <button
                      key={f}
                      onClick={function() { setStockFilter(f) }}
                      className={"px-3 py-2 rounded-xl text-xs font-bold transition " +
                        (stockFilter === f
                          ? "bg-[#FF4500] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                      {f === "all" ? "All" : f === "in" ? "In Stock"
                        : f === "low" ? "Low Stock" : "Out of Stock"}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1,2,3,4,5].map(function(i) {
                  return (
                    <div key={i}
                      className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                  )
                })}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <FiPackage size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-5 py-3">Product</th>
                      <th className="text-left px-5 py-3">Category</th>
                      <th className="text-left px-5 py-3">Price</th>
                      <th className="text-left px-5 py-3">Stock</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(function(product) {
                      const isSelected = selectedProduct?._id === product._id
                      return (
                        <tr
                          key={product._id}
                          onClick={function() { selectProduct(product) }}
                          className={"cursor-pointer hover:bg-orange-50 transition " +
                            (isSelected ? "bg-orange-50 border-l-4 border-[#FF4500]" : "")}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images?.[0]?.url ||
                                  "https://placehold.co/40x40?text=P"}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover
                                           border border-gray-100"
                              />
                              <p className="font-semibold text-gray-800
                                           line-clamp-1 max-w-[160px]">
                                {product.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-xs">
                            {product.category}
                          </td>
                          <td className="px-5 py-3 font-bold text-[#1D3557]">
                            {formatGHS(product.price)}
                          </td>
                          <td className="px-5 py-3 font-extrabold text-lg
                                         text-[#1D3557]">
                            {product.stock}
                          </td>
                          <td className="px-5 py-3">
                            <span className={"text-xs font-bold px-2.5 py-1 " +
                              "rounded-lg " + stockBadge(product.stock)}>
                              {stockLabel(product.stock)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — product actions + log */}
        {selectedProduct && (
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">

            {/* Product info card */}
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedProduct.images?.[0]?.url ||
                    "https://placehold.co/56x56?text=P"}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                />
                <div>
                  <p className="font-bold text-gray-800 text-sm line-clamp-2">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedProduct.category}</p>
                </div>
              </div>

              <div className="text-center py-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-4xl font-extrabold text-[#1D3557]">
                  {selectedProduct.stock}
                </p>
                <p className="text-xs text-gray-500 mt-1">Current Stock</p>
                <span className={"text-xs font-bold px-3 py-1 rounded-full mt-2 " +
                  "inline-block " + stockBadge(selectedProduct.stock)}>
                  {stockLabel(selectedProduct.stock)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={function() { openModal("stock_in") }}
                  className="flex items-center justify-center gap-2 bg-green-500
                             hover:bg-green-600 text-white font-bold py-2.5
                             rounded-xl text-sm transition"
                >
                  <FiPlus size={15} /> Stock In
                </button>
                <button
                  onClick={function() { openModal("stock_out") }}
                  className="flex items-center justify-center gap-2 bg-red-500
                             hover:bg-red-600 text-white font-bold py-2.5
                             rounded-xl text-sm transition"
                >
                  <FiMinus size={15} /> Stock Out
                </button>
                <button
                  onClick={function() { openModal("adjust") }}
                  className="flex items-center justify-center gap-2 bg-blue-500
                             hover:bg-blue-600 text-white font-bold py-2.5
                             rounded-xl text-sm transition"
                >
                  <FiSliders size={15} /> Adjust
                </button>
                <button
                  onClick={function() { openModal("note") }}
                  className="flex items-center justify-center gap-2 bg-yellow-500
                             hover:bg-yellow-600 text-white font-bold py-2.5
                             rounded-xl text-sm transition"
                >
                  <FiFileText size={15} /> Add Note
                </button>
              </div>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FiClock size={15} className="text-[#FF4500]" />
                Activity Log
              </h3>

              {logsLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(function(i) {
                    return (
                      <div key={i}
                        className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                    )
                  })}
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {logs.map(function(log) {
                    return (
                      <div key={log._id}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={"inline-flex items-center gap-1 text-xs " +
                            "font-bold px-2 py-0.5 rounded-lg border " +
                            (TYPE_COLORS[log.type] || "bg-gray-100 text-gray-600")}>
                            {TYPE_ICONS[log.type]}
                            {log.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(log.createdAt).toLocaleDateString("en-GH", {
                              day: "numeric", month: "short"
                            })}
                          </span>
                        </div>
                        {log.type !== "note" && (
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">{log.stockBefore}</span>
                            <span className="text-gray-400"> → </span>
                            <span className="font-semibold">{log.stockAfter}</span>
                            {log.quantity > 0 && (
                              <span className="text-gray-400">
                                {" "}({log.type === "stock_in" ? "+" : "-"}{log.quantity})
                              </span>
                            )}
                          </p>
                        )}
                        {log.reason && log.type !== "note" && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {log.reason}
                          </p>
                        )}
                        {log.note && (
                          <p className="text-xs text-yellow-700 mt-1 bg-yellow-50
                                        rounded-lg px-2 py-1 italic">
                            📝 {log.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          by {log.createdByName}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="font-extrabold text-[#1D3557] text-lg">
                {modal === "stock_in"  ? "📦 Stock In"
                  : modal === "stock_out" ? "📤 Stock Out"
                  : modal === "adjust"    ? "⚖️ Adjust Stock"
                  : "📝 Add Note"}
              </h2>
              <button
                onClick={function() { setModal(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                <span className="font-semibold">{selectedProduct?.name}</span>
                <span className="text-gray-400 ml-2">
                  Current stock: {selectedProduct?.stock}
                </span>
              </div>

              {(modal === "stock_in" || modal === "stock_out") && (
                <div>
                  <label className="text-xs font-semibold text-gray-600
                                    mb-1 block">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={function(e) {
                      setForm(function(prev) {
                        return { ...prev, quantity: e.target.value }
                      })
                    }}
                    placeholder="Enter quantity"
                    className="w-full border border-gray-200 rounded-xl px-4
                               py-2.5 text-sm outline-none focus:border-[#FF4500]"
                  />
                </div>
              )}

              {modal === "adjust" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600
                                    mb-1 block">
                    New Stock Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.newStock}
                    onChange={function(e) {
                      setForm(function(prev) {
                        return { ...prev, newStock: e.target.value }
                      })
                    }}
                    placeholder="Enter new total stock"
                    className="w-full border border-gray-200 rounded-xl px-4
                               py-2.5 text-sm outline-none focus:border-[#FF4500]"
                  />
                </div>
              )}

              {modal !== "note" && (
                <div>
                  <label className="text-xs font-semibold text-gray-600
                                    mb-1 block">
                    Reason
                  </label>
                  <select
                    value={form.reason}
                    onChange={function(e) {
                      setForm(function(prev) {
                        return { ...prev, reason: e.target.value }
                      })
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4
                               py-2.5 text-sm outline-none focus:border-[#FF4500]
                               bg-white"
                  >
                    <option value="">Select reason</option>
                    {(modal === "stock_in"
                      ? REASONS_IN
                      : REASONS_OUT
                    ).map(function(r) {
                      return <option key={r} value={r}>{r}</option>
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600
                                  mb-1 block">
                  {modal === "note" ? "Note *" : "Additional Note (optional)"}
                </label>
                <textarea
                  value={form.note}
                  onChange={function(e) {
                    setForm(function(prev) {
                      return { ...prev, note: e.target.value }
                    })
                  }}
                  placeholder={modal === "note"
                    ? "Write your note about this product..."
                    : "Any additional details..."}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4
                             py-2.5 text-sm outline-none focus:border-[#FF4500]
                             resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={function() { setModal(null) }}
                className="flex-1 border-2 border-gray-200 text-gray-700
                           font-semibold py-3 rounded-xl hover:border-gray-400
                           transition"
              >
                Cancel
              </button>
              <button
                onClick={submitModal}
                disabled={submitting}
                className={"flex-1 text-white font-bold py-3 rounded-xl " +
                  "transition disabled:bg-gray-300 " +
                  (modal === "stock_in"  ? "bg-green-500 hover:bg-green-600"
                    : modal === "stock_out" ? "bg-red-500 hover:bg-red-600"
                    : modal === "adjust"    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-yellow-500 hover:bg-yellow-600")}
              >
                {submitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}