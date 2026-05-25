import process from "node:process"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/User.js"
import sendEmail from "../utils/sendEmail.js"

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

// @POST /api/auth/register
export const register = async function(req, res) {
  try {
    const { name, email, password, phone } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" })

    const user = await User.create({ name, email, password, phone })
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    console.log("REGISTER ERROR:", err.message)   // ← ADD THIS LINE
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/auth/login
export const login = async function(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" })

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @GET /api/auth/me
export const getMe = async function(req, res) {
  const user = await User.findById(req.user.id).select("-password")
  res.json({ success: true, user })
}

// @PUT /api/auth/update-profile
export const updateProfile = async function(req, res) {
  try {
    const { name, phone, addresses } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, addresses },
      { new: true }
    ).select("-password")
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @POST /api/auth/forgot-password
export const forgotPassword = async function(req, res) {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address"
      })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    await user.save()

    const resetUrl = process.env.FRONTEND_URL + "/reset-password/" + resetToken

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E63946; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Shopalotghana</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Quality Living, Locally Delivered</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1D3557;">Password Reset Request</h2>
          <p style="color: #555;">Hello ${user.name},</p>
          <p style="color: #555;">
            We received a request to reset your password.
            Click the button below to create a new password.
            This link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
              style="background: #E63946; color: white; padding: 14px 32px;
                     border-radius: 8px; text-decoration: none; font-weight: bold;
                     font-size: 16px;">
              Reset My Password
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">
            If you did not request a password reset, please ignore this email.
            Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Shopalotghana.com — All rights reserved.
          </p>
        </div>
      </div>
    `

    await sendEmail({
      to: user.email,
      subject: "Shopalotghana — Password Reset Request",
      html: html,
    })

    res.json({
      success: true,
      message: "Password reset link sent to " + user.email
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// @PUT /api/auth/reset-password/:token
export const resetPassword = async function(req, res) {
  try {
    const { password } = req.body

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired"
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    res.json({ success: true, message: "Password reset successful" })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

