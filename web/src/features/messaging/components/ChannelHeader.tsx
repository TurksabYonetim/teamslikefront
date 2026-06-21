import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineHashtag,
  HiOutlineLockClosed,
  HiOutlineMegaphone,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineMagnifyingGlass,
  HiOutlineVideoCamera,
  HiOutlineChevronDown,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineBookmark,
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineCpuChip,
} from "react-icons/hi2";
import { messagingStore, useMessaging } from "../store";
import { TOPICS } from "../data";
import { Button, Badge, IconButton, Dropdown, DropdownItem, useToast } from "@/components/ui";
import { StoriesBar } from "./StoriesBar";
import type { ChannelKind, ConversationStatus } from "../types";

const STATUSES: ConversationStatus[] = ["open", "pending", "resolved"];
const statusTone: Record<ConversationStatus, "warning" | "accent" | "positive"> = {
  open: "warning",
  pending: "accent",
  resolved: "positive",
};

function KindGlyph({ kind }: { kind: ChannelKind }) {
  const Icon =
    kind === "private"
      ? HiOutlineLockClosed
      : kind === "shared"
        ? HiOutlineUsers
        : kind === "broadcast"
          ? HiOutlineMegaphone
          : kind === "dm"
            ? HiOutlineChatBubbleOvalLeft
            : HiOutlineHashtag;
  return <Icon className="h-[18px] w-[18px]" aria-hidden />;
}

