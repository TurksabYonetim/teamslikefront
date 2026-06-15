import { createMockStore, mockId, nowIso } from "@/lib/mockStore";
import type { Clip, CreateClipRequest, UpdateClipRequest } from "./clips.types";

/**
 * Frontend-only: klipler localStorage'da tutulur (backend'de /v1/clips yok).
 * list/create/update/remove imzası gerçek API ile birebir aynı.
 */
const seed = (): Clip[] => {
  const base = nowIso();
  const rows: Omit<Clip, "id" | "created_at">[] = [
    { title: "Ürün tanıtımı", description: "60 saniyelik hızlı bakış.", video_url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail_url: null, duration_s: 60 },
    { title: "Sprint demo", description: "Bu haftanın öne çıkanları.", video_url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnail_url: null, duration_s: 145 },
  ];
  return rows.map((r) => ({ ...r, id: mockId(), created_at: base }));
};

const store = createMockStore<Clip, CreateClipRequest, UpdateClipRequest>({
  key: "clips",
  seed,
  build: (body) => ({
    id: mockId(),
    title: body.title,
    description: body.description ?? "",
    video_url: body.video_url,
    thumbnail_url: body.thumbnail_url ?? null,
    duration_s: body.duration_s ?? null,
    created_at: nowIso(),
  }),
  merge: (current, body) => ({ ...current, ...body }),
});

export const clipsApi = {
  list: () => store.list(),
  create: (body: CreateClipRequest) => store.create(body),
  update: (id: string, body: UpdateClipRequest) => store.update(id, body),
  remove: (id: string) => store.remove(id),
};
