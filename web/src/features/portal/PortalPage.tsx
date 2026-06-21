import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonText } from "@/components/ui/Skeleton";
import { apiErrorMessage } from "@/lib/api";
import {
  usePortalToken,
  useWhoami,
  useSellers,
  useConnectPortal,
  DEFAULT_TENANT_SLUG,
  DEFAULT_SIGNING_SECRET,
} from "./portal.hooks";
import { portalIdentityStore } from "./portal.api";
import { colorFor, initialsOf } from "./portal.ui";
import type { PortalSeller } from "./portal.types";

export function PortalTopbar({ onWhoami }: { onWhoami: () => void }) {
  const { t } = useTranslation("portal");
  const { data: who } = useWhoami();
  const name = who?.name ?? who?.email ?? t("topbar.guest");
  return (
    <header className="sticky top-0 z-10 h-15 flex items-center gap-3 px-4 md:px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-line dark:border-gray-800 min-w-0">
      <Logo className="h-8 shrink-0" />
      <span className="badge hidden sm:inline-flex">{t("topbar.badge")}</span>
      <div className="flex-1" />
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        leftIcon={<Icon name="key" className="w-4 h-4" />}
        onClick={onWhoami}
      >
        {t("topbar.identity")}
      </Button>
      <span className="text-sm text-muted hidden sm:inline max-w-[12rem] truncate">
        {name}
      </span>
      <Avatar initials={initialsOf(name)} color={colorFor(name)} size="sm" />
    </header>
  );
}

/**
 * Buyer kimlik girişi — portal uçları ayrı müşteri JWT'si ister.
 * Form alanlarından tenant signing_secret ile bir buyer JWT üretilir
 * (mintBuyerToken) ve portal token deposuna yazılır.
 *
 * GÜVENLİK NOTU: signing_secret'ı tarayıcıda kullanmak YALNIZCA DEMO içindir;
 * PROD'da buyer JWT sunucu tarafında imzalanmalı, secret istemciye hiç
 * gönderilmemelidir.
 */
