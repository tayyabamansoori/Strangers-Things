import { useState, useEffect, useRef, useCallback } from 'react'
import { MindFlayer3D } from './MindFlayer3D'

interface Props {
  playerName: string
  selectedCharacter: string
  completedGames: string[]
  achievements: string[]
  onSelectGame: (game: string) => void
  onCharacterSelect: () => void
}

const GAMES = [
  {
    id: 'vecnas_curse',
    title: "VECNA'S CURSE",
    subtitle: 'Psychological Horror Test',
    description: 'Memory. Logic. Pattern. Break the curse before it consumes you.',
    color: 'var(--blood)',
    glowColor: 'rgba(180,20,20,0.4)',
    number: '01',
  },
  {
    id: 'upside_down',
    title: 'UPSIDE DOWN ESCAPE',
    subtitle: 'Multi-World Transformation',
    description: "Decode Will's lights. Navigate the mirror dimension. Escape.",
    color: 'rgba(0,180,60,0.8)',
    glowColor: 'rgba(0,150,50,0.3)',
    number: '02',
  },
  {
    id: 'eleven_lab',
    title: 'ELEVEN TEST LAB',
    subtitle: 'Psychic Ability Simulation',
    description: 'Prove your telekinetic potential. Dr. Brenner is watching.',
    color: 'var(--electric-blue)',
    glowColor: 'rgba(50,100,220,0.3)',
    number: '03',
  },
  {
    id: 'stranger_signals',
    title: 'STRANGER SIGNALS',
    subtitle: 'Intelligence Decryption',
    description: 'Decode intercepted transmissions. Access classified Hawkins files.',
    color: 'rgba(180,140,0,0.9)',
    glowColor: 'rgba(150,110,0,0.3)',
    number: '04',
  },
  {
    id: 'final_challenge',
    title: "VECNA'S FINAL CHALLENGE",
    subtitle: 'Elite Boss Battle',
    description: 'The ultimate confrontation. Memory + Logic + Defiance combined.',
    color: 'rgba(255,80,80,0.9)',
    glowColor: 'rgba(200,30,30,0.4)',
    number: '05',
  },
]

