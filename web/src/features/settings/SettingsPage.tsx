import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  SkeletonText,
  Tabs,
  useToast,
} from "@/components/ui";
import {
  useCurrentUser,
  useRotateSigningSecret,
  useSigningSecret,
  useTeamUsers,
  useTenant,
  useTenantNameOverride,
} from "./settings.hooks";

/* ──────────────────────────────── Yardımcılar ──────────────────────────── */

function Section({
  title,
  desc,
  children,
  danger,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={
        "rounded-card border bg-surface p-5 shadow-sm sm:p-6 dark:bg-surface " +
        (danger ? "border-danger/40" : "border-line")
      }
    >
      <h3
        className={
          "text-base font-semibold " + (danger ? "text-danger" : "text-ink")
        }
      >
        {title}
      </h3>
      {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Etiket + içerik. readOnly alanlar için tutarlı dikey ritim. */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS =
  "block w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink " +
  "placeholder:text-muted outline-none transition-colors duration-[var(--dur-press)] " +
  "ease-[var(--ease-out)] focus:border-brand focus:ring-1 focus:ring-brand/30 " +
  "read-only:cursor-default read-only:text-ink-3 disabled:opacity-60";

function fmtDate(iso?: string, locale?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────── Organizasyon ─────────────────────────── */

function OrganizationTab() {
  const { t, i18n } = useTranslation("settings");
  const toast = useToast();
  const { data: tenant, isLoading, error } = useTenant();
  const {
    value: nameValue,
    set: setNameOverride,
    isOverridden,
  } = useTenantNameOverride(tenant?.name);

  const [draft, setDraft] = useState(nameValue);

  // Sunucu adı / override değiştiğinde taslağı senkronla.
  useEffect(() => setDraft(nameValue), [nameValue]);

  const dirty = draft.trim() !== (nameValue ?? "").trim();

  const save = () => {
    setNameOverride(draft.trim() || null);
    toast.show({ message: t("organization.saveSuccess"), variant: "success" });
  };

  const resetToServer = () => {
    setNameOverride(null);
    if (tenant?.name) setDraft(tenant.name);
    toast.show({ message: t("organization.resetSuccess"), variant: "success" });
  };

  return (
    <Section title={t("organization.title")} desc={t("organization.desc")}>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {t("organization.loadFailed")}
        </p>
      )}

      {isLoading ? (
        <FormSkeleton rows={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("organization.name")} htmlFor="org-name">
              <input
                id="org-name"
                className={INPUT_CLS}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("organization.namePlaceholder")}
              />
            </Field>
            <Field label={t("organization.slug")} htmlFor="org-slug">
              <input
                id="org-slug"
                className={INPUT_CLS + " font-mono"}
                value={tenant?.slug ?? ""}
                readOnly
              />
            </Field>
            <Field label={t("organization.status")} htmlFor="org-status">
              <div className="flex h-[42px] items-center">
                <span
                  className={
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium " +
                    (tenant?.is_active
                      ? "bg-ok/10 text-ok"
                      : "bg-surface-3 text-ink-2")
                  }
                >
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (tenant?.is_active ? "bg-ok" : "bg-muted")
                    }
                  />
                  {tenant?.is_active
                    ? t("organization.active")
                    : t("organization.inactive")}
                </span>
              </div>
            </Field>
            <Field label={t("organization.createdAt")} htmlFor="org-created">
              <input
                id="org-created"
                className={INPUT_CLS}
                value={fmtDate(tenant?.created_at, i18n.language)}
                readOnly
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label={t("organization.tenantId")} htmlFor="org-id">
              <input
                id="org-id"
                className={INPUT_CLS + " font-mono text-xs"}
                value={tenant?.id ?? ""}
                readOnly
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={save} disabled={!dirty}>
              {t("common.save")}
            </Button>
            {isOverridden && (
              <Button variant="secondary" onClick={resetToServer}>
                {t("organization.resetToServer")}
              </Button>
            )}
          </div>

          {isOverridden && (
            <p className="mt-3 text-xs text-muted">
              {t("organization.localOnlyNote")}
            </p>
          )}
        </>
      )}
    </Section>
  );
}

