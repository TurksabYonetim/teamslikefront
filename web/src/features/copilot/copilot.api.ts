import { api } from "@/lib/api";
import type {
  CopilotConversation,
  CopilotMessage,
  CreateConversationRequest,
  PostMessageRequest,
  PostMessageResponse,
} from "./copilot.types";

export const copilotApi = {
  listConversations: () =>
    api
      .get<CopilotConversation[]>("/v1/copilot/conversations")
      .then((r) => r.data),

  createConversation: (body: CreateConversationRequest = {}) =>
    api
      .post<CopilotConversation>("/v1/copilot/conversations", body)
      .then((r) => r.data),

  deleteConversation: (id: string) =>
    api
      .delete<void>(`/v1/copilot/conversations/${id}`)
      .then((r) => r.data),

  listMessages: (conversationId: string) =>
    api
      .get<CopilotMessage[]>(
        `/v1/copilot/conversations/${conversationId}/messages`,
      )
      .then((r) => r.data),

  postMessage: (conversationId: string, body: PostMessageRequest) =>
    api
      .post<PostMessageResponse>(
        `/v1/copilot/conversations/${conversationId}/messages`,
        body,
      )
      .then((r) => r.data),
};
