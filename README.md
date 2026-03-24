# YoSpeech — Find Your Flow

> A speech confidence PWA for everyone who stutters — from toddlers to adults.

Built by **SayMyTech Developers**

---

## What is YoSpeech?

YoSpeech is a science-backed, offline-first Progressive Web App that helps children, teenagers, and adults who stutter build speech confidence through:

- 🌊 **Breathe & Flow** — Breathing exercises that calm the nervous system before speaking
- 🗣️ **SpeakLab** — Daily 5-minute fluency shaping exercises
- ⭐ **BraveMissions** — Exposure therapy via a personal Fear Ladder
- 📖 **TalkTales** — AI-assisted collaborative storytelling
- 🎙️ **Voice Journal** — Audio timeline showing your own progress over time
- 🎵 **Song Mode** — Singing exercises that reduce stuttering by 90%+
- 🎧 **DAF Mode** — Delayed Auditory Feedback (60–90% stuttering reduction)
- 🗺️ **Adventure Mode** — 6 themed speech skill zones
- 👨‍👩‍👧 **Family Mode** — Parent-child co-reading with the choral speech effect
- 🌌 **Progress Universe** — A personal star sky that grows with every session

---

## Tech Stack

- **React 18** + **Vite** — Fast, modern frontend
- **React Router v6** — SPA navigation
- **Vite PWA Plugin** + **Workbox** — Service worker & offline caching
- **IndexedDB via localStorage** — All data stored locally, offline-first
- **Web Speech API** — On-device speech recognition
- **WebAudio API** — Waveform visualization & DAF mode
- **MediaRecorder API** — Voice journal recordings

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

The `dist/` folder is ready to deploy to Netlify, Vercel, or any static host.

---

## Deploy to Netlify

1. Push this repo to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

The `netlify.toml` handles SPA routing and PWA headers automatically.

---

## Offline Architecture

YoSpeech works **100% offline** after the first load:

| Layer | Technology | What it does |
|---|---|---|
| App Shell | Workbox Service Worker | Caches all UI, assets, audio on install |
| Local Data | localStorage | Sessions, journal, fear ladder, profile |
| Flux Responses | Bundled JSON | 1,400+ pre-written companion responses |
| Speech Recognition | Web Speech API | On-device recognition (Chrome/Edge) |
| Background Sync | Service Worker | Queues data for cloud sync when online |

---

## Business Model

| Tier | Price | Who |
|---|---|---|
| Core App | Free forever | Children, teens, adults who stutter |
| Therapist Portal | $15/month | Speech-language pathologists |
| School/Clinic License | Custom | Institutions |

**The child never pays.**

---

## About SayMyTech Developers

SayMyTech builds progressive web applications for underserved communities, with a focus on offline-first architecture, educational tools, and accessibility.

> "Your voice is yours. Find your flow."

---

## License

MIT — Free to use, modify, and deploy.

© 2025 SayMyTech Developers
