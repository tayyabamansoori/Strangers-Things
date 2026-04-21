import { useState, useEffect, useCallback, useRef } from 'react'
import { playGlitch, playSuccess, playError, startHeartbeat, stopHeartbeat } from '@/lib/audioEngine'

interface Props {
  playerName: string
  onComplete: (achievement: string) => void
  onBack: () => void
}

type Phase = 'intro' | 'puzzle1_memory' | 'puzzle2_logic' | 'puzzle3_pattern' | 'completed'

// Memory puzzle - remember and reproduce sequence
const SEQUENCE_LENGTH_START = 4
const SYMBOLS = ['X', 'O', 'T', 'Z', 'V', 'E', 'N']

function generateSequence(len: number) {
  return Array.from({ length: len }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
}

// Logic puzzle - find the pattern
const LOGIC_PUZZLES = [
  {
    question: "What number comes next? 2, 4, 8, 16, ___",
    answer: "32",
    hint: "Each number doubles"
  },
  {
    question: "What letter comes next? V, E, C, N, ___",
    answer: "A",
    hint: "VECNA"
  },
  {
    question: "The gate opens when: 1+1=2, 2+2=4, 3+3=6, 4+4=___",
    answer: "8",
    hint: "Simple math"
  },
]

// Pattern puzzle - which symbol breaks the pattern
const PATTERN_PUZZLES = [
  {
    sequence: ['X', 'X', 'O', 'X', 'X', 'O', 'X', 'X', '?'],
    answer: 'O',
    options: ['X', 'O', 'V', 'Z'],
  },
  {
    sequence: ['1', '3', '5', '7', '9', '?'],
    answer: '11',
    options: ['10', '11', '12', '13'],
  },
]

export function VecnasCurse({ playerName, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [systemMsg, setSystemMsg] = useState('')
  const [showSystemMsg, setShowSystemMsg] = useState(false)

  // Memory puzzle state
  const [sequence, setSequence] = useState<string[]>([])
  const [_userSeq, setUserSeq] = useState<string[]>([])
  const [showSeq, setShowSeq] = useState(false)
  const [currentHighlight, setCurrentHighlight] = useState(-1)
  const [seqInput, setSeqInput] = useState('')
  const [memScore, setMemScore] = useState(0)
  const [memRound, setMemRound] = useState(0)
  const memRef = useRef({ showing: false })

  // Logic puzzle state
  const [logicIdx, setLogicIdx] = useState(0)
  const [logicAnswer, setLogicAnswer] = useState('')
  const [logicStatus, setLogicStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [_logicScore, setLogicScore] = useState(0)

  // Pattern puzzle state
  const [patternIdx, setPatternIdx] = useState(0)
  const [_patternScore, setPatternScore] = useState(0)
  const [patternStatus, setPatternStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const [shake, setShake] = useState(false)

  const SYSTEM_MSGS = [
    `ACCESSING YOUR SYSTEM...`,
    `SCANNING NEURAL PATTERNS... ${playerName.toUpperCase()}`,
    `CONNECTION UNSTABLE — ENTITY DETECTED`,
    `${playerName.toUpperCase()}... WE SEE YOU.`,
    `VECNA IS WATCHING. DO NOT STOP.`,
    `NEURAL LINK ACTIVE — RESISTANCE IS FUTILE`,
  ]

  const flashSystemMsg = useCallback(() => {
    const msg = SYSTEM_MSGS[Math.floor(Math.random() * SYSTEM_MSGS.length)]
    setSystemMsg(msg)
    setShowSystemMsg(true)
    playGlitch()
    setTimeout(() => setShowSystemMsg(false), 2500)
  }, [playerName])

  useEffect(() => {
    const interval = setInterval(flashSystemMsg, 8000 + Math.random() * 6000)
    flashSystemMsg()
    return () => clearInterval(interval)
  }, [flashSystemMsg])

  // Start memory puzzle
  const startMemoryRound = useCallback((round: number) => {
    if (round >= 3) {
      setPhase('puzzle2_logic')
      return
    }
    const len = SEQUENCE_LENGTH_START + round
    const seq = generateSequence(len)
    setSequence(seq)
    setUserSeq([])
    setSeqInput('')
    setMemRef_showing(true)

    // Show sequence one by one
    let i = 0
    setShowSeq(true)
    const interval = setInterval(() => {
      if (i < seq.length) {
        setCurrentHighlight(i)
        i++
      } else {
        clearInterval(interval)
        setCurrentHighlight(-1)
        setShowSeq(false)
        setMemRef_showing(false)
      }
    }, 600)
  }, [])

  function setMemRef_showing(v: boolean) { memRef.current.showing = v }

  const submitMemory = () => {
    const input = seqInput.toUpperCase().split('').filter(c => SYMBOLS.includes(c))
    const correct = sequence.every((s, i) => s === input[i]) && input.length === sequence.length
    if (correct) {
      playSuccess()
      setMemScore(s => s + 1)
      setMemRound(r => {
        const next = r + 1
        setTimeout(() => startMemoryRound(next), 1000)
        return next
      })
    } else {
      playError()
      setShake(true)
      setTimeout(() => setShake(false), 500)
      startMemoryRound(memRound)
    }
    setSeqInput('')
  }

  const submitLogic = () => {
    const puzzle = LOGIC_PUZZLES[logicIdx]
    if (logicAnswer.trim() === puzzle.answer) {
      playSuccess()
      setLogicStatus('correct')
      setLogicScore(s => s + 1)
      setTimeout(() => {
        setLogicStatus('idle')
        setLogicAnswer('')
        if (logicIdx + 1 >= LOGIC_PUZZLES.length) {
          setPhase('puzzle3_pattern')
        } else {
          setLogicIdx(i => i + 1)
        }
      }, 1200)
    } else {
      playError()
      setLogicStatus('wrong')
      setShake(true)
      setTimeout(() => { setLogicStatus('idle'); setShake(false) }, 1000)
    }
  }

  const submitPattern = (choice: string) => {
    const puzzle = PATTERN_PUZZLES[patternIdx]
    if (choice === puzzle.answer) {
      playSuccess()
      setPatternStatus('correct')
      setPatternScore(s => s + 1)
      setTimeout(() => {
        setPatternStatus('idle')
        if (patternIdx + 1 >= PATTERN_PUZZLES.length) {
          stopHeartbeat()
          setPhase('completed')
        } else {
          setPatternIdx(i => i + 1)
        }
      }, 1200)
    } else {
      playError()
      setPatternStatus('wrong')
      setShake(true)
      setTimeout(() => { setPatternStatus('idle'); setShake(false) }, 1000)
    }
  }

  useEffect(() => {
    if (phase === 'puzzle3_pattern') {
      startHeartbeat(70)
    }
    return () => { if (phase === 'puzzle3_pattern') stopHeartbeat() }
  }, [phase])

  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, rgba(60,5,5,0.4) 0%, var(--deep-void) 70%)',
    padding: '2rem',
    position: 'relative',
  }

  return (
    <div style={bgStyle} className={shake ? 'screen-shake' : ''}>
      {/* System message overlay */}
      {showSystemMsg && (
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9900, fontFamily: 'var(--mono)', fontSize: '0.9rem',
          color: 'var(--blood-bright)', letterSpacing: '0.2em',
          textShadow: '0 0 20px rgba(200,30,30,0.8)',
          animation: 'fade-in 0.2s ease',
          pointerEvents: 'none',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          [ {systemMsg} ]
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--blood)', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
            HAWKINS LAB — VECNA PROTOCOL — SUBJECT: {playerName.toUpperCase()}
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--blood-bright)' }}
            data-text="VECNA'S CURSE">
            VECNA'S CURSE
          </h1>
          <div className="stripe-divider" />
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', lineHeight: 2, marginBottom: '2rem', color: 'var(--text-dim)' }}>
              <p style={{ color: 'var(--blood-bright)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                {playerName}... you have been chosen.
              </p>
              <p>Vecna's curse binds those who cannot overcome their fears.</p>
              <p>To break free, you must prove your mind is stronger.</p>
              <p style={{ marginTop: '1rem' }}>Three trials await. Fail, and the connection deepens.</p>
              <p style={{ marginTop: '1rem', color: 'rgba(180,20,20,0.5)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                TRIAL I: MEMORY — TRIAL II: LOGIC — TRIAL III: PATTERN
              </p>
            </div>
            <button className="btn-horror" onClick={() => { setPhase('puzzle1_memory'); startMemoryRound(0) }}>
              ACCEPT THE CHALLENGE
            </button>
          </div>
        )}

        {/* MEMORY PUZZLE */}
        {phase === 'puzzle1_memory' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
              TRIAL I — MEMORY TEST — ROUND {memRound + 1}/3 — SCORE: {memScore}
            </div>
            <div className="card-horror" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                Memorize the sequence. Then reproduce it exactly.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {sequence.map((sym, i) => (
                  <div
                    key={i}
                    className={`memory-cell ${showSeq && currentHighlight === i ? 'active' : ''} ${!showSeq && memRound > 0 ? '' : ''}`}
                    style={{
                      width: '52px', height: '52px',
                      fontSize: showSeq ? '1.4rem' : '0',
                      color: currentHighlight === i ? '#fff' : 'var(--blood-bright)',
                      transition: 'all 0.3s',
                    }}
                  >
                    {showSeq ? sym : '?'}
                  </div>
                ))}
              </div>
              {!showSeq && (
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Type the sequence (e.g., XOTVZE):
                  </p>
                  <input
                    className="input-horror"
                    style={{ maxWidth: '300px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem', textTransform: 'uppercase' }}
                    value={seqInput}
                    onChange={e => setSeqInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && submitMemory()}
                    placeholder="_ _ _ _"
                    maxLength={sequence.length + 2}
                  />
                  <button className="btn-horror" onClick={submitMemory} style={{ marginTop: '0.5rem' }}>
                    SUBMIT
                  </button>
                </div>
              )}
              {showSeq && (
                <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--blood)', fontSize: '0.85rem' }}>
                  MEMORIZE...
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOGIC PUZZLE */}
        {phase === 'puzzle2_logic' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
              TRIAL II — LOGIC DECRYPTION — PUZZLE {logicIdx + 1}/{LOGIC_PUZZLES.length}
            </div>
            <div className="card-horror" style={{ padding: '2rem' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {LOGIC_PUZZLES[logicIdx].question}
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="input-horror"
                  style={{ maxWidth: '200px' }}
                  value={logicAnswer}
                  onChange={e => setLogicAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitLogic()}
                  placeholder="YOUR ANSWER"
                />
                <button className="btn-horror" onClick={submitLogic}>CONFIRM</button>
              </div>
              {logicStatus === 'correct' && (
                <p style={{ color: '#00cc66', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  CORRECT. THE GATE RESPONDS.
                </p>
              )}
              {logicStatus === 'wrong' && (
                <p style={{ color: 'var(--blood-glow)', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  WRONG. VECNA TIGHTENS HIS GRIP.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PATTERN PUZZLE */}
        {phase === 'puzzle3_pattern' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--blood)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
              TRIAL III — PATTERN RECOGNITION — FINAL TRIAL
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(180,20,20,0.5)', marginBottom: '1rem' }}>
              HEARTBEAT DETECTED — VECNA APPROACHES
            </div>
            <div className="card-horror" style={{ padding: '2rem' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                Complete the pattern:
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {PATTERN_PUZZLES[patternIdx].sequence.map((s, i) => (
                  <div key={i} style={{
                    padding: '8px 14px',
                    border: `1px solid ${s === '?' ? 'var(--blood-bright)' : 'rgba(140,10,10,0.3)'}`,
                    fontFamily: 'var(--mono)',
                    fontSize: '1.1rem',
                    color: s === '?' ? 'var(--blood-glow)' : 'var(--text-primary)',
                    background: s === '?' ? 'rgba(140,10,10,0.15)' : 'transparent',
                    animation: s === '?' ? 'pulse-red 1s infinite' : 'none',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}>
                    {s}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {PATTERN_PUZZLES[patternIdx].options.map(opt => (
                  <button
                    key={opt}
                    className="btn-horror"
                    onClick={() => submitPattern(opt)}
                    style={{ minWidth: '60px' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {patternStatus === 'correct' && (
                <p style={{ color: '#00cc66', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  PATTERN BROKEN. THE CURSE WEAKENS.
                </p>
              )}
              {patternStatus === 'wrong' && (
                <p style={{ color: 'var(--blood-glow)', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  INCORRECT. THE CURSE STRENGTHENS.
                </p>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {phase === 'completed' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--blood)', letterSpacing: '0.3em', marginBottom: '1rem' }}>
                CONNECTION SEVERED
              </div>
              <h2 className="horror-title" style={{ fontSize: '2.5rem', color: '#00cc66', marginBottom: '1rem' }}
                data-text="YOU BROKE VECNA'S CONTROL">
                YOU BROKE VECNA'S CONTROL
              </h2>
              <p style={{ fontFamily: 'var(--crimson)', color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
                Your mind was stronger. The curse is broken. But Vecna does not forget, {playerName}.
              </p>
              <div className="achievement" style={{ margin: '0 auto 2rem', display: 'inline-flex' }}>
                ACHIEVEMENT UNLOCKED: ELITE SURVIVOR
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-horror" onClick={() => onComplete('ELITE SURVIVOR')}>
                CLAIM REWARD
              </button>
              <button className="btn-horror" onClick={onBack} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}
          >
            [ ABORT MISSION ]
          </button>
        </div>
      </div>
    </div>
  )
}
