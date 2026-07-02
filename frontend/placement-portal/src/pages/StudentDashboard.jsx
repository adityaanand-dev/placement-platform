import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { uploadResume } from "../utils/api"; // 🟢 Connected unified storage engine upload utility

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  indigo:      "#4F46E5",
  indigoBg:    "#EEF2FF",
  indigoBorder:"#C7D2FE",
  green:       "#059669",
  greenBg:     "#D1FAE5",
  amber:       "#D97706",
  amberBg:     "#FEF3C7",
  red:         "#DC2626",
  text:        "#111827",
  textSub:     "#6B7280",
  textHint:    "#9CA3AF",
  border:      "rgba(0,0,0,0.08)",
  surface:     "#FFFFFF",
  bg:          "#F8F7FF",
};

const card = {
  background: C.surface,
  border: `0.5px solid ${C.border}`,
  borderRadius: 12,
  padding: "1.25rem",
};

// ─── Fallback Mock Data Boundaries ─────────────────────────────────────────────
const FALLBACK_JOBS = [
  {
    id: 1,
    title: "Cloud Support Associate",
    company: "Amazon Web Services",
    location: "Hyderabad",
    tags: ["Cloud", "Linux"],
    hot: true,
    match: 89,
    iconBg: "#FFF3E0",
    iconColor: "#E65100",
    icon: "☁️",
  },
  {
    id: 2,
    title: "DevOps Intern",
    company: "Microsoft",
    location: "Bengaluru",
    tags: ["DevOps", "CI/CD", "Azure"],
    hot: false,
    match: 81,
    iconBg: "#E3F2FD",
    iconColor: "#1565C0",
    icon: "🔷",
  },
  {
    id: 3,
    title: "ML Ops Engineer (Fresher)",
    company: "Infosys",
    location: "Pune",
    tags: ["AI/ML", "Python", "Kubernetes"],
    hot: false,
    match: 67,
    iconBg: "#E8F5E9",
    iconColor: "#2E7D32",
    icon: "🤖",
  },
];

const FALLBACK_MEETINGS = [
  {
    id: 1,
    day: "25",
    month: "Jun",
    title: "Technical Round — TCS Digital",
    sub: "Cloud & DevOps screening",
    time: "10:00 AM · Google Meet",
    daysAway: 3,
    urgency: "soon",
  },
  {
    id: 2,
    day: "30",
    month: "Jun",
    title: "HR Round — Accenture",
    sub: "Post aptitude clearance",
    time: "2:00 PM · Zoom",
    daysAway: 8,
    urgency: "upcoming",
  },
];

const FALLBACK_PIPELINE = [
  { stage: "Applied", detail: "TCS Digital — Cloud Engineer", status: "done", label: "Submitted Jun 18" },
  { stage: "Technical screening", detail: "Scheduled Jun 25", status: "active", label: "In progress" },
  { stage: "HR round & offer", detail: "Pending technical result", status: "wait", label: "Waiting" },
];

const SKILLS = [
  { label: "Cloud (AWS/GCP)",     pct: 78, color: C.indigo },
  { label: "Linux & Networking",   pct: 65, color: C.indigo },
  { label: "DevOps / CI-CD",       pct: 52, color: C.green  },
  { label: "Kubernetes / Terraform",pct: 38, color: C.amber  },
  { label: "AI/ML Ops",            pct: 44, color: C.amber  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, subColor }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: subColor || C.textHint, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function MatchBadge({ pct }) {
  const high = pct >= 75;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      background: high ? C.greenBg : C.amberBg,
      color: high ? "#065F46" : "#92400E",
    }}>{pct}%</span>
  );
}

