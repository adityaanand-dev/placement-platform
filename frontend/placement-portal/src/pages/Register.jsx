import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  green: "#059669", greenBg: "#D1FAE5",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.1)", surface: "#FFFFFF", bg: "#F8F7FF",
  red: "#DC2626", redBg: "#FEE2E2",
};

const inp = {
  width: "100%", padding: "11px 14px", fontSize: 13.5,
  border: `1px solid ${C.border}`, borderRadius: 10,
  background: C.surface, color: C.text, outline: "none",
};

const lbl = { fontSize: 12, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 5 };

const SKILLS_LIST = ["AWS", "GCP", "Azure", "Linux", "Docker", "Kubernetes", "Terraform", "Python", "CI/CD", "DevOps", "AI/ML", "Networking"];
const DEGREES     = ["B.Tech (CSE)", "B.Tech (ECE)", "B.Tech (IT)", "BCA", "MCA", "B.Sc (CS)", "MBA", "Other"];
const INDUSTRIES  = ["IT Services", "Cloud / Technology", "BFSI", "E-Commerce", "Healthcare", "Consulting", "Manufacturing", "Other"];
const COMPANY_SIZES = ["1–50", "51–500", "501–5000", "5001–50000", "50000+"];

// ── Shared step indicator ─────────────────────────────────────────────────────
function StepBar({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "unset" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
              background: i < current ? C.green : i === current ? C.indigo : "#E5E7EB",
              color: i <= current ? "#fff" : C.textHint,
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10, marginTop: 4, color: i === current ? C.indigo : C.textHint, fontWeight: i === current ? 700 : 400, whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? C.green : "#E5E7EB", margin: "0 6px", marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT REGISTRATION  (3 steps)
// ─────────────────────────────────────────────────────────────────────────────
function StudentRegister({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    university: "", degree: "B.Tech (CSE)", cgpa: "", gradYear: "2026",
    address: "", city: "", state: "",
    skills: [], bio: "", linkedin: "", github: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSkill = (s) =>
    setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s] }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
        setError("Please fill all required fields.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords don't match.");
        return false;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
    }
    if (step === 1) {
      if (!form.university.trim() || !form.cgpa.trim() || !form.city.trim()) {
        setError("Please fill all required fields.");
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 700));
      await onSuccess(form);
    } catch (err) {
      setError(err?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Account", "Education", "Profile"];

  return (
    <>
      <StepBar steps={STEPS} current={step} />

      {error && (
        <div style={{ background: C.redBg, color: C.red, fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step 0: Account */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Account details</h3>
          <Field label="Full name" required>
            <input style={inp} placeholder="Aditya Anand" value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Email address" required>
              <input style={inp} type="email" placeholder="you@college.edu" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Phone number" required>
              <input style={inp} type="tel" placeholder="98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Password" required>
              <input style={inp} type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
            </Field>
            <Field label="Confirm password" required>
              <input style={inp} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 1: Education */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Education & location</h3>
          <Field label="University / College" required>
            <input style={inp} placeholder="Haridwar University" value={form.university} onChange={e => set("university", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <Field label="Degree">
              <select style={inp} value={form.degree} onChange={e => set("degree", e.target.value)}>
                {DEGREES.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="CGPA" required>
              <input style={inp} placeholder="7.5" value={form.cgpa} onChange={e => set("cgpa", e.target.value)} />
            </Field>
            <Field label="Grad year">
              <select style={inp} value={form.gradYear} onChange={e => set("gradYear", e.target.value)}>
                {["2024","2025","2026","2027","2028"].map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="City" required>
              <input style={inp} placeholder="Roorkee" value={form.city} onChange={e => set("city", e.target.value)} />
            </Field>
            <Field label="State">
              <input style={inp} placeholder="Uttarakhand" value={form.state} onChange={e => set("state", e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 2: Profile & skills */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Your profile & skills</h3>
          <Field label="Short bio">
            <textarea style={{ ...inp, resize: "vertical" }} rows={3} placeholder="Tell recruiters about yourself…" value={form.bio} onChange={e => set("bio", e.target.value)} />
          </Field>
          <Field label="Technical skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {SKILLS_LIST.map(s => {
                const active = form.skills.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSkill(s)}
                    style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                      background: active ? C.indigo : C.surface,
                      color: active ? "#fff" : C.textSub,
                      border: `1px solid ${active ? C.indigo : C.border}`,
                      fontWeight: active ? 600 : 400, transition: "all 0.15s",
                    }}>{s}</button>
                );
              })}
            </div>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="LinkedIn URL">
              <input style={inp} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} />
            </Field>
            <Field label="GitHub URL">
              <input style={inp} placeholder="github.com/username" value={form.github} onChange={e => set("github", e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            ← Back
          </button>
        )}
        {step < 2
          ? <button type="button" onClick={next} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Next →
            </button>
          : <button type="button" onClick={submit} disabled={loading}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: loading ? "#A5B4FC" : C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Creating account…" : "✓ Create student account"}
            </button>
        }
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPANY REGISTRATION  (2 steps)
// ─────────────────────────────────────────────────────────────────────────────
function CompanyRegister({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
    website: "", industry: "IT Services", size: "501–5000", founded: "",
    hrName: "", hrDesignation: "", hrPhone: "",
    description: "", city: "", state: "", gstNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.password || !form.hrName.trim()) {
        setError("Please fill all required fields.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords don't match.");
        return false;
      }
    }
    if (step === 1) {
      if (!form.industry || !form.city.trim()) {
        setError("Please fill all required fields.");
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 700));
      await onSuccess(form);
    } catch (err) {
      setError(err?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Account & HR", "Company details"];

  return (
    <>
      <StepBar steps={STEPS} current={step} />

      {error && (
        <div style={{ background: C.redBg, color: C.red, fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Company & HR contact</h3>
          <Field label="Company name" required>
            <input style={inp} placeholder="TCS Digital" value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Official email" required>
              <input style={inp} type="email" placeholder="hr@company.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Company phone">
              <input style={inp} type="tel" placeholder="0120-1234567" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Password" required>
              <input style={inp} type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
            </Field>
            <Field label="Confirm password" required>
              <input style={inp} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
            </Field>
          </div>
          <div style={{ height: 1, background: C.border, margin: "0.25rem 0" }} />
          <h4 style={{ fontSize: 14, fontWeight: 700, color: C.textSub }}>HR Point of Contact</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="HR full name" required>
              <input style={inp} placeholder="Meena Iyer" value={form.hrName} onChange={e => set("hrName", e.target.value)} />
            </Field>
            <Field label="Designation">
              <input style={inp} placeholder="Talent Acquisition Lead" value={form.hrDesignation} onChange={e => set("hrDesignation", e.target.value)} />
            </Field>
          </div>
          <Field label="HR direct phone">
            <input style={inp} type="tel" placeholder="98765 43210" value={form.hrPhone} onChange={e => set("hrPhone", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Company details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Industry" required>
              <select style={inp} value={form.industry} onChange={e => set("industry", e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Company size">
              <select style={inp} value={form.size} onChange={e => set("size", e.target.value)}>
                {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Founded year">
              <input style={inp} placeholder="2005" value={form.founded} onChange={e => set("founded", e.target.value)} />
            </Field>
            <Field label="Website">
              <input style={inp} placeholder="https://company.com" value={form.website} onChange={e => set("website", e.target.value)} />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="City" required>
              <input style={inp} placeholder="Mumbai" value={form.city} onChange={e => set("city", e.target.value)} />
            </Field>
            <Field label="GST / CIN number">
              <input style={inp} placeholder="27AABCU9603R1ZX" value={form.gstNumber} onChange={e => set("gstNumber", e.target.value)} />
            </Field>
          </div>
          <Field label="Brief description">
            <textarea style={{ ...inp, resize: "vertical" }} rows={3} placeholder="What does your company do?" value={form.description} onChange={e => set("description", e.target.value)} />
          </Field>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            ← Back
          </button>
        )}
        {step < 1
          ? <button type="button" onClick={next} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Next →
            </button>
          : <button type="button" onClick={submit} disabled={loading}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: loading ? "#A5B4FC" : C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Registering…" : "✓ Create company account"}
            </button>
        }
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { registerStudent, registerCompany } = useApp();
  const [tab, setTab] = useState("student");

  const handleStudentSuccess = async (data) => {
    if (!registerStudent) return;
    const res = await registerStudent(data);
    if (res?.ok) {
      navigate("/student/dashboard");
    } else {
      throw new Error(res?.error || "Student profile creation rejected.");
    }
  };

  const handleCompanySuccess = async (data) => {
    if (!registerCompany) return;
    const res = await registerCompany(data);
    if (res?.ok) {
      navigate("/company/dashboard");
    } else {
      throw new Error(res?.error || "Company profile creation rejected.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF 0%, #F8F7FF 50%, #F0FDF4 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 540 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 10px" }}>🚀</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Create your LaunchPad account</h1>
        </div>

        <div style={{ background: C.surface, borderRadius: 18, boxShadow: "0 4px 32px rgba(79,70,229,0.1)", padding: "2rem" }}>
          {/* Tab */}
          <div style={{ display: "flex", background: C.bg, borderRadius: 12, padding: 4, marginBottom: "1.75rem" }}>
            {["student", "company"].map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: tab === t ? 700 : 400,
                  background: tab === t ? C.indigo : "transparent",
                  color:      tab === t ? "#fff"   : C.textSub,
                  transition: "all 0.2s",
                }}>
                {t === "student" ? "🎓 I'm a Student" : "🏢 I'm a Company"}
              </button>
            ))}
          </div>

          {tab === "student"
            ? <StudentRegister onSuccess={handleStudentSuccess} />
            : <CompanyRegister onSuccess={handleCompanySuccess} />
          }

          <p style={{ textAlign: "center", fontSize: 13, color: C.textSub, marginTop: "1.25rem" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: C.indigo, fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}