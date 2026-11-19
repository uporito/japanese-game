import type { FightResult } from "./FightScreen";

interface ResultScreenProps {
  result: FightResult;
  onPlayAgain: () => void;
}

export function ResultScreen({ result, onPlayAgain }: ResultScreenProps) {
  const won = result.outcome === "won";
  return (
    <div className={`screen result result--${result.outcome}`}>
      <h1 className="title">{won ? "Victory!" : "Defeated"}</h1>
      <p className="subtitle">
        {result.correctCount} correct out of {result.answeredCount} answered
        {won ? "" : ` — the enemy had ${result.totalQuestions - result.answeredCount} HP left`}
      </p>

      {result.mistakes.length > 0 && (
        <section className="mistakes">
          <h2>Words to review</h2>
          <ul>
            {result.mistakes.map((entry) => (
              <li key={entry.id}>
                <span className="mistakes__kanji" lang="ja">
                  {entry.kanji}
                </span>
                <span className="mistakes__reading" lang="ja">
                  {entry.reading}
                </span>
                <span className="mistakes__meaning">{entry.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button className="primary-button" onClick={onPlayAgain} autoFocus>
        Play again
      </button>
    </div>
  );
}
