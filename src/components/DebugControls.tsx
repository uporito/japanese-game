export const DEBUG_ENABLED =
  import.meta.env.DEV || new URLSearchParams(window.location.search).has("debug");

export function DebugControls({ onSkipAct }: { onSkipAct: () => void }) {
  if (!DEBUG_ENABLED) return null;
  return (
    <button className="debug-button" onClick={onSkipAct} title="Debug: skip to the next act">
      Next Act ⏭
    </button>
  );
}