function PortalTokenGate({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation("portal");
  const connect = useConnectPortal();
  const saved = portalIdentityStore.get();
  const [tenantSlug, setTenantSlug] = useState(
    saved?.tenantSlug ?? DEFAULT_TENANT_SLUG,
  );
  const [signingSecret, setSigningSecret] = useState(
    saved?.signingSecret ?? DEFAULT_SIGNING_SECRET,
  );
  const [name, setName] = useState(saved?.name ?? "");
  const [email, setEmail] = useState(saved?.email ?? "");

  const canSubmit =
    !!tenantSlug.trim() &&
    !!signingSecret.trim() &&
    !!email.trim() &&
    !connect.isPending;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    connect.mutate(
      { tenantSlug, signingSecret, name, email },
      { onSuccess: () => onSaved() },
    );
  };

  return (
    <form
      onSubmit={submit}
      className="card p-6 mt-6 max-w-xl dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 grid place-items-center">
          <Icon name="key" className="w-5 h-5" />
        </span>
        <div>
          <div className="font-semibold text-ink dark:text-white">
            {t("gate.title")}
          </div>
          <p className="text-sm text-muted">{t("gate.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="portal-tenant">
            {t("gate.tenant")}
          </label>
          <input
            id="portal-tenant"
            className="input"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            placeholder={t("gate.tenantPlaceholder")}
          />
        </div>
        <div>
          <label className="label" htmlFor="portal-email">
            {t("gate.email")}
          </label>
          <input
            id="portal-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("gate.emailPlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="portal-name">
            {t("gate.name")}
          </label>
          <input
            id="portal-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("gate.namePlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="portal-secret">
            {t("gate.secret")}
          </label>
          <input
            id="portal-secret"
            className="input font-mono text-base md:text-xs"
            type="password"
            value={signingSecret}
            onChange={(e) => setSigningSecret(e.target.value)}
            placeholder={t("gate.secretPlaceholder")}
          />
          <p className="text-xs text-muted mt-1">{t("gate.secretHint")}</p>
        </div>
      </div>

      {connect.isError && (
        <p className="text-xs text-danger mt-2" role="alert">
          {t("gate.error")}
        </p>
      )}

      <div className="flex justify-end mt-4">
        <Button type="submit" loading={connect.isPending} disabled={!canSubmit}>
          {connect.isPending ? t("gate.connecting") : t("gate.connect")}
        </Button>
      </div>
    </form>
  );
}

function SellerCard({ seller }: { seller: PortalSeller }) {
  const { t } = useTranslation("portal");
  const color = colorFor(seller.user_id);
  return (
    <div className="card p-4 flex items-center gap-4 dark:bg-gray-900 dark:border-gray-800 transition-shadow duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:shadow-md">
      <div className="relative">
        <Avatar initials={initialsOf(seller.full_name)} color={color} size="lg" />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-ok"
          title={t("sellers.online")}
          aria-label={t("sellers.online")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink dark:text-white truncate">
          {seller.full_name}
        </div>
        <div className="text-xs text-muted truncate">{seller.role}</div>
        <div className="text-xs text-muted/80 mt-0.5 truncate">
          {seller.email}
        </div>
      </div>
      <Link
        to={`/portal/chat?seller=${encodeURIComponent(seller.user_id)}`}
        className="btn btn-primary btn-sm shrink-0 transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)]"
        aria-label={`${t("sellers.chat")} — ${seller.full_name}`}
      >
        <Icon name="chat" className="w-4 h-4" />
        {t("sellers.chat")}
      </Link>
    </div>
  );
}

export function PortalPage() {
  const { t } = useTranslation("portal");
  const [who, setWho] = useState(false);
  const { hasToken, clearToken } = usePortalToken();
  const whoami = useWhoami(who);
  const sellers = useSellers();

  return (
    <div className="min-h-[100dvh] bg-surface-2 dark:bg-gray-950">
      <PortalTopbar onWhoami={() => setWho(true)} />

      <div className="max-w-4xl xl:max-w-5xl mx-auto p-4 md:p-8 lg:p-10">
        <h1 className="text-xl font-semibold text-ink dark:text-white lg:text-2xl">
          {t("home.title")}
        </h1>
        <p className="text-sm text-muted mt-1">{t("home.subtitle")}</p>

        {!hasToken ? (
          <PortalTokenGate onSaved={() => sellers.refetch()} />
        ) : (
          <>
            <div className="card p-5 mt-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-brand-softer border-brand-soft dark:bg-blue-500/10 dark:border-blue-500/20">
              <span className="w-11 h-11 rounded-lg bg-brand-soft text-brand dark:bg-blue-500/20 dark:text-blue-300 grid place-items-center shrink-0">
                <Icon name="chat" className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink dark:text-white">
                  {t("home.activeTitle")}
                </div>
                <p className="text-sm text-muted">{t("home.activeSubtitle")}</p>
              </div>
              <Link
                to="/portal/chat"
                className="btn btn-primary shrink-0 w-full sm:w-auto transition-transform motion-safe:active:scale-[0.97] ease-[var(--ease-out)]"
              >
                {t("home.goToChats")}
                <Icon name="arrow" className="w-4 h-4" />
              </Link>
            </div>

            <h2 className="text-base font-semibold text-ink dark:text-white mt-8 mb-4">
              {t("home.sellersTitle")}
            </h2>

            {sellers.isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="card p-4 flex items-center gap-4 dark:bg-gray-900 dark:border-gray-800"
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-3 dark:bg-gray-800 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <SkeletonText lines={2} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sellers.isError && (
              <div className="card p-5 border-danger/30 bg-danger/5 dark:bg-danger/10">
                <EmptyState
                  title={t("sellers.errorTitle")}
                  description={apiErrorMessage(sellers.error)}
                  icon={<Icon name="info" className="w-6 h-6" />}
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => sellers.refetch()}
                      >
                        {t("sellers.retry")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearToken}>
                        {t("sellers.changeKey")}
                      </Button>
                    </div>
                  }
                />
              </div>
            )}

            {sellers.data && sellers.data.length === 0 && (
              <div className="card dark:bg-gray-900 dark:border-gray-800">
                <EmptyState
                  title={t("sellers.emptyTitle")}
                  description={t("sellers.emptyDesc")}
                  icon={<Icon name="users" className="w-6 h-6" />}
                />
              </div>
            )}

            {sellers.data && sellers.data.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 tl-stagger">
                {sellers.data.map((s) => (
                  <SellerCard key={s.user_id} seller={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={who} onClose={() => setWho(false)} title={t("whoami.title")}>
        <p className="text-sm text-muted mb-3">
          <span className="font-mono text-xs">GET /v1/portal/me/whoami</span> —{" "}
          {t("whoami.subtitle")}
        </p>
        {whoami.isLoading && (
          <SkeletonText lines={4} />
        )}
        {whoami.isError && (
          <p className="text-sm text-danger" role="alert">
            {apiErrorMessage(whoami.error)}
          </p>
        )}
        {whoami.data && (
          <pre className="bg-surface-2 dark:bg-gray-800 border border-line dark:border-gray-700 rounded-lg p-4 text-xs font-mono overflow-auto leading-relaxed text-ink-2 dark:text-gray-200">
            {JSON.stringify(whoami.data, null, 2)}
          </pre>
        )}
        {!hasToken && !whoami.isLoading && (
          <p className="text-sm text-muted">{t("whoami.noKey")}</p>
        )}
        <div className="flex items-center justify-between gap-3 mt-3">
          <p className="text-xs text-muted">{t("whoami.hint")}</p>
          {hasToken && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              leftIcon={<Icon name="logout" className="w-4 h-4" />}
              onClick={() => {
                clearToken();
                setWho(false);
              }}
            >
              {t("whoami.logout")}
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
