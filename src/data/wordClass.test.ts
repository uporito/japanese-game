import { describe, expect, it } from "vitest";
import { VOCAB } from "./vocab";
import { isKanaWord, makeGloss, wordClassFromJmdict } from "./wordClass";

describe("wordClassFromJmdict", () => {
  it.each([
    [["v1", "vt"], "verb"],
    [["v5u", "vi"], "verb"],
    [["n", "vs", "vt"], "noun"],
    [["adj-i"], "i-adjective"],
    [["adj-ix"], "i-adjective"],
    [["adj-na", "n"], "na-adjective"],
    [["n", "adj-no"], "noun"],
    [["n", "adv"], "noun"],
    [["adv", "adv-to"], "adverb"],
    [["pn"], "pronoun"],
    [["int", "exp"], "interjection"],
    [["exp"], "expression"],
    [["n-suf"], "other"],
    [[], "other"],
  ])("%j -> %s", (codes, expected) => {
    expect(wordClassFromJmdict(codes)).toBe(expected);
  });
});

describe("isKanaWord", () => {
  it("detects kana-only words", () => {
    expect(isKanaWord("ありがとう")).toBe(true);
    expect(isKanaWord("コーヒー")).toBe(true);
    expect(isKanaWord("お金")).toBe(false);
    expect(isKanaWord("食べる")).toBe(false);
  });
});

describe("makeGloss", () => {
  it("joins up to two meanings and falls back when too long", () => {
    expect(makeGloss(["to eat"])).toBe("to eat");
    expect(makeGloss(["blue", "green", "azure"])).toBe("blue; green");
    expect(makeGloss(["a fairly long first meaning here", "and a second long one"])).toBe(
      "a fairly long first meaning here",
    );
  });
});

describe("generated vocab", () => {
  it("has unique ids and consistent flags", () => {
    expect(new Set(VOCAB.map((e) => e.id)).size).toBe(VOCAB.length);
    for (const e of VOCAB) {
      if (e.isKana) expect(e.readingQuizzable).toBe(false);
      expect(e.gloss.length).toBeGreaterThan(0);
    }
  });
});
