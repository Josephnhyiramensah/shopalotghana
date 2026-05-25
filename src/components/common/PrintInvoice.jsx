import { useRef } from "react"
import { FiX, FiPrinter, FiDownload } from "react-icons/fi"
import { formatGHS } from "../../utils/formatCurrency"

export default function PrintInvoice({ order, onClose }) {
  const printRef = useRef(null)

  function handlePrint() {
  const printWindow = window.open("", "_blank", "width=850,height=950")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${shortId} — Shopalotghana</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a1a1a;
            background: #fff;
            padding: 32px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid #FF4500;
            margin-bottom: 28px;
          }
          .brand { font-size:26px; font-weight:900; color:#1D3557; }
          .brand span { color:#FF4500; }
          .tagline { font-size:11px; color:#888; margin-top:4px; }
          .invoice-right { text-align:right; }
          .invoice-right h2 {
            font-size:20px; font-weight:900;
            color:#FF4500; text-transform:uppercase; letter-spacing:2px;
          }
          .invoice-right p { font-size:12px; color:#555; margin-top:4px; }
          .invoice-right .oid {
            font-size:13px; font-weight:700; color:#1D3557; margin-top:4px;
          }
          .paid-badge {
            display:inline-block; margin-top:6px;
            padding:3px 12px; border-radius:20px; font-size:11px; font-weight:700;
          }
          .paid   { background:#e8f5e9; color:#2e7d32; }
          .unpaid { background:#fff8e1; color:#f57f17; }
          .meta {
            display:grid; grid-template-columns:1fr 1fr 1fr;
            gap:16px; margin-bottom:28px;
          }
          .meta-box {
            background:#f8f9fa; border-radius:10px;
            padding:12px 16px; border-left:4px solid #FF4500;
          }
          .meta-box label {
            font-size:9px; color:#888; text-transform:uppercase;
            letter-spacing:1px; font-weight:700; display:block; margin-bottom:4px;
          }
          .meta-box p { font-size:12px; color:#1D3557; font-weight:700; }
          .meta-box p.sm { font-size:11px; font-weight:400; color:#555; margin-top:2px; }
          .section-label {
            font-size:11px; font-weight:800; color:#1D3557;
            text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;
          }
          table { width:100%; border-collapse:collapse; margin-bottom:20px; }
          thead tr { background:#1D3557; color:#fff; }
          thead th {
            padding:9px 12px; font-size:11px; font-weight:700;
            text-align:left; text-transform:uppercase;
          }
          thead th:last-child { text-align:right; }
          tbody tr { border-bottom:1px solid #f0f0f0; }
          tbody tr:nth-child(even) { background:#fafafa; }
          tbody td { padding:10px 12px; font-size:12px; color:#333; }
          tbody td:last-child { text-align:right; font-weight:700; color:#1D3557; }
          .totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
          .totals-inner { width:240px; }
          .trow {
            display:flex; justify-content:space-between;
            padding:5px 0; font-size:12px; color:#555;
            border-bottom:1px solid #f0f0f0;
          }
          .trow.discount { color:#2e7d32; }
          .trow.total {
            font-size:15px; font-weight:900; color:#1D3557;
            border-bottom:none; border-top:2px solid #1D3557;
            padding-top:8px; margin-top:4px;
          }
          .trow.total span:last-child { color:#FF4500; }
          .footer {
            border-top:2px solid #f0f0f0; padding-top:16px;
            display:flex; justify-content:space-between; align-items:flex-end;
            margin-bottom:16px;
          }
          .footer p { font-size:10px; color:#888; line-height:1.7; }
          .footer-brand { font-size:15px; font-weight:900; color:#1D3557; }
          .footer-brand span { color:#FF4500; }
          .thankyou {
            background:linear-gradient(135deg,#1D3557,#2d5a8e);
            color:#fff; text-align:center; padding:12px;
            border-radius:10px; font-size:12px; font-weight:600;
          }
          @media print {
            @page { margin:8mm; size:A4; }
            body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand"><span>Shopalo</span>tghana</div>
            <div class="tagline">Quality Living, Locally Delivered 🇬🇭</div>
            <div class="tagline">support@shopalotghana.com</div>
          </div>
          <div class="invoice-right">
            <h2>Invoice</h2>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString("en-GH", {
              year: "numeric", month: "long", day: "numeric"
            })}</p>
            <p class="oid">Order #: ${shortId}</p>
            <span class="paid-badge ${order.isPaid ? "paid" : "unpaid"}">
              ${order.isPaid ? "✅ PAID" : "⏳ PENDING"}
            </span>
          </div>
        </div>

        <div class="meta">
          <div class="meta-box">
            <label>Bill To</label>
            <p>${customerName}</p>
            <p class="sm">${customerEmail}</p>
            <p class="sm">${customerPhone}</p>
          </div>
          <div class="meta-box" style="border-color:#457B9D;">
            <label>Deliver To</label>
            <p>${address?.street || ""}</p>
            <p class="sm">${address?.city || ""}, ${address?.region || ""}</p>
            ${address?.phone ? `<p class="sm">📞 ${address.phone}</p>` : ""}
          </div>
          <div class="meta-box" style="border-color:#2e7d32;">
            <label>Payment</label>
            <p>${order.paymentMethod === "mobile_money" ? "📱 Mobile Money"
                : order.paymentMethod === "card" ? "💳 Card"
                : "💵 Cash on Delivery"}</p>
            <p class="sm">Status: ${order.status}</p>
          </div>
        </div>

        <div class="section-label">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(function(item, i) {
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align:center;">${item.quantity}</td>
                  <td style="text-align:right;">GH₵ ${(item.price).toFixed(2)}</td>
                  <td>GH₵ ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
            }).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-inner">
            <div class="trow">
              <span>Subtotal</span>
              <span>GH₵ ${(order.itemsPrice || 0).toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="trow discount">
              <span>Discount</span>
              <span>- GH₵ ${(order.discount).toFixed(2)}</span>
            </div>` : ""}
            <div class="trow">
              <span>Delivery</span>
              <span>${order.deliveryFee === 0
                ? "FREE"
                : "GH₵ " + (order.deliveryFee || 0).toFixed(2)}</span>
            </div>
            <div class="trow total">
              <span>Total</span>
              <span>GH₵ ${(order.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${order.shippingAddress?.notes ? `
        <div style="background:#fff8e1;border-radius:8px;padding:12px 16px;
                    border:1px solid #ffe0b2;margin-bottom:20px;">
          <p style="font-size:11px;font-weight:700;color:#f57f17;margin-bottom:4px;">
            📝 Delivery Note
          </p>
          <p style="font-size:12px;color:#555;">${order.shippingAddress.notes}</p>
        </div>` : ""}

        <div class="footer">
          <div>
            <p>This is an official receipt from Shopalotghana.com</p>
            <p>Support: support@shopalotghana.com</p>
            <p>Return policy: 7 days from delivery date</p>
          </div>
          <div style="text-align:right;">
            <div class="footer-brand"><span>Shopalo</span>tghana</div>
            <p style="font-size:10px;color:#888;margin-top:4px;">
              Designed by Core.Tech Technology
            </p>
          </div>
        </div>

        <div class="thankyou">
          Thank you for shopping with Shopalotghana! 🇬🇭 — shopalotghana.com
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(function() {
    printWindow.print()
  }, 500)
}
  if (!order) return null

  const shortId     = order._id.toString().slice(-8).toUpperCase()
  const address     = order.shippingAddress
  const customerName = address?.fullName
    || order.guestInfo?.name
    || order.user?.name
    || "Customer"
  const customerEmail = order.guestInfo?.email || order.user?.email || ""
  const customerPhone = address?.phone || order.guestInfo?.phone || ""

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GH", {
    year: "numeric", month: "long", day: "numeric"
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-start
                    justify-center overflow-y-auto py-8 px-4">

      {/* Action buttons */}
      <div className="fixed top-4 right-4 flex gap-2 z-[10000]">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#FF4500] text-white font-bold
                     px-5 py-2.5 rounded-xl hover:bg-red-700 transition shadow-lg"
        >
          <FiPrinter size={18} /> Print / Save PDF
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white text-gray-700 font-bold
                     px-5 py-2.5 rounded-xl hover:bg-gray-100 transition shadow-lg"
        >
          <FiX size={18} /> Close
        </button>
      </div>

      {/* Invoice */}
      <div
        ref={printRef}
        className="invoice-wrap bg-white rounded-2xl shadow-2xl w-full
                   max-w-2xl overflow-hidden"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >

        {/* Header */}
        <div className="header flex items-start justify-between p-10 pb-6
                        border-b-4 border-[#FF4500]">
          <div>
            <div className="brand-name text-3xl font-black text-[#1D3557]">
              <span className="text-[#FF4500]">Shopalo</span>tghana
            </div>
            <p className="brand-tagline text-gray-400 text-xs mt-1">
              Quality Living, Locally Delivered 🇬🇭
            </p>
            <p className="text-xs text-gray-400 mt-1">
              support@shopalotghana.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-[#FF4500] tracking-widest
                           uppercase">
              Invoice
            </h2>
            <p className="text-sm text-gray-500 mt-1">Date: {orderDate}</p>
            <p className="text-sm font-bold text-[#1D3557] mt-1">
              Order #: {shortId}
            </p>
            <span className={"text-xs font-bold px-3 py-1 rounded-full mt-2 " +
              "inline-block " +
              (order.isPaid
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")}>
              {order.isPaid ? "✅ PAID" : "⏳ PAYMENT PENDING"}
            </span>
          </div>
        </div>

        {/* Meta grid */}
        <div className="meta-grid grid grid-cols-3 gap-4 px-10 py-6">
          <div className="meta-box bg-gray-50 rounded-xl p-4
                          border-l-4 border-[#FF4500]">
            <label className="text-xs text-gray-400 uppercase tracking-widest
                               font-bold block mb-1">
              Bill To
            </label>
            <p className="font-bold text-[#1D3557] text-sm">{customerName}</p>
            {customerEmail && (
              <p className="text-xs text-gray-500 mt-0.5">{customerEmail}</p>
            )}
            {customerPhone && (
              <p className="text-xs text-gray-500">{customerPhone}</p>
            )}
          </div>
          <div className="meta-box bg-gray-50 rounded-xl p-4
                          border-l-4 border-blue-400">
            <label className="text-xs text-gray-400 uppercase tracking-widest
                               font-bold block mb-1">
              Deliver To
            </label>
            <p className="font-bold text-[#1D3557] text-sm">
              {address?.street}
            </p>
            {address?.landmark && (
              <p className="text-xs text-gray-500">Near {address.landmark}</p>
            )}
            <p className="text-xs text-gray-500">
              {address?.city}, {address?.region}
            </p>
          </div>
          <div className="meta-box bg-gray-50 rounded-xl p-4
                          border-l-4 border-green-400">
            <label className="text-xs text-gray-400 uppercase tracking-widest
                               font-bold block mb-1">
              Payment
            </label>
            <p className="font-bold text-[#1D3557] text-sm">
              {order.paymentMethod === "mobile_money" ? "📱 Mobile Money"
                : order.paymentMethod === "card" ? "💳 Card"
                : "💵 Cash on Delivery"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              Status: {order.status}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="px-10 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase
                         tracking-widest mb-3">
            Order Items
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1D3557] text-white">
                <th className="text-left px-4 py-3 text-xs font-bold
                               uppercase tracking-wide rounded-tl-lg">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold
                               uppercase tracking-wide">
                  Product
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold
                               uppercase tracking-wide">
                  Qty
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold
                               uppercase tracking-wide">
                  Unit Price
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold
                               uppercase tracking-wide rounded-tr-lg">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map(function(item, i) {
                return (
                  <tr
                    key={item._id || i}
                    className={"border-b border-gray-100 " +
                      (i % 2 === 0 ? "bg-white" : "bg-gray-50")}
                  >
                    <td className="px-4 py-3 text-sm text-gray-400
                                   font-bold">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-sm">
                        {item.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm
                                   text-gray-600 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatGHS(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold
                                   text-[#1D3557]">
                      {formatGHS(item.price * item.quantity)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-10 pb-6">
          <div className="w-64">
            <div className="flex justify-between text-sm text-gray-500
                            py-2 border-b border-gray-100">
              <span>Subtotal</span>
              <span>{formatGHS(order.itemsPrice || 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600
                              py-2 border-b border-gray-100">
                <span>Discount</span>
                <span>- {formatGHS(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500
                            py-2 border-b border-gray-100">
              <span>Delivery Fee</span>
              <span>
                {order.deliveryFee === 0
                  ? "FREE"
                  : formatGHS(order.deliveryFee || 0)}
              </span>
            </div>
            <div className="flex justify-between font-black text-[#1D3557]
                            text-lg pt-3 border-t-2 border-[#1D3557] mt-1">
              <span>Total</span>
              <span className="text-[#FF4500]">
                {formatGHS(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.shippingAddress?.notes && (
          <div className="px-10 pb-6">
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-bold text-yellow-700 mb-1">
                📝 Delivery Note
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.notes}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-100 px-10 py-6 flex
                        items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 leading-relaxed">
              This is an official receipt from Shopalotghana.com
              <br />
              For support: support@shopalotghana.com
              <br />
              Return policy: 7 days from delivery date
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-[#1D3557]">
              <span className="text-[#FF4500]">Shopalo</span>tghana
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Designed by Core.Tech Technology
            </p>
          </div>
        </div>

        {/* Thank you bar */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e]
                        text-white text-center py-4 px-10">
          <p className="text-sm font-semibold">
            Thank you for shopping with Shopalotghana! 🇬🇭
          </p>
          <p className="text-xs text-white/60 mt-1">
            shopalotghana.com — Quality Living, Locally Delivered
          </p>
        </div>

      </div>
    </div>
  )
}