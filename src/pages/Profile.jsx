import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiEdit2, FiSave, FiLogOut, FiPlus,
  FiTrash2, FiPackage, FiHeart, FiShield
} from "react-icons/fi"
import { REGIONS } from "../utils/constants"
import { Link } from "react-router-dom"

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  })

  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    region: "",
    isDefault: false,
  })
  const [addingAddress, setAddingAddress] = useState(false)

  const updateForm = function(field, value) {
    setForm(function(prev) { return { ...prev, [field]: value } })
  }

  const updateNewAddress = function(field, value) {
    setNewAddress(function(prev) { return { ...prev, [field]: value } })
  }

  const saveProfile = async function() {
    setLoading(true)
    try {
      await axios.put("/auth/update-profile", {
        name: form.name,
        phone: form.phone,
        addresses: addresses,
      })
      toast.success("Profile updated successfully!")
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const addAddress = function() {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.region) {
      toast.error("Please fill in all address fields")
      return
    }
    const updated = [...addresses, newAddress]
    setAddresses(updated)
    setNewAddress({ label: "", street: "", city: "", region: "", isDefault: false })
    setAddingAddress(false)
    toast.success("Address added")
  }

  const removeAddress = function(index) {
    setAddresses(function(prev) { return prev.filter(function(_, i) { return i !== index }) })
    toast.success("Address removed")
  }

  const handleLogout = function() {
    logout()
    navigate("/")
    toast.success("Logged out successfully")
  }

  const tabs = [
    { key: "profile", label: "Profile", icon: <FiUser size={16} /> },
    { key: "addresses", label: "Addresses", icon: <FiMapPin size={16} /> },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#FF6F00] flex items-center
                          justify-center text-3xl font-extrabold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{user?.name}</h1>
            <p className="text-white/70 text-sm mt-1">{user?.email}</p>
            <span className={"text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block " +
              (user?.role === "admin"
                ? "bg-orange-400 text-yellow-900"
                : "bg-white/20 text-white")}>
              {user?.role === "admin" ? "⚡ Administrator" : "🛍️ Customer"}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <Link
            to="/orders"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                       text-white text-sm px-4 py-2 rounded-xl transition"
          >
            <FiPackage size={15} /> My Orders
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                       text-white text-sm px-4 py-2 rounded-xl transition"
          >
            <FiHeart size={15} /> Wishlist
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-[#FF6F00] hover:bg-[#e06b11]
                         text-yellow-900 text-sm font-bold px-4 py-2 rounded-xl transition"
            >
              <FiShield size={15} /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(function(tab) {
          return (
            <button
              key={tab.key}
              onClick={function() { setActiveTab(tab.key) }}
              className={"flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition " +
                (activeTab === tab.key
                  ? "bg-[#FF6F00] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6F00]")}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#1D3557]">
              Personal Information
            </h2>
            {!editing ? (
              <button
                onClick={function() { setEditing(true) }}
                className="flex items-center gap-2 text-sm text-[#FF6F00] border-:bg-yellow-500
                           px-4 py-2 rounded-xl hover:bg-red-50 transition"
              >
                <FiEdit2 size={15} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={function() { setEditing(false) }}
                  className="text-sm text-gray-500 border border-gray-200 px-4 py-2
                             rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm bg-[#FF6F00] hover:bg-gold-700
                             disabled:bg-gray-300 text-white px-4 py-2 rounded-xl transition"
                >
                  <FiSave size={15} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Full Name
              </label>
              {editing ? (
                <div className="relative">
                  <FiUser size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={function(e) { updateForm("name", e.target.value) }}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                               text-sm outline-none focus:border-[#FF6F00] transition"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <FiUser size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                </div>
              )}
            </div>

            {/* Email — read only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-dashed border-gray-200">
                <FiMail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email}</span>
                <span className="text-xs text-gray-400 ml-auto">Cannot be changed</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Phone Number
              </label>
              {editing ? (
                <div className="relative">
                  <FiPhone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={function(e) { updateForm("phone", e.target.value) }}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                               text-sm outline-none focus:border-[#FF6F00] transition"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <FiPhone size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">
                    {user?.phone || "Not set"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-700
                         text-sm font-semibold transition"
            >
              <FiLogOut size={16} />
              Sign Out of Account
            </button>
          </div>
        </div>
      )}

      {/* Addresses tab */}
      {activeTab === "addresses" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#1D3557]">
              Saved Addresses
            </h2>
            <button
              onClick={function() { setAddingAddress(!addingAddress) }}
              className="flex items-center gap-2 text-sm bg-[#1D3557] hover:bg-blue-900
                         text-white px-4 py-2 rounded-xl transition"
            >
              <FiPlus size={15} />
              Add Address
            </button>
          </div>

          {/* Add address form */}
          {addingAddress && (
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-5">
              <h3 className="font-bold text-blue-800 mb-4">New Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={function(e) { updateNewAddress("label", e.target.value) }}
                  placeholder="Label (e.g. Home, Office)"
                  className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#FF8C00] bg-white"
                />
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={function(e) { updateNewAddress("street", e.target.value) }}
                  placeholder="Street address"
                  className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#FF6F00] bg-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={function(e) { updateNewAddress("city", e.target.value) }}
                    placeholder="City / Town"
                    className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#FF6F00] bg-white"
                  />
                  <select
                    value={newAddress.region}
                    onChange={function(e) { updateNewAddress("region", e.target.value) }}
                    className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#FF6F00] bg-yellow cursor-pointer"
                  >
                    <option value="">Select Region</option>
                    {REGIONS.map(function(r) {
                      return <option key={r} value={r}>{r}</option>
                    })}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addAddress}
                    className="flex-1 bg-[#FF6F00] hover:bg-orange-700 text-white font-semibold
                               py-2.5 rounded-xl text-sm transition"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={function() { setAddingAddress(false) }}
                    className="flex-1 border border-gray-300 text-gray-600 font-semibold
                               py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address list */}
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📍</div>
              <p className="text-gray-500 text-sm">No saved addresses yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Add an address for faster checkout
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(function(addr, i) {
                return (
                  <div key={i}
                    className="flex items-start justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <FiMapPin size={18} className="text-[#FF6F00] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{addr.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{addr.street}</p>
                        <p className="text-xs text-gray-600">{addr.city}, {addr.region}</p>
                      </div>
                    </div>
                    <button
                      onClick={function() { removeAddress(i) }}
                      className="text-gray-400 hover:text-orange-500 transition p-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )
              })}

              {/* Save addresses to backend */}
              <button
                onClick={saveProfile}
                disabled={loading}
                className="w-full bg-[#FF6F00] hover:bg-orange-700 disabled:bg-gray-300
                           text-white font-bold py-3 rounded-xl transition text-sm mt-2"
              >
                {loading ? "Saving..." : "Save All Addresses"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}