import { useTranslation } from "react-i18next";
import {
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { RECAPS } from "../intel.data";
import { memberName } from "@/features/messaging/members";
import { useSendActionToChat } from "@/features/integration";
import { useContext } from "react";
import { ToastContext } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Structured AI recap (Zoom/Teams Intelligent Recap). Decisions and next steps
 * read as a single decision-flow timeline; action items are owner-led rows that
 * can be pushed into Messaging (Faz 4 cross-cut).
 */
export function RecapPanel() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const recap = RECAPS[id];
  const toast = useContext(ToastContext);
  const sendActionToChat = useSendActionToChat();
  if (!recap) return null;

  const sendToChat = (text: string) => {
    sendActionToChat(text);
    toast?.show({ message: t("sentToChat"), variant: "success" });
  };

  // Karar akışı: kararlar → sonraki adımlar, tek bir dikey zaman çizelgesinde.
  const flow = [
    ...recap.decisions.map((text) => ({ kind: t("decision"), text })),
    ...recap.nextSteps.map((text) => ({ kind: t("nextStep"), text })),
  ];

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-1 flex items-center gap-1.5 text-base font-semibold text-ink dark:text-white">
        <HiOutlineCheckBadge size={16} className="text-brand dark:text-blue-400" aria-hidden /> {t("recap")}
      </h3>
      <p className="text-sm text-ink-2 dark:text-white">{recap.tldr}</p>

      {flow.length > 0 ? (
        <>
          <h4 className="mb-2 mt-3 text-sm font-semibold text-ink dark:text-gray-200">{t("recapFlow")}</h4>
          <ul className="rp-flow">
            {flow.map((s, i) => (
              <li key={i} className="rp-flow-item">
                <span className="rp-flow-dot" aria-hidden />
                <span className="rp-flow-line" aria-hidden />
                <span className="block text-xs font-medium text-muted dark:text-gray-400">{s.kind}</span>
                <span className="block text-sm text-ink-2 dark:text-white">{s.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {recap.actions.length > 0 ? (
        <section className="mt-3 border-t border-line pt-3 dark:border-gray-700">
          <h4 className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink dark:text-gray-200">
            <HiOutlineClipboardDocumentCheck size={16} aria-hidden /> {t("actionItems")}
          </h4>
          <ul className="space-y-1.5">
            {recap.actions.map((a) => (
              <li
                key={a.id}
                className="rp-action flex items-center gap-2.5 rounded-md border border-line p-2 dark:border-gray-700"
              >
                <Avatar name={memberName(a.ownerId)} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-muted dark:text-gray-400">{memberName(a.ownerId)}</span>
                  <span className="block text-sm text-ink dark:text-white">{a.text}</span>
                </span>
                <button
                  type="button"
                  onClick={() => sendToChat(a.text)}
                  aria-label={t("sendToChat")}
                  title={t("sendToChat")}
                  className="rp-send inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-blue-800 hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
                >
                  <HiOutlinePaperAirplane size={16} className="rp-send-ic" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
