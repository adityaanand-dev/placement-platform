import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", text: "#111827", textSub: "#6B7280",
  border: "rgba(0,0,0,0.1)", surface: "#FFFFFF", red: "#DC2626", redBg: "#FEE2E2",
};

const inp = {
  width: "100%", padding: "11px 14px", fontSize: 14,
  border: `1px solid ${C.border}`, borderRadius: 10,
  background: C.surface, color: C.text, outline: "none",
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, sendVerificationEmail } = useApp();

  const { email: initialEmail = "" } = location.state || {};

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !code.trim()) {
      setError("Enter both email and verification code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = verifyEmail(email, code);
      if (!result.ok) {
        setError(result.error);
      } else {
        setMessage("Your email is verified. You can now log in.");
      }
      setLoading(false);
    }, 400);
  };

  const handleResend = () => {
    if (!email.trim()) {
      setError("Enter your registered email to resend the code.");
      return;
    }
    setError("");
    setMessage("");
    const codeSent = sendVerificationEmail(email);
    if (!codeSent) {
      setError("No account found with this email.");
      return;
    }
    setMessage("A fresh verification code was sent. Check your inbox.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF 0%, #F8F7FF 50%, #F0FDF4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ background: C.surface, borderRadius: 18, boxShadow: "0 4px 32px rgba(79,70,229,0.08)", padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: 46, height: 46, margin: "0 auto 12px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff", fontSize: 24 }}>🔐</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Verify your email</h1>
            <p style={{ fontSize: 14, color: C.textSub, marginTop: 4 }}>Enter the code we sent to your email.</p>
          </div>

          {error && (
            <div style={{ background: C.redBg, color: C.red, fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: "1rem" }}>
              ⚠️ {error}
            </div>
          )}
          {message && (
            <div style={{ background: "#ECFDF5", color: "#065F46", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: "1rem" }}>
              ✅ {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, color: C.textSub, fontSize: 13, fontWeight: 600 }}>Registered email</label>
              <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, color: C.textSub, fontSize: 13, fontWeight: 600 }}>Verification code</label>
              <input style={inp} type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#A5B4FC" : C.indigo, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Verifying…" : "Verify email"}
            </button>
          </form>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
            <button type="button" onClick={handleResend}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.indigo}`, background: "transparent", color: C.indigo, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Resend code
            </button>
            <button type="button" onClick={() => navigate("/login")}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Back to login
            </button>
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: 13, color: C.textSub, textAlign: "center" }}>
            Already verified? <Link to="/login" style={{ color: C.indigo, fontWeight: 700, textDecoration: "none" }}>Sign in now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
