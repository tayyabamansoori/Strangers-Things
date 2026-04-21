import { useState, useEffect } from 'react'
import { playGlitch, playSuccess, playError } from '@/lib/audioEngine'

interface Props {
  playerName: string
  onComplete: (achievement: string) => void
  onBack: () => void
}

type Phase = 'intro' | 'sequence_test' | 'prediction' | 'pattern_test' | 'awakening' | 'completed'

const SEQUENCE_ITEMS = ['circle', 'triangle', 'square', 'star', 'wave']
const SHAPES = {
  circle: (
    <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  triangle: (
    <svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,4 36,36 4,36" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  square: (
    <svg width="40" height="40" viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  star: (
    <svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,3 24.9,14.1 37,14.1 27.3,21.5 31,33 20,26.2 9,33 12.7,21.5 3,14.1 15.1,14.1" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  wave: (
    <svg width="40" height="40" viewBox="0 0 40 40"><path d="M2,20 Q8,10 14,20 Q20,30 26,20 Q32,10 38,20" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
}

function generateSequence(len: number) {
  return Array.from({ length: len }, () => SEQUENCE_ITEMS[Math.floor(Math.random() * SEQUENCE_ITEMS.length)])
}

const PREDICTION_CARDS = ['circle', 'triangle', 'square', 'star', 'wave']

export function ElevenTestLab({ playerName, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [powerLevel, setPowerLevel] = useState(0)

  // Sequence test
  const [sequence, setSequence] = useState<string[]>([])
  const [showingSeq, setShowingSeq] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [userChoices, setUserChoices] = useState<string[]>([])
  const [seqRound, setSeqRound] = useState(0)
  const [_seqScore, setSeqScore] = useState(0)

  // Prediction
  const [hiddenCard, setHiddenCard] = useState('')
  const [predictionStatus, setPredictionStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [predictionRound, setPredictionRound] = useState(0)
  const [_predictionScore, setPredictionScore] = useState(0)

  // Pattern test
  const [patternSeq, setPatternSeq] = useState<string[]>([])
  const [patternInput, setPatternInput] = useState<string[]>([])
  const [_patternStatus, setPatternStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  // Energy burst
  const [energyBurst, setEnergyBurst] = useState(false)
  const [shake, setShake] = useState(false)
  const [labMessages, setLabMessages] = useState<string[]>([])

  const LAB_MSGS = [
    `SUBJECT ${playerName.toUpperCase()} — NEURAL ACTIVITY ELEVATED`,
    'TELEKINETIC POTENTIAL: MEASURABLE',
    'HAWKINS LAB — TEST SEQUENCE ACTIVE',
    'DR. BRENNER OBSERVING — REMAIN CALM',
    'PSYCHIC LINK ESTABLISHING...',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setLabMessages(prev => {
        const msg = LAB_MSGS[Math.floor(Math.random() * LAB_MSGS.length)]
        return [...prev.slice(-3), msg]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const triggerEnergyBurst = () => {
    setEnergyBurst(true)
    setShake(true)
    playGlitch()
    setPowerLevel(p => Math.min(100, p + 20))
    setTimeout(() => { setEnergyBurst(false); setShake(false) }, 800)
  }

  // Sequence test logic
  const startSequence = (round: number) => {
    if (round >= 3) {
      setPhase('prediction')
      return
    }
    const len = 3 + round
    const seq = generateSequence(len)
    setSequence(seq)
    setUserChoices([])
    setShowingSeq(true)

    let i = 0
    const interval = setInterval(() => {
      setCurrentIdx(i)
      i++
      if (i > seq.length) {
        clearInterval(interval)
        setCurrentIdx(-1)
        setShowingSeq(false)
      }
    }, 700)
  }

  const handleSeqChoice = (shape: string) => {
    if (showingSeq || userChoices.length >= sequence.length) return
    const newChoices = [...userChoices, shape]
    setUserChoices(newChoices)

    if (newChoices.length === sequence.length) {
      const correct = sequence.every((s, i) => s === newChoices[i])
      if (correct) {
        playSuccess()
        triggerEnergyBurst()
        setSeqScore(s => s + 1)
        setTimeout(() => {
          const next = seqRound + 1
          setSeqRound(next)
          startSequence(next)
        }, 1200)
      } else {
        playError()
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setTimeout(() => {
          setUserChoices([])
          startSequence(seqRound)
        }, 1000)
      }
    }
  }

  // Prediction logic
  useEffect(() => {
    if (phase === 'prediction') {
      setHiddenCard(PREDICTION_CARDS[Math.floor(Math.random() * PREDICTION_CARDS.length)])
    }
  }, [phase, predictionRound])

  const handlePrediction = (choice: string) => {
    if (choice === hiddenCard) {
      playSuccess()
      triggerEnergyBurst()
      setPredictionScore(s => s + 1)
      setPredictionStatus('correct')
    } else {
      playError()
      setPredictionStatus('wrong')
    }
    setTimeout(() => {
      setPredictionStatus('idle')
      if (predictionRound + 1 >= 3) {
        setPhase('pattern_test')
        setPatternSeq(generateSequence(5))
      } else {
        setPredictionRound(r => r + 1)
        setHiddenCard(PREDICTION_CARDS[Math.floor(Math.random() * PREDICTION_CARDS.length)])
      }
    }, 1200)
  }

  const handlePatternClick = (shape: string) => {
    const next = [...patternInput, shape]
    setPatternInput(next)
    if (next.length === patternSeq.length) {
      const correct = patternSeq.every((s, i) => s === next[i])
      if (correct) {
        playSuccess()
        triggerEnergyBurst()
        setPatternStatus('correct')
        setTimeout(() => setPhase('awakening'), 1500)
      } else {
        playError()
        setPatternStatus('wrong')
        setTimeout(() => {
          setPatternStatus('idle')
          setPatternInput([])
          setPatternSeq(generateSequence(5))
        }, 1000)
      }
    }
  }

  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, rgba(20,10,60,0.6) 0%, var(--deep-void) 70%)',
    padding: '2rem',
    position: 'relative',
  }

  return (
    <div style={bgStyle} className={shake ? 'screen-shake' : ''}>
      {/* Energy burst rings */}
      {energyBurst && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 9900 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="energy-ring" style={{
              width: `${100 + i * 80}px`,
              height: `${100 + i * 80}px`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ice-blue)', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
            HAWKINS NATIONAL LABORATORY — ROOM 011 — SUBJECT: {playerName.toUpperCase()}
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--electric-blue)' }}
            data-text="ELEVEN TEST LAB">
            ELEVEN TEST LAB
          </h1>
          {/* Power meter */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>PSYCHIC POWER</span>
            <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{
                width: `${powerLevel}%`, height: '100%',
                background: `linear-gradient(90deg, var(--ice-blue), var(--electric-blue))`,
                transition: 'width 0.5s ease',
                boxShadow: '0 0 10px rgba(50,100,220,0.6)',
                borderRadius: '2px',
              }} />
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--electric-blue)' }}>{powerLevel}%</span>
          </div>
          <div className="stripe-divider" style={{ background: 'linear-gradient(90deg, transparent, var(--ice-blue), var(--electric-blue), transparent)' }} />
        </div>

        {/* Lab log */}
        <div style={{ marginBottom: '1.5rem', height: '60px', overflow: 'hidden' }}>
          {labMessages.map((msg, i) => (
            <div key={i} style={{
              fontFamily: 'var(--mono)', fontSize: '0.65rem',
              color: 'rgba(50,100,220,0.5)', letterSpacing: '0.15em',
              animation: 'fade-in 0.5s ease',
            }}>
              &gt; {msg}
            </div>
          ))}
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div className="card-horror" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto 2rem', borderColor: 'rgba(30,60,180,0.3)' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', lineHeight: 2, marginBottom: '1.5rem' }}>
                Welcome to Room 011, {playerName}.<br />
                Your psychic potential has been detected.<br />
                Complete the lab tests to activate your powers.<br />
                Dr. Brenner is watching. Do not fail.
              </p>
              <button className="btn-horror" style={{ borderColor: 'var(--ice-blue)' }}
                onClick={() => { setPhase('sequence_test'); startSequence(0) }}>
                BEGIN TESTING
              </button>
            </div>
          </div>
        )}

        {/* SEQUENCE TEST */}
        {phase === 'sequence_test' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ice-blue)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              TEST I — MEMORY SEQUENCE — ROUND {seqRound + 1}/3
            </div>
            {/* Show sequence */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {showingSeq ? (
                sequence.map((s, i) => (
                  <div key={i} style={{
                    width: '60px', height: '60px',
                    border: `1px solid ${currentIdx === i ? 'var(--electric-blue)' : 'rgba(30,60,180,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: currentIdx === i ? '#fff' : 'transparent',
                    background: currentIdx === i ? 'rgba(30,60,180,0.3)' : 'transparent',
                    boxShadow: currentIdx === i ? '0 0 20px rgba(50,100,220,0.6)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {currentIdx === i ? SHAPES[s as keyof typeof SHAPES] : null}
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Now reproduce the sequence — {userChoices.length}/{sequence.length} chosen
                </p>
              )}
            </div>
            {/* Shape buttons */}
            {!showingSeq && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {SEQUENCE_ITEMS.map(shape => (
                  <button
                    key={shape}
                    onClick={() => handleSeqChoice(shape)}
                    style={{
                      width: '64px', height: '64px',
                      border: '1px solid rgba(30,60,180,0.4)',
                      background: 'rgba(10,15,40,0.8)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--ice-blue)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--electric-blue)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(50,100,220,0.4)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,60,180,0.4)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  >
                    {SHAPES[shape as keyof typeof SHAPES]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREDICTION */}
        {phase === 'prediction' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ice-blue)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              TEST II — OBJECT PREDICTION — ROUND {predictionRound + 1}/3
            </div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '100px', height: '100px', margin: '0 auto 1.5rem',
                border: '1px solid rgba(30,60,180,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', background: 'rgba(10,15,40,0.8)',
              }}>
                ?
              </div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                Use your psychic powers. Sense the hidden symbol.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {PREDICTION_CARDS.map(card => (
                  <button
                    key={card}
                    onClick={() => handlePrediction(card)}
                    style={{
                      width: '64px', height: '64px',
                      border: `1px solid ${predictionStatus === 'correct' && card === hiddenCard ? '#00cc66' : predictionStatus === 'wrong' && card === hiddenCard ? '#00cc66' : 'rgba(30,60,180,0.4)'}`,
                      background: 'rgba(10,15,40,0.8)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--ice-blue)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {SHAPES[card as keyof typeof SHAPES]}
                  </button>
                ))}
              </div>
              {predictionStatus === 'correct' && (
                <p style={{ color: '#00cc66', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  YOUR POWERS ARE AWAKENING.
                </p>
              )}
              {predictionStatus === 'wrong' && (
                <p style={{ color: 'var(--blood-glow)', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  Focus. The answer was: {hiddenCard.toUpperCase()}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* PATTERN TEST */}
        {phase === 'pattern_test' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ice-blue)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              TEST III — PATTERN REPLICATION — FINAL TEST
            </div>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                Memorize and replicate this sequence:
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {patternSeq.map((s, i) => (
                  <div key={i} style={{
                    width: '48px', height: '48px',
                    border: `1px solid ${i < patternInput.length ? '#00cc66' : 'rgba(30,60,180,0.4)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i < patternInput.length ? '#00cc66' : 'var(--ice-blue)',
                    background: i < patternInput.length ? 'rgba(0,80,30,0.2)' : 'transparent',
                  }}>
                    {SHAPES[s as keyof typeof SHAPES]}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {SEQUENCE_ITEMS.map(shape => (
                <button
                  key={shape}
                  onClick={() => handlePatternClick(shape)}
                  style={{
                    width: '64px', height: '64px',
                    border: '1px solid rgba(30,60,180,0.4)',
                    background: 'rgba(10,15,40,0.8)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--ice-blue)',
                    transition: 'all 0.2s',
                  }}
                >
                  {SHAPES[shape as keyof typeof SHAPES]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AWAKENING */}
        {phase === 'awakening' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '0.7rem', fontFamily: 'var(--mono)', color: 'var(--electric-blue)',
                letterSpacing: '0.3em', marginBottom: '1rem',
              }}>
                PSYCHIC LINK — FULLY ESTABLISHED
              </div>
              <h2 className="horror-title" style={{ fontSize: '2rem', color: 'var(--electric-blue)', marginBottom: '1rem' }}
                data-text="YOUR POWERS ARE AWAKENING">
                YOUR POWERS ARE AWAKENING
              </h2>
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', maxWidth: '500px', margin: '0 auto 1rem', lineHeight: 1.8 }}>
                {playerName}. You are Test Subject 011. Activated.
              </p>
              <div className="achievement" style={{ margin: '0 auto 2rem', display: 'inline-flex', borderColor: 'var(--electric-blue)', color: 'var(--electric-blue)' }}>
                TEST SUBJECT 011 — ACTIVATED
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-horror" style={{ borderColor: 'var(--electric-blue)' }}
                onClick={() => onComplete('TEST SUBJECT 011')}>
                EMBRACE THE POWER
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
            [ ABORT TESTING ]
          </button>
        </div>
      </div>
    </div>
  )
}
