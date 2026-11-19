import type { VocabEntry } from "../game/types";

export function MistakeList({ words }: { words: VocabEntry[] }) {
  if (words.length === 0) return null;
  return (
    <section className="mistakes">
      <h2>Words to review</h2>
      <ul>
        {words.map((entry) => (
          <li key={entry.id}>
            <span className="mistakes__kanji" lang="ja">
              {entry.word}
            </span>
            <span className="mistakes__reading" lang="ja">
              {entry.isKana ? "" : entry.reading}
            </span>
            <span className="mistakes__meaning">{entry.gloss}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
