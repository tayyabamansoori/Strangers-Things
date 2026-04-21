// Web Audio API synthesis engine for horror atmosphere

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let droneOscillators: OscillatorNode[] = []
let heartbeatInterval: ReturnType<typeof setInterval> | null = null
let isInitialized = false
let isMuted = false
let bgmAudio: HTMLAudioElement | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    masterGain.gain.setValueAtTime(0.6, ctx.currentTime)
  }
  return ctx
}

function getMaster(): GainNode {
  getCtx()
  return masterGain!
}

export function initAudio() {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true

  // Start BGM
  bgmAudio = new Audio('/strangerthings_theme.mp3')
  bgmAudio.loop = true
  bgmAudio.volume = 0.35
  bgmAudio.play().catch(() => { /* autoplay blocked */ })

  // Ambient drone layer
  const audioCtx = getCtx()
  const frequencies = [40, 60, 80, 120]
  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const oscGain = audioCtx.createGain()
    osc.type = i % 2 === 0 ? 'sawtooth' : 'sine'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    oscGain.gain.setValueAtTime(0.02 / (i + 1), audioCtx.currentTime)
    osc.connect(oscGain)
    oscGain.connect(getMaster())
    osc.start()
    droneOscillators.push(osc)

    // Subtle LFO modulation
    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.frequency.setValueAtTime(0.05 + i * 0.02, audioCtx.currentTime)
    lfoGain.gain.setValueAtTime(2, audioCtx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()
  })
}

export function playGlitch() {
  if (typeof window === 'undefined') return
  try {
    const audioCtx = getCtx()
    const bufferSize = audioCtx.sampleRate * 0.15
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = audioCtx.createBufferSource()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800 + Math.random() * 2000, audioCtx.currentTime)
    filter.Q.setValueAtTime(0.5, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(getMaster())
    source.start()
  } catch { /* ignore */ }
}

export function playHeartbeat() {
  if (typeof window === 'undefined') return
  try {
    const audioCtx = getCtx()
    ;[0, 0.12].forEach(delay => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(60, audioCtx.currentTime + delay)
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.15)
      osc.connect(gain)
      gain.connect(getMaster())
      osc.start(audioCtx.currentTime + delay)
      osc.stop(audioCtx.currentTime + delay + 0.2)
    })
  } catch { /* ignore */ }
}

export function startHeartbeat(bpm = 60) {
  stopHeartbeat()
  playHeartbeat()
  heartbeatInterval = setInterval(() => playHeartbeat(), (60 / bpm) * 1000)
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

export function playSuccess() {
  if (typeof window === 'undefined') return
  try {
    const audioCtx = getCtx()
    const freqs = [261, 329, 392, 523]
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      const t = audioCtx.currentTime + i * 0.1
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.connect(gain)
      gain.connect(getMaster())
      osc.start(t)
      osc.stop(t + 0.5)
    })
  } catch { /* ignore */ }
}

export function playError() {
  if (typeof window === 'undefined') return
  try {
    const audioCtx = getCtx()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(getMaster())
    osc.start()
    osc.stop(audioCtx.currentTime + 0.3)
  } catch { /* ignore */ }
}

export function setMuted(muted: boolean) {
  isMuted = muted
  if (masterGain) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.6, getCtx().currentTime, 0.3)
  }
  if (bgmAudio) {
    bgmAudio.volume = muted ? 0 : 0.35
  }
}

export function getMuted() {
  return isMuted
}

export function setTension(level: number) {
  // level 0-10: affects drone pitch and rhythm
  if (masterGain && ctx) {
    const vol = 0.4 + level * 0.06
    masterGain.gain.setTargetAtTime(isMuted ? 0 : vol, ctx.currentTime, 0.5)
  }
  if (bgmAudio) {
    bgmAudio.playbackRate = 1 + level * 0.02
  }
}
