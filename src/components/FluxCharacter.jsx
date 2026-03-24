import React, { useEffect, useState } from 'react'

// Flux morphing blob SVG component
export default function FluxCharacter({ size = 120, mood = 'happy', animated = true, ageGroup = 'explorer' }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (!animated) return
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [animated])

  const colors = {
    little: { primary: '#ff9ff3', secondary: '#f368e0', glow: 'rgba(255,159,243,0.4)' },
    explorer: { primary: '#00d4ff', secondary: '#0099cc', glow: 'rgba(0,212,255,0.4)' },
    navigator: { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167,139,250,0.4)' },
    adult: { primary: '#94a3b8', secondary: '#475569', glow: 'rgba(148,163,184,0.3)' },
  }
  const c = colors[ageGroup] || colors.explorer

  const eyeScaleY = blink ? 0.1 : 1

  // Morphing blob paths
  const blobs = {
    happy: "M50,15 C65,12 80,20 85,35 C92,50 88,68 78,78 C65,90 42,92 28,82 C14,72 10,55 15,40 C20,22 35,18 50,15 Z",
    calm: "M50,12 C68,10 82,22 84,38 C86,55 78,72 64,80 C48,90 30,86 20,74 C10,62 12,44 20,30 C28,16 38,14 50,12 Z",
    brave: "M50,10 C70,8 88,18 90,36 C93,54 85,74 70,82 C52,92 30,90 18,76 C6,62 10,42 18,26 C26,10 36,12 50,10 Z",
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {animated && (
        <>
          <div style={{
            position: 'absolute', inset: '-40%',
            borderRadius: '50%',
            border: `1.5px solid ${c.primary}33`,
            animation: 'flux-ring-pulse 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '-70%',
            borderRadius: '50%',
            border: `1px solid ${c.primary}18`,
            animation: 'flux-ring-pulse 3s ease-in-out infinite 0.5s',
          }} />
        </>
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          filter: `drop-shadow(0 0 16px ${c.glow})`,
          animation: animated ? 'flux-float 4s ease-in-out infinite' : 'none',
          position: 'relative', zIndex: 1,
        }}
      >
        <defs>
          <radialGradient id={`flux-grad-${ageGroup}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={c.primary} stopOpacity="0.9" />
            <stop offset="60%" stopColor={c.secondary} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c.secondary} stopOpacity="0.4" />
          </radialGradient>
          <filter id="flux-blur">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Body */}
        <path
          d={blobs[mood] || blobs.happy}
          fill={`url(#flux-grad-${ageGroup})`}
          stroke={c.primary}
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Shine */}
        <ellipse cx="38" cy="30" rx="8" ry="5" fill="white" opacity="0.2" transform="rotate(-20,38,30)" />

        {/* Eyes */}
        <g transform={`scale(1,${eyeScaleY}) translate(0,${50 * (1 - eyeScaleY)})`}>
          <ellipse cx="38" cy="45" rx="5" ry="6" fill={c.secondary} />
          <ellipse cx="62" cy="45" rx="5" ry="6" fill={c.secondary} />
          <circle cx="39" cy="44" r="2" fill="white" opacity="0.8" />
          <circle cx="63" cy="44" r="2" fill="white" opacity="0.8" />
          <circle cx="40" cy="45.5" r="1" fill="white" opacity="0.5" />
          <circle cx="64" cy="45.5" r="1" fill="white" opacity="0.5" />
        </g>

        {/* Smile */}
        {mood === 'happy' && <path d="M38,62 Q50,72 62,62" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />}
        {mood === 'calm' && <path d="M40,64 Q50,68 60,64" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />}
        {mood === 'brave' && <path d="M36,60 Q50,74 64,60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />}

        {/* Sparkles */}
        {mood === 'brave' && (
          <>
            <text x="75" y="25" fontSize="10" opacity="0.8">✦</text>
            <text x="12" y="30" fontSize="8" opacity="0.6">✦</text>
            <text x="80" y="70" fontSize="6" opacity="0.5">✦</text>
          </>
        )}
      </svg>
    </div>
  )
}
