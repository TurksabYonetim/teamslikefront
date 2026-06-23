import * as React from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  HiOutlineBold,
  HiOutlineItalic,
  HiOutlineCodeBracket,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineListBullet,
  HiOutlinePaperClip,
  HiOutlinePhoto,
  HiOutlineDocument,
  HiOutlineMicrophone,
  HiOutlineBellSlash,
  HiOutlineClock,
  HiOutlinePaperAirplane,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlinePencilSquare,
  HiOutlinePlus,
} from "react-icons/hi2";
import { HiOutlineChartBar } from "react-icons/hi2";
import { useIsMobile } from "@/lib/useIsMobile";
import { messagingStore, useMessaging } from "../store";
import { rewriteMessage } from "../chat";
import { CANNED } from "../data";
import { ME_ID, memberName, MEMBERS } from "../members";
import { Button, IconButton, Badge, Dropdown, DropdownItem, useToast } from "@/components/ui";
import { EmojiPicker } from "./EmojiPicker";
import { GifStickerPicker } from "./GifStickerPicker";
import { SmartReplies } from "./SmartReplies";
import { CreatePollDialog } from "./CreatePollDialog";
import { ScheduledTray } from "./ScheduledTray";

type Mode = "reply" | "note";

const SLASH_COMMANDS = ["summarize", "draft", "translate"] as const;

const AI_TONES = ["professional", "friendly", "concise"] as const;

