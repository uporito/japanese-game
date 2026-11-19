import { RUN_CONFIG } from "../game/runConfig";

interface MenuScreenProps {
  onStartRun: () => void;
  onOpenLibrary: () => void;
}

export function MenuScreen({ onStartRun, onOpenLibrary }: MenuScreenProps) {
  const { acts, fightsPerAct, wordsPerFight } = RUN_CONFIG;
  return (
    <div className="screen start">
      <h1 className="title" lang="ja">
        言葉クエスト
      </h1>
      <p className="subtitle">Kotoba Quest</p>
      <p className="blurb">
        Fight through {acts.length} acts ({acts.join(", ")}), {fightsPerAct} fights each, {wordsPerFight} words per
        fight. Name each word's meaning or reading to strike. Lose all your lives and the run is over.
      </p>
      <div className="menu-buttons">
        <button className="primary-button" onClick={onStartRun} autoFocus>
          Start run
        </button>
        <button className="secondary-button" onClick={onOpenLibrary}>
          Word library
        </button>
      </div>
      <p className="hint">Tip: use keys 1-4 to answer</p>
      <footer className="credits">
        Vocabulary from{" "}
        <a href="https://github.com/evanclan/OpenJLPT" target="_blank" rel="noreferrer">
          OpenJLPT
        </a>{" "}
        (CC BY-SA 4.0), built on JMdict (EDRDG) and Jonathan Waller's JLPT lists.
      </footer>
    </div>
  );
}
