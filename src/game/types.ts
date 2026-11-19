export type JlptLevel = "N5" | "N4" | "N3";

export interface VocabEntry {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  level: JlptLevel;
}

export interface Question {
  entry: VocabEntry;
  choices: string[];
}

export type FightStatus = "playing" | "won" | "lost";

export interface AnswerFeedback {
  choice: string;
  correct: boolean;
}

export interface FightConfig {
  questionCount: number;
  maxLives: number;
}

export interface FightState {
  config: FightConfig;
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
