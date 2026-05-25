import process from "node:process"
import axios from "axios"
import Order from "../models/Order.js"
import sendEmail from "../utils/sendEmail.js"
import { orderConfirmationEmail } from "../utils/emailTemplates.js"

// @POST /api/payment/verify
export const verifyPayment = async function(req, res) {
  try {
    const { reference, orderId } = req.body

    if (!reference || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Reference and Order ID are required"
      })
    }

    // Verify with Paystack
    const response = await axios.get(
      "https://api.paystack.co/transaction/verify/" + reference,
      {
        headers: {
          Authorization: "Bearer " + process.env.PAYSTACK_SECRET_KEY
        }
      }
    )

    const { status, amount } = response.data.data

    if (status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful"
      })
    }

    // Find order and verify amount
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    const expectedAmount = Math.round(order.totalPrice * 100)
    if (amount < expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch"
      })
    }

    // Update order as paid
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      status: "processing",
      paymentReference: reference,
      paymentResult: {
        reference,
        status,
        amount,
        paidAt: new Date(),
      }
    })

    // Re-fetch populated order for email
    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")

    // Send payment confirmed email
    try {
      const emailTo = updatedOrder.guestInfo?.email
        || updatedOrder.user?.email
      if (emailTo) {
        const emailData = orderConfirmationEmail(updatedOrder)
        emailData.subject = "💳 Payment Confirmed — #" +
          orderId.slice(-8).toUpperCase() + " | Shopalotghana"
        await sendEmail(emailData)
      }
    } catch (emailErr) {
      console.log("Payment email failed:", emailErr.message)
    }

    console.log("Payment verified for order:", orderId)
    res.json({ success: true, message: "Payment verified successfully" })

  } catch (err) {
    console.log("PAYMENT VERIFY ERROR:", err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}