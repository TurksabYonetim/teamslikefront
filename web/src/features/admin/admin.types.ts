/** Admin (denetim günlüğü + güvenlik politikaları) API tipleri — /v1/admin sözleşmesi. */

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  target: string;
  ip: string | null;
  created_at: string;
}

export interface CreateAuditLogRequest {
  action: string;
  target?: string;
  ip?: string | null;
}

export interface Policy {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface UpsertPolicyRequest {
  value: string;
}

export interface AdminOverview {
  audit_log_count: number;
  policy_count: number;
  last_audit_at: string | null;
}

export interface AuditLogFilter {
  action?: string;
  limit?: number;
}
