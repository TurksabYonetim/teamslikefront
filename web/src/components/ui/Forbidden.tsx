import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { EmptyState } from "./EmptyState";

interface ForbiddenProps {
  /** Özel başlık (varsayılan: common.forbidden.title). */
  title?: string;
  /** Özel açıklama (varsayılan: common.forbidden.message). */
  message?: string;
  className?: string;
}

/**
 * Yetkisiz erişim ekranı. `useCan(perm)` false döndüğünde sayfa/panel yerine
 * gösterilir. i18n `common` ad alanından okur.
 */
export function Forbidden({ title, message, className }: ForbiddenProps) {
  const { t } = useTranslation("common");
  return (
    <div
      role="alert"
      aria-live="polite"
      className={className ?? "grid min-h-[60vh] place-items-center"}
    >
      <EmptyState
        icon={<Icon name="key" className="h-6 w-6" />}
        title={title ?? t("forbidden.title")}
        description={message ?? t("forbidden.message")}
      />
    </div>
  );
}
