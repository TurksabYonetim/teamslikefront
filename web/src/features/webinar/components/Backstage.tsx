// web/src/features/webinar/components/Backstage.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, useToast } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { PANELISTS } from "../webinar.data";
import { Card } from "./Card";
import type { PanelistRole } from "../webinar.types";

const ROLE_TONE: Record<PanelistRole, "accent" | "neutral" | "positive"> = {
  host: "accent",
  panelist: "neutral",
  moderator: "positive",
};

export function Backstage() {
  const { t } = useTranslation("webinar");
  const mode = useStore(webinarStore, (s) => s.mode);
  const goLive = () => webinarStore.getState().goLive();
  const toast = useToast();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-ink">{t("panelists")}</h3>
        <ul className="space-y-1.5">
          {PANELISTS.map((p) => (
            <li key={p.id} className="panelist-row flex items-center gap-2.5 rounded-md border border-line px-3 py-2 text-sm">
              <span className={`panelist-avatar shrink-0${p.role === "host" ? " is-host" : ""}`}>
                <Icon name="userCircle" className="h-5 w-5 text-muted" />
                <span className="panelist-dot" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-ink">{p.name}</span>
              <Badge tone={ROLE_TONE[p.role]}>{t(`role.${p.role}`)}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-ink">{t("broadcast")}</h3>
        <p className="mb-3 text-sm text-muted">{t("broadcastHint")}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={goLive} leftIcon={<Icon name="broadcast" className="h-5 w-5" />}>
            {t("goLive")}
          </Button>
          {mode === "simulive" || mode === "evergreen" ? (
            <Button
              variant="secondary"
              leftIcon={<Icon name="film" className="h-5 w-5" />}
              onClick={() => toast.show({ message: t("simuliveStarted"), variant: "success" })}
            >
              {t("startSimulive")}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
