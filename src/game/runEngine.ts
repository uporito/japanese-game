import { selectWords } from "./fightEngine";
import { pickWeighted, type Rng } from "./random";
import type { RunConfig } from "./runConfig";
import type { EncounterType, JlptLevel, VocabEntry } from "./types";

export interface ActPlan {
  level: JlptLevel;
  fights: EncounterType[];
}

export interface FightOutcome {
  won: boolean;
  livesLeft: number;
  correctCount: number;
  answeredCount: number;
  mistakes: VocabEntry[];
}

export interface FightRecord extends FightOutcome {
  actIndex: number;
  fightIndex: number;
  type: EncounterType;
}

export interface Heal {
  amount: number;
  reason: "fight" | "act";
}

export type RunStatus = "fighting" | "interlude" | "won" | "lost";

export interface RunState {
  config: RunConfig;
  acts: ActPlan[];
  actIndex: number;
  fightIndex: number;
  lives: number;
  status: RunStatus;
  usedWordIds: ReadonlySet<string>;
  /** Words for the current fight, chosen when the fight starts. */
  fightWords: VocabEntry[];
  /** Changes whenever a new fight starts, so the fight UI can remount. */
  fightSerial: number;
  history: FightRecord[];
  lastHeal: Heal | null;
}

export type RunAction =
  | { type: "FIGHT_ENDED"; outcome: FightOutcome }
  | { type: "CONTINUE" }
  | { type: "DEBUG_SKIP_ACT" };

export type VocabByLevel = Record<JlptLevel, readonly VocabEntry[]>;

export function currentFightType(state: RunState): EncounterType {
  return state.acts[state.actIndex].fights[state.fightIndex];
}

export function currentLevel(state: RunState): JlptLevel {
  return state.acts[state.actIndex].level;
}

export function isLastFightOfAct(state: RunState): boolean {
  return state.fightIndex === state.acts[state.actIndex].fights.length - 1;
}

export function isLastAct(state: RunState): boolean {
  return state.actIndex === state.acts.length - 1;
}

function enterFight(
  state: RunState,
  actIndex: number,
  fightIndex: number,
  vocab: VocabByLevel,
  rng: Rng,
): RunState {
  const act = state.acts[actIndex];
  const words = selectWords(
    vocab[act.level],
    act.fights[fightIndex],
    state.config.wordsPerFight,
    state.usedWordIds,
    rng,
  );
  return {
    ...state,
    actIndex,
    fightIndex,
    status: "fighting",
    fightWords: words,
    fightSerial: state.fightSerial + 1,
    usedWordIds: new Set([...state.usedWordIds, ...words.map((w) => w.id)]),
  };
}

export function createRun(config: RunConfig, vocab: VocabByLevel, rng: Rng = Math.random): RunState {
  const acts: ActPlan[] = config.acts.map((level) => ({
    level,
    fights: Array.from({ length: config.fightsPerAct }, () => pickWeighted(config.encounterWeights, rng)),
  }));
  const initial: RunState = {
    config,
    acts,
    actIndex: 0,
    fightIndex: 0,
    lives: config.maxLives,
    status: "fighting",
    usedWordIds: new Set(),
    fightWords: [],
    fightSerial: 0,
    history: [],
    lastHeal: null,
  };
  return enterFight(initial, 0, 0, vocab, rng);
}

function heal(lives: number, state: RunState): { lives: number; heal: Heal | null } {
  const { maxLives, healPerFight, fullHealOnAct } = state.config;
  const reason = isLastFightOfAct(state) && fullHealOnAct ? "act" : "fight";
  const healed = reason === "act" ? maxLives : Math.min(maxLives, lives + healPerFight);
  return { lives: healed, heal: healed > lives ? { amount: healed - lives, reason } : null };
}

export function createRunReducer(vocab: VocabByLevel, rng: Rng = Math.random) {
  return function runReducer(state: RunState, action: RunAction): RunState {
    switch (action.type) {
      case "FIGHT_ENDED": {
        if (state.status !== "fighting") return state;
        const { outcome } = action;
        const history = [
          ...state.history,
          { ...outcome, actIndex: state.actIndex, fightIndex: state.fightIndex, type: currentFightType(state) },
        ];
        if (!outcome.won) {
          return { ...state, history, lives: 0, status: "lost", lastHeal: null };
        }
        if (isLastAct(state) && isLastFightOfAct(state)) {
          return { ...state, history, lives: outcome.livesLeft, status: "won", lastHeal: null };
        }
        const healed = heal(outcome.livesLeft, state);
        return { ...state, history, lives: healed.lives, lastHeal: healed.heal, status: "interlude" };
      }

      case "CONTINUE": {
        if (state.status !== "interlude") return state;
        const next = isLastFightOfAct(state)
          ? { act: state.actIndex + 1, fight: 0 }
          : { act: state.actIndex, fight: state.fightIndex + 1 };
        return enterFight({ ...state, lastHeal: null }, next.act, next.fight, vocab, rng);
      }

      case "DEBUG_SKIP_ACT": {
        if (state.status !== "fighting" && state.status !== "interlude") return state;
        if (isLastAct(state)) return { ...state, status: "won", lastHeal: null };
        // As if the rest of the act were cleared perfectly: act-end full heal applies.
        const lives = state.config.fullHealOnAct ? state.config.maxLives : state.lives;
        return enterFight({ ...state, lives, lastHeal: null }, state.actIndex + 1, 0, vocab, rng);
      }
    }
  };
}
