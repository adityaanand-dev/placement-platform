import { useState } from "react";
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
  padding: "1.25rem",
};

// Fallback safeguard data array
const FALLBACK_MEETINGS = {
  upcoming: [
    {
      id: 1, day: 25, month: "Jun", year: 2026, weekday: "Thu",
      title: "Technical Round — TCS Digital",
      company: "TCS Digital",
      role: "Cloud Support Engineer",
      time: "10:00 AM",
      duration: "45 mins",
      platform: "Google Meet",
      link: "https://meet.google.com/abc-def-ghi",
      round: "Technical",
      prep: ["Data Structures", "Cloud concepts (AWS)", "Linux commands"],
      daysAway: 3,
    },
    {
      id: 2, day: 30, month: "Jun", year: 2026, weekday: "Tue",
      title: "HR Round — Accenture",
      company: "Accenture",
      role: "Cloud Operations Analyst",
      time: "2:00 PM",
      duration: "30 mins",
      platform: "Zoom",
      link: "https://zoom.us/j/1234567890",
      round: "HR",
      prep: ["Behavioral questions", "Company research", "Career goals"],
      daysAway: 8,
    },
    {
      id: 3, day: 5, month: "Jul", year: 2026, weekday: "Sun",
      title: "Technical + Managerial — Wipro",
      company: "Wipro",
      role: "AWS Cloud Trainee",
      time: "11:30 AM",
      duration: "60 mins",
      platform: "Microsoft Teams",
      link: "https://teams.microsoft.com/l/meetup/join",
      round: "Technical + Managerial",
      prep: ["AWS core services", "Networking fundamentals", "Project walkthrough"],
      daysAway: 13,
    },
  ],
  past: [
    {
      id: 4, day: 15, month: "Jun", year: 2026, weekday: "Mon",
      title: "Aptitude Test — Cognizant",
      company: "Cognizant",
      role: "Graduate Engineer Trainee",
      time: "9:00 AM",
      duration: "90 mins",
      platform: "Online",
      link: null,
      round: "Aptitude",
      result: "Cleared ✓",
      resultType: "pass",
    },
    {
      id: 5, day: 10, month: "Jun", year: 2026, weekday: "Wed",
      title: "Online Assessment — Infosys",
      company: "Infosys",
      role: "ML Ops Engineer",
      time: "3:00 PM",
      duration: "60 mins",
      platform: "Online",
      link: null,
      round: "OA",
      result: "Awaiting result",
      resultType: "pending",
    },
  ],
};

function PlatformIcon({ platform }) {
  const map = { "Google Meet": "🎥", "Zoom": "💻", "Microsoft Teams": "🔵", "Online": "🌐" };
  return <span>{map[platform] || "📹"}</span>;
}

function DaysAwayBadge({ days }) {
  if (days <= 3)  return <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: C.redBg,   color: C.red   }}>In {days} day{days !== 1 ? "s" : ""}</span>;
  if (days <= 7)  return <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: C.amberBg, color: C.amber }}>In {days} days</span>;
  return               <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: C.indigoBg, color: C.indigo }}>In {days} days</span>;
}

