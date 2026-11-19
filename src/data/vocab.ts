import type { JlptLevel, VocabEntry } from "../game/types";
import n3 from "./vocab/n3.json";
import n4 from "./vocab/n4.json";
import n5 from "./vocab/n5.json";

export const VOCAB_BY_LEVEL: Record<JlptLevel, VocabEntry[]> = {
  N5: n5 as VocabEntry[],
  N4: n4 as VocabEntry[],
  N3: n3 as VocabEntry[],
};

export const VOCAB: VocabEntry[] = [...VOCAB_BY_LEVEL.N5, ...VOCAB_BY_LEVEL.N4, ...VOCAB_BY_LEVEL.N3];

export const VOCAB_BY_ID: ReadonlyMap<string, VocabEntry> = new Map(VOCAB.map((e) => [e.id, e]));
