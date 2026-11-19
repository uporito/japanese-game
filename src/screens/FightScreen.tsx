import { useEffect, useMemo, type ReactNode } from "react";
import { AnswerGrid } from "../components/AnswerGrid";
import { KanjiCard } from "../components/KanjiCard";
import { LivesDisplay } from "../components/LivesDisplay";
import { ProgressBar } from "../components/ProgressBar";
import { ENCOUNTER_INFO } from "../game/encounters";
import type { FightSetup } from "../game/fightEngine";
import type { FightOutcome } from "../game/runEngine";
import { useFightEngine } from "../game/useFightEngine";

interface FightScreenProps {
  setup: FightSetup;
  context: string;
  headerExtras: ReactNode;
  onEnd: (outcome: FightOutcome) => void;
}

export function FightScreen({ setup, context, headerExtras, onEnd }: FightScreenProps) {
  const { state, question, answer } = useFightEngine(setup);

  useEffect(() => {
    if (state.status === "playing") return;
    onEnd({
      won: state.status === "won",
      livesLeft: state.lives,
      correctCount: state.correctCount,
      answeredCount: state.correctCount + state.mistakes.length,
      mistakes: state.mistakes,
    });
  }, [state, onEnd]);

  const missedIndices = useMemo(() => {
    const missedIds = new Set(state.mistakes.map((entry) => entry.id));
    const indices = new Set<number>();
    state.questions.forEach((q, i) => {
      if (missedIds.has(q.entry.id)) indices.add(i);
    });
    return indices;
  }, [state.mistakes, state.questions]);

  const tookHit = state.feedback !== null && !state.feedback.correct;
  const info = ENCOUNTER_INFO[state.type];

  return (
    <div className={`screen fight ${tookHit ? "fight--hurt" : ""}`}>
      <header className="fight__header">
        <LivesDisplay lives={state.lives} maxLives={state.maxLives} />
        <div className="fight__context">{context}</div>
        <div className="fight__header-right">
          {headerExtras}
          <div className="fight__counter">
            {state.questionIndex + 1} / {state.questions.length}
          </div>
        </div>
      </header>

      <ProgressBar
        total={state.questions.length}
        questionIndex={state.questionIndex}
        missedIndices={missedIndices}
        answered={state.feedback !== null}
      />

      <main className="fight__arena">
        <div className="fight__prompt">
          <span className="fight__prompt-icon" lang="ja">
            {info.icon}
          </span>
          {info.prompt}
        </div>
        <KanjiCard key={question.entry.id} word={question.entry.word} feedback={state.feedback} />
      </main>

      <AnswerGrid
        choices={question.choices}
        correctAnswer={question.answer}
        feedback={state.feedback}
        japanese={question.type === "reading"}
        onAnswer={answer}
      />
    </div>
  );
}
