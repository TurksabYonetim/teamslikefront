import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Modal, useToast } from "@/components/ui";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  /** Gönderildiğinde (To boş değilse) çağrılır — Gönderilenler'e eklemek için. */
  onSend?: (data: { to: string; subject: string; body: string }) => void;
  /** Reply/Forward için ön-doldurma. */
  initialTo?: string;
  initialSubject?: string;
}

/** Boyut menüsü — px etiketi + execCommand fontSize (1-7) eşlemesi. */
const TEXT_SIZES: { px: string; label: string; fontSize: string; cls: string }[] = [
  { px: "16px", label: "16px (Default)", fontSize: "3", cls: "text-base" },
  { px: "12px", label: "12px (Tiny)", fontSize: "1", cls: "text-xs" },
  { px: "14px", label: "14px (Small)", fontSize: "2", cls: "text-sm" },
  { px: "18px", label: "18px (Lead)", fontSize: "4", cls: "text-lg" },
  { px: "24px", label: "24px (Large)", fontSize: "5", cls: "text-2xl" },
  { px: "36px", label: "36px (Huge)", fontSize: "6", cls: "text-4xl" },
];

const COLORS: { hex: string; name: string }[] = [
  { hex: "#1A56DB", name: "Blue" }, { hex: "#0E9F6E", name: "Green" }, { hex: "#FACA15", name: "Yellow" },
  { hex: "#F05252", name: "Red" }, { hex: "#FF8A4C", name: "Orange" }, { hex: "#0694A2", name: "Teal" },
  { hex: "#B4C6FC", name: "Light indigo" }, { hex: "#8DA2FB", name: "Indigo" }, { hex: "#5145CD", name: "Purple" },
  { hex: "#771D1D", name: "Brown" }, { hex: "#FCD9BD", name: "Light orange" }, { hex: "#99154B", name: "Bordo" },
  { hex: "#7E3AF2", name: "Dark Purple" }, { hex: "#CABFFD", name: "Light" }, { hex: "#D61F69", name: "Dark Pink" },
  { hex: "#F8B4D9", name: "Pink" }, { hex: "#F6C196", name: "Cream" }, { hex: "#A4CAFE", name: "Light Blue" },
  { hex: "#B43403", name: "Orange Brown" }, { hex: "#FCE96A", name: "Light Yellow" }, { hex: "#1E429F", name: "Navy Blue" },
  { hex: "#768FFD", name: "Light Purple" }, { hex: "#BCF0DA", name: "Light Green" }, { hex: "#16BDCA", name: "Cyan" },
  { hex: "#E74694", name: "Magenta" }, { hex: "#03543F", name: "Forest Green" }, { hex: "#111928", name: "Black" },
  { hex: "#4B5563", name: "Stone" }, { hex: "#6B7280", name: "Gray" }, { hex: "#D1D5DB", name: "Light Gray" },
];

