import React, { useState, useRef, useEffect } from 'react'
import { SPEAKLAB_EXERCISES, addSession, getRandomFluxResponse } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

export default function SpeakLab() {
  const [current, setCurrent] = useState(null)
  const [step, setStep] = useState('intro') // intro, practice, done
  const [listening, setListening] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [fluxMsg, setFluxMsg] = useState('Choose an exercise. Each one targets a different speech skill.')
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      setListening(true)
      drawWaveform()
    } catch {
      setFeedback('Microphone not available — that\'s okay! Practice saying the prompt out loud anyway.')
    }
  }

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    cancelAnimationFrame(animRef.current)
    setListening(false)
    setAttempts(a => a + 1)
    const responses = [
      'Great attempt! Did you notice how that felt?',
      'Beautiful! Try to feel the air flowing continuously.',
      'You\'re building new pathways in your brain right now!',
      'That was brave. Every attempt matters.',
      'Excellent! The more you practice, the easier it becomes.',
    ]
    setFeedback(responses[attempts % responses.length])
    setFluxMsg(getRandomFluxResponse('encouragement'))
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const data = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(data)
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(0,212,255,0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      const sliceWidth = width / data.length
      let x = 0
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0
        const y = (v * height) / 2
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.stroke()
    }
    draw()
  }

  useEffect(() => () => {
    cancelAnimationFrame(animRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }, [])

  const completeExercise = () => {
    addSession({ type: 'speaklab', exercise: current.id })
    setStep('done')
    setFluxMsg(getRandomFluxResponse('encouragement'))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🗣️ SpeakLab</div>
        <div className="page-subtitle">Daily 5-minute speech exercises</div>
      </div>

      <div className="page-content">

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
          <FluxCharacter size={70} mood={step === 'done' ? 'brave' : 'happy'} />
          <div className="flux-speech" style={{ flex: 1, fontSize: 13 }}>{fluxMsg}</div>
        </div>

        {step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SPEAKLAB_EXERCISES.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => { setCurrent(ex); setStep('practice'); setAttempts(0); setFeedback(''); setFluxMsg('Take a breath. When you\'re ready, tap the mic and speak the prompt.') }}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '16px 18px', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', color: 'white',
                  animationDelay: `${i * 0.05}s`
                }}
                className="fade-in"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28, width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ex.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{ex.instruction}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'practice' && current && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--flux)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                {current.icon} {current.name}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{current.instruction}</div>
              <div style={{ background: 'var(--card)', borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.6 }}>
                "{current.prompt}"
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                💡 {current.tip}
              </div>
            </div>

            {/* Waveform */}
            <div className="waveform-container">
              <canvas ref={canvasRef} width={400} height={80} className="waveform-canvas" />
              {!listening && <div style={{ position: 'absolute', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Tap mic to see your voice wave</div>}
            </div>

            {/* Mic button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={listening ? stopListening : startListening}
                style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: listening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, var(--flux), var(--flux-deep))',
                  border: 'none',
                  fontSize: 32, cursor: 'pointer',
                  transition: 'all 0.2s var(--ease)',
                  boxShadow: listening ? '0 0 30px rgba(239,68,68,0.4)' : '0 0 30px var(--flux-glow)',
                  animation: listening ? 'brave-pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {listening ? '⏹️' : '🎙️'}
              </button>
            </div>

            {feedback && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '12px 16px', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                ✅ {feedback}
              </div>
            )}

            {attempts >= 2 && (
              <button className="btn btn-success btn-full" onClick={completeExercise}>
                Complete Exercise ✓
              </button>
            )}

            <button className="btn btn-ghost btn-sm" onClick={() => { setStep('intro'); setCurrent(null); stopListening(); }}>
              ← Back to exercises
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 20 }}>
            <FluxCharacter size={120} mood="brave" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, textAlign: 'center', color: 'var(--success)' }}>
              Exercise Complete!
            </div>
            <div style={{ fontSize: 15, textAlign: 'center', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              You just built new neural pathways in your speech brain. That's real, measurable progress.
            </div>
            <button className="btn btn-primary btn-full" onClick={() => { setStep('intro'); setCurrent(null); }}>
              Do Another Exercise
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
