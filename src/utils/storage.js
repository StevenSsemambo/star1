// ============================================
// YOSPEECH — LOCAL STORAGE UTILITIES
// ============================================

const KEYS = {
  PROFILE: 'ys_profile',
  SESSIONS: 'ys_sessions',
  JOURNAL: 'ys_journal',
  FEAR_LADDER: 'ys_fear_ladder',
  BRAVE_STARS: 'ys_brave_stars',
  STREAK: 'ys_streak',
  LAST_OPEN: 'ys_last_open',
  ONBOARDED: 'ys_onboarded',
}

// Safe JSON parse
const parse = (val, fallback) => {
  try { return val ? JSON.parse(val) : fallback }
  catch { return fallback }
}

// Profile
export const getProfile = () => parse(localStorage.getItem(KEYS.PROFILE), null)
export const saveProfile = (profile) => localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
export const isOnboarded = () => !!localStorage.getItem(KEYS.ONBOARDED)
export const setOnboarded = () => localStorage.setItem(KEYS.ONBOARDED, '1')

// Sessions
export const getSessions = () => parse(localStorage.getItem(KEYS.SESSIONS), [])
export const addSession = (session) => {
  const sessions = getSessions()
  sessions.push({ ...session, id: Date.now(), date: new Date().toISOString() })
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions))
  updateStreak()
  return sessions
}
export const getSessionCount = () => getSessions().length

// Streak
export const updateStreak = () => {
  const today = new Date().toDateString()
  const lastOpen = localStorage.getItem(KEYS.LAST_OPEN)
  const streakData = parse(localStorage.getItem(KEYS.STREAK), { count: 0, lastDate: null })

  if (streakData.lastDate === today) return streakData

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (streakData.lastDate === yesterday.toDateString()) {
    streakData.count += 1
  } else if (streakData.lastDate !== today) {
    streakData.count = 1
  }
  streakData.lastDate = today
  localStorage.setItem(KEYS.STREAK, JSON.stringify(streakData))
  localStorage.setItem(KEYS.LAST_OPEN, today)
  return streakData
}
export const getStreak = () => {
  const streakData = parse(localStorage.getItem(KEYS.STREAK), { count: 0 })
  return streakData.count
}

// Journal recordings (stored as base64)
export const getJournal = () => parse(localStorage.getItem(KEYS.JOURNAL), [])
export const addJournalEntry = (entry) => {
  const journal = getJournal()
  journal.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() })
  // Keep max 30 entries
  if (journal.length > 30) journal.splice(30)
  localStorage.setItem(KEYS.JOURNAL, JSON.stringify(journal))
  return journal
}

// Fear Ladder
export const getFearLadder = () => parse(localStorage.getItem(KEYS.FEAR_LADDER), getDefaultFearLadder())
export const saveFearLadder = (ladder) => localStorage.setItem(KEYS.FEAR_LADDER, JSON.stringify(ladder))
export const completeFearItem = (id) => {
  const ladder = getFearLadder()
  const item = ladder.find(i => i.id === id)
  if (item) {
    item.completed = true
    item.completedDate = new Date().toISOString()
    saveFearLadder(ladder)
    addBraveStar()
  }
  return ladder
}

// Brave Stars
export const getBraveStars = () => parseInt(localStorage.getItem(KEYS.BRAVE_STARS) || '0')
export const addBraveStar = (count = 1) => {
  const current = getBraveStars()
  localStorage.setItem(KEYS.BRAVE_STARS, String(current + count))
  return current + count
}

