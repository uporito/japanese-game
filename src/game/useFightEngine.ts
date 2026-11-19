import { useCallback, useEffect, useReducer } from "react";
import { createFight, currentQuestion, fightReducer } from "./fightEngine";
import type { VocabEntry } from "./types";

const FEEDBACK_DURATION_MS = { correct: 600, wrong: 1400 };

export function useFightEngine(pool: readonly VocabEntry[]) {
  const [state, dispatch] = useReducer(fightReducer, pool, createFight);

  const answer = useCallback((choice: string) => {
    dispatch({ type: "ANSWER", choice });
  }, []);

  useEffect(() => {
    if (!state.feedback) return;
    const delay = state.feedback.correct
      ? FEEDBACK_DURATION_MS.correct
      : FEEDBACK_DURATION_MS.wrong;
    const timer = setTimeout(() => dispatch({ type: "NEXT" }), delay);
    return () => clearTimeout(timer);
  }, [state.feedback]);

  return { state, question: currentQuestion(state), answer };
}
