// web/src/features/support/components/ChannelsPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/createStore";
import { inboxStore } from "../inbox.store";
import { advanceConnection, channelOnboardingState, connectedCount } from "../channels.dom";
import { CHANNEL_ICON, CONNECTION_TONE } from "../shared";
import { Card } from "./Card";
import { PanelHint } from "./PanelHint";
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
      <PanelHint>{t("channels.subtitle")}</PanelHint>

      <ul className="tl-stagger space-y-1.5">
        {inboxes.map((ib) => {
          const c = connOf(ib);
          const step = channelOnboardingState(c);
          const live = c === "connected";
          const changed = c !== (ib.connection ?? "disconnected");
          return (
            <li key={ib.id} className="rounded-lg border border-line p-3">
              <div className="flex items-start gap-2.5">
                <Icon name={CHANNEL_ICON[ib.channelType]} className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{ib.name}</p>
                  <Badge tone={CONNECTION_TONE[c]} className="mt-1">{t(`channels.step.${step.step}`)}</Badge>
                </div>
              </div>

              {/* Alt aksiyon satırı her kartta var → tüm kutular eşit yükseklik */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {live ? (
                  <span className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-2 px-4 text-xs font-medium text-muted sm:w-auto">
                    <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-green-600" aria-hidden /> {t("channels.connectedLabel")}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full sm:w-auto"
                    aria-label={t("channels.advanceFor", { name: ib.name })}
                    onClick={() => setConn((s) => ({ ...s, [ib.id]: advanceConnection(c) }))}
                  >
                    <Icon name="arrow" className="h-4 w-4 shrink-0" aria-hidden /> {t("channels.advance")}
                  </Button>
                )}
                {changed ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full sm:w-auto"
                    aria-label={t("channels.resetFor", { name: ib.name })}
                    onClick={() => setConn((s) => ({ ...s, [ib.id]: ib.connection ?? "disconnected" }))}
                  >
                    <Icon name="reschedule" className="h-4 w-4 shrink-0" aria-hidden /> {t("channels.reset")}
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
