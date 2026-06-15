import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { SignupPage } from "@/features/auth/SignupPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { UsersPage } from "@/features/users/UsersPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { MessagingPage } from "@/features/messaging/MessagingPage";
import { MeetingsPage } from "@/features/meetings/MeetingsPage";
import { AppointmentsPage } from "@/features/appointments/AppointmentsPage";
import { PhoneLayout } from "@/features/phone/PhoneLayout";
import { CopilotPage } from "@/features/copilot/CopilotPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { DocsPage } from "@/features/docs/DocsPage";
import { ClipsPage } from "@/features/clips/ClipsPage";
import { WebinarPage } from "@/features/webinar/WebinarPage";
import { BookingPage } from "@/features/booking/BookingPage";
import { PublicBookingPage } from "@/features/booking/PublicBookingPage";
import { PublicJoinPage } from "@/features/meetings/PublicJoinPage";
import { MeetingLobbyPage } from "@/features/meetings/MeetingLobbyPage";
import { MeetingRoomPage } from "@/features/meetings/MeetingRoomPage";
import { MeetingExperience } from "@/features/meetings/MeetingExperience";
import { CreateMeetingPage } from "@/features/meetings/CreateMeetingPage";
import { RateConversationPage } from "@/features/meetings/RateConversationPage";
import { PortalPage } from "@/features/portal/PortalPage";
import { PortalChatPage } from "@/features/portal/PortalChatPage";
import { IntelligencePage } from "@/features/intelligence/IntelligencePage";
import { IntelligenceDashboard } from "@/features/intelligence/IntelligenceDashboard";
import { CanvasPage } from "@/features/canvas/CanvasPage";
import { AdminPage } from "@/features/admin/AdminPage";
import { SupportPage } from "@/features/support/SupportPage";

/**
 * Uygulama rotaları. Yeni feature eklerken:
 *  1) features/<feature>/<Feature>Page.tsx oluştur
 *  2) Buradaki ilgili PlaceholderPage'i gerçek sayfayla değiştir
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/book", element: <PublicBookingPage /> },
  { path: "/book/:slug", element: <PublicBookingPage /> },
  { path: "/j/:meetingId", element: <PublicJoinPage /> },
  { path: "/lobby", element: <MeetingLobbyPage /> },
  { path: "/room", element: <MeetingExperience /> },
  { path: "/room-jitsi", element: <MeetingRoomPage /> },
  { path: "/create-meeting", element: <CreateMeetingPage /> },
  { path: "/rate-conversation", element: <RateConversationPage /> },
  { path: "/portal", element: <PortalPage /> },
  { path: "/portal/chat", element: <PortalChatPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "channels", element: <MessagingPage section="channels" /> },
      { path: "channels/:id", element: <MessagingPage section="channels" /> },
      { path: "dm", element: <MessagingPage section="dm" /> },
      { path: "dm/:id", element: <MessagingPage section="dm" /> },
      { path: "inbox", element: <MessagingPage section="inbox" /> },
      { path: "inbox/:id", element: <MessagingPage section="inbox" /> },
      { path: "meetings", element: <MeetingsPage /> },
      { path: "phone", element: <PhoneLayout /> },
      { path: "copilot", element: <CopilotPage /> },
      { path: "appointments", element: <AppointmentsPage /> },
      { path: "booking", element: <BookingPage /> },
      { path: "webinar", element: <WebinarPage /> },
      { path: "clips", element: <ClipsPage /> },
      { path: "docs", element: <DocsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "intelligence-docs", element: <IntelligencePage /> },
      { path: "intelligence", element: <IntelligenceDashboard /> },
      { path: "canvas", element: <CanvasPage /> },
      { path: "support", element: <SupportPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