// Default Fear Ladder
export const getDefaultFearLadder = () => [
  { id: 1, level: 1, situation: 'Say your name out loud to yourself in the mirror', completed: false },
  { id: 2, level: 2, situation: 'Read a sentence out loud while alone', completed: false },
  { id: 3, level: 3, situation: 'Tell someone at home about your day', completed: false },
  { id: 4, level: 4, situation: 'Ask a family member a question', completed: false },
  { id: 5, level: 5, situation: 'Call a friend or sibling by their name and say hello', completed: false },
  { id: 6, level: 5, situation: 'Read a short paragraph to a parent or sibling', completed: false },
  { id: 7, level: 6, situation: 'Introduce yourself to someone new at home', completed: false },
  { id: 8, level: 6, situation: 'Order your own food or drink at a family meal', completed: false },
  { id: 9, level: 7, situation: 'Ask a question in class or a group', completed: false },
  { id: 10, level: 7, situation: 'Tell a joke or funny story to two or more people', completed: false },
  { id: 11, level: 8, situation: 'Speak up in a group conversation without waiting to be asked', completed: false },
  { id: 12, level: 8, situation: 'Answer a phone call from someone you know', completed: false },
  { id: 13, level: 9, situation: 'Introduce yourself to a stranger in a safe setting', completed: false },
  { id: 14, level: 9, situation: 'Ask for help in a shop or public place', completed: false },
  { id: 15, level: 10, situation: 'Speak in front of a group or class', completed: false },
]

// Stats aggregation
export const getStats = () => {
  const sessions = getSessions()
  const streak = getStreak()
  const braveStars = getBraveStars()
  const fearLadder = getFearLadder()
  const completedFear = fearLadder.filter(i => i.completed).length

  const byType = sessions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  return {
    totalSessions: sessions.length,
    streak,
    braveStars,
    fearCompleted: completedFear,
    byType,
    minutesPracticed: Math.round(sessions.length * 5),
  }
}

// Flux responses (offline library)
export const FLUX_RESPONSES = {
  greeting: [
    "Hey! Ready to find your flow today? 🌊",
    "Welcome back! Let's do something brave together.",
    "I'm so glad you're here. Your voice matters — let's use it!",
    "Today is a great day to practice. Small steps lead to big flows!",
    "You showed up — that's already the hardest part. Let's go!",
  ],
  encouragement: [
    "That was genuinely great. You kept going — that's everything.",
    "Did you notice how you pushed through? That's what brave looks like.",
    "Your voice is getting stronger every single day.",
    "I love watching you practice. You're building something real here.",
    "Even when it felt hard, you stayed with it. That's the whole game.",
  ],
  brave: [
    "⭐ BRAVE STAR EARNED! You faced that fear — seriously incredible!",
    "🔥 That took real courage. Another star for your sky!",
    "YES! You did the thing you were afraid of. That's everything!",
    "A BRAVE STAR for you! Fear doesn't get to win today.",
    "⭐ Every brave moment you collect is proof: you are stronger than your stutter.",
  ],
  struggle: [
    "Hard days are part of the journey. I'm not going anywhere.",
    "You don't have to be perfect here. Just present.",
    "Even trying counts. Even 30 seconds of trying counts.",
    "Take a breath with me. We don't rush here.",
    "What if we tried the whisper version first? No pressure.",
  ],
  milestone: [
    "🎉 MILESTONE! Look how far you've come — your sky is filling up!",
    "This is real progress. Not just in speaking — in being brave.",
    "Flux is evolving because YOU are evolving. Keep going!",
    "You've built a real habit now. That's more powerful than any trick.",
  ],
  breathing: [
    "Let's start with breath. Everything good in speech starts here.",
    "Breathe in slowly... hold... and let it go. That's the foundation.",
    "Your breath is your anchor. Find it, and speech follows.",
  ],
  talkTales: [
    "Ooh, I love where this story is going! What happens next?",
    "Your imagination is amazing. Keep telling it — I'm listening.",
    "The best storytellers in history probably stuttered. Keep going.",
    "I want to know what happens next — don't stop now!",
  ],
}

export const getRandomFluxResponse = (category) => {
  const pool = FLUX_RESPONSES[category] || FLUX_RESPONSES.encouragement
  return pool[Math.floor(Math.random() * pool.length)]
}

