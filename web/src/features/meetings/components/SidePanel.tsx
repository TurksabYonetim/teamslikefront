import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineXMark,
  HiOutlineMicrophone,
  HiOutlineVideoCamera,
  HiOutlineHandRaised,
  HiOutlinePaperAirplane,
  HiOutlineUsers,
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineUserMinus,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineLink,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { MdMicOff, MdClosedCaption } from "react-icons/md";
import clsx from "clsx";
import { meetingStore, useMeeting } from "../meetings.store";
import { ME_ID, memberName } from "@/features/messaging/members";
import { useMessaging, messagingStore } from "@/features/messaging/store";
import { Avatar, Button, IconButton } from "@/components/ui";
import { BreakoutManager } from "./BreakoutManager";
import type { CaptionLang, SidePanelTab } from "../meetings.store.types";

const TABS: { key: Exclude<SidePanelTab, "none" | "host" | "engage">; labelKey: string }[] = [
  { key: "participants", labelKey: "participants" },
  { key: "chat", labelKey: "chat" },
  { key: "captions", labelKey: "captions" },
];

const relTime = (t: (k: string, o?: Record<string, unknown>) => string, tMin: number) =>
  tMin === 0 ? t("now") : t("minAgo", { n: tMin });

export function SidePanel() {
  const { t } = useTranslation("meetings");
  const sidePanel = useMeeting((s) => s.sidePanel);
  const participants = useMeeting((s) => s.participants);
  const lobbyQueue = useMeeting((s) => s.lobbyQueue);
  const spotlightId = useMeeting((s) => s.spotlightId);
  const chat = useMeeting((s) => s.chat);
  const captions = useMeeting((s) => s.captions);
  const captionsOn = useMeeting((s) => s.captionsOn);
  const captionLang = useMeeting((s) => s.captionLang);
  // Meeting↔kanal köprüsü: bağlı topic varsa sohbet o kanaldan okunur/yazılır.
  const linkedTopicId = useMeeting((s) => s.linkedTopicId);
  const linkedMessages = useMessaging((s) =>
    linkedTopicId ? s.messages.filter((m) => m.topicId === linkedTopicId && !m.parentId) : [],
  );

  const navigate = useNavigate();
  const [chatText, setChatText] = React.useState("");
  const [breakoutOpen, setBreakoutOpen] = React.useState(false);
  const captionsRef = React.useRef<HTMLDivElement>(null);

  const act = () => meetingStore.getState();
  const linked = Boolean(linkedTopicId);

  // Sohbet kaynağı tek tip: bağlı kanal mesajları veya yerel toplantı sohbeti.
  const messages = linked
    ? linkedMessages.map((m) => ({ id: m.id, authorId: m.authorId, tMin: m.tMinutes, body: m.body }))
    : chat.map((c) => ({ id: c.id, authorId: c.authorId, tMin: c.tMin, body: c.body }));

  const submitChat = () => {
    if (!chatText.trim()) return;
    if (linked) act().postToLinkedChannel(chatText);
    else act().sendChat(chatText);
    setChatText("");
  };

  const openFullChat = () => {
    const channelId = meetingStore.getState().linkedChannelId;
    if (channelId) messagingStore.getState().setChannel(channelId);
    if (linkedTopicId) messagingStore.getState().setTopic(linkedTopicId);
    navigate("/inbox");
  };

  React.useEffect(() => {
    const el = captionsRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [captions]);

  if (sidePanel === "none" || sidePanel === "host" || sidePanel === "engage") return null;
  const tab = sidePanel;
  const self = participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  return (
    <aside
      aria-label={t("panel")}
      className="absolute inset-0 z-30 flex w-full shrink-0 flex-col border-l border-line bg-white dark:border-gray-700 dark:bg-gray-900 sm:static sm:inset-auto sm:z-auto sm:w-80 xl:w-96"
    >
      <div className="flex items-center gap-1 border-b border-line p-2 dark:border-gray-700" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => act().setSidePanel(tb.key)}
            className={clsx(
              "h-10 flex-1 rounded-md text-sm font-medium",
              tab === tb.key
                ? "bg-brand text-white"
                : "text-ink-2 hover:bg-surface-2 dark:text-gray-300 dark:hover:bg-gray-800",
            )}
          >
            {t(tb.labelKey)}
          </button>
        ))}
        <IconButton label={t("closePanel")} onClick={() => act().setSidePanel("none")}>
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tab === "participants" ? (
          <div className="space-y-2">
            {lobbyQueue.length > 0 ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-2 dark:border-amber-700 dark:bg-amber-950">
                <div className="mb-1 text-sm font-semibold text-ink dark:text-gray-100">
                  {t("lobbyWaiting")}
                </div>
                {lobbyQueue.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 py-1">
                    <Avatar name={l.name} size="sm" />
                    <span className="flex-1 truncate text-sm text-ink dark:text-gray-100">{l.name}</span>
                    <Button size="sm" onClick={() => act().admit(l.id)}>
                      {t("admit")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => act().denyLobby(l.id)}>
                      {t("deny")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <Button variant="secondary" className="w-full" leftIcon={<HiOutlineUsers className="h-4 w-4" aria-hidden />} onClick={() => setBreakoutOpen(true)}>
              {t("breakouts")}
            </Button>

            <ul className="space-y-0.5">
              {participants.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface-2">
                  <Avatar name={p.name} size="sm" />
                  <span className="flex-1 truncate text-sm text-ink dark:text-gray-100">
                    {p.isSelf ? `${p.name} (${t("you")})` : p.name}
                  </span>
                  {p.role !== "attendee" ? (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-blue-800 px-2 py-0.5 text-xs font-medium text-white">
                      {t(`role.${p.role}`)}
                    </span>
                  ) : null}
                  {p.handRaised ? (
                    <HiOutlineHandRaised className="h-4 w-4 text-amber-600" aria-label={t("handRaised")} />
                  ) : null}
                  {p.camOn ? (
                    <HiOutlineVideoCamera className="h-4 w-4 text-muted" aria-hidden />
                  ) : null}
                  {spotlightId === p.id ? (
                    <HiOutlineMapPin className="h-3.5 w-3.5 text-amber-600" aria-label={t("spotlighted")} />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => act().toggleParticipantMute(p.id)}
                    aria-label={p.micOn ? t("muteParticipant") : t("unmuteParticipant")}
                    className="rounded-md p-1.5 text-muted hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-gray-800"
                  >
                    {p.micOn ? (
                      <HiOutlineMicrophone className="h-4 w-4" aria-hidden />
                    ) : (
                      <MdMicOff className="h-4 w-4 text-red-600" aria-hidden />
                    )}
                  </button>
                  {isHost && !p.isSelf ? (
                    <>
                      <button
                        type="button"
                        onClick={() => act().toggleSpotlight(p.id)}
                        aria-label={spotlightId === p.id ? t("unspotlight") : t("spotlight")}
                        className="rounded-md p-1.5 text-muted hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-gray-800"
                      >
                        <HiOutlineMapPin className="h-4 w-4" aria-hidden />
                      </button>
                      {p.handRaised ? (
                        <button
                          type="button"
                          onClick={() => act().toggleParticipantHand(p.id)}
                          aria-label={t("lowerHand")}
                          className="rounded-md p-1.5 text-muted hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-gray-800"
                        >
                          <HiOutlineHandRaised className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                      {p.role === "attendee" ? (
                        <button
                          type="button"
                          onClick={() => act().makeCoHost(p.id)}
                          aria-label={t("makeCoHost")}
                          className="rounded-md p-1.5 text-muted hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-gray-800"
                        >
                          <HiOutlineStar className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => act().removeParticipant(p.id)}
                        aria-label={t("removeParticipant")}
                        className="rounded-md p-1.5 text-red-600 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-brand dark:hover:bg-gray-800"
                      >
                        <HiOutlineUserMinus className="h-4 w-4" aria-hidden />
                      </button>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "chat" ? (
          <div className="flex h-full flex-col">
            {linked ? (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-brand/30 bg-brand/5 p-2">
                <HiOutlineLink className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                <span className="flex-1 truncate text-xs text-ink-2 dark:text-gray-300">
                  {t("linkedChannelNote")}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<HiOutlineArrowTopRightOnSquare className="h-4 w-4" aria-hidden />}
                  onClick={openFullChat}
                >
                  {t("openFullChat")}
                </Button>
              </div>
            ) : null}
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-3 dark:bg-gray-800">
                  <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-muted" aria-hidden />
                </span>
                <p className="text-sm text-ink-2 dark:text-gray-300">{t("chatEmpty")}</p>
              </div>
            ) : (
              <ul className="flex flex-1 flex-col">
                {messages.map((m, i) => {
                  const mine = m.authorId === ME_ID;
                  const grouped = i > 0 && messages[i - 1].authorId === m.authorId;
                  return (
                    <li
                      key={m.id}
                      className={clsx(
                        "flex flex-col",
                        grouped ? "mt-0.5" : "mt-3 first:mt-0",
                        mine ? "items-end" : "items-start",
                      )}
                    >
                      {!grouped ? (
                        <div className={clsx("mb-1 flex items-baseline gap-2 px-1", mine && "flex-row-reverse")}>
                          <span className="text-xs font-semibold text-ink dark:text-gray-100">
                            {mine ? t("you") : memberName(m.authorId)}
                          </span>
                          <span className="text-[0.6875rem] text-muted">{relTime(t, m.tMin)}</span>
                        </div>
                      ) : null}
                      <div
                        className={clsx(
                          "max-w-[85%] break-words rounded-2xl px-3 py-1.5 text-sm leading-snug",
                          "motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-[var(--ease-out)]",
                          "motion-safe:starting:translate-y-1 motion-safe:starting:opacity-0",
                          mine
                            ? "rounded-br-md bg-brand-soft text-brand-700 dark:bg-brand/25 dark:text-blue-100"
                            : "rounded-bl-md bg-surface-3 text-ink dark:bg-gray-800 dark:text-gray-100",
                        )}
                      >
                        {m.body}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {tab === "captions" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant={captionsOn ? "primary" : "secondary"}
                size="sm"
                leftIcon={<MdClosedCaption className="h-4 w-4" aria-hidden />}
                onClick={() => act().toggleCaptions()}
              >
                {captionsOn ? t("captionsOn") : t("captionsOff")}
              </Button>
              <div
                className="inline-flex overflow-hidden rounded-md border border-line dark:border-gray-700"
                role="group"
                aria-label={t("captionLang")}
              >
                {(["en", "tr"] as CaptionLang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={captionLang === l}
                    onClick={() => act().setCaptionLang(l)}
                    className={clsx(
                      "h-10 px-3 text-sm focus-visible:ring-2 focus-visible:ring-brand",
                      captionLang === l
                        ? "bg-brand text-white"
                        : "bg-surface-2 text-muted hover:bg-surface-3 dark:bg-gray-800 dark:hover:bg-gray-700",
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted">{t("captionsNote")}</p>
            <div className="space-y-2" aria-live="polite">
              {captions.length === 0 ? (
                <p className="text-sm text-muted">{t("captionsEmpty")}</p>
              ) : (
                captions.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-brand">{c.speaker}: </span>
                    <span className="text-ink dark:text-gray-100">{c.text}</span>
                  </div>
                ))
              )}
              <div ref={captionsRef} />
            </div>
          </div>
        ) : null}
      </div>

      {tab === "chat" ? (
        <div className="border-t border-line p-2 dark:border-gray-700">
          <div className="relative w-full">
            <label htmlFor="mtg-chat" className="sr-only">
              {t("chatPlaceholder")}
            </label>
            <textarea
              id="mtg-chat"
              rows={1}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitChat();
                }
              }}
              placeholder={t("chatPlaceholder")}
              className="input min-h-[2.75rem] w-full resize-none pr-12 placeholder:text-ink-3"
            />
            <button
              type="button"
              aria-label={t("send")}
              title={t("send")}
              disabled={!chatText.trim()}
              onClick={submitChat}
              className="absolute bottom-1.5 right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white transition-[transform,opacity] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:active:scale-[0.95]"
            >
              <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <BreakoutManager open={breakoutOpen} onClose={() => setBreakoutOpen(false)} />
    </aside>
  );
}
