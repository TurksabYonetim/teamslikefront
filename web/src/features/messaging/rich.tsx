// web/src/features/messaging/rich.tsx
import * as React from "react";

/**
 * Güvenli markdown-lite satır-içi renderer (React node'larına; HTML enjeksiyonu yok).
 * Destek: `code`, **bold**, *italic* / _italic_, ~~strike~~, [text](url), @mention.
 */
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\)|@[\w.-]+)/g;

export function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text)}</span>;
}

export function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[0.85em] dark:bg-gray-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <s key={i}>{part.slice(2, -2)}</s>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-brand underline">
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("@")) {
      return <span key={i} className="font-medium text-brand">{part}</span>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
