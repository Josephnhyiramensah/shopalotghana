import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useAuth } from "../hooks/useAuth"
import { formatGHS } from "../utils/formatCurrency"
import { trackInitiateCheckout, trackPurchase } from "../utils/analytics"
import toast from "react-hot-toast"
import {
  FiTruck, FiCreditCard, FiPhone, FiMapPin,
  FiUser, FiMail, FiChevronRight, FiShield,
  FiCheck, FiLock, FiFileText
} from "react-icons/fi"
import { REGIONS } from "../utils/constants"

const STEPS = ["Delivery", "Payment", "Review"]

export default function Checkout() {
  const { items, subtotal, discount, deliveryFee, total, coupon, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    region: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("mobile_money")
  const [momoPhone, setMomoPhone] = useState("")
  const [momoNetwork, setMomoNetwork] = useState("MTN")

  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const isGuest = !user

  const updateAddress = function(field, value) {
    setAddress(function(prev) { return { ...prev, [field]: value } })
  }

  const validateStep0 = function() {
    if (isGuest) {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        toast.error("Please fill in all contact details")
        return false
      }
      if (guestInfo.phone.replace(/[^0-9]/g, "").length !== 10) {
        toast.error("Guest phone must be exactly 10 digits")
        return false
      }
    }
    if (!address.fullName) {
      toast.error("Please enter recipient full name")
      return false
    }
    if (!address.street || !address.city || !address.region || !address.phone) {
      toast.error("Please fill in all required delivery details")
      return false
    }
    if (address.phone.length !== 10) {
      toast.error("Delivery phone must be exactly 10 digits")
      return false
    }
    return true
  }

  const validateStep1 = function() {
    if (paymentMethod === "mobile_money") {
      if (!momoPhone.trim()) {
        toast.error("Please enter your Mobile Money number")
        return false
      }
      if (momoPhone.length !== 10) {
        toast.error("MoMo number must be exactly 10 digits")
        return false
      }
    }
    return true
  }

  const handleNextStep = function() {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    setStep(function(s) { return s + 1 })
    window.scrollTo(0, 0)
  }

  const handlePrevStep = function() {
    setStep(function(s) { return s - 1 })
    window.scrollTo(0, 0)
  }

  const buildOrderData = function() {
    return {
      items: items.map(function(item) {
        return {
          product: item._id,
          name: item.name,
          image: item.images && item.images.length > 0
            ? item.images[0].url : "",
          price: item.discountPrice || item.price,
          quantity: item.quantity,
        }
      }),
      shippingAddress: {
        fullName: address.fullName,
        street: address.street,
        landmark: address.landmark || "",
        city: address.city,
        region: address.region,
        phone: address.phone,
        notes: address.notes || "",
      },
      paymentMethod: paymentMethod,
      itemsPrice: subtotal || 0,
      subtotal: subtotal || 0,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      totalPrice: total || 0,
      coupon: coupon?.couponId || null,
      guestInfo: isGuest ? {
        name: guestInfo.name,
        email: guestInfo.email,
        phone: guestInfo.phone,
      } : undefined,
    }
  }

  const createOrderInDB = async function() {
    const orderData = buildOrderData()
    const { data } = await axios.post("/orders", orderData)
    return data.order._id
  }

  const placeOrder = async function() {
    trackInitiateCheckout(total, items)
    setLoading(true)

    if (paymentMethod === "cash_on_delivery") {
      try {
        const orderId = await createOrderInDB()
        clearCart()
        toast.success("Order placed successfully!")
        navigate("/order-confirmation/" + orderId)
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to place order")
        setLoading(false)
      }
      return
    }

    if (!window.PaystackPop) {
      toast.error("Payment system not loaded. Please refresh.")
      setLoading(false)
      return
    }

    const emailForPayment = isGuest ? guestInfo.email : user?.email
    if (!emailForPayment) {
      toast.error("Email is required for payment")
      setLoading(false)
      return
    }

    const formattedPhone = momoPhone.startsWith("0")
      ? "233" + momoPhone.slice(1)
      : momoPhone

    const paystackConfig = {
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: emailForPayment,
      amount: Math.round((total || 0) * 100),
      currency: "GHS",
      ref: "SHOPALO_" + Date.now(),
      callback: function(response) {
        createOrderInDB()
          .then(function(orderId) {
            return axios.post("/payment/verify", {
              reference: response.reference,
              orderId: orderId,
            }).then(function() {
              trackPurchase(orderId, total, items)
              clearCart()
              toast.success("Payment successful! 🎉")
              navigate("/order-confirmation/" + orderId)
            })
          })
          .catch(function() {
            toast.error(
              "Payment received but order failed. " +
              "Contact support with ref: " + response.reference,
              { duration: 8000 }
            )
            setLoading(false)
          })
      },
      onClose: function() {
        toast("Payment cancelled.", { icon: "⚠️", duration: 4000 })
        setLoading(false)
      },
    }

    if (paymentMethod === "mobile_money") {
      paystackConfig.channels = ["mobile_money"]
      paystackConfig.phone = formattedPhone
    } else {
      paystackConfig.channels = ["card"]
    }

    const handler = window.PaystackPop.setup(paystackConfig)
    handler.openIframe()
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/shop"
          className="bg-[#FF4500] text-white px-6 py-3 rounded-xl
                     font-medium hover:bg-red-700 transition">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1D3557]">Checkout</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <Link to="/cart" className="hover:text-[#FF4500] transition">Cart</Link>
          <FiChevronRight size={14} />
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>
      </div>

      <div className="flex items-center justify-center mb-10">
        {STEPS.map(function(label, i) {
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={"w-10 h-10 rounded-full flex items-center " +
                  "justify-center font-bold text-sm transition " +
                  (i < step ? "bg-green-500 text-white"
                    : i === step ? "bg-[#FF4500] text-white"
                    : "bg-gray-200 text-gray-500")}>
                  {i < step ? <FiCheck size={18} /> : i + 1}
                </div>
                <span className={"text-xs mt-1 font-medium " +
                  (i === step ? "text-[#FF4500]" : "text-gray-400")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={"h-0.5 w-16 sm:w-24 mx-2 mb-4 " +
                  (i < step ? "bg-green-500" : "bg-gray-200")} />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">

          {/* Step 0 — Delivery */}
          {step === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-extrabold text-[#1D3557] mb-6
                             flex items-center gap-2">
                <FiMapPin className="text-[#FF4500]" />
                Delivery Information
              </h2>

              {isGuest && (
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-blue-700">
                      Your Contact Details
                    </p>
                    <Link to="/login"
                      className="text-xs text-[#FF4500] font-semibold hover:underline">
                      Login instead →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FiUser size={15} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={guestInfo.name}
                          onChange={function(e) {
                            setGuestInfo(function(prev) {
                              return { ...prev, name: e.target.value }
                            })
                          }}
                          placeholder="Your full name"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                     py-2.5 text-sm outline-none focus:border-[#FF4500]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FiMail size={15} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="email"
                          value={guestInfo.email}
                          onChange={function(e) {
                            setGuestInfo(function(prev) {
                              return { ...prev, email: e.target.value }
                            })
                          }}
                          placeholder="your@email.com"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                     py-2.5 text-sm outline-none focus:border-[#FF4500]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FiPhone size={15} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="tel"
                          value={guestInfo.phone}
                          onChange={function(e) {
                            const val = e.target.value.replace(/[^0-9]/g, "")
                            if (val.length <= 10) {
                              setGuestInfo(function(prev) {
                                return { ...prev, phone: val }
                              })
                            }
                          }}
                          maxLength={10}
                          placeholder="0241234567"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                     py-2.5 text-sm outline-none focus:border-[#FF4500]"
                        />
                        {guestInfo.phone.length > 0 && guestInfo.phone.length < 10 && (
                          <p className="text-xs text-red-500 mt-1">
                            {guestInfo.phone.length}/10 digits
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <FiUser size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={function(e) { updateAddress("fullName", e.target.value) }}
                      placeholder="Who will receive the order?"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                 py-2.5 text-sm outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Street Address *
                    </label>
                    <div className="relative">
                      <FiMapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={address.street}
                        onChange={function(e) { updateAddress("street", e.target.value) }}
                        placeholder="House no., street name"
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                   py-2.5 text-sm outline-none focus:border-[#FF4500]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Landmark
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={function(e) { updateAddress("landmark", e.target.value) }}
                      placeholder="e.g. Near Accra Mall"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                                 text-sm outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={function(e) { updateAddress("city", e.target.value) }}
                      placeholder="e.g. Accra, Kumasi, Tema"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                                 text-sm outline-none focus:border-[#FF4500]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Region *
                    </label>
                    <select
                      value={address.region}
                      onChange={function(e) { updateAddress("region", e.target.value) }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                                 text-sm outline-none focus:border-[#FF4500] bg-white"
                    >
                      <option value="">Select Region</option>
                      {REGIONS.map(function(r) {
                        return <option key={r} value={r}>{r}</option>
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FiPhone size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={function(e) {
                        const val = e.target.value.replace(/[^0-9]/g, "")
                        if (val.length <= 10) updateAddress("phone", val)
                      }}
                      maxLength={10}
                      placeholder="0241234567"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                 py-2.5 text-sm outline-none focus:border-[#FF4500]"
                    />
                    {address.phone.length > 0 && address.phone.length < 10 && (
                      <p className="text-xs text-red-500 mt-1">
                        {address.phone.length}/10 digits entered
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Delivery Notes
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <div className="relative">
                    <FiFileText size={15}
                      className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={address.notes}
                      onChange={function(e) { updateAddress("notes", e.target.value) }}
                      placeholder="Special delivery instructions?"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4
                                 py-2.5 text-sm outline-none focus:border-[#FF4500] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4
                                border border-blue-100">
                  <FiTruck size={20} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      Estimated Delivery: 1-3 Business Days
                    </p>
                    <p className="text-xs text-blue-500">
                      Accra, Tema and Kumasi get same-day delivery on orders before 12pm
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNextStep}
                  className="bg-[#FF4500] hover:bg-red-700 text-white font-bold
                             px-8 py-3 rounded-xl transition flex items-center gap-2"
                >
                  Continue to Payment
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-extrabold text-[#1D3557] mb-6
                             flex items-center gap-2">
                <FiCreditCard className="text-[#FF4500]" />
                Payment Method
              </h2>

              <div className="space-y-3">

                <label className={"flex items-center gap-4 border-2 rounded-2xl p-4 " +
                  "cursor-pointer transition " +
                  (paymentMethod === "mobile_money"
                    ? "border-[#FF4500] bg-red-50"
                    : "border-gray-200 hover:border-gray-300")}>
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_money"
                    checked={paymentMethod === "mobile_money"}
                    onChange={function() { setPaymentMethod("mobile_money") }}
                    className="accent-[#FF4500] w-4 h-4"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">📱</div>
                    <div>
                      <p className="font-bold text-gray-800">Mobile Money</p>
                      <p className="text-xs text-gray-500">
                        MTN MoMo, Telecel Cash, AT Money
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "mobile_money" && (
                    <FiCheck size={20} className="text-[#FF4500]" />
                  )}
                </label>

                {paymentMethod === "mobile_money" && (
                  <div className="ml-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <label className="text-xs font-bold text-gray-700 mb-2 block">
                      Mobile Money Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={momoNetwork}
                        onChange={function(e) { setMomoNetwork(e.target.value) }}
                        className="border border-gray-200 rounded-xl px-3 py-2.5
                                   text-sm outline-none focus:border-[#FF4500]
                                   bg-white font-semibold"
                      >
                        <option value="MTN">MTN</option>
                        <option value="Telecel">Telecel</option>
                        <option value="AT">AT Money</option>
                      </select>
                      <input
                        type="tel"
                        value={momoPhone}
                        onChange={function(e) {
                          const val = e.target.value.replace(/[^0-9]/g, "")
                          if (val.length <= 10) setMomoPhone(val)
                        }}
                        maxLength={10}
                        placeholder="0240000000"
                        className="flex-1 border border-gray-200 rounded-xl px-4
                                   py-2.5 text-sm outline-none focus:border-[#FF4500]"
                      />
                    </div>
                    {momoPhone.length > 0 && momoPhone.length < 10 && (
                      <p className="text-xs text-red-500 mt-1">
                        {momoPhone.length}/10 digits entered
                      </p>
                    )}
                    <p className="text-xs text-yellow-700 mt-2">
                      💡 You will receive a prompt on this number to approve payment
                    </p>
                  </div>
                )}

                <label className={"flex items-center gap-4 border-2 rounded-2xl p-4 " +
                  "cursor-pointer transition " +
                  (paymentMethod === "card"
                    ? "border-[#FF4500] bg-red-50"
                    : "border-gray-200 hover:border-gray-300")}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={function() { setPaymentMethod("card") }}
                    className="accent-[#FF4500] w-4 h-4"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">💳</div>
                    <div>
                      <p className="font-bold text-gray-800">Debit / Credit Card</p>
                      <p className="text-xs text-gray-500">
                        Visa, Mastercard — secured by Paystack
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "card" && (
                    <FiCheck size={20} className="text-[#FF4500]" />
                  )}
                </label>

                {paymentMethod === "card" && (
                  <div className="ml-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-700 font-bold mb-2">
                      💳 How Card Payment Works:
                    </p>
                    <div className="space-y-1 text-xs text-blue-600">
                      <p>1. Click the Pay button below</p>
                      <p>2. A secure Paystack popup opens</p>
                      <p>3. Enter your card number, expiry and CVV</p>
                      <p>4. Approve and payment is complete</p>
                    </div>
                    <p className="text-xs text-blue-400 mt-2">
                      🔒 Visa and Mastercard supported — 256-bit encrypted
                    </p>
                  </div>
                )}

                <label className={"flex items-center gap-4 border-2 rounded-2xl p-4 " +
                  "cursor-pointer transition " +
                  (paymentMethod === "cash_on_delivery"
                    ? "border-[#FF4500] bg-red-50"
                    : "border-gray-200 hover:border-gray-300")}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={function() { setPaymentMethod("cash_on_delivery") }}
                    className="accent-[#FF4500] w-4 h-4"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">💵</div>
                    <div>
                      <p className="font-bold text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </div>
                  {paymentMethod === "cash_on_delivery" && (
                    <FiCheck size={20} className="text-[#FF4500]" />
                  )}
                </label>

                {paymentMethod === "cash_on_delivery" && (
                  <div className="ml-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-medium">
                      💵 Pay with cash when your order arrives at your door
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Our delivery agent will collect payment on arrival
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5 bg-gray-50 rounded-xl
                              p-3 border border-gray-100">
                <FiLock size={16} className="text-green-500 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Your payment is secured by Paystack — Ghana's most trusted
                  payment gateway. We never store your card details.
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevStep}
                  className="border-2 border-gray-200 hover:border-gray-400
                             text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-[#FF4500] hover:bg-red-700 text-white font-bold
                             px-8 py-3 rounded-xl transition flex items-center gap-2"
                >
                  Review Order
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-extrabold text-[#1D3557] mb-6">
                Review Your Order
              </h2>

              {isGuest && (
                <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                  <p className="font-bold text-gray-700 text-sm mb-2">Contact Details</p>
                  <p className="text-sm text-gray-600">{guestInfo.name}</p>
                  <p className="text-sm text-gray-600">{guestInfo.email}</p>
                  <p className="text-sm text-gray-600">{guestInfo.phone}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <FiMapPin size={15} className="text-[#FF4500]" />
                    Delivery Address
                  </p>
                  <button
                    onClick={function() { setStep(0) }}
                    className="text-xs text-[#FF4500] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-800">{address.fullName}</p>
                <p className="text-sm text-gray-600">{address.street}</p>
                {address.landmark && (
                  <p className="text-sm text-gray-500">Near: {address.landmark}</p>
                )}
                <p className="text-sm text-gray-600">{address.city}, {address.region}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                {address.notes && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    Note: {address.notes}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <FiCreditCard size={15} className="text-[#FF4500]" />
                    Payment Method
                  </p>
                  <button
                    onClick={function() { setStep(1) }}
                    className="text-xs text-[#FF4500] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {paymentMethod === "mobile_money" &&
                    "📱 " + momoNetwork + " MoMo — " + momoPhone}
                  {paymentMethod === "card" && "💳 Debit / Credit Card"}
                  {paymentMethod === "cash_on_delivery" && "💵 Cash on Delivery"}
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <p className="font-bold text-gray-700 text-sm">
                  Order Items ({items.length})
                </p>
                {items.map(function(item) {
                  const image = item.images && item.images.length > 0
                    ? item.images[0].url
                    : "https://placehold.co/60x60?text=No+Image"
                  const price = item.discountPrice || item.price
                  return (
                    <div key={item._id}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl
                                 p-3 border border-gray-100">
                      <img
                        src={image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatGHS(price)}
                        </p>
                      </div>
                      <span className="font-bold text-gray-800 text-sm flex-shrink-0">
                        {formatGHS(price * item.quantity)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevStep}
                  className="border-2 border-gray-200 hover:border-gray-400
                             text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
                >
                  ← Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="bg-[#FF4500] hover:bg-red-700 disabled:bg-gray-300
                             text-white font-bold px-8 py-3 rounded-xl transition
                             flex items-center gap-2"
                >
                  <FiShield size={18} />
                  {loading
                    ? "Placing Order..."
                    : paymentMethod === "cash_on_delivery"
                    ? "Place Order"
                    : "Pay " + formatGHS(total || 0)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                          p-5 sticky top-24">
            <h3 className="font-extrabold text-[#1D3557] mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(function(item) {
                const image = item.images && item.images.length > 0
                  ? item.images[0].url
                  : "https://placehold.co/50x50?text=No"
                return (
                  <div key={item._id} className="flex items-center gap-2">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border
                                 border-gray-100 flex-shrink-0"
                    />
                    <p className="text-xs text-gray-600 flex-1 line-clamp-1">
                      {item.name}
                    </p>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                      x{item.quantity}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatGHS(subtotal || 0)}</span>
              </div>
              {(discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>- {formatGHS(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span>
                  {(deliveryFee || 0) === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : formatGHS(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-extrabold text-gray-800">Total</span>
                <span className="font-extrabold text-lg text-[#FF4500]">
                  {formatGHS(total || 0)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              🔒 Protected under Ghana's Data Protection Act (Act 843)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}