// Story starters for TalkTales
export const STORY_STARTERS = [
  { id: 1, theme: '🚀 Space', text: "The spaceship landed on a planet nobody had ever visited. The door opened slowly, and out stepped..." },
  { id: 2, theme: '🐉 Dragon', text: "Deep in the mountains, there was a dragon who had never learned to breathe fire. One morning, she discovered..." },
  { id: 3, theme: '🌊 Ocean', text: "The young diver found a glowing chest at the bottom of the sea. When they opened it, they found..." },
  { id: 4, theme: '🏰 Castle', text: "The king of the castle had lost his voice, and only one brave child could find it again. The child's name was..." },
  { id: 5, theme: '🌲 Forest', text: "The trees in the ancient forest could talk, but only to people who listened very quietly. One evening, a child sat down and heard..." },
  { id: 6, theme: '🦁 Safari', text: "The lion who ruled the savanna had a secret: she was afraid of speaking in front of other animals. Until one day..." },
  { id: 7, theme: '🎵 Music', text: "Every note of the magic instrument did something different. When you played the first note, suddenly..." },
  { id: 8, theme: '🏄 Adventure', text: "The wave spoke to the surfer and said: 'I will only carry the brave.' The surfer took a deep breath and replied..." },
]

// Breathing exercises
export const BREATHING_EXERCISES = [
  { id: 'box', name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdOut: 4, rounds: 4, description: 'Equal counts of in, hold, out, hold. Used by athletes to calm nerves before performance.' },
  { id: '478', name: '4-7-8 Calm', inhale: 4, hold: 7, exhale: 8, holdOut: 0, rounds: 3, description: 'Longer exhale activates the parasympathetic nervous system, reducing vocal tension.' },
  { id: 'easy', name: 'Easy Flow', inhale: 3, hold: 1, exhale: 5, holdOut: 0, rounds: 5, description: 'Gentle rhythm specifically designed to prepare the voice for easy onset speaking.' },
]

// SpeakLab exercises
export const SPEAKLAB_EXERCISES = [
  { id: 'easy_onset', name: 'Easy Onset', icon: '🌊', instruction: 'Start each word gently, as if the sound floats in on a wave. No force, no push — just flow.', prompt: 'Say slowly: "All... animals... are... amazing."', tip: 'Let the first sound of each word begin quietly, then grow louder.' },
  { id: 'continuous', name: 'Continuous Flow', icon: '🌬️', instruction: 'Keep the air moving the whole time you speak, like a river that never stops.', prompt: 'Say smoothly: "Every evening... I enjoy... easy speaking."', tip: 'Never let the airflow stop completely between words.' },
  { id: 'slow_rate', name: 'Slow & Steady', icon: '🐢', instruction: 'Speak at half your normal speed. Feel each word land completely before the next begins.', prompt: 'Very slowly say: "I... am... brave... and... I... can... speak."', tip: 'Slower speech gives the brain time to coordinate — it is not weakness.' },
  { id: 'pause', name: 'Power of Pause', icon: '⏸️', instruction: 'Use pauses as a tool. A pause is not a stutter — it is a speaker in control.', prompt: 'Say with deliberate pauses: "Hello... my name is... [your name]... and today I feel... brave."', tip: 'Pausing feels dramatic to you but sounds confident to listeners.' },
  { id: 'prolongation', name: 'Vowel Ease', icon: '🎶', instruction: 'Stretch the vowel sounds slightly — A, E, I, O, U get a little extra time.', prompt: 'Say gently stretching vowels: "Open... your... eyes... and... see."', tip: 'Prolonging vowels prevents the hard stops that trigger blocks.' },
]

// Song Mode songs (simple lyrics)
export const SONGS = [
  {
    id: 1, title: 'Flow Like Water', tempo: 'slow',
    lines: [
      'I flow like water, gentle and free',
      'My voice is mine, it belongs to me',
      'Even when it stumbles, I keep on',
      'Every word I speak makes me strong',
      'Flow... flow... flow like the river',
      'Flow... flow... let your voice deliver',
    ]
  },
  {
    id: 2, title: 'One Breath at a Time', tempo: 'medium',
    lines: [
      'One breath at a time, that is all I need',
      'One word, one moment, one small brave deed',
      'I do not need to rush, the world can wait',
      'My voice is ready, my story is great',
      'Breathe in, breathe out, begin again',
      'Each word I speak is a step I win',
    ]
  },
  {
    id: 3, title: 'Brave Like Me', tempo: 'upbeat',
    lines: [
      'I face the day, I speak my mind',
      'I leave the fear and doubts behind',
      'A stutter does not own my name',
      'I play this speaking game to claim',
      'My voice, my choice, my time to shine',
      'This flow, this moment, it is mine',
    ]
  },
]
