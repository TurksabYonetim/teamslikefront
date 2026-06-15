import { useTranslation } from "react-i18next";
import { HiOutlineDocument, HiOutlineArrowDownTray, HiOutlinePhoto } from "react-icons/hi2";
import type { FileAttachment } from "../types";

function fmtSize(kb: number): string {
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/** Dosya / görsel eki (mock — yükleme & depolama taklit). */
export function FileMessage({ file }: { file: FileAttachment }) {
  const { t } = useTranslation("messaging");

  if (file.isImage) {
    return (
      <div className="max-w-xs overflow-hidden rounded-lg border border-line dark:border-gray-700">
        <div
          data-thumb
          className="flex h-40 items-center justify-center bg-surface-2 text-muted"
        >
          <HiOutlinePhoto className="h-9 w-9" aria-hidden />
        </div>
        <div className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
          <span className="truncate text-ink">{file.name}</span>
          <span className="shrink-0 text-muted">{fmtSize(file.sizeKb)}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => console.debug("download mock:", file.name)}
      aria-label={t("file.download")}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-brand dark:border-gray-700 dark:bg-gray-800"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-brand">
        <HiOutlineDocument className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-ink">{file.name}</span>
        <span className="block text-sm text-muted">
          {file.fileType.toUpperCase()} · {fmtSize(file.sizeKb)}
        </span>
      </span>
      <HiOutlineArrowDownTray className="ml-1 h-4 w-4 text-muted" aria-hidden />
    </button>
  );
}
