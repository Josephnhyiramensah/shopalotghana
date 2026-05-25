import { Link } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"

export default function ReturnPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-2 text-[#E63946] font-semibold mb-8
                               hover:gap-3 transition-all text-sm">
        <FiArrowLeft size={16} /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">↩️</div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1D3557]">Return Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: February 10, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-orange-700 font-bold text-lg">
              At Shopalotghana, we want you to be 100% satisfied with your purchase.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              1. Return Window
            </h2>
            <p>
              Items can be returned within <strong>7 days</strong> of delivery.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              2. Eligibility for Returns
            </h2>
            <p className="mb-3">To be eligible for a return:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[#FF4500] mt-1">•</span>
                The item must be unused, in the same condition received, and in original packaging.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4500] mt-1">•</span>
                <strong>Electronics and Appliances:</strong> Seal must be intact unless there is a verified technical fault.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4500] mt-1">•</span>
                <strong>Fashion:</strong> Must have original tags and no signs of wear.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4500] mt-1">•</span>
                <strong>Plumbing:</strong> Must not have been installed or altered.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              3. Non-Returnable Items
            </h2>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-#FF4500] mt-1">•</span>
                Personalized or custom orders
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4500] mt-1">•</span>
                Items damaged through customer misuse or improper installation
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              4. Refunds
            </h2>
            <p>
              Once we receive and inspect your return, we will notify you of approval
              or rejection. Approved refunds are processed via your original payment
              method (e.g. MoMo refund) within <strong>3 to 5 business days</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1D3557] mb-3">
              5. Delivery Fees
            </h2>
            <p>
              Shipping costs are non-refundable unless the return is due to an error
              on our part such as a wrong or defective item.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-blue-700 text-sm">
              To initiate a return, contact us at{" "}
              <strong>support@shopalotghana.com</strong> or WhatsApp us with your
              order ID and reason for return.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}