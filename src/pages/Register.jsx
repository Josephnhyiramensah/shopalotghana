import { trackSignUp } from "../utils/analytics"

// After successful register:
trackSignUp()

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"

import {
  FiUser, FiMail, FiLock, FiPhone,
  FiEye, FiEyeOff, FiArrowRight, FiCheck
} from "react-icons/fi"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const passwordStrength = function(pwd) {
    if (pwd.length === 0) return { score: 0, label: "", color: "" }
    if (pwd.length < 6) return { score: 1, label: "Too short", color: "bg-red-400" }
    if (pwd.length < 8) return { score: 2, label: "Weak", color: "bg-orange-400" }
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { score: 4, label: "Strong", color: "bg-green-500" }
    }
    return { score: 3, label: "Good", color: "bg-yellow-400" }
  }

  const strength = passwordStrength(password)

  const handleRegister = async function(e) {
    e.preventDefault()
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }
    if (phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (!agreed) {
      toast.error("Please agree to our Terms and Conditions")
      return
    }
    setLoading(true)
    try {
      const user = await register(name, email, password, phone)
      toast.success("Welcome to Shopalotghana, " + user.name.split(" ")[0] + "!")
      navigate("/")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Shopalotghana" className="h-12 w-auto mx-auto" />
          </Link>
          <p className="text-gray-500 mt-2">Create your free account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">
            Create Account
          </h2>

          <div className="space-y-4">

            {/* Full name */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Full Name *
              </label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={function(e) { setName(e.target.value) }}
                  placeholder="Joseph Mensah"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Email Address *
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value) }}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Phone Number *
              </label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={function(e) {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    if (val.length <= 10) setPhone(val)
                  }}
                  maxLength={10}
                  placeholder="0241234567"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
              </div>
              {phone && phone.length < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Phone must be exactly 10 digits ({phone.length}/10)
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Password *
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={function(e) { setPassword(e.target.value) }}
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3
                             text-sm outline-none focus:border-[#FF4500] transition"
                />
                <button
                  type="button"
                  onClick={function() { setShowPassword(!showPassword) }}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(function(i) {
                      return (
                        <div
                          key={i}
                          className={"h-1.5 flex-1 rounded-full transition " +
                            (i <= strength.score ? strength.color : "bg-gray-200")}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Confirm Password *
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={function(e) { setConfirmPassword(e.target.value) }}
                  placeholder="Repeat your password"
                  className={"w-full border rounded-xl pl-10 pr-10 py-3 text-sm " +
                    "outline-none transition " +
                    (confirmPassword && password !== confirmPassword
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-200 focus:border-[#FF4500]")}
                />
                <button
                  type="button"
                  onClick={function() { setShowConfirm(!showConfirm) }}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <FiCheck size={16} className="absolute right-8 top-3.5 text-green-500" />
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={function() { setAgreed(!agreed) }}
                className={"mt-0.5 w-5 h-5 rounded border-2 flex items-center " +
                  "justify-center flex-shrink-0 transition " +
                  (agreed
                    ? "bg-[#FF4500] border-[#FF4500]"
                    : "border-gray-300 hover:border-[#FF4500]")}
              >
                {agreed && <FiCheck size={12} className="text-white" />}
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to Shopalotghana's{" "}
                <Link to="/terms" className="text-[#FF4500] font-semibold hover:underline">
                  Terms and Conditions
                </Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-[#FF4500] font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-red-700 disabled:bg-gray-300
                         text-white font-bold py-3 rounded-xl transition flex
                         items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <FiArrowRight size={18} />}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FF4500] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your data is protected under Ghana's Data Protection Act (Act 843)
        </p>
      </div>
    </div>
  )
}