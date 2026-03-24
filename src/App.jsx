import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './styles/main.css'

import { isOnboarded } from './utils/storage'

import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Breathe from './pages/Breathe'
import SpeakLab from './pages/SpeakLab'
import BraveMissions from './pages/BraveMissions'
import TalkTales from './pages/TalkTales'
import VoiceJournal from './pages/VoiceJournal'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import { SongMode, DAFMode, Adventure, FamilyMode } from './pages/MoreFeatures'

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/brave', icon: '⭐', label: 'Brave' },
  { to: '/breathe', icon: '🌊', label: 'Breathe' },
  { to: '/progress', icon: '🌌', label: 'Universe' },
  { to: '/profile', icon: '👤', label: 'Me' },
]

function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  return (
    <nav className="nav-bar">
      {NAV_ITEMS.map(item => {
        const active = item.to === '/' ? path === '/' : path.startsWith(item.to)
        return (
          <button
            key={item.to}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.to)}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function AppShell() {
  const location = useLocation()
  const hideNav = location.pathname === '/onboarding'

  return (
    <div className="app-shell">
      <div className="bg-aura" />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/breathe" element={<Breathe />} />
        <Route path="/speaklab" element={<SpeakLab />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/brave" element={<BraveMissions />} />
        <Route path="/talktales" element={<TalkTales />} />
        <Route path="/journal" element={<VoiceJournal />} />
        <Route path="/songs" element={<SongMode />} />
        <Route path="/daf" element={<DAFMode />} />
        <Route path="/family" element={<FamilyMode />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {!hideNav && <NavBar />}
    </div>
  )
}

function RedirectToOnboarding() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!isOnboarded()) navigate('/onboarding', { replace: true })
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <RedirectToOnboarding />
      <AppShell />
    </BrowserRouter>
  )
}
