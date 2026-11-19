import { useCallback, useState } from "react";
import { LibraryScreen } from "./screens/LibraryScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { RunScreen } from "./screens/RunScreen";

type AppState = { screen: "menu" } | { screen: "library" } | { screen: "run"; runId: number };

export function App() {
  const [appState, setAppState] = useState<AppState>({ screen: "menu" });

  const startRun = useCallback(() => setAppState({ screen: "run", runId: Date.now() }), []);
  const toMenu = useCallback(() => setAppState({ screen: "menu" }), []);

  switch (appState.screen) {
    case "menu":
      return <MenuScreen onStartRun={startRun} onOpenLibrary={() => setAppState({ screen: "library" })} />;
    case "library":
      return <LibraryScreen onBack={toMenu} />;
    case "run":
      return <RunScreen key={appState.runId} onNewRun={startRun} onExit={toMenu} />;
  }
}
