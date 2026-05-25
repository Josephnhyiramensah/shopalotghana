import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
 
import {
  FiSave, FiPhone, FiMail, FiMapPin,
  FiMessageCircle, FiGlobe, FiTruck, FiRefreshCw
} from "react-icons/fi"

const emptySettings = {
  storeName: "",
  tagline: "",
  email: "",
  phone: "",
  address: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  twitter: "",
  linkedin: "",
  deliveryFee: "",
  freeDeliveryThreshold: "",
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
        <div className="text-[#FF4500]">{icon}</div>
        <h2 className="font-extrabold text-[#1D3557]">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, type, hint, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs font-bold text-gray-600 mb-1.5 block">
        {label}
      </label>
      <input
        type={type || "text"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                   outline-none focus:border-[#FF4500] transition"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function Settings() {
  const [form, setForm] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(function() {
    async function fetchSettings() {
      try {
        const { data } = await axios.get("/settings")
        setForm(data.settings)
      } catch {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(function(prev) { return { ...prev, [name]: value } })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await axios.put("/settings", form)
      toast.success("Settings saved successfully!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(function(i) {
          return (
            <div key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-6" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(function(j) {
                  return <div key={j} className="h-10 bg-gray-200 rounded-xl" />
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D3557]">Store Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store contact info and social links
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF4500] hover:bg-red-700
                     disabled:bg-gray-300 text-white font-bold px-6 py-2.5
                     rounded-xl transition"
        >
          {saving ? <FiRefreshCw size={16} className="animate-spin" /> : <FiSave size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Store Info */}
      <Section title="Store Information" icon={<FiGlobe size={18} />}>
        <Field
          label="Store Name"
          name="storeName"
          value={form.storeName || ""}
          onChange={handleChange}
          placeholder="Shopalotghana"
        />
        <Field
          label="Tagline"
          name="tagline"
          value={form.tagline || ""}
          onChange={handleChange}
          placeholder="Quality Living, Locally Delivered"
        />
        <Field
          label="Store Address"
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          placeholder="Accra, Ghana"
          full
        />
      </Section>

      {/* Contact Info */}
      <Section title="Contact Information" icon={<FiPhone size={18} />}>
        <Field
          label="Phone Number"
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          placeholder="+233 XX XXX XXXX"
          hint="Shown in footer — clickable tel: link"
        />
        <Field
          label="Support Email"
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="support@shopalotghana.com"
          type="email"
          full
        />
      </Section>

      {/* Social Links */}
      <Section title="Social Media Links" icon={<FiMessageCircle size={18} />}>
        <Field
          label="Facebook URL"
          name="facebook"
          value={form.facebook || ""}
          onChange={handleChange}
          placeholder="https://facebook.com/shopalotghana"
        />
        <Field
          label="Instagram URL"
          name="instagram"
          value={form.instagram || ""}
          onChange={handleChange}
          placeholder="https://instagram.com/shopalotghana"
        />
        <Field
          label="TikTok URL"
          name="tiktok"
          value={form.tiktok || ""}
          onChange={handleChange}
          placeholder="https://tiktok.com/@shopalotghana"
        />
        <Field
          label="YouTube URL"
          name="youtube"
          value={form.youtube || ""}
          onChange={handleChange}
          placeholder="https://youtube.com/@shopalotghana"
        />
        <Field
          label="X (Twitter) URL"
          name="twitter"
          value={form.twitter || ""}
          onChange={handleChange}
          placeholder="https://x.com/shopalotghana"
        />
        <Field
          label="LinkedIn URL"
          name="linkedin"
          value={form.linkedin || ""}
          onChange={handleChange}
          placeholder="https://linkedin.com/company/shopalotghana"
        />
      </Section>

      {/* Delivery Settings */}
      <Section title="Delivery Settings" icon={<FiTruck size={18} />}>
        <Field
          label="Delivery Fee (GHS)"
          name="deliveryFee"
          value={form.deliveryFee || ""}
          onChange={handleChange}
          placeholder="30"
          type="number"
          hint="Standard delivery fee applied at checkout"
        />
        <Field
          label="Free Delivery Threshold (GHS)"
          name="freeDeliveryThreshold"
          value={form.freeDeliveryThreshold || ""}
          onChange={handleChange}
          placeholder="500"
          type="number"
          hint="Orders above this amount get free delivery"
        />
      </Section>

      {/* Preview card */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] rounded-2xl
                      p-6 text-white mb-6">
        <p className="text-xs text-white/50 uppercase font-bold mb-3">
          Footer Preview
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-extrabold text-lg mb-1">
              <span className="text-[#FF4500]">Shopalo</span>tghana
            </p>
            <p className="text-white/60 text-xs">{form.tagline}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <FiPhone size={12} /> {form.phone || "Not set"}
            </div>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <FiMail size={12} /> {form.email || "Not set"}
            </div>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <FiMapPin size={12} /> {form.address || "Not set"}
            </div>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-2">Social Links</p>
            <div className="flex flex-wrap gap-2">
              {["facebook", "instagram", "tiktok", "youtube", "twitter", "linkedin"].map(function(s) {
                return form[s] ? (
                  <span key={s}
                    className="text-xs bg-white/10 px-2 py-1 rounded-lg capitalize">
                    {s}
                  </span>
                ) : null
              })}
              {!form.facebook && !form.instagram && !form.tiktok &&
               !form.youtube && !form.twitter && !form.linkedin && (
                <span className="text-white/40 text-xs">No social links set</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#FF4500] hover:bg-red-700
                     disabled:bg-gray-300 text-white font-bold px-8 py-3
                     rounded-xl transition"
        >
          {saving ? <FiRefreshCw size={16} className="animate-spin" /> : <FiSave size={16} />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

    </div>
  )
}