import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./admin.api";
import type {
  AuditLogFilter,
  CreateAuditLogRequest,
  UpsertPolicyRequest,
} from "./admin.types";

const OVERVIEW_KEY = ["admin", "overview"] as const;
const POLICIES_KEY = ["admin", "policies"] as const;
const auditKey = (filter: AuditLogFilter) =>
  ["admin", "audit-logs", filter.action ?? "", filter.limit ?? 100] as const;

/** Genel bakış kartları (sayımlar + son denetim zamanı). */
export function useAdminOverview() {
  return useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: () => adminApi.overview(),
    staleTime: 30_000,
  });
}

/** Denetim günlüklerini (opsiyonel action filtresi + limit) getirir. */
export function useAuditLogs(filter: AuditLogFilter) {
  return useQuery({
    queryKey: auditKey(filter),
    queryFn: () => adminApi.listAuditLogs(filter),
    staleTime: 15_000,
  });
}

/** Yeni denetim kaydı oluşturur; başarıda günlük + genel bakış tazelenir. */
export function useCreateAuditLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAuditLogRequest) => adminApi.createAuditLog(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      qc.invalidateQueries({ queryKey: OVERVIEW_KEY });
    },
  });
}

/** Güvenlik politikalarını getirir. */
export function usePolicies() {
  return useQuery({
    queryKey: POLICIES_KEY,
    queryFn: () => adminApi.listPolicies(),
    staleTime: 30_000,
  });
}

/** Politika upsert (PUT key/value); başarıda politika + genel bakış tazelenir. */
export function useUpsertPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { key: string; body: UpsertPolicyRequest }) =>
      adminApi.upsertPolicy(args.key, args.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POLICIES_KEY });
      qc.invalidateQueries({ queryKey: OVERVIEW_KEY });
    },
  });
}
