import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineHashtag,
  HiOutlineLockClosed,
  HiOutlineMegaphone,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineBellSlash,
  HiOutlineMapPin,
  HiOutlineEllipsisHorizontal,
  HiOutlineBookmark,
  HiOutlineEnvelope,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlineChatBubbleOvalLeft,
} from "react-icons/hi2";
import clsx from "clsx";
import { useWorkspaceId, inActiveWorkspace } from "@/lib/tenantStore";
import { messagingStore, useMessaging } from "../store";
import { TOPICS } from "../data";
import { memberById } from "../members";
import { Avatar, Badge, Button, Dropdown, DropdownItem, EmptyState, PresenceDot } from "@/components/ui";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { NewDmDialog } from "./NewDmDialog";
import { SavedDrawer } from "./SavedDrawer";
import type { Channel, ChatFolder, ConversationStatus } from "../types";

const FOLDERS: ChatFolder[] = ["all", "unread", "dms", "channels"];
const statusTone: Record<ConversationStatus, string> = {
  open: "bg-amber-500",
  pending: "bg-brand",
  resolved: "bg-green-500",
};

function Glyph({ kind }: { kind: Channel["kind"] }) {
  const Icon = kind === "private" ? HiOutlineLockClosed : kind === "broadcast" ? HiOutlineMegaphone : HiOutlineHashtag;
  return <Icon className="h-[18px] w-[18px]" aria-hidden />;
}

