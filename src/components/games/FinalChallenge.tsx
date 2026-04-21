import { useState, useEffect, useRef, useCallback } from 'react'
import { playGlitch, playSuccess, playError, startHeartbeat, stopHeartbeat, setTension } from '@/lib/audioEngine'

interface Props {
  playerName: string
  onComplete: (achievement: string) => void
  onBack: () => void
}

type Phase = 'intro' | 'challenge1' | 'challenge2' | 'challenge3' | 'boss_moment' | 'completed'

// Challenge 1: Color sequence memory under time pressure
const COLORS = [
  { id: 'red', bg: '#8b0000', glow: '#ff2222' },
  { id: 'blue', bg: '#0022aa', glow: '#2244ff' },
  { id: 'green', bg: '#006622', glow: '#00ff44' },
  { id: 'white', bg: '#888888', glow: '#ffffff' },
]

// Challenge 2: Logic under pressure
const PRESSURE_PUZZLES = [
  { q: "Vecna's number is: 1, 1, 2, 3, 5, 8, ___", a: "13" },
  { q: "The gate opens in sequence: A=1, B=2, C=3... Z=?", a: "26" },
  { q: "11 reversed + 11 = ?", a: "33" },
]

// Challenge 3: Boss final test - type exact phrase
const BOSS_PHRASE = "I AM NOT AFRAID OF YOU"

function genColorSeq(len: number) {
  return Array.from({ length: len }, () => COLORS[Math.floor(Math.random() * COLORS.length)])
}

