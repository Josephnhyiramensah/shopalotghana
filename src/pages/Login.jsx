import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight
} from "react-icons/fi"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async function(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success("Welcome back, " + user.name.split(" ")[0] + "!")
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate(from)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password")
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
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">Welcome Back</h2>

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={function(e) { setEmail(e.target.value) }}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3
                             text-sm outline-none focus:border-[#FF6F00] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Password</label>
              </div>
              <div className="relative">
                <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={function(e) { setPassword(e.target.value) }}
                  placeholder="Enter your password"
                  onKeyDown={function(e) { if (e.key === "Enter") handleLogin(e) }}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3
                             text-sm outline-none focus:border-[#E63946] transition"
                />
                <button
                  type="button"
                  onClick={function() { setShowPassword(!showPassword) }}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#FF6F00] hover:bg-red-700 disabled:bg-gray-300
                         text-white font-bold py-3 rounded-xl transition flex
                         items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <FiArrowRight size={18} />}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Guest checkout */}
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 border-2
                       border-gray-200 hover:border-[#1D3557] text-gray-700 font-semibold
                       py-3 rounded-xl transition text-sm"
          >
            Continue as Guest
          </Link>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register"
              className="text-[#FF6F00] font-bold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your data is protected under Ghana's Data Protection Act (Act 843)
        </p>
      </div>


      <div className="flex items-center justify-between mb-1.5">
  <label className="text-xs font-semibold text-gray-600">Password</label>
  <Link
    to="/forgot-password"
    className="text-xs text-[#FF6F00] hover:underline font-semibold"
  >
    Forgot Password?
  </Link>
</div>
    </div>
  )
}