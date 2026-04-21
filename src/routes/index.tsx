import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { GlobalEffects } from '@/components/GlobalEffects'
import { HomeHub } from '@/components/HomeHub'
import { CharacterSelect } from '@/components/CharacterSelect'
import { VecnasCurse } from '@/components/games/VecnasCurse'
import { UpsideDownEscape } from '@/components/games/UpsideDownEscape'
import { ElevenTestLab } from '@/components/games/ElevenTestLab'
import { StrangerSignals } from '@/components/games/StrangerSignals'
import { FinalChallenge } from '@/components/games/FinalChallenge'
import { ChatWithEleven } from '@/components/ChatWithEleven'
import { EndingScreen } from '@/components/EndingScreen'
import { loadState, saveState, clearState, type GamePhase } from '@/lib/gameStore'
import { initAudio } from '@/lib/audioEngine'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [phase, setPhase] = useState<GamePhase>('entry')
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState('eleven')
  const [completedGames, setCompletedGames] = useState<string[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [upsideDownMode, setUpsideDownMode] = useState(false)
  const [entryProgress, setEntryProgress] = useState(0)
  const [entryMessages, setEntryMessages] = useState<string[]>([])
  const audioStarted = useRef(false)

  // Load saved state
  useEffect(() => {
    const saved = loadState()
    if (saved.playerName) setPlayerName(saved.playerName)
    if (saved.selectedCharacter) setSelectedCharacter(saved.selectedCharacter)
    if (saved.completedGames) setCompletedGames(saved.completedGames)
    if (saved.achievements) setAchievements(saved.achievements)
    if (saved.phase && saved.phase !== 'entry') setPhase(saved.phase)
  }, [])

  // Save state on change
  useEffect(() => {
    if (playerName) {
      saveState({ phase, playerName, selectedCharacter, completedGames, achievements })
    }
  }, [phase, playerName, selectedCharacter, completedGames, achievements])

  // Entry animation sequence
  useEffect(() => {
    if (phase !== 'entry') return

    const msgs = [
      'INITIATING HAWKINS LABORATORY PROTOCOL...',
      'SCANNING NEURAL PATHWAYS...',
      'ENTITY DETECTION: ACTIVE',
      'GATE STATUS: UNSTABLE',
      'ESTABLISHING PSYCHIC LINK...',
      'WARNING: DO NOT ATTEMPT TO CLOSE THIS CONNECTION',
      'ENTER IF YOU DARE.',
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i < msgs.length) {
        setEntryMessages(prev => [...prev, msgs[i]])
        i++
      } else {
        clearInterval(interval)
      }
      setEntryProgress(p => Math.min(100, p + 100 / msgs.length))
    }, 600)

    return () => clearInterval(interval)
  }, [phase])

  const handleAudioStart = () => {
    if (!audioStarted.current) {
      audioStarted.current = true
      initAudio()
    }
  }

  const handleEnterExperience = () => {
    handleAudioStart()
    setPhase('name_input')
  }

  const handleNameSubmit = () => {
    if (!nameInput.trim()) {
      setNameError('A name is required. Vecna needs to know who you are.')
      return
    }
    if (nameInput.trim().length < 2) {
      setNameError('Enter at least 2 characters.')
      return
    }
    setPlayerName(nameInput.trim())
    setPhase('home_hub')
  }

  const handleGameComplete = (gameId: string, achievement: string) => {
    const updated = completedGames.includes(gameId) ? completedGames : [...completedGames, gameId]
    const updatedAch = achievements.includes(achievement) ? achievements : [...achievements, achievement]
    setCompletedGames(updated)
    setAchievements(updatedAch)
    if (gameId === 'upside_down') setUpsideDownMode(false)
    setPhase('home_hub')
  }

  const handleGameSelect = (gameId: string) => {
    if (gameId === 'upside_down') setUpsideDownMode(false)
    if (gameId === 'chat_eleven') setPhase('chat_eleven')
    else setPhase(gameId as GamePhase)
  }

  const handleRestart = () => {
    clearState()
    setPhase('entry')
    setPlayerName('')
    setNameInput('')
    setCompletedGames([])
    setAchievements([])
    setEntryMessages([])
    setEntryProgress(0)
    setUpsideDownMode(false)
  }

  const isUpsideDown = phase === 'upside_down' || upsideDownMode

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <GlobalEffects upsideDown={isUpsideDown} />

      {/* ENTRY SCREEN */}
      {phase === 'entry' && (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--deep-void)', padding: '2rem', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at center, rgba(60,5,5,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ width: '100%', maxWidth: '700px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(140,10,10,0.6)', letterSpacing: '0.5em', marginBottom: '1rem' }}>
                HAWKINS NATIONAL LABORATORY
              </div>
              <h1 className="glitch-text horror-title" data-text="THE UPSIDE DOWN"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                THE UPSIDE DOWN
              </h1>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', color: 'var(--blood)', letterSpacing: '0.3em', marginTop: '0.5rem' }}>
                A STRANGER THINGS EXPERIENCE
              </div>
            </div>

            <div style={{
              background: 'rgba(3,2,8,0.8)', border: '1px solid rgba(140,10,10,0.2)',
              padding: '1.5rem', marginBottom: '2rem', minHeight: '180px', textAlign: 'left',
            }}>
              {entryMessages.map((msg, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--mono)', fontSize: '0.72rem',
                  color: i === entryMessages.length - 1 ? 'var(--blood-bright)' : 'rgba(180,20,20,0.5)',
                  letterSpacing: '0.1em', lineHeight: 2, animation: 'fade-in 0.5s ease',
                }}>
                  &gt; {msg}
                </div>
              ))}
              {entryMessages.length > 0 && entryMessages.length < 7 && (
                <span style={{ color: 'var(--blood-bright)', animation: 'blink 1s step-end infinite', fontFamily: 'var(--mono)' }}>_</span>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                <div style={{
                  height: '100%', background: 'linear-gradient(90deg, var(--blood), var(--blood-glow))',
                  width: `${entryProgress}%`, transition: 'width 0.6s ease',
                  boxShadow: '0 0 10px var(--blood)',
                }} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                {Math.round(entryProgress)}%
              </div>
            </div>

            {entryProgress >= 85 && (
              <div style={{ animation: 'fade-in 0.8s ease' }}>
                <button className="btn-horror pulse-red" onClick={handleEnterExperience}
                  style={{ fontSize: '0.85rem', letterSpacing: '0.3em', padding: '14px 40px' }}>
                  ENTER THE UPSIDE DOWN
                </button>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'rgba(140,10,10,0.3)', marginTop: '1rem', letterSpacing: '0.2em' }}>
                  HEADPHONES RECOMMENDED — SOUND ON FOR FULL EXPERIENCE
                </p>
                {playerName && (
                  <button onClick={() => setPhase('home_hub')}
                    style={{ display: 'block', margin: '1rem auto 0', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(140,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}>
                    [ RESUME AS {playerName.toUpperCase()} ]
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAME INPUT */}
      {phase === 'name_input' && (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--deep-void)', padding: '2rem',
        }}>
          <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(140,10,10,0.6)', letterSpacing: '0.4em', marginBottom: '0.5rem' }}>
              NEURAL IDENTIFICATION REQUIRED
            </div>
            <h2 className="horror-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}
              data-text="WHO ARE YOU?">
              WHO ARE YOU?
            </h2>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2.5rem', lineHeight: 1.8 }}>
              Vecna needs to know your name.<br />It will follow you through every trial.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <input
                className="input-horror"
                style={{ maxWidth: '360px', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError('') }}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                placeholder="ENTER YOUR NAME"
                autoFocus
                maxLength={30}
              />
              {nameError && (
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--blood-glow)' }}>
                  {nameError}
                </p>
              )}
              <button className="btn-horror" onClick={handleNameSubmit} style={{ marginTop: '0.5rem', letterSpacing: '0.3em' }}>
                CONFIRM IDENTITY
              </button>
            </div>
            {playerName && (
              <button onClick={() => setPhase('home_hub')}
                style={{ marginTop: '2rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'rgba(140,10,10,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.2em' }}>
                [ RESUME AS {playerName.toUpperCase()} ]
              </button>
            )}
          </div>
        </div>
      )}

      {/* HOME HUB */}
      {phase === 'home_hub' && (
        <HomeHub
          playerName={playerName}
          selectedCharacter={selectedCharacter}
          completedGames={completedGames}
          achievements={achievements}
          onSelectGame={handleGameSelect}
          onCharacterSelect={() => setPhase('character_select')}
        />
      )}

      {/* CHARACTER SELECT */}
      {phase === 'character_select' && (
        <CharacterSelect
          playerName={playerName}
          currentCharacter={selectedCharacter}
          onSelect={(char) => { setSelectedCharacter(char); setPhase('home_hub') }}
          onBack={() => setPhase('home_hub')}
        />
      )}

      {/* GAMES */}
      {phase === 'vecnas_curse' && (
        <VecnasCurse playerName={playerName}
          onComplete={(ach) => handleGameComplete('vecnas_curse', ach)}
          onBack={() => setPhase('home_hub')} />
      )}
      {phase === 'upside_down' && (
        <UpsideDownEscape playerName={playerName}
          onComplete={(ach) => handleGameComplete('upside_down', ach)}
          onBack={() => setPhase('home_hub')} />
      )}
      {phase === 'eleven_lab' && (
        <ElevenTestLab playerName={playerName}
          onComplete={(ach) => handleGameComplete('eleven_lab', ach)}
          onBack={() => setPhase('home_hub')} />
      )}
      {phase === 'stranger_signals' && (
        <StrangerSignals playerName={playerName}
          onComplete={(ach) => handleGameComplete('stranger_signals', ach)}
          onBack={() => setPhase('home_hub')} />
      )}
      {phase === 'final_challenge' && (
        <FinalChallenge playerName={playerName}
          onComplete={(ach) => handleGameComplete('final_challenge', ach)}
          onBack={() => setPhase('home_hub')} />
      )}

      {/* CHAT WITH ELEVEN */}
      {phase === 'chat_eleven' && (
        <ChatWithEleven playerName={playerName} onEnd={() => setPhase('ending')} />
      )}

      {/* ENDING */}
      {phase === 'ending' && <EndingScreen onRestart={handleRestart} />}
    </div>
  )
}