export function MessagingSidebar() {
  const { t } = useTranslation("messaging");
  const channels = useMessaging((s) => s.channels);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const folder = useMessaging((s) => s.folder);
  const workspaceId = useWorkspaceId();

  const [channelDialog, setChannelDialog] = React.useState(false);
  const [dmDialog, setDmDialog] = React.useState(false);
  const [savedOpen, setSavedOpen] = React.useState(false);

  const setChannel = (id: string) => messagingStore.getState().setChannel(id);
  const setTopic = (id: string) => messagingStore.getState().setTopic(id);
  const setFolder = (f: ChatFolder) => messagingStore.getState().setFolder(f);
  const togglePinChat = (id: string) => messagingStore.getState().togglePinChat(id);
  const toggleMuteChat = (id: string) => messagingStore.getState().toggleMuteChat(id);
  const toggleMarkUnread = (id: string) => messagingStore.getState().toggleMarkUnread(id);
  const archiveChannel = (id: string) => messagingStore.getState().archiveChannel(id);

  const matchesFolder = (c: Channel) => {
    // Çalışma alanı süzgeci: kanallar alanlarına göre süzülür; DM'ler global kalır.
    if (c.kind !== "dm" && !inActiveWorkspace(c.workspaceId, workspaceId)) return false;
    if (folder === "unread") return (c.unread ?? 0) > 0;
    if (folder === "dms") return c.kind === "dm";
    if (folder === "channels") return c.kind !== "dm";
    return true;
  };

  const pinned = channels.filter((c) => c.pinned && matchesFolder(c));
  const chans = channels.filter((c) => c.kind !== "dm" && !c.pinned && matchesFolder(c));
  const dms = channels.filter((c) => c.kind === "dm" && !c.pinned && matchesFolder(c));

  const ChatRow = ({ c }: { c: Channel }) => {
    const active = c.id === activeChannelId;
    const member = c.dmUserId ? memberById(c.dmUserId) : undefined;
    const isChannel = c.kind !== "dm";
    const topics = TOPICS.filter((tp) => tp.channelId === c.id);
    const hasTopics = isChannel && topics.length > 1;

    return (
      <div className="group">
        <div
          className={clsx(
            "flex h-11 items-center gap-1 rounded-md pr-1",
            active
              ? "bg-surface-2 font-semibold text-ink dark:bg-gray-700 dark:text-white"
              : "text-ink hover:bg-surface-2 dark:text-white dark:hover:bg-gray-700",
            c.archived && "opacity-60",
          )}
        >
          <button
            type="button"
            onClick={() => setChannel(c.id)}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 px-2 text-start text-sm"
          >
            {hasTopics ? (
              active ? (
                <HiOutlineChevronDown className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <HiOutlineChevronRight className="h-3.5 w-3.5" aria-hidden />
              )
            ) : (
              <span className="w-3.5" aria-hidden />
            )}
            {isChannel ? (
              <Glyph kind={c.kind} />
            ) : (
              <span className="relative inline-block">
                <Avatar name={c.name} size="sm" />
                {member ? <PresenceDot presence={member.presence} className="absolute -bottom-0.5 -right-0.5" /> : null}
              </span>
            )}
            <span className="truncate">{c.name}</span>
            {c.isCustomer && c.status ? (
              <span className={clsx("inline-block h-2 w-2 rounded-full", statusTone[c.status])} aria-label={t(`status.${c.status}`)} />
            ) : null}
            {c.e2ee ? <HiOutlineLockClosed className="h-3 w-3 text-green-600" aria-hidden /> : null}
            {c.muted ? <HiOutlineBellSlash className="h-3 w-3 text-muted" aria-hidden /> : null}
            {c.kind === "broadcast" && c.subscribers ? (
              <span className="text-xs text-muted">{(c.subscribers / 1000).toFixed(1)}k</span>
            ) : null}
          </button>

          {c.archived ? <Badge tone="neutral">{t("archived")}</Badge> : null}
          {c.label ? <Badge tone="neutral">{c.label}</Badge> : null}
          {c.unread ? <Badge tone="accent">{c.unread}</Badge> : null}

          <Dropdown
            label={t("chatActions")}
            align="end"
            triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted opacity-0 focus-visible:opacity-100 group-hover:opacity-100 sm:group-focus-within:opacity-100 max-sm:opacity-100 dark:hover:bg-gray-800"
            trigger={<HiOutlineEllipsisHorizontal className="h-[18px] w-[18px]" aria-hidden />}
          >
            <DropdownItem onSelect={() => togglePinChat(c.id)}>
              <HiOutlineMapPin className="h-[18px] w-[18px]" aria-hidden /> {c.pinned ? t("unpinChat") : t("pinChat")}
            </DropdownItem>
            <DropdownItem onSelect={() => toggleMuteChat(c.id)}>
              <HiOutlineBellSlash className="h-[18px] w-[18px]" aria-hidden /> {c.muted ? t("unmuteChat") : t("muteChat")}
            </DropdownItem>
            <DropdownItem onSelect={() => toggleMarkUnread(c.id)}>
              <HiOutlineEnvelope className="h-[18px] w-[18px]" aria-hidden /> {t("markUnread")}
            </DropdownItem>
            <DropdownItem onSelect={() => archiveChannel(c.id)}>
              <HiOutlineArchiveBox className="h-[18px] w-[18px]" aria-hidden /> {c.archived ? t("unarchive") : t("archive")}
            </DropdownItem>
          </Dropdown>
        </div>

        {active && hasTopics ? (
          <ul className="mb-1 ml-7 mt-1 space-y-0.5">
            {topics.map((tp) => (
              <li key={tp.id}>
                <button
                  type="button"
                  onClick={() => setTopic(tp.id)}
                  aria-current={tp.id === activeTopicId}
                  className={clsx(
                    "flex h-9 w-full items-center rounded-md px-2 text-sm",
                    tp.id === activeTopicId
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-surface-2 hover:text-ink dark:hover:bg-gray-700 dark:hover:text-white",
                  )}
                >
                  <span className="truncate">{tp.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  return (
    <nav
      aria-label={t("sidebar.title")}
      className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Actions + folders */}
      <div className="space-y-2 border-b border-line p-2 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <span className="flex-1 px-1 text-sm font-semibold text-ink dark:text-white">{t("sidebar.title")}</span>
          <Dropdown
            label={t("new")}
            align="end"
            triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:hover:bg-gray-700"
            trigger={<HiOutlinePlus className="h-[18px] w-[18px]" aria-hidden />}
          >
            <DropdownItem onSelect={() => setChannelDialog(true)}>
              <HiOutlineHashtag className="h-[18px] w-[18px]" aria-hidden /> {t("newChannel")}
            </DropdownItem>
            <DropdownItem onSelect={() => setDmDialog(true)}>
              <HiOutlineChatBubbleOvalLeft className="h-[18px] w-[18px]" aria-hidden /> {t("newDm")}
            </DropdownItem>
          </Dropdown>
          <button
            type="button"
            onClick={() => messagingStore.getState().togglePalette(true)}
            aria-label={t("searchAll")}
            title={t("searchAll")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            <HiOutlineMagnifyingGlass className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setSavedOpen(true)}
            aria-label={t("savedTitle")}
            title={t("savedTitle")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            <HiOutlineBookmark className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
        <div className="flex gap-1" role="tablist" aria-label={t("folders")}>
          {FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={folder === f}
              onClick={() => setFolder(f)}
              className={clsx(
                "h-9 flex-1 rounded-md text-sm",
                folder === f ? "bg-brand text-white" : "text-muted hover:bg-surface-2 dark:hover:bg-gray-700",
              )}
            >
              {t(`folder.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 p-3">
        {pinned.length > 0 ? (
          <div>
            <div className="flex items-center gap-1 px-2 pb-1 text-sm font-semibold text-muted">
              <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden /> {t("pinnedChats")}
            </div>
            {pinned.map((c) => (
              <ChatRow key={c.id} c={c} />
            ))}
          </div>
        ) : null}

        {chans.length > 0 ? (
          <div>
            <div className="px-2 pb-1 text-sm font-semibold text-muted">{t("channels")}</div>
            {chans.map((c) => (
              <ChatRow key={c.id} c={c} />
            ))}
          </div>
        ) : pinned.length === 0 && (folder === "all" || folder === "channels") ? (
          <EmptyState
            icon={<HiOutlineHashtag className="h-6 w-6" aria-hidden />}
            title={t("noChannelsTitle")}
            description={t("noChannelsHint")}
            action={
              <Button onClick={() => setChannelDialog(true)} leftIcon={<HiOutlinePlus className="h-4 w-4" aria-hidden />}>
                {t("newChannel")}
              </Button>
            }
          />
        ) : null}

        {dms.length > 0 ? (
          <div>
            <div className="px-2 pb-1 text-sm font-semibold text-muted">{t("dms")}</div>
            {dms.map((c) => (
              <ChatRow key={c.id} c={c} />
            ))}
          </div>
        ) : null}
      </div>

      <CreateChannelDialog open={channelDialog} onClose={() => setChannelDialog(false)} />
      <NewDmDialog open={dmDialog} onClose={() => setDmDialog(false)} />
      <SavedDrawer open={savedOpen} onClose={() => setSavedOpen(false)} />
    </nav>
  );
}
