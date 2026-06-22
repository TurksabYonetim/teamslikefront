// web/src/features/support/components/ConversationView.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Avatar, Badge, Button, Dropdown, DropdownItem } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { conversationStore } from "../conversation.store";
import { aiSuggest } from "../support.api";
import { renderCanned } from "../support.dom";
import { CANNED, CONTACTS, MACROS, ME_ID } from "../support.data";
import { agentName, contactName } from "../shared";
import type { ConversationStatus } from "../support.types";

const STATUSES: ConversationStatus[] = ["open", "pending", "snoozed", "resolved"];

// Durum → nokta rengi. Renk tek başına anlam taşımaz; etiket metni daima yanında (AAA 1.4.1).
const STATUS_DOT: Record<ConversationStatus, string> = {
  open: "bg-brand",
  pending: "bg-amber-500",
  snoozed: "bg-gray-400",
  resolved: "bg-green-600",
};

// Durum → Badge tonu (renk + metin birlikte; AAA 1.4.1).
const STATUS_TONE: Record<ConversationStatus, "neutral" | "accent" | "positive" | "warning"> = {
  open: "accent",
  pending: "warning",
  snoozed: "neutral",
  resolved: "positive",
};

/** Besteci içi yuvarlak aksiyon düğmesi — kompakt, marka-tutarlı. */
function ComposerButton({
  label,
  active,
  primary,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none transition-[transform,background-color,color] duration-150 ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.94] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50",
        primary || active
          ? "bg-brand text-white hover:bg-brand-600"
          : "text-muted hover:bg-surface-3 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

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
      <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center">
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
  const assignedToMe = conv.assigneeId === ME_ID;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border border-line bg-surface">
      {/* Header — kimlik + durum rozeti + tüm aksiyonlar tek ⋯ menüsünde */}
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-2.5">
        <Avatar name={contactName(conv.contactId)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-ink">
            {contactName(conv.contactId)}
          </p>
          <p className="truncate text-xs leading-tight text-muted">
            {assigned
              ? assignedToMe
                ? t("conversation.assignedToYou")
                : t("conversation.assignedTo", { name: assigned })
              : t("conversation.unassigned")}
          </p>
        </div>
        <Badge tone={STATUS_TONE[conv.status]} className="shrink-0">
          {t(`status.${conv.status}`)}
        </Badge>
        <Dropdown
          label={t("conversation.actions")}
          align="end"
          menuWidth="w-56"
          triggerClassName="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted outline-none transition-colors hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
          trigger={<Icon name="ellipsis" className="h-5 w-5" aria-hidden />}
        >
          <p className="px-2 pb-0.5 pt-1 text-xs font-semibold text-muted">{t("conversation.statusLabel")}</p>
          {STATUSES.map((s) => (
            <DropdownItem key={s} onSelect={() => conversationStore.getState().setStatus(conv.id, s)}>
              <span className={clsx("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[s])} aria-hidden />
              <span className="flex-1">{t(`status.${s}`)}</span>
              {conv.status === s ? <Icon name="check" className="h-4 w-4 shrink-0 text-brand" aria-hidden /> : null}
            </DropdownItem>
          ))}
          <div className="my-1 h-px bg-line" role="separator" />
          {!assignedToMe ? (
            <DropdownItem onSelect={() => conversationStore.getState().assign(conv.id, ME_ID)}>
              <Icon name="userPlus" className="h-4 w-4 shrink-0 text-muted" aria-hidden /> {t("conversation.assignToMe")}
            </DropdownItem>
          ) : null}
          <DropdownItem onSelect={() => conversationStore.getState().assignNext(conv.id)}>
            <Icon name="users" className="h-4 w-4 shrink-0 text-muted" aria-hidden /> {t("conversation.assignNext")}
          </DropdownItem>
        </Dropdown>
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
      <div className="min-h-0 min-w-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {conv.messages.map((m) => {
          if (m.authorType === "note") {
            return (
              <div
                key={m.id}
                className="break-words rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-ink dark:bg-amber-900/20"
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
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-1.5 text-sm sm:max-w-[80%]",
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

      {/* Reply box — tek parça besteci; içerik küçülebilir (min-w-0) → 320px'de taşmaz */}
      <div className="border-t border-line p-2">
        <div
          className={clsx(
            "flex items-center gap-1 rounded-lg border bg-surface-2 pl-1 pr-1 transition-colors focus-within:ring-1",
            note
              ? "border-amber-400 focus-within:border-amber-500 focus-within:ring-amber-400"
              : "border-line focus-within:border-brand focus-within:ring-brand",
          )}
        >
          <ComposerButton
            label={note ? t("conversation.replyMode") : t("conversation.noteMode")}
            active={note}
            onClick={() => setNote((v) => !v)}
          >
            <Icon name="pencil" className="h-4 w-4" aria-hidden />
          </ComposerButton>
          <ComposerButton
            label={t("conversation.aiSuggest")}
            disabled={loadingAi}
            onClick={runAi}
          >
            <Icon name="sparkles" className="h-4 w-4" aria-hidden />
          </ComposerButton>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={note ? t("conversation.notePlaceholder") : t("conversation.replyPlaceholder")}
            aria-label={note ? t("conversation.notePlaceholder") : t("conversation.replyPlaceholder")}
            className="h-11 min-w-0 flex-1 border-0 bg-transparent px-1.5 text-sm text-ink outline-none placeholder:text-muted"
          />
          <ComposerButton
            label={t("conversation.send")}
            primary
            disabled={!draft.trim()}
            onClick={submit}
          >
            <Icon name="send" className="h-4 w-4" aria-hidden />
          </ComposerButton>
        </div>
      </div>
    </div>
  );
}
