import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiPlus, FiTrash2, FiX, FiTag,
  FiPercent, FiDollarSign, FiCalendar, FiUsers
} from "react-icons/fi"
import { formatGHS } from "../utils/formatCurrency"

const emptyForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchCoupons = useCallback(async function() {
    setLoading(true)
    try {
      const { data } = await axios.get("/coupons")
      setCoupons(data.coupons || [])
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(function() {
    fetchCoupons()
  }, [fetchCoupons])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(function(prev) { return { ...prev, [name]: value } })
  }

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = "SHOPA"
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setForm(function(prev) { return { ...prev, code: code } })
  }

  function closeModal() {
    setShowModal(false)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.code || !form.value) {
      toast.error("Please fill in all required fields")
      return
    }
    if (form.type === "percentage" && (form.value < 1 || form.value > 100)) {
      toast.error("Percentage must be between 1 and 100")
      return
    }
    setSaving(true)
    try {
      await axios.post("/coupons", {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      })
      toast.success("Coupon created!")
      closeModal()
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return
    setDeleting(id)
    try {
      await axios.delete("/coupons/" + id)
      toast.success("Coupon deleted!")
      fetchCoupons()
    } catch {
      toast.error("Failed to delete coupon")
    } finally {
      setDeleting(null)
    }
  }

  function isExpired(expiresAt) {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  function usagePercent(coupon) {
    if (!coupon.maxUses) return null
    return Math.round((coupon.usedCount / coupon.maxUses) * 100)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage discount codes
          </p>
        </div>
        <button
          onClick={function() { setShowModal(true) }}
          className="flex items-center gap-2 bg-[#E63946] hover:bg-red-700
                     text-white font-bold px-5 py-2.5 rounded-xl transition"
        >
          <FiPlus size={18} /> Create Coupon
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Coupons",
            value: coupons.length,
            icon: <FiTag size={18} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active",
            value: coupons.filter(function(c) {
              return !isExpired(c.expiresAt)
            }).length,
            icon: <FiPercent size={18} />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Expired",
            value: coupons.filter(function(c) {
              return isExpired(c.expiresAt)
            }).length,
            icon: <FiCalendar size={18} />,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Total Uses",
            value: coupons.reduce(function(sum, c) {
              return sum + (c.usedCount || 0)
            }, 0),
            icon: <FiUsers size={18} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(function(stat) {
          return (
            <div key={stat.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " +
                stat.bg + " " + stat.color}>
                {stat.icon}
              </div>
              <p className="text-xl font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(function(i) {
            return (
              <div key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                           animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            )
          })}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl py-20 text-center text-gray-400
                        shadow-sm border border-gray-100">
          <FiTag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-lg">No coupons yet</p>
          <p className="text-sm">Create your first discount code to attract customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(function(coupon) {
            const expired = isExpired(coupon.expiresAt)
            const percent = usagePercent(coupon)

            return (
              <div
                key={coupon._id}
                className={"bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition " +
                  (expired ? "border-gray-200 opacity-70" : "border-gray-100 hover:shadow-md")}
              >
                {/* Coupon top — dashed ticket style */}
                <div className={"px-6 py-5 " +
                  (expired ? "bg-gray-50" : "bg-gradient-to-r from-[#1D3557] to-[#2d5a8e]")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={"text-xs font-bold uppercase mb-1 " +
                        (expired ? "text-gray-400" : "text-white/60")}>
                        Coupon Code
                      </p>
                      <p className={"text-2xl font-extrabold tracking-widest " +
                        (expired ? "text-gray-500" : "text-white")}>
                        {coupon.code}
                      </p>
                    </div>
                    <div className={"text-right"}>
                      <p className={"text-3xl font-extrabold " +
                        (expired ? "text-gray-400" : "text-[#F4A261]")}>
                        {coupon.type === "percentage"
                          ? coupon.value + "%"
                          : formatGHS(coupon.value)}
                      </p>
                      <p className={"text-xs " +
                        (expired ? "text-gray-400" : "text-white/60")}>
                        {coupon.type === "percentage" ? "discount" : "off"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dashed divider */}
                <div className="border-t-2 border-dashed border-gray-200 mx-4" />

                {/* Coupon bottom */}
                <div className="px-6 py-4">
                  <div className="space-y-2 mb-4">
                    {coupon.minOrder > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <FiDollarSign size={12} /> Min. Order
                        </span>
                        <span className="font-bold text-gray-700">
                          {formatGHS(coupon.minOrder)}
                        </span>
                      </div>
                    )}
                    {coupon.expiresAt && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <FiCalendar size={12} /> Expires
                        </span>
                        <span className={"font-bold " +
                          (expired ? "text-red-500" : "text-gray-700")}>
                          {new Date(coupon.expiresAt).toLocaleDateString("en-GH", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                          {expired && " (Expired)"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <FiUsers size={12} /> Uses
                      </span>
                      <span className="font-bold text-gray-700">
                        {coupon.usedCount || 0}
                        {coupon.maxUses ? " / " + coupon.maxUses : " (unlimited)"}
                      </span>
                    </div>
                  </div>

                  {/* Usage progress bar */}
                  {percent !== null && (
                    <div className="mb-4">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={"h-full rounded-full transition-all " +
                            (percent >= 90 ? "bg-red-500" :
                             percent >= 60 ? "bg-yellow-400" : "bg-green-500")}
                          style={{ width: percent + "%" }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{percent}% used</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className={"text-xs font-bold px-2.5 py-1 rounded-lg " +
                      (expired
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-100 text-green-700")}>
                      {expired ? "Expired" : "Active"}
                    </span>
                    <button
                      onClick={function() { handleDelete(coupon._id) }}
                      disabled={deleting === coupon._id}
                      className="p-2 rounded-xl bg-red-50 text-red-500
                                 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-lg font-extrabold text-[#1D3557]">
                Create Coupon
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">

              {/* Code */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Coupon Code *
                </label>
                <div className="flex gap-2">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. SAVE20"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5
                               text-sm outline-none focus:border-[#E63946] transition
                               uppercase"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs
                               font-bold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={function() {
                      setForm(function(prev) { return { ...prev, type: "percentage" } })
                    }}
                    className={"py-3 rounded-xl text-sm font-bold border-2 transition " +
                      (form.type === "percentage"
                        ? "border-[#FF4500] bg-red-50 text-[#FFD580]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300")}
                  >
                    <FiPercent className="mx-auto mb-1" size={18} />
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={function() {
                      setForm(function(prev) { return { ...prev, type: "fixed" } })
                    }}
                    className={"py-3 rounded-xl text-sm font-bold border-2 transition " +
                      (form.type === "fixed"
                        ? "border-[#FF4500] bg-red-50 text-[#E63946]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300")}
                  >
                    <FiDollarSign className="mx-auto mb-1" size={18} />
                    Fixed (GHS)
                  </button>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  {form.type === "percentage" ? "Discount %" : "Discount Amount (GHS)"} *
                </label>
                <input
                  name="value"
                  type="number"
                  value={form.value}
                  onChange={handleChange}
                  placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 50"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
                {form.type === "percentage" && form.value > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Customer saves {form.value}% on their order
                  </p>
                )}
              </div>

              {/* Min order */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Minimum Order (GHS)
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  name="minOrder"
                  type="number"
                  value={form.minOrder}
                  onChange={handleChange}
                  placeholder="e.g. 100 — leave empty for no minimum"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>

              {/* Max uses */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Max Number of Uses
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  name="maxUses"
                  type="number"
                  value={form.maxUses}
                  onChange={handleChange}
                  placeholder="e.g. 100 — leave empty for unlimited"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>

              {/* Expiry date */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                  Expiry Date
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  name="expiresAt"
                  type="date"
                  value={form.expiresAt}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>

              {/* Preview */}
              {form.code && form.value && (
                <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e]
                                rounded-2xl p-4 text-white">
                  <p className="text-xs text-white/60 mb-1">Preview</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-extrabold tracking-widest">
                      {form.code.toUpperCase()}
                    </p>
                    <p className="text-2xl font-extrabold text-[#FF4500]">
                      {form.type === "percentage"
                        ? form.value + "% OFF"
                        : "GHS " + form.value + " OFF"}
                    </p>
                  </div>
                </div>
              )}
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
                className="flex-1 bg-[#FF4500] hover:bg-orange bg-red-600-700 disabled:bg-gray-300
                           text-white font-bold py-3 rounded-xl transition"
              >
                {saving ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}