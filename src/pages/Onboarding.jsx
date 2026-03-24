import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FluxCharacter from '../components/FluxCharacter'
import { saveProfile, setOnboarded } from '../utils/storage'

const AGE_GROUPS = [
  { id: 'little', label: 'Little Speaker', range: 'Ages 3–6', emoji: '🌟', color: '#ff9ff3' },
  { id: 'explorer', label: 'Explorer', range: 'Ages 7–12', emoji: '🚀', color: '#00d4ff' },
  { id: 'navigator', label: 'Navigator', range: 'Ages 13–17', emoji: '⚡', color: '#a78bfa' },
  { id: 'adult', label: 'Adult', range: 'Ages 18+', emoji: '🎯', color: '#94a3b8' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  const handleFinish = () => {
    if (!name.trim() || !ageGroup) return
    saveProfile({ name: name.trim(), ageGroup, joinDate: new Date().toISOString() })
    setOnboarded()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell" style={{ background: 'var(--ink)' }}>
      <div className="bg-aura" />
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="onboarding-slide fade-in">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <div style={{ position: 'relative' }}>
                <FluxCharacter size={150} mood="happy" ageGroup="explorer" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>
                  <span style={{ color: 'var(--flux)' }}>Yo</span>Speech
                </div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontWeight: 600 }}>
                  Find Your Flow
                </div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', maxWidth: 320 }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                  Hey! I'm <strong style={{ color: 'var(--flux)' }}>Flux</strong>, your speech companion. I'm here to make speaking feel less scary and way more fun. 🌊
                </p>
              </div>
            </div>
            <div style={{ width: '100%', paddingBottom: 24 }}>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(1)}>
                Let's Begin 🚀
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Name */}
        {step === 1 && (
          <div className="onboarding-slide fade-in">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <FluxCharacter size={100} mood="calm" ageGroup="explorer" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>What's your name?</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Flux wants to know who to cheer for!</div>
              </div>
              <div style={{ width: '100%', maxWidth: 320 }}>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name..."
                  autoFocus
                  maxLength={30}
                  style={{
                    width: '100%',
                    background: 'var(--card)',
                    border: '2px solid var(--border)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    fontSize: 18,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--flux)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', gap: 12, paddingBottom: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>Back</button>
              <button className="btn btn-primary" onClick={() => name.trim() && setStep(2)} style={{ flex: 2 }} disabled={!name.trim()}>
                That's me! →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Age Group */}
        {step === 2 && (
          <div className="onboarding-slide fade-in" style={{ justifyContent: 'flex-start', paddingTop: 48 }}>
            <div style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>
                  Hey {name}! 👋
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                  Which experience fits you best?
                </div>
              </div>
              <div className="age-grid">
                {AGE_GROUPS.map(ag => (
                  <div
                    key={ag.id}
                    className={`age-card ${ageGroup === ag.id ? 'selected' : ''}`}
                    onClick={() => setAgeGroup(ag.id)}
                    style={ageGroup === ag.id ? { borderColor: ag.color, background: `${ag.color}18` } : {}}
                  >
                    <div className="age-emoji">{ag.emoji}</div>
                    <FluxCharacter size={60} animated={false} ageGroup={ag.id} mood="happy" />
                    <div className="age-label">{ag.label}</div>
                    <div className="age-range">{ag.range}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', gap: 12, paddingTop: 24, paddingBottom: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
              <button className="btn btn-primary" onClick={() => ageGroup && setStep(3)} style={{ flex: 2 }} disabled={!ageGroup}>
                This is me! →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && (
          <div className="onboarding-slide fade-in">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <FluxCharacter size={150} mood="brave" ageGroup={ageGroup} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900 }}>
                  You're all set, <span style={{ color: 'var(--flux)' }}>{name}</span>!
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 10, lineHeight: 1.7 }}>
                  Your voice is yours. Your stutter doesn't define you. Every day you practice is a star in your sky. 🌟
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {['🌊 Breathing Games', '⭐ BraveMissions', '📖 TalkTales', '🎵 Song Mode', '🎙️ Voice Journal'].map(f => (
                  <span key={f} className="badge badge-flux">{f}</span>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', paddingBottom: 24 }}>
              <button className="btn btn-brave btn-full btn-lg" onClick={handleFinish}>
                Start My Journey ✨
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingBottom: 20, position: 'relative', zIndex: 1 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6,
            borderRadius: 3,
            background: i === step ? 'var(--flux)' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s var(--ease)',
          }} />
        ))}
      </div>
    </div>
  )
}
