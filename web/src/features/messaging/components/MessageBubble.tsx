import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineEllipsisHorizontal,
  HiOutlineClipboard,
  HiOutlineBookmark,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineShare,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
  HiOutlineVideoCamera,
  HiOutlineMapPin,
  HiOutlineLanguage,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import clsx from "clsx";
import { messagingStore, useMessaging } from "../store";
import { ME_ID, memberName, colorFor } from "../members";
import { RichText } from "../rich";
import { QUICK_REACTIONS, type Message } from "../types";
import { Avatar, Badge } from "@/components/ui";
import { Dropdown, DropdownItem } from "@/components/ui";
import { DeliveryTicks } from "./DeliveryTicks";
import { LinkPreview, firstUrl } from "./LinkPreview";
import { VoiceMessage } from "./VoiceMessage";
import { FileMessage } from "./FileMessage";
import { PollMessage } from "./PollMessage";
import { ForwardDialog } from "./ForwardDialog";
import { MessageInfoDialog } from "./MessageInfoDialog";
import { EmojiPicker } from "./EmojiPicker";

const ARTICLE_KEY_SHORTCUTS = "r t e p s f i 1 2 3 4 5 6";

/** Basit göreceli zaman: 0 → "şimdi", <60 → "{n}dk", aksi → "{n}sa". */
function relTime(t: (k: string) => string, minutes: number): string {
  if (minutes <= 0) return t("now");
  if (minutes < 60) return `${minutes}dk`;
  return `${Math.round(minutes / 60)}sa`;
}

