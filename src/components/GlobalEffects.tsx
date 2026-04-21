import { useEffect, useRef, useState } from 'react'
import { setMuted } from '@/lib/audioEngine'

interface Props {
  upsideDown?: boolean
  distorting?: boolean
}

export function GlobalEffects({ upsideDown = false, distorting = false }: Props) {
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [audioMuted, setAudioMuted] = useState(false)
  const [showHiddenMsg, setShowHiddenMsg] = useState(false)
  const [hiddenMsg, setHiddenMsg] = useState('')

  const HIDDEN_MESSAGES = [
    'WE SEE YOU.',
    'YOU CANNOT ESCAPE.',
    'VECNA IS WATCHING.',
    'THE GATE IS OPEN.',
    'IT KNOWS YOUR NAME.',
    'TURN BACK.',
    'YOU ARE NOT ALONE.',
    'THE HIVE MIND IS ACTIVE.',
  ]

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = e.clientX + 'px'
        cursorGlowRef.current.style.top = e.clientY + 'px'
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = e.clientX + 'px'
        cursorDotRef.current.style.top = e.clientY + 'px'
      }
    }
    document.addEventListener('mousemove', move)
    return () => document.removeEventListener('mousemove', move)
  }, [])

  // Random hidden messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setHiddenMsg(HIDDEN_MESSAGES[Math.floor(Math.random() * HIDDEN_MESSAGES.length)])
        setShowHiddenMsg(true)
        setTimeout(() => setShowHiddenMsg(false), 2500)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const toggleAudio = () => {
    const next = !audioMuted
    setAudioMuted(next)
    setMuted(next)
  }

  return (
    <>
      <div ref={cursorGlowRef} className="cursor-glow" />
      <div ref={cursorDotRef} className="cursor-dot" />
      <div className="grain-overlay" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className={`fog-overlay ${upsideDown ? 'opacity-80' : ''}`} />
      <div className={`vine-overlay ${upsideDown ? 'active' : ''}`} />

      {/* Hidden message flash */}
      {showHiddenMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '8rem',
            right: '2rem',
            zIndex: 9940,
            fontFamily: 'var(--mono)',
            fontSize: '0.65rem',
            color: 'rgba(180,20,20,0.7)',
            letterSpacing: '0.2em',
            animation: 'fade-in-slow 0.3s ease, flicker 1s infinite',
            pointerEvents: 'none',
          }}
        >
          {hiddenMsg}
        </div>
      )}

      {/* Bottom marquee */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9945,
          borderTop: '1px solid rgba(140,10,10,0.2)',
          background: 'rgba(3,3,8,0.9)',
          padding: '4px 0',
          pointerEvents: 'none',
        }}
      >
        <div className="marquee">
          <span className="marquee-inner">
            HAWKINS NATIONAL LABORATORY — DEPARTMENT OF ENERGY — CLASSIFIED LEVEL 5 — GATE STATUS: UNSTABLE —
            ENTITY DETECTION: ACTIVE — NEURAL LINK: ESTABLISHED — DO NOT ATTEMPT TO CLOSE CONNECTION —
            HAWKINS NATIONAL LABORATORY — DEPARTMENT OF ENERGY — CLASSIFIED LEVEL 5 — GATE STATUS: UNSTABLE —
          </span>
        </div>
      </div>

      {/* Audio toggle */}
      <button
        className="audio-toggle"
        onClick={toggleAudio}
        title={audioMuted ? 'Unmute' : 'Mute'}
        style={{ marginBottom: '1.5rem' }}
      >
        {audioMuted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(140,10,10,0.6)" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
            <path d="M17 16.95A7 7 0 0 0 5.54 10M19.07 4.93l-1.41 1.41"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(140,10,10,0.8)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>

      {/* Distortion overlay */}
      {distorting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9950,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180,0,0,0.04) 3px, rgba(180,0,0,0.04) 6px)',
            animation: 'distort 0.4s ease-in-out',
          }}
        />
      )}
    </>
  )
}
