/** Sol nav rail öğeleri. Yeni feature ekledikçe buraya bir satır eklenir. */
export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Ana sayfa", icon: "home" },
  { to: "/channels", label: "Kanallar", icon: "hash" },
  { to: "/dm", label: "Sohbet", icon: "chat" },
  { to: "/inbox", label: "Inbox", icon: "inbox" },
  { to: "/meetings", label: "Toplantı", icon: "video" },
  { to: "/phone", label: "Telefon", icon: "phone" },
  { to: "/copilot", label: "Copilot", icon: "sparkles" },
  { to: "/appointments", label: "Randevu", icon: "calendar" },
  { to: "/booking", label: "Booking", icon: "calCheck" },
  { to: "/webinar", label: "Webinar", icon: "webinar" },
  { to: "/clips", label: "Clips", icon: "clip" },
  { to: "/docs", label: "Docs", icon: "doc" },
  { to: "/tasks", label: "Görevler", icon: "board" },
  { to: "/intelligence", label: "Analitik", icon: "search" },
  { to: "/canvas", label: "Kanvas", icon: "grid" },
  { to: "/support", label: "Destek", icon: "comment" },
  { to: "/admin", label: "Yönetim", icon: "key" },
  { to: "/users", label: "Ekip", icon: "users" },
  { to: "/settings", label: "Ayarlar", icon: "settings" },
];
