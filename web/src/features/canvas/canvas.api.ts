import { api } from "@/lib/api";
import type {
  CanvasBlock,
  CreateCanvasBlockRequest,
  UpdateCanvasBlockRequest,
} from "./canvas.types";

export const canvasApi = {
  list: () =>
    api.get<CanvasBlock[]>("/v1/canvas/blocks").then((r) => r.data),

  create: (body: CreateCanvasBlockRequest) =>
    api.post<CanvasBlock>("/v1/canvas/blocks", body).then((r) => r.data),

  update: (id: string, body: UpdateCanvasBlockRequest) =>
    api.patch<CanvasBlock>(`/v1/canvas/blocks/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    api.delete<void>(`/v1/canvas/blocks/${id}`).then((r) => r.data),
};
