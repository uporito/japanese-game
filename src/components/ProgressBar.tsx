interface ProgressBarProps {
  total: number;
  questionIndex: number;
  missedIndices: ReadonlySet<number>;
  answered: boolean;
}

/** Enemy HP: each question is one segment, struck off once answered. */
export function ProgressBar({ total, questionIndex, missedIndices, answered }: ProgressBarProps) {
  const resolvedCount = questionIndex + (answered ? 1 : 0);
  return (
    <div className="enemy-hp">
      <div className="enemy-hp__label">
        Enemy HP {total - resolvedCount} / {total}
      </div>
      <div className="enemy-hp__bar">
        {Array.from({ length: total }, (_, i) => {
          let modifier = "segment--alive";
          if (i < resolvedCount) {
            modifier = missedIndices.has(i) ? "segment--missed" : "segment--hit";
          } else if (i === questionIndex) {
            modifier = "segment--current";
          }
          return <span key={i} className={`segment ${modifier}`} />;
        })}
      </div>
    </div>
  );
}
