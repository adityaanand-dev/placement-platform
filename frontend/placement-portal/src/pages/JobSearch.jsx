import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  green: "#059669", greenBg: "#D1FAE5",
  amber: "#D97706", amberBg: "#FEF3C7",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", surface: "#FFFFFF",
};

const FALLBACK_JOBS = [
  { id: "f1", title: "Cloud Support Associate", company: "Amazon Web Services", location: "Hyderabad", type: "Full-time", category: "Cloud", match: 89, hot: true, icon: "☁️", iconBg: "#FFF3E0" },
];

const CATEGORIES = ["All", "Cloud", "DevOps", "AI/ML"];
const TYPES      = ["All", "Full-time", "Internship"];

const CATEGORY_ICON = { Cloud: "☁️", DevOps: "⚙️", "AI/ML": "🤖" };
const CATEGORY_BG   = { Cloud: "#FFF3E0", DevOps: "#F3E5F5", "AI/ML": "#E8F5E9" };

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12, padding: "5px 12px", borderRadius: 20,
        background: active ? C.indigo : C.surface,
        color:      active ? "#fff"   : C.textSub,
        border:     `0.5px solid ${active ? C.indigo : C.border}`,
        cursor: "pointer", transition: "all 0.15s", fontWeight: active ? 600 : 400,
      }}
    >{label}</button>
  );
}

function MatchBadge({ pct }) {
  const high = pct >= 75;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      background: high ? C.greenBg : C.amberBg,
      color:      high ? "#065F46" : "#92400E",
    }}>{pct}% match</span>
  );
}

export default function JobSearch() {
  const { currentUser, jobs, companies, applyToJob, updateCurrentUser } = useApp();

  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState("All");
  const [type,      setType]     = useState("All");
  const [location, setLocation] = useState("All");
  const [toast,    setToast]    = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Map raw context jobs into display shape ───────────────────────────────
  const allJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return FALLBACK_JOBS;
    return jobs.map(j => {
      const company = companies?.find(c => c.id === j.companyId);
      return {
        id: j.id,
        title: j.title,
        company: company?.name || "Company",
        location: j.location,
        type: j.type,
        category: j.category,
        match: j.match || 65,
        hot: j.hot,
        icon: CATEGORY_ICON[j.category] || "💼",
        iconBg: CATEGORY_BG[j.category] || C.indigoBg,
      };
    });
  }, [jobs, companies]);

  const locations = useMemo(() => {
    const set = new Set(allJobs.map(j => j.location));
    return ["All", ...Array.from(set)];
  }, [allJobs]);

  const filtered = useMemo(() => {
    return allJobs.filter((j) => {
      const q = query.toLowerCase();
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
      const matchC = category === "All" || j.category === category;
      const matchT = type     === "All" || j.type     === type;
      const matchL = location === "All" || j.location === location;
      return matchQ && matchC && matchT && matchL;
    }).sort((a, b) => b.match - a.match);
  }, [allJobs, query, category, type, location]);

  const applied = currentUser?.appliedJobs || [];
  const saved   = currentUser?.savedJobs   || [];

  const handleApply = (job) => {
    if (applied.includes(job.id)) return;
    if (applyToJob) {
      applyToJob(job.id);
      showToast(`✅ Applied to ${job.title} at ${job.company}`);
    }
  };

  const handleSave = (job) => {
    if (!updateCurrentUser) return;
    const next = saved.includes(job.id) ? saved.filter(x => x !== job.id) : [...saved, job.id];
    
    // 🟢 Fixed State Mutation Bug: Spreading currentUser preserves name/resume states during update
    updateCurrentUser({
      ...currentUser,
      savedJobs: next
    });
    
    showToast(saved.includes(job.id) ? "🏷️ Removed from saved jobs" : "🔖 Job saved successfully!");
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#111827", color: "#fff",
          fontSize: 13, padding: "12px 18px", borderRadius: 10, zIndex: 999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>{toast}</div>
      )}

      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>🔍 Search jobs</h1>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>{allJobs.length} openings matched to your profile</p>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input
          type="text"
          placeholder="Search by role, company, or skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px 10px 38px", fontSize: 14,
            border: `0.5px solid ${C.border}`, borderRadius: 10,
            background: C.surface, color: C.text, outline: "none",
          }}
        />
      </div>

      {/* 📊 Restructured Multi-Row Filter Controls */}
      <div style={{ 
        background: C.surface, 
        border: `0.5px solid ${C.border}`, 
        borderRadius: 12, 
        padding: "1rem 1.25rem", 
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textSub, width: 70, fontWeight: 500 }}>Category:</span>
          {CATEGORIES.map((c) => <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />)}
        </div>
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textSub, width: 70, fontWeight: 500 }}>Type:</span>
          {TYPES.map((t) => <FilterChip key={t} label={t} active={type === t} onClick={() => setType(t)} />)}
        </div>
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textSub, width: 70, fontWeight: 500 }}>City:</span>
          {locations.map((l) => <FilterChip key={l} label={l} active={location === l} onClick={() => setLocation(l)} />)}
        </div>
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: C.textHint, fontSize: 14 }}>
            No jobs matched your filters. Try broadening the search.
          </div>
        )}
        {filtered.map((job) => (
          <div key={job.id} style={{
            background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12,
            padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: job.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>{job.icon}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{job.title}</span>
                {job.hot && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.amberBg, color: "#92400E" }}>🔥 Hiring fast</span>}
              </div>
              <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{job.company} · {job.location}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#F3F4F6", color: C.textSub }}>{job.type}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.indigoBg, color: C.indigo }}>{job.category}</span>
                <MatchBadge pct={job.match} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => handleSave(job)}
                style={{
                  fontSize: 18, background: "none", border: "none", cursor: "pointer",
                  color: saved.includes(job.id) ? C.indigo : C.textHint,
                }}
                title={saved.includes(job.id) ? "Unsave" : "Save job"}
              >{saved.includes(job.id) ? "🔖" : "🏷️"}</button>
              <button
                onClick={() => handleApply(job)}
                disabled={applied.includes(job.id)}
                style={{
                  fontSize: 13, fontWeight: 600,
                  padding: "7px 16px", borderRadius: 8, cursor: applied.includes(job.id) ? "default" : "pointer",
                  background: applied.includes(job.id) ? C.greenBg : C.indigo,
                  color:      applied.includes(job.id) ? "#065F46" : "#fff",
                  border: "none", transition: "all 0.15s",
                }}
              >{applied.includes(job.id) ? "✓ Applied" : "Apply now"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}