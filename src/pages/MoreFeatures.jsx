import React, { useState, useRef, useEffect } from 'react'
import { SONGS, addSession } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

// ============ SONG MODE ============
export function SongMode() {
  const [selected, setSelected] = useState(null)
  const [currentLine, setCurrentLine] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  const startSong = (song) => {
    setSelected(song)
    setCurrentLine(0)
    setPlaying(true)
    setDone(false)
  }

  useEffect(() => {
    if (!playing || !selected) return
    timerRef.current = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= selected.lines.length - 1) {
          clearInterval(timerRef.current)
          setPlaying(false)
          setDone(true)
          addSession({ type: 'song', songId: selected.id })
          return prev
        }
        return prev + 1
      })
    }, selected.tempo === 'slow' ? 3500 : selected.tempo === 'upbeat' ? 2200 : 2800)
    return () => clearInterval(timerRef.current)
  }, [playing, selected])

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🎵 Song Mode</div>
        <div className="page-subtitle">Singing rewires your speech brain</div>
      </div>
      <div className="page-content">
        <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 14, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            🎶 Singing reduces stuttering by over <strong style={{ color: '#06b6d4' }}>90%</strong> by activating different neural pathways. Sing along with each line as it highlights — no perfect pitch needed!
          </div>
        </div>

        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => startSong(song)}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '18px 20px', cursor: 'pointer', color: 'white', textAlign: 'left' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>{song.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Tempo: {song.tempo} · {song.lines.length} lines</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontStyle: 'italic' }}>"{song.lines[0]}"</div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 24, color: '#06b6d4' }}>
              🎵 {selected.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {selected.lines.map((line, i) => (
                <div key={i} className="lyric-line" style={{
                  color: i < currentLine ? '#06b6d4' : i === currentLine ? 'white' : 'rgba(255,255,255,0.25)',
                  fontSize: i === currentLine ? 22 : 16,
                  background: i === currentLine ? 'rgba(6,182,212,0.08)' : 'transparent',
                  borderRadius: 10, padding: '8px 12px',
                  transition: 'all 0.3s ease',
                  textShadow: i === currentLine ? '0 0 20px rgba(6,182,212,0.5)' : 'none',
                }}>
                  {i === currentLine && playing && '🎵 '}{line}
                </div>
              ))}
            </div>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--success)', marginBottom: 16 }}>Beautifully done!</div>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setDone(false); }}>Try Another Song</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{playing ? '● Sing along with the highlighted line...' : 'Ready to start'}</div>
                {!playing && <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setSelected(null)}>← Back</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ DAF MODE ============
