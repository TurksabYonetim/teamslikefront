/** Copilot (AI chat) API tipleri — /v1/copilot sözleşmesine göre. */

export type CopilotRole = "user" | "assistant";

export interface CopilotConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CopilotMessage {
  id: string;
  conversation_id: string;
  role: CopilotRole;
  content: string;
  created_at: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface PostMessageRequest {
  content: string;
}

export interface PostMessageResponse {
  user_message: CopilotMessage;
  assistant_message: CopilotMessage;
}
