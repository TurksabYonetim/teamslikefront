import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tokenStore } from "@/lib/token";
import { meetingsApi } from "./meetings.api";
import type {
  ApiMeeting,
  CreateMeetingRequest,
  GuestTokenRequest,
} from "./meetings.types";

const LIST_KEY = ["meetings", "list"] as const;

/** GET /v1/meetings/ — toplantı listesi (token varsa). */
export function useMeetings() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => meetingsApi.list(),
    enabled: !!tokenStore.get(),
    staleTime: 30_000,
  });
}

/** POST /v1/meetings/ — oluşturur, başarıda listeyi tazeler. */
export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMeetingRequest) => meetingsApi.create(body),
    onSuccess: (created) => {
      // Optimistik: yeni kaydı listenin başına ekle, sonra invalidate et.
      qc.setQueryData<ApiMeeting[]>(LIST_KEY, (prev) =>
        prev ? [created, ...prev] : [created],
      );
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/** POST /v1/meetings/{id}/guest-token — misafir join URL'i üretir. */
export function useGuestToken() {
  return useMutation({
    mutationFn: ({
      meetingId,
      body,
    }: {
      meetingId: string;
      body: GuestTokenRequest;
    }) => meetingsApi.guestToken(meetingId, body),
  });
}
