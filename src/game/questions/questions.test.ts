import { describe, expect, it } from "vitest";
import { VOCAB_BY_LEVEL } from "../../data/vocab";
import { seededRng } from "../random";
import { buildMeaningQuestion } from "./meaning";
import { buildReadingQuestion, kanjiRegion, mutateReading } from "./reading";

const LEVELS = ["N5", "N4", "N3"] as const;

describe("buildMeaningQuestion", () => {
  it.each(LEVELS)("builds fair questions for every %s word", (level) => {
    const pool = VOCAB_BY_LEVEL[level];
    const rng = seededRng(1);
    for (const entry of pool) {
      const q = buildMeaningQuestion(entry, pool, rng);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(entry.gloss);
      const targetMeanings = new Set(entry.meanings.map((m) => m.toLowerCase()));
      const distractorEntries = pool.filter((o) => o.id !== entry.id && q.choices.includes(o.gloss) && o.gloss !== entry.gloss);
      for (const other of distractorEntries) {
        // At least one entry with this gloss must share no meaning with the target.
        const sameGloss = pool.filter((o) => o.gloss === other.gloss);
        expect(sameGloss.some((o) => o.meanings.every((m) => !targetMeanings.has(m.toLowerCase())))).toBe(true);
      }
    }
  });

  it("prefers distractors of the same word class", () => {
    const pool = VOCAB_BY_LEVEL.N5;
    const verb = pool.find((e) => e.word === "食べる")!;
    const q = buildMeaningQuestion(verb, pool, seededRng(7));
    const glossClass = new Map(pool.map((e) => [e.gloss, e.wordClass]));
    for (const choice of q.choices) expect(glossClass.get(choice)).toBe("verb");
  });
});

describe("mutateReading", () => {
  it("produces distinct near-miss readings that differ from the answer", () => {
    const fakes = mutateReading("がっこう", seededRng(3));
    expect(fakes.length).toBeGreaterThanOrEqual(2);
    expect(new Set(fakes).size).toBe(fakes.length);
    for (const fake of fakes) {
      expect(fake).not.toBe("がっこう");
      expect("っゃゅょんー").not.toContain(fake[0]);
    }
  });
});

describe("kanjiRegion", () => {
  it("excludes kana that is visible in the word", () => {
    expect(kanjiRegion("食べる", "たべる")).toEqual({ start: 0, end: 1 });
    expect(kanjiRegion("お金", "おかね")).toEqual({ start: 1, end: 3 });
    expect(kanjiRegion("学校", "がっこう")).toEqual({ start: 0, end: 4 });
  });

  it("keeps mutations out of okurigana", () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const fake of mutateReading("のせる", seededRng(seed), kanjiRegion("乗せる", "のせる"))) {
        expect(fake.endsWith("せる")).toBe(true);
      }
    }
  });
});

describe("buildReadingQuestion", () => {
  it.each(LEVELS)("builds 4 unique choices for every quizzable %s word", (level) => {
    const pool = VOCAB_BY_LEVEL[level];
    const rng = seededRng(2);
    for (const entry of pool.filter((e) => e.readingQuizzable)) {
      const q = buildReadingQuestion(entry, pool, rng);
      expect(q.answer).toBe(entry.reading);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(entry.reading);
    }
  });
});