export function ChannelHeader() {
  const { t } = useTranslation("messaging");
  const navigate = useNavigate();
  const toast = useToast();
  const channels = useMessaging((s) => s.channels);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const search = useMessaging((s) => s.search);
  const detailsOpen = useMessaging((s) => s.detailsOpen);
  const savedOnly = useMessaging((s) => s.savedOnly);

  const setSearch = (q: string) => messagingStore.getState().setSearch(q);
  const setStatus = (id: string, status: ConversationStatus) => messagingStore.getState().setStatus(id, status);
  const toggleDetails = () => messagingStore.getState().toggleDetails();
  const toggleSavedOnly = () => messagingStore.getState().toggleSavedOnly();

  const channel = channels.find((c) => c.id === activeChannelId);
  const topic = TOPICS.find((tp) => tp.id === activeTopicId);
  const isChannel = channel?.kind === "channel" || channel?.kind === "private";
  const subtitle =
    channel?.kind === "broadcast"
      ? t("subscribers", { n: channel.subscribers ?? 0 })
      : isChannel
        ? topic?.title
        : t("directMessage");

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [catchUpRunning, setCatchUpRunning] = React.useState(false);

  // AI Catch Up — kanal bağlamıyla özet isteği (backend yok → toast + zaman aşımı stub).
  const runCatchUp = () => {
    if (!channel || catchUpRunning) return;
    setCatchUpRunning(true);
    toast.show({ message: t("ai.catchUpRunning") });
    window.setTimeout(() => {
      setCatchUpRunning(false);
      toast.show({ message: t("ai.catchUpDone"), variant: "success" });
    }, 1100);
  };

  // Konuşma zekâsı — müşteri kanallarında 'src_support' kaynağına götür.
  // IntelligenceDashboard ?source= deep-link'iyle ilgili kaynağı seçer.
  const openIntelligence = (sourceId: string) => {
    toast.show({ message: t("intelligence.opening") });
    navigate(`/intelligence?source=${encodeURIComponent(sourceId)}`);
  };

  return (
    <>
      {/* Tek satırlık birleşik başlık (sakin mono): kimlik · canlı toplantı (sade pill) · durum facepile · aksiyonlar */}
      <header className="flex h-14 items-center gap-2 border-b border-line bg-surface-2 px-2 sm:gap-3 sm:px-4 dark:border-gray-700 dark:bg-gray-700">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="flex min-w-0 items-center gap-1.5 text-lg font-semibold text-ink sm:text-xl dark:text-white">
            {channel ? <KindGlyph kind={channel.kind} /> : null}
            <span className="truncate">{channel?.name}</span>
          </h1>
          {subtitle ? (
            <span className="hidden min-w-0 items-center gap-2 text-sm text-muted md:flex">
              <span aria-hidden className="text-line dark:text-gray-600">
                ·
              </span>
              <span className="truncate">{subtitle}</span>
            </span>
          ) : null}
          <div className="flex shrink-0 items-center gap-1.5">
            {channel?.e2ee ? (
              <Badge tone="positive">
                <HiOutlineLockClosed className="h-3.5 w-3.5" aria-hidden /> {t("e2ee")}
              </Badge>
            ) : null}
            {channel?.disappearing && channel.disappearing !== "off" ? (
              <Badge tone="warning">
                <HiOutlineClock className="h-3.5 w-3.5" aria-hidden /> {t(`timer.${channel.disappearing}`)}
              </Badge>
            ) : null}
            {channel?.kind === "shared" ? (
              <Badge tone="accent">
                <HiOutlineUsers className="h-3.5 w-3.5 shrink-0" aria-hidden />{" "}
                <span className="inline-block max-w-[12ch] truncate align-bottom">
                  {channel.externalOrgs?.length ? channel.externalOrgs.join(", ") : t("sharedChannel")}
                </span>
              </Badge>
            ) : null}
            {channel?.isCustomer && channel.status ? (
              <Dropdown
                label={t(`status.${channel.status}`)}
                align="start"
                triggerClassName="inline-flex items-center gap-1 rounded-sm border border-line px-2 py-0.5 text-sm transition-transform ease-[var(--ease-out)] motion-safe:active:scale-[0.97] dark:border-gray-700"
                trigger={
                  <>
                    <Badge tone={statusTone[channel.status]}>{t(`status.${channel.status}`)}</Badge>
                    <HiOutlineChevronDown className="h-3 w-3" aria-hidden />
                  </>
                }
              >
                {STATUSES.map((st) => (
                  <DropdownItem key={st} onSelect={() => setStatus(channel.id, st)}>
                    {t(`status.${st}`)}
                  </DropdownItem>
                ))}
              </Dropdown>
            ) : null}
          </div>
        </div>

        {/* Canlı toplantı — renk-kısıtlı sade outline pill; durum = nokta + metin (renk tek taşıyıcı değil).
            Katıl AAA mavi metin (blue-800, 8.4:1). */}
        {channel?.ongoingMeetingId ? (
          <div
            data-testid="ongoing-meeting-bar"
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white py-1 pl-3 pr-1 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />
            <span className="hidden font-medium text-ink-2 sm:inline dark:text-gray-200">{t("ongoingMeeting.label")}</span>
            <button
              type="button"
              onClick={() => navigate("/room")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-blue-800 transition-[background-color,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 motion-safe:active:scale-[0.97] dark:text-blue-300 dark:hover:bg-gray-700"
            >
              <HiOutlineVideoCamera className="h-4 w-4" aria-hidden />
              {t("ongoingMeeting.join")}
            </button>
          </div>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <div className="hidden sm:flex">
            <StoriesBar />
          </div>
          <span className="mx-0.5 hidden h-6 w-px bg-line dark:bg-gray-600 sm:block" aria-hidden />
          <div className="relative hidden lg:block">
            <HiOutlineMagnifyingGlass className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="input h-9 w-40 pl-8 pr-3"
            />
          </div>
          <IconButton
            label={t("search")}
            variant={searchOpen ? "primary" : "ghost"}
            aria-expanded={searchOpen}
            className="lg:hidden"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <HiOutlineMagnifyingGlass className="h-5 w-5" aria-hidden />
          </IconButton>
          {channel ? (
            <IconButton
              label={t("ai.catchUp")}
              variant="ghost"
              onClick={runCatchUp}
              aria-busy={catchUpRunning}
              disabled={catchUpRunning}
            >
              <HiOutlineSparkles
                className={clsx("h-5 w-5", catchUpRunning && "animate-pulse text-brand")}
                aria-hidden
              />
            </IconButton>
          ) : null}
          {channel?.isCustomer ? (
            <IconButton label={t("intelligence.open")} variant="ghost" onClick={() => openIntelligence("src_support")}>
              <HiOutlineCpuChip className="h-5 w-5" aria-hidden />
            </IconButton>
          ) : null}
          {channel && channel.kind !== "broadcast" && !channel.ongoingMeetingId ? (
            <Button onClick={() => navigate("/room")} leftIcon={<HiOutlineVideoCamera className="h-[18px] w-[18px]" aria-hidden />}>
              <span className="hidden sm:inline">{t("startMeeting")}</span>
            </Button>
          ) : null}
          <IconButton label={t("savedOnly")} variant={savedOnly ? "primary" : "ghost"} onClick={toggleSavedOnly}>
            <HiOutlineBookmark className="h-5 w-5" aria-hidden />
          </IconButton>
          <IconButton label={t("details")} variant={detailsOpen ? "primary" : "ghost"} onClick={toggleDetails}>
            <HiOutlineInformationCircle className="h-5 w-5" aria-hidden />
          </IconButton>
        </div>
      </header>

      {searchOpen ? (
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-2 py-2 sm:px-4 dark:border-gray-700 dark:bg-gray-700 lg:hidden">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="input h-9 w-full pl-8 pr-3"
            />
          </div>
          <IconButton
            label={t("search")}
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSearchOpen(false);
            }}
          >
            <HiOutlineXMark className="h-5 w-5" aria-hidden />
          </IconButton>
        </div>
      ) : null}
    </>
  );
}
