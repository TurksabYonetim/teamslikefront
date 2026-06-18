import { useEffect, useState } from "react";
import { useInitFlowbite } from "@/lib/flowbite";
import inboxMessages from "./inbox.data.json";
import { useToast } from "@/components/ui";
import { ComposeModal } from "./ComposeModal";

/** Bir mesajın fiziksel olarak bulunduğu klasör. */
type Folder = "inbox" | "sent" | "spam" | "archive" | "trash";
/** Sol gezinmedeki görünümler — klasörler + sanal (yıldızlı/önemli) görünümler. */
type View = Folder | "starred" | "important";

type InboxMessage = (typeof inboxMessages)[number] & {
  starred?: boolean;
  important?: boolean;
  folder?: Folder;
};

/** Sayfa başına gösterilecek mesaj sayısı (Gmail tarzı sayfalama). */
const PAGE_SIZE = 10;

/** Boş klasör mesajları (görünüme göre). */
const VIEW_EMPTY: Record<View, string> = {
  inbox: "Gelen kutusu boş.",
  starred: "Yıldızlı mesaj yok.",
  important: "Önemli olarak işaretlenmiş mesaj yok.",
  sent: "Gönderilmiş mesaj yok.",
  spam: "Spam klasörü boş.",
  archive: "Arşivlenmiş mesaj yok.",
  trash: "Çöp kutusu boş.",
};

/** "Taşı" menüsündeki hedef klasörler (etiket + bildirim fiili). */
const MOVE_TARGETS: { folder: Folder; label: string; verb: string }[] = [
  { folder: "inbox", label: "Gelen Kutusu", verb: "gelen kutusuna taşındı" },
  { folder: "archive", label: "Arşiv", verb: "arşive taşındı" },
  { folder: "spam", label: "Spam", verb: "spam'e taşındı" },
  { folder: "trash", label: "Çöp", verb: "çöpe taşındı" },
];

