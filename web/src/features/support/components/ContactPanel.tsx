// web/src/features/support/components/ContactPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { conversationStore } from "../conversation.store";
import { csatAverage } from "../support.dom";
import { CONTACTS } from "../support.data";
import { Card } from "./Card";
import { KbPanel } from "./KbPanel";

/** Aktif konuşmanın kişi + bağlam paneli (yalnızca geniş ekran). */
export function ContactPanel() {
  const { t } = useTranslation("support");
  const conversations = useStore(conversationStore, (s) => s.conversations);
  const conv = useStore(
    conversationStore,
    (s) => s.conversations.find((c) => c.id === s.activeConversationId) ?? null,
  );
  const [label, setLabel] = useState("");
  const teamCsat = csatAverage(conversations);

  if (!conv) return null;
  const contact = CONTACTS.find((c) => c.id === conv.contactId);
  if (!contact) return null;

  const submitLabel = () => {
    const v = label.trim();
    if (!v) return;
    conversationStore.getState().addLabel(conv.id, v);
    setLabel("");
  };

  return (
    <div className="hidden min-h-0 shrink-0 space-y-3 overflow-y-auto rounded-xl border border-line bg-surface-2 p-3 xl:block">
      {/* Identity */}
      <Card className="p-3">
        <h3 className="mb-2 text-base font-semibold text-ink">{contact.name}</h3>
        <ul className="space-y-1 text-base text-muted">
          {contact.identifiers.email ? (
            <li className="flex items-center gap-2">
              <Icon name="envelope" className="h-3.5 w-3.5 shrink-0" aria-hidden /> <span className="truncate">{contact.identifiers.email}</span>
            </li>
          ) : null}
          {contact.identifiers.phone ? (
            <li className="flex items-center gap-2">
              <Icon name="phone" className="h-3.5 w-3.5 shrink-0" aria-hidden /> {contact.identifiers.phone}
            </li>
          ) : null}
          {contact.identifiers.social ? (
            <li className="flex items-center gap-2">
              <Icon name="at" className="h-3.5 w-3.5 shrink-0" aria-hidden /> {contact.identifiers.social}
            </li>
          ) : null}
        </ul>
      </Card>

      {/* Attributes */}
      {Object.keys(contact.attributes).length > 0 ? (
        <Card className="p-3">
          <h3 className="mb-2 text-base font-semibold text-ink">{t("contact.attributes")}</h3>
          <dl className="space-y-1 text-base">
            {Object.entries(contact.attributes).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-muted">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}

      {/* Labels */}
      <Card className="p-3">
        <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-ink">
          <Icon name="tag" className="h-4 w-4" aria-hidden /> {t("contact.labels")}
        </h3>
        <div className="mb-2 flex flex-wrap gap-1">
          {conv.labels.length === 0 ? <span className="text-base text-muted">{t("contact.noLabels")}</span> : null}
          {conv.labels.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-base text-ink">
              {l}
              <button
                onClick={() => conversationStore.getState().removeLabel(conv.id, l)}
                aria-label={t("contact.removeLabel", { label: l })}
                className="text-muted transition-colors hover:text-danger"
              >
                <Icon name="close" className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitLabel();
            }}
            placeholder={t("contact.addLabel")}
            aria-label={t("contact.addLabel")}
            className="h-9 flex-1 rounded-md border border-line bg-surface px-2 text-base text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand"
          />
          <IconButton label={t("contact.addLabel")} onClick={submitLabel}>
            <Icon name="plus" className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      </Card>

      {/* CSAT */}
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">{t("conversation.csat")}</h3>
          {teamCsat > 0 ? <Badge tone="accent">{t("contact.csatAvg", { n: teamCsat.toFixed(1) })}</Badge> : null}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label={t("conversation.csat")}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (conv.csat ?? 0) >= n;
            return (
              <button
                key={n}
                onClick={() => conversationStore.getState().submitCsat(conv.id, n)}
                aria-label={t("contact.csatRate", { n })}
                className="transition-transform duration-150 ease-out hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <Icon name="star" className={clsx("h-5 w-5", filled ? "text-amber-400" : "text-muted")} aria-hidden />
              </button>
            );
          })}
        </div>
      </Card>

      <KbPanel />
    </div>
  );
}
