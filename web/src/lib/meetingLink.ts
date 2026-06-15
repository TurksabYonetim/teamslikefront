// src/lib/meetingLink.ts
/**
 * Toplantı için public paylaşım linki. Misafir bu linke gelince teamslike
 * lobi → oda akışı açılır (ham Jitsi join_url asla paylaşılmaz).
 *
 * Örn: https://app.turksab.com/j/abc123
 */
export function meetingShareUrl(meetingId: string): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  return `${origin}/j/${meetingId}`;
}
