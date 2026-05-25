import { Link } from "react-router-dom"
import { FiHome, FiShoppingBag, FiArrowLeft } from "react-icons/fi"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">

        <div className="mb-8">
          <div className="text-[120px] font-extrabold text-gray-200 leading-none select-none">
            404
          </div>
          <div className="text-7xl -mt-6">🔍</div>
        </div>

        <h1 className="text-3xl font-extrabold text-[#1D3557] mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-[#1D3557]
                       hover:bg-blue-900 text-white font-semibold px-6 py-3
                       rounded-xl transition"
          >
            <FiHome size={18} /> Go Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 bg-[#fa8c04]
                       hover:bg-orange-700 text-white font-semibold px-6 py-3
                       rounded-xl transition"
          >
            <FiShoppingBag size={18} /> Shop Now
          </Link>
        </div>

        <div className="mt-12">
          <Link to="/">
            <span className="text-2xl font-extrabold">
              <span className="text-[#FF8C00]">Shopalo</span>
              <span className="text-[#1D3557]">tghana</span>
            </span>
          </Link>
          <p className="text-gray-400 text-xs mt-1">Quality Living, Locally Delivered</p>
        </div>

      </div>
    </div>
  )
}