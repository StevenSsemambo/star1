import React, { useState } from 'react'
import { getProfile, getStats, saveProfile } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

const AGE_GROUPS = [
  { id: 'little', label: 'Little Speaker', range: 'Ages 3–6', emoji: '🌟' },
  { id: 'explorer', label: 'Explorer', range: 'Ages 7–12', emoji: '🚀' },
  { id: 'navigator', label: 'Navigator', range: 'Ages 13–17', emoji: '⚡' },
  { id: 'adult', label: 'Adult', range: 'Ages 18+', emoji: '🎯' },
]

export default function Profile() {
  const [profile, setProfile] = useState(getProfile())
  const [stats] = useState(getStats())
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [ageGroup, setAgeGroup] = useState(profile?.ageGroup || 'explorer')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updated = { ...profile, name: name.trim(), ageGroup }
    saveProfile(updated)
    setProfile(updated)
    setEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const joinDate = profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">👤 Profile</div>
        <div className="page-subtitle">Your YoSpeech journey</div>
      </div>

      <div className="page-content">

        {/* Profile card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 24, padding: 24, textAlign: 'center', marginBottom: 24 }}>
          <FluxCharacter size={100} mood="brave" ageGroup={profile?.ageGroup || 'explorer'} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, marginTop: 12 }}>
            {profile?.name || 'Friend'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            {AGE_GROUPS.find(a => a.id === profile?.ageGroup)?.label || 'Explorer'} · Joined {joinDate}
          </div>
          {!editMode && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setEditMode(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Edit form */}
        {editMode && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Edit Profile</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>NAME</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 16, color: 'white', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 700 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 10 }}>AGE GROUP</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {AGE_GROUPS.map(ag => (
                  <div key={ag.id} onClick={() => setAgeGroup(ag.id)} style={{ background: ageGroup === ag.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${ageGroup === ag.id ? 'var(--flux)' : 'var(--border)'}`, borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 20 }}>{ag.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{ag.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{ag.range}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditMode(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        )}

        {saved && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', textAlign: 'center', color: 'var(--success)', fontWeight: 700, marginBottom: 16 }}>✅ Profile saved!</div>}

        {/* Stats summary */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Your Journey Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { v: stats.totalSessions, l: 'Sessions', c: 'var(--flux)' },
            { v: `🔥${stats.streak}`, l: 'Streak', c: 'var(--brave)' },
            { v: `⭐${stats.braveStars}`, l: 'Stars', c: 'var(--brave)' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-value" style={{ color: s.c, fontSize: 22 }}>{s.v}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        {/* About section */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 12 }}>About YoSpeech</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 12 }}>
            YoSpeech is built by <strong style={{ color: 'white' }}>SayMyTech Developers</strong> with one conviction: every person who stutters deserves science-backed, emotionally intelligent support — regardless of where they live or whether they have internet.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-flux">Offline-first PWA</span>
            <span className="badge badge-brave">Science-backed</span>
            <span className="badge badge-success">Free for users</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          YoSpeech v1.0 · SayMyTech Developers 2025<br />
          "Your voice is yours. Find your flow."
        </div>
      </div>
    </div>
  )
}
