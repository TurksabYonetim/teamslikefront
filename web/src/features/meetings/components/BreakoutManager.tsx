import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { memberName } from "@/features/messaging/members";
import { useMeeting, meetingStore } from "../meetings.store";

export function BreakoutManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const breakouts = useMeeting((s) => s.breakouts);

  return (
    <Modal open={open} onClose={onClose} title={t("meetings.breakouts")}>
      <div>
        <p className="text-sm text-ink-2">{t("meetings.breakoutsHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[2, 3, 4].map((n) => {
            const label = t("meetings.createRooms", { n });
            return (
              <Button
                key={n}
                variant="secondary"
                size="sm"
                onClick={() => meetingStore.getState().createBreakouts(n)}
              >
                {label.includes(String(n)) ? label : `${n} ${label}`}
              </Button>
            );
          })}
          {breakouts.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => meetingStore.getState().closeBreakouts()}
            >
              {t("meetings.closeRooms")}
            </Button>
          ) : null}
        </div>

        {breakouts.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {breakouts.map((b) => (
              <li
                key={b.id}
                className="rounded-md border border-line bg-surface p-3"
              >
                <div className="text-sm font-semibold text-ink">{b.name}</div>
                <div className="text-sm text-ink-2">
                  {b.participantIds.map((id) => memberName(id)).join(", ") || "—"}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  );
}
