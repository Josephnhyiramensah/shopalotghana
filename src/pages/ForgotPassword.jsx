import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { FiMail, FiArrowLeft, FiArrowRight } from "react-icons/fi"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async function(e) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }
    setLoading(true)
    try {
      await axios.post("/auth/forgot-password", { email })
      setSent(true)
      toast.success("Reset link sent!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link")
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
            <span className="text-3xl font-extrabold">
              <span className="text-[#FF6F00]">Shopalo</span>
              <span className="text-[#1D3557]">tghana</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="text-7xl mb-4">📧</div>
              <h2 className="text-2xl font-extrabold text-[#1D3557] mb-3">
                Check Your Email
              </h2>
              <p className="text-gray-500 mb-2">
                We sent a password reset link to:
              </p>
              <p className="font-bold text-[#FF6F00] text-lg mb-6">{email}</p>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                <p className="text-yellow-700 text-sm">
                  ⏰ The link expires in <strong>15 minutes</strong>.
                  Check your spam folder if you do not see it.
                </p>
              </div>
              <button
                onClick={function() { setSent(false) }}
                className="text-sm text-[#FF6F00] hover:underline font-semibold"
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form state */
            <div>
              <h2 className="text-2xl font-extrabold text-[#1D3557] mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email address and we will send you a link to reset your password.
              </p>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={function(e) { setEmail(e.target.value) }}
                    onKeyDown={function(e) { if (e.key === "Enter") handleSubmit(e) }}
                    placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4
                               py-3 text-sm outline-none focus:border-[#FF6F00] transition"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#FF6F00] hover:bg-red-700 disabled:bg-gray-300
                           text-white font-bold py-3 rounded-xl transition flex
                           items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <FiArrowRight size={18} />}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-4 text-sm
                           text-gray-500 hover:text-[#FF6F00] transition font-medium"
              >
                <FiArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your data is protected under Ghana's Data Protection Act (Act 843)
        </p>
      </div>
    </div>
  )
}