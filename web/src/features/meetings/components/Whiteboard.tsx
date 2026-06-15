import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineXMark, HiOutlineTrash } from "react-icons/hi2";
import { useMeeting } from "../meetings.store";
import clsx from "clsx";

const COLORS = ["#111827", "#dc2626", "#2563eb", "#16a34a", "#d97706"];

/** Lightweight collaborative whiteboard (Zoom/Teams/Jitsi). Freehand SVG strokes. */
export function Whiteboard() {
  const { t } = useTranslation();
  const toggleWhiteboard = useMeeting((s) => s.toggleWhiteboard);
  const [strokes, setStrokes] = React.useState<{ points: string; color: string }[]>([]);
  const [color, setColor] = React.useState(COLORS[0]);
  const drawing = React.useRef(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const pt = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    return `${Math.round(e.clientX - (r?.left ?? 0))},${Math.round(e.clientY - (r?.top ?? 0))}`;
  };

  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    setStrokes((s) => [...s, { points: pt(e), color }]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pt(e);
    setStrokes((s) => {
      if (s.length === 0) return s;
      const copy = s.slice();
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = { ...last, points: `${last.points} ${p}` };
      return copy;
    });
  };
  const up = () => {
    drawing.current = false;
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 p-2">
        <span className="text-base font-semibold text-ink">{t("meetings.whiteboard")}</span>
        <div className="ml-2 flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={c}
              aria-pressed={color === c}
              className={clsx("h-7 w-7 rounded-full border-2", color === c ? "border-ink" : "border-transparent")}
              style={{ background: c }}
            />
          ))}
        </div>
        <button
          onClick={() => setStrokes([])}
          className="ml-auto inline-flex h-9 items-center gap-1 rounded-md border border-line px-2 text-sm font-medium text-ink hover:bg-surface-2"
        >
          <HiOutlineTrash className="h-4 w-4" aria-hidden /> {t("meetings.clear")}
        </button>
        <button
          onClick={toggleWhiteboard}
          aria-label={t("meetings.closeWhiteboard")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink hover:bg-surface-2"
        >
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <svg
        ref={svgRef}
        role="img"
        aria-label={t("meetings.whiteboard")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="flex-1 touch-none"
      >
        {strokes.map((s, i) => (
          <polyline key={i} points={s.points} fill="none" stroke={s.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  );
}
