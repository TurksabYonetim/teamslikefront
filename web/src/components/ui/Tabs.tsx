import { useRef, useState } from "react";
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
        className="flex gap-1 border-b border-line"
      >
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
                "relative px-4 py-2.5 text-sm font-medium -mb-px transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-t",
                selected
                  ? "text-brand border-b-2 border-brand"
                  : "text-muted hover:text-ink",
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