const FONTS: { family: string; label: string }[] = [
  { family: "Inter, ui-sans-serif", label: "Default" },
  { family: "Arial, sans-serif", label: "Arial" },
  { family: "'Courier New', monospace", label: "Courier New" },
  { family: "Georgia, serif", label: "Georgia" },
  { family: "'Lucida Sans Unicode', sans-serif", label: "Lucida Sans" },
  { family: "Tahoma, sans-serif", label: "Tahoma" },
  { family: "'Times New Roman', serif", label: "Times New Roman" },
  { family: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
  { family: "Verdana, sans-serif", label: "Verdana" },
];

const HEADINGS: { block: string; label: string }[] = [
  { block: "P", label: "Paragraph" },
  { block: "H1", label: "Heading 1" },
  { block: "H2", label: "Heading 2" },
  { block: "H3", label: "Heading 3" },
  { block: "H4", label: "Heading 4" },
  { block: "H5", label: "Heading 5" },
  { block: "H6", label: "Heading 6" },
];

/** Tam işlevsel compose penceresi — zengin metin editörü execCommand ile çalışır. */
export function ComposeModal({ open, onClose, onSend, initialTo, initialSubject }: ComposeModalProps) {
  const toast = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Açılışta alanları ön-doldur / sıfırla. Editör Modal kapanınca DOM'dan
  // kalktığı için her açılışta boş gelir.
  useEffect(() => {
    if (open) {
      setTo(initialTo ?? "");
      setSubject(initialSubject ?? "");
      setOpenMenu(null);
    }
  }, [open, initialTo, initialSubject]);

  // styleWithCSS: foreColor/hiliteColor satır içi CSS üretsin (font tag yerine).
  useEffect(() => {
    if (open) {
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch {
        /* tarayıcı desteklemiyorsa yok say */
      }
    }
  }, [open]);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0);
    }
  }

  function restoreSelection() {
    const sel = window.getSelection();
    const range = savedRange.current;
    if (sel && range) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /** Editöre odak verip komutu uygula. */
  function exec(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }

  /** Native color picker / link gibi odağı kaybeden işlemler için. */
  function execWithRestore(cmd: string, value?: string) {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(cmd, false, value);
  }

  function handleLink() {
    const url = window.prompt("Bağlantı adresi (URL):", "https://");
    if (url) exec("createLink", url);
  }

  function handleImage() {
    const url = window.prompt("Görsel URL'si:");
    if (url) exec("insertImage", url);
  }

  function handleVideo() {
    const url = window.prompt("Video embed URL'si (ör. YouTube embed):");
    if (url) {
      exec(
        "insertHTML",
        `<div class="my-2"><iframe src="${url}" class="aspect-video w-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`,
      );
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (to.trim() === "") {
      toast.show({ message: "Lütfen en az bir alıcı girin", variant: "warning" });
      return;
    }
    const body = editorRef.current?.innerHTML ?? "";
    if (onSend) {
      onSend({ to: to.trim(), subject: subject.trim(), body });
    } else {
      toast.show({ message: "Mesaj gönderildi", variant: "success" });
    }
    onClose();
  }

  const canSend = to.trim() !== "";

  return (
    <Modal open={open} onClose={onClose} title="Compose an email" size="xl">
      <form onSubmit={handleSend}>
        <div className="mb-4 space-y-4">
          <div>
            <label htmlFor="compose-to" className="label">To</label>
            <input
              type="text"
              id="compose-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input"
              placeholder="Add recipients"
            />
          </div>
          <div>
            <label htmlFor="compose-subject" className="label">Subject</label>
            <input
              type="text"
              id="compose-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              placeholder="Type your subject here"
            />
          </div>
          <div>
            <span className="label">Message</span>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              {/* Araç çubuğu */}
              <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-600">
                <div className="flex flex-wrap items-center gap-0.5">
                  <TbBtn title="Kalın" onApply={() => exec("bold")}>
                    <Path d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6" />
                  </TbBtn>
                  <TbBtn title="İtalik" onApply={() => exec("italic")}>
                    <Path d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18" />
                  </TbBtn>
                  <TbBtn title="Altı çizili" onApply={() => exec("underline")}>
                    <Path d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4" />
                  </TbBtn>
                  <TbBtn title="Üstü çizili" onApply={() => exec("strikeThrough")}>
                    <Path d="M7 6.2V5h12v1.2M7 19h6m.2-14-1.677 6.523M9.6 19l1.029-4M5 5l6.523 6.523M19 19l-7.477-7.477" />
                  </TbBtn>
                  <TbBtn title="Vurgu" onApply={() => exec("hiliteColor", "#FACA15")}>
                    <Path d="M9 19.2H5.5c-.3 0-.5-.2-.5-.5V16c0-.2.2-.4.5-.4h13c.3 0 .5.2.5.4v2.7c0 .3-.2.5-.5.5H18m-6-1 1.4 1.8h.2l1.4-1.7m-7-5.4L12 4c0-.1 0-.1 0 0l4 8.8m-6-2.7h4m-7 2.7h2.5m5 0H17" />
                  </TbBtn>
                  <TbBtn title="Kod bloğu" onApply={() => exec("formatBlock", "PRE")}>
                    <Path d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14" />
                  </TbBtn>
                  <TbBtn title="Bağlantı ekle" onApply={handleLink}>
                    <Path d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                  </TbBtn>
                  <TbBtn title="Bağlantıyı kaldır" onApply={() => exec("unlink")}>
                    <Path d="M13.2 9.8a3.4 3.4 0 0 0-4.8 0L5 13.2A3.4 3.4 0 0 0 9.8 18l.3-.3m-.3-4.5a3.4 3.4 0 0 0 4.8 0L18 9.8A3.4 3.4 0 0 0 13.2 5l-1 1m7.4 14-1.8-1.8m0 0L16 16.4m1.8 1.8 1.8-1.8m-1.8 1.8L16 20" />
                  </TbBtn>

                  {/* Boyut menüsü */}
                  <Menu
                    name="size"
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    title="Yazı boyutu"
                    button={<Path d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />}
                    width="w-56"
                  >
                    {TEXT_SIZES.map((s) => (
                      <button
                        key={s.px}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); exec("fontSize", s.fontSize); setOpenMenu(null); }}
                        className={`flex w-full items-center rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 ${s.cls}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </Menu>

                  {/* Renk menüsü */}
                  <Menu
                    name="color"
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    title="Yazı rengi"
                    button={<Path d="m6.532 15.982 1.573-4m-1.573 4h-1.1m1.1 0h1.65m-.077-4 2.725-6.93a.11.11 0 0 1 .204 0l2.725 6.93m-5.654 0H8.1m.006 0h5.654m0 0 .617 1.569m5.11 4.453c0 1.102-.854 1.996-1.908 1.996-1.053 0-1.907-.894-1.907-1.996 0-1.103 1.907-4.128 1.907-4.128s1.909 3.025 1.909 4.128Z" viewBox="0 0 25 24" />}
                    width="w-48"
                  >
                    <div className="mb-2 grid grid-cols-6 gap-1">
                      {COLORS.map((c) => (
                        <button
                          key={c.hex + c.name}
                          type="button"
                          title={c.name}
                          style={{ backgroundColor: c.hex }}
                          onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c.hex); setOpenMenu(null); }}
                          className="h-6 w-6 rounded-md ring-1 ring-inset ring-black/5"
                        >
                          <span className="sr-only">{c.name}</span>
                        </button>
                      ))}
                    </div>
                    <label className="mb-2 flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <input
                        type="color"
                        defaultValue="#e66465"
                        onMouseDown={saveSelection}
                        onChange={(e) => { execWithRestore("foreColor", e.target.value); setOpenMenu(null); }}
                        className="h-8 w-10 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Renk seç</span>
                    </label>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); setOpenMenu(null); }}
                      className="w-full rounded-lg bg-gray-100 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                    >
                      Rengi sıfırla
                    </button>
                  </Menu>

                  {/* Font ailesi menüsü */}
                  <Menu
                    name="font"
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    title="Yazı tipi"
                    button={<Path d="m10.6 19 4.298-10.93a.11.11 0 0 1 .204 0L19.4 19m-8.8 0H9.5m1.1 0h1.65m7.15 0h-1.65m1.65 0h1.1m-7.7-3.985h4.4M3.021 16l1.567-3.985m0 0L7.32 5.07a.11.11 0 0 1 .205 0l2.503 6.945h-5.44Z" />}
                    width="w-52"
                  >
                    {FONTS.map((f) => (
                      <button
                        key={f.family}
                        type="button"
                        style={{ fontFamily: f.family }}
                        onMouseDown={(e) => { e.preventDefault(); exec("fontName", f.family); setOpenMenu(null); }}
                        className="flex w-full items-center rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                      >
                        {f.label}
                      </button>
                    ))}
                  </Menu>

                  <Divider />

                  <TbBtn title="Sola hizala" onApply={() => exec("justifyLeft")}>
                    <Path d="M6 6h8m-8 4h12M6 14h8m-8 4h12" />
                  </TbBtn>
                  <TbBtn title="Ortala" onApply={() => exec("justifyCenter")}>
                    <Path d="M8 6h8M6 10h12M8 14h8M6 18h12" />
                  </TbBtn>
                  <TbBtn title="Sağa hizala" onApply={() => exec("justifyRight")}>
                    <Path d="M18 6h-8m8 4H6m12 4h-8m8 4H6" />
                  </TbBtn>
                </div>

                {/* İkinci satır */}
                <div className="mt-2 flex flex-wrap items-center gap-0.5 border-t border-gray-200 pt-2 dark:border-gray-600">
                  {/* Format / başlık menüsü */}
                  <Menu
                    name="format"
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    title="Biçim"
                    width="w-44"
                    buttonLabel="Format"
                  >
                    {HEADINGS.map((h) => (
                      <button
                        key={h.block}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", h.block); setOpenMenu(null); }}
                        className="flex w-full items-center rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                      >
                        {h.label}
                      </button>
                    ))}
                  </Menu>

                  <Divider />

                  <TbBtn title="Görsel ekle" fill onApply={handleImage}>
                    <path fillRule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z" clipRule="evenodd" />
                  </TbBtn>
                  <TbBtn title="Video ekle" fill onApply={handleVideo}>
                    <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-2 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H9Zm0 2h2v2H9v-2Zm7.965-.557a1 1 0 0 0-1.692-.72l-1.268 1.218a1 1 0 0 0-.308.721v.733a1 1 0 0 0 .37.776l1.267 1.032a1 1 0 0 0 1.631-.776v-2.984Z" clipRule="evenodd" />
                  </TbBtn>
                  <TbBtn title="Madde işaretli liste" onApply={() => exec("insertUnorderedList")}>
                    <Path d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                  </TbBtn>
                  <TbBtn title="Numaralı liste" onApply={() => exec("insertOrderedList")}>
                    <Path d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.321 1.5L4 20h5M4 5l2-1v6m-2 0h4" />
                  </TbBtn>
                  <TbBtn title="Alıntı" fill onApply={() => exec("formatBlock", "BLOCKQUOTE")}>
                    <path fillRule="evenodd" d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z" clipRule="evenodd" />
                  </TbBtn>
                  <TbBtn title="Yatay çizgi" onApply={() => exec("insertHorizontalRule")}>
                    <Path d="M5 12h14" />
                  </TbBtn>
                </div>
              </div>

              {/* Editör */}
              <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline="true"
                  aria-label="Mesaj içeriği"
                  data-placeholder="Mesajınızı buraya yazın…"
                  onBlur={saveSelection}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  className="tl-rte block min-h-[12rem] w-full break-words border-0 bg-white px-0 text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-0 empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] dark:bg-gray-800 dark:text-white dark:empty:before:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-center text-sm font-medium text-white transition-[transform,background-color] hover:bg-primary-800 motion-safe:active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Send message
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-[transform,background-color] hover:bg-gray-100 hover:text-primary-700 motion-safe:active:scale-[0.97] focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---- Yardımcı bileşenler ---- */

/** Stroke ikonu için tek path. */
function Path({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) {
  return (
    <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox={viewBox}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
  );
}

/** Araç çubuğu ikon butonu — onMouseDown ile seçim korunur. */
function TbBtn({ onApply, title, fill, children }: { onApply: () => void; title: string; fill?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => { e.preventDefault(); onApply(); }}
      className="cursor-pointer rounded-sm p-1.5 text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.92] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
    >
      {fill ? (
        <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          {children}
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 block h-5 w-px bg-gray-300 dark:bg-gray-600" />;
}

interface MenuProps {
  name: string;
  openMenu: string | null;
  setOpenMenu: (v: string | null) => void;
  title: string;
  children: ReactNode;
  width: string;
  button?: ReactNode;
  buttonLabel?: string;
}

/** Araç çubuğu açılır menüsü (boyut/renk/font/biçim) — React state ile. */
function Menu({ name, openMenu, setOpenMenu, title, children, width, button, buttonLabel }: MenuProps) {
  const isOpen = openMenu === name;
  return (
    <span className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={isOpen}
        onMouseDown={(e) => { e.preventDefault(); setOpenMenu(isOpen ? null : name); }}
        className={`flex cursor-pointer items-center gap-1 rounded-sm p-1.5 text-sm text-gray-500 transition-[transform,background-color] hover:bg-gray-100 hover:text-gray-900 motion-safe:active:scale-[0.95] dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white ${isOpen ? "bg-gray-100 dark:bg-gray-600" : ""}`}
      >
        {buttonLabel ? <span className="px-1 font-medium">{buttonLabel}</span> : button}
        <svg className="h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute left-0 top-full z-20 mt-1 ${width} space-y-1 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5 motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)] dark:bg-gray-700 dark:ring-white/10`}>
          {children}
        </div>
      )}
    </span>
  );
}
