import type { AnswerFeedback } from "../game/types";

interface KanjiCardProps {
  kanji: string;
  feedback: AnswerFeedback | null;
}

export function KanjiCard({ kanji, feedback }: KanjiCardProps) {
  const state = feedback ? (feedback.correct ? "hit" : "miss") : "idle";
  return (
    <div className={`kanji-card kanji-card--${state}`} lang="ja">
      {kanji}
    </div>
  );
}
