import * as React from "react";
import { messagingStore } from "../store";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
}

/** Messaging geneli klavye kısayolları: ⌘/Ctrl+K palet, ? yardım. */
export function useMessagingHotkeys({ onOpenHelp }: { onOpenHelp: () => void }) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        messagingStore.getState().togglePalette(true);
        return;
      }
      if (e.key === "?" && !isTyping(e.target)) {
        e.preventDefault();
        onOpenHelp();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenHelp]);
}
