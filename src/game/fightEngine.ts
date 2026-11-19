import { buildQuestion, canAsk } from "./questions";
import { shuffle, type Rng } from "./random";
import type { EncounterType, FightAction, FightState, VocabEntry } from "./types";

export interface FightSetup {
  type: EncounterType;
  words: readonly VocabEntry[];
  pool: readonly VocabEntry[];
  startingLives: number;
  maxLives: number;
  rng?: Rng;
}

/** Picks fight words the encounter can ask about, skipping already-used ids and duplicate spellings. */
export function selectWords(
  pool: readonly VocabEntry[],
  type: EncounterType,
  count: number,
  usedIds: ReadonlySet<string>,
  rng: Rng = Math.random,
): VocabEntry[] {
  const picked: VocabEntry[] = [];
  const spellings = new Set<string>();
  for (const entry of shuffle(pool, rng)) {
    if (picked.length === count) break;
    if (usedIds.has(entry.id) || spellings.has(entry.word) || !canAsk(type, entry)) continue;
    picked.push(entry);
    spellings.add(entry.word);
  }
  if (picked.length < count) {
    throw new Error(`Only ${picked.length} of ${count} ${type} words available`);
  }
  return picked;
}

export function createFight({ type, words, pool, startingLives, maxLives, rng }: FightSetup): FightState {
  return {
    type,
    maxLives,
    questions: words.map((entry) => buildQuestion(type, entry, pool, rng)),
    questionIndex: 0,
    lives: startingLives,
    correctCount: 0,
    status: "playing",
    feedback: null,
    mistakes: [],
  };
}

export function currentQuestion(state: FightState) {
  return state.questions[state.questionIndex];
}

export function fightReducer(state: FightState, action: FightAction): FightState {
  if (state.status !== "playing") return state;

  switch (action.type) {
    case "ANSWER": {
      if (state.feedback) return state;
      const question = currentQuestion(state);
      const correct = action.choice === question.answer;
      return {
        ...state,
        feedback: { choice: action.choice, correct },
        lives: correct ? state.lives : state.lives - 1,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
        mistakes: correct ? state.mistakes : [...state.mistakes, question.entry],
      };
    }

    case "NEXT": {
      if (!state.feedback) return state;
      if (state.lives <= 0) {
        return { ...state, feedback: null, status: "lost" };
      }
      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, feedback: null, status: "won" };
      }
      return { ...state, feedback: null, questionIndex: nextIndex };
    }
  }
}
