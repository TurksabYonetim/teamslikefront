// web/src/features/integration.ts
import { useNavigate } from "react-router-dom";
import { intelStore } from "@/features/intelligence/intel.store";
import { messagingStore } from "@/features/messaging/store";
import { ME_ID } from "@/features/messaging/members";

/** Meeting/other surface → open this source in Conversation Intelligence. */
export function useOpenIntelligence() {
  const navigate = useNavigate();
  return (sourceId: string) => {
    intelStore.getState().setSource(sourceId);
    navigate("/intelligence");
  };
}

/** Recap action → post into the product channel as a chat message. */
export function useSendActionToChat() {
  return (text: string) => messagingStore.getState().postExternal("ch_product", "tp_product", "✅ " + text, ME_ID);
}