export function DAFMode() {
  const [active, setActive] = useState(false)
  const [delay, setDelay] = useState(150)
  const [volume, setVolume] = useState(0.8)
  const ctxRef = useRef(null)
  const streamRef = useRef(null)

  const startDAF = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const bufferSize = ctx.sampleRate * (delay / 1000)
      const delay_node = ctx.createDelay(2.0)
      delay_node.delayTime.value = delay / 1000
      const gain = ctx.createGain()
      gain.gain.value = volume
      source.connect(delay_node)
      delay_node.connect(gain)
      gain.connect(ctx.destination)
      setActive(true)
    } catch {
      alert('Microphone permission needed for DAF Mode. Please allow microphone access.')
    }
  }

  const stopDAF = () => {
    ctxRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setActive(false)
    addSession({ type: 'daf', delay })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🎧 DAF Mode</div>
        <div className="page-subtitle">Delayed Auditory Feedback</div>
      </div>
      <div className="page-content">
        <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            🎧 DAF plays your own voice back with a slight delay, creating a choral-like effect that reduces stuttering by <strong style={{ color: '#8b5cf6' }}>60–90%</strong>. Wear headphones and speak naturally.
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 20 }}>Settings</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 700 }}>
              <span>Delay</span>
              <span style={{ color: '#8b5cf6' }}>{delay}ms</span>
            </div>
            <input type="range" min="50" max="300" value={delay} onChange={e => setDelay(+e.target.value)} className="daf-slider" disabled={active} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              <span>Shorter (50ms)</span><span>Longer (300ms)</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 700 }}>
              <span>Playback Volume</span>
              <span style={{ color: '#8b5cf6' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min="0.1" max="1" step="0.1" value={volume} onChange={e => setVolume(+e.target.value)} className="daf-slider" disabled={active} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <button
            onClick={active ? stopDAF : startDAF}
            style={{
              width: 100, height: 100, borderRadius: '50%',
              background: active ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              border: 'none', fontSize: 36, cursor: 'pointer',
              boxShadow: active ? '0 0 40px rgba(239,68,68,0.4)' : '0 0 30px rgba(139,92,246,0.4)',
              animation: active ? 'brave-pulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {active ? '⏹️' : '🎧'}
          </button>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {active ? '● DAF Active — speak naturally' : 'Tap to start DAF Mode'}
          </div>
          {active && (
            <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Speak at a comfortable pace. Notice how the delay changes your fluency. Many people are amazed by the difference.
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, textAlign: 'center' }}>
          ⚠️ Use headphones only. Without headphones, feedback loop will occur.
        </div>
      </div>
    </div>
  )
}

// ============ ADVENTURE MODE ============
export function Adventure() {
  const [activeZone, setActiveZone] = useState(null)

  const ZONES = [
    { id: 1, name: 'Whispering Woods', icon: '🌲', skill: 'Gentle Onset', description: 'Learn to start sounds softly, like a whisper growing into speech.', color: '#10b981', locked: false, missions: 5 },
    { id: 2, name: 'Breath Mountain', icon: '⛰️', skill: 'Diaphragmatic Breathing', description: 'Climb higher by mastering the breath that powers all speech.', color: '#06b6d4', locked: false, missions: 5 },
    { id: 3, name: 'Echo Caves', icon: '🗿', skill: 'Vowel Prolongation', description: 'Stretch your vowels and feel the echoes of flowing speech.', color: '#a78bfa', locked: false, missions: 5 },
    { id: 4, name: 'Bravery Bridge', icon: '🌉', skill: 'Desensitisation', description: 'Cross the bridge by facing small fears, one step at a time.', color: '#f59e0b', locked: false, missions: 5 },
    { id: 5, name: 'Story City', icon: '🏙️', skill: 'Real-World Scenarios', description: 'Practice real conversations — ordering, introducing, asking.', color: '#f97316', locked: false, missions: 5 },
    { id: 6, name: 'The Flow River', icon: '🌊', skill: 'Full Fluency Integration', description: 'Put it all together and find your flow.', color: '#00d4ff', locked: false, missions: 5 },
  ]

  const ZONE_EXERCISES = {
    1: [
      { text: 'Whisper your name, then say it at normal volume. Feel the difference.', done: false },
      { text: 'Say "Hello, how are you?" starting each word gently, like a wave touching shore.', done: false },
      { text: 'Read this slowly: "Every animal arrives at ease."', done: false },
      { text: 'Take a breath, then say your favourite food with a super soft start.', done: false },
      { text: 'Tell someone at home a sentence — starting the first word on a whisper.', done: false },
    ],
    2: [
      { text: 'Breathe in for 4 counts, hold 4, out for 4. Do this 3 times.', done: false },
      { text: 'Place your hand on your belly. Breathe so your hand moves — not your chest.', done: false },
      { text: 'Breathe in, then say a full sentence on the exhale without running out of air.', done: false },
      { text: 'Before speaking, take one slow belly breath. Practice this 5 times.', done: false },
      { text: 'Say: "I breathe in calm and breathe out tension" — slowly.', done: false },
    ],
    3: [
      { text: 'Say "Aaaa" and hold it for 3 seconds. Smooth the sound.', done: false },
      { text: 'Say: "Open orange ovals over oceans" — stretching each vowel.', done: false },
      { text: 'Read a sentence from a book, elongating every vowel slightly.', done: false },
      { text: 'Sing one note on "Ahhh" for as long as you can in one breath.', done: false },
      { text: 'Say your full name, stretching every vowel. How does it feel?', done: false },
    ],
    4: [
      { text: 'Stutter on purpose while saying your name. How did that feel?', done: false },
      { text: 'Tell someone at home about your day — without avoiding any word.', done: false },
      { text: 'When you feel the urge to swap a word, use the original word anyway.', done: false },
      { text: 'Make a phone call or voice message to someone you know.', done: false },
      { text: 'Volunteer to speak first in a group conversation today.', done: false },
    ],
    5: [
      { text: 'Practice: "I\'d like a [food item] please" — like ordering at a restaurant.', done: false },
      { text: 'Practice: "Hi, my name is [name]. Nice to meet you."', done: false },
      { text: 'Practice: "Excuse me, can I ask you something?"', done: false },
      { text: 'Practice answering: "What do you do?" or "What grade are you in?"', done: false },
      { text: 'Practice: "Thank you so much" with eye contact in a mirror.', done: false },
    ],
    6: [
      { text: 'Have a 2-minute conversation using everything you\'ve learned.', done: false },
      { text: 'Read a paragraph aloud, using gentle onset and breath support together.', done: false },
      { text: 'Tell a 1-minute story to someone using all five techniques.', done: false },
      { text: 'Record yourself speaking for 60 seconds on any topic.', done: false },
      { text: 'Write down one thing that has changed since you started. Then say it out loud.', done: false },
    ],
  }

  const [completedExercises, setCompletedExercises] = useState({})

  const toggleEx = (zoneId, exIdx) => {
    const key = `${zoneId}_${exIdx}`
    setCompletedExercises(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      const zoneCompleted = Object.keys(updated).filter(k => k.startsWith(`${zoneId}_`) && updated[k]).length
      if (zoneCompleted >= 3) addSession({ type: 'adventure', zoneId })
      return updated
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🗺️ Adventure Mode</div>
        <div className="page-subtitle">6 zones, 30 speech missions</div>
      </div>
      <div className="page-content">
        {!activeZone ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ZONES.map((zone, i) => {
              const zoneCompleted = Object.keys(completedExercises).filter(k => k.startsWith(`${zone.id}_`) && completedExercises[k]).length
              return (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone)}
                  style={{
                    background: 'var(--card)', border: `1px solid ${zone.color}30`,
                    borderRadius: 20, padding: '16px 18px', cursor: 'pointer',
                    textAlign: 'left', color: 'white', transition: 'all 0.2s',
                    animationDelay: `${i * 0.05}s`,
                  }}
                  className="fade-in"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 32, width: 56, height: 56, borderRadius: 16, background: `${zone.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {zone.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>{zone.name}</div>
                      <div style={{ fontSize: 12, color: zone.color, marginTop: 2, fontWeight: 700 }}>{zone.skill}</div>
                      <div style={{ marginTop: 6 }}>
                        <div className="progress-bar-wrap" style={{ height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${(zoneCompleted / zone.missions) * 100}%`, background: zone.color }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{zoneCompleted}/{zone.missions} missions</div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveZone(null)} style={{ marginBottom: 20 }}>← All Zones</button>
            <div style={{ background: `${activeZone.color}10`, border: `1px solid ${activeZone.color}30`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{activeZone.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900 }}>{activeZone.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 1.6 }}>{activeZone.description}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(ZONE_EXERCISES[activeZone.id] || []).map((ex, i) => {
                const key = `${activeZone.id}_${i}`
                const done = completedExercises[key]
                return (
                  <div
                    key={i}
                    onClick={() => toggleEx(activeZone.id, i)}
                    style={{
                      background: done ? `${activeZone.color}0a` : 'var(--card)',
                      border: `1px solid ${done ? activeZone.color : 'var(--border)'}40`,
                      borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                      transition: 'all 0.2s', display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                      background: done ? activeZone.color : 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: done ? 'white' : 'rgba(255,255,255,0.3)',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: done ? 'rgba(255,255,255,0.5)' : 'white', textDecoration: done ? 'line-through' : 'none' }}>
                      {ex.text}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ FAMILY MODE ============
export function FamilyMode() {
  const [step, setStep] = useState('intro')
  const [currentLine, setCurrentLine] = useState(0)
  const [speaker, setSpeaker] = useState('parent') // parent or child

  const SHARED_STORIES = [
    { title: 'The Brave Little Fox', lines: [
      'Once upon a time, there was a little fox who wanted to speak to the moon.',
      'The fox climbed the tallest hill and took a deep breath.',
      'The moon listened quietly, waiting for every single word.',
      '"I have something important to say," the fox began slowly.',
      'And the moon said: "Every word you speak is worth waiting for."',
      'The fox smiled, and the stars all glittered in agreement.',
    ]},
    { title: 'The River that Talked', lines: [
      'Every river in the world has a story to tell.',
      'This river had learned to speak slowly, one word at a time.',
      'The fish listened carefully, never rushing the river to finish.',
      '"Take your time," said the oldest fish. "Good stories are worth waiting for."',
      'And so the river spoke, gently and clearly, all the way to the sea.',
    ]},
  ]

  const [selectedStory, setSelectedStory] = useState(null)

  const startReading = (story) => {
    setSelectedStory(story)
    setCurrentLine(0)
    setSpeaker('parent')
    setStep('reading')
  }

  const nextLine = () => {
    if (currentLine >= selectedStory.lines.length - 1) {
      setStep('done')
      addSession({ type: 'family' })
      return
    }
    setCurrentLine(c => c + 1)
    setSpeaker(s => s === 'parent' ? 'child' : 'parent')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">👨‍👩‍👧 Family Mode</div>
        <div className="page-subtitle">Read together. Reduce stuttering by 97%.</div>
      </div>
      <div className="page-content">
        <div style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.12)', borderRadius: 14, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            💝 Reading alternating lines together creates the <strong style={{ color: '#ec4899' }}>choral speech effect</strong> — the single most powerful fluency boost known to science. Take turns with no rush.
          </div>
        </div>

        {step === 'intro' && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Choose a story to share:</div>
            {SHARED_STORIES.map(s => (
              <button key={s.title} onClick={() => startReading(s)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '18px 20px', width: '100%', color: 'white', marginBottom: 12, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.lines.length} lines · Alternate reading</div>
              </button>
            ))}

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginTop: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 12 }}>💡 Parent Tips from Flux</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Never finish your child\'s sentences — wait patiently, they will get there.',
                  'Match their speaking rate. If they slow down, slow down with them.',
                  'After sessions, say: "I loved reading with you" — not "Well done for not stuttering."',
                  'Celebrate attempting, not fluency. "You tried that word!" is better than "You didn\'t stutter!"',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                    <span style={{ color: '#ec4899', flexShrink: 0 }}>•</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'reading' && selectedStory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{selectedStory.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Line {currentLine + 1} of {selectedStory.lines.length}</div>
            </div>

            <div style={{
              background: speaker === 'parent' ? 'rgba(236,72,153,0.08)' : 'rgba(0,212,255,0.08)',
              border: `1px solid ${speaker === 'parent' ? 'rgba(236,72,153,0.2)' : 'rgba(0,212,255,0.2)'}`,
              borderRadius: 24, padding: 24, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: speaker === 'parent' ? '#ec4899' : 'var(--flux)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {speaker === 'parent' ? '👩 Parent reads:' : '🧒 Child reads:'}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1.6 }}>
                "{selectedStory.lines[currentLine]}"
              </div>
            </div>

            {currentLine < selectedStory.lines.length && (
              <div style={{ padding: '8px 0', borderRadius: 12, opacity: 0.3, textAlign: 'center', fontSize: 13 }}>
                Next: {speaker === 'parent' ? '🧒 Child' : '👩 Parent'} reads
              </div>
            )}

            <button
              className={`btn ${speaker === 'parent' ? 'btn-pulse' : 'btn-primary'} btn-full btn-lg`}
              onClick={nextLine}
            >
              {currentLine < selectedStory.lines.length - 1 ? 'Done Reading ✓ Next Line →' : '🎉 Finish Story'}
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => setStep('intro')}>← Back</button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💝</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: '#ec4899' }}>Wonderful reading together!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 280, margin: '12px auto 24px' }}>
              You just used one of the most powerful fluency techniques available, and made a lovely memory doing it.
            </div>
            <button className="btn btn-full" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white', padding: '14px', borderRadius: 40, border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer' }} onClick={() => setStep('intro')}>
              Read Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
