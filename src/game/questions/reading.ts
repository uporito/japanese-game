import { shuffle, type Rng } from "../random";
import type { Question, VocabEntry } from "../types";

const DISTRACTOR_COUNT = 3;
const MAX_MUTATIONS = 2;

const VOICING_GROUPS = [
  "かが", "きぎ", "くぐ", "けげ", "こご",
  "さざ", "しじ", "すず", "せぜ", "そぞ",
  "ただ", "てで", "とど",
  "はばぱ", "ひびぴ", "ふぶぷ", "へべぺ", "ほぼぽ",
];
const VOICING = new Map<string, string[]>();
for (const group of VOICING_GROUPS) {
  for (const char of group) VOICING.set(char, [...group].filter((c) => c !== char));
}

const O_ROW = new Set("おこそとのほもよろごぞどぼぽょ");
const U_ROW = new Set("くすつぬふむゆるぐずぶぷゅ");
const E_ROW = new Set("えけせてねへめれげぜでべぺ");
const GEMINATES_BEFORE = new Set("かきくけこさしすせそたちつてとぱぴぷぺぽ");
const SMALL_Y = "ゃゅょ";
const CANNOT_START = new Set("っゃゅょんー");

/** Reading indices [start, end) that are spelled by kanji, i.e. not visible as kana in the word. */
export interface Region {
  start: number;
  end: number;
}

type Mutation = (reading: string, region: Region) => string[];

function atEachIndex(
  reading: string,
  region: Region,
  mutate: (chars: string[], i: number) => string[] | null,
): string[] {
  const chars = [...reading];
  const results: string[] = [];
  for (let i = region.start; i < region.end; i++) {
    const out = mutate(chars, i);
    if (out) results.push(...out);
  }
  return results;
}

const join = (chars: string[]) => chars.join("");

const MUTATIONS: Mutation[] = [
  // voicing: か <-> が, は <-> ば <-> ぱ
  (reading, region) =>
    atEachIndex(reading, region, (chars, i) =>
      VOICING.get(chars[i])?.map((alt) => join(chars.with(i, alt))) ?? null,
    ),
  // long vowel: こう <-> こ, せい <-> せ (never lengthening the word's last sound)
  (reading, region) =>
    atEachIndex(reading, region, (chars, i) => {
      const prev = chars[i - 1];
      const isLong =
        (chars[i] === "う" && (O_ROW.has(prev) || U_ROW.has(prev))) ||
        (chars[i] === "い" && E_ROW.has(prev));
      if (isLong) return [join(chars.toSpliced(i, 1))];
      if (i === chars.length - 1) return null;
      const next = chars[i + 1];
      if ((O_ROW.has(chars[i]) || U_ROW.has(chars[i])) && next !== "う") {
        return [join(chars.toSpliced(i + 1, 0, "う"))];
      }
      if (E_ROW.has(chars[i]) && next !== "い") return [join(chars.toSpliced(i + 1, 0, "い"))];
      return null;
    }),
  // small っ: がっこう <-> がこう
  (reading, region) =>
    atEachIndex(reading, region, (chars, i) => {
      if (chars[i] === "っ") return [join(chars.toSpliced(i, 1))];
      const prev = chars[i - 1];
      if (i > region.start && GEMINATES_BEFORE.has(chars[i]) && !CANNOT_START.has(prev)) {
        return [join(chars.toSpliced(i, 0, "っ"))];
      }
      return null;
    }),
  // small y-kana: きゃ <-> きゅ <-> きょ
  (reading, region) =>
    atEachIndex(reading, region, (chars, i) =>
      SMALL_Y.includes(chars[i])
        ? [...SMALL_Y].filter((c) => c !== chars[i]).map((alt) => join(chars.with(i, alt)))
        : null,
    ),
];

function isPlausible(fake: string, answer: string): boolean {
  return fake.length > 0 && fake !== answer && !CANNOT_START.has(fake[0]);
}

/** Leading and trailing kana in the word (お金, 食べる) appear verbatim in the reading. */
export function kanjiRegion(word: string, reading: string): Region {
  const w = [...word];
  const r = [...reading];
  let start = 0;
  while (start < w.length && start < r.length && w[start] === r[start]) start++;
  let suffix = 0;
  while (
    suffix < w.length - start &&
    suffix < r.length - start &&
    w[w.length - 1 - suffix] === r[r.length - 1 - suffix]
  ) {
    suffix++;
  }
  return { start, end: r.length - suffix };
}

/** Near-miss readings, at most one per mutation kind so the fakes differ in how they're wrong. */
export function mutateReading(
  reading: string,
  rng: Rng = Math.random,
  region: Region = { start: 0, end: [...reading].length },
): string[] {
  const fakes: string[] = [];
  for (const mutation of shuffle(MUTATIONS, rng)) {
    const options = shuffle(
      mutation(reading, region).filter((f) => isPlausible(f, reading) && !fakes.includes(f)),
      rng,
    );
    if (options.length > 0) fakes.push(options[0]);
  }
  return fakes;
}

export function buildReadingQuestion(
  entry: VocabEntry,
  pool: readonly VocabEntry[],
  rng: Rng = Math.random,
): Question {
  const answer = entry.reading;
  const distractors = mutateReading(answer, rng, kanjiRegion(entry.word, answer)).slice(0, MAX_MUTATIONS);

  const targetChars = new Set(entry.word);
  const lengthOk = (r: string) => Math.abs(r.length - answer.length) <= 1;
  const others = shuffle(
    pool.filter((o) => o.id !== entry.id && !o.isKana && lengthOk(o.reading)),
    rng,
  );
  // Words sharing a kanji (大学 / 大きい) make the most convincing real-word distractors.
  const ordered = [
    ...others.filter((o) => [...o.word].some((c) => targetChars.has(c))),
    ...others,
    ...shuffle(pool.filter((o) => !o.isKana), rng),
  ];
  for (const other of ordered) {
    if (distractors.length === DISTRACTOR_COUNT) break;
    if (other.reading !== answer && !distractors.includes(other.reading)) {
      distractors.push(other.reading);
    }
  }

  return { entry, type: "reading", answer, choices: shuffle([answer, ...distractors], rng) };
}
