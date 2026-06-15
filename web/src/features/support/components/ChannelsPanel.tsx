// web/src/features/support/components/ChannelsPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/createStore";
import { inboxStore } from "../inbox.store";
import { advanceConnection, channelOnboardingState, canEnableCoexistence, connectedCount } from "../channels.dom";
import { CHANNEL_ICON, CONNECTION_TONE } from "../shared";
import { Card } from "./Card";
import type { ChannelConnection, Inbox } from "../support.types";

/**
 * Kanal bağlama onboarding'i (Meta Embedded Signup → Coexistence → canlı).
 * Bağlantı durumu burada yerel olarak simüle edilir (paylaşılan inbox.store'a
 * dokunmadan); "Kuruluma devam et" sihirbazı bir adım ilerletir.
 */
export function ChannelsPanel() {
  const { t } = useTranslation("support");
  const inboxes = useStore(inboxStore, (s) => s.inboxes);

  // Yerel onboarding durumu: inbox seed'inden başlat, sihirbazla ilerlet.
  const [conn, setConn] = useState<Record<string, ChannelConnection>>(() =>
    Object.fromEntries(inboxes.map((ib) => [ib.id, ib.connection ?? "disconnected"])),
  );
  const connOf = (ib: Inbox): ChannelConnection => conn[ib.id] ?? ib.connection ?? "disconnected";
  const withConn = (ib: Inbox): Inbox => ({ ...ib, connection: connOf(ib) });

  const liveCount = connectedCount(inboxes.map(withConn));

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-base font-semibold text-ink">
          <Icon name="link" className="h-5 w-5" aria-hidden /> {t("channels.title")}
        </h3>
        <Badge tone="positive">{t("channels.connected", { n: liveCount })}</Badge>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
          <Icon name="sparkles" className="h-3.5 w-3.5" aria-hidden /> {t("channels.embeddedSignup")}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted">{t("channels.subtitle")}</p>

      <ul className="space-y-1.5">
        {inboxes.map((ib) => {
          const c = connOf(ib);
          const step = channelOnboardingState(c);
          const live = c === "connected";
          return (
            <li key={ib.id} className="rounded-lg border border-line px-3 py-2">
              <div className="flex flex-wrap items-center gap-2 text-base">
                <Icon name={CHANNEL_ICON[ib.channelType]} className="h-4 w-4 text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-ink">{ib.name}</span>
                {canEnableCoexistence(withConn(ib)) ? <Badge tone="accent">{t("channels.coexistence")}</Badge> : null}
                <Badge tone={CONNECTION_TONE[c]}>{t(`channels.step.${step.step}`)}</Badge>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-200 ease-[var(--ease-out,ease-out)] motion-reduce:transition-none"
                  style={{ width: `${Math.round(step.progress * 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant={live ? "secondary" : "primary"}
                  disabled={live}
                  aria-label={t("channels.advanceFor", { name: ib.name })}
                  onClick={() => setConn((s) => ({ ...s, [ib.id]: advanceConnection(c) }))}
                >
                  {live ? (
                    <>
                      <Icon name="check" className="h-4 w-4" aria-hidden /> {t("channels.step.live")}
                    </>
                  ) : (
                    <>
                      <Icon name="arrow" className="h-4 w-4" aria-hidden /> {t("channels.advance")}
                    </>
                  )}
                </Button>
                {c !== (ib.connection ?? "disconnected") ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t("channels.resetFor", { name: ib.name })}
                    onClick={() => setConn((s) => ({ ...s, [ib.id]: ib.connection ?? "disconnected" }))}
                  >
                    <Icon name="reschedule" className="h-4 w-4" aria-hidden /> {t("channels.reset")}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
