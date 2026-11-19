import { useCallback, useEffect, useReducer } from "react";
import { createFight, currentQuestion, fightReducer, type FightSetup } from "./fightEngine";
import { statsStore } from "./stats";

const FEEDBACK_DURATION_MS = { correct: 600, wrong: 1400 };

export function useFightEngine(setup: FightSetup) {
  const [state, dispatch] = useReducer(fightReducer, setup, createFight);
  const question = currentQuestion(state);

  const answer = useCallback(
    (choice: string) => {
      if (state.feedback || state.status !== "playing") return;
      statsStore.recordAnswer(question.entry.id, question.type, choice === question.answer);
      dispatch({ type: "ANSWER", choice });
    },
    [state.feedback, state.status, question],
  );

  useEffect(() => {
    if (!state.feedback) return;
    const delay = state.feedback.correct
      ? FEEDBACK_DURATION_MS.correct
      : FEEDBACK_DURATION_MS.wrong;
    const timer = setTimeout(() => dispatch({ type: "NEXT" }), delay);
    return () => clearTimeout(timer);
  }, [state.feedback]);

  return { state, question, answer };
}