export function FinalChallenge({ playerName, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [shake, setShake] = useState(false)
  const [blur, setBlur] = useState(false)

  // Challenge 1
  const [colorSeq, setColorSeq] = useState<typeof COLORS>([])
  const [showColors, setShowColors] = useState(false)
  const [currentColor, setCurrentColor] = useState(-1)
  const [colorInput, setColorInput] = useState<typeof COLORS>([])
  const [colorRound, setColorRound] = useState(0)

  // Challenge 2
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [puzzleAnswer, setPuzzleAnswer] = useState('')
  const [puzzleStatus, setPuzzleStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [_puzzleScore, setPuzzleScore] = useState(0)

  // Challenge 3 - Boss
  const [bossInput, setBossInput] = useState('')
  const [_bossShowing, setBossShowing] = useState(false)
  const [_countdown, _setCountdown] = useState(10)

  const bpm = useRef(70)

  const triggerStress = useCallback(() => {
    setShake(true)
    setBlur(true)
    playGlitch()
    setTimeout(() => { setShake(false); setBlur(false) }, 500)
  }, [])

  // Timer
  const startTimer = useCallback((seconds: number) => {
    setTimeLeft(seconds)
    setTimerActive(true)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        // Increase tension as time decreases
        const tension = Math.max(0, 10 - Math.floor(next * 10 / seconds))
        setTension(tension)
        bpm.current = 70 + tension * 8
        startHeartbeat(bpm.current)
        if (next <= 5) {
          setShake(true)
          setBlur(true)
          setTimeout(() => { setShake(false); setBlur(false) }, 200)
          playGlitch()
        }
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimerActive(false)
          setTension(0)
          stopHeartbeat()
          return 0
        }
        return next
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopHeartbeat()
      setTension(0)
    }
  }, [])

  // Color sequence challenge
  const startColorRound = (round: number) => {
    if (round >= 3) {
      if (timerRef.current) clearInterval(timerRef.current)
      stopHeartbeat()
      setPhase('challenge2')
      return
    }
    const len = 3 + round
    const seq = genColorSeq(len)
    setColorSeq(seq)
    setColorInput([])
    setShowColors(true)
    startTimer(20 + round * 5)

    let i = 0
    const interval = setInterval(() => {
      setCurrentColor(i)
      i++
      if (i > seq.length) {
        clearInterval(interval)
        setCurrentColor(-1)
        setShowColors(false)
      }
    }, 700)
  }

  const handleColorClick = (color: typeof COLORS[0]) => {
    if (showColors) return
    const next = [...colorInput, color]
    setColorInput(next)
    if (next.length === colorSeq.length) {
      const correct = colorSeq.every((c, i) => c.id === next[i].id)
      if (correct) {
        playSuccess()
        setColorRound(r => {
          const nextR = r + 1
          setTimeout(() => startColorRound(nextR), 800)
          return nextR
        })
      } else {
        playError()
        triggerStress()
        setTimeout(() => {
          setColorInput([])
          startColorRound(colorRound)
        }, 800)
      }
    }
  }

  const submitPuzzle = () => {
    const puzzle = PRESSURE_PUZZLES[puzzleIdx]
    if (puzzleAnswer.trim() === puzzle.a) {
      playSuccess()
      setPuzzleStatus('correct')
      setPuzzleScore(s => s + 1)
      setTimeout(() => {
        setPuzzleStatus('idle')
        setPuzzleAnswer('')
        if (puzzleIdx + 1 >= PRESSURE_PUZZLES.length) {
          if (timerRef.current) clearInterval(timerRef.current)
          stopHeartbeat()
          setPhase('challenge3')
          setTimeout(() => {
            setBossShowing(true)
            startTimer(60)
          }, 500)
        } else {
          setPuzzleIdx(i => i + 1)
        }
      }, 800)
    } else {
      playError()
      setPuzzleStatus('wrong')
      triggerStress()
      setTimeout(() => setPuzzleStatus('idle'), 800)
    }
  }

  const submitBossPhrase = () => {
    if (bossInput.toUpperCase() === BOSS_PHRASE) {
      if (timerRef.current) clearInterval(timerRef.current)
      stopHeartbeat()
      setTension(0)
      playSuccess()
      setPhase('boss_moment')
      setTimeout(() => setPhase('completed'), 2000)
    } else {
      playError()
      triggerStress()
    }
  }


  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, rgba(80,0,0,0.5) 0%, var(--deep-void) 60%)',
    padding: '2rem',
    position: 'relative',
    filter: blur ? 'blur(2px) brightness(1.3)' : 'none',
    transition: 'filter 0.2s',
  }

  return (
    <div style={bgStyle} className={shake ? 'screen-shake' : ''}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--blood)', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
            FINAL CONFRONTATION — VECNA'S DOMAIN
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--blood-bright)' }}
            data-text="VECNA'S FINAL CHALLENGE">
            VECNA'S FINAL CHALLENGE
          </h1>

          {/* Timer */}
          {timerActive && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div className={`countdown`} style={{
                fontFamily: 'var(--display)', fontSize: '2rem',
                color: timeLeft <= 10 ? 'var(--blood-glow)' : 'var(--blood-bright)',
                textShadow: timeLeft <= 10 ? '0 0 20px var(--blood-glow)' : 'none',
                animation: timeLeft <= 10 ? 'countdown-pulse 0.5s ease-in-out infinite' : 'none',
              }}>
                {timeLeft}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>SECONDS REMAIN</div>
            </div>
          )}

          <div className="stripe-divider" />
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div className="card-horror" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto 2rem', borderColor: 'rgba(180,10,10,0.5)' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', lineHeight: 2, marginBottom: '1.5rem' }}>
                {playerName}. You have faced Vecna's trials.<br />
                Now comes the final confrontation.<br />
                <span style={{ color: 'var(--blood-bright)' }}>Three challenges. One chance. No mercy.</span><br />
                The clock is your enemy. Your mind is your weapon.
              </p>
              <button className="btn-horror" style={{ borderColor: 'var(--blood-bright)' }}
                onClick={() => { setPhase('challenge1'); startColorRound(0) }}>
                FACE VECNA
              </button>
            </div>
          </div>
        )}

        {/* COLOR SEQUENCE */}
        {phase === 'challenge1' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              FINAL TRIAL I — COLOR SEQUENCE — ROUND {colorRound + 1}/3
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {colorSeq.map((c, i) => (
                <div key={i} style={{
                  width: '60px', height: '60px',
                  background: showColors && currentColor === i ? c.bg : 'rgba(20,5,5,0.8)',
                  border: `2px solid ${showColors && currentColor === i ? c.glow : 'rgba(140,10,10,0.3)'}`,
                  borderRadius: '4px',
                  boxShadow: showColors && currentColor === i ? `0 0 20px ${c.glow}` : 'none',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
            {!showColors && (
              <div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Reproduce the sequence — {colorInput.length}/{colorSeq.length}
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleColorClick(c)}
                      style={{
                        width: '70px', height: '70px',
                        background: c.bg,
                        border: `2px solid ${c.glow}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: `0 0 10px ${c.glow}40`,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                    />
                  ))}
                </div>
              </div>
            )}
            {showColors && (
              <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--blood)', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
                MEMORIZING...
              </p>
            )}
          </div>
        )}

        {/* LOGIC PRESSURE */}
        {phase === 'challenge2' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              FINAL TRIAL II — LOGIC UNDER PRESSURE — {puzzleIdx + 1}/{PRESSURE_PUZZLES.length}
            </div>
            <div className="card-horror" style={{ padding: '2rem', borderColor: 'rgba(180,10,10,0.5)' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {PRESSURE_PUZZLES[puzzleIdx].q}
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="input-horror"
                  style={{ maxWidth: '200px', borderColor: 'rgba(180,10,10,0.5)' }}
                  value={puzzleAnswer}
                  onChange={e => setPuzzleAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitPuzzle()}
                  placeholder="ANSWER"
                  autoFocus
                />
                <button className="btn-horror" style={{ borderColor: 'var(--blood-bright)' }} onClick={submitPuzzle}>
                  SUBMIT
                </button>
              </div>
              {puzzleStatus === 'correct' && (
                <p style={{ color: '#00cc66', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  CORRECT. VECNA STAGGERS.
                </p>
              )}
              {puzzleStatus === 'wrong' && (
                <p style={{ color: 'var(--blood-glow)', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  WRONG. THE VINES TIGHTEN.
                </p>
              )}
            </div>
          </div>
        )}

        {/* BOSS PHRASE */}
        {phase === 'challenge3' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              FINAL TRIAL III — CONFRONT VECNA — TYPE YOUR DEFIANCE
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--display)', fontSize: 'clamp(1rem, 3vw, 1.8rem)',
                color: 'rgba(180,20,20,0.6)', letterSpacing: '0.2em', marginBottom: '1rem',
                textShadow: '0 0 30px rgba(180,20,20,0.4)',
                animation: 'flicker 2s infinite',
              }}>
                TYPE EXACTLY:<br />
                <span style={{ color: 'var(--blood-bright)', fontSize: '0.8em' }}>{BOSS_PHRASE}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <input
                className="input-horror"
                style={{
                  maxWidth: '500px',
                  textAlign: 'center',
                  fontSize: '1rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderColor: bossInput.length > 0 && BOSS_PHRASE.startsWith(bossInput.toUpperCase()) ? '#00cc66' : 'rgba(180,10,10,0.5)',
                }}
                value={bossInput}
                onChange={e => setBossInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && submitBossPhrase()}
                placeholder="FACE YOUR FEAR..."
                autoFocus
              />
              <button className="btn-horror" style={{ borderColor: 'var(--blood-bright)' }} onClick={submitBossPhrase}>
                DEFY VECNA
              </button>
            </div>
          </div>
        )}

        {/* BOSS MOMENT */}
        {phase === 'boss_moment' && (
          <div style={{ textAlign: 'center', animation: 'fade-in-slow 1s ease' }}>
            <div className="glitch-text horror-title" data-text="VECNA IS DEFEATED" style={{ fontSize: '3rem', color: '#00cc66' }}>
              VECNA IS DEFEATED
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {phase === 'completed' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#00cc66', letterSpacing: '0.3em', marginBottom: '1rem' }}>
                THE FINAL BATTLE — ENDED
              </div>
              <h2 className="horror-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#00cc66', marginBottom: '1rem' }}
                data-text="YOU DEFEATED VECNA">
                YOU DEFEATED VECNA
              </h2>
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
                {playerName}. The entity is banished. Hawkins is safe. For now.<br />
                You have earned the right to speak with Eleven.
              </p>
              <div className="achievement" style={{ margin: '0 auto 2rem', display: 'inline-flex', borderColor: '#00cc66', color: '#00cc66' }}>
                VECNA SLAYER — ELITE SURVIVOR
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-horror" style={{ borderColor: '#00cc66', color: '#00cc66' }}
                onClick={() => onComplete('VECNA SLAYER')}>
                SPEAK WITH ELEVEN
              </button>
              <button className="btn-horror" onClick={onBack} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button onClick={onBack} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}>
            [ RETREAT ]
          </button>
        </div>
      </div>
    </div>
  )
}
