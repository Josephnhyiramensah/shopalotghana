import Coupon from "../models/Coupon.js";

// @POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: "Coupon expired" });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: "Coupon limit reached" });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({
      success: false, message: `Minimum order of GHS ${coupon.minOrderAmount} required`
    });

    const discount = coupon.discountType === "percentage"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

    res.json({ success: true, discount, couponId: coupon._id, code: coupon.code });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/coupons  [ADMIN]
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/coupons  [ADMIN]
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
};

// @DELETE /api/coupons/:id  [ADMIN]
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};