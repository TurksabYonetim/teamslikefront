import { api } from "@/lib/api";
import type {
  AdminOverview,
  AuditLog,
  AuditLogFilter,
  CreateAuditLogRequest,
  Policy,
  UpsertPolicyRequest,
} from "./admin.types";

export const adminApi = {
  overview: () =>
    api.get<AdminOverview>("/v1/admin/overview").then((r) => r.data),

  listAuditLogs: (filter: AuditLogFilter = {}) =>
    api
      .get<AuditLog[]>("/v1/admin/audit-logs", {
        params: {
          action: filter.action || undefined,
          limit: filter.limit ?? 100,
        },
      })
      .then((r) => r.data),

  createAuditLog: (body: CreateAuditLogRequest) =>
    api.post<AuditLog>("/v1/admin/audit-logs", body).then((r) => r.data),

  listPolicies: () =>
    api.get<Policy[]>("/v1/admin/policies").then((r) => r.data),

  upsertPolicy: (key: string, body: UpsertPolicyRequest) =>
    api
      .put<Policy>(`/v1/admin/policies/${encodeURIComponent(key)}`, body)
      .then((r) => r.data),
};
