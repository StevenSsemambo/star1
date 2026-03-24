import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FluxCharacter from '../components/FluxCharacter'
import { getProfile, getStats, getRandomFluxResponse, updateStreak } from '../utils/storage'

const FEATURES = [
  { to: '/breathe', icon: '🌊', title: 'Breathe & Flow', sub: 'Calm your voice', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
  { to: '/speaklab', icon: '🗣️', title: 'SpeakLab', sub: 'Daily exercises', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { to: '/adventure', icon: '🗺️', title: 'Adventure', sub: '6 skill zones', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { to: '/brave', icon: '⭐', title: 'BraveMissions', sub: 'Face your fears', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { to: '/talktales', icon: '📖', title: 'TalkTales', sub: 'Tell stories', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { to: '/journal', icon: '🎙️', title: 'Voice Journal', sub: 'Record your day', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
  { to: '/songs', icon: '🎵', title: 'Song Mode', sub: 'Sing & speak', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { to: '/daf', icon: '🎧', title: 'DAF Mode', sub: 'Voice feedback', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { to: '/family', icon: '👨‍👩‍👧', title: 'Family Mode', sub: 'Read together', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { to: '/progress', icon: '🌌', title: 'My Universe', sub: 'Your star sky', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
]

const TIME_GREET = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const [profile] = useState(getProfile())
  const [stats, setStats] = useState(null)
  const [fluxMsg, setFluxMsg] = useState('')
  const [showFlux, setShowFlux] = useState(true)

  useEffect(() => {
    updateStreak()
    setStats(getStats())
    setFluxMsg(getRandomFluxResponse('greeting'))
  }, [])

  return (
    <div className="page">
      <div className="bg-aura" />

      {/* Header */}
      <div style={{ padding: '40px 20px 16px', position: 'sticky', top: 0, background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(20px)', zIndex: 50, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              {TIME_GREET()},
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>
              {profile?.name || 'Friend'} 👋
            </div>
          </div>
          <Link to="/progress" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'var(--brave)' }}>
                🔥 {stats?.streak || 0}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>streak</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 20, paddingBottom: 40 }}>

        {/* Flux companion */}
        {showFlux && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
            <FluxCharacter size={90} mood="happy" ageGroup={profile?.ageGroup || 'explorer'} />
            <div style={{ flex: 1 }}>
              <div className="flux-speech" style={{ position: 'relative' }}>
                {fluxMsg}
                <button
                  onClick={() => setShowFlux(false)}
                  style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}
                >×</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        {stats && (
          <div className="stats-row" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--flux)' }}>{stats.totalSessions}</div>
              <div className="stat-label">Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--brave)' }}>⭐{stats.braveStars}</div>
              <div className="stat-label">Brave Stars</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.minutesPracticed}m</div>
              <div className="stat-label">Practiced</div>
            </div>
          </div>
        )}

        {/* Daily challenge CTA */}
        <Link to="/brave" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 20,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 36 }}>⭐</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>Today's BraveMission</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Face a fear, earn a star. You got this.</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, opacity: 0.6 }}>›</div>
          </div>
        </Link>

        {/* Feature grid */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 14 }}>All Features</div>
          <div className="feature-grid">
            {FEATURES.map(f => (
              <Link key={f.to} to={f.to} className="feature-card">
                <div className="feature-card-icon" style={{ background: f.bg, fontSize: 28 }}>{f.icon}</div>
                <div>
                  <div className="feature-card-title">{f.title}</div>
                  <div className="feature-card-sub">{f.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* About section */}
        <div style={{ marginTop: 24, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>🧠 Did you know?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Choral speech — reading alongside someone else — reduces stuttering by up to <strong style={{ color: 'var(--flux)' }}>97%</strong>. That's why TalkTales and Family Mode are so powerful. Practice daily to rewire your speech pathways!
          </div>
        </div>
      </div>
    </div>
  )
}
