import { shuffle, type Rng } from "../random";
import type { Question, VocabEntry } from "../types";

const DISTRACTOR_COUNT = 3;

function normalized(meanings: readonly string[]): Set<string> {
  return new Set(meanings.map((m) => m.trim().toLowerCase()));
}

function overlaps(a: ReadonlySet<string>, b: readonly string[]): boolean {
  return b.some((m) => a.has(m.trim().toLowerCase()));
}

export function buildMeaningQuestion(
  entry: VocabEntry,
  pool: readonly VocabEntry[],
  rng: Rng = Math.random,
): Question {
  const targetMeanings = normalized(entry.meanings);
  const candidates = pool.filter(
    (other) =>
      other.id !== entry.id &&
      other.word !== entry.word &&
      other.gloss !== entry.gloss &&
      !overlaps(targetMeanings, other.meanings),
  );

  // Same word class first, so the answer can't be spotted by its grammatical shape alone.
  const ordered = [
    ...shuffle(candidates.filter((c) => c.wordClass === entry.wordClass), rng),
    ...shuffle(candidates.filter((c) => c.wordClass !== entry.wordClass), rng),
  ];

  const distractors: string[] = [];
  for (const candidate of ordered) {
    if (distractors.length === DISTRACTOR_COUNT) break;
    if (!distractors.includes(candidate.gloss)) distractors.push(candidate.gloss);
  }

  return {
    entry,
    type: "meaning",
    answer: entry.gloss,
    choices: shuffle([entry.gloss, ...distractors], rng),
  };
}
