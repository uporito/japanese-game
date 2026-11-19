import { useEffect, useMemo } from "react";
import { AnswerGrid } from "../components/AnswerGrid";
import { KanjiCard } from "../components/KanjiCard";
import { LivesDisplay } from "../components/LivesDisplay";
import { ProgressBar } from "../components/ProgressBar";
import { useFightEngine } from "../game/useFightEngine";
import type { VocabEntry } from "../game/types";

export interface FightResult {
  outcome: "won" | "lost";
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  mistakes: VocabEntry[];
}

interface FightScreenProps {
  pool: readonly VocabEntry[];
  onEnd: (result: FightResult) => void;
}

export function FightScreen({ pool, onEnd }: FightScreenProps) {
  const { state, question, answer } = useFightEngine(pool);

  useEffect(() => {
    if (state.status === "playing") return;
    onEnd({
      outcome: state.status,
      correctCount: state.correctCount,
      answeredCount: state.correctCount + state.mistakes.length,
      totalQuestions: state.questions.length,
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

  return (
    <div className={`screen fight ${tookHit ? "fight--hurt" : ""}`}>
      <header className="fight__header">
        <LivesDisplay lives={state.lives} maxLives={state.config.maxLives} />
        <div className="fight__counter">
          {state.questionIndex + 1} / {state.questions.length}
        </div>
      </header>

      <ProgressBar
        total={state.questions.length}
        questionIndex={state.questionIndex}
        missedIndices={missedIndices}
        answered={state.feedback !== null}
      />

      <main className="fight__arena">
        <KanjiCard key={question.entry.id} kanji={question.entry.kanji} feedback={state.feedback} />
      </main>

      <AnswerGrid
        choices={question.choices}
        correctAnswer={question.entry.meaning}
        feedback={state.feedback}
        onAnswer={answer}
      />
    </div>
  );
}
