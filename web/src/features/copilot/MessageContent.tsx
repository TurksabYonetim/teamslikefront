import { Fragment, useMemo } from "react";

/**
 * Hafif markdown-benzeri render. Tam markdown DEĞİL; sadece sohbet için
 * gerekli olan minimum: fenced kod blokları (```), satır içi kod (`...`)
 * ve satır sonları. XSS riski yok çünkü ham metin React text node olarak
 * basılır (dangerouslySetInnerHTML kullanılmaz).
 */

interface MessageContentProps {
  content: string;
  /** Kod bloğu için kopyala butonu etiketi (a11y). */
  copyLabel?: string;
  copiedLabel?: string;
  onCopyCode?: (code: string) => void;
}

type Block =
  | { type: "code"; lang: string; code: string; key: string }
  | { type: "text"; text: string; key: string };

/** Metni fenced kod blokları (```) ve düz metin parçalarına böler. */
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const fence = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = fence.exec(content)) !== null) {
    if (m.index > last) {
      blocks.push({
        type: "text",
        text: content.slice(last, m.index),
        key: `t${i++}`,
      });
    }
    blocks.push({
      type: "code",
      lang: (m[1] || "").trim(),
      code: m[2].replace(/\n$/, ""),
      key: `c${i++}`,
    });
    last = fence.lastIndex;
  }

  if (last < content.length) {
    blocks.push({ type: "text", text: content.slice(last), key: `t${i++}` });
  }
  return blocks;
}

/** Tek bir metin parçasında satır içi kod (`...`) işaretlemesini render eder. */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const inline = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = inline.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <code
        key={`i${i++}`}
        className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800 dark:bg-gray-700 dark:text-gray-100"
      >
        {m[1]}
      </code>,
    );
    last = inline.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function MessageContent({
  content,
  copyLabel = "Copy code",
  copiedLabel,
  onCopyCode,
}: MessageContentProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <>
      {blocks.map((b) =>
        b.type === "code" ? (
          <div
            key={b.key}
            className="group/code relative my-2 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {b.lang && (
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-1 font-mono text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                {b.lang}
              </div>
            )}
            <pre className="overflow-x-auto bg-gray-50 p-3 text-xs leading-relaxed dark:bg-gray-900">
              <code className="font-mono text-gray-800 dark:text-gray-100">
                {b.code}
              </code>
            </pre>
            {onCopyCode && (
              <button
                type="button"
                onClick={() => onCopyCode(b.code)}
                title={copiedLabel ? `${copyLabel} / ${copiedLabel}` : copyLabel}
                aria-label={copyLabel}
                className="absolute right-2 top-2 rounded-md border border-gray-200 bg-white/90 p-1.5 text-gray-500 opacity-0 transition-[opacity,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:text-gray-900 focus:opacity-100 group-hover/code:opacity-100 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <p key={b.key} className="whitespace-pre-wrap">
            {b.text.split("\n").map((line, idx, arr) => (
              <Fragment key={idx}>
                {renderInline(line)}
                {idx < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </>
  );
}
