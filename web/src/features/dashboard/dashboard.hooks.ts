import { useQueries } from "@tanstack/react-query";
import { dashboardApi } from "./dashboard.api";
import type {
  DashUser,
  DashAppointment,
  DashMeeting,
  DashConversation,
} from "./dashboard.api";

const STALE = 60_000;

/** Ham listeler (her biri ayrı query). */
export function useDashboardData() {
  const results = useQueries({
    queries: [
      { queryKey: ["dashboard", "users"], queryFn: dashboardApi.users, staleTime: STALE },
      { queryKey: ["dashboard", "appointments"], queryFn: dashboardApi.appointments, staleTime: STALE },
      { queryKey: ["dashboard", "meetings"], queryFn: dashboardApi.meetings, staleTime: STALE },
      { queryKey: ["dashboard", "conversations"], queryFn: dashboardApi.conversations, staleTime: STALE },
    ],
  });

  const [usersQ, apptsQ, meetingsQ, convosQ] = results;

  return {
    users: (usersQ.data ?? []) as DashUser[],
    appointments: (apptsQ.data ?? []) as DashAppointment[],
    meetings: (meetingsQ.data ?? []) as DashMeeting[],
    conversations: (convosQ.data ?? []) as DashConversation[],
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetch: () => {
      results.forEach((r) => {
        void r.refetch();
      });
    },
  };
}
