import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import trCommon from "./locales/tr/common.json";
import enCommon from "./locales/en/common.json";
import trMeetings from "./locales/tr/meetings.json";
import enMeetings from "./locales/en/meetings.json";
import trMessaging from "./locales/tr/messaging.json";
import enMessaging from "./locales/en/messaging.json";
import trCopilot from "./locales/tr/copilot.json";
import enCopilot from "./locales/en/copilot.json";
import trPhone from "./locales/tr/phone.json";
import enPhone from "./locales/en/phone.json";
import trAppointments from "./locales/tr/appointments.json";
import enAppointments from "./locales/en/appointments.json";
import trBooking from "./locales/tr/booking.json";
import enBooking from "./locales/en/booking.json";
import trTasks from "./locales/tr/tasks.json";
import enTasks from "./locales/en/tasks.json";
import trUsers from "./locales/tr/users.json";
import enUsers from "./locales/en/users.json";
import trDashboard from "./locales/tr/dashboard.json";
import enDashboard from "./locales/en/dashboard.json";
import trSettings from "./locales/tr/settings.json";
import enSettings from "./locales/en/settings.json";
import trAuth from "./locales/tr/auth.json";
import enAuth from "./locales/en/auth.json";
import trPortal from "./locales/tr/portal.json";
import enPortal from "./locales/en/portal.json";
import trDocs from "./locales/tr/docs.json";
import enDocs from "./locales/en/docs.json";
import trClips from "./locales/tr/clips.json";
import enClips from "./locales/en/clips.json";
import trWebinar from "./locales/tr/webinar.json";
import enWebinar from "./locales/en/webinar.json";
import trIntelligence from "./locales/tr/intelligence.json";
import enIntelligence from "./locales/en/intelligence.json";
import trCanvas from "./locales/tr/canvas.json";
import enCanvas from "./locales/en/canvas.json";
import trAdmin from "./locales/tr/admin.json";
import enAdmin from "./locales/en/admin.json";
import trSupport from "./locales/tr/support.json";
import enSupport from "./locales/en/support.json";

export const SUPPORTED_LANGS = ["tr", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
const STORAGE_KEY = "teamslike_lang";

const saved = localStorage.getItem(STORAGE_KEY);
const initial: Lang = saved === "en" || saved === "tr" ? saved : "tr";

export const NAMESPACES = [
  "common", "meetings", "messaging", "copilot", "phone",
  "appointments", "booking", "tasks", "users",
  "dashboard", "settings", "auth", "portal",
  "docs", "clips", "webinar",
  "intelligence", "canvas", "admin", "support",
] as const;

void i18n.use(initReactI18next).init({
  lng: initial,
  fallbackLng: "tr",
  ns: NAMESPACES as unknown as string[],
  defaultNS: "common",
  resources: {
    tr: {
      common: trCommon, meetings: trMeetings, messaging: trMessaging,
      copilot: trCopilot, phone: trPhone, appointments: trAppointments,
      booking: trBooking, tasks: trTasks, users: trUsers,
      dashboard: trDashboard, settings: trSettings, auth: trAuth, portal: trPortal,
      docs: trDocs, clips: trClips, webinar: trWebinar,
      intelligence: trIntelligence, canvas: trCanvas, admin: trAdmin, support: trSupport,
    },
    en: {
      common: enCommon, meetings: enMeetings, messaging: enMessaging,
      copilot: enCopilot, phone: enPhone, appointments: enAppointments,
      booking: enBooking, tasks: enTasks, users: enUsers,
      dashboard: enDashboard, settings: enSettings, auth: enAuth, portal: enPortal,
      docs: enDocs, clips: enClips, webinar: enWebinar,
      intelligence: enIntelligence, canvas: enCanvas, admin: enAdmin, support: enSupport,
    },
  },
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initial;
i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export default i18n;
