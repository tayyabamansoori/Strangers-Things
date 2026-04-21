import { useState, useEffect } from 'react'

interface Props {
  playerName: string
  onEnd: () => void
}

const ELEVEN_MESSAGES = [
  { text: 'You made it.', delay: 1000 },
  { text: 'I was watching you the whole time.', delay: 3500 },
  { text: `${'{name}'}... you were brave.`, delay: 6500 },
  { text: 'The Mind Flayer cannot reach you now.', delay: 9500 },
  { text: 'Vecna is afraid of you.', delay: 12500 },
  { text: 'Stay safe out there.', delay: 15500 },
  { text: 'Promise me.', delay: 18000 },
]

const TYPING_SPEED = 40

export function ChatWithEleven({ playerName, onEnd }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<{ text: string; typed: string; done: boolean }[]>([])
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting')
  const [showInput, setShowInput] = useState(false)
  const [userReply, setUserReply] = useState('')
  const [userSent, setUserSent] = useState(false)
  const [finalMessage, setFinalMessage] = useState(false)

  useEffect(() => {
    setTimeout(() => setStatus('online'), 1500)

    const messages = ELEVEN_MESSAGES.map(m => ({
      text: m.text.replace('{name}', playerName),
      typed: '',
      done: false,
    }))

    ELEVEN_MESSAGES.forEach((m, idx) => {
      setTimeout(() => {
        setVisibleMessages(prev => {
          const updated = [...prev]
          updated.push({ text: messages[idx].text, typed: '', done: false })
          return updated
        })

        // Type each character
        const text = messages[idx].text
        for (let i = 0; i <= text.length; i++) {
          setTimeout(() => {
            setVisibleMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last) {
                updated[updated.length - 1] = {
                  ...last,
                  typed: text.slice(0, i),
                  done: i === text.length,
                }
              }
              return updated
            })
          }, i * TYPING_SPEED)
        }
      }, m.delay)
    })

    // Show input after last message
    const lastDelay = ELEVEN_MESSAGES[ELEVEN_MESSAGES.length - 1].delay
    setTimeout(() => setShowInput(true), lastDelay + 1500)

    // Go offline
    setTimeout(() => {
      setStatus('offline')
      setShowInput(false)
      setFinalMessage(true)
    }, lastDelay + 12000)
  }, [playerName])

  const handleSend = () => {
    if (!userReply.trim()) return
    setUserSent(true)
    setShowInput(false)

    setTimeout(() => {
      setVisibleMessages(prev => [
        ...prev,
        { text: '...', typed: '', done: false },
      ])
      setTimeout(() => {
        setVisibleMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { text: 'I know.', typed: 'I know.', done: true }
          return updated
        })
      }, 2000)
    }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--deep-void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Chat header */}
        <div style={{
          borderBottom: '1px solid rgba(140,10,10,0.2)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0',
          background: 'rgba(5,2,10,0.9)',
        }}>
          {/* Eleven avatar */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            border: `2px solid ${status === 'online' ? '#00cc66' : status === 'offline' ? 'rgba(255,255,255,0.2)' : 'var(--blood)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20,10,40,0.9)',
            boxShadow: status === 'online' ? '0 0 15px rgba(0,180,80,0.4)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Stylized eleven portrait */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="6" fill="rgba(100,80,140,0.6)" stroke="rgba(180,150,220,0.4)" strokeWidth="0.5"/>
              <path d="M6 24 Q14 18 22 24" fill="rgba(60,40,100,0.5)" stroke="rgba(140,110,180,0.3)" strokeWidth="0.5"/>
              <circle cx="11.5" cy="10" r="1.5" fill="rgba(200,180,240,0.8)"/>
              <circle cx="16.5" cy="10" r="1.5" fill="rgba(200,180,240,0.8)"/>
              <path d="M11 14 Q14 16 17 14" stroke="rgba(200,180,240,0.6)" strokeWidth="0.8" fill="none"/>
              {/* Nose blood */}
              <line x1="14" y1="12" x2="14" y2="14.5" stroke="rgba(180,20,20,0.8)" strokeWidth="1"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.1em' }}>
              ELEVEN
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '0.65rem',
              color: status === 'online' ? '#00cc66' : status === 'offline' ? 'rgba(255,255,255,0.3)' : 'var(--blood)',
              letterSpacing: '0.1em',
            }}>
              {status === 'connecting' ? 'ESTABLISHING LINK...' : status === 'online' ? 'ONLINE — SECURE CHANNEL' : 'OFFLINE'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          background: 'rgba(3,2,8,0.95)',
          border: '1px solid rgba(140,10,10,0.15)',
          borderTop: 'none',
          minHeight: '380px',
          maxHeight: '380px',
          overflow: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {status === 'connecting' && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(140,10,10,0.5)', textAlign: 'center', animation: 'fade-in-slow 1s ease' }}>
              ESTABLISHING SECURE PSYCHIC LINK...
            </div>
          )}

          {visibleMessages.map((msg, i) => (
            <div key={i} style={{ animation: 'fade-in 0.5s ease' }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 16px',
                background: 'rgba(20,10,40,0.6)',
                border: '1px solid rgba(100,60,160,0.2)',
                fontFamily: 'var(--serif)',
                fontSize: '0.95rem',
                color: 'rgba(220,210,240,0.9)',
                lineHeight: 1.6,
                position: 'relative',
              }}>
                {msg.typed}
                {!msg.done && <span style={{ animation: 'blink 0.8s step-end infinite', color: 'rgba(180,150,220,0.8)' }}>|</span>}
              </div>
            </div>
          ))}

          {userSent && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fade-in 0.3s ease' }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 16px',
                background: 'rgba(60,5,5,0.4)',
                border: '1px solid rgba(140,10,10,0.3)',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem',
                color: 'rgba(220,200,200,0.8)',
              }}>
                {userReply}
              </div>
            </div>
          )}

          {finalMessage && (
            <div style={{ textAlign: 'center', marginTop: '1rem', animation: 'fade-in-slow 2s ease' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
                — CONNECTION TERMINATED —
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {showInput && !userSent && (
          <div style={{
            background: 'rgba(5,2,10,0.9)',
            border: '1px solid rgba(140,10,10,0.2)',
            borderTop: 'none',
            padding: '12px',
            display: 'flex',
            gap: '8px',
            animation: 'fade-in 0.5s ease',
          }}>
            <input
              className="input-horror"
              style={{ fontSize: '0.85rem', padding: '8px 12px', borderColor: 'rgba(100,60,160,0.3)' }}
              value={userReply}
              onChange={e => setUserReply(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Reply to Eleven..."
            />
            <button className="btn-horror" style={{ borderColor: 'rgba(100,60,160,0.5)', padding: '8px 16px', flexShrink: 0 }} onClick={handleSend}>
              SEND
            </button>
          </div>
        )}

        {finalMessage && (
          <div style={{ textAlign: 'center', marginTop: '2rem', animation: 'fade-in-slow 2s ease' }}>
            <button className="btn-horror" onClick={onEnd} style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)' }}>
              CLOSE CONNECTION
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
