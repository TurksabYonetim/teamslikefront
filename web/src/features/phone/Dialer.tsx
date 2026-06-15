import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useContacts } from "./phone.hooks";
import type { CallLog } from "./phone.types";
import { matchContact, nameForNumber, sortByStartedDesc } from "./phone.utils";

interface DialerProps {
  number: string;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onCall: () => void;
  onSimulateIncoming: () => void;
  /** Geçmişten "son aramalar" hızlı erişimi için (yalnızca okunur). */
  history: CallLog[];
  /** Bir numarayı geri arar (son aramalar tıklaması). */
  onCallBack: (number: string, name?: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toLocaleUpperCase("tr")).join("") || "?";
}

export function Dialer({
  number,
  onDigit,
  onBackspace,
  onCall,
  onSimulateIncoming,
  history,
  onCallBack,
}: DialerProps) {
  const { t } = useTranslation("phone");
  const { data: contacts } = useContacts();
  const contactList = useMemo(() => contacts ?? [], [contacts]);

  // Girilen numarayla eşleşen kişi önerisi.
  const suggestion = useMemo(
    () => (number ? matchContact(number, contactList) : undefined),
    [number, contactList],
  );

  // Son aramalar (benzersiz numaralar, en yeni 4 tane) hızlı erişim.
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: { number: string; name: string }[] = [];
    for (const log of sortByStartedDesc(history)) {
      if (seen.has(log.peer_number)) continue;
      seen.add(log.peer_number);
      out.push({
        number: log.peer_number,
        name:
          log.peer_name ||
          nameForNumber(log.peer_number, contactList) ||
          log.peer_number,
      });
      if (out.length >= 4) break;
    }
    return out;
  }, [history, contactList]);

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Dial pad */}
      <div className="flex w-full flex-col items-center">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {t("dialer.title")}
        </h2>

        <div className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <span className="min-h-[1.75rem] truncate text-2xl font-medium tracking-wider text-gray-900 dark:text-white">
            {number || (
              <span className="text-gray-400 dark:text-gray-500">
                {t("dialer.placeholder")}
              </span>
            )}
          </span>
          {number && (
            <button
              type="button"
              onClick={onBackspace}
              aria-label={t("dialer.delete")}
              className="ml-2 shrink-0 rounded-lg p-2 text-gray-500 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7H10.5L4 12l6.5 5H21V7Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17 10-4 4m0-4 4 4" />
              </svg>
            </button>
          )}
        </div>

        {/* Eşleşen kişi önerisi */}
        <div className="mb-3 h-6 w-full text-center">
          {suggestion && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clipRule="evenodd" />
              </svg>
              {suggestion.name}
            </span>
          )}
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onDigit(k)}
              className="flex h-16 items-center justify-center rounded-full border border-gray-100 bg-white text-2xl font-medium text-gray-900 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-gray-100 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700"
            >
              {k}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCall}
          disabled={!number}
          className="mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white transition-transform duration-150 ease-[var(--ease-out)] hover:bg-primary-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          <span className="sr-only">{t("dialer.call")}</span>
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.476 2.165 1.736 4.422 3.626 6.312 1.89 1.89 4.147 3.15 6.312 3.626 2.063.454 4.114-.08 5.937-1.899a2.553 2.553 0 0 0 .877-1.926 2.547 2.547 0 0 0-.882-1.911l-1.842-1.611a2.502 2.502 0 0 0-3.118-.115l-1.252.939a.503.503 0 0 1-.354.115 4.49 4.49 0 0 1-1.866-.96 4.49 4.49 0 0 1-.96-1.866.503.503 0 0 1 .114-.354l.939-1.252a2.502 2.502 0 0 0-.115-3.118l-1.611-1.842A2.547 2.547 0 0 0 7.978 4Z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onSimulateIncoming}
          className="mt-4 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {t("dialer.simulateIncoming")}
        </button>
      </div>

      {/* Sağ kolon: son aramalar + arama geçmişi + rehber */}
      <div className="flex w-full flex-col gap-6">
        {/* Son aramalar hızlı erişim */}
        {recent.length > 0 && (
          <div className="flex w-full flex-col">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {t("dialer.recent")}
            </h3>
            <div className="tl-stagger flex gap-3 overflow-x-auto pb-1">
              {recent.map((r) => (
                <button
                  key={r.number}
                  type="button"
                  onClick={() => onCallBack(r.number, r.name)}
                  className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-transform duration-150 ease-[var(--ease-out)] hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                    {initials(r.name)}
                  </span>
                  <span className="w-full truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                    {r.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
