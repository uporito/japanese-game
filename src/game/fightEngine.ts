import type { FightAction, FightConfig, FightState, Question, VocabEntry } from "./types";

export const DEFAULT_FIGHT_CONFIG: FightConfig = {
  questionCount: 20,
  maxLives: 3,
};

const CHOICES_PER_QUESTION = 4;

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildQuestion(entry: VocabEntry, pool: readonly VocabEntry[]): Question {
  const distractors = shuffle(
    pool.filter((other) => other.id !== entry.id && other.meaning !== entry.meaning),
  )
    .map((other) => other.meaning)
    .filter((meaning, i, all) => all.indexOf(meaning) === i)
    .slice(0, CHOICES_PER_QUESTION - 1);

  return { entry, choices: shuffle([entry.meaning, ...distractors]) };
}

export function createFight(
  pool: readonly VocabEntry[],
  config: FightConfig = DEFAULT_FIGHT_CONFIG,
): FightState {
  if (pool.length < Math.max(config.questionCount, CHOICES_PER_QUESTION)) {
    throw new Error(`Vocab pool too small: ${pool.length} entries`);
  }

  const questions = shuffle(pool)
    .slice(0, config.questionCount)
    .map((entry) => buildQuestion(entry, pool));

  return {
    config,
    questions,
    questionIndex: 0,
    lives: config.maxLives,
    correctCount: 0,
    status: "playing",
    feedback: null,
    mistakes: [],
  };
}

export function currentQuestion(state: FightState): Question {
  return state.questions[state.questionIndex];
}

export function fightReducer(state: FightState, action: FightAction): FightState {
  if (state.status !== "playing") return state;

  switch (action.type) {
    case "ANSWER": {
      if (state.feedback) return state;
      const question = currentQuestion(state);
      const correct = action.choice === question.entry.meaning;
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
