import { api } from "@/lib/api";

/**
 * Gösterge paneli, mevcut liste uçlarını birleştirerek özet üretir.
 * Ayrı bir "dashboard" backend ucu yoktur; aşağıdaki GET uçları okunur:
 *   GET /v1/users/          → ekip
 *   GET /v1/appointments/   → randevular
 *   GET /v1/meetings/       → toplantılar
 *   GET /v1/conversations/  → konuşmalar (inbox)
 */

export interface DashUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DashAppointment {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  attendee_emails: string[];
  meeting_id: string | null;
  status: string;
}

export interface DashMeeting {
  id: string;
  title: string;
  room_name: string;
  join_url: string | null;
  moderator_token: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  status: string;
}

export interface DashConversation {
  id: string;
  chatwoot_conversation_id: number | null;
  contact_name: string;
  contact_email: string | null;
  inbox_id: number | null;
  status: string;
}

export const dashboardApi = {
  users: () => api.get<DashUser[]>("/v1/users/").then((r) => r.data),
  appointments: () =>
    api.get<DashAppointment[]>("/v1/appointments/").then((r) => r.data),
  meetings: () => api.get<DashMeeting[]>("/v1/meetings/").then((r) => r.data),
  conversations: () =>
    api.get<DashConversation[]>("/v1/conversations/").then((r) => r.data),
};
