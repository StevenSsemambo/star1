import React, { useState, useEffect } from 'react'
import { getFearLadder, completeFearItem, getBraveStars, addBraveStar, addSession, getRandomFluxResponse } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

const LEVEL_COLORS = {
  1: '#10b981', 2: '#10b981', 3: '#06b6d4', 4: '#06b6d4',
  5: '#3b82f6', 6: '#3b82f6', 7: '#f59e0b', 8: '#f59e0b',
  9: '#ef4444', 10: '#ef4444',
}

export default function BraveMissions() {
  const [ladder, setLadder] = useState([])
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('list') // list, mission, celebrate
  const [braveStars, setBraveStars] = useState(0)
  const [voluntaryMode, setVoluntaryMode] = useState(false)
  const [fluxMsg, setFluxMsg] = useState('Every fear you face shrinks a little. Pick a mission and show it who\'s boss.')

  useEffect(() => {
    setLadder(getFearLadder())
    setBraveStars(getBraveStars())
  }, [])

  const startMission = (item) => {
    setSelected(item)
    setStep('mission')
    setFluxMsg(`You picked level ${item.level}. That takes guts. Read the situation, breathe, and attempt it. Even trying earns you a star.`)
  }

  const completeMission = (withVoluntaryStutter = false) => {
    const updated = completeFearItem(selected.id)
    setLadder(updated)
    if (withVoluntaryStutter) {
      addBraveStar(2) // Bonus star for voluntary stuttering
      setBraveStars(getBraveStars())
      addSession({ type: 'brave', missionId: selected.id, voluntaryStutter: true })
    } else {
      setBraveStars(getBraveStars())
      addSession({ type: 'brave', missionId: selected.id })
    }
    setStep('celebrate')
    setFluxMsg(getRandomFluxResponse('brave'))
  }

  const completed = ladder.filter(i => i.completed).length
  const total = ladder.length

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="page-title">⭐ BraveMissions</div>
            <div className="page-subtitle">Face fears. Earn stars. Grow.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--brave)' }}>
              ⭐ {braveStars}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>BRAVE STARS</div>
          </div>
        </div>
        {step === 'list' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span>Progress</span><span>{completed}/{total} missions</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${(completed / total) * 100}%`, background: 'linear-gradient(90deg, var(--success), var(--brave))' }} />
            </div>
          </div>
        )}
      </div>

      <div className="page-content">

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
          <FluxCharacter size={70} mood={step === 'celebrate' ? 'brave' : 'happy'} />
          <div className="flux-speech" style={{ flex: 1, fontSize: 13 }}>{fluxMsg}</div>
        </div>

        {step === 'list' && (
          <>
            {/* Voluntary stutter card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 20, padding: '16px 18px', marginBottom: 20,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
                🔥 Voluntary Stutter Challenge
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 12 }}>
                Stutter on purpose in your next conversation. This is the single most powerful desensitisation technique known — and it earns you <strong style={{ color: 'var(--brave)' }}>2 Brave Stars</strong>!
              </div>
              <button className="btn btn-brave btn-sm" onClick={() => { addBraveStar(2); setBraveStars(getBraveStars()); setFluxMsg('🌟 TWO BRAVE STARS! You just did the hardest thing. Fear has no power here.') }}>
                ✓ I Did It! +2 Stars
              </button>
            </div>

            {/* Fear ladder */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
              Fear Ladder — Climb It
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ladder.map((item) => (
                <div
                  key={item.id}
                  className={`fear-item ${item.completed ? 'completed' : ''}`}
                  onClick={() => !item.completed && startMission(item)}
                  style={{ cursor: item.completed ? 'default' : 'pointer' }}
                >
                  <div className="fear-level" style={{
                    background: item.completed ? 'rgba(16,185,129,0.2)' : `${LEVEL_COLORS[item.level]}22`,
                    color: item.completed ? 'var(--success)' : LEVEL_COLORS[item.level],
                    border: `1px solid ${item.completed ? 'var(--success)' : LEVEL_COLORS[item.level]}44`,
                  }}>
                    {item.completed ? '✓' : item.level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: item.completed ? 'rgba(255,255,255,0.5)' : 'white', textDecoration: item.completed ? 'line-through' : 'none' }}>
                      {item.situation}
                    </div>
                    {item.completed && <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>✅ Completed</div>}
                  </div>
                  {!item.completed && <div style={{ fontSize: 18, opacity: 0.4 }}>›</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'mission' && selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              background: `${LEVEL_COLORS[selected.level]}10`,
              border: `1px solid ${LEVEL_COLORS[selected.level]}30`,
              borderRadius: 24, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${LEVEL_COLORS[selected.level]}20`,
                  color: LEVEL_COLORS[selected.level],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
                }}>
                  {selected.level}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: LEVEL_COLORS[selected.level] }}>Level {selected.level} Mission</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>Brave Challenge</div>
                </div>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 600 }}>{selected.situation}</div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 8 }}>💡 How to approach this:</div>
              <ol style={{ paddingLeft: 18, color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 2 }}>
                <li>Take 3 slow breaths first</li>
                <li>Tell yourself: "I might stutter, and that's okay"</li>
                <li>Go do it — don't overthink it</li>
                <li>Come back here and mark it done</li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
                How did it go?
              </div>
              <button className="btn btn-success btn-full" onClick={() => completeMission(false)}>
                ✅ I Did It! +1 Star
              </button>
              <button className="btn btn-brave btn-full" onClick={() => completeMission(true)}>
                🔥 I Did It AND Stuttered on Purpose! +2 Stars
              </button>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => setStep('list')}>
                Not ready yet — come back later
              </button>
            </div>
          </div>
        )}

        {step === 'celebrate' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 20 }}>
            <div style={{ fontSize: 80, animation: 'bounce-in 0.5s var(--ease)' }}>⭐</div>
            <FluxCharacter size={120} mood="brave" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, textAlign: 'center', color: 'var(--brave)' }}>
              Brave Star Earned!
            </div>
            <div style={{ fontSize: 15, textAlign: 'center', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 280 }}>
              You just made that fear smaller. Every mission you complete is a permanent change in how your brain processes this situation.
            </div>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '12px 20px', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'var(--brave)' }}>⭐ {braveStars} Total Brave Stars</span>
            </div>
            <button className="btn btn-brave btn-full btn-lg" onClick={() => setStep('list')}>
              Back to Missions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
