import { useEffect, useState, useMemo } from "react"

// Pre-generate all random values OUTSIDE render
function makeStars(count) {
  return Array.from({ length: count }, function(_, i) {
    return {
      size:    Math.random() * 14 + 6,
      left:    Math.random() * 100,
      dur:     Math.random() * 2 + 1.5,
      del:     Math.random() * 2,
      char:    i % 3 === 0 ? "✦" : i % 3 === 1 ? "★" : "✶",
    }
  })
}

function makeBgStars(count) {
  return Array.from({ length: count }, function(_, i) {
    return {
      size:    Math.random() * 16 + 6,
      left:    Math.random() * 100,
      dur:     Math.random() * 3 + 2,
      del:     Math.random() * 3,
      char:    i % 4 === 0 ? "✦" : i % 4 === 1 ? "★" : i % 4 === 2 ? "✶" : "·",
      opacity: Math.random() * 0.4 + 0.1,
      colorIdx: i % 3,
    }
  })
}

function makeOrbitStars(count) {
  return Array.from({ length: count }, function(_, i) {
    const angle  = (i / count) * 360
    const radius = 80 + Math.random() * 40
    return {
      x:    Math.cos((angle * Math.PI) / 180) * radius,
      y:    Math.sin((angle * Math.PI) / 180) * radius,
      size: Math.random() * 12 + 6,
      del:  (i / count) * 1.8,
      char: i % 2 === 0 ? "✦" : "★",
    }
  })
}

export default function PageLoader() {
  const [leaving, setLeaving] = useState(false)

  // Generate once — never recalculated on re-render
  const leftStars   = useMemo(function() { return makeStars(18) },    [])
  const rightStars  = useMemo(function() { return makeStars(18) },    [])
  const bgStars     = useMemo(function() { return makeBgStars(30) },  [])
  const orbitStars  = useMemo(function() { return makeOrbitStars(12) }, [])

  useEffect(function() {
    const timer = setTimeout(function() { setLeaving(true) }, 4500)
    return function() { clearTimeout(timer) }
  }, [])

  return (
    <div
      className={"fixed inset-0 z-[9999] flex items-center justify-center " +
        "overflow-hidden transition-all duration-700 " +
        (leaving ? "opacity-0 pointer-events-none" : "opacity-100")}
    >
      <style>{`
        @keyframes curtainLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes curtainRight {
          0%   { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes starFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes progressBar {
          0%   { width: 0%; }
          60%  { width: 80%; }
          100% { width: 100%; }
        }
        .curtain-left {
          animation: curtainLeft 0.7s cubic-bezier(.77,0,.18,1) 1.8s both;
        }
        .curtain-right {
          animation: curtainRight 0.7s cubic-bezier(.77,0,.18,1) 1.8s both;
        }
        .logo-pulse {
          animation: logoPulse 1.8s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #F4A261 0%, #ffffff 30%, #FF4500 50%, #ffffff 70%, #F4A261 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 2s linear infinite;
        }
        .progress-bar {
          animation: progressBar 2s ease-out forwards;
        }
        .star-particle {
          position: absolute;
          top: -10px;
          animation: starFall linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Left curtain */}
      <div className="curtain-left absolute left-0 top-0 w-1/2 h-full z-10
                      bg-[#1D3557] overflow-hidden">
        {leftStars.map(function(s, i) {
          return (
            <span
              key={i}
              className="star-particle text-white/30"
              style={{
                left: s.left + "%",
                fontSize: s.size + "px",
                animationDuration: s.dur + "s",
                animationDelay: s.del + "s",
              }}
            >
              {s.char}
            </span>
          )
        })}
      </div>

      {/* Right curtain */}
      <div className="curtain-right absolute right-0 top-0 w-1/2 h-full z-10
                      bg-[#1D3557] overflow-hidden">
        {rightStars.map(function(s, i) {
          return (
            <span
              key={i}
              className="star-particle text-white/30"
              style={{
                left: s.left + "%",
                fontSize: s.size + "px",
                animationDuration: s.dur + "s",
                animationDelay: s.del + "s",
              }}
            >
              {s.char}
            </span>
          )
        })}
      </div>

      {/* Center content */}
      <div className="relative z-0 flex flex-col items-center gap-6 select-none">

        {/* Logo */}
        <div className="logo-pulse w-24 h-24 rounded-full bg-white shadow-2xl
                        flex items-center justify-center">
          <img
            src="/src/assets/logo.png"
            alt="Shopalotghana"
            className="w-16 h-16 object-contain"
            onError={function(e) {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "flex"
            }}
          />
          <div className="hidden w-16 h-16 items-center justify-center"
               style={{ display: "none" }}>
            <span className="text-3xl">🛒</span>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="shimmer-text text-4xl font-extrabold tracking-tight">
            Shopalotghana
          </h1>
          <p className="text-white/60 text-sm mt-1 tracking-widest uppercase">
            Quality Living, Locally Delivered
          </p>
        </div>

        {/* Orbit stars */}
        <div className="absolute inset-0 pointer-events-none">
          {orbitStars.map(function(s, i) {
            return (
              <span
                key={i}
                className="absolute text-[#F4A261]"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(calc(-50% + " + s.x + "px), " +
                              "calc(-50% + " + s.y + "px))",
                  fontSize: s.size + "px",
                  animation: "twinkle 1.4s ease-in-out " + s.del + "s infinite",
                }}
              >
                {s.char}
              </span>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-2">
          <div className="progress-bar h-full bg-[#FF4500] rounded-full" />
        </div>

        <p className="text-white/50 text-xs tracking-widest uppercase animate-pulse">
          Loading...
        </p>
      </div>

      {/* Background */}
      <div className="absolute inset-0 bg-[#1D3557] -z-10" />

      {/* Background falling stars */}
      {bgStars.map(function(s, i) {
        const color = s.colorIdx === 0
          ? "rgba(244,162,97," + s.opacity + ")"
          : s.colorIdx === 1
          ? "rgba(255,255,255," + s.opacity + ")"
          : "rgba(255,69,0," + s.opacity + ")"
        return (
          <span
            key={"bg-" + i}
            className="absolute -z-10 pointer-events-none"
            style={{
              left: s.left + "%",
              top: "-20px",
              fontSize: s.size + "px",
              color: color,
              animation: "starFall " + s.dur + "s linear " + s.del + "s infinite",
            }}
          >
            {s.char}
          </span>
        )
      })}
    </div>
  )
}