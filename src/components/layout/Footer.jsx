import { Link } from "react-router-dom"
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi"
import {
  FaFacebook, FaLinkedin, FaTwitter,
  FaInstagram, FaTiktok, FaYoutube
} from "react-icons/fa"
import { useSettings } from "../../hooks/useSettings"
import logo from "../../assets/logo.png"
const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "My Orders", to: "/orders" },
  { label: "Wishlist", to: "/wishlist" },
]

const policyLinks = [
  { label: "Return Policy", to: "/return-policy" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
]

export default function Footer() {
  const { settings } = useSettings()
  const year = new Date().getFullYear()

  const phone = settings?.phone || "+233 XX XXX XXXX"
  const email = settings?.email || "support@shopalotghana.com"
  const address = settings?.address || "Accra, Ghana"
  const facebook = settings?.facebook || ""
  const instagram = settings?.instagram || ""
  const tiktok = settings?.tiktok || ""
  const youtube = settings?.youtube || ""
  const twitter = settings?.twitter || ""
  const linkedin = settings?.linkedin || ""
  const threshold = settings?.freeDeliveryThreshold

  return (
    <footer className="bg-[#1D3557] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1
                      md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <img src={logo} alt="Shopalotghana" className="h-8 w-auto" />
          
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Quality Living, Locally Delivered. Your trusted e-commerce
            destination across all 16 regions of Ghana.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/10 text-xs px-3 py-1 rounded-full
                             text-gray-200 border border-white/10">
              MoMo
            </span>
            <span className="bg-white/10 text-xs px-3 py-1 rounded-full
                             text-gray-200 border border-white/10">
              Card
            </span>
            <span className="bg-white/10 text-xs px-3 py-1 rounded-full
                             text-gray-200 border border-white/10">
              Cash on Delivery
            </span>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-2">
            {facebook ? (
              <a href={facebook} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaFacebook size={15} />
              </a>
            ) : null}
            {instagram ? (
              <a href={instagram} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaInstagram size={15} />
              </a>
            ) : null}
            {tiktok ? (
              <a href={tiktok} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaTiktok size={15} />
              </a>
            ) : null}
            {youtube ? (
              <a href={youtube} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaYoutube size={15} />
              </a>
            ) : null}
            {twitter ? (
              <a href={twitter} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaTwitter size={15} />
              </a>
            ) : null}
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center
                           justify-center hover:bg-[#FF4500] transition">
                <FaLinkedin size={15} />
              </a>
            ) : null}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-[#F4A261]">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {quickLinks.map(function(link) {
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-[#FF4500] transition flex items-center gap-2"
                  >
                    <span className="text-[#FF4500]">→</span>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-[#F4A261]">Policies</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {policyLinks.map(function(link) {
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-[#FF4500] transition flex items-center gap-2"
                  >
                    <span className="text-[#FF4500]">→</span>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-6 bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-[#F4A261] font-semibold mb-1">
              🚚 Delivery Info
            </p>
            <p className="text-xs text-gray-300">
              Fast delivery across Accra, Tema and Kumasi.
              Free on orders above GHS {threshold}.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-[#F4A261]">Contact Us</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <FiMapPin className="mt-0.5 text-[#FF4500] flex-shrink-0" />
              <span>{address}</span>
            </li>
            <li>
              <a
                href={"tel:" + phone}
                className="flex items-center gap-3 hover:text-[#FF4500] transition"
              >
                <FiPhone className="text-[#FF4500] flex-shrink-0" />
                <span>{phone}</span>
              </a>
            </li>
            <li>
              <a
                href={"mailto:" + email}
                className="flex items-center gap-3 hover:text-[#FF4500] transition"
              >
                <FiMail className="text-[#FF4500] flex-shrink-0" />
                <span>{email}</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Developer credit */}
      <div className="border-t border-white/10 bg-black/20 py-3 text-center">
        <p className="text-xs text-gray-400">
          Powered By{" "}
          <span className="text-[#F4A261] font-semibold"> JNK Mensah</span>
          {" "}@{" "}
          <span className="text-[#FF4500] font-bold tracking-wide">
            NexisOra.Tech Lab. 
          </span>
        </p>
      </div>

      {/* Copyright */}
      <div className="py-3 text-center text-xs text-gray-500 bg-black/30">
        <span>© {year} Shopalotghana.com — All rights reserved.</span>
      </div>

    </footer>
  )
}