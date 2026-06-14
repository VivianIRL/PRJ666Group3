import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";


// Bootstrap CSS — required for Modals, Badges, Tables, ProgressBar, etc.
import "bootstrap/dist/css/bootstrap.min.css";

// Providers
import { AuthProvider }          from "./state/AuthProvider.jsx";
import { NotificationsProvider } from "./state/NotificationsProvider.jsx";

// Layouts / shell
import AuthLayout   from "./layouts/AuthLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import TopNavbar    from "./navigation/top-navbar.jsx";

// Public pages
import App               from "./App.jsx";
import Login             from "./register/Login.jsx";
import Register          from "./register/Register.jsx";
import ImmigrationDetails from "./register/ImmigrationDetails.jsx";
import Logout            from "./pages/Logout.jsx";
import AboutPage         from "./pages/Aboutpage.jsx";

// Authenticated pages
import GettingStarted       from "./pages/GettingStarted.jsx";
import Dashboard            from "./pages/Dashboard.jsx";
import TasksDashboard       from "./pages/TasksDashboard.jsx";
import TaskManager          from "./pages/TaskManager.jsx";
import Checklist            from "./pages/Checklist.jsx";
import Community            from "./pages/Community.jsx";
import ContentManagement    from "./pages/ContentManagement.jsx";
import NotificationsDashboard from "./pages/NotificationsDashboard.jsx";
import NotificationSettings from "./pages/NotificationSettings.jsx";
import FeaturesHub          from "./pages/FeaturesHub.jsx";
import IRCCInfo             from "./pages/IRCCInfo.jsx";
import ComplianceTracking   from "./pages/ComplianceTracking.jsx";
import DocumentAlerts       from "./pages/DocumentAlerts.jsx";
import InternationalStudents from "./pages/InternationalStudents.jsx";
import PostArrival          from "./pages/PostArrival.jsx";
import HousingSupport       from "./pages/HousingSupport.jsx";
import WorkEligibility      from "./pages/WorkEligibility.jsx";
import PRPathway            from "./pages/PRPathway.jsx";
import PolicyUpdates        from "./pages/PolicyUpdates.jsx";
import PersonalizedChecklists from "./pages/PersonalizedChecklists.jsx";

// Information pages
import SINInfo        from "./pages/info/SINInfo.jsx";
import WorkPermitInfo from "./pages/info/WorkPermitInfo.jsx";
import HealthInfo     from "./pages/info/HealthInfo.jsx";
import LanguageInfo   from "./pages/info/LanguageInfo.jsx";

// Static / footer pages (public)
import PrivacyPolicy    from "./pages/static/PrivacyPolicy.jsx";
import TermsOfUse       from "./pages/static/TermsOfUse.jsx";
import ContactUs        from "./pages/static/ContactUs.jsx";
import FAQs             from "./pages/static/FAQs.jsx";
import HelpCenter       from "./pages/static/HelpCenter.jsx";
import ImmigrationGuide from "./pages/static/ImmigrationGuide.jsx";
import SettlementTips   from "./pages/static/SettlementTips.jsx";

// Step-by-step task guides
import SINGuide           from "./pages/guides/SINGuide.jsx";
import BankAccountGuide   from "./pages/guides/BankAccountGuide.jsx";
import HealthCardGuide    from "./pages/guides/HealthCardGuide.jsx";
import PermitRenewalGuide from "./pages/guides/PermitRenewalGuide.jsx";
import TaxReturnGuide     from "./pages/guides/TaxReturnGuide.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <TopNavbar />

          <Routes>
            {/* ── Public pages (no sidebar) ─────────────────────────────── */}
            <Route path="/"                   element={<App />} />
            <Route path="/about"              element={<AboutPage />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/register"           element={<Register />} />
            <Route path="/immigration"        element={<ImmigrationDetails />} />
            <Route path="/logout"             element={<Logout />} />

            {/* Footer / static pages — public, wrapped with PublicLayout (adds Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/privacy"            element={<PrivacyPolicy />} />
              <Route path="/terms"              element={<TermsOfUse />} />
              <Route path="/contact"            element={<ContactUs />} />
              <Route path="/faqs"               element={<FAQs />} />
              <Route path="/help"               element={<HelpCenter />} />
              <Route path="/immigration-guide"  element={<ImmigrationGuide />} />
              <Route path="/settlement-tips"    element={<SettlementTips />} />
            </Route>

            {/* ── Authenticated routes (sidebar + protected) ────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/getting-started"         element={<GettingStarted />} />
              <Route path="/dashboard"               element={<Dashboard />} />
              <Route path="/tasks"                   element={<TasksDashboard />} />
              <Route path="/task-manager"            element={<TaskManager />} />
              <Route path="/checklist"               element={<Checklist />} />
              <Route path="/community"               element={<Community />} />
              <Route path="/content-management"      element={<ContentManagement />} />
              <Route path="/notifications-dashboard" element={<NotificationsDashboard />} />
              <Route path="/notification-settings"   element={<NotificationSettings />} />
              <Route path="/features"                element={<FeaturesHub />} />
              <Route path="/ircc"                    element={<IRCCInfo />} />
              <Route path="/compliance"              element={<ComplianceTracking />} />
              <Route path="/document-alerts"         element={<DocumentAlerts />} />
              <Route path="/international-students"  element={<InternationalStudents />} />
              <Route path="/post-arrival"            element={<PostArrival />} />
              <Route path="/housing"                 element={<HousingSupport />} />
              <Route path="/work-eligibility"        element={<WorkEligibility />} />
              <Route path="/pr-pathway"              element={<PRPathway />} />
              <Route path="/policy-updates"          element={<PolicyUpdates />} />
              <Route path="/checklists"              element={<PersonalizedChecklists />} />

              {/* Information pages */}
              <Route path="/info/sin"         element={<SINInfo />} />
              <Route path="/info/work-permit" element={<WorkPermitInfo />} />
              <Route path="/info/health"      element={<HealthInfo />} />
              <Route path="/info/language"    element={<LanguageInfo />} />

              {/* Step-by-step task guides */}
              <Route path="/guides/sin"            element={<SINGuide />} />
              <Route path="/guides/bank-account"   element={<BankAccountGuide />} />
              <Route path="/guides/health-card"    element={<HealthCardGuide />} />
              <Route path="/guides/permit-renewal" element={<PermitRenewalGuide />} />
              <Route path="/guides/tax-return"     element={<TaxReturnGuide />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>,
);
