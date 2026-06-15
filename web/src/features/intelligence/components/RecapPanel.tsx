import { useTranslation } from "react-i18next";
import {
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowRight,
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
 * Structured AI recap (Zoom/Teams Intelligent Recap) — action items can be
 * pushed into Messaging (Faz 4 cross-cut).
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

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-ink dark:text-white">
        <HiOutlineCheckBadge size={16} aria-hidden /> {t("recap")}
      </h3>
      <p className="text-sm text-ink-2 dark:text-white">{recap.tldr}</p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {recap.decisions.length > 0 ? (
          <section>
            <h4 className="mb-1 text-sm font-semibold text-ink dark:text-gray-200">{t("decisions")}</h4>
            <ul className="ml-5 list-disc text-sm text-ink-2 dark:text-white">
              {recap.decisions.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {recap.nextSteps.length > 0 ? (
          <section>
            <h4 className="mb-1 text-sm font-semibold text-ink dark:text-gray-200">{t("nextSteps")}</h4>
            <ul className="ml-5 list-disc text-sm text-ink-2 dark:text-white">
              {recap.nextSteps.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {recap.actions.length > 0 ? (
        <section className="mt-3">
          <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-ink dark:text-gray-200">
            <HiOutlineClipboardDocumentCheck size={16} aria-hidden /> {t("actionItems")}
          </h4>
          <ul className="space-y-1.5">
            {recap.actions.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-line p-2 dark:border-gray-700"
              >
                <HiOutlineArrowRight size={14} className="text-blue-700 dark:text-blue-400" aria-hidden />
                <span className="flex-1 text-sm text-ink dark:text-white">{a.text}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted dark:text-gray-400">
                  <Avatar name={memberName(a.ownerId)} size="xs" />
                  <span className="hidden sm:inline">{memberName(a.ownerId)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => sendToChat(a.text)}
                  className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-sm font-medium text-blue-700 hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
                >
                  <HiOutlinePaperAirplane size={14} aria-hidden /> {t("sendToChat")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
