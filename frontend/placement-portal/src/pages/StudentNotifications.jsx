import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF",
  green: "#059669", greenBg: "#D1FAE5",
  amber: "#D97706", amberBg: "#FEF3C7",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", surface: "#FFFFFF",
};

const TYPE_META = {
  interview: { icon: "📅", bg: C.indigoBg, color: C.indigo   },
  offer:     { icon: "🎉", bg: C.greenBg,  color: C.green    },
  document:  { icon: "📄", bg: C.amberBg,  color: C.amber    },
  general:   { icon: "🔔", bg: "#F3F4F6",  color: C.textSub  },
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
}

export default function StudentNotifications() {
  const { currentUser, myNotifications, markNotifRead, markAllRead } = useApp();

  if (!currentUser) return null;

  const notifs = myNotifications(currentUser.id).slice().reverse();
  const unread  = notifs.filter(n => !n.read).length;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>
            {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead(currentUser.id)}
            style={{ fontSize: 13, color: C.indigo, background: C.indigoBg, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 600 }}>
            Mark all as read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div style={{
          background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12,
          padding: "3rem", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 14, color: C.textHint }}>No notifications yet. Apply to jobs to hear from companies!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {notifs.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.general;
            return (
              <div key={n.id}
                onClick={() => markNotifRead(n.id)}
                style={{
                  background: n.read ? C.surface : "#FAFBFF",
                  border: `0.5px solid ${n.read ? C.border : C.indigoBg}`,
                  borderRadius: 12, padding: "1rem 1.25rem",
                  display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer",
                  transition: "background 0.15s",
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: C.text }}>{n.title}</div>
                    <span style={{ fontSize: 11, color: C.textHint, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: C.textSub, marginTop: 3, lineHeight: 1.5 }}>{n.body}</p>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.indigo, flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}