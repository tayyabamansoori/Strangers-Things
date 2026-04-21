import { useEffect, useState } from 'react'

interface Props {
  onRestart: () => void
}

export function EndingScreen({ onRestart }: Props) {
  const [phase, setPhase] = useState(0)
  // 0=black, 1=text appearing, 2=fading, 3=static

  useEffect(() => {
    setTimeout(() => setPhase(1), 1000)
    setTimeout(() => setPhase(2), 6000)
    setTimeout(() => setPhase(3), 9000)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Static noise overlay when signal dies */}
      {phase >= 2 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '100px',
          opacity: phase >= 3 ? 0.15 : 0.05,
          transition: 'opacity 3s ease',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ textAlign: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {phase >= 1 && (
          <div className={phase >= 2 ? 'connection-lost' : 'section-enter'}>
            <div style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
              color: 'rgba(220,220,220,0.9)',
              letterSpacing: '0.2em',
              textShadow: '0 0 40px rgba(255,255,255,0.3)',
              marginBottom: '2rem',
              lineHeight: 1.4,
            }}>
              THE CONNECTION<br />IS LOST
            </div>

            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.4em',
              marginBottom: '3rem',
              lineHeight: 2,
            }}>
              SIGNAL TERMINATED<br />
              ENTITY WITHDRAWN<br />
              HAWKINS — SECURE
            </div>
          </div>
        )}

        {phase >= 3 && (
          <div style={{ animation: 'fade-in-slow 3s ease' }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.65rem',
              color: 'rgba(140,10,10,0.4)',
              letterSpacing: '0.3em',
              marginBottom: '3rem',
            }}>
              BUT SOMETHING REMAINS IN THE DARK...
            </div>
            <button
              className="btn-horror"
              onClick={onRestart}
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', letterSpacing: '0.3em' }}
            >
              ENTER AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
