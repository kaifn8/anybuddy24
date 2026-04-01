import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import OnboardingPage from "./pages/OnboardingPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import JoinRequestPage from "./pages/JoinRequestPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import HostProfilePage from "./pages/HostProfilePage";
import ReviewPage from "./pages/ReviewPage";
import CreditsPage from "./pages/CreditsPage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import InviteFriendsPage from "./pages/InviteFriendsPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedAdminRoute from "./components/layout/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import QuestsPage from "./pages/QuestsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AttendancePage from "./pages/AttendancePage";
import CirclePage from "./pages/CirclePage";
import { AchievementUnlock } from "./components/gamification/AchievementUnlock";
import { XPPopupLayer } from "./components/gamification/XPPopup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AchievementUnlock />
      <XPPopupLayer />
      <BrowserRouter>
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
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:userId" element={<AdminUserDetail />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="pricing" element={<AdminPricing />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
