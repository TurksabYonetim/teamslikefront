// web/src/features/support/components/ConversationView.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton, Select } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { conversationStore } from "../conversation.store";
import { aiSuggest } from "../support.api";
import { renderCanned } from "../support.dom";
import { CANNED, CONTACTS, MACROS, ME_ID } from "../support.data";
import { agentName, contactName } from "../shared";
import type { ConversationStatus } from "../support.types";

const STATUSES: ConversationStatus[] = ["open", "pending", "snoozed", "resolved"];

export function ConversationView() {
  const { t } = useTranslation("support");
  const activeId = useStore(conversationStore, (s) => s.activeConversationId);
  const conv = useStore(
    conversationStore,
    (s) => s.conversations.find((c) => c.id === s.activeConversationId) ?? null,
  );

  const [draft, setDraft] = useState("");
  const [note, setNote] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const msgCount = conv?.messages.length ?? 0;
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [msgCount, activeId]);

  if (!conv) {
    return (
      <div className="flex min-h-0 flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center">
        <Icon name="chat" className="mb-2 h-8 w-8 text-muted" aria-hidden />
        <p className="text-base font-medium text-ink">{t("conversation.noneTitle")}</p>
        <p className="text-sm text-muted">{t("conversation.noneHint")}</p>
      </div>
    );
  }

  const contact = CONTACTS.find((c) => c.id === conv.contactId);
  const firstToken = draft.split(" ")[0];
  const cannedMatches = draft.startsWith("/")
    ? CANNED.filter((c) => c.shortcode.startsWith(firstToken))
    : [];

  const submit = () => {
    if (!draft.trim() || !activeId) return;
    const act = conversationStore.getState();
    if (note) act.addNote(activeId, draft.trim(), ME_ID);
    else act.sendReply(activeId, draft.trim(), ME_ID);
    setDraft("");
    setSuggestion(null);
  };

  const insertCanned = (body: string) =>
    setDraft(renderCanned(body, { name: contact?.name ?? "", plan: contact?.attributes.plan ?? "" }));

  const runAi = async () => {
    if (!activeId) return;
    setLoadingAi(true);
    const text = await aiSuggest(activeId);
    setSuggestion(text);
    setLoadingAi(false);
  };

  const assigned = agentName(conv.assigneeId);

  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-line bg-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <span className="text-sm font-semibold text-ink">{contactName(conv.contactId)}</span>
        {assigned ? <Badge tone="neutral">{t("conversation.assignedTo", { name: assigned })}</Badge> : null}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={conv.assigneeId === ME_ID}
            onClick={() => conversationStore.getState().assign(conv.id, ME_ID)}
          >
            <Icon name="userPlus" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.assignToMe")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => conversationStore.getState().assignNext(conv.id)}
          >
            <Icon name="users" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.assignNext")}
          </Button>
          {conv.status === "resolved" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => conversationStore.getState().setStatus(conv.id, "open")}
            >
              <Icon name="arrow" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.reopen")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => conversationStore.getState().setStatus(conv.id, "resolved")}
            >
              <Icon name="check" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.resolve")}
            </Button>
          )}
          <Select<ConversationStatus>
            value={conv.status}
            onChange={(v) => conversationStore.getState().setStatus(conv.id, v)}
            aria-label={t("conversation.statusLabel")}
            options={STATUSES.map((s) => ({
              value: s,
              label: t(`status.${s}`),
            }))}
            size="sm"
            className="w-40"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="flex flex-wrap gap-1.5 border-b border-line px-3 py-1.5">
        {MACROS.map((m) => (
          <button
            key={m.id}
            onClick={() => conversationStore.getState().applyMacro(conv.id, m)}
            className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-xs text-muted transition-colors hover:bg-surface-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <Icon name="bolt" className="h-3.5 w-3.5" aria-hidden /> {m.name}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {conv.messages.map((m) => {
          if (m.authorType === "note") {
            return (
              <div
                key={m.id}
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-ink dark:bg-amber-900/20"
              >
                <span className="font-medium text-amber-700 dark:text-amber-300">{t("conversation.note")}: </span>
                {m.body}
              </div>
            );
          }
          const out = m.direction === "out";
          return (
            <div key={m.id} className={clsx("flex motion-safe:animate-[tl-fade-in_150ms_var(--ease-out)]", out ? "justify-end" : "justify-start")}>
              <span
                className={clsx(
                  "max-w-[80%] rounded-lg px-3 py-1.5 text-sm",
                  out ? "bg-brand text-white" : "bg-surface-2 text-ink",
                )}
              >
                {m.body}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* AI suggestion (human-approved) */}
      {suggestion ? (
        <div className="mx-3 mb-2 rounded-md border border-brand bg-surface-2 p-2 origin-bottom motion-safe:animate-[tl-pop-in_var(--dur-pop)_var(--ease-out)]">
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-brand">
            <Icon name="sparkles" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.aiDraft")}
          </div>
          <p className="text-sm text-ink">{suggestion}</p>
          <div className="mt-1 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setDraft(suggestion);
                setSuggestion(null);
              }}
            >
              <Icon name="check" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.insertDraft")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              <Icon name="close" className="h-3.5 w-3.5" aria-hidden /> {t("conversation.dismiss")}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Canned suggestions */}
      {cannedMatches.length > 0 ? (
        <div className="mx-3 mb-1 flex flex-wrap gap-1">
          {cannedMatches.map((c) => (
            <button
              key={c.id}
              onClick={() => insertCanned(c.body)}
              className="rounded-full border border-line px-2 py-0.5 text-xs text-muted transition-colors hover:bg-surface-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {c.shortcode}
            </button>
          ))}
        </div>
      ) : null}

      {/* Reply box */}
      <div className="border-t border-line p-2">
        <div className="flex items-end gap-2">
          <IconButton
            label={note ? t("conversation.replyMode") : t("conversation.noteMode")}
            variant={note ? "primary" : "ghost"}
            onClick={() => setNote((v) => !v)}
          >
            <Icon name="pencil" className="h-5 w-5" aria-hidden />
          </IconButton>
          <IconButton label={t("conversation.aiSuggest")} variant="ghost" disabled={loadingAi} onClick={runAi}>
            <Icon name="sparkles" className="h-5 w-5" aria-hidden />
          </IconButton>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={note ? t("conversation.notePlaceholder") : t("conversation.replyPlaceholder")}
            aria-label={note ? t("conversation.notePlaceholder") : t("conversation.replyPlaceholder")}
            className={clsx(
              "h-11 flex-1 rounded-md border bg-surface-2 px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand",
              note ? "border-amber-400" : "border-line",
            )}
          />
          <IconButton label={t("conversation.send")} variant="primary" disabled={!draft.trim()} onClick={submit}>
            <Icon name="send" className="h-5 w-5" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
