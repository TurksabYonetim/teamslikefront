import { describe, it, expect } from "vitest";
import {
  digitsOnly,
  matchContact,
  nameForNumber,
  dateGroupKey,
  filterContacts,
} from "./phone.utils";
import type { Contact } from "./phone.types";

function contact(p: Partial<Contact>): Contact {
  return {
    id: "x",
    name: "",
    number: "",
    email: null,
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    ...p,
  } as Contact;
}

describe("digitsOnly", () => {
  it("yalnız rakam bırakır", () => {
    expect(digitsOnly("+90 (555) 123-45 67")).toBe("905551234567");
    expect(digitsOnly("")).toBe("");
  });
});

describe("matchContact / nameForNumber", () => {
  const contacts = [
    contact({ id: "a", name: "Ali", number: "0555 123 45 67" }),
    contact({ id: "b", name: "Veli", number: "+90 532 000 11 22" }),
  ];
  it("son 7 hane ile eşleştirir (ülke kodu toleranslı)", () => {
    expect(matchContact("+90 555 123 45 67", contacts)?.id).toBe("a");
    expect(nameForNumber("5320001122", contacts)).toBe("Veli");
  });
  it("eşleşme yoksa undefined", () => {
    expect(matchContact("999", contacts)).toBeUndefined();
    expect(nameForNumber("0000000", contacts)).toBeUndefined();
  });
});

describe("dateGroupKey", () => {
  const now = new Date(2026, 5, 8, 12, 0, 0); // 8 Haziran 2026 öğlen
  it("bugün/dün/bu hafta/daha eski ayırır", () => {
    expect(dateGroupKey(new Date(2026, 5, 8, 9, 0), now)).toBe("today");
    expect(dateGroupKey(new Date(2026, 5, 7, 23, 0), now)).toBe("yesterday");
    expect(dateGroupKey(new Date(2026, 5, 3, 0, 0), now)).toBe("thisWeek");
    expect(dateGroupKey(new Date(2026, 4, 1, 0, 0), now)).toBe("older");
  });
});

describe("filterContacts", () => {
  const contacts = [
    contact({ id: "a", name: "Ali Veli", number: "5551234567", email: "ali@x.com" }),
    contact({ id: "b", name: "Ayşe", number: "5320001122" }),
  ];
  it("ad/numara/e-postada arar", () => {
    expect(filterContacts(contacts, "veli").map((c) => c.id)).toEqual(["a"]);
    expect(filterContacts(contacts, "532").map((c) => c.id)).toEqual(["b"]);
    expect(filterContacts(contacts, "ali@x").map((c) => c.id)).toEqual(["a"]);
  });
  it("boş sorgu hepsini döndürür", () => {
    expect(filterContacts(contacts, "").length).toBe(2);
  });
});
