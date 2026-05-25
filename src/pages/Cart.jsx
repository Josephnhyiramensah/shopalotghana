import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useAuth } from "../hooks/useAuth"
import { useSettings } from "../hooks/useSettings"
import { formatGHS } from "../utils/formatCurrency"
import toast from "react-hot-toast"
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingBag,
  FiTag, FiArrowRight, FiTruck, FiShield, FiX
} from "react-icons/fi"

export default function Cart() {
  const {
    items, removeFromCart, updateQuantity, clearCart,
    subtotal, discount, deliveryFee, total,
    coupon, applyCoupon, removeCoupon
  } = useCart()
  const { user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const threshold = settings?.freeDeliveryThreshold

  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  const handleApplyCoupon = async function() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const { data } = await axios.post("/coupons/validate", {
        code: couponCode.trim(),
        orderAmount: subtotal,
      })
      applyCoupon({
        code: data.code,
        discount: data.discount,
        couponId: data.couponId,
        type: data.type,
        value: data.value,
      })
      toast.success("Coupon applied! You saved " + formatGHS(data.discount))
      setCouponCode("")
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = function() {
    removeCoupon()
    toast.success("Coupon removed")
  }

  const handleCheckout = function() {
    if (!user) {
      toast.error("Please login to checkout")
      navigate("/login")
      return
    }
    navigate("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-3xl font-extrabold text-[#1D3557] mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Looks like you have not added anything yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#FF4500] hover:bg-red-700
                     text-white font-bold px-8 py-4 rounded-xl transition text-lg"
        >
          <FiShoppingBag size={20} />
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1D3557]">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">
            {items.length} item{items.length > 1 ? "s" : ""} in your cart
          </p>
        </div>
        <button
          onClick={function() {
            clearCart()
            toast.success("Cart cleared")
          }}
          className="flex items-center gap-2 text-sm text-red-500
                     border border-red-200 hover:border-red-400
                     px-4 py-2 rounded-xl transition"
        >
          <FiTrash2 size={15} />
          Clear Cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map(function(item) {
            const image = item.images && item.images.length > 0
              ? item.images[0].url
              : "https://placehold.co/100x100?text=No+Image"
            const hasDiscount = item.discountPrice && item.discountPrice > 0
            const price = hasDiscount ? item.discountPrice : item.price

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100
                           p-5 flex gap-5 hover:shadow-md transition"
              >
                <Link to={"/product/" + item._id} className="flex-shrink-0">
                  <img
                    src={image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#FF4500] font-medium mb-1">
                        {item.category}
                      </p>
                      <Link to={"/product/" + item._id}>
                        <h3 className="font-semibold text-gray-800 hover:text-[#FF4500]
                                       transition text-sm leading-snug">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-[#1D3557]">
                          {formatGHS(price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatGHS(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={function() {
                        removeFromCart(item._id)
                        toast.success("Item removed")
                      }}
                      className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200
                                    rounded-xl overflow-hidden">
                      <button
                        onClick={function() {
                          if (item.quantity === 1) {
                            removeFromCart(item._id)
                          } else {
                            updateQuantity(item._id, item.quantity - 1)
                          }
                        }}
                        className="px-3 py-1.5 hover:bg-gray-100 transition text-gray-600"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="px-4 py-1.5 font-bold text-gray-800
                                       border-x border-gray-200 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={function() {
                          updateQuantity(item._id, item.quantity + 1)
                        }}
                        className="px-3 py-1.5 hover:bg-gray-100 transition text-gray-600"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-gray-800">
                      {formatGHS(price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-[#FF4500] font-semibold
                       text-sm hover:gap-3 transition-all mt-2"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                          p-6 sticky top-24">
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatGHS(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">- {formatGHS(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FiTruck size={14} />
                  Delivery Fee
                </span>
                <span className="font-medium">
                  {deliveryFee === 0
                    ? <span className="text-green-600">FREE</span>
                    : formatGHS(deliveryFee)}
                </span>
              </div>

              {deliveryFee > 0 && subtotal < threshold && (
                <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                  Add {formatGHS(threshold - subtotal)} more for free delivery
                </p>
              )}

              {deliveryFee === 0 && (
                <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  🎉 You qualify for free delivery!
                </p>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-extrabold text-gray-800">Total</span>
                <span className="font-extrabold text-xl text-[#FF4500]">
                  {formatGHS(total)}
                </span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-5">
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50
                               border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FiTag size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-700">{coupon.code}</p>
                      <p className="text-xs text-green-600">
                        Saved {formatGHS(coupon.discount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Have a coupon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={function(e) {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError("")
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5
                                 text-sm outline-none focus:border-[#FF4500] uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-[#1D3557] hover:bg-blue-900 disabled:bg-gray-300
                                 text-white px-4 py-2.5 rounded-xl text-sm font-medium
                                 transition flex items-center gap-1"
                    >
                      <FiTag size={14} />
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-xs mt-2">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-[#FF4500] hover:bg-red-700 text-white font-bold
                         py-4 rounded-xl transition flex items-center justify-center
                         gap-2 text-base"
            >
              Proceed to Checkout
              <FiArrowRight size={18} />
            </button>

            {!user && (
              <button
                onClick={function() { navigate("/checkout") }}
                className="w-full mt-3 border-2 border-gray-200 hover:border-[#1D3557]
                           text-gray-700 font-semibold py-3 rounded-xl transition text-sm"
              >
                Continue as Guest
              </button>
            )}

            <div className="mt-5 flex items-center justify-center gap-4
                            text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiShield size={13} className="text-green-500" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1">
                <FiTruck size={13} className="text-blue-500" />
                Fast Delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}