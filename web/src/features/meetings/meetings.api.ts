import { api } from "@/lib/api";
import type {
  ApiMeeting,
  CreateMeetingRequest,
  GuestTokenRequest,
  GuestTokenResponse,
} from "./meetings.types";

/** auth.api.ts deseni: ince axios sarmalayıcı, `.data` döner. */
export const meetingsApi = {
  list: () => api.get<ApiMeeting[]>("/v1/meetings/").then((r) => r.data),

  create: (body: CreateMeetingRequest) =>
    api.post<ApiMeeting>("/v1/meetings/", body).then((r) => r.data),

  guestToken: (meetingId: string, body: GuestTokenRequest) =>
    api
      .post<GuestTokenResponse>(`/v1/meetings/${meetingId}/guest-token`, body)
      .then((r) => r.data),
};
