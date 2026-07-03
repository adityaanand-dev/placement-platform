import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import CompanyLayout from "./layouts/CompanyLayout";

// Auth pages
import Login    from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

// Student pages
import StudentDashboard     from "./pages/StudentDashboard";
import JobSearch            from "./pages/JobSearch";
import StudentProfile       from "./pages/StudentProfile";
import MeetingsCalendar     from "./pages/MeetingsCalendar";
import StudentNotifications from "./pages/StudentNotifications";
import StudentOffers        from "./pages/StudentOffers";
import Messages             from "./pages/Messages";

// Company pages
import CompanyDashboard from "./pages/CompanyDashboard";

// ─── Auth guard ───────────────────────────────────────────────────────────────
function RequireAuth({ role, children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && currentUser.role !== role) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[RequireAuth] Blocked: a "${currentUser.role}" account tried to access a "${role}"-only route (${location.pathname}). Redirecting to their correct dashboard.`
      );
    }
    const correctPath = currentUser.role === "company" ? "/company/dashboard" : "/student/dashboard";
    return <Navigate to={correctPath} replace />;
  }

  return children;
}

// ─── Routed app (inside context) ─────────────────────────────────────────────
function AppRoutes() {
  const { currentUser, login: triggerContextUserUpdate } = useApp(); 
  
  const handleSetUser = (userPayload) => {
    if (triggerContextUserUpdate && userPayload) {
      triggerContextUserUpdate(userPayload.email, userPayload.password, userPayload.role);
    }
  };

  const homeFor = (user) => (user?.role === "company" ? "/company/dashboard" : "/student/dashboard");

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!currentUser ? <Login setUser={handleSetUser} /> : <Navigate to={homeFor(currentUser)} replace />}
      />
      <Route
        path="/register"
        element={!currentUser ? <Register /> : <Navigate to={homeFor(currentUser)} replace />}
      />
      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />
      <Route
        path="/"
        element={currentUser ? <Navigate to={homeFor(currentUser)} replace /> : <Navigate to="/login" replace />}
      />
      <Route 
        path="/student" 
        element={
          <RequireAuth role="student">
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<StudentDashboard />} />
        <Route path="jobs"          element={<JobSearch />} />
        {/* Fixed link target mapping from JobSearch to applications view context if needed */}
        <Route path="applications"  element={<JobSearch />} /> 
        <Route path="interviews"    element={<MeetingsCalendar />} /> {/* Matched up with sidebar path */}
        <Route path="meetings"      element={<MeetingsCalendar />} />
        <Route path="profile"       element={<StudentProfile />} />
        <Route path="messages"      element={<Messages />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="offers"        element={<StudentOffers />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ── Company Routes — Modernized Parent-Child Layout Nesting ── */}
      <Route 
        path="/company" 
        element={
          <RequireAuth role="company">
            <CompanyLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<CompanyDashboard user={currentUser} />} />
        <Route path="students"      element={<CompanyDashboard user={currentUser} />} />
        <Route path="jobs"          element={<CompanyDashboard user={currentUser} />} />
        <Route path="interviews"    element={<CompanyDashboard user={currentUser} />} />
        <Route path="messages"      element={<Messages />} />
        <Route path="offers"        element={<CompanyDashboard user={currentUser} />} />
        <Route path="notifications" element={<CompanyDashboard user={currentUser} />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={
        <div style={{ textAlign: "center", paddingTop: "5rem", fontFamily: "sans-serif" }}>
          <h2 style={{ fontSize: 20, color: "#111827" }}>404 — Page not found</h2>
          <a href="/" style={{ color: "#4F46E5", marginTop: 12, display: "block" }}>← Go home</a>
        </div>
      } />
    </Routes>
  );
}

// ─── Main Application Root ───────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}