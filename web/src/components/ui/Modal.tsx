import { useId } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Overlay } from "./Overlay";

type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Panel genişliği (default: md). */
  size?: ModalSize;
}

/** Flowbite tarzı modal — ortak Overlay üzerine kurulu (backdrop + ESC + scroll-lock). */
export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  const titleId = useId();

  return (
    <Overlay open={open} onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          "w-full bg-surface rounded-lg shadow-xl origin-center motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)]",
          "max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col",
          SIZE[size],
        )}
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 sm:p-4 border-b border-line">
          <h3 id={titleId} className="text-base font-semibold text-ink">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1 p-2 sm:p-2.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)]"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-2 px-4 py-3 sm:p-4 border-t border-line bg-surface-2 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </Overlay>
  );
}
