import { useTranslation } from "react-i18next";
import { HiOutlineHandRaised, HiOutlineMapPin, HiOutlineComputerDesktop } from "react-icons/hi2";
import { MdMicOff } from "react-icons/md";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { useMeeting } from "../meetings.store";
import type { ConnectionQuality, Participant } from "../meetings.store.types";

const qualityTone: Record<ConnectionQuality, string> = {
  good: "bg-green-500",
  fair: "bg-amber-500",
  poor: "bg-red-600",
};

function Tile({
  p,
  speaking,
  big = false,
  spotlighted = false,
}: {
  p: Participant;
  speaking: boolean;
  big?: boolean;
  spotlighted?: boolean;
}) {
  const { t } = useTranslation("meetings");
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-800",
        speaking && "ring-2 ring-brand",
        spotlighted && "ring-2 ring-amber-400",
        big ? "h-full w-full" : "aspect-video",
      )}
    >
      {p.camOn ? (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/40 to-gray-700" aria-hidden />
      ) : null}
      <Avatar name={p.name} size={big ? "lg" : "md"} />

      {p.quality ? (
        <span
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white"
          title={t(`quality.${p.quality}`)}
        >
          <span className={clsx("inline-block h-2 w-2 rounded-full", qualityTone[p.quality])} aria-hidden />
        </span>
      ) : null}
      {spotlighted ? (
        <span className="absolute right-2 top-2 rounded-md bg-amber-500 px-1.5 py-1 text-gray-900" title={t("spotlighted")}>
          <HiOutlineMapPin className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : null}

      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
        {!p.micOn ? <MdMicOff className="h-3.5 w-3.5" aria-label={t("muted")} /> : null}
        <span className="max-w-[12rem] truncate">{p.isSelf ? t("you") : p.name}</span>
      </div>
      {p.handRaised ? (
        <div className="absolute bottom-2 right-2 rounded-md bg-amber-500 px-1.5 py-1 text-gray-900">
          <HiOutlineHandRaised className="h-4 w-4" aria-label={t("handRaised")} />
        </div>
      ) : null}
    </div>
  );
}

function Filmstrip({ items }: { items: Participant[] }) {
  const activeSpeakerId = useMeeting((s) => s.activeSpeakerId);
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((p) => (
        <div key={p.id} className="w-40 shrink-0">
          <Tile p={p} speaking={p.id === activeSpeakerId && p.micOn} />
        </div>
      ))}
    </div>
  );
}

function ScreenShareView({ presenter }: { presenter: Participant }) {
  const { t } = useTranslation("meetings");
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-lg border border-line bg-gray-900">
      <div className="flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-sm text-white">
        <HiOutlineComputerDesktop className="h-5 w-5" aria-hidden />
        {t("sharingScreen", { name: presenter.isSelf ? t("you") : presenter.name })}
      </div>
    </div>
  );
}

export function Stage() {
  const participants = useMeeting((s) => s.participants);
  const layout = useMeeting((s) => s.layout);
  const activeSpeakerId = useMeeting((s) => s.activeSpeakerId);
  const screenSharing = useMeeting((s) => s.screenSharing);
  const spotlightId = useMeeting((s) => s.spotlightId);
  if (participants.length === 0) return null;

  const spot = spotlightId ? participants.find((p) => p.id === spotlightId) : undefined;

  if (screenSharing) {
    const presenter = participants.find((p) => p.screenSharing) ?? participants[0];
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="min-h-0 flex-1">
          <ScreenShareView presenter={presenter} />
        </div>
        <Filmstrip items={participants} />
      </div>
    );
  }

  // Spotlight or speaker layout → one big tile + filmstrip
  if (spot || layout === "speaker") {
    const main = spot ?? participants.find((p) => p.id === activeSpeakerId) ?? participants[0];
    const others = participants.filter((p) => p.id !== main.id);
    return (
      <div className="flex h-full flex-col gap-3 p-3">
        <div className="min-h-0 flex-1">
          <Tile p={main} speaking={main.micOn} big spotlighted={!!spot} />
        </div>
        <Filmstrip items={others} />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 content-center gap-3 p-3 sm:grid-cols-3">
      {participants.map((p) => (
        <Tile key={p.id} p={p} speaking={p.id === activeSpeakerId && p.micOn} />
      ))}
    </div>
  );
}
