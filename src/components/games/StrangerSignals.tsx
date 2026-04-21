import { useState } from 'react'
import { playGlitch, playSuccess, playError } from '@/lib/audioEngine'

interface Props {
  playerName: string
  onComplete: (achievement: string) => void
  onBack: () => void
}

type Phase = 'intro' | 'file_explorer' | 'decode_signal' | 'unlock_folder' | 'completed'

const ENCODED_MESSAGE = [
  { code: '01001000', char: 'H', revealed: false },
  { code: '01000001', char: 'A', revealed: false },
  { code: '01010111', char: 'W', revealed: false },
  { code: '01001011', char: 'K', revealed: false },
  { code: '01001001', char: 'I', revealed: false },
  { code: '01001110', char: 'N', revealed: false },
  { code: '01010011', char: 'S', revealed: false },
]

const FILES = [
  { name: 'project_mkultra.doc', locked: true, content: 'CLASSIFIED — LEVEL 5 CLEARANCE REQUIRED', unlockCode: '' },
  { name: 'gate_coordinates.dat', locked: true, content: 'GATE LOCATION: 37.4N 86.2W — DEPTH: 247m', unlockCode: '' },
  { name: 'subject_011_report.pdf', locked: false, content: 'Subject displays extraordinary telekinetic capabilities. Recommend continued isolation and testing.', unlockCode: '' },
  { name: 'demogorgon_anatomy.jpg', locked: true, content: '[VISUAL DATA CORRUPTED]', unlockCode: '' },
  { name: 'open_me.txt', locked: false, content: 'If you are reading this, the gate has been opened. The code to access classified files is: HAWKINS', unlockCode: '' },
  { name: 'vecna_origin.enc', locked: true, content: 'HENRY CREEL — TEST SUBJECT 001 — THE ORIGINAL — THE MIND', unlockCode: 'HAWKINS' },
  { name: 'upside_down_map.dat', locked: true, content: 'CARTOGRAPHIC DATA — MIRROR DIMENSION — ACCESS GRANTED: GATEKEEPER', unlockCode: 'HAWKINS' },
]

const SIGNAL_FRAGMENTS = [
  { encrypted: 'VHXWIV', answer: 'HAWKINS' },
  { encrypted: '011-ACVIT', answer: 'ELEVEN' },
  { encrypted: 'GZG3', answer: 'GATE' },
]

