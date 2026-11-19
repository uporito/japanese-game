import type { CSSProperties } from "react";
import type { AnswerFeedback } from "../game/types";

interface KanjiCardProps {
  word: string;
  feedback: AnswerFeedback | null;
}

export function KanjiCard({ word, feedback }: KanjiCardProps) {
  const state = feedback ? (feedback.correct ? "hit" : "miss") : "idle";
  const style = { "--chars": Math.max([...word].length, 2) } as CSSProperties;
  return (
    <div className={`kanji-card kanji-card--${state}`} style={style} lang="ja">
      {word}
    </div>
  );
}
