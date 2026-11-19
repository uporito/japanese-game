import { useEffect, useState } from "react";
import type { RunState } from "../game/runEngine";
import { RunMap } from "./RunMap";

export function MapPopover({ run }: { run: RunState }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setHovered(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className="map-popover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPinned(false);
      }}
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
    >
      <button
        className="ghost-button"
        aria-expanded={open}
        onClick={() => setPinned((p) => !p)}
      >
        Map
      </button>
      {open && (
        <div className="map-popover__panel" role="dialog" aria-label="Run map">
          <RunMap run={run} compact />
        </div>
      )}
    </div>
  );
}
