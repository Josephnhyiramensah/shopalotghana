import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useCart } from "../hooks/useCart"
import { useWishlist } from "../hooks/useWishlist"
import { formatGHS } from "../utils/formatCurrency"
import {
  FiShoppingCart, FiHeart, FiStar, FiArrowRight,
  FiTruck, FiShield, FiRefreshCw, FiHeadphones
} from "react-icons/fi"

/* ─── Animations ─────────────────────────────────────────── */
const animStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  .anim-fade-up   { animation: fadeUp   0.7s ease both; }
  .anim-fade-in   { animation: fadeIn   0.6s ease both; }
  .anim-slide-l   { animation: slideLeft  0.7s ease both; }
  .anim-slide-r   { animation: slideRight 0.7s ease both; }
  .anim-scale-in  { animation: scaleIn  0.6s ease both; }
  .anim-float     { animation: float 4s ease-in-out infinite; }

  .delay-100 { animation-delay: 0.10s; }
  .delay-200 { animation-delay: 0.20s; }
  .delay-300 { animation-delay: 0.30s; }
  .delay-400 { animation-delay: 0.40s; }
  .delay-500 { animation-delay: 0.50s; }
  .delay-600 { animation-delay: 0.60s; }
  .delay-700 { animation-delay: 0.70s; }
  .delay-800 { animation-delay: 0.80s; }

  .hero-overlay {
    background: linear-gradient(
      to right,
      rgba(0,0,0,0.72) 0%,
      rgba(0,0,0,0.40) 55%,
      rgba(0,0,0,0.10) 100%
    );
  }

  .category-card:hover .category-img {
    transform: scale(1.10);
  }
  .category-img {
    transition: transform 0.6s cubic-bezier(.25,.46,.45,.94);
  }

  .product-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  .product-card {
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px) scale(1.02);
  }
  .feature-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .btn-primary {
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-primary::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.15);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }

  .section-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .section-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
