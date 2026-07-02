import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  green: "#059669", amber: "#D97706",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.1)", surface: "#FFFFFF", bg: "#F8F7FF",
  red: "#DC2626", redBg: "#FEE2E2",
};

const inp = {
  width: "100%", padding: "11px 14px", fontSize: 14,
  border: `1px solid ${C.border}`, borderRadius: 10,
  background: C.surface, color: C.text, outline: "none",
  transition: "border-color 0.15s",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp(); // 🟢 Direct hook into local simulation auth engine

  const [tab,      setTab]      = useState("student"); // "student" | "company"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { 
      setError("Please fill in all fields."); 
      return; 
    }

    setLoading(true);

    // Simulated short delay to show loading state spinner logic
    setTimeout(() => {
      // ── CONTEXT AUTH GATEWAY DISPATCH ──────────────────────────────────────
      const result = login(email, password, tab);

      if (result.ok) {
        // Commit backup values for local storage persistence if context unmounts
        localStorage.setItem("tnp_user", JSON.stringify(result.user));
        localStorage.setItem("tnp_user_email", result.user.email);

        // Route users into their respective layout paths cleanly
        if (result.user.role === "company") {
          navigate("/company/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } else {
        // Correctly renders exact structural mismatch strings (e.g. "This email is registered as a student...")
        setError(result.error);
      }
      setLoading(false);
    }, 400);
  };

  const demoFill = (type) => {
    setError("");
    if (type === "student") { 
      setEmail("aditya@example.com");  
      setPassword("pass123"); 
      setTab("student"); 
    } else { 
      setEmail("hr@tcs.com");   
      setPassword("pass123"); 
      setTab("company"); 
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF 0%, #F8F7FF 50%, #F0FDF4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 12px",
          }}>🚀</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text }}>LaunchPad</h1>
          <p style={{ fontSize: 14, color: C.textSub, marginTop: 4 }}>Your career starts here</p>
        </div>

        {/* Card */}
        <div style={{
          background: C.surface, borderRadius: 18,
          boxShadow: "0 4px 32px rgba(79,70,229,0.1)",
          padding: "2rem",
        }}>
          {/* Tab switch */}
          <div style={{
            display: "flex", background: C.bg, borderRadius: 12,
            padding: 4, marginBottom: "1.75rem",
          }}>
            {["student", "company"].map(t => (
              <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, border: "none",
                  cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 400,
                  background: tab === t ? C.indigo : "transparent",
                  color:      tab === t ? "#fff"   : C.textSub,
                  transition: "all 0.2s",
                }}>
                {t === "student" ? "🎓 Student" : "🏢 Company"}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            {tab === "student" ? "Welcome back, student!" : "Company login"}
          </h2>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: "1.5rem" }}>
            Sign in to your {tab === "student" ? "placement" : "hiring"} dashboard
          </p>

          {error && (
            <div style={{ background: C.redBg, color: C.red, fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: "1rem", lineHeight: 1.5 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>
                {tab === "student" ? "College email" : "HR / company email"}
              </label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inp} autoComplete="email"
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textSub, display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inp, paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: loading ? "#A5B4FC" : C.indigo, color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4, transition: "background 0.2s",
              }}>
                {loading ? "Signing in…" : `Sign in as ${tab === "student" ? "Student" : "Company"}`}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <span style={{ fontSize: 13, color: C.textSub }}>
              Don't have an account? {" "}
              <Link to="/register" style={{ color: C.indigo, fontWeight: 700, textDecoration: "none" }}>
                Register here
              </Link>
            </span>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: "1.25rem", background: C.surface, borderRadius: 12, padding: "1rem 1.25rem", border: `1px dashed ${C.indigoBorder}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 10 }}>🧪 Demo — click to fill (auto-selects correct tab)</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => demoFill("student")}
              style={{ flex: 1, fontSize: 12, padding: "7px", borderRadius: 8, border: `1px solid ${C.indigoBorder}`, background: C.indigoBg, color: C.indigo, cursor: "pointer", fontWeight: 600 }}>
              🎓 Student login
            </button>
            <button type="button" onClick={() => demoFill("company")}
              style={{ flex: 1, fontSize: 12, padding: "7px", borderRadius: 8, border: `1px solid ${C.indigoBorder}`, background: C.indigoBg, color: C.indigo, cursor: "pointer", fontWeight: 600 }}>
              🏢 Company login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
