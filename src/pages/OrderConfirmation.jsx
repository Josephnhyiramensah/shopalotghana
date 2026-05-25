import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { formatGHS } from "../utils/formatCurrency"
import {
  FiCheckCircle, FiPackage, FiMapPin,
  FiCreditCard, FiArrowRight, FiPrinter
} from "react-icons/fi"
import PrintInvoice from "../components/common/PrintInvoice"

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order,       setOrder]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [showInvoice, setShowInvoice] = useState(false)

  const fetchOrder = useCallback(async function() {
    try {
      const { data } = await axios.get("/orders/" + id)
      setOrder(data.order)
    } catch {
      console.log("Order not found")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(function() {
    fetchOrder()
    window.scrollTo(0, 0)
  }, [fetchOrder])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Order not found
        </h2>
        <Link to="/shop"
          className="bg-[#FF4500] text-white px-6 py-3 rounded-xl
                     font-medium hover:bg-red-700 transition">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const statusColors = {
    pending:    "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped:    "bg-purple-100 text-purple-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Success header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center
                          justify-center">
            <FiCheckCircle size={50} className="text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1D3557] mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-lg">
          Thank you for shopping with Shopalotghana 🇬🇭
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-gray-100
                        px-4 py-2 rounded-full text-sm text-gray-600">
          <FiPackage size={15} />
          Order ID:
          <span className="font-bold text-gray-800">
            #{order._id.slice(-8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                      overflow-hidden mb-6">

        {/* Status banner */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] px-6 py-4
                        flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs mb-1">Order Status</p>
            <span className={"text-sm font-bold px-3 py-1 rounded-full capitalize " +
              (statusColors[order.status] || "bg-gray-100 text-gray-700")}>
              {order.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-1">Order Date</p>
            <p className="text-white text-sm font-semibold">
              {new Date(order.createdAt).toLocaleDateString("en-GH", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiPackage size={16} className="text-[#FF4500]" />
            Items Ordered
          </h3>
          <div className="space-y-3">
            {order.items && order.items.map(function(item) {
              return (
                <div key={item._id}
                  className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                  <img
                    src={item.image || "https://placehold.co/60x60?text=No+Image"}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} x {formatGHS(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-[#1D3557] text-sm">
                    {formatGHS(item.price * item.quantity)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Delivery address */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiMapPin size={16} className="text-[#FF4500]" />
            Delivery Address
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">
              {order.shippingAddress?.fullName ||
               order.guestInfo?.name ||
               order.user?.name ||
               "Customer"}
            </p>
            <p>{order.shippingAddress?.street}</p>
            {order.shippingAddress?.landmark && (
              <p className="text-gray-400">
                Near: {order.shippingAddress.landmark}
              </p>
            )}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.region}
            </p>
            <p className="mt-1 font-medium">{order.shippingAddress?.phone}</p>
            {order.shippingAddress?.notes && (
              <p className="mt-1 text-gray-400 italic">
                Note: {order.shippingAddress.notes}
              </p>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiCreditCard size={16} className="text-[#FF4500]" />
            Payment Details
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {order.paymentMethod === "mobile_money" && "📱 Mobile Money"}
                {order.paymentMethod === "card" && "💳 Debit / Credit Card"}
                {order.paymentMethod === "cash_on_delivery" && "💵 Cash on Delivery"}
              </p>
              <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " +
                "mt-1 inline-block " +
                (order.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700")}>
                {order.isPaid ? "✅ Paid" : "⏳ Payment Pending"}
              </span>
            </div>
            {order.paymentReference && (
              <p className="text-xs text-gray-400">
                Ref: {order.paymentReference}
              </p>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatGHS(order.itemsPrice || 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- {formatGHS(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>
                {order.deliveryFee === 0
                  ? <span className="text-green-600 font-medium">FREE</span>
                  : formatGHS(order.deliveryFee || 0)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-extrabold text-gray-800 text-base">
                Total
              </span>
              <span className="font-extrabold text-xl text-[#FF4500]">
                {formatGHS(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
        <h3 className="font-bold text-blue-800 mb-4">What Happens Next?</h3>
        <div className="space-y-3">
          {[
            { step: "1", text: "We confirm and process your order within 1 hour" },
            { step: "2", text: "Your items are carefully packed and dispatched" },
            { step: "3", text: "Our delivery team brings it to your doorstep" },
          ].map(function(item) {
            return (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white
                                text-xs font-bold flex items-center
                                justify-center flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-sm text-blue-700">{item.text}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* ✅ Print Receipt — opens invoice modal */}
        <button
          onClick={function() { setShowInvoice(true) }}
          className="flex-1 flex items-center justify-center gap-2 border-2
                     border-gray-200 hover:border-[#FF4500] text-gray-700
                     hover:text-[#FF4500] font-semibold py-3 rounded-xl transition"
        >
          <FiPrinter size={18} />
          Print Receipt
        </button>

        <Link
          to="/orders"
          className="flex-1 flex items-center justify-center gap-2 bg-[#1D3557]
                     hover:bg-blue-900 text-white font-semibold py-3
                     rounded-xl transition"
        >
          <FiPackage size={18} />
          Track My Orders
        </Link>

        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF4500]
                     hover:bg-red-700 text-white font-semibold py-3
                     rounded-xl transition"
        >
          Shop Again
          <FiArrowRight size={18} />
        </Link>
      </div>

      {/* ✅ Print Invoice Modal */}
      {showInvoice && (
        <PrintInvoice
          order={order}
          onClose={function() { setShowInvoice(false) }}
        />
      )}

    </div>
  )
}