export function MessageBubble({ message, grouped }: { message: Message; grouped?: boolean }) {
  const { t } = useTranslation("messaging");
  const navigate = useNavigate();

  const messages = useMessaging((s) => s.messages);
  const channels = useMessaging((s) => s.channels);
  const channel = channels.find((c) => c.id === message.channelId);
  const quoted = message.replyToId ? messages.find((m) => m.id === message.replyToId) : undefined;

  const {
    toggleReaction, setReplyTarget, openThread, togglePin, toggleSave,
    toggleImportant, editMessage, deleteForMe, deleteForEveryone,
  } = messagingStore.getState();

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(message.body);
  const [forwardOpen, setForwardOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);

  const own = message.authorId === ME_ID;
  const name = message.authorName ?? memberName(message.authorId);
  const bubble = channel?.kind === "dm";

  if (message.hiddenForMe) return null;

  // ── Özel türler ───────────────────────────────────────────────────────
  if (message.deleted) {
    return (
      <div className={clsx("px-4 py-1 text-sm italic text-muted", bubble && own && "text-right")}>
        {t("bubble.deleted")}
      </div>
    );
  }

  if (message.kind === "system") {
    return (
      <div className="my-2 flex items-center justify-center gap-2 px-4 text-sm text-muted">
        <HiOutlineLockClosed className="h-3.5 w-3.5" aria-hidden />
        {t("systemE2ee")}
      </div>
    );
  }

  if (message.kind === "call") {
    const title = channel ? (channel.kind === "dm" ? channel.name : `#${channel.name}`) : "";
    return (
      <div className="my-2 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-4 py-2 dark:border-gray-700">
          <HiOutlineVideoCamera className="h-5 w-5 text-brand" aria-hidden />
          <span className="text-sm text-ink dark:text-white">{title}</span>
          <button
            type="button"
            onClick={() => navigate("/room")}
            className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-white"
          >
            {t("joinCall")}
          </button>
        </div>
      </div>
    );
  }

  // ── Gövde (text + ertelenen türler için fallback) ─────────────────────
  const bodyNode = editing ? (
    <div>
      <textarea
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={t("edit")}
        className="w-full resize-none rounded-md border border-line bg-white p-2 text-sm text-ink outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => { editMessage(message.id, draft); setEditing(false); }}
          className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-white"
        >
          {t("saveEdit")}
        </button>
        <button
          type="button"
          onClick={() => { setDraft(message.body); setEditing(false); }}
          className="rounded-md px-3 py-1 text-sm text-muted hover:bg-surface-2 dark:hover:bg-gray-700"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  ) : message.kind === "voice" ? (
    <VoiceMessage seconds={message.voiceSec ?? 0} seed={message.id} />
  ) : message.kind === "poll" ? (
    <PollMessage message={message} />
  ) : message.kind === "file" ? (
    <FileMessage file={message.file!} />
  ) : message.kind === "sticker" ? (
    <div className="text-5xl leading-none" role="img" aria-label="sticker">{message.sticker}</div>
  ) : (
    <div className="space-y-1">
      <RichText text={message.body} className="text-sm text-ink dark:text-white" />
      {message.translating ? (
        <div className="text-xs italic text-muted">…</div>
      ) : message.translated && message.bodyAlt ? (
        <div className="rounded-md border-s-2 border-brand bg-surface-2 px-2 py-1 text-sm text-ink dark:text-white">
          <span className="block text-xs font-medium text-muted">{t("translatedLabel")}</span>
          {message.bodyAlt}
        </div>
      ) : null}
    </div>
  );

  const previewUrl = !message.kind || message.kind === "text" ? firstUrl(message.body) : null;
  const linkPreview = previewUrl ? <LinkPreview url={previewUrl} /> : null;

  // ── Reaksiyon satırı ──────────────────────────────────────────────────
  const reactionsRow =
    message.reactions.length > 0 ? (
      <div className={clsx("mt-1 flex flex-wrap gap-1", bubble && own && "justify-end")}>
        {message.reactions.map((r) => {
          const mine = r.userIds.includes(ME_ID);
          return (
            <button
              key={r.emoji}
              type="button"
              onClick={() => toggleReaction(message.id, r.emoji, ME_ID)}
              aria-pressed={mine}
              aria-label={r.emoji}
              className={clsx(
                "inline-flex h-7 items-center gap-1 rounded-full border px-2 text-sm",
                mine
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line bg-surface-2 text-ink dark:border-gray-700 dark:text-white",
              )}
            >
              <span aria-hidden>{r.emoji}</span>
              <span>{r.userIds.length}</span>
            </button>
          );
        })}
      </div>
    ) : null;

  // ── Mesaj klavye kısayolları ──────────────────────────────────────────
  const onArticleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;          // sadece article odaktayken
    if (e.metaKey || e.ctrlKey || e.altKey) return;    // ⌘K vb. ile çakışma yok
    switch (e.key) {
      case "r": e.preventDefault(); setReplyTarget(message.id); break;
      case "t": e.preventDefault(); openThread(message.id); break;
      case "e": e.preventDefault(); if (own) { setDraft(message.body); setEditing(true); } break;
      case "p": e.preventDefault(); togglePin(message.id); break;
      case "s": e.preventDefault(); toggleSave(message.id); break;
      case "f": e.preventDefault(); setForwardOpen(true); break;
      case "i": e.preventDefault(); toggleImportant(message.id); break;
      default:
        if (e.key >= "1" && e.key <= "6") {
          const emoji = QUICK_REACTIONS[Number(e.key) - 1];
          if (emoji) { e.preventDefault(); toggleReaction(message.id, emoji, ME_ID); }
        }
    }
  };

  // ── Hover/focus toolbar ───────────────────────────────────────────────
  const toolbar = (
    <>
    <div className="absolute -top-3 end-2 z-10 flex items-center gap-0.5 rounded-md border border-line bg-white p-0.5 opacity-0 shadow-sm transition-opacity pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 dark:border-gray-700 dark:bg-gray-800 [@media(pointer:coarse)]:pointer-events-auto [@media(pointer:coarse)]:opacity-100">
      {QUICK_REACTIONS.slice(0, 6).map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={emoji}
          onClick={() => toggleReaction(message.id, emoji, ME_ID)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-base hover:bg-surface-2 dark:hover:bg-gray-700"
        >
          <span aria-hidden>{emoji}</span>
        </button>
      ))}
      <EmojiPicker onPick={(emoji) => toggleReaction(message.id, emoji, ME_ID)} />
      <button
        type="button"
        onClick={() => setReplyTarget(message.id)}
        aria-label={t("reply")}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-700"
      >
        <HiOutlineArrowUturnLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => openThread(message.id)}
        aria-label={t("replyInThread")}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-700"
      >
        <HiOutlineChatBubbleLeftRight className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => messagingStore.getState().translate(message.id)}
        aria-label={t("translate")}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-700"
      >
        <HiOutlineLanguage className="h-4 w-4" aria-hidden />
      </button>
      <Dropdown
        label={t("more")}
        align="end"
        triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-700"
        trigger={<HiOutlineEllipsisHorizontal className="h-4 w-4" aria-hidden />}
      >
        <DropdownItem onSelect={() => { void navigator.clipboard?.writeText(message.body); }}>
          <HiOutlineClipboard className="h-4 w-4" aria-hidden /> {t("copy")}
        </DropdownItem>
        <DropdownItem onSelect={() => togglePin(message.id)}>
          <HiOutlineMapPin className="h-4 w-4" aria-hidden /> {message.pinned ? t("unpin") : t("pin")}
        </DropdownItem>
        <DropdownItem onSelect={() => toggleSave(message.id)}>
          <HiOutlineBookmark className="h-4 w-4" aria-hidden /> {message.saved ? t("unsave") : t("save")}
        </DropdownItem>
        <DropdownItem onSelect={() => toggleImportant(message.id)}>
          <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden /> {t("markImportant")}
        </DropdownItem>
        <DropdownItem onSelect={() => setForwardOpen(true)}>
          <HiOutlineShare className="h-4 w-4" aria-hidden /> {t("forwardTitle")}
        </DropdownItem>
        <DropdownItem onSelect={() => setInfoOpen(true)}>
          <HiOutlineInformationCircle className="h-4 w-4" aria-hidden /> {t("messageInfoTitle")}
        </DropdownItem>
        {own ? (
          <DropdownItem onSelect={() => { setDraft(message.body); setEditing(true); }}>
            <HiOutlinePencilSquare className="h-4 w-4" aria-hidden /> {t("edit")}
          </DropdownItem>
        ) : null}
        <DropdownItem onSelect={() => deleteForMe(message.id)}>
          <HiOutlineTrash className="h-4 w-4" aria-hidden /> {t("deleteForMe")}
        </DropdownItem>
        {own ? (
          <DropdownItem onSelect={() => deleteForEveryone(message.id)}>
            <HiOutlineTrash className="h-4 w-4 text-red-600" aria-hidden /> {t("deleteForEveryone")}
          </DropdownItem>
        ) : null}
      </Dropdown>
    </div>
    <ForwardDialog open={forwardOpen} onClose={() => setForwardOpen(false)} messageId={message.id} />
    <MessageInfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} message={message} />
    </>
  );

  const forwardedRow = message.forwardedFrom ? (
    <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted">
      <HiOutlineShare className="h-3.5 w-3.5" aria-hidden /> {t("forwardedFrom", { from: message.forwardedFrom })}
    </div>
  ) : null;

  // ── DM (WhatsApp/Telegram pill) düzeni ────────────────────────────────
  if (bubble) {
    return (
      <div className={clsx("flex px-4 py-0.5", own ? "justify-end" : "justify-start")}>
        <div role="article" tabIndex={0} onKeyDown={onArticleKeyDown} aria-keyshortcuts={ARTICLE_KEY_SHORTCUTS} className="group relative max-w-[80%] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          {!own && !grouped ? (
            <div className="mb-0.5 text-sm font-semibold text-brand">{name}</div>
          ) : null}
          <div className={clsx("rounded-2xl px-3 py-2", own ? "bg-brand text-white" : "bg-surface-2 text-ink dark:text-white")}>
            {forwardedRow}
            {quoted ? (
              <div className={clsx("mb-1 rounded-md border-l-2 px-2 py-1 text-xs", own ? "border-white/60 bg-white/10" : "border-brand bg-white dark:bg-gray-800")}>
                <span className="font-medium">{quoted.authorName ?? memberName(quoted.authorId)}</span>
                <span className="ml-2 opacity-80">{(quoted.body || "").slice(0, 80)}</span>
              </div>
            ) : null}
            {bodyNode}
            {linkPreview}
            <div className={clsx("mt-0.5 flex items-center justify-end gap-1 text-xs", own ? "text-white/80" : "text-muted")}>
              <span>{relTime(t, message.tMinutes)}</span>
              {message.edited ? <span>({t("edited")})</span> : null}
              {own && message.status ? <DeliveryTicks status={message.status} /> : null}
            </div>
          </div>
          {reactionsRow}
          {toolbar}
        </div>
      </div>
    );
  }

  // ── Kanal (Slack/Teams) düzeni ────────────────────────────────────────
  return (
    <div
      role="article"
      tabIndex={0}
      onKeyDown={onArticleKeyDown}
      aria-keyshortcuts={ARTICLE_KEY_SHORTCUTS}
      className={clsx(
        "group relative flex gap-3 px-4 py-1.5 hover:bg-surface-2 focus-within:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand dark:hover:bg-gray-700/40",
        message.important && "border-l-2 border-red-500 bg-surface-2",
      )}
    >
      <div className="w-9 shrink-0">
        {!grouped ? (
          <Avatar name={name} color={colorFor(message.authorId)} size="md" className="mt-0.5" />
        ) : (
          <span className="block pt-1 text-right text-xs text-muted opacity-0 group-hover:opacity-100">{relTime(t, message.tMinutes)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink dark:text-white">{name}</span>
            <span className="text-xs text-muted">{relTime(t, message.tMinutes)}</span>
            {message.edited ? <span className="text-xs text-muted">({t("edited")})</span> : null}
            {message.pinned ? <Badge tone="accent">{t("pinned")}</Badge> : null}
            {message.saved ? <Badge tone="accent">{t("savedBadge")}</Badge> : null}
            {message.important ? (
              <Badge tone="danger"><HiOutlineExclamationTriangle className="h-3.5 w-3.5" aria-hidden /> {t("important")}</Badge>
            ) : null}
            {message.priority === "urgent" ? <Badge tone="danger">{t("urgent")}</Badge> : null}
            {own && message.status ? <DeliveryTicks status={message.status} /> : null}
          </div>
        ) : null}
        {forwardedRow}
        {quoted ? (
          <div className="mb-1 border-l-2 border-line bg-surface-2 px-2 py-1 text-xs">
            <span className="font-medium text-brand">{quoted.authorName ?? memberName(quoted.authorId)}</span>
            <span className="ml-2 text-muted">{(quoted.body || "").slice(0, 90)}</span>
          </div>
        ) : null}
        {bodyNode}
        {linkPreview}
        {reactionsRow}
      </div>
      {toolbar}
    </div>
  );
}
