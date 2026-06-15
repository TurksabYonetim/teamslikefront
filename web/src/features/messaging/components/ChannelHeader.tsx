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
  HiOutlineSignal,
} from "react-icons/hi2";
import { messagingStore, useMessaging } from "../store";
import { TOPICS } from "../data";
import { Button, Badge, IconButton, Dropdown, DropdownItem, useToast } from "@/components/ui";
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
      {channel?.ongoingMeetingId ? (
        <div
          data-testid="ongoing-meeting-bar"
          className="flex items-center gap-2 border-b border-line bg-brand/10 px-4 py-2 text-sm text-brand dark:border-gray-700"
          style={{ animation: "tl-ongoing-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          <HiOutlineSignal className="h-4 w-4" aria-hidden />
          <span className="font-medium">{t("ongoingMeeting.label")}</span>
          <Button
            className="ml-auto"
            onClick={() => navigate("/room")}
            leftIcon={<HiOutlineVideoCamera className="h-4 w-4" aria-hidden />}
          >
            {t("ongoingMeeting.join")}
          </Button>
          <style>{`@keyframes tl-ongoing-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){[style*="tl-ongoing-in"]{animation:none!important}}`}</style>
        </div>
      ) : null}
      <header className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3 dark:border-gray-700 dark:bg-gray-700">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-lg font-semibold text-ink dark:text-white">
            {channel ? <KindGlyph kind={channel.kind} /> : null}
            <span className="truncate">{channel?.name}</span>
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
                <HiOutlineUsers className="h-3.5 w-3.5" aria-hidden />{" "}
                {channel.externalOrgs?.length ? channel.externalOrgs.join(", ") : t("sharedChannel")}
              </Badge>
            ) : null}
            {channel?.isCustomer && channel.status ? (
              <Dropdown
                label={t(`status.${channel.status}`)}
                align="start"
                triggerClassName="inline-flex items-center gap-1 rounded-sm border border-line px-2 py-0.5 text-sm dark:border-gray-700"
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
          <div className="truncate text-sm text-muted">{subtitle}</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <HiOutlineMagnifyingGlass className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="h-9 w-40 rounded-md border border-line bg-white pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <IconButton
            label={t("search")}
            variant={searchOpen ? "primary" : "ghost"}
            aria-expanded={searchOpen}
            className="sm:hidden"
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
          {channel && channel.kind !== "broadcast" ? (
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
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 dark:border-gray-700 dark:bg-gray-700 sm:hidden">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="h-9 w-full rounded-md border border-line bg-white pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
