/** Backend /v1/meetings şemalarına göre tipler. */

export type MeetingStatus = "scheduled" | "ended" | "live" | string;

/** GET /v1/meetings/ ve POST /v1/meetings/ yanıt öğesi. */
export interface ApiMeeting {
  id: string;
  title: string;
  room_name: string;
  join_url: string | null;
  moderator_token: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  status: MeetingStatus;
}

/** POST /v1/meetings/ gövdesi. */
export interface CreateMeetingRequest {
  title: string;
  scheduled_at: string;
  duration_minutes?: number;
}

/** POST /v1/meetings/{id}/guest-token gövdesi. */
export interface GuestTokenRequest {
  guest_name: string;
}

/** POST /v1/meetings/{id}/guest-token yanıtı. */
export interface GuestTokenResponse {
  room_name: string;
  guest_token: string;
  join_url: string;
}

/** localStorage'da saklanan konuşma puanı (backend ucu yok). */
export interface MeetingRating {
  id: string;
  meeting_id?: string;
  stars: number;
  feedback: string;
  created_at: string;
}