/** İsimden sözde e-posta adresi türet (veride email alanı yok). */
function deriveEmail(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/(^\.|\.$)/g, "")}@teamslike.com`;
}

/** Gövde metninin ilk cümlesini konu başlığı olarak kullan (veride konu yok). */
function deriveSubject(text: string): string {
  const first = text.split(/[.!?]/)[0]?.trim() ?? text;
  return first.length > 80 ? `${first.slice(0, 79)}…` : first;
}

/** Ad-soyaddan baş harfleri (avatar için). */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Editör HTML'ini düz metne indirger (Gönderilenler önizlemesi için). */
function stripHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").trim() || "(boş mesaj)";
}

/**
 * Flowbite "inbox.html" sayfasından çevrildi; etkileşim React state ile yönetilir.
 * Compose ve mesaj görüntüleme, projenin ortak `Modal`/`Overlay` katmanı üzerinden
 * açılır (backdrop + ESC + scroll-lock). Satırlara tıklayınca mesaj detayı açılır.
 */
export function MailInbox() {
  useInitFlowbite();
  const toast = useToast();
  const [messages, setMessages] = useState<InboxMessage[]>(() =>
    inboxMessages.map((m) => ({ ...m, folder: "inbox" as Folder })),
  );
  const [view, setView] = useState<View>("inbox");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [reply, setReply] = useState<{ to: string; subject: string } | null>(null);
  const [active, setActive] = useState<InboxMessage | null>(null);

  /** Mesaj verilen görünüme ait mi? */
  function matchesView(m: InboxMessage, v: View): boolean {
    const folder = m.folder ?? "inbox";
    if (v === "starred") return !!m.starred && folder !== "trash" && folder !== "spam";
    if (v === "important") return !!m.important && folder !== "trash";
    return folder === v;
  }

  const visibleMessages = messages.filter((m) => matchesView(m, view));
  const pageCount = Math.max(1, Math.ceil(visibleMessages.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageMessages = visibleMessages.slice(pageStart, pageStart + PAGE_SIZE);
  const allSelected = pageMessages.length > 0 && pageMessages.every((m) => selected.has(m.id));

  const counts = {
    inbox: messages.filter((m) => (m.folder ?? "inbox") === "inbox").length,
    inboxUnread: messages.filter((m) => (m.folder ?? "inbox") === "inbox" && !m.read).length,
    starred: messages.filter((m) => matchesView(m, "starred")).length,
    important: messages.filter((m) => matchesView(m, "important")).length,
    sent: messages.filter((m) => m.folder === "sent").length,
    spam: messages.filter((m) => m.folder === "spam").length,
    archive: messages.filter((m) => m.folder === "archive").length,
    trash: messages.filter((m) => m.folder === "trash").length,
  };

  // Mesaj taşınıp sayfa aralık dışına çıkarsa son geçerli sayfaya çek.
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  function changeView(v: View) {
    setView(v);
    setPage(0);
    setSelected(new Set());
    setActive(null);
  }

  function openCompose() {
    setReply(null);
    setComposeOpen(true);
  }

  function openReply(m: InboxMessage) {
    setReply({ to: deriveEmail(m.name), subject: `Re: ${deriveSubject(m.text)}` });
    setComposeOpen(true);
  }

  /** Gönderilen mesajı "Gönderilenler" klasörüne ekle. */
  function addSent(data: { to: string; subject: string; body: string }) {
    const nextId = messages.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const sent: InboxMessage = {
      id: nextId,
      name: data.to,
      avatar: "",
      time: "Şimdi",
      text: data.subject ? `${data.subject}\n\n${stripHtml(data.body)}` : stripHtml(data.body),
      read: true,
      folder: "sent",
    };
    setMessages((prev) => [sent, ...prev]);
    toast.show({ message: "Mesaj gönderildi", variant: "success" });
  }

  function openMessage(m: InboxMessage) {
    setActive(m);
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageMessages.forEach((m) => next.delete(m.id));
      else pageMessages.forEach((m) => next.add(m.id));
      return next;
    });
  }

  function toggleStar(id: number) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));
  }

  function toggleImportant(id: number) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, important: !m.important } : m)));
  }

  /** Aksiyonlar seçim gerektirir; seçim yoksa uyarı verip null döner. */
  function requireSelection(): number[] | null {
    if (selected.size === 0) {
      toast.show({ message: "Önce en az bir mesaj seçin", variant: "warning" });
      return null;
    }
    return [...selected];
  }

  /** Seçili mesajları bir klasöre taşı. */
  function moveSelected(folder: Folder, verb: string) {
    const ids = requireSelection();
    if (!ids) return;
    setMessages((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, folder } : m)));
    setSelected(new Set());
    toast.show({ message: `${ids.length} mesaj ${verb}`, variant: "success" });
  }

  /** Seçili mesajları kalıcı sil (yalnızca çöp görünümünde). */
  function deleteSelected() {
    const ids = requireSelection();
    if (!ids) return;
    setMessages((prev) => prev.filter((m) => !selected.has(m.id)));
    setSelected(new Set());
    toast.show({ message: `${ids.length} mesaj kalıcı olarak silindi`, variant: "success" });
  }

  function starSelected() {
    const ids = requireSelection();
    if (!ids) return;
    setMessages((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, starred: true } : m)));
    setSelected(new Set());
    toast.show({ message: `${ids.length} mesaj yıldızlandı`, variant: "success" });
  }

  function importantSelected() {
    const ids = requireSelection();
    if (!ids) return;
    setMessages((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, important: true } : m)));
    setSelected(new Set());
    toast.show({ message: `${ids.length} mesaj önemli olarak işaretlendi`, variant: "success" });
  }

  function markSelectedUnread() {
    const ids = requireSelection();
    if (!ids) return;
    setMessages((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, read: false } : m)));
    setSelected(new Set());
    toast.show({ message: `${ids.length} mesaj okunmadı olarak işaretlendi` });
  }

  function placeholderAction(label: string) {
    const ids = requireSelection();
    if (!ids) return;
    toast.show({ message: `${ids.length} mesaj · ${label}` });
  }

  /** Read view'den tek mesajı bir klasöre taşı ve listeye dön. */
  function moveOne(id: number, folder: Folder, verb: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, folder } : m)));
    setActive(null);
    toast.show({ message: `Mesaj ${verb}`, variant: "success" });
  }

  /** Read view'den tek mesajı kalıcı sil. */
  function deleteOne(id: number) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setActive(null);
    toast.show({ message: "Mesaj kalıcı olarak silindi", variant: "success" });
  }

  return (
    <>
      {active ? (
        <MessageRead
          message={active}
          onBack={() => setActive(null)}
          onReply={() => openReply(active)}
          onToggleStar={() => toggleStar(active.id)}
          onToggleImportant={() => toggleImportant(active.id)}
          onArchive={() => moveOne(active.id, "archive", "arşivlendi")}
          onSpam={() =>
            active.folder === "spam"
              ? moveOne(active.id, "inbox", "gelen kutusuna taşındı")
              : moveOne(active.id, "spam", "spam'e taşındı")
          }
          onDelete={() =>
            active.folder === "trash"
              ? deleteOne(active.id)
              : moveOne(active.id, "trash", "çöpe taşındı")
          }
          isSpam={active.folder === "spam"}
          isTrash={active.folder === "trash"}
        />
      ) : (
        <>
      <div className="flex items-center justify-between border-b border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="pe-4">
            <input id="checkbox-all" aria-label="Tümünü seç" type="checkbox" className="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
          </div>
          <div className="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div className="flex space-x-1 px-2">
            <a href="#" onClick={(e) => { e.preventDefault(); moveSelected("archive", "arşivlendi"); }} data-tooltip-target="tooltip-archive" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.7 5.7a1 1 0 0 0-1.4-1.4l-.3.3V12a1 1 0 1 0-2 0v2.6l-.3-.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Archive</span>
            </a>
            <div id="tooltip-archive" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Archive
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); view === "spam" ? moveSelected("inbox", "spam değil olarak işaretlendi") : moveSelected("spam", "spam'e taşındı"); }} data-tooltip-target="tooltip-spam" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Report Spam</span>
            </a>
            <div id="tooltip-spam" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Report Spam
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); view === "trash" ? deleteSelected() : moveSelected("trash", "çöpe taşındı"); }} data-tooltip-target="tooltip-delete" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.6 2.6A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4c0-.5.2-1 .6-1.4ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Delete</span>
            </a>
            <div id="tooltip-delete" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Delete
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
          <div className="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
          <div className="flex space-x-1 sm:px-2">
            <a href="#" onClick={(e) => { e.preventDefault(); markSelectedUnread(); }} data-tooltip-target="tooltip-unread" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 5.6V18c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V5.6l-.9.7-7.9 6a2 2 0 0 1-2.4 0l-8-6-.8-.7Z" />
                <path d="M20.7 4.1A2 2 0 0 0 20 4H4a2 2 0 0 0-.6.1l.7.6 7.9 6 7.9-6 .8-.6Z" />
              </svg>
              <span className="sr-only">Mark as unread</span>
            </a>
            <div id="tooltip-unread" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Mark as unread
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); placeholderAction("ertelendi"); }} data-tooltip-target="tooltip-snooze" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Snooze</span>
            </a>
            <div id="tooltip-snooze" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Snooze
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); placeholderAction("görevlere eklendi"); }} data-tooltip-target="tooltip-add-to-tasks" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M18 14a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M15 21.5a10 10 0 1 1 3.6-17L10.9 12 7.7 8.9a1 1 0 0 0-1.4 1.4l4 4a1 1 0 0 0 1.3 0L20 5.8a10 10 0 0 1 1.6 9.1c-.4-.3-1-.5-1.5-.5h-.5V14a2.5 2.5 0 0 0-5 0v.5H14a2.5 2.5 0 0 0 0 5h.5v.5c0 .6.2 1.1.5 1.5Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Add to tasks</span>
            </a>
            <div id="tooltip-add-to-tasks" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Add to tasks
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button type="button" data-dropdown-toggle="move-dropdown" data-tooltip-target="tooltip-move" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 4a2 2 0 0 0-2 2v1h11l-2-2.3a2 2 0 0 0-1.5-.7H5ZM3 19V9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm11.7-7.7a1 1 0 0 0-1.4 1.4l.3.3H8a1 1 0 1 0 0 2h5.6l-.3.3a1 1 0 0 0 1.4 1.4l2-2c.4-.4.4-1 0-1.4l-2-2Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Move to</span>
            </button>
            <div id="move-dropdown" className="z-10 hidden w-48 origin-top rounded-lg bg-white shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700">
              <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Şuraya taşı</div>
              <ul className="p-2 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="move-dropdown">
                {MOVE_TARGETS.filter((t) => t.folder !== view).map((t) => (
                  <li key={t.folder}>
                    <a href="#" onClick={(e) => { e.preventDefault(); moveSelected(t.folder, t.verb); }} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div id="tooltip-move" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Move to
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); placeholderAction("etiketlendi"); }} data-tooltip-target="tooltip-labels" className="hidden cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white md:inline-flex">
              <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Labels</span>
            </a>
            <div id="tooltip-labels" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
              Labels
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
            <button id="mail-dropdown-button" type="button" data-dropdown-toggle="mail-dropdown" className="inline-flex items-center rounded-lg p-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M12 6h0m0 6h0m0 6h0" />
              </svg>
            </button>
            <div id="mail-dropdown" className="z-10 hidden w-60 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-sm motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:divide-gray-600 dark:bg-gray-700">
              <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-labelledby="mail-dropdown-button">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); importantSelected(); }} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M3 4a1 1 0 0 0-.822 1.57L6.632 12l-4.454 6.43A1 1 0 0 0 3 20h13.153a1 1 0 0 0 .822-.43l4.847-7a1 1 0 0 0 0-1.14l-4.847-7a1 1 0 0 0-.822-.43H3Z" clipRule="evenodd" />
                    </svg>
                    Mark as Important
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); starSelected(); }} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" d="M11.083 4.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.557 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.029 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 19.8c-.764.446-1.688-.248-1.473-1.106l1.029-4.119a1 1 0 0 0-.337-1.016l-3.33-2.723c-.699-.571-.343-1.702.556-1.771l4.463-.342a1 1 0 0 0 .84-.597l1.752-4.022Z" />
                    </svg>
                    Add star
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); placeholderAction("filtre oluşturuldu"); }} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" />
                    </svg>
                    Filter messages like these
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); placeholderAction("ek olarak iletildi"); }} className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                    </svg>
                    Forward as attachment
                  </a>
                </li>
              </ul>
            </div>
            <button type="button" onClick={openCompose} className="flex w-full items-center justify-center rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-[transform,background-color] hover:bg-primary-800 motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
              <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"></path>
              </svg>
              Compose
            </button>
          </div>
        </div>
        <div className="hidden items-center space-x-1 sm:flex sm:space-y-0">
          <span className="me-4 hidden text-sm text-gray-500 dark:text-gray-400 md:flex">{selected.size > 0 ? <><span className="font-semibold text-gray-900 dark:text-white">{selected.size}</span> seçili</> : <>Show <span className="mx-1 font-semibold text-gray-900 dark:text-white">{visibleMessages.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, visibleMessages.length)}</span> of <span className="ms-1 font-semibold text-gray-900 dark:text-white">{visibleMessages.length}</span></>}</span>
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} data-tooltip-target="tooltip-prev-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
            </svg>
            <span className="sr-only">Prev page</span>
          </button>
          <div id="tooltip-prev-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Prev page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} data-tooltip-target="tooltip-next-page" className="inline-flex cursor-pointer justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
            </svg>
            <span className="sr-only">Next page</span>
          </button>
          <div id="tooltip-next-page" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
            Next page
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>

      {/* Klasör navigasyonu */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line bg-surface-2 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        {([
          { key: "inbox", label: "Gelen Kutusu", count: counts.inbox, badge: counts.inboxUnread },
          { key: "starred", label: "Yıldızlı", count: counts.starred },
          { key: "important", label: "Önemli", count: counts.important },
          { key: "sent", label: "Gönderilenler", count: counts.sent },
          { key: "spam", label: "Spam", count: counts.spam },
          { key: "archive", label: "Arşiv", count: counts.archive },
          { key: "trash", label: "Çöp", count: counts.trash },
        ] as { key: View; label: string; count: number; badge?: number }[]).map((f) => {
          const activeTab = view === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => changeView(f.key)}
              aria-current={activeTab ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors motion-safe:active:scale-[0.97] ${
                activeTab
                  ? "bg-brand text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              {f.label}
              {f.badge ? (
                <span className={`rounded-full px-1.5 text-xs font-semibold ${activeTab ? "bg-white/25 text-white" : "bg-brand/10 text-brand dark:bg-primary-500/20"}`}>
                  {f.badge}
                </span>
              ) : (
                <span className={`text-xs ${activeTab ? "text-white/80" : "text-gray-400"}`}>{f.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm">
              <table className="min-w-full table-fixed divide-y divide-line">
                <tbody className="divide-y divide-line bg-surface dark:divide-gray-700 dark:bg-gray-800">
                  {pageMessages.map((m) => (
                    <tr key={m.id} onClick={() => openMessage(m)} className="tl-stagger cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 motion-safe:active:scale-[0.99]">
                      <td className="w-4 p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center space-x-4">
                          <div>
                            <input id={`checkbox-${m.id}`} aria-label={`${m.name} mesajını seç`} type="checkbox" className="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} />
                            <label htmlFor={`checkbox-${m.id}`} className="sr-only">checkbox</label>
                          </div>
                          <button type="button" onClick={() => toggleStar(m.id)} data-tooltip-target={`tooltip-starred-${m.id}`} aria-pressed={m.starred ?? false} className="inline-flex">
                            <svg className={`h-5 w-5 cursor-pointer transition-colors motion-safe:active:scale-[0.92] ${m.starred ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400 dark:text-gray-400 dark:hover:text-yellow-400"}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={m.starred ? "currentColor" : "none"} viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeWidth="2" d="M11.083 4.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.557 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.029 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 19.8c-.764.446-1.688-.248-1.473-1.106l1.029-4.119a1 1 0 0 0-.337-1.016l-3.33-2.723c-.699-.571-.343-1.702.556-1.771l4.463-.342a1 1 0 0 0 .84-.597l1.752-4.022Z" />
                            </svg>
                            <span className="sr-only">{m.starred ? "Yıldızı kaldır" : "Yıldızla"}</span>
                          </button>
                          <div id={`tooltip-starred-${m.id}`} role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                            {m.starred ? "Starred" : "Not starred"}
                            <div className="tooltip-arrow" data-popper-arrow></div>
                          </div>
                          <button type="button" onClick={() => toggleImportant(m.id)} aria-pressed={m.important ?? false} title={m.important ? "Önemli işaretini kaldır" : "Önemli olarak işaretle"} className="inline-flex">
                            <svg className={`h-5 w-5 transition-colors motion-safe:active:scale-[0.92] ${m.important ? "text-amber-500" : "text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-500"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill={m.important ? "currentColor" : "none"} viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.2 19 4.8-7-4.8-7H3l4.8 7L3 19h13.2Z" />
                            </svg>
                            <span className="sr-only">{m.important ? "Önemli işaretini kaldır" : "Önemli olarak işaretle"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="flex items-center space-x-4 whitespace-nowrap p-4">
                        <div className={`${m.read ? "font-normal text-gray-700 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-white"} text-sm`}>{m.name}</div>
                      </td>
                      <td className={`${m.read ? " font-normal text-gray-500 dark:text-gray-400 " : " font-semibold text-gray-900 dark:text-white "} max-w-sm overflow-hidden truncate p-4 text-sm xl:max-w-screen-md 2xl:max-w-screen-lg`}>
                        {m.text}
                      </td>
                      <td className={`${m.read ? "font-normal text-muted dark:text-gray-400" : "font-medium text-gray-900 dark:text-white"} whitespace-nowrap p-4 text-sm`}>{m.time}</td>
                    </tr>
                  ))}
                  {pageMessages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        {VIEW_EMPTY[view]}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col justify-between lg:flex-row lg:items-center xl:mb-0">
          <div className="order-1 mb-4 w-full sm:w-96 lg:mb-0">
            <div className="mb-1 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-1.5 rounded-full bg-primary-600 dark:bg-primary-500" style={{ width: "45%" }}></div>
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-white">7.2 GB of 15 GB used</div>
          </div>
          <p className="order-3 text-sm text-gray-500 dark:text-gray-400 lg:order-2 xl:flex">Copyright &copy; 2025 <a href="https://flowbite.com/" className="ml-1 hover:underline" target="_blank">Flowbite</a>. All rights reserved.</p>
          <div className="order-2 mb-4 text-sm text-gray-500 dark:text-gray-400 lg:order-3 lg:mb-0 lg:text-right">
            <p>Last account activity: 12 hours ago</p>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.show({ message: "Son hesap etkinliği: 12 saat önce · İstanbul, TR" }); }} className="font-medium text-gray-900 underline hover:no-underline dark:text-white">Details</a>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Compose Modal */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={addSent}
        initialTo={reply?.to}
        initialSubject={reply?.subject}
      />

    </>
  );
}

interface MessageReadProps {
  message: InboxMessage;
  onBack: () => void;
  onReply: () => void;
  onToggleStar: () => void;
  onToggleImportant: () => void;
  onArchive: () => void;
  onSpam: () => void;
  onDelete: () => void;
  isSpam: boolean;
  isTrash: boolean;
}

/** Gmail tarzı tam mesaj okuma görünümü — liste yerine geçer. */
function MessageRead({ message, onBack, onReply, onToggleStar, onToggleImportant, onArchive, onSpam, onDelete, isSpam, isTrash }: MessageReadProps) {
  const toast = useToast();
  const email = deriveEmail(message.name);
  const subject = deriveSubject(message.text);

  return (
    <div className="flex flex-col motion-safe:[animation:tl-fade_var(--dur-modal)_var(--ease-out)]">
      {/* Aksiyon çubuğu */}
      <div className="flex items-center gap-1 border-b border-line bg-surface p-2 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="Gelen kutusuna dön"
          title="Geri"
          className="inline-flex justify-center rounded-lg p-2 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4" />
          </svg>
        </button>
        <div className="mx-1 h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
        <button
          type="button"
          onClick={onArchive}
          aria-label="Arşivle"
          title="Arşivle"
          className="inline-flex justify-center rounded-lg p-2 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M4 4a2 2 0 1 0 0 4h16a2 2 0 1 0 0-4H4Zm0 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm10.7 5.7a1 1 0 0 0-1.4-1.4l-.3.3V12a1 1 0 1 0-2 0v2.6l-.3-.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l2-2Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSpam}
          aria-label={isSpam ? "Spam değil" : "Spam olarak işaretle"}
          title={isSpam ? "Spam değil" : "Spam"}
          className="inline-flex justify-center rounded-lg p-2 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={isTrash ? "Kalıcı sil" : "Sil"}
          title={isTrash ? "Kalıcı sil" : "Sil"}
          className="inline-flex justify-center rounded-lg p-2 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M8.6 2.6A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4c0-.5.2-1 .6-1.4ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onToggleImportant}
          aria-pressed={message.important ?? false}
          aria-label={message.important ? "Önemli işaretini kaldır" : "Önemli olarak işaretle"}
          title={message.important ? "Önemli işaretini kaldır" : "Önemli olarak işaretle"}
          className={`inline-flex justify-center rounded-lg p-2 transition-[transform,background-color] hover:bg-gray-100 motion-safe:active:scale-[0.95] dark:hover:bg-gray-600 ${message.important ? "text-amber-500" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
        >
          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill={message.important ? "currentColor" : "none"} viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.2 19 4.8-7-4.8-7H3l4.8 7L3 19h13.2Z" />
          </svg>
        </button>
      </div>

      {/* Mesaj gövdesi */}
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-normal text-ink">{subject}</h1>
          <button
            type="button"
            onClick={onToggleStar}
            aria-pressed={message.starred ?? false}
            aria-label={message.starred ? "Yıldızı kaldır" : "Yıldızla"}
            title={message.starred ? "Yıldızı kaldır" : "Yıldızla"}
            className="shrink-0 rounded-lg p-1.5 transition-[transform,background-color] hover:bg-gray-100 motion-safe:active:scale-[0.92] dark:hover:bg-gray-700"
          >
            <svg className={`h-5 w-5 ${message.starred ? "text-yellow-400" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill={message.starred ? "currentColor" : "none"} viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M11.083 4.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.557 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.029 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 19.8c-.764.446-1.688-.248-1.473-1.106l1.029-4.119a1 1 0 0 0-.337-1.016l-3.33-2.723c-.699-.571-.343-1.702.556-1.771l4.463-.342a1 1 0 0 0 .84-.597l1.752-4.022Z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials(message.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">
              {message.name} <span className="font-normal text-gray-500 dark:text-gray-400">&lt;{email}&gt;</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">bana</div>
          </div>
          <div className="ms-auto whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{message.time}</div>
        </div>

        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {message.text}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
          <button
            type="button"
            onClick={onReply}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-[transform,background-color] hover:bg-gray-100 motion-safe:active:scale-[0.97] dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11Z" />
            </svg>
            Yanıtla
          </button>
          <button
            type="button"
            onClick={() => toast.show({ message: "İletme penceresi yakında" })}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-[transform,background-color] hover:bg-gray-100 motion-safe:active:scale-[0.97] dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11Z" />
            </svg>
            İlet
          </button>
        </div>
      </div>
    </div>
  );
}
