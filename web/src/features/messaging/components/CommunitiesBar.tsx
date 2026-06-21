import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import clsx from "clsx";
import { communitiesStore, useCommunities } from "../communitiesStore";
import { messagingStore, useMessaging } from "../store";
import { communityChannels } from "../chat";
import type { Community } from "../types";

/** Community rail (group-of-groups). Selecting one jumps to its first channel. */
export function CommunitiesBar() {
  const { t } = useTranslation(["messaging", "common"]);
  const navigate = useNavigate();
  const communities = useCommunities((s) => s.communities);
  const activeId = useCommunities((s) => s.activeCommunityId);
  const channels = useMessaging((s) => s.channels);

  const pick = (c: Community) => {
    communitiesStore.getState().setActiveCommunity(c.id);
    const first = communityChannels(c, channels)[0];
    if (first) messagingStore.getState().setChannel(first.id);
  };

  return (
    <nav
      aria-label={t("communities")}
      className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface-2 py-2 dark:border-gray-700 dark:bg-gray-700"
    >
      <button
        type="button"
        data-testid="community-home"
        onClick={() => navigate("/")}
        aria-label={t("common:nav.home")}
        title={t("common:nav.home")}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-muted transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-3 motion-safe:active:scale-95 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <HiOutlineSquares2X2 className="h-5 w-5" aria-hidden />
      </button>
      {communities.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => pick(c)}
          aria-label={c.name}
          aria-current={activeId === c.id ? "page" : undefined}
          title={c.name}
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-xl text-base font-semibold uppercase transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-95",
            // Aktif = AAA dolu marka (beyaz üstüne blue-800, 8.6:1; eski bg-brand AA 6.5:1 idi).
            activeId === c.id
              ? "bg-blue-800 text-white"
              : "bg-white text-ink hover:bg-surface-3 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
          )}
        >
          {c.name.slice(0, 2)}
        </button>
      ))}
    </nav>
  );
}
