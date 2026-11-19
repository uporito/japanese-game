import { useMemo } from "react";
import { DebugControls } from "../components/DebugControls";
import { MapPopover } from "../components/MapPopover";
import { VOCAB_BY_LEVEL } from "../data/vocab";
import type { FightSetup } from "../game/fightEngine";
import { currentFightType, currentLevel } from "../game/runEngine";
import { useRun } from "../game/useRun";
import { FightScreen } from "./FightScreen";
import { InterludeScreen } from "./InterludeScreen";
import { RunResultScreen } from "./RunResultScreen";

interface RunScreenProps {
  onNewRun: () => void;
  onExit: () => void;
}

export function RunScreen({ onNewRun, onExit }: RunScreenProps) {
  const { state: run, endFight, continueRun, skipAct } = useRun();

  // Only rebuilt when a new fight starts, so mid-fight run updates don't reshuffle questions.
  const setup = useMemo<FightSetup>(
    () => ({
      type: currentFightType(run),
      words: run.fightWords,
      pool: VOCAB_BY_LEVEL[currentLevel(run)],
      startingLives: run.lives,
      maxLives: run.config.maxLives,
    }),
    [run.fightSerial],
  );

  switch (run.status) {
    case "fighting":
      return (
        <FightScreen
          key={run.fightSerial}
          setup={setup}
          context={`Act ${run.actIndex + 1} · ${currentLevel(run)} · Fight ${run.fightIndex + 1}/${run.config.fightsPerAct}`}
          headerExtras={
            <>
              <DebugControls onSkipAct={skipAct} />
              <MapPopover run={run} />
              <button className="ghost-button" onClick={onExit}>
                Quit
              </button>
            </>
          }
          onEnd={endFight}
        />
      );
    case "interlude":
      return <InterludeScreen run={run} onContinue={continueRun} onSkipAct={skipAct} />;
    case "won":
    case "lost":
      return <RunResultScreen run={run} onNewRun={onNewRun} onMenu={onExit} />;
  }
}
