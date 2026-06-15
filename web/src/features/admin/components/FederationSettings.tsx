import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button } from "@/components/ui";
import { useAdminStore } from "../governance.store";

const INPUT_CLASS =
  "h-10 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function FederationSettings() {
  const { t } = useTranslation("admin");
  const federation = useAdminStore((s) => s.federation);
  const addBridge = useAdminStore((s) => s.addBridge);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <div className="tl-stagger flex flex-col gap-3">
      {federation.map((f) => {
        const draft = drafts[f.id] ?? "";
        const add = () => {
          const v = draft.trim();
          if (!v) return;
          addBridge(f.id, v);
          setDrafts((d) => ({ ...d, [f.id]: "" }));
        };
        return (
          <div key={f.id} className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="globe" className="h-[18px] w-[18px] text-muted" />
              <span className="text-sm font-semibold text-ink">
                {f.protocol} · {f.remote}
              </span>
              <Badge tone={f.connected ? "positive" : "neutral"} className="ml-auto">
                {f.connected ? t("connected") : t("disconnected")}
              </Badge>
            </div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {f.bridges.map((b) => (
                <Badge key={b} tone="accent">
                  {b}
                </Badge>
              ))}
              {f.bridges.length === 0 ? (
                <span className="text-sm text-muted">{t("noBridges")}</span>
              ) : null}
            </div>
            <div className="flex items-end gap-2">
              <input
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) add();
                }}
                placeholder={t("bridgePh")}
                aria-label={t("bridgePh")}
                className={INPUT_CLASS}
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!draft.trim()}
                onClick={add}
                leftIcon={<Icon name="plus" className="h-4 w-4" />}
              >
                {t("addBridge")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
