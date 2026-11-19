import { DebugControls } from "../components/DebugControls";
import { LivesDisplay } from "../components/LivesDisplay";
import { MistakeList } from "../components/MistakeList";
import { RunMap } from "../components/RunMap";
import { ENCOUNTER_INFO } from "../game/encounters";
import { isLastFightOfAct, type RunState } from "../game/runEngine";

interface InterludeScreenProps {
  run: RunState;
  onContinue: () => void;
  onSkipAct: () => void;
}

export function InterludeScreen({ run, onContinue, onSkipAct }: InterludeScreenProps) {
  const last = run.history[run.history.length - 1];
  const actCleared = isLastFightOfAct(run);
  const next = actCleared
    ? { act: run.actIndex + 1, fight: 0 }
    : { act: run.actIndex, fight: run.fightIndex + 1 };
  const nextAct = run.acts[next.act];
  const nextInfo = ENCOUNTER_INFO[nextAct.fights[next.fight]];

  return (
    <div className="screen interlude">
      <h1 className="title">{actCleared ? `Act ${run.actIndex + 1} cleared!` : "Fight cleared!"}</h1>
      <p className="subtitle">
        {last.correctCount} / {last.answeredCount} correct
      </p>

      <div className="interlude__lives">
        <LivesDisplay lives={run.lives} maxLives={run.config.maxLives} />
        {run.lastHeal && (
          <span className="interlude__heal">
            {run.lastHeal.reason === "act" ? "Full heal for the new act" : `+${run.lastHeal.amount} life`}
          </span>
        )}
      </div>

      <RunMap run={run} />

      <p className="interlude__next">
        Next: Act {next.act + 1} ({nextAct.level}), fight {next.fight + 1} -{" "}
        <span lang="ja">{nextInfo.icon}</span> {nextInfo.name}
      </p>

      <MistakeList words={last.mistakes} />

      <div className="button-row">
        <button className="primary-button" onClick={onContinue} autoFocus>
          Continue
        </button>
        <DebugControls onSkipAct={onSkipAct} />
      </div>
    </div>
  );
}
