import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

let globalAudio = null;

// ─── Generate month list Feb 2024 → Feb 2026 ───────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function generateMonthSlots() {
  const slots = []
  for (let y = 2024; y <= 2026; y++) {
    const startM = (y === 2024) ? 1 : 0  // Feb = index 1
    const endM   = (y === 2026) ? 1 : 11 // Feb = index 1
    for (let m = startM; m <= endM; m++) {
      slots.push({ month: MONTHS[m], year: String(y) })
    }
  }
  return slots
}

const SLOTS = generateMonthSlots()

// ─── Confetti burst ─────────────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#f48fb1','#fce4ec','#e91e8c','#fff8f0','#c8d8b4','#f8bbd0']
  const fire = (opts) =>
    confetti({ particleCount: 60, spread: 80, colors, ...opts })
  fire({ angle: 60,  origin: { x: 0, y: 0.6 } })
  fire({ angle: 120, origin: { x: 1, y: 0.6 } })
  setTimeout(() => fire({ angle: 90, origin: { x: 0.5, y: 0.4 } }), 250)
}

// ─── Floating petals background decoration ──────────────────────────────────
const PETAL_EMOJI = ['🌸','🌷','🌼','🍃','🌺','✿']
function FloatingPetals() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: PETAL_EMOJI[i % PETAL_EMOJI.length],
    left: `${(i * 8.3) % 100}%`,
    delay: i * 0.8,
    duration: 8 + (i % 5),
    size: 16 + (i % 3) * 8,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      overflow: 'hidden', zIndex: 0
    }}>
      {petals.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-60px',
            fontSize: p.size,
            opacity: 0.35,
          }}
          animate={{ y: '110vh', rotate: [0, 360], x: [0, 30, -30, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Mute button ─────────────────────────────────────────────────────────────
function MuteButton({ muted, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        border: '2px solid #f8bbd0',
        borderRadius: '50px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: 20,
        boxShadow: '0 4px 16px rgba(244,143,177,0.25)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Nunito, sans-serif',
        color: '#5c3d2e',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {muted ? '🔇' : '🎵'}
      <span style={{ fontSize: 13, fontWeight: 700 }}>
        {muted ? 'Unmute' : 'Mute'}
      </span>
    </motion.button>
  )
}

// ─── Score badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  return (
    <motion.div
      key={score}
      initial={{ scale: 1.4, y: -4 }}
      animate={{ scale: 1, y: 0 }}
      style={{
        position: 'fixed', top: 20, left: 20, zIndex: 100,
        background: 'linear-gradient(135deg, #f48fb1, #e91e8c)',
        color: 'white',
        borderRadius: '50px',
        padding: '8px 18px',
        fontSize: 14,
        fontWeight: 800,
        fontFamily: 'Comfortaa, sans-serif',
        boxShadow: '0 4px 16px rgba(233,30,140,0.35)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      ✨ {score} correct
    </motion.div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [memories, setMemories]     = useState([])
  const [queue, setQueue]           = useState([])
  const [current, setCurrent]       = useState(null)
  const [sliderIdx, setSliderIdx]   = useState(12) 
  const [phase, setPhase]           = useState('playing') 
  const [score, setScore]           = useState(0)
  const [muted, setMuted]           = useState(false)
  const [loaded, setLoaded]         = useState(false)
  const [gameStarted, setGameStarted] = useState(false) // New state for overlay
  const audioRef = useRef(null)

  // Load memories.json
  useEffect(() => {
    fetch('./memories.json')
      .then(r => r.json())
      .then(data => {
        setMemories(data)
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setQueue(shuffled)
        setCurrent(shuffled[0])
        setLoaded(true)
      })
      .catch(() => {
        const demo = [
          { image: 'https://picsum.photos/seed/picnic1/600/450', month: 'March', year: '2024' },
          { image: 'https://picsum.photos/seed/picnic2/600/450', month: 'July', year: '2024' },
          { image: 'https://picsum.photos/seed/picnic3/600/450', month: 'December', year: '2024' },
          { image: 'https://picsum.photos/seed/picnic4/600/450', month: 'February', year: '2025' },
          { image: 'https://picsum.photos/seed/picnic5/600/450', month: 'September', year: '2025' },
        ]
        setMemories(demo)
        const shuffled = [...demo].sort(() => Math.random() - 0.5)
        setQueue(shuffled)
        setCurrent(shuffled[0])
        setLoaded(true)
      })
  }, [])

  // Mute effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
    }
  }, [muted])

  // Explicit Start Handler
  const handleStartGame = () => {
    setGameStarted(true);
    
    // Initialize audio object if it doesn't exist
    if (!globalAudio) {
      globalAudio = new Audio('./good-neighbors.mp3');
      globalAudio.loop = true;
    }
    
    // THE FIX: Set volume here (0.1 is 10%, 0.2 is 20%)
    globalAudio.volume = 0.15; 
    
    // Directly trigger play on the user click event
    globalAudio.play()
      .then(() => console.log("Music started at lower volume!"))
      .catch(err => console.error("Playback failed:", err));
  };

  const toggleMute = () => {
    if (!globalAudio) return;
    const newMuted = !muted;
    setMuted(newMuted);
    globalAudio.muted = newMuted;
  };

  const selectedSlot = SLOTS[sliderIdx]
  const selectedLabel = `${selectedSlot.month} ${selectedSlot.year}`

  const handleSubmit = useCallback(() => {
    if (!current || phase !== 'playing') return
    const isCorrect =
      selectedSlot.month === current.month &&
      selectedSlot.year  === current.year

    if (isCorrect) {
      launchConfetti()
      setScore(s => s + 1)
      setPhase('correct')
      setTimeout(() => nextPhoto(), 2000)
    } else {
      setPhase('wrong')
      setTimeout(() => setPhase('playing'), 1500)
    }
  }, [current, phase, selectedSlot])

  function nextPhoto() {
    setQueue(prev => {
      const next = prev.length > 1 ? prev.slice(1) : [...memories].sort(() => Math.random() - 0.5)
      setCurrent(next[0])
      setSliderIdx(12)
      setPhase('playing')
      return next
    })
  }

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fff8f0',
        fontFamily: 'Comfortaa, sans-serif', fontSize: 24, color: '#f48fb1',
      }}>
        🌸 Loading memories...
      </div>
    )
  }

  // ─── Start Overlay ────────────────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(160deg, #fff0f5 0%, #fff8f0 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Comfortaa, sans-serif', textAlign: 'center', padding: 20
      }}>
        <FloatingPetals />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'white', padding: '40px 30px', borderRadius: '32px',
            boxShadow: '0 20px 60px rgba(244,143,177,0.2)', border: '2px solid #fce4ec',
            zIndex: 1
          }}
        >
          <h1 style={{ color: '#e91e8c', marginBottom: 12 }}>Hi Fav! 💕</h1>
          <p style={{ color: '#5c3d2e', marginBottom: 30, lineHeight: 1.6 }}>
            I put together a little game of our memories.<br/>Ready to test your memory?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            style={{
              padding: '16px 32px', fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(135deg, #f48fb1 0%, #e91e8c 100%)',
              color: 'white', border: 'none', borderRadius: '50px',
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(233,30,140,0.3)'
            }}
          >
            Enter the Gallery 🌸
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const correctAnswer = phase === 'wrong' ? `${current?.month}` : null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #fff0f5 0%, #fff8f0 50%, #f0f5e8 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
    }}>
      <FloatingPetals />
      <MuteButton muted={muted} onToggle={toggleMute} />
      <ScoreBadge score={score} />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'Comfortaa, sans-serif',
          fontSize: 'clamp(22px, 4vw, 38px)',
          color: '#e91e8c',
          marginBottom: 32,
          textAlign: 'center',
          letterSpacing: '0.5px',
          textShadow: '0 2px 12px rgba(233,30,140,0.18)',
          zIndex: 1,
          position: 'relative',
        }}
      >
        🌸 My Fav Memories 🌸
      </motion.h1>

      {/* Main card */}
      <div style={{
        width: '100%', maxWidth: 580,
        zIndex: 1, position: 'relative',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.image}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              background: 'white',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(244,143,177,0.25), 0 4px 16px rgba(92,61,46,0.08)',
              marginBottom: 24,
              border: '3px solid rgba(248,187,208,0.6)',
              position: 'relative',
            }}
          >
            <div style={{ height: 8, background: 'linear-gradient(90deg, #fce4ec, #f8bbd0, #fce4ec)' }} />

            <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#fce4ec', position: 'relative' }}>
              <img
                src={current?.image?.startsWith('http') ? current.image : `./photos/${current?.image}`}
                alt="Memory"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Correct overlay */}
              <AnimatePresence>
                {phase === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(200,240,180,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                      style={{
                        background: 'white', borderRadius: '999px', padding: '20px 36px',
                        fontFamily: 'Comfortaa, sans-serif', fontSize: 28, color: '#4caf50',
                        fontWeight: 700, boxShadow: '0 8px 32px rgba(76,175,80,0.3)',
                      }}
                    >
                      ✓ You remembered! 💕
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wrong overlay */}
              <AnimatePresence>
                {phase === 'wrong' && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(255,180,180,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 0 }}
                      style={{
                        background: 'white', borderRadius: '999px', padding: '16px 28px',
                        fontFamily: 'Comfortaa, sans-serif', fontSize: 18, color: '#e57373',
                        fontWeight: 700, textAlign: 'center',
                      }}
                    >
                      <div>Not quite! 🌷</div>
                      <div style={{ fontSize: 14, marginTop: 4, color: '#e91e8c' }}>
                        It was in {correctAnswer}...
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ padding: '14px 20px', background: 'white', textAlign: 'center', fontFamily: 'Comfortaa, sans-serif', fontSize: 13, color: '#c8a0a0' }}>
              When was this memory made? 🌸
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.9)', borderRadius: '24px', padding: '28px 32px',
            boxShadow: '0 8px 32px rgba(244,143,177,0.18)', border: '2px solid rgba(248,187,208,0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div key={selectedLabel} initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{
              fontFamily: 'Comfortaa, sans-serif', fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 700,
              background: 'linear-gradient(135deg, #f48fb1, #e91e8c)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block',
            }}>
              {selectedLabel}
            </span>
          </motion.div>

          <div style={{ marginBottom: 8 }}>
            <input
              type="range" min={0} max={SLOTS.length - 1} value={sliderIdx}
              onChange={e => { if (phase === 'playing') setSliderIdx(Number(e.target.value)) }}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#c8a0a0', fontFamily: 'Nunito, sans-serif', marginBottom: 24, fontWeight: 600 }}>
            <span>Feb 2024</span>
            <span>Feb 2025</span>
            <span>Feb 2026</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={handleSubmit} disabled={phase !== 'playing'}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
              fontFamily: 'Comfortaa, sans-serif', fontSize: 18, fontWeight: 700, color: 'white',
              background: phase !== 'playing' ? '#f8bbd0' : 'linear-gradient(135deg, #f48fb1 0%, #e91e8c 100%)',
              cursor: phase !== 'playing' ? 'default' : 'pointer', boxShadow: '0 6px 20px rgba(233,30,140,0.3)',
            }}
          >
            {phase === 'correct' ? '✨ Correct! Moving on...' : phase === 'wrong' ? '💭 Try again soon!' : '🌸 Submit Guess'}
          </motion.button>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={nextPhoto} style={{ background: 'transparent', border: 'none', color: '#c8a0a0', fontFamily: 'Nunito, sans-serif', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            skip this one →
          </button>
        </div>
      </div>

      <div style={{ marginTop: 40, zIndex: 1, position: 'relative', fontFamily: 'Comfortaa, sans-serif', fontSize: 12, color: '#d4a0b0', textAlign: 'center' }}>
        made for a cutie
      </div>
    </div>
  )
}