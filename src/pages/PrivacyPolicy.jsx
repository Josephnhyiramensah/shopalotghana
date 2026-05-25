import { Link } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-2 text-[#FF6F00] font-semibold mb-8
                               hover:gap-3 transition-all text-sm">
        <FiArrowLeft size={16} /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">🔒</div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1D3557]">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: February 10, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect personal information you provide including your name,
              delivery address, phone number, and email address to process your orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              2. How We Use Your Data
            </h2>
            <ul className="space-y-2 ml-4">
              {[
                "To process and deliver your orders",
                "To send you updates regarding your purchase",
                "To improve our website and customer service",
              ].map(function(item) {
                return (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#FF6F00] mt-1">•</span>
                    {item}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              3. Data Protection (Act 843)
            </h2>
            <p>
              Shopalotghana complies with the <strong>Ghana Data Protection Act (Act 843)</strong>.
              We do not sell or rent your personal data to third parties. Your payment
              information is encrypted and processed through secure, certified payment gateways.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              4. Cookies
            </h2>
            <p>
              Our website uses cookies to enhance your browsing experience and
              remember your cart items. You can disable cookies in your browser
              settings at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal information
              at any time. Contact us at <strong>support@shopalotghana.com</strong> to
              exercise these rights.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-blue-700 text-sm">
              For any privacy concerns, email us at{" "}
              <strong>support@shopalotghana.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}