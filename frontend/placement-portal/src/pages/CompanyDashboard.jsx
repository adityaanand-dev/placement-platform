import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  purple: "#7C3AED", purpleBg: "#EDE9FE",
  green: "#059669", greenBg: "#D1FAE5",
  amber: "#D97706", amberBg: "#FEF3C7",
  red: "#DC2626", redBg: "#FEE2E2",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", surface: "#FFFFFF",
};

const card = { background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "1.25rem" };
const inp  = { width: "100%", padding: "9px 12px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, outline: "none" };
const lbl  = { fontSize: 12, fontWeight: 700, color: C.textSub, display: "block", marginBottom: 5 };

// Safe date formatter — avoids timezone shifts and Safari Date() parsing bugs.
// Always use YYYY-MM-DD strings split manually, never new Date("YYYY-MM-DD") directly.
const formatMonthShort = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return "";
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleString("en-IN", { month: "short" });
};

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: C.surface, borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.textHint }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Student row ───────────────────────────────────────────────────────────────
function StudentRow({ student, companyJobs, onSchedule, onOffer, onNotify, onMessage }) {
  const initials = student.name
    ? student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "ST";
  const applied  = companyJobs.some(j => j.applicants?.includes(student.id));

  return (
    <tr style={{ borderBottom: `0.5px solid ${C.border}` }}>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.indigoBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.indigo, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{student.name}</div>
            <div style={{ fontSize: 11, color: C.textSub }}>{student.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 10px", fontSize: 12, color: C.textSub }}>{student.university}</td>
      <td style={{ padding: "12px 10px", fontSize: 12, color: C.textSub }}>{student.degree}</td>
      <td style={{ padding: "12px 10px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: parseFloat(student.cgpa) >= 7.5 ? C.green : C.amber }}>{student.cgpa}</span>
      </td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(student.skills || []).slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: C.indigoBg, color: C.indigo }}>{s}</span>
          ))}
          {(student.skills || []).length > 3 && <span style={{ fontSize: 10, color: C.textHint }}>+{student.skills.length - 3}</span>}
        </div>
      </td>
      <td style={{ padding: "12px 10px" }}>
        {applied && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: C.greenBg, color: C.green, fontWeight: 600 }}>Applied ✓</span>}
      </td>
      <td style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onSchedule(student)} title="Schedule interview"
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.indigoBorder}`, background: C.indigoBg, color: C.indigo, cursor: "pointer", fontWeight: 600 }}>
            📅 Interview
          </button>
          <button onClick={() => onOffer(student)} title="Generate offer letter"
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid #BBF7D0`, background: C.greenBg, color: C.green, cursor: "pointer", fontWeight: 600 }}>
            📄 Offer
          </button>
          <button onClick={() => onNotify(student)} title="Send notification"
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#F9FAFB", color: C.textSub, cursor: "pointer", fontWeight: 600 }}>
            🔔 Notify
          </button>
          <button onClick={() => onMessage(student)} title="Message student"
            style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.indigoBorder}`, background: C.indigoBg, color: C.indigo, cursor: "pointer", fontWeight: 600 }}>
            💬 Message
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Schedule interview modal ──────────────────────────────────────────────────
function ScheduleModal({ student, jobs, onClose }) {
  const { scheduleInterview, currentUser } = useApp();
  const [form, setForm] = useState({
    jobId: jobs[0]?.id || "", round: "Technical", date: "", time: "",
    duration: "45 mins", platform: "Google Meet",
    link: "https://meet.google.com/", message: "",
  });
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.jobId) return alert("Please select a job role first or post an active listing.");
    if (!form.date || !form.time) return alert("Please fill date and time.");
    const job = jobs.find(j => j.id === form.jobId);
    scheduleInterview({
      ...form,
      studentId: student.id, studentName: student.name,
      companyId: currentUser.id, companyName: currentUser.name,
      jobTitle: job?.title || "",
      title: `${form.round} Round — ${currentUser.name}`,
    });
    setDone(true);
  };

  if (done) return (
    <Modal title="✅ Interview scheduled!" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
        <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Notification sent to {student.name}</p>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 6 }}>{form.date} at {form.time} via {form.platform}</p>
        <button onClick={onClose} style={{ marginTop: "1.25rem", padding: "10px 24px", borderRadius: 8, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal title={`📅 Schedule interview — ${student.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div>
          <label style={lbl}>Job role</label>
          {jobs.length === 0 ? (
            <div style={{ fontSize: 12, color: C.red, padding: "8px 0" }}>
              No active jobs posted yet. Use "+ Post new job" first.
            </div>
          ) : (
            <select style={inp} value={form.jobId} onChange={e => set("jobId", e.target.value)}>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={lbl}>Round type</label>
            <select style={inp} value={form.round} onChange={e => set("round", e.target.value)}>
              {["Aptitude", "Technical", "Technical + Managerial", "HR", "Final"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Platform</label>
            <select style={inp} value={form.platform} onChange={e => set("platform", e.target.value)}>
              {["Google Meet", "Zoom", "Microsoft Teams", "Phone call", "In-person"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={lbl}>Date</label>
            <input style={inp} type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Time</label>
            <input style={inp} type="time" value={form.time} onChange={e => set("time", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Duration</label>
            <select style={inp} value={form.duration} onChange={e => set("duration", e.target.value)}>
              {["30 mins", "45 mins", "60 mins", "90 mins"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Meeting link</label>
          <input style={inp} placeholder="https://meet.google.com/..." value={form.link} onChange={e => set("link", e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Message to student</label>
          <textarea style={{ ...inp, resize: "vertical" }} rows={3} placeholder="Preparation tips, documents to bring, dress code…" value={form.message} onChange={e => set("message", e.target.value)} />
        </div>
        <button onClick={submit}
          style={{ padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          📅 Schedule & notify student
        </button>
      </div>
    </Modal>
  );
}

// ── Offer letter modal ────────────────────────────────────────────────────────
function OfferModal({ student, jobs, onClose }) {
  const { generateOfferLetter, currentUser } = useApp();
  const [form, setForm] = useState({
    jobId: jobs[0]?.id || "", jobTitle: jobs[0]?.title || "",
    ctc: "", joiningDate: "", location: "",
    probation: "6 months", bond: "None",
    additionalPerks: "",
  });
  const [preview, setPreview] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleJobChange = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    set("jobId", jobId); set("jobTitle", job?.title || ""); set("location", job?.location || "");
  };

  const issue = () => {
    if (!form.jobId) return alert("Please select a valid job listing.");
    if (!form.ctc || !form.joiningDate) return alert("Please fill CTC and joining date.");
    generateOfferLetter({
      studentId: student.id, studentName: student.name,
      jobId: form.jobId, jobTitle: form.jobTitle,
      ctc: form.ctc, joiningDate: form.joiningDate,
      location: form.location, probation: form.probation,
      bond: form.bond, additionalPerks: form.additionalPerks,
    });
    setDone(true);
  };

  if (done) return (
    <Modal title="🎉 Offer letter issued!" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Offer sent to {student.name}</p>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 6 }}>CTC: {form.ctc} · Joining: {form.joiningDate}</p>
        <button onClick={onClose} style={{ marginTop: "1.25rem", padding: "10px 24px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Done</button>
      </div>
    </Modal>
  );

  if (preview) return (
    <Modal title="📄 Offer Letter Preview" onClose={() => setPreview(false)}>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.5rem", fontFamily: "'Times New Roman', serif", fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{currentUser?.name || "Company"}</div>
          <div style={{ fontSize: 12, color: C.textSub }}>{currentUser?.city} | {currentUser?.website}</div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, textDecoration: "underline" }}>OFFER LETTER</div>
        </div>
        <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        <p style={{ marginTop: 8 }}>Dear <strong>{student.name}</strong>,</p>
        <p style={{ marginTop: 8 }}>
          We are pleased to offer you the position of <strong>{form.jobTitle || "Selected Profile"}</strong> at <strong>{currentUser?.name || "our company"}</strong>.
          After reviewing your profile and interviews, we are confident you will be a great addition to our team.
        </p>
        <div style={{ margin: "1rem 0", padding: "1rem", background: "#F9FAFB", borderRadius: 8 }}>
          <p><strong>Role:</strong> {form.jobTitle}</p>
          <p><strong>CTC:</strong> {form.ctc}</p>
          <p><strong>Location:</strong> {form.location}</p>
          <p><strong>Joining date:</strong> {form.joiningDate}</p>
          <p><strong>Probation:</strong> {form.probation}</p>
          <p><strong>Bond:</strong> {form.bond}</p>
          {form.additionalPerks && <p><strong>Perks:</strong> {form.additionalPerks}</p>}
        </div>
        <p>This offer is contingent on satisfactory background verification. Kindly confirm your acceptance within 7 days.</p>
        <p style={{ marginTop: "1.5rem" }}>Regards,<br /><strong>{currentUser?.hrName || "HR Department"}</strong><br />{currentUser?.hrDesignation || "Talent Acquisition"}<br />{currentUser?.name}</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
        <button onClick={() => setPreview(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 14 }}>← Edit</button>
        <button onClick={issue} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🎉 Issue offer letter</button>
      </div>
    </Modal>
  );

  return (
    <Modal title={`📄 Generate offer letter — ${student.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div>
          <label style={lbl}>Job role</label>
          {jobs.length === 0 ? (
            <div style={{ fontSize: 12, color: C.red, padding: "8px 0" }}>
              No active jobs posted yet. Use "+ Post new job" first.
            </div>
          ) : (
            <select style={inp} value={form.jobId} onChange={e => handleJobChange(e.target.value)}>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={lbl}>CTC offered *</label>
            <input style={inp} placeholder="6 LPA" value={form.ctc} onChange={e => set("ctc", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Joining date *</label>
            <input style={inp} type="date" value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={lbl}>Work location</label>
            <input style={inp} placeholder="Hyderabad" value={form.location} onChange={e => set("location", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Probation period</label>
            <select style={inp} value={form.probation} onChange={e => set("probation", e.target.value)}>
              {["3 months", "6 months", "1 year", "None"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Bond / service agreement</label>
          <select style={inp} value={form.bond} onChange={e => set("bond", e.target.value)}>
            {["None", "1 year", "2 years", "3 years"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Additional perks / benefits</label>
          <input style={inp} placeholder="Health insurance, WFH allowance, PF…" value={form.additionalPerks} onChange={e => set("additionalPerks", e.target.value)} />
        </div>
        <button onClick={() => setPreview(true)}
          style={{ padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          👁️ Preview offer letter
        </button>
      </div>
    </Modal>
  );
}

// ── Notify modal ──────────────────────────────────────────────────────────────
function NotifyModal({ student, onClose }) {
  const { addNotification, currentUser } = useApp();
  const [form, setForm] = useState({ type: "general", title: "", body: "" });
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const TEMPLATES = {
    interview:  { title: `Interview update from ${currentUser.name}`, body: "Please check your interview schedule in your portal." },
    document:   { title: "Documents required", body: "Please upload your latest resume and academic transcripts to your profile." },
    offer:      { title: `Congratulations from ${currentUser.name}!`, body: "We would like to discuss an offer. Please check your portal." },
    general:    { title: "", body: "" },
  };

  const applyTemplate = (type) => {
    set("type", type);
    const t = TEMPLATES[type];
    setForm(p => ({ ...p, type, title: t.title, body: t.body }));
  };

  const send = () => {
    if (!form.title || !form.body) return alert("Please fill subject and message.");
    addNotification({ to: student.id, from: currentUser.id, type: form.type, title: form.title, body: form.body });
    setDone(true);
  };

  if (done) return (
    <Modal title="✅ Notification sent!" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
        <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Message delivered to {student.name}</p>
        <button onClick={onClose} style={{ marginTop: "1.25rem", padding: "10px 24px", borderRadius: 8, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal title={`🔔 Notify ${student.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div>
          <label style={lbl}>Message template</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["general", "interview", "document", "offer"].map(t => (
              <button key={t} onClick={() => applyTemplate(t)}
                style={{ fontSize: 11, padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: `1px solid ${form.type === t ? C.indigo : C.border}`, background: form.type === t ? C.indigoBg : "none", color: form.type === t ? C.indigo : C.textSub, fontWeight: form.type === t ? 700 : 400, textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>Subject / title *</label>
          <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Message subject…" />
        </div>
        <div>
          <label style={lbl}>Message *</label>
          <textarea style={{ ...inp, resize: "vertical" }} rows={4} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Write your message to the student…" />
        </div>
        <button onClick={send}
          style={{ padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          🔔 Send notification
        </button>
      </div>
    </Modal>
  );
}

function MessageModal({ student, onClose, onSend }) {
  const [form, setForm] = useState({ subject: `Message from ${student.name}`, body: "" });
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const send = () => {
    if (!form.subject || !form.body) return alert("Please fill subject and message.");
    onSend(student, form.subject, form.body);
    setDone(true);
  };

  if (done) return (
    <Modal title="✅ Message sent!" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
        <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>Message delivered to {student.name}</p>
        <button onClick={onClose} style={{ marginTop: "1.25rem", padding: "10px 24px", borderRadius: 8, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Done</button>
      </div>
    </Modal>
  );

  return (
    <Modal title={`💬 Message ${student.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div>
          <label style={lbl}>Subject</label>
          <input style={inp} value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Message subject…" />
        </div>
        <div>
          <label style={lbl}>Message</label>
          <textarea style={{ ...inp, resize: "vertical" }} rows={5} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Write a message for the student…" />
        </div>
        <button onClick={send}
          style={{ padding: "11px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          💬 Send message
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPANY DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { currentUser, students = [], companyJobs, companyInterviews, companyOffers, sendMessage } = useApp();

  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [offerTarget,    setOfferTarget]    = useState(null);
  const [notifyTarget,   setNotifyTarget]   = useState(null);
  const [messageTarget,  setMessageTarget]  = useState(null);
  const [search,         setSearch]         = useState("");

  const myJobs      = companyJobs ? companyJobs(currentUser?.id) : [];
  const myInterview = companyInterviews ? companyInterviews(currentUser?.id) : [];
  const myOffers    = companyOffers ? companyOffers(currentUser?.id) : [];

  // Null-safe search: guard against students with undefined name/university
  const displayStudents = students.filter(s =>
    !search ||
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.university && s.university.toLowerCase().includes(search.toLowerCase())) ||
    (s.skills || []).some(sk => sk.toLowerCase().includes(search.toLowerCase()))
  );

  // All applicant student IDs across company's jobs
  const applicantIds = [...new Set(myJobs.flatMap(j => j.applicants || []))];
  const applicants   = students.filter(s => applicantIds.includes(s.id));

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const handleSendMessage = (student, subject, body) => {
    sendMessage({ from: currentUser.id, to: student.id, type: "message", subject, body });
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* Modals */}
      {scheduleTarget && <ScheduleModal student={scheduleTarget} jobs={myJobs} onClose={() => setScheduleTarget(null)} />}
      {offerTarget    && <OfferModal    student={offerTarget}    jobs={myJobs} onClose={() => setOfferTarget(null)}    />}
      {notifyTarget   && <NotifyModal   student={notifyTarget}               onClose={() => setNotifyTarget(null)}   />}
      {messageTarget  && <MessageModal  student={messageTarget} onClose={() => setMessageTarget(null)} onSend={handleSendMessage} />}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
            Hello, {currentUser?.hrName?.split(" ")[0] || "HR"} 👋
          </h1>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>{today} · {currentUser?.name || "Company"}</p>
        </div>
        <button onClick={() => navigate("/company/jobs")}
          style={{ background: C.indigo, color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + Post new job
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { icon: "💼", label: "Jobs posted",     value: myJobs.length,      sub: "Active openings"           },
          { icon: "🎓", label: "Total applicants",value: applicantIds.length, sub: "Across all roles"          },
          { icon: "📅", label: "Interviews",       value: myInterview.length,  sub: `${myInterview.filter(i=>i.status==="scheduled").length} upcoming` },
          { icon: "📄", label: "Offers issued",   value: myOffers.length,    sub: "Sent to students"          },
        ].map(s => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 12, color: C.textSub, marginBottom: 6, display: "flex", gap: 6 }}><span>{s.icon}</span>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textHint, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.75rem" }}>
        {[
          { icon: "📅", label: "Schedule interview",    sub: "Pick a student & set time",    color: C.indigo, bg: C.indigoBg, action: () => setScheduleTarget(applicants[0]) },
          { icon: "📄", label: "Issue offer letter",    sub: "Generate & send offer",         color: C.green,  bg: C.greenBg,  action: () => setOfferTarget(applicants[0])    },
          { icon: "🔔", label: "Broadcast notification",sub: "Message a student directly",    color: C.amber,  bg: C.amberBg,  action: () => setNotifyTarget(applicants[0])   },
        ].map(a => {
          const isDisabled = applicants.length === 0;
          return (
            <button
              key={a.label}
              onClick={!isDisabled ? a.action : undefined}
              style={{
                ...card,
                border:     `1px solid ${isDisabled ? C.border : a.bg}`,
                background: isDisabled ? "#F9FAFB" : a.bg,
                cursor:     isDisabled ? "not-allowed" : "pointer",
                textAlign:  "left",
                opacity:    isDisabled ? 0.55 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{isDisabled ? "🔒" : a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: isDisabled ? C.textHint : a.color }}>{a.label}</div>
              <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>
                {isDisabled ? "No applicants yet — students must apply first" : a.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Upcoming interviews */}
      {myInterview.length > 0 && (
        <div style={{ ...card, marginBottom: "1rem" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: "1rem" }}>📅 Scheduled interviews</div>
          {myInterview.slice(0, 4).map(iv => (
            <div key={iv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 0", borderBottom: `0.5px solid ${C.border}` }}>
              <div style={{ width: 44, textAlign: "center", background: C.indigoBg, borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: C.indigo, fontWeight: 700 }}>{iv.date?.split("-")[2] || "--"}</div>
                <div style={{ fontSize: 10, color: C.textSub }}>{formatMonthShort(iv.date)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{iv.studentName} — {iv.round} Round</div>
                <div style={{ fontSize: 12, color: C.textSub }}>{iv.jobTitle} · {iv.time} · {iv.platform}</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: iv.status === "scheduled" ? C.indigoBg : C.greenBg, color: iv.status === "scheduled" ? C.indigo : C.green, fontWeight: 600 }}>
                {iv.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Student table */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🎓 Registered students ({students.length})</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              placeholder="Search by name, university, skill…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft: 32, width: 260, border: `1px solid ${C.border}` }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Student", "University", "Degree", "CGPA", "Skills", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px", fontSize: 11, fontWeight: 700, color: C.textSub, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayStudents.map(s => (
                <StudentRow
                  key={s.id}
                  student={s}
                  companyJobs={myJobs}
                  onSchedule={setScheduleTarget}
                  onOffer={setOfferTarget}
                  onNotify={setNotifyTarget}
                  onMessage={setMessageTarget}
                />
              ))}
            </tbody>
          </table>
          {displayStudents.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem", color: C.textHint, fontSize: 14 }}>
              No students match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}