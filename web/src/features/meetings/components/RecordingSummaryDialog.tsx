import { useTranslation } from "react-i18next";
import { HiOutlineArrowDownTray, HiOutlineSparkles } from "react-icons/hi2";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useOptionalToast } from "@/components/ui/Toast";
import { memberName } from "@/features/messaging/members";
import { CAPTION_SCRIPT } from "../meetings.data";

/** Post-recording artifact: transcript + AI summary + action items (Teams/Zoom/Meet). */
export function RecordingSummaryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("meetings");

  const toast = useOptionalToast();

  const downloadRecap = () => {
    const text = CAPTION_SCRIPT.map((l) => `${memberName(l.speakerId)}: ${l.en}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-recap.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast?.show({ message: t("recapDownloaded"), variant: "success" });
  };

  return (
    <Modal open={open} onClose={onClose} title={t("recapTitle")}>
      <div className="max-h-[70dvh] space-y-4 overflow-y-auto">
        <section>
          <h3 className="mb-1 flex items-center gap-1 text-base font-semibold text-ink">
            <HiOutlineSparkles className="h-4 w-4" aria-hidden /> {t("aiSummary")}
          </h3>
          <p className="text-sm text-ink">{t("recapOverview")}</p>
          <ul className="mt-2 ml-5 list-disc text-sm text-ink">
            <li>{t("recapAction1")}</li>
            <li>{t("recapAction2")}</li>
            <li>{t("recapAction3")}</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 text-base font-semibold text-ink">{t("transcript")}</h3>
          <div className="space-y-1 rounded-md border border-line bg-surface-2 p-3">
            {CAPTION_SCRIPT.map((line, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-brand">{memberName(line.speakerId)}: </span>
                <span className="text-ink">{line.en}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={downloadRecap} leftIcon={<HiOutlineArrowDownTray className="h-4 w-4" aria-hidden />}>
            {t("downloadRecap")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
