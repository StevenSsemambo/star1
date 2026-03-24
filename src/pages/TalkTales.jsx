import React, { useState, useRef } from 'react'
import { STORY_STARTERS, addSession, getRandomFluxResponse } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

export default function TalkTales() {
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('select') // select, reading, recording, done
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [currentTurn, setCurrentTurn] = useState('flux') // flux, user
  const [fluxContinuation, setFluxContinuation] = useState('')
  const [fluxMsg, setFluxMsg] = useState('Pick a story to begin. Flux will start it — then it\'s your turn! No wrong answers. No time limit.')
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const FLUX_CONTINUATIONS = {
    1: ["...a young explorer named Sam, who had never spoken in front of anyone before. They carried a small glowing device that could translate any language.", "...a robot who could only speak in whispers. The robot said: 'I may be quiet, but my words carry far.' The explorer smiled and replied..."],
    2: ["...she could finally breathe fire — but only when she sang! Every morning, tiny sparks flew from her mouth with each note.", "...a small creature who was afraid to speak. The dragon said: 'Your voice, however it comes out, is the most important sound in this world.'"],
    3: ["...a map made of sound. Each word spoken nearby would light up a new path on the map.", "...a letter that read: 'The person who opens this chest must tell a story before sundown, or the treasure disappears.'"],
    4: ["...a voice echo that could travel through walls and find the king's lost words. The child's name was Alex, and Alex never backed down from a challenge.", "...the royal librarian, who said: 'The king's voice was stolen by the creature who feared brave speakers most.'"],
    5: ["...a song that had been forgotten for a hundred years, and to hear it again, a child would need to sit quietly and really, truly listen.", "...'We have been waiting for someone like you. Someone patient enough to hear us. Now — tell us your story in return.'"],
    6: ["...a small bird reminded her: 'The most powerful roar begins as a whisper.' The lion closed her eyes and thought...", "...all the other animals gathered to listen. The lion took a deep breath. For the first time, she was ready to speak."],
    7: ["...birds flew out of the windows. The second note made the floor feel like it was moving with the music. And the third note...", "...everyone in the room began to remember a forgotten memory. The musician smiled and said: 'Music makes us brave.'"],
    8: ["...'I will carry you, but you must speak your name first. Loud enough for the sea to hear it.' The surfer stood tall and said..."],
  }

  const startStory = (story) => {
    setSelected(story)
    setStep('reading')
    setCurrentTurn('user')
    setFluxMsg('It\'s your turn! Read the story starter out loud, nice and slow. No rush.')
  }

  const fluxContinues = () => {
    const continuations = FLUX_CONTINUATIONS[selected.id] || ['...and the adventure continued in the most unexpected way possible!']
    const pick = continuations[recordings.length % continuations.length]
    setFluxContinuation(pick)
    setCurrentTurn('flux')
    setFluxMsg(getRandomFluxResponse('talkTales'))
    setTimeout(() => setCurrentTurn('user'), 2000)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordings(r => [...r, { url, timestamp: Date.now() }])
        fluxContinues()
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      // No mic — just simulate
      setRecordings(r => [...r, { url: null, timestamp: Date.now() }])
      fluxContinues()
    }
  }

  const stopRecording = () => {
    if (mediaRef.current && isRecording) {
      mediaRef.current.stop()
      setIsRecording(false)
    }
  }

  const finishStory = () => {
    addSession({ type: 'talktales', storyId: selected.id, turns: recordings.length })
    setStep('done')
    setFluxMsg('What a story! You kept talking even when it felt hard. That is the whole point.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">📖 TalkTales</div>
        <div className="page-subtitle">Tell stories. Build your voice.</div>
      </div>

      <div className="page-content">

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
          <FluxCharacter size={70} mood={step === 'done' ? 'brave' : 'happy'} />
          <div className="flux-speech" style={{ flex: 1, fontSize: 13 }}>{fluxMsg}</div>
        </div>

        {step === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STORY_STARTERS.map((story, i) => (
              <button
                key={story.id}
                onClick={() => startStory(story)}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '16px 18px', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', color: 'white',
                  animationDelay: `${i * 0.04}s`,
                }}
                className="fade-in"
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 24 }}>{story.theme.split(' ')[0]}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14 }}>{story.theme}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 1.5 }}>
                      {story.text.slice(0, 60)}...
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'reading' && selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Flux starter */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <FluxCharacter size={50} animated={false} mood="happy" />
              <div className="story-bubble story-flux">
                <div style={{ fontSize: 11, color: 'var(--flux)', fontWeight: 700, marginBottom: 6 }}>FLUX starts the story:</div>
                {selected.text}
              </div>
            </div>

            {/* Flux continuation if any */}
            {fluxContinuation && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <FluxCharacter size={50} animated={false} mood="happy" />
                <div className="story-bubble story-flux">
                  <div style={{ fontSize: 11, color: 'var(--flux)', fontWeight: 700, marginBottom: 6 }}>FLUX continues:</div>
                  {fluxContinuation}
                </div>
              </div>
            )}

            {/* User recordings */}
            {recordings.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧑</div>
                <div className="story-bubble story-user" style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 6 }}>YOUR turn #{i+1}:</div>
                  {r.url ? (
                    <audio src={r.url} controls style={{ width: '100%', height: 32, filter: 'hue-rotate(240deg)' }} />
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>📝 Story continues...</span>
                  )}
                </div>
              </div>
            ))}

            {/* Action */}
            {currentTurn === 'user' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  Your turn! Continue the story out loud.
                </div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: isRecording ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, var(--pulse), #6d28d9)',
                    border: 'none', fontSize: 28, cursor: 'pointer',
                    boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.4)' : '0 0 30px var(--pulse-glow)',
                    animation: isRecording ? 'brave-pulse 1s ease-in-out infinite' : 'none',
                  }}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {isRecording ? 'Recording... tap to stop' : 'Tap to start speaking'}
                </div>
              </div>
            )}

            {recordings.length >= 2 && !isRecording && (
              <button className="btn btn-success btn-full" onClick={finishStory}>
                🎉 Finish Story
              </button>
            )}

            <button className="btn btn-ghost btn-sm" onClick={() => setStep('select')}>← Choose Different Story</button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 20 }}>
            <div style={{ fontSize: 64 }}>📖✨</div>
            <FluxCharacter size={120} mood="brave" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, textAlign: 'center' }}>
              Story Complete!
            </div>
            <div style={{ fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 280 }}>
              You kept talking. That is the whole exercise. Every sentence you spoke today makes the next one easier.
            </div>
            <button className="btn btn-pulse btn-full" onClick={() => { setStep('select'); setSelected(null); setRecordings([]); setFluxContinuation(''); }}>
              Tell Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
