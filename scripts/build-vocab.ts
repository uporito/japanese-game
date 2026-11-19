/**
 * Converts OpenJLPT vocab (https://github.com/evanclan/OpenJLPT, CC BY-SA 4.0) into the
 * slim per-level files the game loads. Download the sources first:
 *   scripts/source/{n5,n4,n3}.json  <-  data/json/vocab/{n5,n4,n3}.json
 * Then run: npm run build:vocab
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isKanaWord, makeGloss, wordClassFromJmdict, type WordClass } from "../src/data/wordClass";
import type { JlptLevel, VocabEntry } from "../src/game/types";

interface SourceEntry {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  level: string;
  pos?: string[];
  other_readings?: string[];
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LEVELS: JlptLevel[] = ["N5", "N4", "N3"];
const seenIds = new Set<string>();

for (const level of LEVELS) {
  const file = level.toLowerCase();
  const source: SourceEntry[] = JSON.parse(
    readFileSync(join(root, "scripts/source", `${file}.json`), "utf8"),
  );

  const entries: VocabEntry[] = [];
  const classCounts: Partial<Record<WordClass, number>> = {};
  let skipped = 0;

  for (const e of source) {
    if (seenIds.has(e.id) || e.meanings.length === 0) {
      skipped++;
      continue;
    }
    seenIds.add(e.id);
    const isKana = isKanaWord(e.word);
    const wordClass = wordClassFromJmdict(e.pos ?? []);
    classCounts[wordClass] = (classCounts[wordClass] ?? 0) + 1;
    entries.push({
      id: e.id,
      word: e.word,
      reading: e.reading,
      meanings: e.meanings,
      gloss: makeGloss(e.meanings),
      level,
      wordClass,
      isKana,
      readingQuizzable: !isKana && !e.other_readings?.length,
    });
  }

  const outDir = join(root, "src/data/vocab");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, `${file}.json`),
    `[\n${entries.map((entry) => JSON.stringify(entry)).join(",\n")}\n]\n`,
  );

  const kana = entries.filter((x) => x.isKana).length;
  const quizzable = entries.filter((x) => x.readingQuizzable).length;
  console.log(
    `${level}: ${entries.length} words (${skipped} skipped), ${kana} kana-only, ` +
      `${quizzable} reading-quizzable, ${entries.length - kana - quizzable} excluded for multiple readings`,
  );
  console.log(`  classes: ${JSON.stringify(classCounts)}`);
}
