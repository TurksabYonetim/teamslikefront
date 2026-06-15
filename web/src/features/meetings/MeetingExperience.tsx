import { useInitFlowbite } from "@/lib/flowbite";
import { useCan } from "@/lib/authStore";
import { Forbidden } from "@/components/ui";
import { useMeeting } from "./meetings.store";
import { MeetingRoom } from "./components/MeetingRoom";
import { MeetingsLanding } from "./components/MeetingsLanding";
import { PreJoin } from "./components/PreJoin";

export function MeetingExperience() {
  useInitFlowbite();
  const canView = useCan("meetings.view");
  const phase = useMeeting((s) => s.phase);

  if (!canView) return <Forbidden />;

  if (phase === "idle") {
    return (
      <div data-testid="meeting-landing">
        <MeetingsLanding />
      </div>
    );
  }
  if (phase === "prejoin") {
    return (
      <div
        data-testid="meeting-prejoin"
        data-theme="dark"
        className="h-[calc(100vh-4rem)] bg-gray-900"
      >
        <PreJoin />
      </div>
    );
  }
  // phase === "in"
  return (
    <div data-testid="meeting-room" className="h-[calc(100vh-4rem)]">
      <MeetingRoom />
    </div>
  );
}
