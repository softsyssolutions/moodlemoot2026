import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth.tsx";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSpeakersHub from "./pages/admin/SpeakersHub";
import AdminSessions from "./pages/admin/Sessions";
import AdminSponsors from "./pages/admin/Sponsors";
import AdminEvent from "./pages/admin/Event";
import AdminCheckIn from "./pages/admin/CheckIn";
import AdminStaff from "./pages/admin/Staff";
import AdminNotifications from "./pages/admin/Notifications";
import AdminCoupons from "./pages/admin/Coupons";
import AdminAttendees from "./pages/admin/Attendees";
import DebugOverlay from "./components/DebugOverlay";
import GlobalRegistrationModal from "./components/landing/GlobalRegistrationModal";
import GlobalPurchaseModal from "./components/landing/GlobalPurchaseModal";
import SpeakerProposalModal from "./components/landing/SpeakerProposalModal";
import SponsorProposalModal from "./components/landing/SponsorProposalModal";
import Ticket from "./pages/Ticket.tsx";
import SpeakerPortalPage from "./pages/portal/SpeakerPortalPage";
import SponsorPortalPage from "./pages/portal/SponsorPortalPage";
import FloatingRegisterCta from "./components/landing/FloatingRegisterCta";
import FloatingControls from "./components/landing/FloatingControls";
import FloatingNotifyButton from "./components/landing/FloatingNotifyButton";
import FloatingInstallPwa from "./components/landing/FloatingInstallPwa";
import FloatingOfferCard from "./components/landing/FloatingOfferCard";
import ScrollToTop from "./components/ScrollToTop";
import SponsorRedirect from "./pages/SponsorRedirect";

const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <DebugOverlay />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />

        <AuthProvider>
          <GlobalRegistrationModal />
          <GlobalPurchaseModal />
          <SpeakerProposalModal />
          <SponsorProposalModal />
          <FloatingControls />
          <FloatingRegisterCta />
          <FloatingInstallPwa />
          <FloatingOfferCard />
          {/* <FloatingNotifyButton /> — reemplazado por campanita junto al hashtag en Hero */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sponsors" element={<SponsorRedirect />} />
            <Route path="/ser-sponsor" element={<SponsorRedirect />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/ticket/:ticketId" element={<Ticket />} />
            <Route path="/portal/speaker/:token" element={<SpeakerPortalPage />} />
            <Route path="/portal/sponsor/:token" element={<SponsorPortalPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/panel" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="check-in" element={<AdminCheckIn />} />
              <Route path="asistentes" element={<AdminAttendees />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="speakers" element={<AdminSpeakersHub />} />
              <Route path="ponentes" element={<Navigate to="/panel/speakers" replace />} />
              <Route path="sesiones" element={<AdminSessions />} />
              <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="notificaciones" element={<AdminNotifications />} />
              <Route path="cupones" element={<AdminCoupons />} />
              <Route path="evento" element={<AdminEvent />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;
