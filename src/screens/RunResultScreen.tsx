import { MistakeList } from "../components/MistakeList";
import { RunMap } from "../components/RunMap";
import type { RunState } from "../game/runEngine";

interface RunResultScreenProps {
  run: RunState;
  onNewRun: () => void;
  onMenu: () => void;
}

export function RunResultScreen({ run, onNewRun, onMenu }: RunResultScreenProps) {
  const won = run.status === "won";
  const mistakes = [...new Map(run.history.flatMap((r) => r.mistakes).map((w) => [w.id, w])).values()];

  return (
    <div className={`screen result result--${won ? "won" : "lost"}`}>
      <h1 className="title">{won ? "Victory!" : "Defeated"}</h1>
      <p className="subtitle">
        {won
          ? "You cleared all three acts."
          : `Fell in Act ${run.actIndex + 1} (${run.acts[run.actIndex].level}), fight ${run.fightIndex + 1}.`}
      </p>

      <RunMap run={run} />

      <table className="act-summary">
        <thead>
          <tr>
            <th>Act</th>
            <th>Fights</th>
            <th>Correct</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {run.acts.map((act, actIndex) => {
            const records = run.history.filter((r) => r.actIndex === actIndex);
            const correct = records.reduce((sum, r) => sum + r.correctCount, 0);
            const answered = records.reduce((sum, r) => sum + r.answeredCount, 0);
            return (
              <tr key={actIndex}>
                <td>
                  {actIndex + 1} ({act.level})
                </td>
                <td>{records.length}</td>
                <td>
                  {correct} / {answered}
                </td>
                <td>{answered > 0 ? `${Math.round((correct / answered) * 100)}%` : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <MistakeList words={mistakes} />

      <div className="button-row">
        <button className="primary-button" onClick={onNewRun} autoFocus>
          New run
        </button>
        <button className="secondary-button" onClick={onMenu}>
          Menu
        </button>
      </div>
    </div>
  );
}
