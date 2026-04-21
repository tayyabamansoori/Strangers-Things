import { useState, useEffect, useCallback } from 'react'
import { playGlitch, playSuccess, playError } from '@/lib/audioEngine'

interface Props {
  playerName: string
  onComplete: (achievement: string) => void
  onBack: () => void
}

type Phase = 'intro' | 'normal_world' | 'transition' | 'upside_down' | 'light_puzzle' | 'maze' | 'completed'

// Christmas lights puzzle - decode Will's message
const WILL_MESSAGE = "R-U-N"
const LIGHT_POSITIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Simple maze: 0=path, 1=wall, 2=start, 3=exit
const MAZE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,1,0,0,0,1,0,0,1],
  [1,0,0,1,0,1,0,0,0,1,1],
  [1,0,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,1],
  [1,0,0,0,0,0,1,1,1,0,1],
  [1,1,1,1,1,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1],
]

const START_POS = { r: 1, c: 1 }
const EXIT_POS = { r: 9, c: 9 }

export function UpsideDownEscape({ playerName, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [isUpsideDown, setIsUpsideDown] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)

  // Light puzzle
  const [litLights, setLitLights] = useState<Set<number>>(new Set())
  const [lightProgress, setLightProgress] = useState(0)
  const targetLetters = WILL_MESSAGE.replace(/-/g, '').split('')

  // Maze
  const [playerPos, setPlayerPos] = useState(START_POS)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [mazeComplete, setMazeComplete] = useState(false)

  const [glitching, setGlitching] = useState(false)

  const triggerTransition = useCallback(() => {
    setGlitching(true)
    playGlitch()
    let p = 0
    const interval = setInterval(() => {
      p += 5
      setTransitionProgress(p)
      if (p % 20 === 0) playGlitch()
      if (p >= 100) {
        clearInterval(interval)
        setIsUpsideDown(true)
        setPhase('light_puzzle')
        setGlitching(false)
      }
    }, 50)
  }, [])

  // Handle light clicks
  const toggleLight = (idx: number) => {
    const letter = LIGHT_POSITIONS[idx]
    if (targetLetters[lightProgress] === letter) {
      const next = new Set(litLights)
      next.add(idx)
      setLitLights(next)
      playSuccess()
      if (lightProgress + 1 >= targetLetters.length) {
        setTimeout(() => setPhase('maze'), 1200)
      } else {
        setLightProgress(p => p + 1)
      }
    } else {
      playError()
      setGlitching(true)
      setTimeout(() => setGlitching(false), 400)
    }
  }

  // Maze keyboard movement
  useEffect(() => {
    if (phase !== 'maze') return
    const handleKey = (e: KeyboardEvent) => {
      const dirs: Record<string, { r: number; c: number }> = {
        ArrowUp: { r: -1, c: 0 },
        ArrowDown: { r: 1, c: 0 },
        ArrowLeft: { r: 0, c: -1 },
        ArrowRight: { r: 0, c: 1 },
        w: { r: -1, c: 0 },
        s: { r: 1, c: 0 },
        a: { r: 0, c: -1 },
        d: { r: 0, c: 1 },
      }
      const dir = dirs[e.key]
      if (!dir) return
      e.preventDefault()
      const newR = playerPos.r + dir.r
      const newC = playerPos.c + dir.c
      if (newR < 0 || newR >= MAZE_MAP.length || newC < 0 || newC >= MAZE_MAP[0].length) return
      if (MAZE_MAP[newR][newC] === 1) return
      setPlayerPos({ r: newR, c: newC })
      setVisited(v => new Set([...v, `${newR},${newC}`]))
      if (newR === EXIT_POS.r && newC === EXIT_POS.c) {
        setMazeComplete(true)
        playSuccess()
        setTimeout(() => setPhase('completed'), 1500)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, playerPos])

  // Mobile maze controls
  const movePlayer = (dr: number, dc: number) => {
    const newR = playerPos.r + dr
    const newC = playerPos.c + dc
    if (newR < 0 || newR >= MAZE_MAP.length || newC < 0 || newC >= MAZE_MAP[0].length) return
    if (MAZE_MAP[newR][newC] === 1) return
    setPlayerPos({ r: newR, c: newC })
    setVisited(v => new Set([...v, `${newR},${newC}`]))
    if (newR === EXIT_POS.r && newC === EXIT_POS.c) {
      setMazeComplete(true)
      playSuccess()
      setTimeout(() => setPhase('completed'), 1500)
    }
  }

  const worldStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: '2rem',
    position: 'relative',
    transition: 'filter 2s ease, background 2s ease',
    background: isUpsideDown
      ? 'radial-gradient(ellipse at center, rgba(5,30,5,0.8) 0%, rgba(0,8,0,0.95) 100%)'
      : 'radial-gradient(ellipse at center, rgba(5,15,40,0.6) 0%, var(--deep-void) 100%)',
    filter: isUpsideDown ? 'hue-rotate(180deg) saturate(1.5) brightness(0.65)' : 'none',
  }

  if (glitching) {
    return (
      <div style={{ ...worldStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="glitch-text horror-title" data-text="REALITY BREAKING" style={{ fontSize: '3rem', color: 'var(--blood-glow)' }}>
            REALITY BREAKING
          </div>
          {phase === 'transition' && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                DIMENSIONAL SHIFT: {transitionProgress}%
              </div>
              <div className="progress-horror" style={{ width: '300px', margin: '0 auto' }}>
                <div style={{ height: '2px', background: 'var(--blood-bright)', width: `${transitionProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={worldStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: '0.3em', marginBottom: '0.5rem',
            color: isUpsideDown ? '#00ff44' : 'var(--blood)' }}>
            {isUpsideDown ? 'UPSIDE DOWN — DIMENSION BREACH ACTIVE' : 'HAWKINS, INDIANA — NORMAL WORLD'}
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: isUpsideDown ? '#00ff44' : 'var(--blood-bright)' }}
            data-text="UPSIDE DOWN ESCAPE">
            UPSIDE DOWN ESCAPE
          </h1>
          <div className="stripe-divider" style={{ background: isUpsideDown
            ? 'linear-gradient(90deg, transparent, #00ff44, #00cc44, transparent)' : undefined }} />
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div className="card-horror" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', lineHeight: 2, marginBottom: '1.5rem' }}>
                {playerName}. Two worlds exist simultaneously.<br />
                The veil between them is thinning.<br />
                Navigate through Will's lights.<br />
                Escape the maze before the Upside Down consumes you.
              </p>
              <button className="btn-horror" onClick={() => setPhase('normal_world')}>
                ENTER THE BREACH
              </button>
            </div>
          </div>
        )}

        {/* NORMAL WORLD */}
        {phase === 'normal_world' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div className="card-horror" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              <p style={{ fontFamily: 'var(--serif)', color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Everything seems normal. Hawkins is quiet.<br />
                But something flickers at the edge of perception.<br />
                The lights... they're behaving strangely.
              </p>
              <button className="btn-horror" onClick={triggerTransition}>
                INVESTIGATE THE LIGHTS
              </button>
            </div>
          </div>
        )}

        {/* LIGHT PUZZLE */}
        {phase === 'light_puzzle' && (
          <div className="section-enter">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#00ff44', letterSpacing: '0.15em' }}>
                DECODE WILL'S MESSAGE — CLICK THE CORRECT LIGHTS IN SEQUENCE
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(0,255,68,0.4)', marginTop: '0.5rem' }}>
                HINT: Three letters. A word. Run.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem' }}>
                {targetLetters.map((l, i) => (
                  <div key={i} style={{
                    width: '40px', height: '40px', border: '1px solid rgba(0,255,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: '1.2rem',
                    color: lightProgress > i ? '#00ff44' : 'rgba(0,255,68,0.2)',
                    background: lightProgress > i ? 'rgba(0,100,30,0.3)' : 'transparent',
                  }}>
                    {lightProgress > i ? l : '_'}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
              {LIGHT_POSITIONS.map((letter, i) => (
                <button
                  key={i}
                  className="light-bulb"
                  style={{
                    background: litLights.has(i) ? undefined : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: '0.7rem',
                    color: litLights.has(i) ? '#fff' : 'rgba(255,200,50,0.5)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleLight(i)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAZE */}
        {phase === 'maze' && (
          <div className="section-enter">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: '#00ff44', letterSpacing: '0.15em' }}>
                NAVIGATE THE UPSIDE DOWN — FIND THE EXIT
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(0,255,68,0.4)', marginTop: '0.5rem' }}>
                USE ARROW KEYS OR WASD — MOBILE: USE BUTTONS BELOW
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
              {MAZE_MAP.map((row, r) => (
                <div key={r} style={{ display: 'flex', gap: '4px' }}>
                  {row.map((cell, c) => {
                    const isPlayer = r === playerPos.r && c === playerPos.c
                    const isExit = cell === 3
                    const isWall = cell === 1
                    const wasVisited = visited.has(`${r},${c}`)
                    return (
                      <div key={c} className={`maze-cell ${isWall ? 'wall' : isPlayer ? 'player' : isExit ? 'exit' : wasVisited ? 'visited' : 'path'}`} />
                    )
                  })}
                </div>
              ))}
            </div>
            {/* Mobile controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button className="btn-horror" style={{ width: '48px', padding: '8px' }} onClick={() => movePlayer(-1, 0)}>^</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-horror" style={{ width: '48px', padding: '8px' }} onClick={() => movePlayer(0, -1)}>&lt;</button>
                <button className="btn-horror" style={{ width: '48px', padding: '8px' }} onClick={() => movePlayer(1, 0)}>v</button>
                <button className="btn-horror" style={{ width: '48px', padding: '8px' }} onClick={() => movePlayer(0, 1)}>&gt;</button>
              </div>
            </div>
            {mazeComplete && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#00ff44', fontFamily: 'var(--mono)' }}>
                ESCAPE ROUTE FOUND. DIMENSIONAL ANCHOR SECURED.
              </div>
            )}
          </div>
        )}

        {/* COMPLETED */}
        {phase === 'completed' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#00cc44', letterSpacing: '0.3em', marginBottom: '1rem' }}>
                DIMENSIONAL BREACH SEALED
              </div>
              <h2 className="horror-title" style={{ fontSize: '2.5rem', color: '#00cc44', marginBottom: '1rem' }}
                data-text="GATEKEEPER">
                GATEKEEPER
              </h2>
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
                You escaped the Upside Down. The gate is sealed. For now.
              </p>
              <div className="achievement" style={{ margin: '0 auto 2rem', display: 'inline-flex', borderColor: '#00cc44', color: '#00cc44' }}>
                ACHIEVEMENT UNLOCKED: GATEKEEPER
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-horror" onClick={() => onComplete('GATEKEEPER')}>
                SEAL THE GATE
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
