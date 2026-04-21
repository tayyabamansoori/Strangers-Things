export type GamePhase =
  | 'entry'
  | 'name_input'
  | 'home_hub'
  | 'character_select'
  | 'vecnas_curse'
  | 'upside_down'
  | 'eleven_lab'
  | 'stranger_signals'
  | 'final_challenge'
  | 'chat_eleven'
  | 'ending'

export interface GameState {
  phase: GamePhase
  playerName: string
  selectedCharacter: string
  completedGames: string[]
  achievements: string[]
  upsideDownMode: boolean
  tensionLevel: number // 0-10
}

const STORAGE_KEY = 'upside_down_game_state'

export function loadState(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveState(state: Partial<GameState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}