function JobCard({ job, onApply }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <div style={{
        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
        background: job.iconBg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18,
      }}>{job.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{job.title}</div>
        <div style={{ fontSize: 12, color: C.textSub }}>{job.company} · {job.location}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
          {job.tags.map((t) => (
            <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.indigoBg, color: C.indigo }}>{t}</span>
          ))}
          {job.hot && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.amberBg, color: "#92400E" }}>🔥 Hiring fast</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <MatchBadge pct={job.match} />
        <button
          onClick={() => onApply(job)}
          style={{
            fontSize: 12, color: C.indigo, border: `0.5px solid ${C.indigoBorder}`,
            borderRadius: 6, padding: "4px 10px", background: "none", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseOver={(e) => (e.target.style.background = C.indigoBg)}
          onMouseOut={(e) => (e.target.style.background = "none")}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function MeetingCard({ m }) {
  const urgencyStyle = m.urgency === "soon"
    ? { background: C.amberBg, color: "#92400E" }
    : { background: C.indigoBg, color: C.indigo };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.indigo, lineHeight: 1 }}>{m.day}</div>
        <div style={{ fontSize: 10, color: C.textSub, textTransform: "uppercase" }}>{m.month}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.title}</div>
        <div style={{ fontSize: 12, color: C.textSub }}>{m.sub}</div>
        <div style={{ fontSize: 11, color: C.textSub, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          🕐 {m.time}
        </div>
      </div>
      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, ...urgencyStyle, flexShrink: 0 }}>
        {m.daysAway} days
      </span>
    </div>
  );
}

function PipelineStep({ step, isLast }) {
  const colors = { done: C.green, active: C.indigo, wait: "#D1D5DB" };
  const badgeStyles = {
    done:   { background: C.greenBg,  color: "#065F46" },
    active: { background: C.indigoBg, color: C.indigo  },
    wait:   { background: "#F3F4F6",  color: C.textHint },
  };
  return (
    <div style={{ display: "flex", gap: 12, paddingBottom: isLast ? 0 : 4 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[step.status], marginTop: 4, flexShrink: 0 }} />
        {!isLast && <div style={{ flex: 1, width: 1, background: "#E5E7EB", margin: "3px 0" }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{step.stage}</div>
        <div style={{ fontSize: 12, color: C.textSub }}>{step.detail}</div>
        <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 4, marginTop: 4, ...badgeStyles[step.status] }}>
          {step.label}
        </span>
      </div>
    </div>
  );
}

function SkillBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSub, marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function UploadZone({ file, onFile, uploading }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") onFile(f);
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); !uploading && setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${dragging ? C.indigo : C.indigoBorder}`,
        borderRadius: 8, padding: "1.5rem", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer",
        background: dragging ? C.indigoBg : "#FAFBFF", transition: "all 0.15s",
        opacity: uploading ? 0.6 : 1
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        disabled={uploading}
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />
      <div style={{ fontSize: 28, marginBottom: 8 }}>
        {uploading ? "⏳" : file ? "✅" : "📤"}
      </div>
      {uploading ? (
        <p style={{ fontSize: 13, color: C.indigo, fontWeight: 600 }}>Syncing artifact with AWS S3 engine...</p>
      ) : file ? (
        <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>{file.name || "Resume Document Loaded"}</p>
      ) : (
        <>
          <p style={{ fontSize: 13, color: C.textSub }}>Drag your resume here</p>
          <span style={{ fontSize: 12, color: C.indigo, fontWeight: 600 }}>or click to choose a PDF</span>
          <p style={{ fontSize: 11, color: C.textHint, marginTop: 8 }}>Max 5 MB · PDF only</p>
        </>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const {
    currentUser, jobs, companies, studentInterviews, applyToJob,
    updateCurrentUser, unreadCount, myOffers, myNotifications,
  } = useApp();

  const [resumeFile, setResumeFile] = useState(currentUser?.resumeUrl || null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]           = useState(null);

  const user = currentUser;
  const displayName = user?.name || "Student";
  const firstName   = displayName.split(" ")[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const appliedIds = user?.appliedJobs || [];

  const liveJobs = jobs && jobs.length > 0
    ? jobs.slice(0, 3).map(j => {
        const company = companies?.find(c => c.id === j.companyId);
        return {
          id: j.id,
          title: j.title,
          company: company?.name || "Company",
          location: j.location,
          tags: j.requirements || [],
          hot: j.hot,
          match: j.match || 70,
          icon: "💼",
          iconBg: C.indigoBg,
        };
      })
    : FALLBACK_JOBS;

  const myInterviews = (user && studentInterviews) ? studentInterviews(user.id) : [];
  const liveMeetings = myInterviews.length > 0
    ? myInterviews.map(iv => ({
        id: iv.id,
        day: iv.date ? iv.date.split("-")[2] : "--",
        month: iv.date ? new Date(iv.date).toLocaleString("en-IN", { month: "short" }) : "",
        title: iv.title,
        sub: iv.jobTitle,
        time: `${iv.time} · ${iv.platform}`,
        daysAway: iv.date ? Math.max(0, Math.ceil((new Date(iv.date) - new Date()) / 86400000)) : 0,
        urgency: "soon",
      }))
    : FALLBACK_MEETINGS;

  const livePipeline = myInterviews.length > 0
    ? myInterviews.map(iv => ({
        stage: `${iv.round} round`,
        detail: `${iv.jobTitle} · ${iv.date}`,
        status: iv.status === "scheduled" ? "active" : "done",
        label: iv.status === "scheduled" ? "Scheduled" : "Completed",
      }))
    : FALLBACK_PIPELINE;

  const handleApply = (job) => {
    if (appliedIds.includes(job.id)) return;
    if (applyToJob) {
      applyToJob(job.id);
      showToast(`✅ Applied to ${job.title} at ${job.company}`);
    }
  };

  // ─── S3 Upload Handler ───────────────────────────────────────────────────────
  const handleResumeSelection = async (fileObj) => {
    if (!user?.id) {
      showToast("❌ Unable to verify current student context ID.");
      return;
    }
    
    setUploading(true);
    try {
      // Stream payload directly to AWS infrastructure components
      const result = await uploadResume(user.id, fileObj);
      const s3Key = result?.data?.key;

      if (updateCurrentUser) {
        // Hydrate localized global state targets
        updateCurrentUser({ ...user, resumeUrl: s3Key, profileComplete: Math.min(100, (user?.profileComplete || 40) + 20) });
      }
      
      setResumeFile(fileObj);
      showToast("📄 Resume compiled and deployed to secure S3 vault storage bucket!");
    } catch (err) {
      console.error("Cloud document pipeline failure:", err);
      showToast("❌ S3 deployment connection dropped. Please check bucket rules.");
    } finally {
      setUploading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const notifCount = (user && unreadCount) ? unreadCount(user.id) : 0;
  const profilePct = user?.profileComplete || 40;
  const recentNotifications = user && myNotifications
    ? myNotifications(user.id).slice().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 3)
    : [];
  const recentOffers = user && myOffers
    ? myOffers(user.id).slice().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 3)
    : [];
  const liveUpdates = [
    ...recentNotifications.map((item) => ({ ...item, kind: "notification" })),
    ...recentOffers.map((item) => ({ ...item, kind: "offer" })),
  ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#111827", color: "#fff",
          fontSize: 13, padding: "12px 18px", borderRadius: 10, zIndex: 999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }}>{toast}</div>
      )}

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Good morning, {firstName} 👋</h1>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>{today} — {liveJobs.length} job matches for your profile</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ background: C.indigoBg, color: C.indigo, fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: 600 }}>
            ⭐ Profile {profilePct}% complete
          </span>
          <button onClick={() => navigate("/student/messages")}
            style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            💬 Messages
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => navigate("/student/notifications")} style={{ background: "none", border: `0.5px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>🔔</button>
            {notifCount > 0 && (
              <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
            )}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      {!resumeFile && (
        <div style={{
          background: C.indigo, borderRadius: 12, padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem",
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Upload your resume to unlock AI-powered job matching</p>
            <span style={{ fontSize: 12, color: "#A5B4FC" }}>Get 3× more relevant recommendations with your resume on file</span>
          </div>
          <button
            onClick={() => document.getElementById("resume-click-gate").click()}
            style={{
              background: "#fff", color: C.indigo, fontSize: 13, fontWeight: 600,
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}
          >📤 Upload resume</button>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard icon="📤" label="Applications" value={appliedIds.length} sub={appliedIds.length === 0 ? "Apply to your first job" : "Tracked live"} />
        <StatCard icon="👁️" label="Profile views" value={12} sub="↑ +4 this week" subColor={C.green} />
        <StatCard icon="📅" label="Interviews" value={myInterviews.length} sub={myInterviews.length > 0 ? `Next: ${liveMeetings[0]?.title || ""}` : "None scheduled"} />
        <StatCard icon="🔖" label="Saved jobs" value={user?.savedJobs?.length || 0} sub="From job search" />
      </div>

      {liveUpdates.length > 0 && (
        <div style={{ ...card, marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>🔄 Recent company updates</span>
            <button onClick={() => navigate("/student/notifications")} style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer" }}>
              Open all →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {liveUpdates.map((update) => {
              const isOffer = update.kind === "offer";
              return (
                <div key={update.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0.7rem 0", borderBottom: `0.5px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: isOffer ? C.greenBg : C.indigoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isOffer ? "🎉" : "🔔"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{isOffer ? `Offer letter for ${update.jobTitle}` : update.title}</div>
                      <div style={{ fontSize: 12, color: C.textSub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {isOffer ? `${update.companyName} · ${update.ctc}` : update.body}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(isOffer ? "/student/offers" : "/student/notifications")} style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                    {isOffer ? "View offer" : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Row 1: Jobs + Meetings ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Recommended jobs */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>✨ Recommended for you</span>
            <button onClick={() => navigate("/student/jobs")} style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer" }}>
              See all →
            </button>
          </div>
          {liveJobs.map((job) => (
            <JobCard
              key={job.id}
              job={{ ...job, title: appliedIds.includes(job.id) ? `${job.title} (Applied ✓)` : job.title }}
              onApply={handleApply}
            />
          ))}
        </div>

        {/* Interviews + Pipeline */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>📅 Upcoming interviews</span>
            <button onClick={() => navigate("/student/meetings")} style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer" }}>
              View calendar →
            </button>
          </div>
          {liveMeetings.map((m) => <MeetingCard key={m.id} m={m} />)}

          <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: "1rem", marginTop: "0.75rem" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: "0.75rem" }}>🗺️ Application pipeline</div>
            {livePipeline.map((step, i) => (
              <PipelineStep key={i} step={step} isLast={i === livePipeline.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Resume + Skills ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Resume vault */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: "1rem" }}>📂 Resume vault</div>
          <div id="resume-click-gate">
            <UploadZone file={resumeFile} onFile={handleResumeSelection} uploading={uploading} />
          </div>
          <p style={{ fontSize: 12, color: C.textHint, textAlign: "center", marginTop: 12 }}>
            Recruiters can view your resume after you apply
          </p>
          {resumeFile && !uploading && (
            <button
              onClick={() => {
                setResumeFile(null);
                if (updateCurrentUser) updateCurrentUser({ ...user, resumeUrl: null });
              }}
              style={{ display: "block", margin: "8px auto 0", fontSize: 12, color: C.red, background: "none", border: "none", cursor: "pointer" }}
            >
              Remove file
            </button>
          )}
        </div>

        {/* Skill radar */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>📊 Skill match radar</span>
            <button onClick={() => navigate("/student/profile")} style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer" }}>
              Edit skills
            </button>
          </div>
          {SKILLS.map((s) => <SkillBar key={s.label} {...s} />)}
          <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(user?.certs || ["AWS CLF-C02", "NPTEL Cloud"]).map((cert) => (
              <span key={cert} style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 20,
                background: C.indigoBg, color: C.indigo, border: `0.5px solid ${C.indigoBorder}`,
                display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 500,
              }}>✓ {cert}</span>
            ))}
            <button
              onClick={() => navigate("/student/profile")}
              style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 20,
                background: "#F9FAFB", color: C.textSub, border: `0.5px solid ${C.border}`,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >+ Add cert</button>
          </div>
        </div>
      </div>
    </div>
  );
}