export function HomeHub({ playerName, selectedCharacter, completedGames, achievements, onSelectGame, onCharacterSelect }: Props) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)
  const [systemMessages, setSystemMessages] = useState<string[]>([])
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const msgs = [
      `SUBJECT ${playerName.toUpperCase()} — NEURAL LINK ESTABLISHED`,
      'GATE STATUS: UNSTABLE — MONITORING',
      `ENTITY AWARENESS LEVEL: ${Math.floor(Math.random() * 40 + 60)}%`,
      'HAWKINS LAB — ALL SYSTEMS ACTIVE',
      `COMPLETED MODULES: ${completedGames.length}/5`,
    ]
    setSystemMessages(msgs)
  }, [playerName, completedGames.length])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX)
    setMouseY(e.clientY)
    if (parallaxRef.current) {
      const dx = (e.clientX / window.innerWidth - 0.5) * 20
      const dy = (e.clientY / window.innerHeight - 0.5) * 10
      parallaxRef.current.style.transform = `translate(${dx}px, ${dy}px)`
    }
  }, [])

  const CHARACTER_DATA: Record<string, { color: string; symbol: string }> = {
    eleven: { color: '#8855cc', symbol: '011' },
    mike: { color: '#3366aa', symbol: 'MWH' },
    dustin: { color: '#cc8833', symbol: 'DH' },
    lucas: { color: '#cc4422', symbol: 'LS' },
    will: { color: '#449966', symbol: 'WB' },
    max: { color: '#dd3355', symbol: 'MM' },
    steve: { color: '#ddaa33', symbol: 'SH' },
  }

  const charData = CHARACTER_DATA[selectedCharacter] || CHARACTER_DATA.eleven

  return (
    <div
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
    >
      {/* 3D Mind Flayer background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5 }}>
        <MindFlayer3D mouseX={mouseX} mouseY={mouseY} />
      </div>

      {/* Parallax dust layer */}
      <div
        ref={parallaxRef}
        style={{
          position: 'fixed',
          inset: '-5%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(5,2,15,0.8) 100%)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', padding: '2rem' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--blood)', letterSpacing: '0.4em', marginBottom: '0.25rem' }}>
              HAWKINS NATIONAL LABORATORY
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '0.05em',
              textShadow: '0 0 30px rgba(180,20,20,0.3)' }}>
              THE UPSIDE DOWN
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 16px',
              border: '1px solid rgba(140,10,10,0.3)',
              background: 'rgba(5,2,10,0.6)',
              cursor: 'pointer',
            }}
              onClick={onCharacterSelect}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: `${charData.color}22`,
                border: `1px solid ${charData.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontSize: '0.55rem', color: charData.color,
              }}>
                {charData.symbol}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {playerName}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                  {selectedCharacter.toUpperCase() || 'SELECT CHARACTER'}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(140,10,10,0.6)' }}>
              {completedGames.length}/5 MISSIONS COMPLETE
            </div>
          </div>
        </div>

        {/* System messages ticker */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {systemMessages.slice(0, 2).map((msg, i) => (
            <div key={i} style={{
              fontFamily: 'var(--mono)', fontSize: '0.65rem',
              color: 'rgba(140,10,10,0.5)', letterSpacing: '0.1em',
              border: '1px solid rgba(140,10,10,0.15)',
              padding: '4px 10px',
              background: 'rgba(3,2,8,0.7)',
            }}>
              &gt; {msg}
            </div>
          ))}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {achievements.map((ach, i) => (
              <div key={i} className="achievement" style={{ fontSize: '0.6rem' }}>{ach}</div>
            ))}
          </div>
        )}

        {/* GAME GRID */}
        <div className="game-grid" style={{ marginBottom: '3rem' }}>
          {GAMES.map(game => {
            const isComplete = completedGames.includes(game.id)
            const isHovered = hoveredGame === game.id
            return (
              <div
                key={game.id}
                className="game-card"
                style={{
                  padding: '2rem',
                  cursor: 'pointer',
                  borderLeft: `2px solid ${isComplete ? '#00cc66' : isHovered ? game.color : 'transparent'}`,
                  transition: 'all 0.4s ease',
                  background: isHovered ? `rgba(5,2,10,0.95)` : 'rgba(3,2,8,0.85)',
                }}
                onClick={() => onSelectGame(game.id)}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '0.65rem',
                    color: isComplete ? '#00cc66' : isHovered ? game.color : 'var(--text-dim)',
                    letterSpacing: '0.2em',
                  }}>
                    {game.number} {isComplete ? '— COMPLETED' : ''}
                  </span>
                  {isComplete && (
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: '#00cc66',
                      boxShadow: '0 0 8px rgba(0,200,80,0.6)',
                    }} />
                  )}
                </div>
                <h3 style={{
                  fontFamily: 'var(--serif)', fontWeight: 700,
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  color: isHovered ? game.color : 'var(--text-primary)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.1em',
                  textShadow: isHovered ? `0 0 15px ${game.glowColor}` : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {game.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--mono)', fontSize: '0.65rem',
                  color: 'var(--blood)', letterSpacing: '0.1em',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}>
                  {game.subtitle}
                </p>
                <p style={{
                  fontFamily: 'var(--mono)', fontSize: '0.75rem',
                  color: 'var(--text-dim)', lineHeight: 1.6,
                  opacity: isHovered ? 1 : 0.7,
                  transition: 'opacity 0.3s ease',
                }}>
                  {game.description}
                </p>
                {isHovered && (
                  <div style={{
                    marginTop: '1rem', fontFamily: 'var(--mono)', fontSize: '0.7rem',
                    color: game.color, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'fade-in 0.3s ease',
                  }}>
                    <span>ENTER</span>
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                      <path d="M0 5H14M14 5L10 1M14 5L10 9" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom: character select + chat eleven */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-horror" onClick={onCharacterSelect} style={{ fontSize: '0.75rem' }}>
            SELECT CHARACTER
          </button>
          {completedGames.includes('final_challenge') && (
            <button
              className="btn-horror"
              onClick={() => onSelectGame('chat_eleven')}
              style={{ borderColor: 'rgba(100,60,160,0.6)', color: 'rgba(200,170,240,0.8)', fontSize: '0.75rem' }}
            >
              CHAT WITH ELEVEN
            </button>
          )}
        </div>

        {/* Warning at bottom */}
        <div style={{ marginTop: '4rem', paddingTop: '1rem', borderTop: '1px solid rgba(140,10,10,0.15)' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'rgba(140,10,10,0.3)', letterSpacing: '0.2em', textAlign: 'center' }}>
            CLASSIFIED — EYES ONLY — DEPARTMENT OF ENERGY — HAWKINS, INDIANA 47931 — UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
          </p>
        </div>
      </div>
    </div>
  )
}
