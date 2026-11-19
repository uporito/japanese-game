# japanese-game

A small rogue-like game to gamify personal Japanese learning.

## Current state (POC)

A single "fight" against N5 vocabulary:

- 20 kanji words drawn from a bank of ~160 N5 words, each with 4 multiple-choice meanings
- 3 lives: a wrong answer costs one, and every answer advances to the next word
- Survive all 20 to win; the result screen lists the words you missed, with readings
- Answer by clicking or with keys 1-4

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Project structure

```
src/
  data/n5Vocab.ts      vocabulary bank (kanji, reading, meaning)
  game/                UI-agnostic game logic
    fightEngine.ts     reducer: question generation, lives, win/lose
    useFightEngine.ts  React hook wrapping the engine + feedback timing
  screens/             Start, Fight, Result
  components/          KanjiCard, AnswerGrid, LivesDisplay, ProgressBar
  styles/index.css
```

Tech: Vite + React + TypeScript, plain CSS, no backend.

## Roadmap

1. Deploy as a static site (GitHub Pages / Vercel)
2. Chain multiple fights into an act
3. Full runs: Act 1 (N5), Act 2 (N4), Act 3 (N3), with saved progress
4. Items and powers (extra life, 50/50, reveal reading) picked between encounters
5. More exercise types: grammar, reading and listening comprehension
6. Visual polish: art per act, richer hit feedback