`

/* ─── Data ───────────────────────────────────────────────── */
const banners = [
  {
    title: "Premium Kitchen Appliances",
    subtitle: "Air fryers, blenders, cookers & more — built for Ghanaian homes",
    cta: "Shop Kitchen",
    link: "/shop?category=Kitchen Appliances",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80",
    accent: "#FF4500",
  },
  {
    title: "Electrical Appliances",
    subtitle: "Power your home with world-class electronics and smart devices",
    cta: "Shop Electronics",
    link: "/shop?category=Electronics",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1400&q=80",
    accent: "#1D3557",
  },
  {
    title: "Official & Formal Wear",
    subtitle: "Dress to impress — executive suits, blazers and office attire",
    cta: "Shop Formal",
    link: "/shop?category=Fashion",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80",
    accent: "#2d5a8e",
  },
  {
    title: "Casual & Streetwear",
    subtitle: "Everyday comfort with premium Ghanaian and African-inspired styles",
    cta: "Shop Casual",
    link: "/shop?category=Fashion",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80",
    accent: "#F4A261",
  },
  {
    title: "Plumbing Materials",
    subtitle: "Quality pipes, fittings, faucets and fixtures for every project",
    cta: "Shop Plumbing",
    link: "/shop?category=Plumbing Materials",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1400&q=80",
    accent: "#457B9D",
  },
]

const categories = [
  {
    name: "Kitchen Appliances",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    desc: "Air fryers, blenders, cookers",
    color: "from-orange-600/80",
  },
  {
    name: "Electrical Appliances",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80",
    desc: "TVs, fridges, sound systems",
    color: "from-blue-800/80",
  },
  {
    name: "Official Wear",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
    desc: "Suits, blazers, office attire",
    color: "from-slate-800/80",
  },
  {
    name: "Casual Wear",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    desc: "T-shirts, jeans, streetwear",
    color: "from-rose-700/80",
  },
  {
    name: "Plumbing Materials",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80",
    desc: "Pipes, fittings, faucets",
    color: "from-teal-800/80",
  },
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80",
    desc: "Phones, laptops, gadgets",
    color: "from-purple-800/80",
  },
]
const features = [
  {
    icon: <FiTruck size={26} />,
    title: "Fast Delivery",
    desc: "Across all 16 regions of Ghana",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: <FiShield size={26} />,
    title: "Secure Payments",
    desc: "MoMo, Card & Cash on Delivery",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: <FiRefreshCw size={26} />,
    title: "Easy Returns",
    desc: "7-day hassle-free return policy",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: <FiHeadphones size={26} />,
    title: "24/7 Support",
    desc: "Always here to help you",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
]

/* ─── Helpers ────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null)
  useEffect(function() {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            el.classList.add("visible")
            obs.unobserve(el)
          }
        })
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return function() { obs.disconnect() }
  }, [])
  return ref
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <FiStar
            key={star}
            size={13}
            className={star <= Math.round(rating) ? "" : "text-gray-300"}
            style={star <= Math.round(rating)
              ? { color: "#FF6F00", fill: "#FF6F00" } : {}}
          />
        )
      })}
    </div>
  )
}

function ProductCard({ product, delay = 0 }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const inWishlist = isInWishlist(product._id)
  const image = product.images && product.images.length > 0
    ? product.images[0].url
    : "https://placehold.co/300x300?text=No+Image"
  const hasDiscount = product.discountPrice && product.discountPrice > 0

  return (
    <div
      className="product-card bg-white rounded-2xl overflow-hidden border
                 border-gray-100 anim-fade-up"
      style={{ animationDelay: delay + "ms" }}
    >
      <div className="relative overflow-hidden">
        <Link to={"/product/" + product._id}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-52 object-cover transition-transform duration-500
                       hover:scale-105"
          />
        </Link>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#FF4500] text-white
                           text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
            SALE
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-gray-800 text-white
                           text-xs px-2.5 py-1 rounded-lg">
            Out of Stock
          </span>
        )}
        <button
          onClick={function() {
            inWishlist ? removeFromWishlist(product._id) : addToWishlist(product)
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2
                     shadow-md hover:scale-110 transition-transform duration-200"
        >
          <FiHeart
            size={16}
            className={inWishlist ? "text-[#FF4500] fill-[#FF4500]" : "text-gray-400"}
          />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-[#FF4500] font-semibold mb-1 uppercase tracking-wide">
          {product.category}
        </p>
        <Link to={"/product/" + product._id}>
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2
                         hover:text-[#FF4500] transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.ratings || 0} />
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#1D3557]">
              {formatGHS(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through ml-2">
                {formatGHS(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={function() { addToCart(product) }}
            disabled={product.stock === 0}
            className="btn-primary bg-[#FF4500] hover:bg-red-700
                       disabled:bg-gray-300 text-white p-2 rounded-xl"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="w-full h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
                      bg-[length:400px_100%] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded-full w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-1/3 animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [bannerLoaded, setBannerLoaded] = useState(false)

  const featuredRef = useReveal()
  const newRef = useReveal()
  const catRef = useReveal()
  const featuresRef = useReveal()
  const promoRef = useReveal()

  useEffect(function() {
    async function fetchProducts() {
      try {
        const [featuredRes, newRes] = await Promise.all([
          axios.get("/products/featured"),
          axios.get("/products?limit=8&sort=newest"),
        ])
        setFeaturedProducts(featuredRes.data.products || [])
        setNewArrivals(newRes.data.products || [])
      } catch {
        setFeaturedProducts([])
        setNewArrivals([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    setBannerLoaded(true)

    const interval = setInterval(function() {
      setBannerLoaded(false)
      setTimeout(function() {
        setCurrentBanner(function(prev) { return (prev + 1) % banners.length })
        setBannerLoaded(true)
      }, 300)
    }, 5000)

    return function() { clearInterval(interval) }
  }, [])

  const banner = banners[currentBanner]

  return (
    <div className="min-h-screen">
      <style>{animStyles}</style>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden">

        {/* Background image */}
        <img
          src={banner.image}
          alt={banner.title}
          className={"absolute inset-0 w-full h-full object-cover transition-all duration-700 " +
            (bannerLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105")}
        />

        {/* Gradient overlay */}
        <div className="hero-overlay absolute inset-0" />

        {/* Decorative accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700"
          style={{ backgroundColor: banner.accent }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">

            <div className={"anim-fade-in " + (bannerLoaded ? "" : "opacity-0")}>
              <span className="bg-white/15 backdrop-blur-sm text-white text-xs
                               font-bold px-4 py-1.5 rounded-full border border-white/20
                               inline-block mb-5 tracking-widest uppercase">
                🇬🇭 Proudly Ghanaian
              </span>
            </div>

            <h1 className={"text-4xl md:text-6xl font-extrabold text-white mb-4 " +
              "leading-tight drop-shadow-lg anim-slide-r delay-100 " +
              (bannerLoaded ? "" : "opacity-0")}>
              {banner.title}
            </h1>

            <p className={"text-white/85 text-lg mb-8 max-w-lg anim-fade-up delay-200 " +
              (bannerLoaded ? "" : "opacity-0")}>
              {banner.subtitle}
            </p>

            <div className={"flex gap-4 flex-wrap anim-fade-up delay-300 " +
              (bannerLoaded ? "" : "opacity-0")}>
              <Link
                to={banner.link}
                className="btn-primary bg-[#FF4500] text-white font-bold px-7 py-3.5
                           rounded-xl flex items-center gap-2 shadow-lg"
              >
                {banner.cta} <FiArrowRight />
              </Link>
              <Link
                to="/shop"
                className="btn-primary border-2 border-white/70 text-white font-bold
                           px-7 py-3.5 rounded-xl backdrop-blur-sm
                           hover:bg-white/10 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map(function(b, i) {
            return (
              <button
                key={i}
                onClick={function() {
                  setBannerLoaded(false)
                  setTimeout(function() {
                    setCurrentBanner(i)
                    setBannerLoaded(true)
                  }, 300)
                }}
                className={"h-2 rounded-full transition-all duration-400 " +
                  (i === currentBanner
                    ? "bg-white w-8"
                    : "bg-white/40 w-2.5 hover:bg-white/70")}
              />
            )
          })}
        </div>

        {/* Slide counter */}
        <div className="absolute top-6 right-6 text-white/60 text-sm font-bold z-10
                        tabular-nums">
          {String(currentBanner + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
        </div>
      </section>

      {/* ── Features bar ──────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div
          ref={featuresRef}
          className="section-reveal max-w-7xl mx-auto px-4 py-8
                     grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map(function(feature, i) {
            return (
              <div
                key={feature.title}
                className={"feature-card flex items-center gap-3 p-4 rounded-2xl " +
                  "border " + feature.border + " " + feature.bg}
              >
                <div className={"p-3 rounded-xl bg-white shadow-sm " + feature.color}>
                  {feature.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div
          ref={catRef}
          className="section-reveal"
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#FF4500] font-bold text-sm uppercase tracking-widest mb-2">
                Browse
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1D3557]">
                Shop by Category
              </h2>
              <p className="text-gray-500 mt-2">Everything you need — all in one place</p>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-[#FF4500] font-bold
                         hover:gap-3 transition-all duration-200 group"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">
                <FiArrowRight />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map(function(cat, i) {
              return (
                <Link
                  key={cat.name}
                  to={"/shop?category=" + encodeURIComponent(cat.name)}
                  className={"category-card relative rounded-2xl overflow-hidden " +
                    "shadow-md hover:shadow-2xl transition-shadow duration-500 " +
                    "anim-scale-in"}
                  style={{ animationDelay: (i * 100) + "ms" }}
                >
                  {/* Image */}
                  <div className="relative h-44 md:h-56 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="category-img w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className={"absolute inset-0 bg-gradient-to-t " +
                      cat.color + " to-transparent"} />
                  </div>

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-extrabold text-white text-base drop-shadow-lg">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5">{cat.desc}</p>
                    <span className="inline-flex items-center gap-1 text-white/90
                                     text-xs font-semibold mt-2 group-hover:gap-2
                                     transition-all">
                      Shop now <FiArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div
            ref={featuredRef}
            className="section-reveal"
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#FF4500] font-bold text-sm uppercase tracking-widest mb-2">
                  Curated
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#1D3557]">
                  Featured Products
                </h2>
                <p className="text-gray-500 mt-2">Handpicked just for you</p>
              </div>
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-2 text-[#FF4500] font-bold
                           hover:gap-3 transition-all duration-200 group"
              >
                See All
                <span className="group-hover:translate-x-1 transition-transform">
                  <FiArrowRight />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {loading
                ? [1, 2, 3, 4, 5, 6, 7, 8].map(function(i) {
                    return <ProductSkeleton key={i} />
                  })
                : featuredProducts.length > 0
                ? featuredProducts.map(function(product, i) {
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        delay={i * 80}
                      />
                    )
                  })
                : (
                  <div className="col-span-4 text-center py-20 text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center
                                    justify-center mx-auto mb-4">
                      <FiShoppingCart size={32} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold text-gray-500">
                      Products will appear here
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add products in the admin dashboard to get started
                    </p>
                  </div>
                )
              }
            </div>
          </div>
        </div>
      </section>

      {/* ── Promo Strip ───────────────────────────────────── */}
      <section className="bg-[#FF4500] py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row
                        items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">
              Limited Time
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold">
              Free delivery on orders above GH₵500
            </h3>
          </div>
          <Link
            to="/shop"
            className="btn-primary bg-white text-[#FF4500] font-extrabold px-8 py-4
                       rounded-xl flex items-center gap-2 whitespace-nowrap shadow-lg"
          >
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div
          ref={newRef}
          className="section-reveal"
        >
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#FF4500] font-bold text-sm uppercase tracking-widest mb-2">
                Just In
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1D3557]">
                New Arrivals
              </h2>
              <p className="text-gray-500 mt-2">Fresh stock just landed</p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="hidden md:flex items-center gap-2 text-[#FF4500] font-bold
                         hover:gap-3 transition-all duration-200 group"
            >
              See All
              <span className="group-hover:translate-x-1 transition-transform">
                <FiArrowRight />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? [1, 2, 3, 4].map(function(i) {
                  return <ProductSkeleton key={i} />
                })
              : newArrivals.length > 0
              ? newArrivals.map(function(product, i) {
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      delay={i * 80}
                    />
                  )
                })
              : (
                <div className="col-span-4 text-center py-20 text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center
                                  justify-center mx-auto mb-4">
                    <FiShoppingCart size={32} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-semibold text-gray-500">
                    New arrivals will appear here
                  </p>
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* ── Bottom Promo ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div
          ref={promoRef}
          className="section-reveal"
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80"
              alt="Shop Ghana"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r
                            from-[#1D3557]/95 to-[#1D3557]/70" />

            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row
                            items-center justify-between gap-8">
              <div className="text-white text-center md:text-left">
                <p className="text-[#F4A261] font-bold uppercase tracking-widest
                               text-sm mb-3">
                  Shop Smarter
                </p>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                  Ghana's Most Trusted
                  <br />Online Store
                </h3>
                <p className="text-white/75 text-lg max-w-md">
                  Quality products, fast delivery, and secure payments —
                  all across Ghana's 16 regions.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-w-fit">
                <Link
                  to="/shop"
                  className="btn-primary bg-[#FF4500] text-white font-bold px-10 py-4
                             rounded-xl flex items-center justify-center gap-2
                             shadow-xl shadow-orange-900/30"
                >
                  Start Shopping <FiArrowRight />
                </Link>
                <Link
                  to="/register"
                  className="btn-primary border-2 border-white/40 text-white font-bold
                             px-10 py-4 rounded-xl flex items-center justify-center gap-2
                             hover:bg-white/10 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}