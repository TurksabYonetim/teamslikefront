/**
 * Governance konsolu mock store — bağımlılıksız `createStore` (zustand-benzeri)
 * üzerine kurulu. Durum localStorage'da kalıcıdır; backend yoktur. Tehlikeli
 * aksiyonlar (plan yükseltme, politika değişimi) yalnızca UI akışıdır.
 */
import { createStore, useStore } from "@/lib/createStore";
import {
  AUDIT_EVENTS,
  BILLING,
  FEDERATION,
  INVOICES,
  POLICIES,
  QUOTAS,
} from "./governance.data";
import type {
  AdminEvent,
  AuditEvent,
  BillingAccount,
  FederationLink,
  Invoice,
  Plan,
  Policy,
  Quota,
} from "./governance.types";

const STORAGE_KEY = "tl.admin.governance.v1";

let seq = 0;
const aid = () => `au_${Date.now()}_${seq++}`;

const cloneAudit = (): AuditEvent[] => AUDIT_EVENTS.map((e) => ({ ...e }));
const clonePolicies = (): Policy[] => POLICIES.map((p) => ({ ...p, config: { ...p.config } }));
const cloneFed = (): FederationLink[] => FEDERATION.map((f) => ({ ...f, bridges: [...f.bridges] }));
const cloneInvoices = (): Invoice[] =>
  INVOICES.map((i) => ({ ...i, lines: i.lines.map((l) => ({ ...l })) }));
const cloneQuotas = (): Quota[] => QUOTAS.map((q) => ({ ...q }));

interface PersistShape {
  audit: AuditEvent[];
  policies: Policy[];
  federation: FederationLink[];
  billing: BillingAccount;
  invoices: Invoice[];
  quotas: Quota[];
}

function defaults(): PersistShape {
  return {
    audit: cloneAudit(),
    policies: clonePolicies(),
    federation: cloneFed(),
    billing: { ...BILLING },
    invoices: cloneInvoices(),
    quotas: cloneQuotas(),
  };
}

function load(): PersistShape {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<PersistShape>;
    const d = defaults();
    return {
      audit: Array.isArray(parsed.audit) ? parsed.audit : d.audit,
      policies: Array.isArray(parsed.policies) ? parsed.policies : d.policies,
      federation: Array.isArray(parsed.federation) ? parsed.federation : d.federation,
      billing: parsed.billing ?? d.billing,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : d.invoices,
      quotas: Array.isArray(parsed.quotas) ? parsed.quotas : d.quotas,
    };
  } catch {
    return defaults();
  }
}

function persist(s: PersistShape): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        audit: s.audit,
        policies: s.policies,
        federation: s.federation,
        billing: s.billing,
        invoices: s.invoices,
        quotas: s.quotas,
      }),
    );
  } catch {
    /* kota dolu / private mode — sessizce yoksay */
  }
}

export interface AdminState extends PersistShape {
  recordAudit: (action: string, resource: string, actorId: string) => void;
  togglePolicy: (id: string) => void;
  setPolicyConfig: (id: string, key: string, value: string) => void;
  addBridge: (linkId: string, bridge: string) => void;
  /** Yalnızca UI akışı — burada gerçek ödeme alınmaz. */
  upgradePlan: (plan: Plan) => void;
  applyEvent: (evt: AdminEvent) => void;
  reset: () => void;
}

export const adminStore = createStore<AdminState>((set, get) => {
  const initial = load();

  /** State'i güncelle ve kalıcı kıl. */
  const commit = (partial: Partial<PersistShape>) =>
    set((s) => {
      const next = { ...s, ...partial };
      persist(next);
      return partial;
    });

  return {
    ...initial,

    recordAudit: (action, resource, actorId) => {
      const event: AuditEvent = {
        id: aid(),
        tenantId: "t1",
        actorId,
        action,
        resource,
        at: Date.now(),
      };
      commit({ audit: [event, ...get().audit] });
    },

    togglePolicy: (id) => {
      commit({
        policies: get().policies.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p,
        ),
      });
      get().recordAudit("policy.update", id, "usr_1");
    },

    setPolicyConfig: (id, key, value) => {
      commit({
        policies: get().policies.map((p) =>
          p.id === id ? { ...p, config: { ...p.config, [key]: value } } : p,
        ),
      });
    },

    addBridge: (linkId, bridge) => {
      commit({
        federation: get().federation.map((f) =>
          f.id === linkId && !f.bridges.includes(bridge)
            ? { ...f, bridges: [...f.bridges, bridge] }
            : f,
        ),
      });
      get().recordAudit("federation.bridge", bridge, "usr_1");
    },

    upgradePlan: (plan) => {
      commit({ billing: { ...get().billing, plan } });
      get().recordAudit("subscription.update", plan, "usr_1");
    },

    applyEvent: (evt) => {
      const s = get();
      switch (evt.type) {
        case "policy.changed":
          commit({
            policies: s.policies.map((p) =>
              p.id === evt.policyId ? { ...p, enabled: evt.enabled } : p,
            ),
          });
          break;
        case "audit.recorded":
          if (!s.audit.some((a) => a.id === evt.event.id)) {
            commit({ audit: [evt.event, ...s.audit] });
          }
          break;
        case "subscription.updated":
          commit({ billing: { ...s.billing, plan: evt.plan } });
          break;
        default:
          break;
      }
    },

    reset: () => commit(defaults()),
  };
});

/** React bağlama: governance store'undan bir dilim seç. */
export function useAdminStore<U>(selector: (s: AdminState) => U): U {
  return useStore(adminStore, selector);
}
