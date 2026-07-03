import { createContext, useContext, useState } from "react";

// ─── Seed data ────────────────────────────────────────────────────────────────
// NOTE: every user object below has an explicit `role` field.
// This is the single source of truth for routing — never inferred from tabs/UI.
const SEED_STUDENTS = [
  {
    id: "s1", role: "student", name: "Aditya Anand", email: "aditya@example.com",
    password: "pass123", phone: "9876543210", university: "Haridwar University",
    degree: "B.Tech (CSE)", cgpa: "6.1", gradYear: "2026",
    skills: ["AWS", "Linux", "Docker", "Python"], certs: ["AWS CLF-C02", "NPTEL Cloud"],
    bio: "Cloud & DevOps enthusiast building serverless apps.", linkedin: "", github: "",
    resumeKey: null, appliedJobs: [], savedJobs: [], profileComplete: 68,
    verified: true, verificationCode: null,
  },
  {
    id: "s2", role: "student", name: "Priya Sharma", email: "priya@example.com",
    password: "pass123", phone: "9123456780", university: "IIT Roorkee",
    degree: "B.Tech (ECE)", cgpa: "8.4", gradYear: "2026",
    skills: ["Python", "ML", "TensorFlow", "SQL"], certs: ["GCP ACE"],
    bio: "ML engineer with hands-on project experience.", linkedin: "", github: "",
    resumeKey: null, appliedJobs: [], savedJobs: [], profileComplete: 85,
    verified: true, verificationCode: null,
  },
  {
    id: "s3", role: "student", name: "Rahul Verma", email: "rahul@example.com",
    password: "pass123", phone: "9988776655", university: "VIT Vellore",
    degree: "B.Tech (IT)", cgpa: "7.2", gradYear: "2026",
    skills: ["DevOps", "Kubernetes", "CI/CD", "Terraform"], certs: ["CKA (Kubernetes)"],
    bio: "DevOps intern with production CI/CD experience.", linkedin: "", github: "",
    resumeKey: null, appliedJobs: [], savedJobs: [], profileComplete: 72,
    verified: true, verificationCode: null,
  },
];

const SEED_COMPANIES = [
  {
    id: "c1", role: "company", name: "TCS Digital", email: "hr@tcs.com",
    password: "pass123", phone: "0120-1234567", website: "https://tcs.com",
    industry: "IT Services", size: "500000+", founded: "1968",
    hrName: "Meena Iyer", hrDesignation: "Talent Acquisition Lead",
    description: "India's largest IT services company.",
    postedJobs: ["j1", "j2"],
    verified: true, verificationCode: null,
  },
  {
    id: "c2", role: "company", name: "Amazon Web Services", email: "hr@aws.com",
    password: "pass123", phone: "0124-7654321", website: "https://aws.amazon.com",
    industry: "Cloud / Technology", size: "100000+", founded: "2006",
    hrName: "Rajan Mehta", hrDesignation: "University Hiring Manager",
    description: "World's most adopted cloud platform.",
    postedJobs: ["j3"],
    verified: true, verificationCode: null,
  },
];

const SEED_JOBS = [
  {
    id: "j1", companyId: "c1", title: "Cloud Support Engineer", location: "Hyderabad",
    type: "Full-time", category: "Cloud", ctc: "6 LPA", openings: 10,
    deadline: "2026-07-15", description: "Handle cloud infrastructure support for enterprise clients.",
    requirements: ["AWS", "Linux", "Networking"], match: 89, hot: true,
    applicants: ["s1", "s3"],
  },
  {
    id: "j2", companyId: "c1", title: "DevOps Intern", location: "Bengaluru",
    type: "Internship", category: "DevOps", ctc: "25K/mo", openings: 5,
    deadline: "2026-07-01", description: "Support CI/CD pipelines and infrastructure automation.",
    requirements: ["Docker", "CI/CD", "Git"], match: 74, hot: false,
    applicants: ["s2"],
  },
  {
    id: "j3", companyId: "c2", title: "Cloud Support Associate", location: "Hyderabad",
    type: "Full-time", category: "Cloud", ctc: "8 LPA", openings: 8,
    deadline: "2026-07-20", description: "Join AWS customer support for cloud services.",
    requirements: ["AWS", "Linux", "Python"], match: 81, hot: true,
    applicants: ["s1", "s2", "s3"],
  },
];

