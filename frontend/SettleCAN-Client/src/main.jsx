import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider }          from "./state/AuthProvider.jsx";
import { NotificationsProvider } from "./state/NotificationsProvider.jsx";

// Layouts
import AuthLayout    from "./layouts/AuthLayout.jsx";
import TopNavbar     from "./navigation/top-navbar.jsx";

// Public pages
import App               from "./App.jsx";
import Login             from "./register/Login.jsx";
import Register          from "./register/Register.jsx";
import ImmigrationDetails from "./register/ImmigrationDetails.jsx";
import Logout             from "./pages/Logout.jsx";
import AboutPage         from "./pages/Aboutpage.jsx";

// Authenticated pages
import GettingStarted       from "./pages/GettingStarted.jsx";
import Dashboard            from "./pages/Dashboard.jsx";
import TasksDashboard       from "./pages/TasksDashboard.jsx";
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
import SINInfo         from "./pages/info/SINInfo.jsx";
import WorkPermitInfo  from "./pages/info/WorkPermitInfo.jsx";
import HealthInfo      from "./pages/info/HealthInfo.jsx";
import LanguageInfo    from "./pages/info/LanguageInfo.jsx";

// Step-by-step task guides
import SINGuide           from "./pages/guides/SINGuide.jsx";
import BankAccountGuide   from "./pages/guides/BankAccountGuide.jsx";
import HealthCardGuide    from "./pages/guides/HealthCardGuide.jsx";
import PermitRenewalGuide from "./pages/guides/PermitRenewalGuide.jsx";
import TaxReturnGuide     from "./pages/guides/TaxReturnGuide.jsx";

import "./scss/App.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          {/* TopNavbar is ALWAYS visible on every page.
              After login it shows "Log out"; before login it shows "Sign in / Sign up". */}
          <TopNavbar />

          <Routes>

            {/* ── Public pages (no sidebar) ──────────────────────────────── */}
            <Route path="/"          element={<App />} />
            <Route path="/about"     element={<AboutPage />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/immigration" element={<ImmigrationDetails />} />
            <Route path="/logout"    element={<Logout />} />

            {/* ── Authenticated routes (sidebar + protected) ─────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/getting-started"         element={<GettingStarted />} />
              <Route path="/dashboard"               element={<Dashboard />} />
              <Route path="/tasks"                   element={<TasksDashboard />} />
              <Route path="/notifications-dashboard" element={<NotificationsDashboard />} />
              <Route path="/notification-settings"   element={<NotificationSettings />} />

              <Route path="/features"               element={<FeaturesHub />} />
              <Route path="/ircc"                   element={<IRCCInfo />} />
              <Route path="/compliance"             element={<ComplianceTracking />} />
              <Route path="/document-alerts"        element={<DocumentAlerts />} />
              <Route path="/international-students" element={<InternationalStudents />} />
              <Route path="/post-arrival"           element={<PostArrival />} />
              <Route path="/housing"                element={<HousingSupport />} />
              <Route path="/work-eligibility"       element={<WorkEligibility />} />
              <Route path="/pr-pathway"             element={<PRPathway />} />
              <Route path="/policy-updates"         element={<PolicyUpdates />} />
              <Route path="/checklists"             element={<PersonalizedChecklists />} />

              {/* Information pages */}
              <Route path="/info/sin"          element={<SINInfo />} />
              <Route path="/info/work-permit"  element={<WorkPermitInfo />} />
              <Route path="/info/health"       element={<HealthInfo />} />
              <Route path="/info/language"     element={<LanguageInfo />} />

              {/* Step-by-step task guides */}
              <Route path="/guides/sin"             element={<SINGuide />} />
              <Route path="/guides/bank-account"    element={<BankAccountGuide />} />
              <Route path="/guides/health-card"     element={<HealthCardGuide />} />
              <Route path="/guides/permit-renewal"  element={<PermitRenewalGuide />} />
              <Route path="/guides/tax-return"      element={<TaxReturnGuide />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>
);
