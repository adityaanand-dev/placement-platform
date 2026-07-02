import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function CompanyLayout() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection safety guard
  if (!currentUser || currentUser.role !== "company") {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
        <h3>⚠️ Access Denied</h3>
        <p>Please log in with a valid recruiter or company account.</p>
        <button onClick={() => navigate("/")} style={{ padding: "8px 16px", cursor: "pointer" }}>Go to Login</button>
      </div>
    );
  }

  const menuItems = [
    { label: "Overview", path: "/company/dashboard", icon: "📊" },
    { label: "Browse students", path: "/company/students", icon: "👥" },
    { label: "My job postings", path: "/company/jobs", icon: "📝" },
    { label: "Interviews", path: "/company/interviews", icon: "📅" },
    { label: "Messages", path: "/company/messages", icon: "💬" },
    { label: "Offer letters", path: "/company/offers", icon: "🎉" },
    { label: "Notifications", path: "/company/notifications", icon: "🔔" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Sidebar Navigation */}
      <div style={{ width: 260, background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", position: "fixed", height: "100vh", boxSizing: "border-box" }}>
        <div style={{ marginBottom: "2rem", paddingLeft: "0.5rem" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>🚀 LaunchPad</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Company Portal</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "#EEF2FF" : "transparent",
                color: isActive ? "#4F46E5" : "#4B5563",
                transition: "all 0.2s"
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
              {currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("") : "HR"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{currentUser.companyName || "TCS Digital"}</div>
              <div style={{ fontSize: 11, color: "#6B7280", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{currentUser.name || "Recruiter"}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} style={{ width: "100%", marginTop: 12, padding: "8px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "transparent", color: "#4B5563", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            🚪 Sign out
          </button>
        </div>
      </div>

      {/* Main Panel Content Area Container */}
      <div style={{ marginLeft: 260, flex: 1, padding: "2.5rem", boxSizing: "border-box", minWidth: 0 }}>
        <Outlet /> {/* 🟢 RENDERS NESTED COMPANY DASHBOARD SUB-PAGES */}
      </div>
    </div>
  );
}
