import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { formatGHS } from "../utils/formatCurrency"
import PrintInvoice from "../components/common/PrintInvoice"
import {
  FiPackage, FiChevronRight, FiClock,
  FiTruck, FiCheckCircle, FiXCircle,
  FiShoppingBag, FiPrinter
} from "react-icons/fi"

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon:  <FiClock size={14} />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon:  <FiPackage size={14} />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon:  <FiTruck size={14} />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon:  <FiCheckCircle size={14} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon:  <FiXCircle size={14} />,
  },
}

function OrderCard({ order, onCancel, onPrint }) {
  const status     = statusConfig[order.status] || statusConfig.pending
  const canCancel  = order.status === "pending" || order.status === "processing"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                    hover:shadow-md transition overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
                      border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <FiPackage size={18} className="text-[#FF4500]" />
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-bold text-gray-800 text-sm">
              #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Placed On</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date(order.createdAt).toLocaleDateString("en-GH", {
              year: "numeric", month: "short", day: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map(function(item, i) {
              return (
                <img
                  key={i}
                  src={item.image || "https://placehold.co/40x40?text=No+Image"}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover
                             border-2 border-white shadow-sm"
                />
              )
            })}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-xl bg-gray-100 border-2
                              border-white flex items-center justify-center
                              text-xs font-bold text-gray-600">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
              {order.items[0].name}
              {order.items.length > 1
                ? " + " + (order.items.length - 1) + " more"
                : ""}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={"flex items-center gap-1.5 text-xs font-semibold " +
              "px-3 py-1.5 rounded-full border " + status.color}>
              {status.icon}
              {status.label}
            </span>
            <span className={"text-xs font-medium px-2 py-1 rounded-full " +
              (order.isPaid
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")}>
              {order.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-[#FF4500]">
              {formatGHS(order.totalPrice)}
            </span>

            {/* Print button */}
            <button
              onClick={function() { onPrint(order) }}
              className="flex items-center gap-1 text-xs font-semibold
                         text-gray-500 hover:text-[#FF4500] transition
                         px-2 py-1.5 rounded-lg hover:bg-orange-50"
            >
              <FiPrinter size={13} /> Print
            </button>

            {/* View button */}
            <Link
              to={"/order-confirmation/" + order._id}
              className="flex items-center gap-1 text-xs font-semibold
                         text-[#1D3557] hover:text-[#FF4500] transition"
            >
              View <FiChevronRight size={14} />
            </Link>

            {/* Cancel button — only for pending/processing */}
            {canCancel && (
              <button
                onClick={function() { onCancel(order._id) }}
                className="flex items-center gap-1 text-xs font-bold
                           px-3 py-1.5 rounded-xl bg-red-50 text-red-500
                           hover:bg-red-100 transition"
              >
                <FiXCircle size={13} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                    animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50
                      flex justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export default function OrderHistory() {
  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState("all")
  const [printOrder, setPrintOrder] = useState(null)

  useEffect(function() {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const { data } = await axios.get("/orders/my-orders")
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(orderId) {
    if (!window.confirm(
      "Are you sure you want to cancel this order?"
    )) return

    try {
      await axios.put("/orders/" + orderId + "/cancel")
      toast.success("Order cancelled successfully")
      fetchOrders()
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Cannot cancel this order"
      )
    }
  }

  const filters  = [
    "all", "pending", "processing",
    "shipped", "delivered", "cancelled"
  ]

  const filtered = filter === "all"
    ? orders
    : orders.filter(function(o) { return o.status === filter })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1D3557]">My Orders</h1>
        <p className="text-gray-500 mt-1">
          {loading
            ? "Loading..."
            : orders.length + " total order" +
              (orders.length !== 1 ? "s" : "")}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(function(f) {
          return (
            <button
              key={f}
              onClick={function() { setFilter(f) }}
              className={"px-4 py-2 rounded-xl text-sm font-medium " +
                "transition capitalize " +
                (filter === f
                  ? "bg-[#FF4500] text-white"
                  : "bg-white border border-gray-200 text-gray-600 " +
                    "hover:border-[#FF4500]")}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(function(i) {
            return <OrderSkeleton key={i} />
          })}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {filter === "all"
              ? "No orders yet"
              : "No " + filter + " orders"}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "all"
              ? "When you place an order it will appear here"
              : "You have no orders with this status"}
          </p>
          {filter === "all" && (
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#FF4500]
                         hover:bg-red-700 text-white font-bold px-6
                         py-3 rounded-xl transition"
            >
              <FiShoppingBag size={18} />
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(function(order) {
            return (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancel}
                onPrint={function(o) { setPrintOrder(o) }}
              />
            )
          })}
        </div>
      )}

      {/* Print Invoice Modal */}
      {printOrder && (
        <PrintInvoice
          order={printOrder}
          onClose={function() { setPrintOrder(null) }}
        />
      )}
    </div>
  )
}