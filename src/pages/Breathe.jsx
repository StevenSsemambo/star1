import React, { useState, useEffect, useRef } from 'react'
import { BREATHING_EXERCISES, addSession, getRandomFluxResponse } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

export default function Breathe() {
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('ready') // ready, inhale, hold, exhale, holdOut, done
  const [round, setRound] = useState(1)
  const [count, setCount] = useState(0)
  const [totalRounds, setTotalRounds] = useState(0)
  const [fluxMsg, setFluxMsg] = useState('Choose a breathing exercise to calm your voice and prepare to speak.')
  const timerRef = useRef(null)

  const startExercise = (ex) => {
    setSelected(ex)
    setRound(1)
    setTotalRounds(ex.rounds)
    setFluxMsg(getRandomFluxResponse('breathing'))
    setPhase('ready')
    setTimeout(() => runPhase(ex, 1, 'inhale'), 1000)
  }

  const runPhase = (ex, roundNum, currentPhase) => {
    const durations = {
      inhale: ex.inhale,
      hold: ex.hold,
      exhale: ex.exhale,
      holdOut: ex.holdOut,
    }
    const order = ex.holdOut > 0
      ? ['inhale', 'hold', 'exhale', 'holdOut']
      : ['inhale', 'hold', 'exhale']

    setPhase(currentPhase)
    let timeLeft = durations[currentPhase]
    setCount(timeLeft)

    timerRef.current = setInterval(() => {
      timeLeft -= 1
      setCount(timeLeft)
      if (timeLeft <= 0) {
        clearInterval(timerRef.current)
        const currentIdx = order.indexOf(currentPhase)
        const nextIdx = currentIdx + 1

        if (nextIdx < order.length) {
          runPhase(ex, roundNum, order[nextIdx])
        } else {
          // Round complete
          if (roundNum < ex.rounds) {
            setRound(roundNum + 1)
            setTimeout(() => runPhase(ex, roundNum + 1, 'inhale'), 800)
          } else {
            setPhase('done')
            setFluxMsg('Beautiful! Your breath is your anchor. You just calmed your nervous system. 🌊')
            addSession({ type: 'breathing', exercise: ex.id })
          }
        }
      }
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const phaseText = {
    ready: 'Get Ready',
    inhale: '🫁 Breathe In',
    hold: '⏸️ Hold',
    exhale: '💨 Breathe Out',
    holdOut: '⏸️ Hold Empty',
    done: '✅ Complete!',
  }

  const circleScale = phase === 'inhale' || phase === 'hold' ? 1.5
    : phase === 'exhale' || phase === 'holdOut' ? 0.85 : 1

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🌊 Breathe & Flow</div>
        <div className="page-subtitle">Calm your body, find your voice</div>
      </div>

      <div className="page-content">

        {/* Flux */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
          <FluxCharacter size={70} mood="calm" animated={phase !== 'done'} />
          <div className="flux-speech" style={{ flex: 1, fontSize: 13 }}>{fluxMsg}</div>
        </div>

        {!selected ? (
          // Exercise selector
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BREATHING_EXERCISES.map(ex => (
              <button
                key={ex.id}
                onClick={() => startExercise(ex)}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '18px 20px', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', color: 'white',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--flux)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 32 }}>
                    {ex.id === 'box' ? '⬜' : ex.id === '478' ? '🧘' : '🌊'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{ex.description}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-flux">In: {ex.inhale}s</span>
                      <span className="badge badge-pulse">Hold: {ex.hold}s</span>
                      <span className="badge badge-success">Out: {ex.exhale}s</span>
                      <span className="badge badge-brave">{ex.rounds} rounds</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 20, opacity: 0.5 }}>›</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Active exercise
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {/* Round indicator */}
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: 5,
                  background: i < round ? 'var(--flux)' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {/* Breath circle */}
            <div style={{
              width: 150, height: 150,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, rgba(0,212,255,0.6), rgba(0,212,255,0.1))`,
              border: '2px solid rgba(0,212,255,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${circleScale})`,
              transition: phase === 'exhale' ? 'transform 1s ease-in' : phase === 'inhale' ? 'transform 1s ease-out' : 'transform 0.3s',
              boxShadow: '0 0 40px rgba(0,212,255,0.25)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: 'var(--flux)' }}>
                {count}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                {phaseText[phase]}
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, textAlign: 'center' }}>
              {phaseText[phase]}
            </div>

            {phase === 'done' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', alignItems: 'center' }}>
                <div style={{ fontSize: 48, animation: 'bounce-in 0.5s var(--ease)' }}>🎉</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>
                  Well done!
                </div>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setPhase('ready'); }}>
                  Try Another Exercise
                </button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => { clearInterval(timerRef.current); setSelected(null); setPhase('ready'); }}>
                Stop Exercise
              </button>
            )}
          </div>
        )}

        {/* Science note */}
        <div style={{ marginTop: 32, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--flux)' }}>Science:</strong> Deep breathing activates your parasympathetic nervous system, reducing cortisol and relaxing the vocal muscles that tighten during stuttering. Practice this before any speaking situation.
          </div>
        </div>
      </div>
    </div>
  )
}
