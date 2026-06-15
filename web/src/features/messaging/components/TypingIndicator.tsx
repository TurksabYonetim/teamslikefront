import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMessaging } from "../store";
import { memberName } from "../members";

/** Simüle edilmiş "yazıyor…" göstergesi (WhatsApp/Telegram). */
export function TypingIndicator() {
  const { t } = useTranslation("messaging");
  const channelId = useMessaging((s) => s.activeChannelId);
  const channels = useMessaging((s) => s.channels);
  const [typing, setTyping] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTyping(null);
    const ch = channels.find((c) => c.id === channelId);
    const who = ch?.kind === "dm" ? ch.name : memberName("usr_2");
    const show = setTimeout(() => setTyping(who), 1600);
    const hide = setTimeout(() => setTyping(null), 5200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  if (!typing) return null;
  return (
    <div className="px-4 py-1 text-sm text-muted" aria-live="polite">
      {t("typing", { name: typing })}
    </div>
  );
}
