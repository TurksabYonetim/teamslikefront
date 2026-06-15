import { useState } from "react";
import { Dialer } from "./Dialer";
import { CallHistory } from "./CallHistory";
import { useCall } from "./callStore";
import { useCallLogs, useContacts } from "./phone.hooks";

/** Demo amaçlı simüle edilen gelen arayan (eski PhonePage'ten taşındı). */
const SIMULATED_CALLER = { name: "Robert Brown", number: "+14155557890" };

/**
 * keypad sekmesi: tuş takımı + gerçek API arama geçmişi. Dial numarası yerel
 * state'tir; arama callStore.place ile başlatılır (global ActiveCallBar devralır).
 */
export function KeypadPanel() {
  const [number, setNumber] = useState("");
  const { data: history, isLoading, isError } = useCallLogs();
  const { data: contacts } = useContacts();
  const place = useCall((s) => s.place);
  const simulateInbound = useCall((s) => s.simulateInbound);

  const logs = history ?? [];

  const callNumber = (num: string, name?: string) => {
    if (!num) return;
    place(num, name);
    setNumber("");
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-4 lg:flex-row lg:items-start">
      <div className="w-full lg:max-w-sm">
        <Dialer
          number={number}
          onDigit={(d) => setNumber((n) => n + d)}
          onBackspace={() => setNumber((n) => n.slice(0, -1))}
          onCall={() => callNumber(number)}
          onSimulateIncoming={() =>
            simulateInbound(SIMULATED_CALLER.number, SIMULATED_CALLER.name)
          }
          history={logs}
          onCallBack={callNumber}
        />
      </div>

      <div className="w-full flex-1">
        <CallHistory
          history={logs}
          loading={isLoading}
          error={isError}
          contacts={contacts ?? []}
          onCallBack={callNumber}
        />
      </div>
    </div>
  );
}
