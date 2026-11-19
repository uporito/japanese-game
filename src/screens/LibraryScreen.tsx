import { useMemo, useState } from "react";
import { VOCAB } from "../data/vocab";
import { WORD_CLASSES } from "../data/wordClass";
import { DEFAULT_FILTERS, filterWords, type LibraryFilters } from "../game/library";
import { statsStore, useStats } from "../game/stats";
import type { JlptLevel } from "../game/types";

const PAGE_SIZE = 50;
const LEVELS: JlptLevel[] = ["N5", "N4", "N3"];

export function LibraryScreen({ onBack }: { onBack: () => void }) {
  const stats = useStats();
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);

  const rows = useMemo(() => filterWords(VOCAB, stats, filters), [stats, filters]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const seenCount = VOCAB.filter((e) => stats.words[e.id]).length;

  function update<K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(0);
  }

  function toggleLevel(level: JlptLevel) {
    update(
      "levels",
      filters.levels.includes(level) ? filters.levels.filter((l) => l !== level) : [...filters.levels, level],
    );
  }

  function resetStats() {
    if (window.confirm("Reset all word stats? This cannot be undone.")) statsStore.reset();
  }

  return (
    <div className="screen library">
      <header className="library__header">
        <button className="ghost-button" onClick={onBack}>
          ← Menu
        </button>
        <h1>Word library</h1>
        <button className="danger-button" onClick={resetStats}>
          Reset stats
        </button>
      </header>

      <p className="library__summary">
        {seenCount} of {VOCAB.length.toLocaleString()} words seen · {rows.length.toLocaleString()} shown
      </p>

      <div className="library__filters">
        <input
          className="library__search"
          type="search"
          placeholder="Search word, reading or meaning"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
        />
        <div className="chip-group">
          {LEVELS.map((level) => (
            <button
              key={level}
              className={`chip ${filters.levels.includes(level) ? "chip--active" : ""}`}
              onClick={() => toggleLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
        <select value={filters.wordClass} onChange={(e) => update("wordClass", e.target.value as LibraryFilters["wordClass"])}>
          <option value="all">All classes</option>
          {WORD_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={filters.script} onChange={(e) => update("script", e.target.value as LibraryFilters["script"])}>
          <option value="all">Kana + kanji</option>
          <option value="kanji">Has kanji</option>
          <option value="kana">Kana only</option>
        </select>
        <select value={filters.status} onChange={(e) => update("status", e.target.value as LibraryFilters["status"])}>
          <option value="all">Any status</option>
          <option value="unseen">Never seen</option>
          <option value="seen">Seen</option>
          <option value="mistakes">Has mistakes</option>
        </select>
        <select value={filters.mode} onChange={(e) => update("mode", e.target.value as LibraryFilters["mode"])}>
          <option value="all">Stats: all modes</option>
          <option value="meaning">Stats: meaning</option>
          <option value="reading">Stats: reading</option>
        </select>
        <select value={filters.sort} onChange={(e) => update("sort", e.target.value as LibraryFilters["sort"])}>
          <option value="default">Sort: level order</option>
          <option value="seen">Sort: most seen</option>
          <option value="wrong">Sort: most wrong</option>
          <option value="accuracy">Sort: weakest first</option>
        </select>
      </div>

      <table className="word-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Meaning</th>
            <th>Level</th>
            <th>Class</th>
            <th className="num">Seen</th>
            <th className="num">✓</th>
            <th className="num">✗</th>
            <th className="num">Acc.</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(({ entry, stats: s }) => (
            <tr key={entry.id}>
              <td>
                <div className="word-table__word" lang="ja">
                  {entry.word}
                  {entry.isKana && <span className="badge">kana</span>}
                </div>
                {!entry.isKana && (
                  <div className="word-table__reading" lang="ja">
                    {entry.reading}
                  </div>
                )}
              </td>
              <td className="word-table__meaning">{entry.meanings.slice(0, 3).join("; ")}</td>
              <td>{entry.level}</td>
              <td className="word-table__class">{entry.wordClass}</td>
              <td className="num">{s.seen || ""}</td>
              <td className="num">{s.seen ? s.correct : ""}</td>
              <td className="num">{s.seen ? s.wrong : ""}</td>
              <td className="num">{s.accuracy === null ? "" : `${Math.round(s.accuracy * 100)}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="library__empty">No words match these filters.</p>}

      <nav className="pager">
        <button className="ghost-button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
          ← Prev
        </button>
        <span>
          Page {currentPage + 1} / {pageCount}
        </span>
        <button
          className="ghost-button"
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage(currentPage + 1)}
        >
          Next →
        </button>
      </nav>
    </div>
  );
}
