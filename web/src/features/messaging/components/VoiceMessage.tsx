import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlay, HiOutlinePause } from "react-icons/hi2";
import { voiceWaveform } from "../chat";

const SPEEDS = [1, 1.5, 2];

/** Mock sesli mesaj — gerçek ses yok, oynatma hızı kontrolü (WhatsApp/Telegram). */
export function VoiceMessage({ seconds, seed }: { seconds: number; seed: string }) {
  const { t } = useTranslation("messaging");
  const [playing, setPlaying] = React.useState(false);
  const [speedIdx, setSpeedIdx] = React.useState(0);

  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  // Klip başına deterministik dalga formu (ortak chat-domain util).
  const bars = voiceWaveform(seed, 15);

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("voiceMessage")}>
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? t("voice.pause") : t("voice.play")}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white"
      >
        {playing ? <HiOutlinePause className="h-4 w-4" aria-hidden /> : <HiOutlinePlay className="h-4 w-4" aria-hidden />}
      </button>
      <div className="flex h-6 items-center gap-0.5" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            data-bar
            style={{ height: `${Math.round(h * 22) + 4}px` }}
            className="w-1 rounded-full bg-muted"
          />
        ))}
      </div>
      <span className="text-sm text-muted">
        {mm}:{ss}
      </span>
      <button
        type="button"
        onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
        aria-label={t("voice.speed")}
        className="rounded-md border border-line px-1.5 text-sm text-muted hover:bg-surface-2 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        {SPEEDS[speedIdx]}×
      </button>
    </div>
  );
}
