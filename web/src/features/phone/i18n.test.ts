import { describe, it, expect } from "vitest";
import tr from "@/i18n/locales/tr/phone.json";
import en from "@/i18n/locales/en/phone.json";

const TAB_IDS = [
  "keypad", "directory", "voicemail", "messages", "reception",
  "queues", "attendant", "ivr", "routing", "analytics",
] as const;

describe("phone i18n", () => {
  it("defines all 10 tab labels in both locales", () => {
    for (const id of TAB_IDS) {
      expect((tr.tabs as Record<string, string>)[id], `tr.tabs.${id}`).toBeTruthy();
      expect((en.tabs as Record<string, string>)[id], `en.tabs.${id}`).toBeTruthy();
    }
  });
  it("has a subtitle and comingSoon in both locales", () => {
    expect(tr.subtitle).toBeTruthy();
    expect(en.subtitle).toBeTruthy();
    expect(tr.comingSoon).toBeTruthy();
    expect(en.comingSoon).toBeTruthy();
  });
  it("defines all ActiveCallBar (bar.*) keys in both locales", () => {
    const BAR_KEYS = [
      "title", "incomingTitle", "onHold", "mute", "unmute", "hold", "resume",
      "record", "stopRecord", "keypad", "transfer", "park", "addCall",
      "accept", "decline", "cancel", "hangup",
    ] as const;
    for (const k of BAR_KEYS) {
      expect((tr.bar as Record<string, string>)[k], `tr.bar.${k}`).toBeTruthy();
      expect((en.bar as Record<string, string>)[k], `en.bar.${k}`).toBeTruthy();
    }
  });

  it("defines voicemail.* keys in both locales", () => {
    const VM_KEYS = [
      "title", "empty", "emptyDescription", "unheard", "markHeard", "heard",
      "transcript", "noTranscript", "greetingTitle", "greetingLabel", "greetingSave", "greetingSaved",
    ] as const;
    for (const k of VM_KEYS) {
      expect((tr.voicemail as Record<string, string>)[k], `tr.voicemail.${k}`).toBeTruthy();
      expect((en.voicemail as Record<string, string>)[k], `en.voicemail.${k}`).toBeTruthy();
    }
  });

  it("defines messages.* keys in both locales", () => {
    const MSG_KEYS = [
      "title", "threads", "empty", "emptyDescription", "selectThread", "composerPlaceholder",
      "send", "template", "schedule", "scheduleTitle", "scheduleAt", "scheduleConfirm",
      "scheduledCount", "attach", "attached", "unread",
    ] as const;
    for (const k of MSG_KEYS) {
      expect((tr.messages as Record<string, string>)[k], `tr.messages.${k}`).toBeTruthy();
      expect((en.messages as Record<string, string>)[k], `en.messages.${k}`).toBeTruthy();
    }
  });

  it("defines PBX tab keys (queues/attendant/ivr/routing) in both locales", () => {
    const GROUPS: Record<string, readonly string[]> = {
      queues: ["title", "empty", "strategy", "estWait", "agents", "available", "unavailable", "idle", "waiting", "noWaiting", "callbackRequested", "assignNext", "requestCallback"],
      attendant: ["title", "empty", "waitingCalls", "noWaiting", "transferTo", "transfer", "selectExtension"],
      ivr: ["title", "greeting", "options", "key", "action", "target", "addOption", "remove", "hours", "openNow", "closedNow"],
      routing: ["title", "rules", "condition", "action", "target", "addRule", "remove", "previewTitle", "winningRule", "noMatch"],
    };
    for (const [group, keys] of Object.entries(GROUPS)) {
      for (const k of keys) {
        expect((tr as unknown as Record<string, Record<string, string>>)[group]?.[k], `tr.${group}.${k}`).toBeTruthy();
        expect((en as unknown as Record<string, Record<string, string>>)[group]?.[k], `en.${group}.${k}`).toBeTruthy();
      }
    }
  });

  it("defines reception/analytics tab keys in both locales", () => {
    const GROUPS: Record<string, readonly string[]> = {
      reception: ["title", "enabled", "disabled", "intents", "label", "phrases", "action", "target", "addIntent", "remove", "capture", "simTitle", "simPlaceholder", "send", "detected", "noMatch", "reset"],
      analytics: ["title", "empty", "emptyDescription", "total", "inbound", "outbound", "missed", "missedRate", "avgHandle", "recorded", "volumeByHour"],
    };
    for (const [group, keys] of Object.entries(GROUPS)) {
      for (const k of keys) {
        expect((tr as unknown as Record<string, Record<string, string>>)[group]?.[k], `tr.${group}.${k}`).toBeTruthy();
        expect((en as unknown as Record<string, Record<string, string>>)[group]?.[k], `en.${group}.${k}`).toBeTruthy();
      }
    }
  });

  it("defines Faz 6 polish keys + enum maps in both locales", () => {
    const FLAT: Record<string, readonly string[]> = {
      wrapUp: ["title", "outcome", "note", "tags", "save", "dismiss"],
      monitor: ["title", "listen", "whisper", "barge", "takeover", "stop", "supervisorHears", "agentHears", "customerHears"],
    };
    for (const [group, keys] of Object.entries(FLAT)) {
      for (const k of keys) {
        expect((tr as unknown as Record<string, Record<string, string>>)[group]?.[k], `tr.${group}.${k}`).toBeTruthy();
        expect((en as unknown as Record<string, Record<string, string>>)[group]?.[k], `en.${group}.${k}`).toBeTruthy();
      }
    }
    expect((tr as unknown as Record<string, Record<string, string>>).bar?.block).toBeTruthy();
    expect((en as unknown as Record<string, Record<string, string>>).bar?.block).toBeTruthy();
    const dig = (obj: unknown, path: string) => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
    const enums = ["strategy.round_robin", "condition.afterHours", "routingAction.voicemail", "ivrAction.queue", "receptionAction.route_queue", "day.1", "outcome.resolved", "callerClass.spam", "monitorMode.whisper"];
    for (const p of enums) {
      expect(dig((tr as unknown as Record<string, unknown>).enums, p), `tr.enums.${p}`).toBeTruthy();
      expect(dig((en as unknown as Record<string, unknown>).enums, p), `en.enums.${p}`).toBeTruthy();
    }
  });

  it("phone-gaps yeni anahtarlarını (consult/parked/directory/bar/analytics) iki dilde tanımlar", () => {
    const GROUPS: Record<string, readonly string[]> = {
      consult: ["title", "start", "targetLabel", "targetPlaceholder", "callTarget", "consulting", "complete", "merge", "cancel"],
      parked: ["title", "count", "pickup", "since"],
      directory: ["favorites", "addFavorite", "removeFavorite"],
      bar: ["holdMusic", "monitor", "stopMonitor", "park"],
      analytics: ["queueSla", "slaTarget", "estWait", "slaOk", "slaBreached"],
    };
    for (const [group, keys] of Object.entries(GROUPS)) {
      for (const k of keys) {
        expect((tr as unknown as Record<string, Record<string, string>>)[group]?.[k], `tr.${group}.${k}`).toBeTruthy();
        expect((en as unknown as Record<string, Record<string, string>>)[group]?.[k], `en.${group}.${k}`).toBeTruthy();
      }
    }
  });

  it("enums.* gruplarının tüm anahtarları en/tr'de tam ve simetrik", () => {
    const EXPECTED: Record<string, readonly string[]> = {
      strategy: ["simultaneous", "round_robin", "longest_idle", "sequential", "rotating", "weighted"],
      condition: ["always", "afterHours", "busy", "noAnswer"],
      routingAction: ["forward", "voicemail", "ivr"],
      ivrAction: ["menu", "queue", "voicemail", "forward", "extension"],
      receptionAction: ["route_queue", "route_extension", "answer_faq", "book", "voicemail", "human"],
      day: ["0", "1", "2", "3", "4", "5", "6"],
      outcome: ["resolved", "follow_up", "no_answer", "sale", "spam"],
      monitorMode: ["listen", "whisper", "barge", "takeover"],
      callerClass: ["trusted", "unknown", "spam", "blocked"],
    };
    const enEnums = (en as unknown as Record<string, Record<string, Record<string, string>>>).enums;
    const trEnums = (tr as unknown as Record<string, Record<string, Record<string, string>>>).enums;
    for (const [group, keys] of Object.entries(EXPECTED)) {
      for (const k of keys) {
        expect(enEnums?.[group]?.[k], `en.enums.${group}.${k}`).toBeTruthy();
        expect(trEnums?.[group]?.[k], `tr.enums.${group}.${k}`).toBeTruthy();
      }
      // simetri: en ve tr aynı anahtar kümesine sahip
      expect(Object.keys(trEnums?.[group] ?? {}).sort(), `enums.${group} key parity`).toEqual(
        Object.keys(enEnums?.[group] ?? {}).sort(),
      );
    }
  });
});
