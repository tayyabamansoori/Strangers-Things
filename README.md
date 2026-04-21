# THE UPSIDE DOWN — A Stranger Things Experience

A cinematic, horror-based interactive web experience inspired by Stranger Things. This is not a website — it is an entity that watches you.

## What it is

A fully immersive psychological horror game experience with:

- **Cinematic Entry Sequence** — System boot terminal with progressive loading
- **Personalization System** — Player name used dynamically throughout all game interactions
- **3D Mind Flayer** — Procedural Three.js creature with breathing animation, red glowing eyes, and mouse-reactive movement
- **5 Interactive Game Modes** — Each a self-contained challenge module
- **Character Selection** — All 7 Stranger Things characters with stylized SVG portraits and cinematic hover effects
- **Chat with Eleven** — Emotional finale with slow-typed messages
- **Ending Screen** — Connection lost with static decay animation

## Game Modules

| # | Name | Mechanic |
|---|------|----------|
| 01 | Vecna's Curse | Memory sequences, logic puzzles, pattern recognition |
| 02 | Upside Down Escape | Christmas light decoding + maze navigation |
| 03 | Eleven Test Lab | Psychic sequence memory + object prediction |
| 04 | Stranger Signals | Signal decryption + classified file explorer |
| 05 | Vecna's Final Challenge | Color sequence + logic under timer pressure |

## Key Features

- **Persistent horror audio** — Stranger Things theme BGM + synthesized ambient drones
- **Web Audio API** — Heartbeat, glitch, success, and error sound effects
- **Film grain + scanlines** — CSS overlay effects
- **Cursor glow trail** — Red radial following mouse movement
- **Parallax depth** — Background layers reacting to mouse position
- **Random hidden messages** — Vecna watches text appearing periodically
- **Upside Down transformation** — Full CSS filter inversion with vine overlays
- **Screen shake + distortion** — On wrong answers and tense moments
- **Progress saved** — localStorage persistence with resume capability
- **Achievement system** — Earned badges for completing each module

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19 |
| 3D | Three.js (procedural) |
| Styling | Tailwind CSS 4 + custom CSS animations |
| Audio | Web Audio API synthesis + HTML Audio |
| State | React useState + localStorage |
| Fonts | Cinzel Decorative, Cinzel, Share Tech Mono |
| Deployment | Netlify |

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use headphones for full immersion.

## Environment

No environment variables required. Audio plays from `/public/strangerthings_theme.mp3`.
