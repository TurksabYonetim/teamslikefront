// web/src/lib/permissions.ts
// Frontend-only izin kataloğu. Backend RBAC geldiğinde bu eşleme gerçek
// rol/yetki şemasıyla değiştirilir. Şimdilik rol→yetki haritası deterministik.
import type { UserRole } from "@/features/auth/auth.types";

/** Uygulamadaki tüm korunabilir yetkiler. `<tab>.view` = sekmeye erişim. */
export type Permission =
  | "messaging.view"
  | "meetings.view"
  | "telephony.view"
  | "webinar.view"
  | "support.view"
  | "scheduling.view"
  | "docs.view"
  | "intelligence.view"
  | "canvas.view"
  | "admin.view"
  | "admin.access"
  | "dashboard.view"
  | "settings.view";

export const ALL_PERMISSIONS: Permission[] = [
  "messaging.view",
  "meetings.view",
  "telephony.view",
  "webinar.view",
  "support.view",
  "scheduling.view",
  "docs.view",
  "intelligence.view",
  "canvas.view",
  "admin.view",
  "admin.access",
  "dashboard.view",
  "settings.view",
];

/** Yönetim dışı her şeyi gören standart üye yetkileri. */
const MEMBER_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  (p) => p !== "admin.view" && p !== "admin.access",
);

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  member: MEMBER_PERMISSIONS,
};

/** Bir rolün belirli bir yetkisi var mı? */
export function roleCan(role: UserRole, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm);
}
