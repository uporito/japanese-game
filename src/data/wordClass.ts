export const WORD_CLASSES = [
  "noun",
  "verb",
  "i-adjective",
  "na-adjective",
  "adverb",
  "pronoun",
  "conjunction",
  "interjection",
  "counter",
  "numeral",
  "particle",
  "expression",
  "other",
] as const;

export type WordClass = (typeof WORD_CLASSES)[number];

const VERB_CODE = /^v(1|5|k|z|s-i|s-s|r)/;

// Earlier rules win. "vs" alone marks a noun that takes する (勉強), so it stays a noun;
// "vt"/"vi" are transitivity markers, not a class.
const RULES: [WordClass, (codes: string[]) => boolean][] = [
  ["verb", (codes) => codes.some((c) => VERB_CODE.test(c))],
  ["i-adjective", (codes) => codes.includes("adj-i") || codes.includes("adj-ix")],
  ["na-adjective", (codes) => codes.includes("adj-na")],
  ["pronoun", (codes) => codes.includes("pn")],
  ["conjunction", (codes) => codes.includes("conj")],
  ["interjection", (codes) => codes.includes("int")],
  ["counter", (codes) => codes.includes("ctr")],
  ["numeral", (codes) => codes.includes("num")],
  ["particle", (codes) => codes.includes("prt")],
  ["noun", (codes) => codes.includes("n") || codes.includes("vs")],
  ["adverb", (codes) => codes.includes("adv") || codes.includes("adv-to")],
  ["expression", (codes) => codes.includes("exp")],
];

export function wordClassFromJmdict(codes: readonly string[]): WordClass {
  const list = [...codes];
  return RULES.find(([, matches]) => matches(list))?.[0] ?? "other";
}

const KANA_ONLY = /^[\u3040-\u30ff\uff5e\u301c]+$/;

export function isKanaWord(word: string): boolean {
  return KANA_ONLY.test(word);
}

const MAX_GLOSS_LENGTH = 40;

/** Short answer text for multiple choice: up to two meanings, falling back to one if too long. */
export function makeGloss(meanings: readonly string[]): string {
  const two = meanings.slice(0, 2).join("; ");
  return two.length <= MAX_GLOSS_LENGTH ? two : meanings[0];
}