export function MessageComposer() {
  const { t } = useTranslation("messaging");
  const toast = useToast();
  const isMobile = useIsMobile();
  // Mobilde sade tek-satır composer; biçim + ikincil aksiyonlar katlanır tepside.
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const replyTargetId = useMessaging((s) => s.replyTargetId);
  const draftsByTopic = useMessaging((s) => s.draftsByTopic);
  const messages = useMessaging((s) => s.messages);

  const text = draftsByTopic[activeTopicId] ?? "";
  const [mode, setMode] = React.useState<Mode>("reply");
  const [silent, setSilent] = React.useState(false);
  const [pollOpen, setPollOpen] = React.useState(false);
  const [scheduledOpen, setScheduledOpen] = React.useState(false);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  // @mention: son kelime "@" ile başlıyorsa filtreli üye önerileri.
  const mentionToken = React.useMemo(() => {
    const m = text.match(/(^|\s)@([^\s@]*)$/);
    return m ? m[2] : null;
  }, [text]);
  const mentionMatches = React.useMemo(
    () =>
      mentionToken !== null
        ? MEMBERS.filter((mm) => mm.name.toLowerCase().includes(mentionToken.toLowerCase())).slice(0, 6)
        : [],
    [mentionToken],
  );
  // /slash: metin "/" ile başlıyorsa komut önerileri.
  const slashToken = React.useMemo(
    () => (text.startsWith("/") && !text.includes(" ") ? text.slice(1) : null),
    [text],
  );
  const slashMatches = React.useMemo(
    () => (slashToken !== null ? SLASH_COMMANDS.filter((c) => c.startsWith(slashToken.toLowerCase())) : []),
    [slashToken],
  );

  // Auto-grow: tek satırdan başlar, içeriğe göre büyür (minimal/sade composer; tavan 160px).
  React.useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [text]);

  // Konu değişince Reply moduna dön.
  React.useEffect(() => {
    setMode("reply");
  }, [activeTopicId]);

  const setText = (v: string) => messagingStore.getState().setDraft(activeTopicId, v);

  const replyTarget = React.useMemo(
    () => (replyTargetId ? messages.find((m) => m.id === replyTargetId) : undefined),
    [messages, replyTargetId],
  );
  const scheduledCount = React.useMemo(
    () => messages.filter((m) => m.topicId === activeTopicId && m.scheduled).length,
    [messages, activeTopicId],
  );

  const placeholder = mode === "note" ? t("composer.placeholderNote") : t("composer.placeholderReply");

  const wrap = (pre: string, suf = pre) => {
    const ta = taRef.current;
    const start = ta?.selectionStart ?? text.length;
    const end = ta?.selectionEnd ?? text.length;
    const sel = text.slice(start, end);
    setText(text.slice(0, start) + pre + sel + suf + text.slice(end));
    taRef.current?.focus();
  };
  const linePrefix = (pre: string) => setText((text ? text + "\n" : "") + pre);
  const insertEmoji = (e: string) => setText(text + e);

  const pickMention = (name: string) => {
    setText(text.replace(/(^|\s)@([^\s@]*)$/, `$1@${name} `));
    taRef.current?.focus();
  };
  const pickSlash = (cmd: string) => {
    // no-op komut — sadece metni temizleyip komut etiketi bırak
    setText(`/${cmd} `);
    taRef.current?.focus();
  };

  // AI taslak — kanal bağlamından bir yanıt taslağı önerir (backend yok → stub + toast).
  const aiDraft = () => {
    const draft = "Teşekkürler! Detayları inceledim — birazdan ayrıntılı bir yanıt paylaşacağım.";
    setText(text.trim() ? `${text.trim()} ${draft}` : draft);
    toast.show({ message: t("ai.drafted") });
    taRef.current?.focus();
  };
  // AI yeniden yazma — mevcut metni seçilen tona dönüştürür (saf rewriteMessage).
  const aiRewrite = (tone: (typeof AI_TONES)[number]) => {
    if (!text.trim()) {
      toast.show({ message: t("ai.needsText"), variant: "error" });
      return;
    }
    setText(rewriteMessage(text, tone));
    toast.show({ message: t("ai.rewritten"), variant: "success" });
    taRef.current?.focus();
  };
  // Hazır yanıt — başlık+gövde önizlemeli menüden seçilen gövdeyi composer'a yazar.
  const pickCanned = (bodyKey: string) => {
    setText(t(bodyKey));
    taRef.current?.focus();
  };

  const submit = () => {
    if (!text.trim()) return;
    const store = messagingStore.getState();
    if (mode === "note") {
      store.sendNote(text, ME_ID);
      store.setDraft(activeTopicId, "");
    } else {
      store.send(text, ME_ID, replyTargetId, silent);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const sendFile = messagingStore.getState().sendFile;
  const sendSticker = messagingStore.getState().sendSticker;
  const sendVoice = messagingStore.getState().sendVoice;
  const scheduleMessage = messagingStore.getState().scheduleMessage;
  const setReplyTarget = messagingStore.getState().setReplyTarget;

  // ── Paylaşılan parçalar (masaüstü + mobil aynı kaynaktan render eder) ──
  const modeTabs = (
    <div
      className="inline-flex shrink-0 overflow-hidden rounded-md border border-line dark:border-gray-700"
      role="tablist"
    >
      {(["reply", "note"] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className={clsx(
            "h-7 px-2.5 text-xs font-medium transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]",
            mode === m
              ? m === "note"
                ? "bg-amber-500 text-white"
                : "bg-brand text-white"
              : "bg-white text-muted hover:bg-surface-2 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
          )}
        >
          {m === "reply" ? t("composer.reply") : t("composer.note")}
        </button>
      ))}
    </div>
  );

  const formatButtons = (
    <>
      <FmtBtn label={t("bold")} onClick={() => wrap("**")}>
        <HiOutlineBold className="h-4 w-4" aria-hidden />
      </FmtBtn>
      <FmtBtn label={t("italic")} onClick={() => wrap("*")}>
        <HiOutlineItalic className="h-4 w-4" aria-hidden />
      </FmtBtn>
      <FmtBtn label={t("code")} onClick={() => wrap("`")}>
        <HiOutlineCodeBracket className="h-4 w-4" aria-hidden />
      </FmtBtn>
      <FmtBtn label={t("quote")} onClick={() => linePrefix("> ")}>
        <HiOutlineChatBubbleLeftEllipsis className="h-4 w-4" aria-hidden />
      </FmtBtn>
      <FmtBtn label={t("list")} onClick={() => linePrefix("- ")}>
        <HiOutlineListBullet className="h-4 w-4" aria-hidden />
      </FmtBtn>
    </>
  );

  const textField = (
    <>
      <label htmlFor="composer" className="sr-only">
        {placeholder}
      </label>
      <textarea
        id="composer"
        ref={taRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="block max-h-40 w-full resize-none overflow-y-auto bg-transparent px-1 py-2 text-base text-ink outline-none placeholder:text-gray-500 md:text-sm dark:text-white"
      />

      {mentionMatches.length > 0 ? (
        <ul
          role="listbox"
          aria-label={t("mentionHint")}
          className="absolute bottom-full left-0 z-20 mb-1 w-56 origin-bottom-left overflow-hidden rounded-md border border-line bg-white p-1 shadow-xl motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:border-gray-700 dark:bg-gray-800"
        >
          {mentionMatches.map((mm) => (
            <li key={mm.id}>
              <button
                type="button"
                onClick={() => pickMention(mm.name)}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-start text-sm text-ink transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 dark:text-white dark:hover:bg-gray-700"
              >
                @{mm.name}
              </button>
            </li>
          ))}
        </ul>
      ) : slashMatches.length > 0 ? (
        <ul
          role="listbox"
          aria-label="/"
          className="absolute bottom-full left-0 z-20 mb-1 w-56 origin-bottom-left overflow-hidden rounded-md border border-line bg-white p-1 shadow-xl motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:border-gray-700 dark:bg-gray-800"
        >
          {slashMatches.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => pickSlash(c)}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-start text-sm text-ink transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 dark:text-white dark:hover:bg-gray-700"
              >
                /{c} <span className="ml-2 text-xs text-muted">{t(`slash.${c}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  const secondaryActions = (
    <>
      <Dropdown
        label={t("attach")}
        align="start"
        side="top"
        triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
        trigger={<HiOutlinePaperClip className="h-[18px] w-[18px]" aria-hidden />}
      >
        <DropdownItem onSelect={() => sendFile({ name: "image.png", fileType: "png", sizeKb: 320, isImage: true }, ME_ID)}>
          <HiOutlinePhoto className="h-[18px] w-[18px]" aria-hidden /> {t("attachPhoto")}
        </DropdownItem>
        <DropdownItem onSelect={() => sendFile({ name: "document.pdf", fileType: "pdf", sizeKb: 540 }, ME_ID)}>
          <HiOutlineDocument className="h-[18px] w-[18px]" aria-hidden /> {t("attachFile")}
        </DropdownItem>
      </Dropdown>

      <GifStickerPicker onSend={(stk) => sendSticker(stk, ME_ID)} />

      <IconButton label={t("poll.create")} onClick={() => setPollOpen(true)}>
        <HiOutlineChartBar className="h-[18px] w-[18px]" aria-hidden />
      </IconButton>

      <IconButton label={t("voiceMessage")} onClick={() => sendVoice(8, ME_ID)}>
        <HiOutlineMicrophone className="h-[18px] w-[18px]" aria-hidden />
      </IconButton>

      {/* AI taslak & yeniden yazma — Sparkle menüsü */}
      <Dropdown
        label={t("ai.menu")}
        align="start"
        side="top"
        triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
        trigger={<HiOutlineSparkles className="h-[18px] w-[18px]" aria-hidden />}
      >
        <DropdownItem onSelect={aiDraft}>
          <HiOutlinePencilSquare className="h-[18px] w-[18px]" aria-hidden /> {t("ai.draft")}
        </DropdownItem>
        {AI_TONES.map((tone) => (
          <DropdownItem key={tone} onSelect={() => aiRewrite(tone)}>
            <HiOutlineSparkles className="h-[18px] w-[18px]" aria-hidden /> {t(`ai.tone.${tone}`)}
          </DropdownItem>
        ))}
      </Dropdown>

      {/* Hazır yanıtlar — şimşek menüsü, başlık + gövde önizlemeli */}
      <Dropdown
        label={t("canned.menu")}
        align="start"
        side="top"
        triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
        trigger={<HiOutlineBolt className="h-[18px] w-[18px]" aria-hidden />}
      >
        {CANNED.map((cr) => (
          <DropdownItem key={cr.id} onSelect={() => pickCanned(cr.bodyKey)}>
            <HiOutlineBolt className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <span className="min-w-0 truncate">
              <span className="font-medium text-ink dark:text-white">{t(cr.titleKey)}</span>
              <span className="ml-2 text-xs text-muted">{t(cr.bodyKey)}</span>
            </span>
          </DropdownItem>
        ))}
      </Dropdown>

      <IconButton label={t("silent")} variant={silent ? "primary" : "ghost"} onClick={() => setSilent((v) => !v)}>
        <HiOutlineBellSlash className="h-[18px] w-[18px]" aria-hidden />
      </IconButton>

      <IconButton
        label={t("schedule")}
        onClick={() => {
          if (!text.trim()) return;
          scheduleMessage(text, ME_ID);
          setText("");
        }}
      >
        <HiOutlineClock className="h-[18px] w-[18px]" aria-hidden />
      </IconButton>
    </>
  );

  const sendButton = (
    <Button onClick={submit} disabled={!text.trim()} aria-label={t("send")}>
      <HiOutlinePaperAirplane className="h-[18px] w-[18px]" aria-hidden />
      <span className="hidden sm:inline">{t("send")}</span>
    </Button>
  );

  const boxClass = clsx(
    "border p-1.5",
    isMobile ? "rounded-2xl" : "rounded-lg",
    mode === "note"
      ? "border-amber-400 bg-white dark:border-amber-500 dark:bg-gray-800"
      : "border-line bg-white dark:border-gray-700 dark:bg-gray-800",
  );

  // Kompakt "dock" düzeni: Reply/Note geçişi biçim çubuğuyla aynı satırda; metin
  // alanı ile aksiyon kümesi tek satırda birleşir (eskiden ayrı iki satırdı) →
  // composer belirgin biçimde alçalır. Hareket = mevcut press/hover/focus mikro
  // geri bildirimleri (Emil: amaçlı, dekoratif değil); kalıcı alana giriş animasyonu yok.
  return (
    <div className="shrink-0 border-t border-line bg-surface-2 p-2 dark:border-gray-700 dark:bg-gray-700">
      <div className="mx-auto w-full max-w-5xl 2xl:max-w-6xl">
      {scheduledCount > 0 ? (
        <div className="mb-2">
          <button type="button" onClick={() => setScheduledOpen(true)} aria-label={t("scheduledTitle")}>
            <Badge tone="neutral">
              <HiOutlineClock className="h-3.5 w-3.5" aria-hidden /> {t("scheduledCount", { n: scheduledCount })}
            </Badge>
          </button>
        </div>
      ) : null}

      {mode === "reply" && !replyTarget && !text.trim() ? (
        <SmartReplies onPick={(s) => setText(s)} />
      ) : null}

      {replyTarget ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-line bg-brand/5 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium text-brand">
              {t("replyingTo", { name: replyTarget.authorName ?? memberName(replyTarget.authorId) })}
            </span>
            <span className="ml-2 text-muted">{replyTarget.body.slice(0, 70)}</span>
          </span>
          <IconButton label={t("cancel")} onClick={() => setReplyTarget(null)}>
            <HiOutlineXMark className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ) : null}

      {isMobile ? (
        <div className={boxClass}>
          {/* Katlanır araç tepsisi — biçim + ikincil aksiyonlar (yatay kaydırma) */}
          {toolsOpen ? (
            <div className="mb-1.5 space-y-1.5 motion-safe:[animation:tl-fade-in_var(--dur-pop)_var(--ease-out)]">
              <div className="flex flex-wrap items-center gap-1">
                {modeTabs}
                <span className="mx-0.5 h-5 w-px shrink-0 bg-line dark:bg-gray-700" aria-hidden />
                {formatButtons}
              </div>
              <div className="flex flex-wrap items-center gap-1">{secondaryActions}</div>
            </div>
          ) : null}

          {/* Tek satır giriş: araç aç/kapat · metin · emoji · gönder */}
          <div className="flex items-end gap-1">
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              aria-label={toolsOpen ? t("composer.toolsClose") : t("composer.tools")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <HiOutlinePlus
                className={clsx(
                  "h-5 w-5 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)]",
                  toolsOpen && "rotate-45",
                )}
                aria-hidden
              />
            </button>
            <div className="relative min-w-0 flex-1">{textField}</div>
            <EmojiPicker onPick={insertEmoji} />
            {sendButton}
          </div>
        </div>
      ) : (
      <div className={boxClass}>
        {/* Üst satır: kompakt Yanıt/Not geçişi + biçimlendirme araçları (tek satırda) */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1">
          {modeTabs}

          <span className="mx-0.5 h-5 w-px shrink-0 bg-line dark:bg-gray-700" aria-hidden />

          {formatButtons}
          <EmojiPicker onPick={insertEmoji} />
        </div>

        {/* Birleşik satır: metin alanı (flex-1, büyür) + aksiyon kümesi + Gönder */}
        <div className="flex flex-wrap items-end gap-1">
          <div className="relative min-w-0 flex-1 basis-full sm:basis-0">{textField}</div>
          {secondaryActions}
          {sendButton}
        </div>
      </div>
      )}

      </div>
      <CreatePollDialog open={pollOpen} onClose={() => setPollOpen(false)} />
      <ScheduledTray open={scheduledOpen} onClose={() => setScheduledOpen(false)} />
    </div>
  );
}

function FmtBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 hover:text-ink motion-safe:active:scale-[0.97] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
    >
      {children}
    </button>
  );
}
