import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Avatar, Button, Select, useToast } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { commentsForDoc } from "../workspace.workhub";
import { memberName, SELF_ID } from "../workspace.data";

/**
 * Satır içi doc yorumları + presence + simüle eş zamanlı düzenleme. "Takım
 * arkadaşı düzenlemesini simüle et" butonu CRDT/OT eş stand-in'idir: canlı
 * dokümana birleşen uzak bir düzenleme uygular.
 */
export function CommentSidebar() {
  const { t } = useTranslation("docs");
  const toast = useToast();
  const docs = useStore(workspaceStore, (s) => s.docs);
  const activeDocId = useStore(workspaceStore, (s) => s.activeDocId);
  const comments = useStore(workspaceStore, (s) => s.comments);
  const { addComment, resolveComment, applyRemoteEdit } = workspaceStore.getState();

  const doc = docs.find((d) => d.id === activeDocId);
  const docComments = commentsForDoc(comments, activeDocId);
  const blocks = (doc?.blocks ?? []).filter((b) => b.type !== "divider");
  const snippet = (bid: string) => blocks.find((b) => b.id === bid)?.content?.slice(0, 40) || "—";

  const [blockId, setBlockId] = useState("");
  const [body, setBody] = useState("");

  const post = () => {
    const target = blockId || blocks[0]?.id;
    if (!target || !body.trim()) return;
    addComment(activeDocId, target, SELF_ID, body.trim());
    setBody("");
  };

  return (
    <div className="card min-w-0 p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="comment" className="h-4 w-4 shrink-0" /> <span className="truncate">{t("comments.title")}</span>
        </h3>
        <div className="ml-auto flex shrink-0 -space-x-2" aria-label={t("comments.viewing")}>
          {["usr_1", "usr_2", "usr_3"].map((id) => (
            <Avatar key={id} name={memberName(id)} size="xs" className="ring-2 ring-surface" />
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="mb-3 w-full"
        onClick={() => {
          applyRemoteEdit(activeDocId);
          toast.show({ message: t("comments.remoteEdit") });
        }}
      >
        <Icon name="usersThree" className="h-4 w-4" /> {t("comments.simulate")}
      </Button>

      <ul className="tl-stagger space-y-2">
        {docComments.length === 0 ? <li className="text-sm text-muted">{t("comments.empty")}</li> : null}
        {docComments.map((c) => (
          <li
            key={c.id}
            className={
              "min-w-0 rounded-lg bg-surface-2 p-3 transition-opacity duration-200 ease-[var(--ease-out)] motion-reduce:transition-none " +
              (c.resolved ? "opacity-60" : "")
            }
          >
            <div className="flex items-center gap-2">
              <Avatar name={memberName(c.authorId)} size="xs" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{memberName(c.authorId)}</span>
              {c.resolved ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  <Icon name="check" className="h-3 w-3 shrink-0" /> {t("comments.resolved")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => resolveComment(c.id)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-softer px-2 py-0.5 text-xs font-medium text-blue-800 transition-[background-color,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-brand-soft motion-safe:active:scale-[0.97] motion-reduce:transition-none"
                >
                  <Icon name="check" className="h-3.5 w-3.5 shrink-0" /> {t("comments.resolve")}
                </button>
              )}
            </div>
            <p className={"mt-1 text-sm " + (c.resolved ? "text-muted line-through" : "text-ink")}>{c.body}</p>
            <p className="truncate text-xs text-muted">↳ {snippet(c.blockId)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-line pt-2">
        <Select
          value={blockId}
          onChange={setBlockId}
          aria-label={t("comments.anchor")}
          options={[
            { value: "", label: `${t("comments.anchor")}…` },
            ...blocks.map((b) => ({
              value: b.id,
              label: b.content.slice(0, 30) || b.type,
            })),
          ]}
          className="mb-2 w-full"
        />

        {/* Composer — alt aksiyon-barlı yığın alan (V2). */}
        <div className="rounded-xl border border-line bg-surface-2 transition-colors focus-within:border-brand focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand-soft motion-reduce:transition-none">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") post();
            }}
            placeholder={t("comments.placeholder")}
            aria-label={t("comments.placeholder")}
            className="w-full resize-none border-0 bg-transparent px-3 pb-1 pt-2.5 text-sm text-ink outline-none placeholder:text-muted"
          />
          <div className="flex items-center gap-2 px-3 pb-2">
            <span className="text-xs text-muted">⌘↵ ile gönder</span>
            <Button size="sm" className="ml-auto" disabled={!body.trim()} onClick={post} aria-label={t("comments.post")}>
              <Icon name="send" className="h-3.5 w-3.5" /> {t("comments.post")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
