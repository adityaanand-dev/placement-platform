import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5",
  indigoBg: "#EEF2FF",
  green: "#059669",
  greenBg: "#D1FAE5",
  amber: "#D97706",
  amberBg: "#FEF3C7",
  text: "#111827",
  textSub: "#6B7280",
  textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)",
  surface: "#fff",
};

const card = {
  background: C.surface,
  border: `0.5px solid ${C.border}`,
  borderRadius: 14,
  padding: "1.2rem",
};

const inputStyles = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  outline: "none",
  fontSize: 13,
  color: C.text,
  background: "#fff",
};

export default function Messages() {
  const navigate = useNavigate();
  const {
    currentUser, students = [], companies = [],
    getThreadsForUser, getThreadMessages, getStudent, getCompany, sendMessage,
  } = useApp();

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [draftBody, setDraftBody] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [newContactId, setNewContactId] = useState("");

  const contacts = useMemo(() => (
    currentUser?.role === "company" ? students : companies
  ), [currentUser, students, companies]);

  const threadSummaries = useMemo(() => {
    if (!currentUser?.id) return [];
    return getThreadsForUser(currentUser.id).map((thread) => {
      const otherId = thread.otherId;
      const other = currentUser.role === "company" ? getStudent(otherId) : getCompany(otherId);
      return {
        ...thread,
        otherName: other?.name || other?.companyName || "Unknown",
        otherType: other?.role || (currentUser.role === "company" ? "student" : "company"),
      };
    });
  }, [currentUser, getThreadsForUser, getStudent, getCompany]);

  useEffect(() => {
    if (!selectedThreadId && threadSummaries.length > 0) {
      setSelectedThreadId(threadSummaries[0].otherId);
    }
  }, [selectedThreadId, threadSummaries]);

  useEffect(() => {
    if (!selectedThreadId && contacts.length > 0) {
      setNewContactId(contacts[0].id);
    }
  }, [contacts, selectedThreadId]);

  if (!currentUser) {
    return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Loading messaging...</div>;
  }

  const selectedContact = contacts.find((contact) => contact.id === selectedThreadId || contact.id === newContactId);
  const messages = selectedThreadId ? getThreadMessages(currentUser.id, selectedThreadId) : [];

  const handleSend = () => {
    const recipientId = selectedThreadId || newContactId;
    if (!recipientId) return;
    if (!draftBody.trim()) return;
    const subject = draftSubject.trim() || `Message from ${currentUser.name}`;
    sendMessage({
      from: currentUser.id,
      to: recipientId,
      subject,
      body: draftBody.trim(),
    });
    setDraftBody("");
    setSelectedThreadId(recipientId);
    setDraftSubject(subject);
  };

  const availableContacts = contacts.filter((contact) => contact.id !== currentUser.id);

  return (
    <div style={{ display: "flex", gap: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", minHeight: "calc(100vh - 3rem)" }}>
      <div style={{ width: 320, ...card, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>💬 Messages</div>
            <div style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>Conversations with {currentUser.role === "company" ? "students" : "companies"}.</div>
          </div>
          <button onClick={() => navigate(currentUser.role === "company" ? "/company/dashboard" : "/student/dashboard")}
            style={{ border: "none", background: "none", color: C.indigo, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Back
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>Start new conversation</label>
          <select
            style={{ ...inputStyles, appearance: "none", cursor: "pointer" }}
            value={newContactId}
            onChange={(e) => setNewContactId(e.target.value)}
          >
            {availableContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedThreadId(newContactId)}
            style={{ marginTop: "0.75rem", width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", cursor: "pointer", fontWeight: 700 }}
          >
            Open chat
          </button>
        </div>

        <div style={{ marginBottom: "0.75rem", fontSize: 12, fontWeight: 700, color: C.textSub }}>Recent conversations</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 22rem)", overflowY: "auto" }}>
          {threadSummaries.length === 0 && (
            <div style={{ fontSize: 13, color: C.textHint }}>No conversations yet. Start a new message or wait for company updates.</div>
          )}
          {threadSummaries.map((thread) => (
            <button
              key={thread.otherId}
              onClick={() => {
                setSelectedThreadId(thread.otherId);
                setDraftSubject(thread.subject || `Message from ${currentUser.name}`);
              }}
              style={{
                textAlign: "left",
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: selectedThreadId === thread.otherId ? `1px solid ${C.indigo}` : `1px solid ${C.border}`,
                background: selectedThreadId === thread.otherId ? C.indigoBg : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{thread.otherName}</span>
                <span style={{ fontSize: 11, color: C.textHint }}>{new Date(thread.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {thread.subject || thread.body}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ ...card, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                {selectedContact ? selectedContact.name : "Select a contact"}
              </div>
              <div style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>
                {selectedContact ? `Conversation with ${selectedContact.name}` : "Choose a student or company to begin."}
              </div>
            </div>
            {selectedContact && (
              <span style={{ fontSize: 12, color: C.indigo, fontWeight: 700 }}>{messages.length} messages</span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingRight: 6, minHeight: 260, maxHeight: "calc(100vh - 26rem)" }}>
            {selectedThreadId ? (
              messages.length > 0 ? messages.map((message) => {
                const mine = message.from === currentUser.id;
                return (
                  <div key={message.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }}>
                    <div style={{ maxWidth: "78%", padding: "10px 12px", borderRadius: 16, background: mine ? C.indigo : C.border, color: mine ? "#fff" : C.text, lineHeight: 1.5 }}>
                      <div style={{ fontSize: 11, color: mine ? "#E0E7FF" : C.textHint, marginBottom: 4 }}>{message.subject}</div>
                      <div style={{ fontSize: 13 }}>{message.body}</div>
                      <div style={{ fontSize: 11, color: mine ? "#D1D5DB" : C.textHint, marginTop: 6, textAlign: "right" }}>
                        {new Date(message.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: 13, color: C.textHint, padding: "2rem 0" }}>
                  No messages in this thread yet. Send the first message to start the conversation.
                </div>
              )
            ) : (
              <div style={{ fontSize: 13, color: C.textHint, padding: "2rem 0" }}>
                Select an existing thread or open a new chat to get started.
              </div>
            )}
          </div>
        </div>

        <div style={{ ...card, padding: "1rem 1.2rem" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>Subject</label>
            <input
              value={draftSubject}
              placeholder={selectedContact ? `Message to ${selectedContact.name}` : "Message subject..."}
              onChange={(e) => setDraftSubject(e.target.value)}
              style={inputStyles}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>Message</label>
            <textarea
              rows={5}
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="Type your message here..."
              style={{ ...inputStyles, resize: "vertical" }}
            />
          </div>
          <button
            onClick={handleSend}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", background: C.indigo, color: "#fff", cursor: "pointer", fontWeight: 700 }}
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}
