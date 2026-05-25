// ── Order Confirmation ─────────────────────────────────────
export function orderConfirmationEmail(order) {
  const customerName = order.shippingAddress?.fullName
    || order.guestInfo?.name
    || order.user?.name
    || "Valued Customer"

  const customerEmail = order.guestInfo?.email
    || order.user?.email
    || ""

  const shortId = order._id.toString().slice(-8).toUpperCase()
  const address = order.shippingAddress

  const items = order.items.map(function(item) {
    return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.image || ""}" width="56" height="56"
              style="border-radius:8px;object-fit:cover;border:1px solid #eee;"/>
            <div>
              <p style="margin:0;font-weight:600;color:#1D3557;font-size:14px;">
                ${item.name}
              </p>
              <p style="margin:4px 0 0;color:#888;font-size:13px;">
                Qty: ${item.quantity}
              </p>
            </div>
          </div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;
                   text-align:right;font-weight:700;color:#1D3557;">
          GH₵ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
  }).join("")

  return {
    to: customerEmail,
    subject: "✅ Order Confirmed — #" + shortId + " | Shopalotghana",
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6f9;
                 font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table width="100%"
              style="max-width:580px;background:#fff;border-radius:20px;
                     overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <tr>
                <td style="background:linear-gradient(135deg,#1D3557,#2d5a8e);
                           padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
                    Shopalotghana
                  </h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                            font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                    Quality Living, Locally Delivered
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 32px 0;text-align:center;">
                  <div style="display:inline-block;background:#e8f5e9;
                              border-radius:50%;padding:16px;margin-bottom:16px;">
                    <span style="font-size:40px;">✅</span>
                  </div>
                  <h2 style="margin:0;color:#1D3557;font-size:22px;font-weight:800;">
                    Order Confirmed!
                  </h2>
                  <p style="margin:8px 0 0;color:#666;font-size:15px;">
                    Hi ${customerName}, thank you for shopping with us 🇬🇭
                  </p>
                  <div style="display:inline-block;background:#fff3e0;
                              border:1px solid #ffe0b2;border-radius:20px;
                              padding:6px 20px;margin-top:12px;">
                    <span style="color:#FF4500;font-weight:800;font-size:13px;">
                      Order ID: #${shortId}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 0;">
                  <h3 style="margin:0 0 16px;color:#1D3557;font-size:15px;
                             font-weight:700;border-bottom:2px solid #f0f0f0;
                             padding-bottom:10px;">
                    🛍️ Items Ordered
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${items}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8f9fa;border-radius:12px;padding:16px;">
                    <tr>
                      <td style="padding:6px 16px;color:#666;font-size:14px;">
                        Subtotal
                      </td>
                      <td style="padding:6px 16px;text-align:right;
                                 color:#333;font-size:14px;">
                        GH₵ ${(order.itemsPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                    ${order.discount > 0 ? `
                    <tr>
                      <td style="padding:6px 16px;color:#2e7d32;font-size:14px;">
                        Discount
                      </td>
                      <td style="padding:6px 16px;text-align:right;
                                 color:#2e7d32;font-size:14px;">
                        - GH₵ ${(order.discount).toFixed(2)}
                      </td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding:6px 16px;color:#666;font-size:14px;">
                        Delivery Fee
                      </td>
                      <td style="padding:6px 16px;text-align:right;
                                 color:#333;font-size:14px;">
                        ${order.deliveryFee === 0
                          ? '<span style="color:#2e7d32;font-weight:600;">FREE</span>'
                          : "GH₵ " + (order.deliveryFee || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 16px;color:#1D3557;
                                 font-weight:800;font-size:16px;">
                        Total Paid
                      </td>
                      <td style="padding:10px 16px;text-align:right;
                                 color:#FF4500;font-weight:800;font-size:18px;">
                        GH₵ ${(order.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 20px;">
                  <h3 style="margin:0 0 12px;color:#1D3557;font-size:15px;
                             font-weight:700;">
                    📦 Delivery Address
                  </h3>
                  <div style="background:#f0f4ff;border-radius:12px;
                              padding:16px 20px;border-left:4px solid #1D3557;">
                    <p style="margin:0;font-weight:700;color:#1D3557;font-size:14px;">
                      ${address?.fullName || customerName}
                    </p>
                    <p style="margin:4px 0 0;color:#555;font-size:13px;">
                      ${address?.street || ""}
                    </p>
                    ${address?.landmark
                      ? `<p style="margin:2px 0 0;color:#888;font-size:13px;">
                           Near: ${address.landmark}</p>`
                      : ""}
                    <p style="margin:2px 0 0;color:#555;font-size:13px;">
                      ${address?.city || ""}, ${address?.region || ""}
                    </p>
                    <p style="margin:4px 0 0;color:#1D3557;
                               font-weight:600;font-size:13px;">
                      📞 ${address?.phone || ""}
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 24px;">
                  <h3 style="margin:0 0 12px;color:#1D3557;font-size:15px;
                             font-weight:700;">
                    💳 Payment Method
                  </h3>
                  <div style="background:#f9f9f9;border-radius:12px;
                              padding:14px 20px;">
                    <p style="margin:0;font-weight:700;color:#333;font-size:14px;">
                      ${order.paymentMethod === "mobile_money" ? "📱 Mobile Money"
                        : order.paymentMethod === "card" ? "💳 Debit / Credit Card"
                        : "💵 Cash on Delivery"}
                    </p>
                    <span style="background:${order.isPaid ? "#e8f5e9" : "#fff8e1"};
                           color:${order.isPaid ? "#2e7d32" : "#f57f17"};
                           padding:2px 10px;border-radius:20px;font-weight:700;
                           font-size:12px;display:inline-block;margin-top:6px;">
                      ${order.isPaid ? "✅ Paid" : "⏳ Payment Pending"}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 28px;">
                  <div style="background:linear-gradient(135deg,#e3f2fd,#f3e5f5);
                              border-radius:14px;padding:20px 24px;">
                    <h3 style="margin:0 0 14px;color:#1D3557;font-size:15px;
                               font-weight:700;">
                      🚀 What Happens Next?
                    </h3>
                    <p style="margin:0 0 8px;color:#444;font-size:13px;">
                      ✅ <strong>Step 1:</strong> We confirm your order within 1 hour
                    </p>
                    <p style="margin:0 0 8px;color:#444;font-size:13px;">
                      📦 <strong>Step 2:</strong> Your items are packed and dispatched
                    </p>
                    <p style="margin:0;color:#444;font-size:13px;">
                      🚚 <strong>Step 3:</strong> Delivered to your doorstep in 1-3 days
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background:#1D3557;padding:24px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">
                    Questions? Contact us at
                    <a href="mailto:support@shopalotghana.com"
                       style="color:#F4A261;text-decoration:none;font-weight:600;">
                      support@shopalotghana.com
                    </a>
                  </p>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                    © ${new Date().getFullYear()} Shopalotghana.com — All rights reserved.
                  </p>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.3);font-size:11px;">
                    Designed by Prof. JNK Mensah @ Core.Tech Technology
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  }
}

// ── Shipped Email ──────────────────────────────────────────
export function orderShippedEmail(order) {
  const customerName = order.shippingAddress?.fullName
    || order.guestInfo?.name
    || order.user?.name
    || "Valued Customer"

  const customerEmail = order.guestInfo?.email
    || order.user?.email
    || ""

  const shortId = order._id.toString().slice(-8).toUpperCase()
  const address = order.shippingAddress

  return {
    to: customerEmail,
    subject: "🚚 Your Order #" + shortId + " Has Shipped! | Shopalotghana",
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6f9;
                 font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table width="100%"
              style="max-width:580px;background:#fff;border-radius:20px;
                     overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <tr>
                <td style="background:linear-gradient(135deg,#1D3557,#2d5a8e);
                           padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
                    Shopalotghana
                  </h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                            font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                    Quality Living, Locally Delivered
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 32px 0;text-align:center;">
                  <div style="display:inline-block;background:#e3f2fd;
                              border-radius:50%;padding:16px;margin-bottom:16px;">
                    <span style="font-size:40px;">🚚</span>
                  </div>
                  <h2 style="margin:0;color:#1D3557;font-size:22px;font-weight:800;">
                    Your Order Is On Its Way!
                  </h2>
                  <p style="margin:8px 0 0;color:#666;font-size:15px;">
                    Hi ${customerName}, your order has been shipped 🎉
                  </p>
                  <div style="display:inline-block;background:#e3f2fd;
                              border:1px solid #bbdefb;border-radius:20px;
                              padding:6px 20px;margin-top:12px;">
                    <span style="color:#1565c0;font-weight:800;font-size:13px;">
                      Order ID: #${shortId}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 0;">
                  <h3 style="margin:0 0 12px;color:#1D3557;font-size:15px;
                             font-weight:700;">
                    📦 Delivering To
                  </h3>
                  <div style="background:#f0f4ff;border-radius:12px;
                              padding:16px 20px;border-left:4px solid #1D3557;">
                    <p style="margin:0;font-weight:700;color:#1D3557;font-size:14px;">
                      ${address?.fullName || customerName}
                    </p>
                    <p style="margin:4px 0 0;color:#555;font-size:13px;">
                      ${address?.street || ""}
                    </p>
                    ${address?.landmark
                      ? `<p style="margin:2px 0 0;color:#888;font-size:13px;">
                           Near: ${address.landmark}</p>`
                      : ""}
                    <p style="margin:2px 0 0;color:#555;font-size:13px;">
                      ${address?.city || ""}, ${address?.region || ""}
                    </p>
                    <p style="margin:4px 0 0;color:#1D3557;
                               font-weight:600;font-size:13px;">
                      📞 ${address?.phone || ""}
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 32px 28px;">
                  <div style="background:linear-gradient(135deg,#e3f2fd,#f3e5f5);
                              border-radius:14px;padding:20px 24px;">
                    <h3 style="margin:0 0 14px;color:#1D3557;font-size:15px;
                               font-weight:700;">
                      📋 What To Expect
                    </h3>
                    <p style="margin:0 0 8px;color:#444;font-size:13px;">
                      🕐 <strong>Estimated delivery:</strong> 1-3 business days
                    </p>
                    <p style="margin:0 0 8px;color:#444;font-size:13px;">
                      📞 <strong>Our agent will call</strong> before arriving
                    </p>
                    <p style="margin:0;color:#444;font-size:13px;">
                      💵 <strong>Have payment ready</strong> if paying cash on delivery
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8f9fa;border-radius:12px;padding:16px;">
                    <tr>
                      <td style="padding:8px 16px;color:#1D3557;
                                 font-weight:800;font-size:15px;">
                        Order Total
                      </td>
                      <td style="padding:8px 16px;text-align:right;
                                 color:#FF4500;font-weight:800;font-size:18px;">
                        GH₵ ${(order.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="background:#1D3557;padding:24px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">
                    Questions? Email
                    <a href="mailto:support@shopalotghana.com"
                       style="color:#F4A261;text-decoration:none;font-weight:600;">
                      support@shopalotghana.com
                    </a>
                  </p>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                    © ${new Date().getFullYear()} Shopalotghana.com
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  }
}

// ── Delivered Email ────────────────────────────────────────
export function orderDeliveredEmail(order) {
  const customerName = order.shippingAddress?.fullName
    || order.guestInfo?.name
    || order.user?.name
    || "Valued Customer"

  const customerEmail = order.guestInfo?.email
    || order.user?.email
    || ""

  const shortId = order._id.toString().slice(-8).toUpperCase()

  const items = order.items.map(function(item) {
    return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.image || ""}" width="48" height="48"
              style="border-radius:8px;object-fit:cover;border:1px solid #eee;"/>
            <div>
              <p style="margin:0;font-weight:600;color:#1D3557;font-size:14px;">
                ${item.name}
              </p>
              <p style="margin:4px 0 0;color:#888;font-size:13px;">
                Qty: ${item.quantity}
              </p>
            </div>
          </div>
        </td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;
                   text-align:right;font-weight:700;color:#1D3557;">
          GH₵ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
  }).join("")

  return {
    to: customerEmail,
    subject: "✅ Order #" + shortId +
             " Delivered! Leave a Review | Shopalotghana",
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6f9;
                 font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table width="100%"
              style="max-width:580px;background:#fff;border-radius:20px;
                     overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <tr>
                <td style="background:linear-gradient(135deg,#1D3557,#2d5a8e);
                           padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
                    Shopalotghana
                  </h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                            font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                    Quality Living, Locally Delivered
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 32px 0;text-align:center;">
                  <div style="display:inline-block;background:#e8f5e9;
                              border-radius:50%;padding:16px;margin-bottom:16px;">
                    <span style="font-size:40px;">🎉</span>
                  </div>
                  <h2 style="margin:0;color:#1D3557;font-size:22px;font-weight:800;">
                    Order Delivered!
                  </h2>
                  <p style="margin:8px 0 0;color:#666;font-size:15px;">
                    Hi ${customerName}, your order has been delivered successfully!
                  </p>
                  <div style="display:inline-block;background:#e8f5e9;
                              border:1px solid #c8e6c9;border-radius:20px;
                              padding:6px 20px;margin-top:12px;">
                    <span style="color:#2e7d32;font-weight:800;font-size:13px;">
                      Order ID: #${shortId}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 0;">
                  <h3 style="margin:0 0 16px;color:#1D3557;font-size:15px;
                             font-weight:700;border-bottom:2px solid #f0f0f0;
                             padding-bottom:10px;">
                    🛍️ Items Delivered
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${items}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8f9fa;border-radius:12px;padding:16px;">
                    <tr>
                      <td style="padding:8px 16px;color:#1D3557;
                                 font-weight:800;font-size:15px;">
                        Total Paid
                      </td>
                      <td style="padding:8px 16px;text-align:right;
                                 color:#FF4500;font-weight:800;font-size:18px;">
                        GH₵ ${(order.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 28px;text-align:center;">
                  <div style="background:linear-gradient(135deg,#fff8e1,#fff3e0);
                              border-radius:16px;padding:24px;
                              border:1px solid #ffe0b2;">
                    <p style="margin:0 0 6px;font-size:20px;">⭐⭐⭐⭐⭐</p>
                    <h3 style="margin:0 0 8px;color:#1D3557;font-size:16px;
                               font-weight:700;">
                      How was your experience?
                    </h3>
                    <p style="margin:0 0 16px;color:#666;font-size:13px;">
                      Your feedback helps other Ghanaians make better choices
                    </p>
                    <a href="https://shopalotghana.com/shop"
                       style="background:#FF4500;color:#fff;text-decoration:none;
                              font-weight:800;font-size:14px;padding:12px 28px;
                              border-radius:12px;display:inline-block;">
                      Leave a Review →
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 32px 28px;text-align:center;">
                  <a href="https://shopalotghana.com/shop"
                     style="background:#1D3557;color:#fff;text-decoration:none;
                            font-weight:700;font-size:14px;padding:12px 28px;
                            border-radius:12px;display:inline-block;">
                    🛒 Shop Again
                  </a>
                </td>
              </tr>

              <tr>
                <td style="background:#1D3557;padding:24px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">
                    Thank you for choosing Shopalotghana 🇬🇭
                  </p>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">
                    © ${new Date().getFullYear()} Shopalotghana.com
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  }
}

// ── Cancelled Email ────────────────────────────────────────
export function orderCancelledEmail(order) {
  const customerName = order.shippingAddress?.fullName
    || order.guestInfo?.name
    || order.user?.name
    || "Valued Customer"

  const customerEmail = order.guestInfo?.email
    || order.user?.email
    || ""

  const shortId = order._id.toString().slice(-8).toUpperCase()

  return {
    to: customerEmail,
    subject: "❌ Order #" + shortId + " Cancelled | Shopalotghana",
    html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f6f9;
                 font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table width="100%"
              style="max-width:580px;background:#fff;border-radius:20px;
                     overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <tr>
                <td style="background:linear-gradient(135deg,#1D3557,#2d5a8e);
                           padding:36px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
                    Shopalotghana
                  </h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);
                            font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                    Quality Living, Locally Delivered
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 32px 0;text-align:center;">
                  <div style="display:inline-block;background:#ffebee;
                              border-radius:50%;padding:16px;margin-bottom:16px;">
                    <span style="font-size:40px;">😔</span>
                  </div>
                  <h2 style="margin:0;color:#1D3557;font-size:22px;font-weight:800;">
                    Order Cancelled
                  </h2>
                  <p style="margin:8px 0 0;color:#666;font-size:15px;">
                    Hi ${customerName}, your order has been cancelled.
                  </p>
                  <div style="display:inline-block;background:#ffebee;
                              border:1px solid #ffcdd2;border-radius:20px;
                              padding:6px 20px;margin-top:12px;">
                    <span style="color:#c62828;font-weight:800;font-size:13px;">
                      Order ID: #${shortId}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="background:#f8f9fa;border-radius:12px;padding:16px;">
                    <tr>
                      <td style="padding:6px 16px;color:#666;font-size:14px;">
                        Items
                      </td>
                      <td style="padding:6px 16px;text-align:right;
                                 color:#333;font-size:14px;">
                        ${order.items?.length || 0} item(s)
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 16px;color:#666;font-size:14px;">
                        Payment Method
                      </td>
                      <td style="padding:6px 16px;text-align:right;
                                 color:#333;font-size:14px;">
                        ${order.paymentMethod === "cash_on_delivery"
                          ? "Cash on Delivery"
                          : order.paymentMethod === "mobile_money"
                          ? "Mobile Money" : "Card"}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 16px;color:#1D3557;
                                 font-weight:800;font-size:15px;">
                        Order Total
                      </td>
                      <td style="padding:10px 16px;text-align:right;
                                 color:#FF4500;font-weight:800;font-size:16px;">
                        GH₵ ${(order.totalPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${order.isPaid ? `
              <tr>
                <td style="padding:20px 32px 0;">
                  <div style="background:#e8f5e9;border-radius:12px;
                              padding:16px 20px;border-left:4px solid #2e7d32;">
                    <p style="margin:0;color:#2e7d32;font-weight:700;font-size:14px;">
                      💰 Refund Information
                    </p>
                    <p style="margin:6px 0 0;color:#444;font-size:13px;">
                      Your refund of
                      <strong>GH₵ ${(order.totalPrice || 0).toFixed(2)}</strong>
                      will be processed within 3-5 business days.
                    </p>
                  </div>
                </td>
              </tr>` : ""}

              <tr>
                <td style="padding:24px 32px 28px;text-align:center;">
                  <p style="margin:0 0 16px;color:#666;font-size:14px;">
                    We're sorry for the inconvenience. Browse our store for
                    more great products!
                  </p>
                  <a href="https://shopalotghana.com/shop"
                     style="background:#FF4500;color:#fff;text-decoration:none;
                            font-weight:800;font-size:14px;padding:12px 28px;
                            border-radius:12px;display:inline-block;">
                    Continue Shopping →
                  </a>
                </td>
              </tr>

              <tr>
                <td style="background:#1D3557;padding:24px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">
                    Questions? Email
                    <a href="mailto:support@shopalotghana.com"
                       style="color:#F4A261;text-decoration:none;font-weight:600;">
                      support@shopalotghana.com
                    </a>
                  </p>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);
                            font-size:11px;">
                    © ${new Date().getFullYear()} Shopalotghana.com
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  }
}