function UpcomingCard({ m }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ ...card, marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        {/* Date block */}
        <div style={{
          width: 56, textAlign: "center", flexShrink: 0,
          background: C.indigoBg, borderRadius: 10, padding: "8px 4px",
        }}>
          <div style={{ fontSize: 10, color: C.indigo, textTransform: "uppercase", fontWeight: 700 }}>{m.month}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.indigo, lineHeight: 1.1 }}>{m.day}</div>
          <div style={{ fontSize: 10, color: C.textSub }}>{m.weekday}</div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.title}</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.indigoBg, color: C.indigo }}>{m.round}</span>
          </div>
          <div style={{ fontSize: 13, color: C.textSub, marginTop: 3 }}>{m.company} · {m.role}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.textSub }}>🕐 {m.time} ({m.duration})</span>
            <span style={{ fontSize: 12, color: C.textSub, display: "flex", alignItems: "center", gap: 4 }}>
              <PlatformIcon platform={m.platform} /> {m.platform}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
          <DaysAwayBadge days={m.daysAway} />
          {m.link && (
            <a
              href={m.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 8,
                background: C.indigo, color: "#fff", textDecoration: "none", display: "inline-block",
              }}
            >Join meeting →</a>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ fontSize: 12, color: C.indigo, background: "none", border: "none", cursor: "pointer" }}
          >{expanded ? "▲ Hide prep" : "▼ Prep tips"}</button>
        </div>
      </div>

      {/* Prep tips */}
      {expanded && (
        <div style={{
          marginTop: "1rem", paddingTop: "1rem",
          borderTop: `0.5px solid ${C.border}`,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 8 }}>📚 What to prepare</p>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {m.prep.map((p) => (
              <li key={p} style={{
                fontSize: 12, padding: "5px 12px", borderRadius: 20,
                background: "#F3F4F6", color: C.textSub, border: `0.5px solid ${C.border}`,
              }}>✏️ {p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PastCard({ m }) {
  const resultStyles = {
    pass:    { background: C.greenBg, color: "#065F46" },
    fail:    { background: C.redBg,   color: C.red       },
    pending: { background: C.amberBg, color: "#92400E" },
  };
  return (
    <div style={{
      ...card, marginBottom: "0.75rem",
      opacity: 0.8,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 56, textAlign: "center", flexShrink: 0, background: "#F3F4F6", borderRadius: 10, padding: "8px 4px" }}>
        <div style={{ fontSize: 10, color: C.textHint, textTransform: "uppercase", fontWeight: 700 }}>{m.month}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.textSub, lineHeight: 1.1 }}>{m.day}</div>
        <div style={{ fontSize: 10, color: C.textHint }}>{m.weekday}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.title}</div>
        <div style={{ fontSize: 13, color: C.textSub }}>{m.company} · {m.role}</div>
        <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>🕐 {m.time} · {m.duration}</div>
      </div>
      <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600, flexShrink: 0, ...resultStyles[m.resultType] }}>
        {m.result}
      </span>
    </div>
  );
}

export default function MeetingsCalendar() {
  const [tab, setTab] = useState("upcoming");
  const { currentUser, studentInterviews } = useApp();

  const myInterviews = currentUser && studentInterviews ? studentInterviews(currentUser.id) : [];

  const liveUpcoming = myInterviews
    .filter(iv => iv.status === "scheduled")
    .map(iv => {
      const d = iv.date ? new Date(iv.date) : null;
      const daysAway = d ? Math.max(0, Math.ceil((d - new Date()) / 86400000)) : 0;
      return {
        id: iv.id,
        day: d ? d.getDate() : "--",
        month: d ? d.toLocaleString("en-IN", { month: "short" }) : "",
        year: d ? d.getFullYear() : "",
        weekday: d ? d.toLocaleString("en-IN", { weekday: "short" }) : "",
        title: iv.title,
        company: iv.companyName,
        role: iv.jobTitle,
        time: iv.time,
        duration: iv.duration,
        platform: iv.platform,
        link: iv.link,
        round: iv.round,
        prep: iv.message ? [iv.message] : ["Check your portal for details"],
        daysAway,
      };
    });

  const livePast = myInterviews
    .filter(iv => iv.status !== "scheduled")
    .map(iv => {
      const d = iv.date ? new Date(iv.date) : null;
      return {
        id: iv.id,
        day: d ? d.getDate() : "--",
        month: d ? d.toLocaleString("en-IN", { month: "short" }) : "",
        year: d ? d.getFullYear() : "",
        weekday: d ? d.toLocaleString("en-IN", { weekday: "short" }) : "",
        title: iv.title,
        company: iv.companyName,
        role: iv.jobTitle,
        time: iv.time,
        duration: iv.duration,
        platform: iv.platform,
        link: null,
        round: iv.round,
        result: iv.status === "completed" ? "Completed" : iv.status,
        resultType: iv.status === "completed" ? "pass" : "pending",
      };
    });

  const MEETINGS = myInterviews.length > 0
    ? { upcoming: liveUpcoming, past: livePast }
    : FALLBACK_MEETINGS;

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        fontSize: 13, fontWeight: tab === id ? 700 : 400, padding: "8px 20px",
        borderBottom: tab === id ? `2px solid ${C.indigo}` : "2px solid transparent",
        color: tab === id ? C.indigo : C.textSub,
        background: "none", border: "none",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >{label}</button>
  );

  const nextInterview = MEETINGS.upcoming[0];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>📅 Interviews & meetings</h1>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>{MEETINGS.upcoming.length} upcoming · {MEETINGS.past.length} completed</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>📅 Next interview</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.indigo }}>
            {nextInterview ? `${nextInterview.month} ${nextInterview.day}` : "None scheduled"}
          </div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
            {nextInterview ? `${nextInterview.company} · ${nextInterview.time}` : "Apply to jobs to get started"}
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>✅ Rounds cleared</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.green, lineHeight: 1 }}>
            {MEETINGS.past.filter(m => m.resultType === "pass").length}
          </div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Out of {MEETINGS.past.length} completed</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>🗓️ Total scheduled</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{MEETINGS.upcoming.length}</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>In next 30 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `0.5px solid ${C.border}`, marginBottom: "1.25rem", display: "flex" }}>
        <TabBtn id="upcoming" label={`Upcoming (${MEETINGS.upcoming.length})`} />
        <TabBtn id="past"     label={`Past (${MEETINGS.past.length})`} />
      </div>

      {/* Lists */}
      {tab === "upcoming" && (
        MEETINGS.upcoming.length > 0
          ? MEETINGS.upcoming.map((m) => <UpcomingCard key={m.id} m={m} />)
          : <div style={{ textAlign: "center", padding: "3rem", color: C.textHint, fontSize: 14 }}>No upcoming interviews yet. Keep applying! 🚀</div>
      )}

      {tab === "past" && (
        MEETINGS.past.length > 0
          ? MEETINGS.past.map((m) => <PastCard key={m.id} m={m} />)
          : <div style={{ textAlign: "center", padding: "3rem", color: C.textHint, fontSize: 14 }}>No past interviews on record.</div>
      )}
    </div>
  );
}