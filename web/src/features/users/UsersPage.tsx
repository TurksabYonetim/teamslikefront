import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  Skeleton,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  normalizeRole,
  deriveInitials,
  deriveColor,
  type Role,
} from "./users.mock";
import type { ApiUser } from "./users.api";
import { useCreateUser, useUser, useUsers } from "./users.hooks";
import { useUsersOverlay } from "./users.overlay";

const ROLE_BADGE: Record<Role, string> = {
  owner: "bg-brand/10 text-brand",
  admin: "bg-surface-3 text-ink-2",
  member: "bg-surface-3 text-ink-2",
};

const ROLE_FILTERS = ["all", "owner", "admin", "member"] as const;

export function UsersPage() {
  const { t } = useTranslation("users");
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ApiUser | null>(null);

  const { users, isLoading, isError, error, refetch } = useUsers();
  const { update, setActive, remove } = useUsersOverlay();

  const roleName = (r: string) => t(`role.${normalizeRole(r)}`);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (role !== "all" && normalizeRole(u.role) !== role) return false;
        const q = query.trim().toLowerCase();
        return (
          !q ||
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      }),
    [users, query, role],
  );

  const showList = !isLoading && !isError;
  const hasUsers = users.length > 0;

  const onToggleActive = (u: ApiUser) => {
    const next = !u.is_active;
    setActive(u.id, next);
    toast.show({
      variant: "success",
      message: t(next ? "toggle.activated" : "toggle.deactivated", {
        name: u.full_name,
      }),
    });
  };

  const onConfirmDelete = () => {
    if (!deleteUser) return;
    remove(deleteUser.id);
    toast.show({
      variant: "success",
      message: t("delete.success", { name: deleteUser.full_name }),
    });
    setDeleteUser(null);
  };

  return (
    <>
      <Topbar
        title={t("title")}
        subtitle={t("subtitle", { count: users.length })}
        actions={
          <Button
            size="sm"
            leftIcon={<Icon name="plus" className="w-4 h-4" />}
            onClick={() => setCreateOpen(true)}
          >
            {t("addUser")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface-2 p-4 md:p-6">
        <div className="bg-surface border border-line rounded-card overflow-hidden">
          {/* Araç çubuğu: arama + rol filtresi */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-line">
            <div className="relative flex-1 sm:max-w-xs">
              <Icon
                name="search"
                className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                className="input pl-9"
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div
              className="flex items-center gap-1 overflow-x-auto -mx-1 px-1"
              role="tablist"
              aria-label={t("table.role")}
            >
              {ROLE_FILTERS.map((r) => {
                const selected = role === r;
                return (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setRole(r)}
                    className={
                      "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 " +
                      "transition-colors duration-[140ms] ease-[var(--ease-out)] " +
                      (selected
                        ? "bg-brand/10 text-brand"
                        : "text-muted hover:bg-surface-3 hover:text-ink-2")
                    }
                  >
                    {t(`filter.${r}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Yükleniyor — skeleton */}
          {isLoading && (
            <div className="p-4 flex flex-col gap-3" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
                  <Skeleton className="h-3.5 w-48 hidden lg:block" />
                </div>
              ))}
            </div>
          )}

          {/* Hata */}
          {isError && (
            <EmptyState
              icon={<Icon name="info" className="w-6 h-6" />}
              title={t("loadError")}
              description={apiErrorMessage(error)}
              action={
                <Button variant="secondary" size="sm" onClick={() => refetch()}>
                  {t("actions.retry")}
                </Button>
              }
            />
          )}

          {/* Boş — hiç kullanıcı yok */}
          {showList && !hasUsers && (
            <EmptyState
              icon={<Icon name="users" className="w-6 h-6" />}
              title={t("empty.title")}
              description={t("empty.description")}
              action={
                <Button
                  size="sm"
                  leftIcon={<Icon name="plus" className="w-4 h-4" />}
                  onClick={() => setCreateOpen(true)}
                >
                  {t("empty.action")}
                </Button>
              }
            />
          )}

          {/* Boş — filtreyle eşleşen yok */}
          {showList && hasUsers && filtered.length === 0 && (
            <EmptyState
              icon={<Icon name="search" className="w-6 h-6" />}
              title={t("noResults.title")}
              description={t("noResults.description")}
            />
          )}

          {/* Masaüstü tablo */}
          {showList && filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-ink-2">
                <thead className="text-xs text-muted uppercase bg-surface-2">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">{t("table.user")}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t("table.role")}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t("table.status")}</th>
                    <th scope="col" className="px-6 py-3 font-medium">{t("table.email")}</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const r = normalizeRole(u.role);
                    return (
                      <tr
                        key={u.id}
                        className="border-t border-line hover:bg-surface-2 cursor-pointer transition-colors duration-[120ms] ease-[var(--ease-out)]"
                        onClick={() => setDetailId(u.id)}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={deriveInitials(u.full_name, u.email)}
                              color={deriveColor(u.id || u.email)}
                              size="sm"
                            />
                            <div className="font-medium text-ink">{u.full_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[r]}`}>
                            {roleName(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <StatusPill active={u.is_active} t={t} />
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-muted">{u.email}</td>
                        <td className="px-6 py-3 text-right">
                          <RowActions
                            user={u}
                            t={t}
                            onEdit={() => setEditUser(u)}
                            onToggle={() => onToggleActive(u)}
                            onDelete={() => setDeleteUser(u)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobil kart düzeni */}
          {showList && filtered.length > 0 && (
            <ul className="md:hidden divide-y divide-line">
              {filtered.map((u) => {
                const r = normalizeRole(u.role);
                return (
                  <li key={u.id}>
                    <button
                      className="w-full text-left p-4 flex items-start gap-3 hover:bg-surface-2 transition-colors duration-[120ms] ease-[var(--ease-out)]"
                      onClick={() => setDetailId(u.id)}
                    >
                      <Avatar
                        initials={deriveInitials(u.full_name, u.email)}
                        color={deriveColor(u.id || u.email)}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink truncate">{u.full_name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${ROLE_BADGE[r]}`}>
                            {roleName(u.role)}
                          </span>
                        </div>
                        <div className="text-xs text-muted font-mono truncate mt-0.5">{u.email}</div>
                        <div className="mt-2">
                          <StatusPill active={u.is_active} t={t} />
                        </div>
                      </div>
                    </button>
                    <div
                      className="flex items-center justify-end gap-1 px-4 pb-3 -mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        user={u}
                        t={t}
                        onEdit={() => setEditUser(u)}
                        onToggle={() => onToggleActive(u)}
                        onDelete={() => setDeleteUser(u)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <UserDetailModal id={detailId} onClose={() => setDetailId(null)} />

      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={(id, fields) => {
          update(id, fields);
          toast.show({
            variant: "success",
            message: t("edit.success", { name: fields.full_name }),
          });
          setEditUser(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteUser}
        title={t("delete.title")}
        message={t("delete.message", { name: deleteUser?.full_name ?? "" })}
        confirmLabel={t("delete.confirm")}
        cancelLabel={t("actions.cancel")}
        onConfirm={onConfirmDelete}
        onClose={() => setDeleteUser(null)}
      />
    </>
  );
}

type TFn = (key: string, opts?: Record<string, unknown>) => string;

/* Durum etiketi: aktif/pasif noktası. */
function StatusPill({ active, t }: { active: boolean; t: TFn }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-2">
      <span
        className={"w-2.5 h-2.5 rounded-full " + (active ? "bg-ok" : "bg-surface-3 ring-1 ring-line")}
        aria-hidden="true"
      />
      {t(active ? "status.active" : "status.inactive")}
    </span>
  );
}

/* Satır aksiyonları: düzenle / aktiflik / sil. */
function RowActions({
  user,
  t,
  onEdit,
  onToggle,
  onDelete,
}: {
  user: ApiUser;
  t: TFn;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const iconBtn =
    "p-1.5 rounded-lg text-muted hover:bg-surface-3 hover:text-ink-2 " +
    "transition-colors duration-[120ms] ease-[var(--ease-out)] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  return (
    <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button type="button" aria-label={t("actions.edit")} title={t("actions.edit")} onClick={onEdit} className={iconBtn}>
        <Icon name="pencil" className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label={t(user.is_active ? "actions.deactivate" : "actions.activate")}
        title={t(user.is_active ? "actions.deactivate" : "actions.activate")}
        onClick={onToggle}
        className={iconBtn}
      >
        <Icon name={user.is_active ? "close" : "check"} className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label={t("actions.delete")}
        title={t("actions.delete")}
        onClick={onDelete}
        className={
          "p-1.5 rounded-lg text-muted hover:bg-danger/10 hover:text-danger " +
          "transition-colors duration-[120ms] ease-[var(--ease-out)] " +
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        }
      >
        <Icon name="trash" className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kullanıcı ekle modalı — POST /v1/users/                             */
/* ------------------------------------------------------------------ */
function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("users");
  const toast = useToast();
  const create = useCreateUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [password, setPassword] = useState("changeme123");

  const reset = () => {
    setFullName("");
    setEmail("");
    setRole("member");
    setPassword("changeme123");
    create.reset();
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const name = fullName.trim();
    create.mutate(
      { full_name: name, email: email.trim(), role, password },
      {
        onSuccess: () => {
          toast.show({ variant: "success", message: t("create.success", { name }) });
          close();
        },
      },
    );
  };

  const canSubmit = !!(fullName.trim() && email.trim() && password && !create.isPending);

  return (
    <Modal
      open={open}
      onClose={close}
      title={t("create.title")}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={create.isPending}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={submit} loading={create.isPending} disabled={!canSubmit}>
            {create.isPending ? t("create.submitting") : t("create.submit")}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) submit();
        }}
      >
        {create.isError && (
          <div className="text-sm text-danger" role="alert">
            {apiErrorMessage(create.error)}
          </div>
        )}
        <div>
          <label className="label" htmlFor="cu-name">{t("create.fullName")}</label>
          <input
            id="cu-name"
            className="input"
            placeholder={t("create.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="label" htmlFor="cu-email">{t("create.email")}</label>
          <input
            id="cu-email"
            className="input"
            type="email"
            placeholder={t("create.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cu-role">{t("create.role")}</label>
            <select
              id="cu-role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="member">{t("role.member")}</option>
              <option value="admin">{t("role.admin")}</option>
              <option value="owner">{t("role.owner")}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="cu-pass">{t("create.password")}</label>
            <input
              id="cu-pass"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {/* submit'i Enter ile tetiklemek için gizli buton */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Kullanıcı detay modalı — GET /v1/users/{id}                         */
/* ------------------------------------------------------------------ */
function UserDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t, i18n } = useTranslation("users");
  const { data, isLoading, isError, error } = useUser(id);
  const locale = i18n.language === "en" ? "en-US" : "tr-TR";

  return (
    <Modal open={!!id} onClose={onClose} title={t("detail.title")}>
      {isLoading && (
        <div className="space-y-4" aria-busy="true">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      )}
      {isError && (
        <div className="py-4 text-sm text-danger" role="alert">
          {apiErrorMessage(error)}
        </div>
      )}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar
              initials={deriveInitials(data.full_name, data.email)}
              color={deriveColor(data.id || data.email)}
              size="lg"
            />
            <div className="min-w-0">
              <div className="font-semibold text-ink truncate">{data.full_name}</div>
              <div className="text-sm text-muted font-mono truncate">{data.email}</div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="label">{t("detail.role")}</dt>
              <dd className="text-ink">{t(`role.${normalizeRole(data.role)}`)}</dd>
            </div>
            <div>
              <dt className="label">{t("detail.status")}</dt>
              <dd className="text-ink">{t(data.is_active ? "status.active" : "status.inactive")}</dd>
            </div>
            <div className="col-span-2">
              <dt className="label">{t("detail.createdAt")}</dt>
              <dd className="text-ink">{new Date(data.created_at).toLocaleString(locale)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="label">{t("detail.userId")}</dt>
              <dd className="text-muted font-mono text-xs break-all">{data.id}</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Kullanıcı düzenle modalı — yerel overlay (backend UPDATE ucu yok)   */
/* ------------------------------------------------------------------ */
function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: ApiUser | null;
  onClose: () => void;
  onSave: (id: string, fields: { full_name: string; role: string }) => void;
}) {
  if (!user) return null;
  // key ile remount → form state her açılışta seçili kullanıcıdan başlar
  return <EditUserForm key={user.id} user={user} onClose={onClose} onSave={onSave} />;
}

function EditUserForm({
  user,
  onClose,
  onSave,
}: {
  user: ApiUser;
  onClose: () => void;
  onSave: (id: string, fields: { full_name: string; role: string }) => void;
}) {
  const { t } = useTranslation("users");
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<Role>(normalizeRole(user.role));

  const save = () => {
    if (fullName.trim()) onSave(user.id, { full_name: fullName.trim(), role });
  };

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={t("edit.title")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button disabled={!fullName.trim()} onClick={save}>
            {t("actions.save")}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <p className="text-xs text-muted">{t("edit.localNote")}</p>
        <div>
          <label className="label" htmlFor="eu-name">{t("edit.fullName")}</label>
          <input
            id="eu-name"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="label" htmlFor="eu-email">{t("edit.email")}</label>
          <input id="eu-email" className="input" value={user.email} disabled />
        </div>
        <div>
          <label className="label" htmlFor="eu-role">{t("edit.role")}</label>
          <select
            id="eu-role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="member">{t("role.member")}</option>
            <option value="admin">{t("role.admin")}</option>
            <option value="owner">{t("role.owner")}</option>
          </select>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