const SEED_INTERVIEWS = [
  {
    id: "i1", companyId: "c1", studentId: "s1", jobId: "j1",
    title: "Technical Round — TCS Digital", round: "Technical",
    date: "2026-06-25", time: "10:00 AM", duration: "45 mins",
    platform: "Google Meet", link: "https://meet.google.com/abc-def-ghi",
    status: "scheduled", message: "Please prepare AWS core services and Linux commands.",
    studentName: "Aditya Anand", jobTitle: "Cloud Support Engineer",
  },
  {
    id: "i2", companyId: "c1", studentId: "s2", jobId: "j2",
    title: "HR Round — TCS Digital", round: "HR",
    date: "2026-06-30", time: "2:00 PM", duration: "30 mins",
    platform: "Zoom", link: "https://zoom.us/j/1234567890",
    status: "scheduled", message: "Carry all your academic documents.",
    studentName: "Priya Sharma", jobTitle: "DevOps Intern",
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: "n1", to: "s1", from: "c1", type: "interview",
    title: "Interview scheduled — TCS Digital",
    body: "Your technical round is on Jun 25 at 10:00 AM via Google Meet.",
    read: false, createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: "n2", to: "s2", from: "c1", type: "interview",
    title: "Interview scheduled — TCS Digital",
    body: "Your HR round is on Jun 30 at 2:00 PM via Zoom.",
    read: false, createdAt: "2026-06-21T09:00:00Z",
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
// These let state survive page refreshes and login/logout cycles.
// Only the 5 pieces of shared state that need cross-session persistence are
// stored here. `currentUser` is deliberately NOT persisted — the user must
// always log in explicitly; we never auto-restore a session.
const LS_KEY = "launchpad_v1";

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStore(slice) {
  try {
    const existing = loadStore() || {};
    localStorage.setItem(LS_KEY, JSON.stringify({ ...existing, ...slice }));
  } catch {
    // Storage quota exceeded or private-browsing block — fail silently
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) {
    throw new Error(
      "useApp() was called outside <AppProvider>. " +
      "Make sure App.jsx wraps <BrowserRouter> (or your routes) inside <AppProvider>."
    );
  }
  return ctx;
}

export function AppProvider({ children }) {
  // Rehydrate from localStorage on first mount; fall back to seed data
  const stored = loadStore();

  const [currentUser,   setCurrentUser]   = useState(null); // never persisted — must log in fresh
  const [students,      setStudents]      = useState(stored?.students      || SEED_STUDENTS);
  const [companies,     setCompanies]     = useState(stored?.companies     || SEED_COMPANIES);
  const [jobs,          setJobs]          = useState(stored?.jobs          || SEED_JOBS);
  const [interviews,    setInterviews]    = useState(stored?.interviews    || SEED_INTERVIEWS);
  const [notifications, setNotifications] = useState(stored?.notifications || SEED_NOTIFICATIONS);
  const [offerLetters,  setOfferLetters]  = useState(stored?.offerLetters  || []);
  const [messages,      setMessages]      = useState(stored?.messages      || []);

  // ── Persist helpers — call these after every state-mutating action ────────
  // Each setter is wrapped so it also writes to localStorage immediately,
  // so the next login (in any tab or after a refresh) sees the updated data.
  const persistStudents      = (updater) => setStudents(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ students: next }); return next;
  });
  const persistCompanies     = (updater) => setCompanies(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ companies: next }); return next;
  });
  const persistJobs          = (updater) => setJobs(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ jobs: next }); return next;
  });
  const persistInterviews    = (updater) => setInterviews(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ interviews: next }); return next;
  });
  const persistNotifications = (updater) => setNotifications(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ notifications: next }); return next;
  });
  const persistOfferLetters  = (updater) => setOfferLetters(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ offerLetters: next }); return next;
  });
  const persistMessages      = (updater) => setMessages(prev => {
    const next = typeof updater === "function" ? updater(prev) : updater;
    saveStore({ messages: next }); return next;
  });

  const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const findUserByEmail = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    return students.find(u => u.email.toLowerCase() === normalizedEmail) ||
           companies.find(u => u.email.toLowerCase() === normalizedEmail);
  };

  const updateUserRecord = (userId, role, updater) => {
    if (role === "student") {
      persistStudents(p => p.map(u => u.id === userId ? (typeof updater === "function" ? updater(u) : updater) : u));
    } else {
      persistCompanies(p => p.map(u => u.id === userId ? (typeof updater === "function" ? updater(u) : updater) : u));
    }
  };

  const sendVerificationEmail = (email) => {
    const user = findUserByEmail(email);
    if (!user) return null;
    const code = generateVerificationCode();
    updateUserRecord(user.id, user.role, (u) => ({ ...u, verificationCode: code }));
    addNotification({
      to: user.id,
      from: "system",
      type: "verification",
      title: "Verify your email address",
      body: `Your verification code is ${code}. Enter it on the verification page to complete account activation.`,
    });
    return code;
  };

  const verifyEmail = (email, code) => {
    const user = findUserByEmail(email);
    if (!user) return { ok: false, error: "No account found for this email." };
    if (user.verified) return { ok: true, message: "Email already verified." };
    if (user.verificationCode !== code.trim()) return { ok: false, error: "Incorrect verification code." };
    updateUserRecord(user.id, user.role, (u) => ({ ...u, verified: true, verificationCode: null }));
    return { ok: true, message: "Email verified successfully." };
  };

  const threadKey = (a, b) => [a, b].sort().join("_");

  const sendMessage = (data) => {
    const message = {
      id: `m${Date.now()}`,
      from: data.from,
      to: data.to,
      type: data.type || "message",
      subject: data.subject || "New message",
      body: data.body || "",
      createdAt: new Date().toISOString(),
    };
    persistMessages(p => [...p, message]);
    if (data.notify !== false) {
      addNotification({
        to: data.to, from: data.from, type: data.type || "message",
        title: message.subject,
        body: message.body,
      });
    }
    return message;
  };

  const getThreadMessages = (userId, otherId) => {
    if (!userId || !otherId) return [];
    const key = threadKey(userId, otherId);
    return messages
      .filter(m => threadKey(m.from, m.to) === key)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const getThreadsForUser = (userId) => {
    const threads = {};
    messages.forEach((message) => {
      if (message.from !== userId && message.to !== userId) return;
      const other = message.from === userId ? message.to : message.from;
      const key = threadKey(userId, other);
      if (!threads[key] || new Date(message.createdAt) > new Date(threads[key].createdAt)) {
        threads[key] = {
          otherId: other,
          subject: message.subject,
          body: message.body,
          type: message.type,
          createdAt: message.createdAt,
        };
      }
    });
    return Object.values(threads).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  /**
   * login(email, password, expectedRole?)
   * If expectedRole is passed (from the Login screen's active tab), the
   * function REFUSES to log a user in under the wrong tab — e.g. typing a
   * company's email while the "Student" tab is selected gets a clear error
   * instead of silently routing into the wrong dashboard.
   */
  const login = (email, password, expectedRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = [...students, ...companies].find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === password
    );
    if (!user) return { ok: false, error: "Invalid email or password." };
    if (!user.verified) {
      return { ok: false, error: "Email not verified. Check your inbox for the verification code." };
    }
    if (expectedRole && user.role !== expectedRole) {
      return {
        ok: false,
        error: `This email is registered as a ${user.role}. Switch to the "${user.role === "company" ? "Company" : "Student"}" tab to log in.`,
      };
    }
    if (user.role !== "student" && user.role !== "company") {
      console.error("[AppContext] User object is missing a valid role:", user);
      return { ok: false, error: "Account data is corrupted. Please contact support." };
    }
    setCurrentUser(user);
    return { ok: true, user };
  };

  const logout = () => setCurrentUser(null);

  const registerStudent = (data) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if ([...students, ...companies].find(u => u.email.toLowerCase() === normalizedEmail))
      return { ok: false, error: "An account with this email already exists." };
    const code = generateVerificationCode();
    const newStudent = {
      ...data,
      email: normalizedEmail,
      id: `s${Date.now()}`,
      role: "student",
      appliedJobs: [], savedJobs: [], profileComplete: 40, resumeKey: null,
      verified: false,
      verificationCode: code,
    };
    persistStudents(p => [...p, newStudent]);
    addNotification({
      to: newStudent.id, from: "system", type: "verification",
      title: "Verify your email for LaunchPad",
      body: `Your verification code is ${code}. Enter it to complete registration.`,
    });
    return { ok: true, user: newStudent, verificationNeeded: true, verificationCode: code };
  };

  const registerCompany = (data) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if ([...students, ...companies].find(u => u.email.toLowerCase() === normalizedEmail))
      return { ok: false, error: "An account with this email already exists." };
    const code = generateVerificationCode();
    const newCompany = {
      ...data,
      email: normalizedEmail,
      id: `c${Date.now()}`,
      role: "company",
      postedJobs: [],
      verified: false,
      verificationCode: code,
    };
    persistCompanies(p => [...p, newCompany]);
    addNotification({
      to: newCompany.id, from: "system", type: "verification",
      title: "Verify your email for LaunchPad",
      body: `Your verification code is ${code}. Enter it to complete registration.`,
    });
    return { ok: true, user: newCompany, verificationNeeded: true, verificationCode: code };
  };

  const updateCurrentUser = (data) => {
    const { role, id, ...safeData } = data;
    const updated = { ...currentUser, ...safeData };
    setCurrentUser(updated);
    if (updated.role === "student")
      persistStudents(p => p.map(s => s.id === updated.id ? updated : s));
    else
      persistCompanies(p => p.map(c => c.id === updated.id ? updated : c));
  };

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const postJob = (data) => {
    const newJob = { ...data, id: `j${Date.now()}`, companyId: currentUser.id, applicants: [], hot: false };
    persistJobs(p => [...p, newJob]);
    persistCompanies(p => p.map(c =>
      c.id === currentUser.id ? { ...c, postedJobs: [...c.postedJobs, newJob.id] } : c
    ));
    return newJob;
  };

  const applyToJob = (jobId) => {
    const sid = currentUser.id;
    persistJobs(p => p.map(j =>
      j.id === jobId && !j.applicants.includes(sid)
        ? { ...j, applicants: [...j.applicants, sid] }
        : j
    ));
    persistStudents(p => p.map(s =>
      s.id === sid ? { ...s, appliedJobs: [...(s.appliedJobs || []), jobId] } : s
    ));
    updateCurrentUser({ appliedJobs: [...(currentUser.appliedJobs || []), jobId] });
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  // Declared BEFORE scheduleInterview and generateOfferLetter — arrow functions
  // are not hoisted, and both call addNotification internally.
  const addNotification = (data) => {
    const notif = { ...data, id: `n${Date.now()}`, read: false, createdAt: new Date().toISOString() };
    persistNotifications(p => [...p, notif]);
  };

  const markNotifRead = (id) => {
    persistNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = (userId) => {
    persistNotifications(p => p.map(n => n.to === userId ? { ...n, read: true } : n));
  };

  // ── Interviews ────────────────────────────────────────────────────────────
  const scheduleInterview = (data) => {
    const newInterview = { ...data, id: `i${Date.now()}`, status: "scheduled" };
    persistInterviews(p => [...p, newInterview]);
    const notificationBody = `Your ${data.round} round is on ${data.date} at ${data.time} via ${data.platform}. ${data.message || ""}`;
    addNotification({
      to: data.studentId, from: currentUser.id, type: "interview",
      title: `Interview scheduled — ${currentUser.name}`,
      body: notificationBody,
    });
    sendMessage({
      from: currentUser.id,
      to: data.studentId,
      type: "interview",
      subject: `Interview scheduled — ${currentUser.name}`,
      body: notificationBody,
      notify: false,
    });
    return newInterview;
  };

  const updateInterviewStatus = (interviewId, status) => {
    persistInterviews(p => p.map(i => i.id === interviewId ? { ...i, status } : i));
  };

  // ── Offer Letters ─────────────────────────────────────────────────────────
  const generateOfferLetter = (data) => {
    const offer = {
      ...data,
      id: `o${Date.now()}`,
      companyId: currentUser.id,
      companyName: currentUser.name,
      issuedAt: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString(),
      status: "issued",
    };
    persistOfferLetters(p => [...p, offer]);          // ← persisted to localStorage
    const offerBody = `Congratulations! You have received an offer for ${data.jobTitle} at ${data.ctc} CTC, joining on ${data.joiningDate} at ${data.location}.`;
    addNotification({
      to: data.studentId, from: currentUser.id, type: "offer",
      title: `🎉 Offer letter from ${currentUser.name}!`,
      body: offerBody,
    });
    sendMessage({
      from: currentUser.id,
      to: data.studentId,
      type: "offer",
      subject: `Offer letter from ${currentUser.name}`,
      body: offerBody,
      notify: false,
    });
    return offer;
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const myNotifications   = (userId) => notifications.filter(n => n.to === userId);
  const unreadCount       = (userId) => notifications.filter(n => n.to === userId && !n.read).length;
  const getStudent        = (id)     => students.find(s => s.id === id);
  const getCompany        = (id)     => companies.find(c => c.id === id);
  const getJob            = (id)     => jobs.find(j => j.id === id);
  const companyJobs       = (cid)    => jobs.filter(j => j.companyId === cid);
  const companyInterviews = (cid)    => interviews.filter(i => i.companyId === cid);
  const studentInterviews = (sid)    => interviews.filter(i => i.studentId === sid);
  const myOffers           = (sid)   => offerLetters.filter(o => o.studentId === sid);
  const companyOffers      = (cid)   => offerLetters.filter(o => o.companyId === cid);

  return (
    <AppCtx.Provider value={{
      currentUser,
      login, logout, registerStudent, registerCompany, sendVerificationEmail, verifyEmail, updateCurrentUser,
      students, companies, jobs, interviews, notifications, offerLetters,
      postJob, applyToJob,
      scheduleInterview, updateInterviewStatus,
      generateOfferLetter,
      addNotification, markNotifRead, markAllRead,
      myNotifications, unreadCount,
      getStudent, getJob, getCompany, getThreadMessages, getThreadsForUser,
      messages, sendMessage,
      companyJobs, companyInterviews, studentInterviews,
      myOffers, companyOffers,
    }}>
      {children}
    </AppCtx.Provider>
  );
}