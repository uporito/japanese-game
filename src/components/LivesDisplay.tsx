interface LivesDisplayProps {
  lives: number;
  maxLives: number;
}

export function LivesDisplay({ lives, maxLives }: LivesDisplayProps) {
  return (
    <div className="lives" aria-label={`${lives} of ${maxLives} lives left`}>
      {Array.from({ length: maxLives }, (_, i) => (
        <span key={i} className={`heart ${i < lives ? "" : "heart--lost"}`}>
          ♥
        </span>
      ))}
    </div>
  );
}