/* ──────────────────────────────────── Profil ──────────────────────────────── */

function ProfileTab() {
  const { t } = useTranslation("settings");
  const { me, fullUser, isLoading, error } = useCurrentUser();

  return (
    <Section title={t("profile.title")} desc={t("profile.desc")}>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {t("profile.loadFailed")}
        </p>
      )}

      {isLoading ? (
        <FormSkeleton rows={4} />
      ) : (
        <>
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={fullUser?.full_name || me?.email} size="lg" />
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">
                {fullUser?.full_name || t("profile.unknown")}
              </div>
              <div className="truncate text-sm text-muted">{me?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("profile.fullName")} htmlFor="pf-name">
              <input
                id="pf-name"
                className={INPUT_CLS}
                value={fullUser?.full_name ?? ""}
                placeholder={t("profile.unknown")}
                readOnly
              />
            </Field>
            <Field label={t("profile.email")} htmlFor="pf-email">
              <input
                id="pf-email"
                className={INPUT_CLS}
                value={me?.email ?? ""}
                readOnly
              />
            </Field>
            <Field label={t("profile.role")} htmlFor="pf-role">
              <input
                id="pf-role"
                className={INPUT_CLS + " capitalize"}
                value={me?.role ?? ""}
                readOnly
              />
            </Field>
            <Field label={t("profile.userId")} htmlFor="pf-id">
              <input
                id="pf-id"
                className={INPUT_CLS + " font-mono text-xs"}
                value={me?.user_id ?? ""}
                readOnly
              />
            </Field>
          </div>
        </>
      )}
    </Section>
  );
}

/* ───────────────────────────────────── Ekip ───────────────────────────────── */

