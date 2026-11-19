import type { WordClass } from "../data/wordClass";

export type JlptLevel = "N5" | "N4" | "N3";

export interface VocabEntry {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  gloss: string;
  level: JlptLevel;
  wordClass: WordClass;
  isKana: boolean;
  readingQuizzable: boolean;
}

export type EncounterType = "meaning" | "reading";

export interface Question {
  entry: VocabEntry;
  type: EncounterType;
  choices: string[];
  answer: string;
}

export type FightStatus = "playing" | "won" | "lost";

export interface AnswerFeedback {
  choice: string;
  correct: boolean;
}

export interface FightState {
  type: EncounterType;
  maxLives: number;
  questions: Question[];
  questionIndex: number;
  lives: number;
  correctCount: number;
  status: FightStatus;
  feedback: AnswerFeedback | null;
  mistakes: VocabEntry[];
}

export type FightAction =
  | { type: "ANSWER"; choice: string }
  | { type: "NEXT" };
