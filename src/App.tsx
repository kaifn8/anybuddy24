import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import { AchievementUnlock } from "./components/gamification/AchievementUnlock";
import { XPPopupLayer } from "./components/gamification/XPPopup";

const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const CreateRequestPage = lazy(() => import("./pages/CreateRequestPage"));
const JoinRequestPage = lazy(() => import("./pages/JoinRequestPage"));
const RequestDetailPage = lazy(() => import("./pages/RequestDetailPage"));
const HostProfilePage = lazy(() => import("./pages/HostProfilePage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const CreditsPage = lazy(() => import("./pages/CreditsPage"));
const ChatsPage = lazy(() => import("./pages/ChatsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const InviteFriendsPage = lazy(() => import("./pages/InviteFriendsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const QuestsPage = lazy(() => import("./pages/QuestsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const CirclePage = lazy(() => import("./pages/CirclePage"));
const FreeNowPage = lazy(() => import("./pages/FreeNowPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin bundle (rarely visited) — keep behind its own chunk
const ProtectedAdminRoute = lazy(() => import("./components/layout/ProtectedAdminRoute"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminVerification = lazy(() => import("./pages/admin/AdminVerification"));
const AdminModeration = lazy(() => import("./pages/admin/AdminModeration"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminUserDetail = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const AdminBroadcast = lazy(() => import("./pages/admin/AdminBroadcast"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="mobile-container h-[100dvh] bg-ambient" aria-hidden />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AchievementUnlock />
      <XPPopupLayer />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/create" element={<CreateRequestPage />} />
            <Route path="/join/:id" element={<JoinRequestPage />} />
            <Route path="/request/:id" element={<RequestDetailPage />} />
            <Route path="/host/:userId" element={<HostProfilePage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/invite" element={<InviteFriendsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/attendance/:id" element={<AttendancePage />} />
            <Route path="/circle" element={<CirclePage />} />
            <Route path="/free-now" element={<FreeNowPage />} />
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId" element={<AdminUserDetail />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="broadcast" element={<AdminBroadcast />} />
              <Route path="pricing" element={<AdminPricing />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
