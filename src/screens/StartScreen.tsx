interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="screen start">
      <h1 className="title" lang="ja">
        言葉クエスト
      </h1>
      <p className="subtitle">Kotoba Quest</p>
      <p className="blurb">
        A wild kanji appears. Name its meaning to strike. Three mistakes and you fall.
      </p>
      <button className="primary-button" onClick={onStart} autoFocus>
        Start fight
      </button>
      <p className="hint">Tip: use keys 1-4 to answer</p>
    </div>
  );
}
