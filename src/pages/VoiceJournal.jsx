import React, { useState, useRef } from 'react'
import { getJournal, addJournalEntry } from '../utils/storage'
import FluxCharacter from '../components/FluxCharacter'

const PROMPTS = [
  "How was your day today?",
  "Tell me one brave thing you did today.",
  "What made you happy today?",
  "Describe something you said today that felt hard.",
  "What are you looking forward to tomorrow?",
  "Tell me about someone you talked to today.",
  "What's one thing you want to say that you haven't said yet?",
  "Describe today in 3 words, then explain them.",
]

export default function VoiceJournal() {
  const [journal, setJournal] = useState(getJournal())
  const [isRecording, setIsRecording] = useState(false)
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const [recorded, setRecorded] = useState(false)
  const [fluxMsg, setFluxMsg] = useState('30 seconds. That\'s all. Just speak honestly — no audience, just you and your voice.')
  const [playingId, setPlayingId] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const audioRefs = useRef({})

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          const entry = { prompt, audioData: reader.result, duration: 30 }
          const updated = addJournalEntry(entry)
          setJournal(updated)
          setRecorded(true)
          setFluxMsg('That recording is yours forever. Listen back in a few weeks — you\'ll be amazed by how far you\'ve come. 🌟')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRef.current = recorder
      recorder.start()
      setIsRecording(true)
      // Auto-stop at 60 seconds
      setTimeout(() => { if (mediaRef.current?.state === 'recording') stopRecording() }, 60000)
    } catch {
      setFluxMsg('Microphone not available. That\'s okay — close your eyes and say your answer out loud instead. It still counts.')
    }
  }

  const stopRecording = () => {
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop()
    }
    setIsRecording(false)
  }

  const playEntry = (entry) => {
    if (playingId === entry.id) {
      audioRefs.current[entry.id]?.pause()
      setPlayingId(null)
      return
    }
    const audio = new Audio(entry.audioData)
    audioRefs.current[entry.id] = audio
    audio.play()
    setPlayingId(entry.id)
    audio.onended = () => setPlayingId(null)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🎙️ Voice Journal</div>
        <div className="page-subtitle">Hear yourself grow over time</div>
      </div>

      <div className="page-content">

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
          <FluxCharacter size={70} mood={recorded ? 'brave' : 'calm'} />
          <div className="flux-speech" style={{ flex: 1, fontSize: 13 }}>{fluxMsg}</div>
        </div>

        {/* Today's recording */}
        {!recorded ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--flux)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              TODAY'S PROMPT
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, lineHeight: 1.4, marginBottom: 24 }}>
              "{prompt}"
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: isRecording
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, var(--warm), #e53e3e)',
                  border: 'none', fontSize: 32, cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 40px rgba(239,68,68,0.5)' : '0 0 30px rgba(255,107,107,0.3)',
                  animation: isRecording ? 'brave-pulse 1s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isRecording ? '⏹️' : '🎙️'}
              </button>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {isRecording ? '● Recording... tap to stop' : 'Tap to record your answer'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 20, marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--success)' }}>Entry saved!</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Come back tomorrow for your next entry.</div>
          </div>
        )}

        {/* Past entries */}
        {journal.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
              Your Audio Timeline ({journal.length} entries)
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>
              💡 Listen to your entries from a few weeks ago. You'll hear real change — in fluency, in confidence, in bravery.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {journal.map((entry, i) => (
                <div key={entry.id} className="journal-entry">
                  <div style={{ flex: 1 }}>
                    <div className="journal-date">{formatDate(entry.date)}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 1.4 }}>
                      "{entry.prompt}"
                    </div>
                  </div>
                  {entry.audioData && (
                    <button
                      className="journal-play"
                      onClick={() => playEntry(entry)}
                    >
                      {playingId === entry.id ? '⏸️' : '▶️'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {journal.length === 0 && !isRecording && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div>
            <div style={{ fontSize: 14 }}>Your voice timeline starts here.<br />Make your first entry above.</div>
          </div>
        )}

        <div style={{ marginTop: 24, background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.1)', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            🔒 Your voice recordings are stored only on this device. Nobody else can access them.
          </div>
        </div>
      </div>
    </div>
  )
}
