import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({
  items,
  defaultId,
}: {
  items: TabItem[];
  defaultId?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // emil: tek bir alt-çizgi göstergesi aktif sekmeye SAF transform ile kayar
  // (translateX + scaleX, GPU). width/left layout animasyonu yok.
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, items]);

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[active];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    const id = items[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        className="relative flex gap-1 border-b border-line"
      >
        {/* emil: origin-left 1px bar; scaleX=genişlik, translateX=konum (saf transform) */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-px origin-left bg-brand motion-safe:transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)]"
          style={{
            transform: `translateX(${indicator.left}px) scaleX(${indicator.width})`,
          }}
        />
        {items.map((it, i) => {
          const selected = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => {
                tabRefs.current[it.id] = el;
              }}
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(it.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={clsx(
                "relative px-4 py-2.5 text-sm font-medium -mb-px transition-[color,transform] motion-safe:active:scale-[0.97] ease-[var(--ease-out)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-t",
                selected ? "text-brand" : "text-muted hover:text-ink",
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-4">
        {items.find((it) => it.id === active)?.content}
      </div>
    </div>
  );
}
