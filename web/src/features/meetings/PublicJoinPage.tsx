// src/features/meetings/PublicJoinPage.tsx
import { useParams, Navigate } from "react-router-dom";
import { MeetingLobbyPage } from "./MeetingLobbyPage";

/**
 * Public paylaşım rotası: /j/:meetingId
 * Misafir bu linke gelince teamslike lobisi açılır (ham Jitsi sayfası DEĞİL).
 * Lobi "Katılmak için iste" → guest-token → /room akışını sürdürür.
 */
export function PublicJoinPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  if (!meetingId) return <Navigate to="/" replace />;
  return <MeetingLobbyPage meetingId={meetingId} />;
}
