// web/src/features/webinar/components/CtaBanner.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button, useToast } from "@/components/ui";
import { CTAS } from "../webinar.data";

export function CtaBanner() {
  const { t } = useTranslation("webinar");
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand bg-slate-900 px-3 py-2">
      <span className="text-base font-medium text-white">{t("ctaTitle")}</span>
      <div className="ml-auto flex flex-wrap gap-2">
        {CTAS.map((c) => (
          <Button
            key={c.id}
            variant="secondary"
            leftIcon={<Icon name="externalLink" className="h-4 w-4" />}
            onClick={() => toast.show({ message: t("ctaRecorded", { label: c.label }), variant: "success" })}
          >
            {c.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
