import type { EncounterType, JlptLevel } from "./types";

export interface RunConfig {
  maxLives: number;
  acts: JlptLevel[];
  fightsPerAct: number;
  wordsPerFight: number;
  /** Lives restored after each cleared fight, capped at maxLives. */
  healPerFight: number;
  /** Restore all lives when a new act begins. */
  fullHealOnAct: boolean;
  encounterWeights: Record<EncounterType, number>;
}

export const RUN_CONFIG: RunConfig = {
  maxLives: 3,
  acts: ["N5", "N4", "N3"],
  fightsPerAct: 3,
  wordsPerFight: 10,
  healPerFight: 1,
  fullHealOnAct: true,
  encounterWeights: { meaning: 1, reading: 1 },
};
