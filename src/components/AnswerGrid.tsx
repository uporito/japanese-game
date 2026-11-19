import { useEffect } from "react";
import type { AnswerFeedback } from "../game/types";

interface AnswerGridProps {
  choices: string[];
  correctAnswer: string;
  feedback: AnswerFeedback | null;
  japanese: boolean;
  onAnswer: (choice: string) => void;
}

export function AnswerGrid({ choices, correctAnswer, feedback, japanese, onAnswer }: AnswerGridProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (!feedback && index >= 0 && index < choices.length) {
        onAnswer(choices[index]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choices, feedback, onAnswer]);

  return (
    <div className="answer-grid">
      {choices.map((choice, i) => {
        let modifier = "";
        if (feedback) {
          if (choice === correctAnswer) modifier = "answer--correct";
          else if (choice === feedback.choice) modifier = "answer--wrong";
          else modifier = "answer--faded";
        }
        return (
          <button
            key={choice}
            className={`answer ${japanese ? "answer--ja" : ""} ${modifier}`}
            disabled={feedback !== null}
            onClick={() => onAnswer(choice)}
            lang={japanese ? "ja" : undefined}
          >
            <span className="answer__key">{i + 1}</span>
            {choice}
          </button>
        );
      })}
    </div>
  );
}
