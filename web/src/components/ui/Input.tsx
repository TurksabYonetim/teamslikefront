import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

/**
 * Standart form input'u — Select/Button ile aynı responsive yükseklik ölçeğini
 * (mobil 36 → tablet 40 → laptop 44 → monitor 48) paylaşan `.input` sınıfını sarar.
 * Görsel/odak/yükseklik tek kaynaktan gelir; çağıran sadece prop geçer.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...rest }, ref) {
    return <input ref={ref} type={type} className={clsx("input", className)} {...rest} />;
  },
);
