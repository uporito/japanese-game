import { describe, expect, it } from "vitest";
import { VOCAB } from "../data/vocab";
import { DEFAULT_FILTERS, filterWords } from "./library";
import type { StatsData } from "./stats";

const taberu = VOCAB.find((e) => e.word === "食べる")!;
const nomu = VOCAB.find((e) => e.word === "飲む")!;
const stats: StatsData = {
  version: 1,
  words: {
    [taberu.id]: { meaning: { seen: 3, correct: 3 } },
    [nomu.id]: { meaning: { seen: 2, correct: 0 }, reading: { seen: 1, correct: 1 } },
  },
};

describe("filterWords", () => {
  it("returns everything by default", () => {
    expect(filterWords(VOCAB, stats, DEFAULT_FILTERS)).toHaveLength(VOCAB.length);
  });

  it("filters by level, class and script", () => {
    const rows = filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, levels: ["N4"], wordClass: "verb", script: "kanji" });
    expect(rows.length).toBeGreaterThan(0);
    for (const { entry } of rows) {
      expect(entry.level).toBe("N4");
      expect(entry.wordClass).toBe("verb");
      expect(entry.isKana).toBe(false);
    }
  });

  it("searches word, reading and English", () => {
    for (const search of ["食べ", "たべる", "TO EAT"]) {
      const rows = filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, search });
      expect(rows.map((r) => r.entry.id)).toContain(taberu.id);
    }
  });

  it("filters by status within the selected mode", () => {
    const seen = filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, status: "seen" });
    expect(seen.map((r) => r.entry.id).sort()).toEqual([taberu.id, nomu.id].sort());
    const readingMistakes = filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, status: "mistakes", mode: "reading" });
    expect(readingMistakes).toHaveLength(0);
    expect(filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, status: "unseen" })).toHaveLength(VOCAB.length - 2);
  });

  it("sorts weakest first with unseen last", () => {
    const rows = filterWords(VOCAB, stats, { ...DEFAULT_FILTERS, sort: "accuracy" });
    expect(rows[0].entry.id).toBe(nomu.id);
    expect(rows[1].entry.id).toBe(taberu.id);
  });
});
