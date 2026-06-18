import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiStar, HiOutlineStar } from "react-icons/hi2";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import { Overlay } from "@/components/ui/Overlay";
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from "./phone.hooks";
import { directoryStore, useDirectory } from "./directoryStore";
import type { Contact, CreateContactRequest } from "./phone.types";
import { filterContacts, groupContactsByLetter } from "./phone.utils";

interface ContactsPanelProps {
  /** Rehberden bir kişiyi arar (Dialer üzerinden giden arama başlatır). */
  onCall: (number: string, name?: string) => void;
  /** "Tuş takımına doldur": numarayı dialer girişine yazar (aramaz). */
  onFillDialer?: (number: string) => void;
}

const EMPTY_FORM: CreateContactRequest = {
  name: "",
  number: "",
  email: "",
  notes: "",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toLocaleUpperCase("tr")).join("") || "?";
}

/**
 * Rehber (contacts) paneli: arama, harf gruplama, kişi detayı, kişiden ara /
 * tuş takımına doldur, düzenle, ConfirmDialog ile sil + undo toast.
 * Tüm CRUD gerçek /v1/contacts uçlarına bağlı.
 */
export function ContactsPanel({ onCall, onFillDialer }: ContactsPanelProps) {
  const { t, i18n } = useTranslation("phone");
  const toast = useToast();

  const { data: contacts, isLoading, isError } = useContacts();
  const createM = useCreateContact();
  const updateM = useUpdateContact();
  const deleteM = useDeleteContact();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateContactRequest>(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Contact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);

  const favorites = useDirectory((s) => s.favorites);
  const list = useMemo(() => contacts ?? [], [contacts]);
  const groups = useMemo(
    () => groupContactsByLetter(filterContacts(list, query), i18n.language),
    [list, query, i18n.language],
  );
  // Favori kişiler (id sırasını korur; silinmiş id'ler düşer).
  const favContacts = useMemo(
    () => favorites.map((id) => list.find((c) => c.id === id)).filter((c): c is Contact => !!c),
    [favorites, list],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setAdding(false);
    setEditingId(null);
  }

  function startEdit(c: Contact) {
    setDetail(null);
    setEditingId(c.id);
    setAdding(false);
    setForm({
      name: c.name,
      number: c.number,
      email: c.email ?? "",
      notes: c.notes ?? "",
    });
  }

  async function handleSubmit() {
    const body: CreateContactRequest = {
      name: form.name.trim(),
      number: form.number.trim(),
      email: form.email?.trim() ? form.email.trim() : null,
      notes: form.notes?.trim() ? form.notes.trim() : null,
    };
    if (!body.name || !body.number) return;
    try {
      if (editingId) {
        await updateM.mutateAsync({ id: editingId, body });
        toast.show({ message: t("toast.contactSaved"), variant: "success" });
      } else {
        await createM.mutateAsync(body);
        toast.show({ message: t("toast.contactCreated"), variant: "success" });
      }
      resetForm();
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function confirmDelete() {
    const c = pendingDelete;
    if (!c) return;
    setPendingDelete(null);
    setDetail(null);
    try {
      await deleteM.mutateAsync(c.id);
      toast.show({
        message: t("toast.contactDeleted"),
        variant: "success",
        action: {
          label: t("toast.undo"),
          onClick: () => {
            createM
              .mutateAsync({
                name: c.name,
                number: c.number,
                email: c.email,
                notes: c.notes,
              })
              .catch((err) =>
                toast.show({ message: apiErrorMessage(err), variant: "error" }),
              );
          },
        },
      });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  const editing = adding || editingId !== null;

  // Rehber gövdesi — durum girişi ".contacts-panel .contacts-state" üzerinden
  // styles/index.css'te (impeccable delight).
  const renderContacts = () => (
    <div className="contacts-panel flex w-full flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {t("contacts.title")}
        </h3>
        {!editing && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            {t("contacts.add")}
          </Button>
        )}
      </div>

      {/* Arama */}
      {!editing && (
        <div className="relative mb-3">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("contacts.searchPlaceholder")}
            aria-label={t("contacts.searchPlaceholder")}
            className="input pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("contacts.clearSearch")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Favori çipleri — tek dokunuşla ara */}
      {!editing && favContacts.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {t("directory.favorites")}
          </p>
          <ul className="tl-stagger flex flex-wrap gap-2">
            {favContacts.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onCall(c.number, c.name)}
                  aria-label={`${t("contacts.call")} — ${c.name}`}
                  className="fav-chip inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 transition-transform duration-150 ease-[var(--ease-out)] hover:border-primary-400 hover:text-primary-700 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:text-primary-300"
                >
                  <HiStar size={14} className="text-amber-400" aria-hidden />
                  <span className="max-w-[8rem] truncate">{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <div className="contact-form mb-3 space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t("contacts.namePlaceholder")}
            aria-label={t("contacts.fields.name")}
            className="input"
          />
          <input
            type="tel"
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
            placeholder={t("contacts.numberPlaceholder")}
            aria-label={t("contacts.fields.number")}
            className="input"
          />
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t("contacts.emailPlaceholder")}
            aria-label={t("contacts.fields.email")}
            className="input"
          />
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder={t("contacts.notesPlaceholder")}
            aria-label={t("contacts.fields.notes")}
            rows={2}
            className="input"
          />
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={resetForm}>
              {t("contacts.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                !form.name.trim() ||
                !form.number.trim() ||
                createM.isPending ||
                updateM.isPending
              }
            >
              {t("contacts.save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="contacts-state">
          <EmptyState
            title={t("contacts.errorTitle")}
            description={t("contacts.errorDescription")}
          />
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && !editing && (
        <div className="contacts-state">
          <EmptyState
            title={t("contacts.empty")}
            description={t("contacts.emptyDescription")}
            action={
              <Button size="sm" onClick={() => setAdding(true)}>
                {t("contacts.add")}
              </Button>
            }
          />
        </div>
      )}

      {!isLoading &&
        !isError &&
        list.length > 0 &&
        groups.length === 0 &&
        !editing && (
          <div className="contacts-state">
            <EmptyState
              title={t("contacts.noResults")}
              description={t("contacts.noResultsDescription")}
            />
          </div>
        )}

      {!isLoading && !isError && groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.letter}>
              <p className="mb-1.5 px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                {group.letter}
              </p>
              <ul className="tl-stagger divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                {group.items.map((c) => (
                  <li key={c.id} className="contact-row flex items-center gap-3 px-4 py-3">
                    <span className="contact-avatar inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                      {initials(c.name)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetail(c)}
                      className="min-w-0 flex-1 text-left"
                      aria-label={t("contacts.viewDetail")}
                    >
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                        {c.number}
                        {c.email ? ` · ${c.email}` : ""}
                      </p>
                    </button>
                    <FavoriteToggle contactId={c.id} contactName={c.name} />
                    <button
                      type="button"
                      onClick={() => onCall(c.number, c.name)}
                      aria-label={t("contacts.call")}
                      className="shrink-0 rounded-lg p-2 text-primary-600 transition-transform duration-150 ease-[var(--ease-out)] hover:bg-primary-50 active:scale-95 dark:text-primary-400 dark:hover:bg-gray-700"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.476 2.165 1.736 4.422 3.626 6.312 1.89 1.89 4.147 3.15 6.312 3.626 2.063.454 4.114-.08 5.937-1.899a2.553 2.553 0 0 0 .877-1.926 2.547 2.547 0 0 0-.882-1.911l-1.842-1.611a2.502 2.502 0 0 0-3.118-.115l-1.252.939a.503.503 0 0 1-.354.115 4.49 4.49 0 0 1-1.866-.96 4.49 4.49 0 0 1-.96-1.866.503.503 0 0 1 .114-.354l.939-1.252a2.502 2.502 0 0 0-.115-3.118l-1.611-1.842A2.547 2.547 0 0 0 7.978 4Z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Kişi detayı */}
      {detail && (
        <Overlay open onClose={() => setDetail(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-detail-name"
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl dark:bg-gray-800 motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)]"
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                {initials(detail.name)}
              </span>
              <p id="contact-detail-name" className="text-base font-semibold text-gray-900 dark:text-white">
                {detail.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {detail.number}
              </p>
            </div>

            <dl className="mb-4 space-y-2 text-sm">
              {detail.email && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("contacts.fields.email")}
                  </dt>
                  <dd className="truncate text-gray-900 dark:text-white">
                    {detail.email}
                  </dd>
                </div>
              )}
              {detail.notes && (
                <div>
                  <dt className="mb-1 text-gray-500 dark:text-gray-400">
                    {t("contacts.fields.notes")}
                  </dt>
                  <dd className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {detail.notes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onCall(detail.number, detail.name);
                  setDetail(null);
                }}
              >
                {t("contacts.call")}
              </Button>
              {onFillDialer && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onFillDialer(detail.number);
                    setDetail(null);
                  }}
                >
                  {t("contacts.fillDialer")}
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => startEdit(detail)}>
                {t("contacts.edit")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setPendingDelete(detail)}
              >
                {t("contacts.delete")}
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
            >
              {t("contacts.close")}
            </button>
          </div>
        </Overlay>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("contacts.deleteTitle")}
        message={t("contacts.deleteConfirm", { name: pendingDelete?.name ?? "" })}
        confirmLabel={t("contacts.delete")}
        cancelLabel={t("contacts.cancel")}
        loading={deleteM.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );

  return renderContacts();
}

/** Kişiyi favorilere ekle/çıkar (yıldız). directoryStore'a yazar. */
function FavoriteToggle({ contactId, contactName }: { contactId: string; contactName: string }) {
  const { t } = useTranslation("phone");
  const isFav = useDirectory((s) => s.favorites.includes(contactId));
  return (
    <button
      type="button"
      onClick={() => directoryStore.getState().toggleFavorite(contactId)}
      aria-pressed={isFav}
      aria-label={`${isFav ? t("directory.removeFavorite") : t("directory.addFavorite")} — ${contactName}`}
      className={
        "shrink-0 rounded-lg p-2 transition-transform duration-150 ease-[var(--ease-out)] active:scale-90 hover:bg-gray-100 dark:hover:bg-gray-700 " +
        (isFav ? "text-amber-400" : "text-gray-400 hover:text-amber-400")
      }
    >
      {isFav ? <HiStar size={18} aria-hidden /> : <HiOutlineStar size={18} aria-hidden />}
    </button>
  );
}
