import { describe, expect, it } from "vitest";
import { createStatsStore, summarize, type StatsStorage } from "./stats";

function memoryStorage(): StatsStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("stats store", () => {
  it("records per-mode answers, persists, and notifies", () => {
    const storage = memoryStorage();
    const store = createStatsStore(storage);
    let notified = 0;
    store.subscribe(() => notified++);

    store.recordAnswer("w1", "meaning", true);
    store.recordAnswer("w1", "meaning", false);
    store.recordAnswer("w1", "reading", true);

    const words = store.getSnapshot().words;
    expect(words.w1).toEqual({ meaning: { seen: 2, correct: 1 }, reading: { seen: 1, correct: 1 } });
    expect(notified).toBe(3);
    expect(createStatsStore(storage).getSnapshot().words.w1.meaning?.seen).toBe(2);
  });

  it("resets everything", () => {
    const storage = memoryStorage();
    const store = createStatsStore(storage);
    store.recordAnswer("w1", "meaning", true);
    store.reset();
    expect(store.getSnapshot().words).toEqual({});
    expect(createStatsStore(storage).getSnapshot().words).toEqual({});
  });

  it("ignores corrupt storage", () => {
    const storage = memoryStorage();
    storage.setItem("kotoba:stats:v1", "{not json");
    expect(createStatsStore(storage).getSnapshot().words).toEqual({});
  });
});

describe("summarize", () => {
  it("combines or splits modes", () => {
    const stats = { meaning: { seen: 4, correct: 3 }, reading: { seen: 2, correct: 0 } };
    expect(summarize(stats, "all")).toEqual({ seen: 6, correct: 3, wrong: 3, accuracy: 0.5 });
    expect(summarize(stats, "reading")).toEqual({ seen: 2, correct: 0, wrong: 2, accuracy: 0 });
    expect(summarize(undefined, "meaning").accuracy).toBeNull();
  });
});
