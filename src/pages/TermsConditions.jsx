import { Link } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"

export default function TermsConditions() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-2 text-[#E63946] font-semibold mb-8
                               hover:gap-3 transition-all text-sm">
        <FiArrowLeft size={16} /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">📋</div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1D3557]">
              Terms and Conditions
            </h1>
            <p className="text-gray-500 text-sm">Effective Date: February 10, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to Shopalotghana.com. These Terms and Conditions govern your
              use of our website and the purchase of goods. By using this site,
              you agree to these terms in full.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              2. Use of Site
            </h2>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] mt-1">•</span>
                You must be at least 18 years old or under the supervision of a
                parent or guardian to use this site.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] mt-1">•</span>
                You are responsible for maintaining the confidentiality of your
                account and password.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              3. Orders and Pricing
            </h2>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] mt-1">•</span>
                All prices are listed in Ghana Cedis (GHS).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] mt-1">•</span>
                We reserve the right to refuse or cancel any order for reasons
                including stock availability, pricing errors, or suspected fraud.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              4. Payments
            </h2>
            <p>
              We accept payments via <strong>Mobile Money</strong> (MTN, Telecel, AT),
              <strong> Debit/Credit Cards</strong>, and <strong>Cash on Delivery</strong>.
              Payments must be cleared before delivery is dispatched for online orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              5. Intellectual Property
            </h2>
            <p>
              All content on Shopalotghana.com including logos, text, and images is
              the property of Shopalotghana and is protected by copyright laws.
              Unauthorized use is strictly prohibited.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">
              By using Shopalotghana.com, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}