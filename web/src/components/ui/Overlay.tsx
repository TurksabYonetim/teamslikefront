import { useEffect } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

/**
 * Tüm popup katmanlarının ortak temeli. Backdrop'un GÖRÜNÜMÜ (renk + opaklık +
 * fade animasyonu) ve z-index ölçeği tek kaynaktan gelir; merkezi modal'lar
 * `Overlay` üzerine, kenardan açılan drawer'lar `Backdrop` üzerine kurulur.
 * Böylece site genelinde arka plan overlay'i tek tip olur — içerik (panel)
 * children/prop ile geçilir, kabuk değişmez.
 */

/** Popup katman ölçeği — dağınık z-index'leri (z-30/40/90) tek yerde toplar. */
export const OVERLAY_Z = {
  /** Kenardan açılan drawer/yan panel backdrop'u (panel z-40 ile bir tık üstte durur). */
  drawer: "z-30",
  /** Standart merkezi modal/dialog. */
  modal: "z-50",
  /** Global launcher (komut paleti) — uygulama kabuğunun üstünde. */
  high: "z-[70]",
} as const;

export type OverlayLevel = keyof typeof OVERLAY_Z;

/** Dim katmanının TEK görünüm kaynağı: renk + opaklık + fade animasyonu. */
export const BACKDROP_APPEARANCE =
  "bg-gray-900/50 motion-safe:[animation:tl-fade_var(--dur-modal)_var(--ease-out)]";

interface BackdropProps {
  /** Backdrop'a tıklanınca (genellikle kapatma). */
  onClick?: () => void;
  /** z-index katmanı (default: modal). */
  level?: OverlayLevel;
  /** Ek sınıflar (ör. `lg:hidden` ile yalnızca mobilde göster). */
  className?: string;
}

/**
 * Bağımsız dim katmanı — kendi konumlanan paneli olan drawer/yan paneller için.
 * Merkezi modal'lar bunun yerine `Overlay` kullanır.
 */
export function Backdrop({ onClick, level = "modal", className }: BackdropProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={clsx("fixed inset-0", OVERLAY_Z[level], BACKDROP_APPEARANCE, className)}
    />
  );
}

// Birden çok overlay üst üste açılabildiği için kilit sayaçla yönetilir.
let scrollLockCount = 0;

function lockScroll() {
  if (scrollLockCount === 0) document.body.style.overflow = "hidden";
  scrollLockCount += 1;
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = "";
}

const ALIGN: Record<"center" | "top", string> = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-[14vh]",
};

interface OverlayProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Panel hizası: ortada (modal) veya üstte (komut paleti). */
  align?: "center" | "top";
  /** z-index katmanı. */
  level?: OverlayLevel;
  /** Backdrop/ESC ile kapanabilir mi (default true). */
  dismissable?: boolean;
  /** Kapsayıcıya ek sınıf (padding override vb.). */
  className?: string;
}

/**
 * Merkezi (veya üstte hizalı) popup kapsayıcısı: ortak backdrop + ESC + dış
 * tıklama ile kapatma + arka plan kaydırma kilidi + portal. Panel `children`
 * olarak verilir ve genişliğini/animasyonunu kendi belirler.
 */
export function Overlay({
  open,
  onClose,
  children,
  align = "center",
  level = "modal",
  dismissable = true,
  className,
}: OverlayProps) {
  useEffect(() => {
    if (!open || !dismissable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissable, onClose]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  if (!open) return null;

  // Yalnızca backdrop'un kendisine (panel değil) tıklanınca kapat.
  const onBackdropClick = dismissable
    ? (e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose?.();
      }
    : undefined;

  return createPortal(
    <div
      className={clsx("fixed inset-0 flex p-3 sm:p-4", OVERLAY_Z[level], ALIGN[align], BACKDROP_APPEARANCE, className)}
      onClick={onBackdropClick}
    >
      {children}
    </div>,
    document.body,
  );
}
