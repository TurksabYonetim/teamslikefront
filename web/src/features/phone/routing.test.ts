import { describe, it, expect } from "vitest";
import {
  normalizeNumber,
  formatNumber,
  evaluateRouting,
  presenceToRouting,
  callerName,
  classifyCaller,
  searchContacts,
  renderTemplate,
} from "./routing";
import type { PhoneContact, RoutingRule } from "./phone.types";

const contacts: PhoneContact[] = [
  { name: "Jordan Blake", e164: "+14155551234" },
  { name: "Dana Wu", e164: "+14155559876" },
];

describe("normalizeNumber", () => {
  it("strips formatting and keeps a leading +", () => {
    expect(normalizeNumber("+1 (415) 555-1234")).toBe("+14155551234");
  });
  it("converts an international 00 prefix to +", () => {
    expect(normalizeNumber("00 90 555 000 0000")).toBe("+905550000000");
  });
  it("leaves a local number without +", () => {
    expect(normalizeNumber("101")).toBe("101");
  });
});

describe("formatNumber", () => {
  it("groups a +1 number nationally", () => {
    expect(formatNumber("+14155551234")).toBe("+1 (415) 555-1234");
  });
  it("leaves non +1 numbers untouched", () => {
    expect(formatNumber("+905550000000")).toBe("+905550000000");
  });
});

describe("evaluateRouting", () => {
  const rules: RoutingRule[] = [
    { id: "r1", lineId: "l1", condition: "always", action: "forward", target: "+1" },
    { id: "r2", lineId: "l1", condition: "afterHours", action: "voicemail" },
  ];
  it("prefers a matching conditional over always", () => {
    expect(evaluateRouting(rules, { afterHours: true })?.id).toBe("r2");
  });
  it("falls back to always", () => {
    expect(evaluateRouting(rules, {})?.id).toBe("r1");
  });
  it("returns null when nothing matches", () => {
    expect(evaluateRouting([rules[1]], {})).toBeNull();
  });
});

describe("presenceToRouting", () => {
  it("forwards when online", () => {
    expect(presenceToRouting("online")).toBe("forward");
  });
  it("voicemails when not online", () => {
    expect(presenceToRouting("away")).toBe("voicemail");
  });
});

describe("callerName", () => {
  it("resolves a known number to its contact name", () => {
    expect(callerName("+14155551234", contacts)).toBe("Jordan Blake");
  });
  it("formats an unknown number", () => {
    expect(callerName("+14155550000", contacts)).toBe("+1 (415) 555-0000");
  });
});

describe("classifyCaller", () => {
  it("flags blocked numbers", () => {
    expect(classifyCaller("+14155551234", { contacts, blocklist: ["+14155551234"] })).toBe("blocked");
  });
  it("trusts contacts", () => {
    expect(classifyCaller("+14155551234", { contacts, blocklist: [] })).toBe("trusted");
  });
  it("marks 5+ repeated digits as spam", () => {
    expect(classifyCaller("+14111111111", { contacts, blocklist: [] })).toBe("spam");
  });
  it("treats other numbers as unknown", () => {
    expect(classifyCaller("+14155550000", { contacts, blocklist: [] })).toBe("unknown");
  });
});

describe("searchContacts", () => {
  it("matches name or number case-insensitively", () => {
    expect(searchContacts(contacts, "dana").map((c) => c.name)).toEqual(["Dana Wu"]);
    expect(searchContacts(contacts, "5512")[0].name).toBe("Jordan Blake");
  });
  it("returns all on empty query", () => {
    expect(searchContacts(contacts, "  ").length).toBe(2);
  });
});

describe("renderTemplate", () => {
  it("substitutes known variables and keeps unknown ones", () => {
    expect(renderTemplate("Hi {{name}}, ref {{id}}", { name: "Dana" })).toBe("Hi Dana, ref {{id}}");
  });
  it("does not resolve inherited prototype keys", () => {
    expect(renderTemplate("{{constructor}}", {})).toBe("{{constructor}}");
  });
});
