import { describe, expect, it } from "vitest";
import { VOCAB_BY_LEVEL } from "../data/vocab";
import { createFight, currentQuestion, fightReducer, selectWords } from "./fightEngine";
import { seededRng } from "./random";
import type { FightState } from "./types";

const pool = VOCAB_BY_LEVEL.N5;

function newFight(startingLives = 3, count = 5): FightState {
  const rng = seededRng(42);
  const words = selectWords(pool, "meaning", count, new Set(), rng);
  return createFight({ type: "meaning", words, pool, startingLives, maxLives: 3, rng });
}

function answer(state: FightState, correct: boolean): FightState {
  const q = currentQuestion(state);
  const choice = correct ? q.answer : q.choices.find((c) => c !== q.answer)!;
  return fightReducer(fightReducer(state, { type: "ANSWER", choice }), { type: "NEXT" });
}

describe("selectWords", () => {
  it("skips used ids and words the encounter can't ask", () => {
    const used = new Set(pool.slice(0, 300).map((e) => e.id));
    const words = selectWords(pool, "reading", 10, used, seededRng(1));
    expect(words).toHaveLength(10);
    for (const w of words) {
      expect(used.has(w.id)).toBe(false);
      expect(w.readingQuizzable).toBe(true);
    }
  });
});

describe("fightReducer", () => {
  it("wins after surviving every question", () => {
    let state = newFight();
    state = answer(state, false);
    for (let i = 0; i < 4; i++) state = answer(state, true);
    expect(state.status).toBe("won");
    expect(state.lives).toBe(2);
    expect(state.correctCount).toBe(4);
    expect(state.mistakes).toHaveLength(1);
  });

  it("loses when lives carried in from the run run out", () => {
    let state = newFight(1);
    state = answer(state, false);
    expect(state.status).toBe("lost");
  });

  it("ignores a second answer during feedback", () => {
    const state = newFight();
    const q = currentQuestion(state);
    const once = fightReducer(state, { type: "ANSWER", choice: "wrong" });
    const twice = fightReducer(once, { type: "ANSWER", choice: q.answer });
    expect(twice).toBe(once);
  });
});
