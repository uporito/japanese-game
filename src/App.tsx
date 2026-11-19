import { useCallback, useState } from "react";
import { N5_VOCAB } from "./data/n5Vocab";
import { FightScreen, type FightResult } from "./screens/FightScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { StartScreen } from "./screens/StartScreen";

type AppState =
  | { screen: "start" }
  | { screen: "fight"; fightId: number }
  | { screen: "result"; result: FightResult };

export function App() {
  const [appState, setAppState] = useState<AppState>({ screen: "start" });

  const startFight = useCallback(() => {
    setAppState({ screen: "fight", fightId: Date.now() });
  }, []);

  const endFight = useCallback((result: FightResult) => {
    setAppState({ screen: "result", result });
  }, []);

  switch (appState.screen) {
    case "start":
      return <StartScreen onStart={startFight} />;
    case "fight":
      return <FightScreen key={appState.fightId} pool={N5_VOCAB} onEnd={endFight} />;
    case "result":
      return (
        <ResultScreen
          result={appState.result}
          onPlayAgain={() => setAppState({ screen: "start" })}
        />
      );
  }
}
