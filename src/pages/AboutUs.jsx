import { Link } from "react-router-dom"
import {
  FiTruck, FiShield, FiRefreshCw,
  FiHeadphones, FiMapPin, FiMail, FiPhone
} from "react-icons/fi"

const values = [
  {
    icon: <FiTruck size={28} />,
    title: "Fast Local Delivery",
    desc: "Delivering across all 16 regions of Ghana with same-day options in Accra, Tema and Kumasi.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: <FiShield size={28} />,
    title: "Secure Payments",
    desc: "Pay with MoMo, Card or Cash on Delivery. All transactions are encrypted and secure.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: <FiRefreshCw size={28} />,
    title: "Easy Returns",
    desc: "Not satisfied? Return any item within 7 days for a full refund — no questions asked.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: <FiHeadphones size={28} />,
    title: "Local Support",
    desc: "Our customer support team understands the Ghanaian market and is always ready to help.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
]

const categories = [
  { icon: "🍳", name: "Kitchen Appliances", desc: "Air fryers, blenders, gas cookers and more" },
  { icon: "🔧", name: "Plumbing Materials", desc: "Premium faucets, sinks and bathroom fixtures" },
  { icon: "📺", name: "Electronics", desc: "Smart TVs, fridges and home entertainment" },
  { icon: "👗", name: "Fashion", desc: "On-trend clothing, shoes and accessories" },
]

export default function AboutUs() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1
                           rounded-full mb-4 inline-block">
            🇬🇭 Proudly Ghanaian
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            About <span className="text-[#FF8C00]">Shopalo</span>tghana
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            Your premier local e-commerce destination — combining international
            quality with Ghanaian reliability.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-extrabold text-[#1D3557] mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            For homeowners, builders, and fashion-conscious consumers in Ghana who seek
            quality without the complexity of international shipping, Shopalotghana is
            the premier local e-commerce destination. We combine a curated selection of
            essential kitchen, plumbing, electronic goods and fashion with deep local
            expertise — ensuring faster delivery, localized customer support, and
            payment options that feel like home.
          </p>
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[#FF4500] font-bold text-lg italic">
              "Quality Living, Locally Delivered."
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">Why Shop With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {values.map(function(item) {
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                           hover:shadow-md transition"
              >
                <div className={"w-14 h-14 rounded-2xl flex items-center justify-center mb-4 " +
                  item.bg + " " + item.color}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Categories */}
        <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">What We Offer</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {categories.map(function(cat) {
            return (
              <Link
                key={cat.name}
                to={"/shop?category=" + encodeURIComponent(cat.name)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                           hover:border-[#FF8C00] hover:shadow-md transition text-center group"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-sm text-gray-800 group-hover:text-[#FF7F50]
                               transition mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500">{cat.desc}</p>
              </Link>
            )
          })}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-extrabold text-[#1D3557] mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 mb-16">
          {[
            {
              q: "Where is Shopalotghana based?",
              a: "Shopalotghana is proudly based in Ghana, serving customers across all 16 regions with specialized logistics for quick delivery in Accra, Tema and Kumasi.",
            },
            {
              q: "What products does Shopalotghana sell?",
              a: "We specialize in four categories: Kitchen Appliances, Plumbing Materials, Electronics, and Fashion.",
            },
            {
              q: "Is Shopalotghana reliable?",
              a: "Yes. We prioritize the Ghanaian customer — fast local delivery, secure MoMo payments, and a support team that understands your needs.",
            },
            {
              q: "Does Shopalotghana offer Cash on Delivery?",
              a: "Yes! We offer Cash on Delivery alongside Mobile Money and Card payments. Check checkout for availability in your area.",
            },
          ].map(function(faq) {
            return (
              <div key={faq.q}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            )
          })}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#2d5a8e] rounded-2xl
                        p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-2">Get In Touch</h2>
          <p className="text-white/70 mb-6">We are always happy to hear from you</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-[#FF4500]" /> Accra, Ghana
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-[#FF4500]" /> +233 54 540 8644
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-[#FF4500]" /> support@shopalotghana.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}