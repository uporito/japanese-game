import { ENCOUNTER_INFO } from "../game/encounters";
import type { RunState } from "../game/runEngine";

type NodeState = "cleared" | "current" | "next" | "failed" | "upcoming";

function nodeState(run: RunState, actIndex: number, fightIndex: number): NodeState {
  const perAct = run.config.fightsPerAct;
  const node = actIndex * perAct + fightIndex;
  const position = run.actIndex * perAct + run.fightIndex;
  if (node < position) return "cleared";
  if (node === position) {
    if (run.status === "fighting") return "current";
    if (run.status === "lost") return "failed";
    return "cleared";
  }
  if (node === position + 1 && run.status === "interlude") return "next";
  if (run.status === "won") return "cleared";
  return "upcoming";
}

interface RunMapProps {
  run: RunState;
  compact?: boolean;
}

export function RunMap({ run, compact = false }: RunMapProps) {
  return (
    <ol className={`run-map ${compact ? "run-map--compact" : ""}`}>
      {run.acts.map((act, actIndex) => (
        <li key={actIndex} className="run-map__act">
          <div className="run-map__act-label">
            Act {actIndex + 1} <span className="run-map__level">{act.level}</span>
          </div>
          <ol className="run-map__fights">
            {act.fights.map((type, fightIndex) => {
              const state = nodeState(run, actIndex, fightIndex);
              const info = ENCOUNTER_INFO[type];
              return (
                <li
                  key={fightIndex}
                  className={`map-node map-node--${state}`}
                  title={`Fight ${fightIndex + 1}: ${info.name} (${state})`}
                  lang="ja"
                >
                  {info.icon}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
