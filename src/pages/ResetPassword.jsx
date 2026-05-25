import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import {
  FiLock, FiEye, FiEyeOff,
  FiArrowRight, FiCheck
} from "react-icons/fi"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const handleReset = async function(e) {
    e.preventDefault()
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
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
    setLoading(true)
    try {
      await axios.put("/auth/reset-password/" + token, { password })
      setSuccess(true)
      toast.success("Password reset successful!")
      setTimeout(function() { navigate("/login") }, 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired")
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
              <span className="text-[#E63946]">Shopalo</span>
              <span className="text-[#1D3557]">tghana</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2">Create a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {success ? (
            /* Success state */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto mb-4">
                <FiCheck size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1D3557] mb-3">
                Password Reset!
              </h2>
              <p className="text-gray-500 mb-6">
                Your password has been reset successfully.
                Redirecting you to login in 3 seconds...
              </p>
              <Link
                to="/login"
                className="bg-[#E63946] hover:bg-red-700 text-white font-bold
                           px-6 py-3 rounded-xl transition inline-block"
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            /* Form */
            <div>
              <h2 className="text-2xl font-extrabold text-[#1D3557] mb-2">
                Reset Password
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your new password below.
              </p>

              <div className="space-y-4">

                {/* New password */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={function(e) { setPassword(e.target.value) }}
                      placeholder="Min 6 characters"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-10
                                 py-3 text-sm outline-none focus:border-[#E63946] transition"
                    />
                    <button
                      type="button"
                      onClick={function() { setShowPassword(!showPassword) }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>

                  {/* Strength meter */}
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
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={function(e) { setConfirmPassword(e.target.value) }}
                      placeholder="Repeat new password"
                      className={"w-full border rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition " +
                        (confirmPassword && password !== confirmPassword
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-200 focus:border-[#E63946]")}
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

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full bg-[#E63946] hover:bg-red-700 disabled:bg-gray-300
                             text-white font-bold py-3 rounded-xl transition flex
                             items-center justify-center gap-2"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                  {!loading && <FiArrowRight size={18} />}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-[#E63946] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}