import { describe, expect, it } from "vitest";
import { VOCAB_BY_LEVEL } from "../data/vocab";
import { seededRng } from "./random";
import { RUN_CONFIG } from "./runConfig";
import { createRun, createRunReducer, type FightOutcome, type RunState } from "./runEngine";

const rng = seededRng(9);
const reducer = createRunReducer(VOCAB_BY_LEVEL, rng);

function outcome(livesLeft: number, won = true): FightOutcome {
  return { won, livesLeft, correctCount: 10, answeredCount: 10, mistakes: [] };
}

function clearFight(state: RunState, livesLeft: number): RunState {
  return reducer(reducer(state, { type: "FIGHT_ENDED", outcome: outcome(livesLeft) }), { type: "CONTINUE" });
}

describe("run engine", () => {
  it("plans 3 acts of 3 fights with fresh words each fight", () => {
    let state = createRun(RUN_CONFIG, VOCAB_BY_LEVEL, rng);
    expect(state.acts.map((a) => a.level)).toEqual(["N5", "N4", "N3"]);
    expect(state.acts.every((a) => a.fights.length === 3)).toBe(true);
    const first = state.fightWords.map((w) => w.id);
    state = clearFight(state, 3);
    expect(state.fightWords.some((w) => first.includes(w.id))).toBe(false);
  });

  it("heals one life per fight, capped, and fully at a new act", () => {
    let state = createRun(RUN_CONFIG, VOCAB_BY_LEVEL, rng);
    state = reducer(state, { type: "FIGHT_ENDED", outcome: outcome(1) });
    expect(state.status).toBe("interlude");
    expect(state.lives).toBe(2);
    expect(state.lastHeal).toEqual({ amount: 1, reason: "fight" });

    state = reducer(state, { type: "CONTINUE" });
    state = reducer(state, { type: "FIGHT_ENDED", outcome: outcome(3) });
    expect(state.lives).toBe(3);
    expect(state.lastHeal).toBeNull();

    state = reducer(state, { type: "CONTINUE" });
    state = reducer(state, { type: "FIGHT_ENDED", outcome: outcome(1) });
    expect(state.lives).toBe(3);
    expect(state.lastHeal).toEqual({ amount: 2, reason: "act" });

    state = reducer(state, { type: "CONTINUE" });
    expect(state.actIndex).toBe(1);
    expect(state.fightIndex).toBe(0);
    expect(state.status).toBe("fighting");
  });

  it("ends the run when a fight is lost", () => {
    const state = reducer(createRun(RUN_CONFIG, VOCAB_BY_LEVEL, rng), {
      type: "FIGHT_ENDED",
      outcome: outcome(0, false),
    });
    expect(state.status).toBe("lost");
    expect(state.history).toHaveLength(1);
  });

  it("wins after the final fight of the final act", () => {
    let state = createRun(RUN_CONFIG, VOCAB_BY_LEVEL, rng);
    for (let i = 0; i < 8; i++) state = clearFight(state, 3);
    expect(state.actIndex).toBe(2);
    expect(state.fightIndex).toBe(2);
    state = reducer(state, { type: "FIGHT_ENDED", outcome: outcome(2) });
    expect(state.status).toBe("won");
  });

  it("debug skip jumps to the next act with full lives, and wins from the last act", () => {
    let state = createRun(RUN_CONFIG, VOCAB_BY_LEVEL, rng);
    state = reducer(state, { type: "FIGHT_ENDED", outcome: outcome(1) });
    state = reducer(state, { type: "DEBUG_SKIP_ACT" });
    expect(state.actIndex).toBe(1);
    expect(state.fightIndex).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.status).toBe("fighting");

    state = reducer(state, { type: "DEBUG_SKIP_ACT" });
    expect(state.actIndex).toBe(2);
    state = reducer(state, { type: "DEBUG_SKIP_ACT" });
    expect(state.status).toBe("won");
  });
});