function TeamTab() {
  const { t } = useTranslation("settings");
  const { data: users, isLoading, error } = useTeamUsers();

  return (
    <Section
      title={t("team.title")}
      desc={
        users && users.length > 0
          ? t("team.memberCount", { count: users.length })
          : t("team.desc")
      }
    >
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {t("team.loadFailed")}
        </p>
      )}

      {isLoading && (
        <div className="divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && users && users.length === 0 && (
        <EmptyState
          icon={<Icon name="users" className="h-6 w-6" />}
          title={t("team.emptyTitle")}
          description={t("team.emptyDesc")}
        />
      )}

      {!isLoading && users && users.length > 0 && (
        <ul className="divide-y divide-line tl-stagger">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-3">
              <Avatar name={u.full_name || u.email} size="md" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">
                  {u.full_name || t("team.noName")}
                </div>
                <div className="truncate text-xs text-muted">{u.email}</div>
              </div>
              <span className="rounded-md bg-ok/10 px-2.5 py-0.5 text-xs font-medium capitalize text-ok">
                {u.role}
              </span>
              {!u.is_active && (
                <span className="text-xs text-muted">{t("team.inactive")}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ──────────────────────────────────── Güvenlik ─────────────────────────────── */

function SecurityTab() {
  const { t } = useTranslation("settings");
  const toast = useToast();
  const { data, isLoading, error } = useSigningSecret();
  const rotate = useRotateSigningSecret();

  const [shown, setShown] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const secret = data?.signing_secret ?? "";

  const copy = () => {
    if (!secret) return;
    navigator.clipboard
      ?.writeText(secret)
      .then(() =>
        toast.show({ message: t("security.copySuccess"), variant: "success" }),
      )
      .catch(() => {});
  };

  const doRotate = () => {
    rotate.mutate(undefined, {
      onSuccess: () => {
        setShown(true);
        setConfirmOpen(false);
        toast.show({ message: t("security.rotateSuccess"), variant: "success" });
      },
      onError: () => {
        setConfirmOpen(false);
        toast.show({ message: t("security.rotateError"), variant: "error" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <Section title={t("security.secretTitle")} desc={t("security.secretDesc")}>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {t("security.secretLoadFailed")}
          </p>
        )}

        <Field label={t("security.secretLabel")} htmlFor="sec-secret">
          <div className="flex flex-col gap-2 sm:flex-row">
            {isLoading ? (
              <Skeleton className="h-[42px] flex-1" />
            ) : (
              <input
                id="sec-secret"
                className={INPUT_CLS + " flex-1 font-mono"}
                type={shown ? "text" : "password"}
                value={secret}
                readOnly
                autoComplete="off"
              />
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="shrink-0"
                aria-pressed={shown}
                onClick={() => setShown((s) => !s)}
                disabled={!secret}
                leftIcon={
                  <Icon
                    name={shown ? "eyeOff" : "eye"}
                    className="h-4 w-4"
                  />
                }
              >
                {shown ? t("security.hide") : t("security.show")}
              </Button>
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={copy}
                disabled={!secret}
                leftIcon={<Icon name="copy" className="h-4 w-4" />}
              >
                {t("common.copy")}
              </Button>
            </div>
          </div>
        </Field>

        {data?.note && <p className="mt-3 text-xs text-muted">{data.note}</p>}

        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium text-muted">
            {t("security.codeExampleLabel")}
          </div>
          <pre className="overflow-auto rounded-lg border border-line bg-surface-2 p-4 text-xs font-mono leading-relaxed text-ink-3">{`jwt.encode({
  "iss": "${data?.slug ?? "<tenant_slug>"}", "sub": "<your_user_id>",
  "email": "ali@x.com", "name": "Ali",
  "iat": now, "exp": now + 3600
}, SIGNING_SECRET, algorithm="HS256")`}</pre>
        </div>
      </Section>

      {/* Tehlikeli bölge */}
      <Section title={t("security.dangerZone")} danger>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="font-medium text-ink">
              {t("security.rotateTitle")}
            </div>
            <p className="text-sm text-muted">{t("security.rotateDesc")}</p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 self-start sm:self-auto"
            disabled={isLoading || rotate.isPending}
            loading={rotate.isPending}
            onClick={() => setConfirmOpen(true)}
            leftIcon={
              rotate.isPending ? undefined : (
                <Icon name="arrow" className="h-4 w-4" />
              )
            }
          >
            {rotate.isPending ? t("security.rotating") : t("security.rotate")}
          </Button>
        </div>

        <div className="my-4 border-t border-line" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="font-medium text-danger">
              {t("security.deleteTitle")}
            </div>
            <p className="text-sm text-muted">{t("security.deleteDesc")}</p>
          </div>
          <Button
            variant="danger"
            className="shrink-0 self-start sm:self-auto"
            title={t("security.deleteDisabledHint")}
            disabled
          >
            {t("security.delete")}
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        title={t("security.rotateConfirmTitle")}
        message={t("security.rotateConfirmMessage")}
        confirmLabel={t("security.rotateConfirm")}
        cancelLabel={t("common.cancel")}
        danger
        loading={rotate.isPending}
        onConfirm={doRotate}
        onClose={() => !rotate.isPending && setConfirmOpen(false)}
      />
    </div>
  );
}

/* ───────────────────────────────────── Sayfa ──────────────────────────────── */

export function SettingsPage() {
  const { t } = useTranslation("settings");
  const { data: tenant } = useTenant();
  const { value: tenantName } = useTenantNameOverride(tenant?.name);

  return (
    <>
      <Topbar
        title={t("page.title")}
        subtitle={tenantName || tenant?.name || ""}
      />

      <div className="flex-1 overflow-y-auto bg-surface-2 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:overflow-visible sm:px-0">
            <Tabs
              items={[
                {
                  id: "organization",
                  label: t("tabs.organization"),
                  content: <OrganizationTab />,
                },
                {
                  id: "profile",
                  label: t("tabs.profile"),
                  content: <ProfileTab />,
                },
                { id: "team", label: t("tabs.team"), content: <TeamTab /> },
                {
                  id: "security",
                  label: t("tabs.security"),
                  content: <SecurityTab />,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
