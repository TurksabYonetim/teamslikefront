import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Avatar, Button, useToast } from "@/components/ui";
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
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="comment" className="h-4 w-4" /> {t("comments.title")}
        </h3>
        <div className="ml-auto flex -space-x-2" aria-label={t("comments.viewing")}>
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
              "rounded-lg border border-line p-2 transition-opacity duration-200 ease-[var(--ease-out)] motion-reduce:transition-none " +
              (c.resolved ? "opacity-60" : "")
            }
          >
            <div className="flex items-center gap-2">
              <Avatar name={memberName(c.authorId)} size="xs" />
              <span className="text-sm font-medium text-ink">{memberName(c.authorId)}</span>
              {c.resolved ? (
                <span className="ml-auto text-xs text-ok">{t("comments.resolved")}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => resolveComment(c.id)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-brand transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:underline motion-safe:active:scale-[0.97]"
                >
                  <Icon name="check" className="h-3.5 w-3.5" /> {t("comments.resolve")}
                </button>
              )}
            </div>
            <p className={"mt-1 text-sm " + (c.resolved ? "text-muted line-through" : "text-ink")}>{c.body}</p>
            <p className="text-xs text-muted">↳ {snippet(c.blockId)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-line pt-2">
        <select
          value={blockId}
          onChange={(e) => setBlockId(e.target.value)}
          aria-label={t("comments.anchor")}
          className="mb-1 h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink"
        >
          <option value="">{t("comments.anchor")}…</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.content.slice(0, 30) || b.type}
            </option>
          ))}
        </select>
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("comments.placeholder")}
            aria-label={t("comments.placeholder")}
            className="input min-h-[2.5rem] flex-1 resize-none"
          />
          <Button disabled={!body.trim()} onClick={post} aria-label={t("comments.post")}>
            <Icon name="send" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
