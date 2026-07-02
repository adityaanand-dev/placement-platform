import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  green: "#059669", greenBg: "#D1FAE5",
  amber: "#D97706", amberBg: "#FEF3C7",
  red: "#DC2626", redBg: "#FEE2E2",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", surface: "#FFFFFF",
};

const card = {
  background: C.surface,
  border: `0.5px solid ${C.border}`,
  borderRadius: 12,
  padding: "1.5rem",
  marginBottom: "1rem",
};

const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: `0.5px solid ${C.border}`, borderRadius: 8,
  background: C.surface, color: C.text, outline: "none",
};

const labelStyle = { fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 5, display: "block" };

const SKILL_OPTIONS = [
  "AWS", "GCP", "Azure", "Linux", "Docker", "Kubernetes",
  "Terraform", "CI/CD", "Python", "Git", "DevOps", "AI/ML",
  "Networking", "Ansible", "Jenkins",
];

const CERT_OPTIONS = [
  "AWS CLF-C02", "AWS SAA-C03", "Azure AZ-900", "GCP ACE",
  "NPTEL Cloud", "CKA (Kubernetes)", "Terraform Associate", "Docker DCA",
];

export default function StudentProfile() {
  const { currentUser, updateCurrentUser } = useApp();

  const [profile, setProfile] = useState({
    name:       currentUser?.name       || "",
    email:      currentUser?.email      || "",
    phone:      currentUser?.phone      || "",
    university: currentUser?.university || "",
    degree:     currentUser?.degree     || "B.Tech (CSE)",
    cgpa:       currentUser?.cgpa       || "",
    gradYear:   currentUser?.gradYear   || "2026",
    bio:        currentUser?.bio        || "",
    skills:     currentUser?.skills     || [],
    certs:      currentUser?.certs      || [],
    linkedin:   currentUser?.linkedin   || "",
    github:     currentUser?.github     || "",
  });

  const [newCert, setNewCert] = useState("");
  const [toast, setToast] = useState(null);

  // Sync profile state if context loads asynchronously
  useEffect(() => {
    if (currentUser) {
      setProfile((p) => ({
        ...p,
        name: currentUser.name || p.name,
        email: currentUser.email || p.email,
        phone: currentUser.phone || p.phone,
        university: currentUser.university || p.university,
        degree: currentUser.degree || p.degree,
        cgpa: currentUser.cgpa || p.cgpa,
        gradYear: currentUser.gradYear || p.gradYear,
        bio: currentUser.bio || p.bio,
        skills: currentUser.skills || p.skills,
        certs: currentUser.certs || p.certs,
        linkedin: currentUser.linkedin || p.linkedin,
        github: currentUser.github || p.github,
      }));
    }
  }, [currentUser]);

  const update = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleSkill = (skill) => {
    setProfile((p) => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter((s) => s !== skill)
        : [...p.skills, skill],
    }));
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    if (profile.certs.includes(newCert)) { showToast("Already added!"); return; }
    setProfile((p) => ({ ...p, certs: [...p.certs, newCert] }));
    setNewCert("");
  };

  const removeCert = (cert) => setProfile((p) => ({ ...p, certs: p.certs.filter((c) => c !== cert) }));

  // Profile completeness calculations
  const fields = [profile.name, profile.email, profile.phone, profile.bio, profile.linkedin, profile.github];
  const filled  = fields.filter(Boolean).length;
  const pct     = Math.round((filled / fields.length) * 100);

  const handleSave = () => {
    if (updateCurrentUser) {
      updateCurrentUser({ 
        ...currentUser,
        ...profile, 
        profileComplete: pct 
      });
      showToast("✅ Profile saved successfully!");
    }
  };

  // Safe generation of profile image initials
  const initials = profile.name
    ? profile.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "ST";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#111827", color: "#fff",
          fontSize: 13, padding: "12px 18px", borderRadius: 10, zIndex: 999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>👤 My profile</h1>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>Recruiters see this when you apply</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 600,
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          }}
        >Save profile</button>
      </div>

      {/* Completeness bar */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: C.text }}>Profile strength</span>
          <span style={{ color: pct >= 80 ? C.green : C.amber, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct >= 80 ? C.green : C.indigo,
            borderRadius: 3, transition: "width 0.5s ease",
          }} />
        </div>
        <p style={{ fontSize: 12, color: C.textHint, marginTop: 8 }}>
          {pct < 80 ? "Add your phone, bio, and LinkedIn to boost visibility with recruiters." : "Great — your profile looks strong!"}
        </p>
      </div>

      {/* Avatar + basic info */}
      <div style={{ ...card, display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", flexShrink: 0, margin: "0 auto" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: C.indigoBg, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: C.indigo, margin: "0 auto",
          }}>
            {initials}
          </div>
          <p style={{ fontSize: 11, color: C.textHint, marginTop: 8 }}>Photo coming soon</p>
        </div>
        <div style={{ flex: "1 1 400px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", minWidth: 0 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} value={profile.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="tel" placeholder="+91 98765 43210" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Graduation year</label>
            <input style={inputStyle} value={profile.gradYear} onChange={(e) => update("gradYear", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Education */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: "1rem" }}>🎓 Education</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label style={labelStyle}>University</label>
            <input style={inputStyle} value={profile.university} onChange={(e) => update("university", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Degree</label>
            <input style={inputStyle} value={profile.degree} onChange={(e) => update("degree", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>CGPA</label>
            <input style={inputStyle} value={profile.cgpa} onChange={(e) => update("cgpa", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: "1rem" }}>📝 Bio</h2>
        <textarea
          rows={4}
          placeholder="Tell recruiters about yourself — your interests, goals, and what makes you stand out…"
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
        <div style={{ fontSize: 11, color: C.textHint, marginTop: 4, textAlign: "right" }}>{profile.bio.length} / 500</div>
      </div>

      {/* Skills */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: "0.5rem" }}>⚡ Skills</h2>
        <p style={{ fontSize: 12, color: C.textSub, marginBottom: "1rem" }}>Select everything you're comfortable with</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SKILL_OPTIONS.map((skill) => {
            const active = profile.skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                style={{
                  fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                  background: active ? C.indigo : C.surface,
                  color:      active ? "#fff"   : C.textSub,
                  border:      `0.5px solid ${active ? C.indigo : C.border}`,
                  fontWeight: active ? 600 : 400, transition: "all 0.15s",
                }}
              >={skill}</button>
            );
          })}
        </div>
        {profile.skills.length > 0 && (
          <p style={{ fontSize: 12, color: C.textHint, marginTop: 10 }}>
            ✓ {profile.skills.length} skill{profile.skills.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Certifications */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: "1rem" }}>🏅 Certifications</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
          {profile.certs.map((cert) => (
            <span key={cert} style={{
              fontSize: 12, padding: "5px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 6,
              background: C.indigoBg, color: C.indigo, border: `0.5px solid ${C.indigoBorder}`,
            }}>
              ✓ {cert}
              <button
                type="button"
                onClick={() => removeCert(cert)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.indigo, fontSize: 14, padding: 0, lineHeight: 1 }}
              >×</button>
            </span>
          ))}
          {profile.certs.length === 0 && (
            <span style={{ fontSize: 13, color: C.textHint }}>No certifications added yet</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="">Select a certification…</option>
            {CERT_OPTIONS.filter((c) => !profile.certs.includes(c)).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCert}
            style={{
              background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 600,
              padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", flexShrink: 0,
            }}
          >+ Add</button>
        </div>
      </div>

      {/* Links */}
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: "1rem" }}>🔗 Links</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>LinkedIn URL</label>
            <input style={inputStyle} placeholder="https://linkedin.com/in/username" value={profile.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>GitHub URL</label>
            <input style={inputStyle} placeholder="https://github.com/username" value={profile.github} onChange={(e) => update("github", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Save button (bottom) */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <button
          onClick={handleSave}
          style={{
            background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 600,
            padding: "11px 28px", borderRadius: 10, border: "none", cursor: "pointer",
          }}
        >Save profile</button>
      </div>
    </div>
  );
}