import type { WordClass } from "../data/wordClass";
import { summarize, type StatsData, type StatsMode } from "./stats";
import type { JlptLevel, VocabEntry } from "./types";

export interface LibraryFilters {
  /** Empty means every level. */
  levels: JlptLevel[];
  wordClass: WordClass | "all";
  script: "all" | "kana" | "kanji";
  status: "all" | "unseen" | "seen" | "mistakes";
  mode: StatsMode;
  search: string;
  sort: "default" | "seen" | "wrong" | "accuracy";
}

export const DEFAULT_FILTERS: LibraryFilters = {
  levels: [],
  wordClass: "all",
  script: "all",
  status: "all",
  mode: "all",
  search: "",
  sort: "default",
};

export interface LibraryRow {
  entry: VocabEntry;
  stats: ReturnType<typeof summarize>;
}

function matchesSearch(entry: VocabEntry, query: string): boolean {
  return (
    entry.word.includes(query) ||
    entry.reading.includes(query) ||
    entry.meanings.some((m) => m.toLowerCase().includes(query))
  );
}

export function filterWords(
  vocab: readonly VocabEntry[],
  stats: StatsData,
  filters: LibraryFilters,
): LibraryRow[] {
  const query = filters.search.trim().toLowerCase();
  const rows = vocab
    .filter((e) => filters.levels.length === 0 || filters.levels.includes(e.level))
    .filter((e) => filters.wordClass === "all" || e.wordClass === filters.wordClass)
    .filter((e) => filters.script === "all" || (filters.script === "kana") === e.isKana)
    .filter((e) => query === "" || matchesSearch(e, query))
    .map((entry) => ({ entry, stats: summarize(stats.words[entry.id], filters.mode) }))
    .filter(({ stats: s }) => {
      switch (filters.status) {
        case "all":
          return true;
        case "unseen":
          return s.seen === 0;
        case "seen":
          return s.seen > 0;
        case "mistakes":
          return s.wrong > 0;
      }
    });

  switch (filters.sort) {
    case "default":
      return rows;
    case "seen":
      return rows.sort((a, b) => b.stats.seen - a.stats.seen);
    case "wrong":
      return rows.sort((a, b) => b.stats.wrong - a.stats.wrong);
    case "accuracy":
      // Weakest first; unseen words go last.
      return rows.sort((a, b) => (a.stats.accuracy ?? 2) - (b.stats.accuracy ?? 2));
  }
}
