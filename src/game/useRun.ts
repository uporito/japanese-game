import { useCallback, useMemo, useReducer } from "react";
import { VOCAB_BY_LEVEL } from "../data/vocab";
import { RUN_CONFIG } from "./runConfig";
import { createRun, createRunReducer, type FightOutcome } from "./runEngine";

export function useRun() {
  const reducer = useMemo(() => createRunReducer(VOCAB_BY_LEVEL), []);
  const [state, dispatch] = useReducer(reducer, undefined, () => createRun(RUN_CONFIG, VOCAB_BY_LEVEL));

  const endFight = useCallback((outcome: FightOutcome) => dispatch({ type: "FIGHT_ENDED", outcome }), []);
  const continueRun = useCallback(() => dispatch({ type: "CONTINUE" }), []);
  const skipAct = useCallback(() => dispatch({ type: "DEBUG_SKIP_ACT" }), []);

  return { state, endFight, continueRun, skipAct };
}
