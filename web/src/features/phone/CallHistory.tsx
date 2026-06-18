import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Skeleton } from "@/components/ui";
import type { CallDirection, CallLog, Contact } from "./phone.types";
import { formatDuration } from "./phone.types";
import {
  filterCallLogs,
  groupCallLogsByDate,
  nameForNumber,
  sortByStartedDesc,
} from "./phone.utils";

interface CallHistoryProps {
  history: CallLog[];
  loading: boolean;
  error: boolean;
  contacts: Contact[];
  onCallBack: (number: string, name?: string) => void;
}

/** Filtre sekmesi anahtarları (UI yönü → API yönüne eşlenir). */
type FilterKey = "all" | "inbound" | "outbound" | "missed";

const FILTERS: FilterKey[] = ["all", "inbound", "outbound", "missed"];

function DirectionIcon({ direction }: { direction: CallDirection }) {
  if (direction === "missed") {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
        </svg>
      </span>
    );
  }
  if (direction === "inbound") {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5 5 19m0 0h9m-9 0v-9" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19 19 5m0 0h-9m9 0v9" />
      </svg>
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.476 2.165 1.736 4.422 3.626 6.312 1.89 1.89 4.147 3.15 6.312 3.626 2.063.454 4.114-.08 5.937-1.899a2.553 2.553 0 0 0 .877-1.926 2.547 2.547 0 0 0-.882-1.911l-1.842-1.611a2.502 2.502 0 0 0-3.118-.115l-1.252.939a.503.503 0 0 1-.354.115 4.49 4.49 0 0 1-1.866-.96 4.49 4.49 0 0 1-.96-1.866.503.503 0 0 1 .114-.354l.939-1.252a2.502 2.502 0 0 0-.115-3.118l-1.611-1.842A2.547 2.547 0 0 0 7.978 4Z" />
    </svg>
  );
}

/**
 * Arama geçmişi: yön filtresi sekmeleri (gelen/giden/cevapsız), tarih
 * gruplama (Bugün/Dün/Bu hafta/Daha eski), rehber adı eşleştirme ve
 * ad/numara araması. Yükleme=Skeleton, boş/hata=EmptyState.
 */
export function CallHistory({
  history,
  loading,
  error,
  contacts,
  onCallBack,
}: CallHistoryProps) {
  const { t, i18n } = useTranslation("phone");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [i18n.language],
  );

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: history.length,
      inbound: 0,
      outbound: 0,
      missed: 0,
    };
    for (const h of history) c[h.direction] += 1;
    return c;
  }, [history]);

  const groups = useMemo(() => {
    let rows = sortByStartedDesc(history);
    if (filter !== "all") rows = rows.filter((r) => r.direction === filter);
    rows = filterCallLogs(rows, query, contacts);
    return groupCallLogsByDate(rows);
  }, [history, filter, query, contacts]);

  const hasResults = groups.length > 0;

  // Arama geçmişi gövdesi — durum girişi + AAA filtre pill'i ".call-history"
  // sınıf kancaları üzerinden styles/index.css'te (impeccable delight).
  const renderCallHistory = () => (
    <div className="call-history flex w-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("history.title")}
        </h3>
      </div>

      {/* Arama kutusu */}
      <div className="ch-search relative mb-3">
        <span className="ch-search-ic pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("history.searchPlaceholder")}
          aria-label={t("history.searchPlaceholder")}
          className="input pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("history.clearSearch")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-150 ease-[var(--ease-out)] hover:text-gray-600 motion-safe:active:scale-[0.97] dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Yön filtresi sekmeleri */}
      <div role="tablist" className="mb-3 flex gap-1 overflow-x-auto">
        {FILTERS.map((f) => {
          const selected = f === filter;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f)}
              className={
                "ch-filter shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-[transform,color,background-color] duration-150 ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 " +
                (selected
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600")
              }
            >
              {t(`history.filters.${f}`)}
              <span className={"ch-count tabular-nums " + (selected ? "ml-1.5 opacity-80" : "ml-1.5 opacity-60")}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="ch-state">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title={t("history.errorTitle")}
            description={t("history.errorDescription")}
          />
        ) : history.length === 0 ? (
          <EmptyState
            title={t("history.empty")}
            description={t("history.emptyDescription")}
          />
        ) : !hasResults ? (
          <EmptyState
            title={t("history.noResults")}
            description={t("history.noResultsDescription")}
          />
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="mb-1.5 px-1 text-xs font-semibold text-muted dark:text-gray-400">
                  {t(`history.groups.${group.key}`)}
                </p>
                <ul className="ch-list tl-stagger divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                  {group.items.map((rec) => {
                    const name =
                      rec.peer_name ||
                      nameForNumber(rec.peer_number, contacts) ||
                      rec.peer_number;
                    const showNumber = name !== rec.peer_number;
                    return (
                      <li key={rec.id} className="ch-row flex items-center gap-3 px-4 py-3">
                        <DirectionIcon direction={rec.direction} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {name}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {showNumber && `${rec.peer_number} · `}
                            {t(`history.directions.${rec.direction}`)}
                            {rec.direction !== "missed" &&
                              ` · ${formatDuration(rec.duration_s)}`}
                            {` · ${timeFmt.format(new Date(rec.started_at))}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onCallBack(rec.peer_number, rec.peer_name ?? name)
                          }
                          aria-label={t("history.callBack")}
                          className="ch-callback shrink-0 rounded-lg p-2 text-primary-600 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-primary-50 active:scale-95 dark:text-primary-400 dark:hover:bg-gray-700"
                        >
                          <PhoneIcon />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return renderCallHistory();
}