export function StrangerSignals({ playerName, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [fileStates, setFileStates] = useState(FILES)
  const [openFile, setOpenFile] = useState<typeof FILES[0] | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [signalIdx, setSignalIdx] = useState(0)
  const [signalAnswer, setSignalAnswer] = useState('')
  const [signalStatus, setSignalStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [_signalScore, setSignalScore] = useState(0)
  const [decoded, setDecoded] = useState<boolean[]>(new Array(ENCODED_MESSAGE.length).fill(false))
  const [accessGranted, setAccessGranted] = useState(0)
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> HAWKINS LAB SECURE TERMINAL v4.2',
    '> AUTHENTICATION REQUIRED',
    `> USER: ${playerName.toUpperCase()}`,
    '> STATUS: PARTIAL ACCESS',
    '> SEARCHING FOR CLASSIFIED FILES...',
  ])

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev.slice(-8), '> ' + line])
  }

  const handleFileClick = (file: typeof FILES[0]) => {
    if (file.locked) {
      if (file.unlockCode) {
        setOpenFile(file)
        addTerminalLine(`ATTEMPTING ACCESS: ${file.name}`)
        playGlitch()
      } else {
        addTerminalLine(`ACCESS DENIED: ${file.name} — INSUFFICIENT CLEARANCE`)
        playError()
      }
    } else {
      setOpenFile(file)
      addTerminalLine(`OPENED: ${file.name}`)
    }
  }

  const handleCodeSubmit = () => {
    if (!openFile) return
    if (codeInput.toUpperCase() === openFile.unlockCode) {
      playSuccess()
      const updated = fileStates.map(f => f.name === openFile.name ? { ...f, locked: false } : f)
      setFileStates(updated)
      setOpenFile({ ...openFile, locked: false })
      addTerminalLine(`FILE DECRYPTED: ${openFile.name}`)
      setAccessGranted(a => a + 1)
      setCodeInput('')
      setCodeError(false)
      if (accessGranted + 1 >= 2) {
        setTimeout(() => setPhase('completed'), 1500)
      }
    } else {
      playError()
      setCodeError(true)
      addTerminalLine(`WRONG CODE. SECURITY ALERT TRIGGERED.`)
      setTimeout(() => setCodeError(false), 1000)
    }
  }

  const handleSignalSubmit = () => {
    const signal = SIGNAL_FRAGMENTS[signalIdx]
    if (signalAnswer.toUpperCase() === signal.answer) {
      playSuccess()
      setSignalStatus('correct')
      setSignalScore(s => s + 1)
      // Decode corresponding binary chars
      const newDecoded = [...decoded]
      const chars = Math.min(2, ENCODED_MESSAGE.length - decoded.filter(Boolean).length)
      let filled = 0
      for (let i = 0; i < newDecoded.length && filled < chars; i++) {
        if (!newDecoded[i]) { newDecoded[i] = true; filled++ }
      }
      setDecoded(newDecoded)
      addTerminalLine(`SIGNAL DECODED: ${signal.answer}`)
      setTimeout(() => {
        setSignalStatus('idle')
        setSignalAnswer('')
        if (signalIdx + 1 >= SIGNAL_FRAGMENTS.length) {
          setPhase('file_explorer')
        } else {
          setSignalIdx(i => i + 1)
        }
      }, 1200)
    } else {
      playError()
      setSignalStatus('wrong')
      addTerminalLine(`DECRYPTION FAILED. SIGNAL CORRUPTED.`)
      setTimeout(() => setSignalStatus('idle'), 1000)
    }
  }

  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top left, rgba(5,20,50,0.6) 0%, var(--deep-void) 60%)',
    padding: '2rem',
  }

  return (
    <div style={bgStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ice-blue)', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
            HAWKINS INTELLIGENCE DIVISION — AGENT: {playerName.toUpperCase()}
          </div>
          <h1 className="horror-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--ice-blue)' }}
            data-text="STRANGER SIGNALS">
            STRANGER SIGNALS
          </h1>
          <div className="stripe-divider" style={{ background: 'linear-gradient(90deg, transparent, var(--ice-blue), transparent)' }} />
        </div>

        {/* Terminal */}
        <div className="file-explorer" style={{ padding: '12px', marginBottom: '1.5rem', height: '120px', overflow: 'hidden' }}>
          {terminalLines.map((line, i) => (
            <div key={i} style={{ color: i === terminalLines.length - 1 ? '#6699ff' : 'rgba(100,150,255,0.5)', fontSize: '0.72rem', lineHeight: 1.6 }}>
              {line}
            </div>
          ))}
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div className="card-horror" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto 2rem', borderColor: 'rgba(30,60,180,0.3)' }}>
              <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', lineHeight: 2, marginBottom: '1.5rem' }}>
                {playerName}. Welcome to the intelligence division.<br />
                Classified files have been intercepted.<br />
                Decode the signals. Access the truth about Hawkins Lab.<br />
                The government is watching. Move fast.
              </p>
              <button className="btn-horror" style={{ borderColor: 'var(--ice-blue)' }}
                onClick={() => setPhase('decode_signal')}>
                BEGIN DECRYPTION
              </button>
            </div>
          </div>
        )}

        {/* SIGNAL DECODE */}
        {phase === 'decode_signal' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ice-blue)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              INTERCEPTED SIGNAL — DECRYPTION REQUIRED — {signalIdx + 1}/{SIGNAL_FRAGMENTS.length}
            </div>
            <div className="card-horror" style={{ padding: '2rem', borderColor: 'rgba(30,60,180,0.3)', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'rgba(100,150,255,0.5)', marginBottom: '0.5rem' }}>
                  ENCRYPTED TRANSMISSION:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {SIGNAL_FRAGMENTS[signalIdx].encrypted.split('').map((c, i) => (
                    <div key={i} className="signal-char">{c}</div>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(100,150,255,0.3)' }}>
                  HINT: Each letter shifted +6 positions in reverse alphabet. Decode it.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="input-horror"
                  style={{ maxWidth: '200px', borderColor: 'rgba(30,60,180,0.4)' }}
                  value={signalAnswer}
                  onChange={e => setSignalAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignalSubmit()}
                  placeholder="DECODED MESSAGE"
                />
                <button className="btn-horror" style={{ borderColor: 'var(--ice-blue)' }} onClick={handleSignalSubmit}>
                  DECRYPT
                </button>
              </div>
              {signalStatus === 'correct' && (
                <p style={{ color: '#00cc66', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  SIGNAL DECODED. DATA ACQUIRED.
                </p>
              )}
              {signalStatus === 'wrong' && (
                <p style={{ color: 'var(--blood-glow)', fontFamily: 'var(--mono)', marginTop: '1rem', fontSize: '0.85rem' }}>
                  INCORRECT DECRYPTION.
                </p>
              )}
            </div>
            {/* Binary decode progress */}
            <div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'rgba(100,150,255,0.4)', marginBottom: '0.5rem' }}>
                BINARY MESSAGE RECONSTRUCTION:
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ENCODED_MESSAGE.map((item, i) => (
                  <div key={i} style={{
                    fontFamily: 'var(--mono)', fontSize: '0.65rem',
                    color: decoded[i] ? '#6699ff' : 'rgba(100,150,255,0.2)',
                    padding: '4px 8px',
                    border: `1px solid ${decoded[i] ? 'rgba(100,150,255,0.5)' : 'rgba(100,150,255,0.1)'}`,
                  }}>
                    {decoded[i] ? item.char : item.code}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FILE EXPLORER */}
        {phase === 'file_explorer' && (
          <div className="section-enter">
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ice-blue)', letterSpacing: '0.2em', marginBottom: '1.5rem', textAlign: 'center' }}>
              HAWKINS CLASSIFIED FILE SYSTEM — {accessGranted}/2 FILES UNLOCKED
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="file-explorer" style={{ maxHeight: '400px', overflow: 'auto' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,50,100,0.3)', color: 'rgba(100,150,255,0.6)', fontSize: '0.7rem' }}>
                  C:\HAWKINS_LAB\CLASSIFIED\
                </div>
                {fileStates.map((file, i) => (
                  <div
                    key={i}
                    className={`file-row ${file.locked && !file.unlockCode ? 'locked' : file.locked ? '' : 'unlocked'}`}
                    onClick={() => handleFileClick(file)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                      {file.locked
                        ? <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z"/>
                        : <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      }
                    </svg>
                    {file.name}
                    {file.locked && file.unlockCode && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--blood)' }}>ENCRYPTED</span>
                    )}
                  </div>
                ))}
              </div>
              {/* File content / unlock panel */}
              <div className="file-explorer" style={{ padding: '12px', minHeight: '200px' }}>
                {openFile ? (
                  <>
                    <div style={{ color: '#6699ff', fontSize: '0.7rem', marginBottom: '12px', borderBottom: '1px solid rgba(0,50,100,0.3)', paddingBottom: '8px' }}>
                      {openFile.name}
                    </div>
                    {openFile.locked ? (
                      <div>
                        <p style={{ color: 'var(--blood)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                          ENCRYPTED — ENTER ACCESS CODE:
                        </p>
                        <input
                          className="input-horror"
                          style={{ borderColor: codeError ? 'var(--blood-glow)' : 'rgba(30,60,180,0.4)', fontSize: '0.85rem', padding: '8px 12px', marginBottom: '8px' }}
                          value={codeInput}
                          onChange={e => setCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
                          placeholder="ACCESS CODE"
                        />
                        <button className="btn-horror" style={{ width: '100%', padding: '8px', borderColor: 'var(--ice-blue)', fontSize: '0.75rem' }} onClick={handleCodeSubmit}>
                          DECRYPT
                        </button>
                        {codeError && (
                          <p style={{ color: 'var(--blood-glow)', fontSize: '0.7rem', marginTop: '0.5rem' }}>INVALID CODE</p>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(100,150,255,0.7)', fontSize: '0.75rem', lineHeight: 1.8 }}>
                        {openFile.content}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'rgba(100,150,255,0.3)', fontSize: '0.75rem' }}>
                    Select a file to view contents
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {phase === 'completed' && (
          <div className="section-enter" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--ice-blue)', letterSpacing: '0.3em', marginBottom: '1rem' }}>
                CLEARANCE LEVEL ELEVATED
              </div>
              <h2 className="horror-title" style={{ fontSize: '2.5rem', color: 'var(--ice-blue)', marginBottom: '1rem' }}
                data-text="CLASSIFIED ACCESS GRANTED">
                CLASSIFIED ACCESS GRANTED
              </h2>
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.8 }}>
                You know too much, {playerName}. The government will be in touch.
              </p>
              <div className="achievement" style={{ margin: '0 auto 2rem', display: 'inline-flex', borderColor: 'var(--ice-blue)', color: 'var(--ice-blue)' }}>
                CLASSIFIED ACCESS GRANTED
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-horror" style={{ borderColor: 'var(--ice-blue)' }} onClick={() => onComplete('CLASSIFIED AGENT')}>
                SECURE THE FILES
              </button>
              <button className="btn-horror" onClick={onBack} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button onClick={onBack} style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}>
            [ ABORT MISSION ]
          </button>
        </div>
      </div>
    </div>
  )
}
