/**
 * Egemenlik / Güvenlik / Admin bounded context'leri (governance konsolu).
 * Federasyon & Interop · Güvenlik & Uyumluluk · Admin Konsolu & Faturalandırma.
 * FastAPI-uyumlu; tehlikeli aksiyonlar (ödeme, izin, hard-delete) yalnızca UI
 * akışıdır — gerçek backend'de açık onayla yürütülür, asla burada değil.
 */
import type { SensitivityLabel } from "./admin.governance";

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  action: string; // ör. "policy.update", "member.invite"
  resource: string;
  at: number; // epoch ms
  meta?: Record<string, string>;
  ip?: string; // denetim IP sütunu (Calendly farklılaştırıcısı)
}

export type PolicyKind =
  | "residency"
  | "retention"
  | "e2ee"
  // Microsoft-Purview-sınıfı governance (Teams paritesi)
  | "dlp" // veri kaybı önleme (hassas içerik egress engelleme)
  | "sensitivity" // hassasiyet etiketleri (public → confidential → restricted)
  | "legalHold" // dava / eDiscovery saklama (değiştirilemez)
  | "infoBarrier" // bilgi bariyerleri (iletişim kuramayan gruplar)
  | "commCompliance" // iletişim uyumluluğu (denetlenen sohbet / işaretli terimler)
  | "conditionalAccess"; // Entra-tarzı koşullu erişim (MFA / riskli oturum)

export interface Policy {
  id: string;
  kind: PolicyKind;
  enabled: boolean;
  config: Record<string, string>;
}

export interface FederationLink {
  id: string;
  protocol: "matrix";
  remote: string;
  bridges: string[];
  connected: boolean;
}

export type Plan = "free" | "pro" | "business" | "enterprise";

export interface BillingAccount {
  plan: Plan;
  status: "active" | "past_due" | "trialing";
  seats: number;
  /** Şeffaf AI faturalandırması: dahil krediler + yayınlanmış kredi-başı maliyet (USD). */
  aiCreditsIncluded: number;
  aiCreditsUsed: number;
  perCreditCost: number;
}

export interface InvoiceLine {
  label: string;
  amount: number;
}

export interface Invoice {
  id: string;
  period: string; // ör. "2026-06"
  lines: InvoiceLine[];
  total: number;
}

export interface Quota {
  key: string;
  limit: number;
  used: number;
}

/**
 * Tipli domain olayları = admin sözleşmesi.
 *  PolicyChanged       → "policy.changed"
 *  BridgeConnected     → "bridge.connected"
 *  AuditEventRecorded  → "audit.recorded"
 *  SubscriptionUpdated → "subscription.updated"
 *  QuotaExceeded       → "quota.exceeded"
 */
export type AdminEvent =
  | { type: "policy.changed"; policyId: string; enabled: boolean }
  | { type: "bridge.connected"; linkId: string }
  | { type: "audit.recorded"; event: AuditEvent }
  | { type: "subscription.updated"; plan: Plan }
  | { type: "quota.exceeded"; key: string };

export type { SensitivityLabel };
