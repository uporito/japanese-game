import type { EncounterType } from "./types";

export const ENCOUNTER_INFO: Record<EncounterType, { icon: string; name: string; prompt: string }> = {
  meaning: { icon: "訳", name: "Meaning", prompt: "What does it mean?" },
  reading: { icon: "読", name: "Reading", prompt: "How is it read?" },
};
