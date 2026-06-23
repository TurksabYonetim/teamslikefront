import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { FullPageSpinner } from "@/components/ui/Spinner";

/**
 * Route'lar kod-bölmeli (code-splitting) yüklenir: her sayfa kendi chunk'ına
 * ayrılır ve yalnızca o route'a girildiğinde indirilir. Bu, başlangıç bundle'ını
 * küçük tutar (ilk yük hızlanır). Layout sarmalayıcıları (AppShell/ProtectedRoute)
 * her zaman gerektiği için eager (statik) import edilir.
 *
 * Sayfalar named export olduğundan React.lazy için default'a köprülenir.
 */
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("@/features/auth/SignupPage").then((m) => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import("@/features/users/UsersPage").then((m) => ({ default: m.UsersPage })));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const MessagingPage = lazy(() => import("@/features/messaging/MessagingPage").then((m) => ({ default: m.MessagingPage })));
const MeetingsPage = lazy(() => import("@/features/meetings/MeetingsPage").then((m) => ({ default: m.MeetingsPage })));
const AppointmentsPage = lazy(() => import("@/features/appointments/AppointmentsPage").then((m) => ({ default: m.AppointmentsPage })));
const PhoneLayout = lazy(() => import("@/features/phone/PhoneLayout").then((m) => ({ default: m.PhoneLayout })));
const CopilotPage = lazy(() => import("@/features/copilot/CopilotPage").then((m) => ({ default: m.CopilotPage })));
const TasksPage = lazy(() => import("@/features/tasks/TasksPage").then((m) => ({ default: m.TasksPage })));
const DocsPage = lazy(() => import("@/features/docs/DocsPage").then((m) => ({ default: m.DocsPage })));
const ClipsPage = lazy(() => import("@/features/clips/ClipsPage").then((m) => ({ default: m.ClipsPage })));
const WebinarPage = lazy(() => import("@/features/webinar/WebinarPage").then((m) => ({ default: m.WebinarPage })));
const BookingPage = lazy(() => import("@/features/booking/BookingPage").then((m) => ({ default: m.BookingPage })));
const PublicBookingPage = lazy(() => import("@/features/booking/PublicBookingPage").then((m) => ({ default: m.PublicBookingPage })));
const PublicJoinPage = lazy(() => import("@/features/meetings/PublicJoinPage").then((m) => ({ default: m.PublicJoinPage })));
const MeetingLobbyPage = lazy(() => import("@/features/meetings/MeetingLobbyPage").then((m) => ({ default: m.MeetingLobbyPage })));
const MeetingRoomPage = lazy(() => import("@/features/meetings/MeetingRoomPage").then((m) => ({ default: m.MeetingRoomPage })));
const MeetingExperience = lazy(() => import("@/features/meetings/MeetingExperience").then((m) => ({ default: m.MeetingExperience })));
const CreateMeetingPage = lazy(() => import("@/features/meetings/CreateMeetingPage").then((m) => ({ default: m.CreateMeetingPage })));
const RateConversationPage = lazy(() => import("@/features/meetings/RateConversationPage").then((m) => ({ default: m.RateConversationPage })));
const PortalPage = lazy(() => import("@/features/portal/PortalPage").then((m) => ({ default: m.PortalPage })));
const PortalChatPage = lazy(() => import("@/features/portal/PortalChatPage").then((m) => ({ default: m.PortalChatPage })));
const IntelligencePage = lazy(() => import("@/features/intelligence/IntelligencePage").then((m) => ({ default: m.IntelligencePage })));
const IntelligenceDashboard = lazy(() => import("@/features/intelligence/IntelligenceDashboard").then((m) => ({ default: m.IntelligenceDashboard })));
const CanvasPage = lazy(() => import("@/features/canvas/CanvasPage").then((m) => ({ default: m.CanvasPage })));
const AdminPage = lazy(() => import("@/features/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const SupportPage = lazy(() => import("@/features/support/SupportPage").then((m) => ({ default: m.SupportPage })));

/** Lazy sayfayı Suspense ile sarar; chunk inerken FullPageSpinner gösterir. */
const s = (node: ReactNode) => <Suspense fallback={<FullPageSpinner />}>{node}</Suspense>;

// GitHub Pages alt-yolda servis edildiğinde (base "/teamslikefront/") router'ın da
// aynı önekten eşleşmesi gerekir. Vite, base'i import.meta.env.BASE_URL olarak verir
// (sondaki "/" temizlenir; dev'de "/" kalır).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

/**
 * Uygulama rotaları. Yeni feature eklerken:
 *  1) features/<feature>/<Feature>Page.tsx oluştur
 *  2) Yukarıda lazy(...) ile import et ve aşağıya s(<Page/>) olarak ekle
 */
export const router = createBrowserRouter([
  { path: "/login", element: s(<LoginPage />) },
  { path: "/signup", element: s(<SignupPage />) },
  { path: "/book", element: s(<PublicBookingPage />) },
  { path: "/book/:slug", element: s(<PublicBookingPage />) },
  { path: "/j/:meetingId", element: s(<PublicJoinPage />) },
  { path: "/lobby", element: s(<MeetingLobbyPage />) },
  { path: "/room-jitsi", element: s(<MeetingRoomPage />) },
  { path: "/create-meeting", element: s(<CreateMeetingPage />) },
  { path: "/rate-conversation", element: s(<RateConversationPage />) },
  { path: "/portal", element: s(<PortalPage />) },
  { path: "/portal/chat", element: s(<PortalChatPage />) },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: s(<DashboardPage />) },
      { path: "channels", element: s(<MessagingPage section="channels" />) },
      { path: "channels/:id", element: s(<MessagingPage section="channels" />) },
      { path: "dm", element: s(<MessagingPage section="dm" />) },
      { path: "dm/:id", element: s(<MessagingPage section="dm" />) },
      { path: "inbox", element: s(<MessagingPage section="inbox" />) },
      { path: "inbox/:id", element: s(<MessagingPage section="inbox" />) },
      { path: "meetings", element: s(<MeetingsPage />) },
      { path: "room", element: s(<MeetingExperience />) },
      { path: "phone", element: s(<PhoneLayout />) },
      { path: "copilot", element: s(<CopilotPage />) },
      { path: "appointments", element: s(<AppointmentsPage />) },
      { path: "booking", element: s(<BookingPage />) },
      { path: "webinar", element: s(<WebinarPage />) },
      { path: "clips", element: s(<ClipsPage />) },
      { path: "docs", element: s(<DocsPage />) },
      { path: "tasks", element: s(<TasksPage />) },
      { path: "users", element: s(<UsersPage />) },
      { path: "intelligence-docs", element: s(<IntelligencePage />) },
      { path: "intelligence", element: s(<IntelligenceDashboard />) },
      { path: "canvas", element: s(<CanvasPage />) },
      { path: "support", element: s(<SupportPage />) },
      { path: "admin", element: s(<AdminPage />) },
      { path: "settings", element: s(<SettingsPage />) },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
], { basename });
