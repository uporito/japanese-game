import { useSyncExternalStore } from "react";
import type { EncounterType } from "./types";

export interface ModeStats {
  seen: number;
  correct: number;
}

export type WordStats = Partial<Record<EncounterType, ModeStats>>;

export interface StatsData {
  version: 1;
  words: Record<string, WordStats>;
}

export type StatsMode = EncounterType | "all";

export interface StatsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "kotoba:stats:v1";
const EMPTY: StatsData = { version: 1, words: {} };

export function summarize(stats: WordStats | undefined, mode: StatsMode) {
  const modes = mode === "all" ? [stats?.meaning, stats?.reading] : [stats?.[mode]];
  const seen = modes.reduce((sum, m) => sum + (m?.seen ?? 0), 0);
  const correct = modes.reduce((sum, m) => sum + (m?.correct ?? 0), 0);
  return { seen, correct, wrong: seen - correct, accuracy: seen > 0 ? correct / seen : null };
}

export function createStatsStore(storage: StatsStorage | null) {
  let data = load();
  const listeners = new Set<() => void>();

  function load(): StatsData {
    try {
      const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
      return parsed?.version === 1 ? parsed : EMPTY;
    } catch {
      return EMPTY;
    }
  }

  function commit(next: StatsData) {
    data = next;
    storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: () => data,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    recordAnswer(wordId: string, type: EncounterType, correct: boolean) {
      const previous = data.words[wordId]?.[type] ?? { seen: 0, correct: 0 };
      const updated = { seen: previous.seen + 1, correct: previous.correct + (correct ? 1 : 0) };
      commit({
        ...data,
        words: { ...data.words, [wordId]: { ...data.words[wordId], [type]: updated } },
      });
    },
    reset() {
      storage?.removeItem(STORAGE_KEY);
      commit(EMPTY);
    },
  };
}

export const statsStore = createStatsStore(typeof localStorage === "undefined" ? null : localStorage);

export function useStats(): StatsData {
  return useSyncExternalStore(statsStore.subscribe, statsStore.getSnapshot);
}
