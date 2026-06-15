import { beforeEach, describe, expect, it } from "vitest";
import { workspaceStore } from "./workspace.store";

beforeEach(() => workspaceStore.getState().reset());

describe("workspaceStore — canvas", () => {
  it("addBlock appends a typed block and editBlock updates content", () => {
    const doc = workspaceStore.getState().docs[0];
    const before = doc.blocks.length;
    workspaceStore.getState().addBlock(doc.id, "text", "hello");
    const after = workspaceStore.getState().docs.find((d) => d.id === doc.id)!;
    expect(after.blocks).toHaveLength(before + 1);
    const newBlock = after.blocks[after.blocks.length - 1];
    expect(newBlock).toMatchObject({ type: "text", content: "hello" });

    workspaceStore.getState().editBlock(doc.id, newBlock.id, "bye");
    expect(workspaceStore.getState().docs.find((d) => d.id === doc.id)!.blocks.at(-1)!.content).toBe("bye");
  });

  it("toggleBlock flips a todo", () => {
    const doc = workspaceStore.getState().docs[0];
    const todo = doc.blocks.find((b) => b.type === "todo")!;
    const before = todo.checked;
    workspaceStore.getState().toggleBlock(doc.id, todo.id);
    const flipped = workspaceStore.getState().docs.find((d) => d.id === doc.id)!.blocks.find((b) => b.id === todo.id)!;
    expect(flipped.checked).toBe(!before);
  });

  it("applyRemoteEdit appends a teammate marker to the first text/heading block", () => {
    const doc = workspaceStore.getState().docs[0];
    workspaceStore.getState().applyRemoteEdit(doc.id);
    const target = workspaceStore.getState().docs.find((d) => d.id === doc.id)!.blocks.find((b) => b.type === "text" || b.type === "heading")!;
    expect(target.content).toContain("(Defne)");
  });
});

describe("workspaceStore — board", () => {
  it("addCard adds to a column and moveCard relocates it", () => {
    const board = workspaceStore.getState().board;
    workspaceStore.getState().addCard("New card", board.columns[0].id);
    const card = workspaceStore.getState().board.cards.at(-1)!;
    expect(card.columnId).toBe(board.columns[0].id);
    workspaceStore.getState().moveCard(card.id, board.columns[1].id);
    expect(workspaceStore.getState().board.cards.find((c) => c.id === card.id)!.columnId).toBe(board.columns[1].id);
  });
});

describe("workspaceStore — workflows", () => {
  it("addWorkflow creates a stepless workflow; runWorkflow logs results", () => {
    workspaceStore.getState().addWorkflow("New flow", "reaction");
    const wf = workspaceStore.getState().workflows.at(-1)!;
    expect(wf).toMatchObject({ name: "New flow", trigger: "reaction" });
    expect(wf.steps).toHaveLength(0);

    const withSteps = workspaceStore.getState().workflows[0];
    workspaceStore.getState().runWorkflow(withSteps.id);
    expect(workspaceStore.getState().lastRun).toHaveLength(withSteps.steps.length);
  });
});

describe("workspaceStore — clips", () => {
  it("addClip prepends a new clip", () => {
    const before = workspaceStore.getState().clips.length;
    workspaceStore.getState().addClip("My clip", "usr_1");
    expect(workspaceStore.getState().clips).toHaveLength(before + 1);
    expect(workspaceStore.getState().clips[0].title).toBe("My clip");
  });

  it("generateAiClip fills summary/chapters/tasks", () => {
    const id = workspaceStore.getState().clips[0].id;
    workspaceStore.getState().generateAiClip(id);
    const c = workspaceStore.getState().clips.find((x) => x.id === id)!;
    expect(c.summary).toBeTruthy();
    expect((c.chapters ?? []).length).toBeGreaterThan(0);
  });

  it("toggleClipReaction adds then removes", () => {
    const id = workspaceStore.getState().clips[1].id; // retro: no reactions
    workspaceStore.getState().toggleClipReaction(id, "🎉");
    expect(workspaceStore.getState().clips.find((c) => c.id === id)!.reactions).toEqual([{ emoji: "🎉", count: 1 }]);
    workspaceStore.getState().toggleClipReaction(id, "🎉");
    expect(workspaceStore.getState().clips.find((c) => c.id === id)!.reactions).toEqual([]);
  });

  it("removeSilence shortens duration by ~10% and flags it", () => {
    const id = workspaceStore.getState().clips[0].id;
    const dur = workspaceStore.getState().clips[0].durationSec;
    workspaceStore.getState().removeSilence(id);
    const c = workspaceStore.getState().clips.find((x) => x.id === id)!;
    expect(c.silenceRemoved).toBe(true);
    expect(c.durationSec).toBe(Math.round(dur * 0.9));
  });

  it("addClipHashtag de-duplicates", () => {
    const id = workspaceStore.getState().clips[0].id;
    workspaceStore.getState().addClipHashtag(id, "launch"); // already present
    const tags = workspaceStore.getState().clips.find((c) => c.id === id)!.hashtags!;
    expect(tags.filter((h) => h === "launch")).toHaveLength(1);
  });
});

describe("workspaceStore — tables", () => {
  it("editCell updates a cell; addTableRow/Column and deletes mutate shape", () => {
    const tid = workspaceStore.getState().activeTableId;
    const table = workspaceStore.getState().tables.find((t) => t.id === tid)!;
    const row = table.rows[0];
    workspaceStore.getState().editCell(tid, row.id, "c_qty", "9");
    expect(workspaceStore.getState().tables.find((t) => t.id === tid)!.rows[0].cells.c_qty).toBe("9");

    const rowCount = table.rows.length;
    workspaceStore.getState().addTableRow(tid);
    expect(workspaceStore.getState().tables.find((t) => t.id === tid)!.rows).toHaveLength(rowCount + 1);

    const colCount = table.columns.length;
    workspaceStore.getState().addTableColumn(tid, "Notes", "text");
    const cols = workspaceStore.getState().tables.find((t) => t.id === tid)!.columns;
    expect(cols).toHaveLength(colCount + 1);
    workspaceStore.getState().deleteTableColumn(tid, cols.at(-1)!.id);
    expect(workspaceStore.getState().tables.find((t) => t.id === tid)!.columns).toHaveLength(colCount);
  });
});

describe("workspaceStore — comments", () => {
  it("addComment prepends and resolveComment marks resolved", () => {
    const doc = workspaceStore.getState().docs[0];
    workspaceStore.getState().addComment(doc.id, doc.blocks[0].id, "usr_1", "Looks good");
    const c = workspaceStore.getState().comments[0];
    expect(c.body).toBe("Looks good");
    workspaceStore.getState().resolveComment(c.id);
    expect(workspaceStore.getState().comments.find((x) => x.id === c.id)!.resolved).toBe(true);
  });
});
