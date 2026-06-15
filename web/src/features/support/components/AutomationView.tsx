// web/src/features/support/components/AutomationView.tsx
import { ChannelsPanel } from "./ChannelsPanel";
import { FlowBuilder } from "./FlowBuilder";
import { CostPanel } from "./CostPanel";

/** Otomasyon yüzeyi: kanal onboarding, no-code bot akışları, mesajlaşma maliyeti. */
export function AutomationView() {
  return (
    <div className="tl-stagger mx-auto w-full max-w-4xl flex-1 space-y-4 overflow-y-auto pb-4">
      <ChannelsPanel />
      <FlowBuilder />
      <CostPanel />
    </div>
  );
}
