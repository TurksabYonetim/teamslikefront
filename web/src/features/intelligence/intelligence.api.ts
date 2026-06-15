import { api } from "@/lib/api";
import type {
  CreateTranscriptRequest,
  Transcript,
  UpdateTranscriptRequest,
} from "./intelligence.types";

export const intelligenceApi = {
  list: () =>
    api.get<Transcript[]>("/v1/transcripts/").then((r) => r.data),

  create: (body: CreateTranscriptRequest) =>
    api.post<Transcript>("/v1/transcripts/", body).then((r) => r.data),

  update: (id: string, body: UpdateTranscriptRequest) =>
    api.patch<Transcript>(`/v1/transcripts/${id}`, body).then((r) => r.data),

  remove: (id: string) =>
    api.delete<void>(`/v1/transcripts/${id}`).then((r) => r.data),
};
