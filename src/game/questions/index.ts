import type { Rng } from "../random";
import type { EncounterType, Question, VocabEntry } from "../types";
import { buildMeaningQuestion } from "./meaning";
import { buildReadingQuestion } from "./reading";

type QuestionBuilder = (entry: VocabEntry, pool: readonly VocabEntry[], rng?: Rng) => Question;

const BUILDERS: Record<EncounterType, QuestionBuilder> = {
  meaning: buildMeaningQuestion,
  reading: buildReadingQuestion,
};

export function buildQuestion(
  type: EncounterType,
  entry: VocabEntry,
  pool: readonly VocabEntry[],
  rng?: Rng,
): Question {
  return BUILDERS[type](entry, pool, rng);
}

export function canAsk(type: EncounterType, entry: VocabEntry): boolean {
  return type === "meaning" || entry.readingQuizzable;
}
