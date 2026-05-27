import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import {
  FiSearch, FiEye, FiX, FiPackage,
  FiClock, FiRefreshCw, FiTruck,
  FiCheckCircle, FiXCircle, FiTrash2
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"]

const statusColors = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped:    "bg-purple-100 text-purple-700 border-purple-200",
  delivered:  "bg-green-100 text-green-700 border-green-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
}

const statusIcons = {
  pending:    <FiClock size={13} />,
  processing: <FiRefreshCw size={13} />,
  shipped:    <FiTruck size={13} />,
  delivered:  <FiCheckCircle size={13} />,
  cancelled:  <FiXCircle size={13} />,
}

const nextStatus = {
  pending:    "processing",
  processing: "shipped",
  shipped:    "delivered",
}

function getPaymentLabel(method) {
  if (method === "cash_on_delivery") return "Cash"
  if (method === "mobile_money") return "MoMo"
  if (method === "card") return "Card"
  return method || "—"
}

function getPaymentColor(method) {
  if (method === "cash_on_delivery") return "bg-orange-100 text-orange-700"
  if (method === "mobile_money") return "bg-green-100 text-green-700"
  return "bg-blue-100 text-blue-700"
}

export default function OrderManager() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "superadmin"

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchOrders = useCallback(async function() {
    setLoading(true)
    try {
      let url = "/orders?page=" + page + "&limit=10"
      if (filterStatus !== "all") url += "&status=" + filterStatus
      if (search) url += "&keyword=" + search
      const { data } = await axios.get(url)
      setOrders(data.orders || [])
      setTotalPages(data.pages || 1)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, search])

  useEffect(function() {
    fetchOrders()
  }, [fetchOrders])

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId)
    try {
      await axios.put("/orders/" + orderId + "/status", { status: newStatus })
      toast.success("Order status updated to " + newStatus)
      fetchOrders()
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(function(prev) {
          return { ...prev, status: newStatus }
        })
      }
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(orderId) {
    if (!window.confirm("Permanently delete this order? This cannot be undone.")) return
    setDeleting(orderId)
    try {
      await axios.delete("/orders/" + orderId)
      toast.success("Order deleted")
      fetchOrders()
      if (selectedOrder?._id === orderId) setSelectedOrder(null)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order")
    } finally {
      setDeleting(null)
    }
  }

  function canDelete(order) {
  if (!isSuperAdmin) return false
  return true  // superadmin can delete any order anytime
}

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track all customer orders
          </p>
        </div>
        {isSuperAdmin && (
          <span className="text-xs bg-purple-100 text-purple-700 font-bold
                           px-3 py-1.5 rounded-xl">
            Super Admin — can delete orders
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={function(e) {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by customer name..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5
                         text-sm outline-none focus:border-[#FF4500] transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(function(status) {
              return (
                <button
                  key={status}
                  onClick={function() {
                    setFilterStatus(status)
                    setPage(1)
                  }}
                  className={"px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition " +
                    (filterStatus === status
                      ? "bg-[#FF4500] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                >
                  {status}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(function(i) {
              return (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-10 bg-gray-200 rounded-xl flex-1" />
                  <div className="h-10 bg-gray-200 rounded-xl w-24" />
                  <div className="h-10 bg-gray-200 rounded-xl w-24" />
                </div>
              )
            })}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FiPackage size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No orders found</p>
            <p className="text-sm">
              Orders will appear here once customers start buying
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3">Order ID</th>
                    <th className="text-left px-6 py-3">Customer</th>
                    <th className="text-left px-6 py-3">Items</th>
                    <th className="text-left px-6 py-3">Amount</th>
                    <th className="text-left px-6 py-3">Payment</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(function(order) {
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition">

                        {/* Order ID */}
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 font-bold">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {order.user?.name || order.guestInfo?.name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.user?.email || order.guestInfo?.email || ""}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {order.items && order.items.slice(0, 3).map(function(item, i) {
                              return (
                                <img
                                  key={i}
                                  src={item.image || "https://placehold.co/32x32?text=P"}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                                />
                              )
                            })}
                            {order.items && order.items.length > 3 && (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 border-2
                                              border-white flex items-center justify-center
                                              text-xs font-bold text-gray-500">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-bold text-[#1D3557]">
                          {formatGHS(order.totalPrice)}
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4">
                          <span className={"text-xs font-bold px-2.5 py-1 rounded-lg " +
                            getPaymentColor(order.paymentMethod)}>
                            {getPaymentLabel(order.paymentMethod)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 " +
                            "rounded-xl text-xs font-semibold capitalize border " +
                            (statusColors[order.status] || "bg-gray-100 text-gray-600")}>
                            {statusIcons[order.status]}
                            {order.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">

                            {/* View */}
                            <button
                              onClick={function() { setSelectedOrder(order) }}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600
                                         hover:bg-blue-100 transition"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>

                            {/* Advance status */}
                            {nextStatus[order.status] && (
                              <button
                                onClick={function() {
                                  updateStatus(order._id, nextStatus[order.status])
                                }}
                                disabled={updating === order._id}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl
                                           bg-[#1D3557] text-white hover:bg-blue-900
                                           transition disabled:opacity-50 whitespace-nowrap"
                              >
                                {updating === order._id
                                  ? "..."
                                  : "→ " + nextStatus[order.status]}
                              </button>
                            )}

                            {/* Cancel */}
                            {order.status !== "cancelled" &&
                             order.status !== "delivered" && (
                              <button
                                onClick={function() {
                                  updateStatus(order._id, "cancelled")
                                }}
                                disabled={updating === order._id}
                                className="p-2 rounded-xl bg-red-50 text-red-500
                                           hover:bg-red-100 transition disabled:opacity-50"
                                title="Cancel Order"
                              >
                                <FiXCircle size={14} />
                              </button>
                            )}

                            {/* Delete — superadmin only */}
                            {canDelete(order) && (
                              <button
                                onClick={function() { handleDelete(order._id) }}
                                disabled={deleting === order._id}
                                className="p-2 rounded-xl bg-red-100 text-red-600
                                           hover:bg-red-200 transition disabled:opacity-50"
                                title="Delete Order (Super Admin)"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
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
                          ? "bg-[#FF4500] text-white"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">

            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-lg font-extrabold text-[#1D3557]">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedOrder.createdAt).toLocaleString("en-GH")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canDelete(selectedOrder) && (
                  <button
                    onClick={function() { handleDelete(selectedOrder._id) }}
                    disabled={deleting === selectedOrder._id}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2
                               rounded-xl bg-red-100 text-red-600 hover:bg-red-200
                               transition disabled:opacity-50"
                  >
                    <FiTrash2 size={13} />
                    Delete Order
                  </button>
                )}
                <button
                  onClick={function() { setSelectedOrder(null) }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Status + actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl " +
                  "text-sm font-bold capitalize border " +
                  (statusColors[selectedOrder.status] || "bg-gray-100 text-gray-600")}>
                  {statusIcons[selectedOrder.status]}
                  {selectedOrder.status}
                </span>
                <div className="flex gap-2">
                  {nextStatus[selectedOrder.status] && (
                    <button
                      onClick={function() {
                        updateStatus(selectedOrder._id, nextStatus[selectedOrder.status])
                      }}
                      disabled={updating === selectedOrder._id}
                      className="text-sm font-bold px-4 py-2 rounded-xl bg-[#1D3557]
                                 text-white hover:bg-blue-900 transition disabled:opacity-50"
                    >
                      Mark as {nextStatus[selectedOrder.status]}
                    </button>
                  )}
                  {selectedOrder.status !== "cancelled" &&
                   selectedOrder.status !== "delivered" && (
                    <button
                      onClick={function() {
                        updateStatus(selectedOrder._id, "cancelled")
                      }}
                      disabled={updating === selectedOrder._id}
                      className="text-sm font-bold px-4 py-2 rounded-xl bg-red-50
                                 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Customer Details
                </p>
                <p className="font-semibold text-gray-800">
                  {selectedOrder.user?.name || selectedOrder.guestInfo?.name || "Guest"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.user?.email || selectedOrder.guestInfo?.email}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.user?.phone || selectedOrder.guestInfo?.phone}
                </p>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Delivery Address
                </p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.shippingAddress?.street}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.region}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.shippingAddress?.phone}
                </p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Order Items
                </p>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.map(function(item, i) {
                    return (
                      <div key={i}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <img
                          src={item.image || "https://placehold.co/48x48?text=P"}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {formatGHS(item.price)}
                          </p>
                        </div>
                        <p className="font-bold text-[#1D3557] text-sm flex-shrink-0">
                          {formatGHS(item.price * item.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatGHS(selectedOrder.itemsPrice || 0)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatGHS(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span>
                    {selectedOrder.deliveryFee === 0
                      ? "Free"
                      : formatGHS(selectedOrder.deliveryFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-[#1D3557]
                                text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatGHS(selectedOrder.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className={"font-bold " +
                    (selectedOrder.paymentMethod === "cash_on_delivery"
                      ? "text-orange-600"
                      : "text-green-600")}>
                    {getPaymentLabel(selectedOrder.paymentMethod)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}