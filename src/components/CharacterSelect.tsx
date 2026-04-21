import { useState } from 'react'
import { playSuccess } from '@/lib/audioEngine'

interface Props {
  playerName: string
  currentCharacter: string
  onSelect: (character: string) => void
  onBack: () => void
}

const CHARACTERS = [
  {
    id: 'eleven',
    name: 'ELEVEN',
    code: '011',
    title: 'The Psychic',
    desc: 'Test subject with extraordinary telekinetic abilities. Escaped Hawkins Lab.',
    accent: '#8855cc',
    bg: 'rgba(80,40,120,0.15)',
    traits: ['TELEKINESIS', 'EXTRASENSORY', 'VOID WALKER'],
    svgPath: `
      <circle cx="100" cy="85" r="45" fill="rgba(60,30,100,0.8)" stroke="rgba(140,100,200,0.4)" stroke-width="1"/>
      <circle cx="85" cy="82" r="7" fill="rgba(200,180,240,0.9)"/>
      <circle cx="115" cy="82" r="7" fill="rgba(200,180,240,0.9)"/>
      <path d="M75 95 Q100 108 125 95" stroke="rgba(200,180,240,0.6)" stroke-width="1.5" fill="none"/>
      <rect x="65" y="45" width="70" height="20" fill="rgba(40,20,80,0.6)" rx="2"/>
      <line x1="100" y1="92" x2="100" y2="100" stroke="rgba(180,20,20,0.8)" stroke-width="2"/>
      <circle cx="87" cy="82" r="3" fill="rgba(80,50,140,1)"/>
      <circle cx="113" cy="82" r="3" fill="rgba(80,50,140,1)"/>
    `,
  },
  {
    id: 'mike',
    name: 'MIKE',
    code: 'MWH',
    title: 'The Leader',
    desc: "Dungeons & Dragons strategist. Eleven's protector. The heart of the party.",
    accent: '#3366cc',
    bg: 'rgba(30,50,120,0.15)',
    traits: ['TACTICIAN', 'LOYAL', 'RADIO OPERATOR'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(20,30,80,0.8)" stroke="rgba(60,90,180,0.4)" stroke-width="1"/>
      <circle cx="87" cy="78" r="6" fill="rgba(160,180,240,0.9)"/>
      <circle cx="113" cy="78" r="6" fill="rgba(160,180,240,0.9)"/>
      <path d="M78 92 Q100 102 122 92" stroke="rgba(160,180,240,0.6)" stroke-width="1.5" fill="none"/>
      <path d="M70 55 Q85 40 100 50 Q115 40 130 55" stroke="rgba(60,90,180,0.5)" stroke-width="2" fill="none"/>
    `,
  },
  {
    id: 'dustin',
    name: 'DUSTIN',
    code: 'DHH',
    title: 'The Scientist',
    desc: 'Scientific mind. Tamed Dart. Invented the Cerebro communication device.',
    accent: '#cc8822',
    bg: 'rgba(120,80,20,0.15)',
    traits: ['INVENTOR', 'ZOOLOGIST', 'RADIO EXPERT'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(80,50,10,0.8)" stroke="rgba(180,120,40,0.4)" stroke-width="1"/>
      <circle cx="86" cy="78" r="7" fill="rgba(240,210,160,0.9)"/>
      <circle cx="114" cy="78" r="7" fill="rgba(240,210,160,0.9)"/>
      <path d="M78 94 Q100 106 122 94" stroke="rgba(240,200,140,0.7)" stroke-width="2" fill="none"/>
      <path d="M80 60 Q100 50 120 60" stroke="rgba(180,120,40,0.4)" stroke-width="1.5" fill="none"/>
    `,
  },
  {
    id: 'lucas',
    name: 'LUCAS',
    code: 'LSI',
    title: 'The Soldier',
    desc: 'Skeptic turned believer. Armed with a wrist rocket and unwavering courage.',
    accent: '#cc4422',
    bg: 'rgba(100,30,10,0.15)',
    traits: ['MARKSMAN', 'REALIST', 'PROTECTOR'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(70,20,10,0.8)" stroke="rgba(180,60,30,0.4)" stroke-width="1"/>
      <circle cx="87" cy="78" r="6" fill="rgba(220,160,130,0.9)"/>
      <circle cx="113" cy="78" r="6" fill="rgba(220,160,130,0.9)"/>
      <path d="M78 93 Q100 104 122 93" stroke="rgba(220,180,150,0.6)" stroke-width="1.5" fill="none"/>
    `,
  },
  {
    id: 'will',
    name: 'WILL',
    code: 'WBY',
    title: 'The Survivor',
    desc: 'Survived the Upside Down. Conduit for the Mind Flayer. Chose his friends.',
    accent: '#449966',
    bg: 'rgba(20,70,40,0.15)',
    traits: ['SENSITIVE', 'ARTIST', 'TRUTH SEEKER'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(10,50,25,0.8)" stroke="rgba(50,140,80,0.4)" stroke-width="1"/>
      <circle cx="87" cy="78" r="6" fill="rgba(180,220,190,0.9)"/>
      <circle cx="113" cy="78" r="6" fill="rgba(180,220,190,0.9)"/>
      <path d="M78 93 Q100 103 122 93" stroke="rgba(180,220,190,0.6)" stroke-width="1.5" fill="none"/>
      <path d="M75 65 Q100 55 125 65" stroke="rgba(50,140,80,0.3)" stroke-width="1" fill="none"/>
    `,
  },
  {
    id: 'max',
    name: 'MAX',
    code: 'MMF',
    title: 'The Fighter',
    desc: "Hawkins' fastest on a skateboard. Overcame Vecna's curse through music.",
    accent: '#dd3355',
    bg: 'rgba(100,20,30,0.15)',
    traits: ['RESILIENT', 'FAST', 'MUSIC-POWERED'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(80,10,20,0.8)" stroke="rgba(200,50,70,0.4)" stroke-width="1"/>
      <circle cx="86" cy="78" r="7" fill="rgba(240,200,200,0.9)"/>
      <circle cx="114" cy="78" r="7" fill="rgba(240,200,200,0.9)"/>
      <path d="M78 94 Q100 106 122 94" stroke="rgba(240,180,190,0.7)" stroke-width="2" fill="none"/>
      <path d="M75 58 Q80 50 90 55 Q100 50 110 55 Q120 50 125 58" stroke="rgba(200,50,70,0.5)" stroke-width="1.5" fill="none"/>
    `,
  },
  {
    id: 'steve',
    name: 'STEVE',
    code: 'SHR',
    title: 'The Protector',
    desc: 'From bully to babysitter. Wielder of the nailed bat. The most improved.',
    accent: '#ddaa33',
    bg: 'rgba(100,80,10,0.15)',
    traits: ['FIGHTER', 'PROTECTIVE', 'HAIR LEGEND'],
    svgPath: `
      <circle cx="100" cy="80" r="45" fill="rgba(70,60,10,0.8)" stroke="rgba(200,160,40,0.4)" stroke-width="1"/>
      <circle cx="87" cy="79" r="6" fill="rgba(240,220,170,0.9)"/>
      <circle cx="113" cy="79" r="6" fill="rgba(240,220,170,0.9)"/>
      <path d="M78 94 Q100 104 122 94" stroke="rgba(240,210,160,0.6)" stroke-width="1.5" fill="none"/>
      <path d="M65 55 Q75 35 100 42 Q125 35 135 55" fill="rgba(180,140,30,0.4)" stroke="rgba(200,160,40,0.5)" stroke-width="1.5"/>
    `,
  },
]

export function CharacterSelect({ playerName, currentCharacter, onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected(id)
    playSuccess()
    setTimeout(() => {
      onSelect(id)
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(30,5,50,0.6) 0%, var(--deep-void) 70%)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--blood)', letterSpacing: '0.4em', marginBottom: '0.5rem' }}>
            HAWKINS PARTY — SELECT YOUR IDENTITY
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-primary)' }}
            data-text="CHOOSE YOUR SURVIVOR">
            CHOOSE YOUR SURVIVOR
          </h1>
          <div className="stripe-divider" />
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '500px', margin: '0 auto' }}>
            {playerName}, your choice will follow you through every trial.
          </p>
        </div>

        {/* Character grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1px',
          background: 'rgba(140,10,10,0.1)',
          marginBottom: '2rem',
        }}>
          {CHARACTERS.map(char => {
            const isHovered = hovered === char.id
            const isCurrent = currentCharacter === char.id
            const isSelected = selected === char.id
            return (
              <div
                key={char.id}
                className="char-card"
                style={{
                  background: isSelected ? `${char.bg}` : isHovered ? char.bg : 'rgba(5,2,10,0.9)',
                  transition: 'all 0.4s ease',
                  padding: '0',
                  cursor: 'pointer',
                  outline: isCurrent ? `2px solid ${char.accent}` : 'none',
                  outlineOffset: '-2px',
                  position: 'relative',
                }}
                onClick={() => handleSelect(char.id)}
                onMouseEnter={() => setHovered(char.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Portrait SVG */}
                <div style={{
                  height: '200px',
                  background: `linear-gradient(to bottom, ${char.bg}, rgba(3,2,8,0.9))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <svg
                    width="200" height="200" viewBox="0 0 200 160"
                    style={{ position: 'absolute', inset: 0, transition: 'transform 0.4s ease', transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                    dangerouslySetInnerHTML={{ __html: char.svgPath }}
                  />
                  {/* Glitch overlay on hover */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${char.accent}15 0%, transparent 100%)`,
                      mixBlendMode: 'overlay',
                    }} />
                  )}
                  {/* Code badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    fontFamily: 'var(--mono)', fontSize: '0.6rem',
                    color: char.accent, letterSpacing: '0.15em',
                    border: `1px solid ${char.accent}40`,
                    padding: '3px 8px',
                    background: 'rgba(3,2,8,0.7)',
                  }}>
                    {char.code}
                  </div>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      fontFamily: 'var(--mono)', fontSize: '0.55rem',
                      color: '#00cc66', letterSpacing: '0.1em',
                      border: '1px solid rgba(0,180,80,0.4)',
                      padding: '3px 8px',
                      background: 'rgba(0,30,10,0.7)',
                    }}>
                      ACTIVE
                    </div>
                  )}
                  {/* Film grain */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                  }} />
                </div>

                {/* Info */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontFamily: 'var(--serif)', fontWeight: 700,
                      fontSize: '1rem', letterSpacing: '0.15em',
                      color: isHovered ? char.accent : 'var(--text-primary)',
                      transition: 'color 0.3s ease',
                    }}>
                      {char.name}
                    </h3>
                  </div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: char.accent, letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                    {char.title}
                  </p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {char.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {char.traits.map(t => (
                      <span key={t} style={{
                        fontFamily: 'var(--mono)', fontSize: '0.55rem',
                        color: char.accent, border: `1px solid ${char.accent}33`,
                        padding: '2px 6px', letterSpacing: '0.1em',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onBack} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}>
            [ RETURN TO HUB ]
          </button>
        </div>
      </div>
    </div>
  )
}
