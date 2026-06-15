import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";

const FEATURE_KEYS = ["fast", "unified", "secure"] as const;
const NAV_KEYS = ["about", "terms", "contact"] as const;

function CheckIcon() {
  return (
    <svg
      className="mr-3 h-5 w-5 shrink-0 text-brand"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Flowbite tarzı auth düzeni: sol tanıtım paneli + sağ kart (children). */
export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("auth");

  return (
    <section className="flex min-h-screen items-center bg-surface-2 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-20">
        {/* Sol tanıtım paneli */}
        <div className="hidden lg:col-span-5 lg:mr-auto lg:flex lg:flex-col lg:justify-between xl:col-span-6 xl:mb-0">
          <div className="tl-stagger">
            <Logo className="mb-6 h-11 lg:mb-10 dark:brightness-0 dark:invert" />
            {FEATURE_KEYS.map((key) => (
              <div key={key} className="flex pt-8 first:pt-0">
                <CheckIcon />
                <div>
                  <h3 className="mb-2 text-sm font-semibold leading-none text-ink dark:text-white">
                    {t(`shell.features.${key}.title`)}
                  </h3>
                  <p className="mb-2 text-sm font-normal text-muted">
                    {t(`shell.features.${key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <nav>
            <ul className="flex space-x-4">
              {NAV_KEYS.map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="rounded text-sm text-muted outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-brand dark:hover:text-white"
                  >
                    {t(`shell.nav.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobil logo */}
        <div className="mb-6 flex justify-center lg:hidden">
          <Logo className="h-11 dark:brightness-0 dark:invert" />
        </div>

        {/* Sağ kart */}
        <div className="motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)_both] mx-auto w-full rounded-card bg-surface shadow-sm sm:max-w-lg lg:col-span-7 xl:col-span-6 xl:p-0 dark:bg-gray-800">
          <div className="space-y-5 p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
