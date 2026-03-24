import React, { useEffect, useRef, useState } from 'react'
import { getStats, getProfile, getSessions, getFearLadder, getJournal } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

export default function Progress() {
  const canvasRef = useRef(null)
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    setStats(getStats())
    setProfile(getProfile())
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !stats) return
    drawUniverse()
  }, [stats])

  const drawUniverse = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Background gradient
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, H)
    bg.addColorStop(0, '#0d1b3e')
    bg.addColorStop(1, '#0a0e1a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const count = stats.totalSessions
    const seed = 42

    // Draw earned stars
    const starColors = ['#00d4ff', '#f59e0b', '#a78bfa', '#10b981', '#ff6b6b', '#ffffff']

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 3.7 // spiral
      const radius = 20 + (i / Math.max(count, 1)) * (Math.min(W, H) / 2 - 30)
      const x = W/2 + Math.cos(angle) * radius
      const y = H/2 + Math.sin(angle) * radius
      const size = 1.5 + (i % 3)
      const col = starColors[i % starColors.length]

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.shadowColor = col
      ctx.shadowBlur = 6
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Background noise stars
    for (let i = 0; i < 80; i++) {
      const x = (((seed * (i + 1) * 7919) % W + W) % W)
      const y = (((seed * (i + 1) * 6271) % H + H) % H)
      ctx.beginPath()
      ctx.arc(x, y, 0.5 + (i % 2) * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 5) * 0.05})`
      ctx.fill()
    }

    // Constellations for milestones
    if (count >= 5) {
      ctx.strokeStyle = 'rgba(0,212,255,0.15)'
      ctx.lineWidth = 0.8
      ctx.setLineDash([3, 6])
      ctx.beginPath()
      ctx.moveTo(W * 0.3, H * 0.25)
      ctx.lineTo(W * 0.5, H * 0.2)
      ctx.lineTo(W * 0.65, H * 0.3)
      ctx.lineTo(W * 0.55, H * 0.45)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Center glow
    const centerGlow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 40)
    centerGlow.addColorStop(0, 'rgba(0,212,255,0.3)')
    centerGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = centerGlow
    ctx.beginPath()
    ctx.arc(W/2, H/2, 40, 0, Math.PI * 2)
    ctx.fill()
  }

  const MILESTONES = [
    { sessions: 5, label: 'First Constellation', icon: '⭐', achieved: (stats?.totalSessions || 0) >= 5 },
    { sessions: 10, label: 'Brave Explorer', icon: '🚀', achieved: (stats?.totalSessions || 0) >= 10 },
    { sessions: 20, label: 'Flow Rider', icon: '🌊', achieved: (stats?.totalSessions || 0) >= 20 },
    { sessions: 50, label: 'Star Navigator', icon: '✨', achieved: (stats?.totalSessions || 0) >= 50 },
    { sessions: 100, label: 'Voice Champion', icon: '🏆', achieved: (stats?.totalSessions || 0) >= 100 },
  ]

  const sessions = getSessions()
  const journal = getJournal()
  const fearLadder = getFearLadder()
  const completedFear = fearLadder.filter(f => f.completed).length

  const byType = sessions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🌌 My Universe</div>
        <div className="page-subtitle">Every session is a star in your sky</div>
      </div>

      <div className="page-content">

        {/* Star field */}
        <div style={{ background: 'linear-gradient(180deg, #0d1b3e 0%, #0a0e1a 100%)', borderRadius: 24, overflow: 'hidden', marginBottom: 20, position: 'relative', border: '1px solid rgba(0,212,255,0.15)' }}>
          <canvas ref={canvasRef} width={440} height={240} style={{ width: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {stats?.totalSessions || 0} stars in your sky
            </div>
          </div>
          {/* Flux in center */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.9 }}>
            <FluxCharacter size={60} mood="happy" ageGroup={profile?.ageGroup || 'explorer'} animated />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Sessions', value: stats?.totalSessions || 0, icon: '🌟', color: 'var(--flux)' },
            { label: 'Day Streak', value: `🔥 ${stats?.streak || 0}`, icon: '', color: 'var(--brave)' },
            { label: 'Brave Stars', value: `⭐ ${stats?.braveStars || 0}`, icon: '', color: 'var(--brave)' },
            { label: 'Fears Faced', value: `${completedFear}/15`, icon: '💪', color: 'var(--success)' },
            { label: 'Journal Entries', value: journal.length, icon: '🎙️', color: '#ff6b6b' },
            { label: 'Minutes Practiced', value: `${stats?.minutesPracticed || 0}m`, icon: '⏱️', color: 'var(--pulse)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ color: s.color, fontSize: 26 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Milestones</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {MILESTONES.map(m => (
            <div key={m.sessions} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: m.achieved ? 'rgba(0,212,255,0.06)' : 'var(--card)',
              border: `1px solid ${m.achieved ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`,
              borderRadius: 16, padding: '14px 16px',
              opacity: m.achieved ? 1 : 0.5,
            }}>
              <div style={{ fontSize: 28 }}>{m.achieved ? m.icon : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{m.sessions} sessions required</div>
              </div>
              {m.achieved && <span className="badge badge-flux">Unlocked</span>}
            </div>
          ))}
        </div>

        {/* Activity by type */}
        {Object.keys(byType).length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Activity Breakdown</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 20 }}>
              {Object.entries(byType).map(([type, count]) => {
                const labels = { breathing: '🌊 Breathing', speaklab: '🗣️ SpeakLab', brave: '⭐ BraveMissions', talktales: '📖 TalkTales', journal: '🎙️ Voice Journal', song: '🎵 Song Mode', daf: '🎧 DAF Mode', adventure: '🗺️ Adventure', family: '💝 Family Mode' }
                const pct = Math.round((count / sessions.length) * 100)
                return (
                  <div key={type} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span>{labels[type] || type}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{count} sessions</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {stats?.totalSessions === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌌</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              Your sky is empty for now.<br />
              Complete your first session to add a star!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
