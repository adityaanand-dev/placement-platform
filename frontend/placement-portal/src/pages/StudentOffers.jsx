import { useState } from "react";
import { useApp } from "../context/AppContext";

const C = {
  indigo: "#4F46E5", indigoBg: "#EEF2FF", indigoBorder: "#C7D2FE",
  green: "#059669", greenBg: "#D1FAE5",
  amber: "#D97706", amberBg: "#FEF3C7",
  text: "#111827", textSub: "#6B7280", textHint: "#9CA3AF",
  border: "rgba(0,0,0,0.08)", surface: "#FFFFFF",
};

function OfferCard({ offer, onView }) {
  return (
    <div style={{
      background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12,
      padding: "1.25rem", display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎉</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{offer.jobTitle}</div>
        <div style={{ fontSize: 13, color: C.textSub }}>{offer.companyName}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: C.greenBg, color: C.green, fontWeight: 600 }}>💰 {offer.ctc}</span>
          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: C.indigoBg, color: C.indigo }}>📍 {offer.location}</span>
          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: C.amberBg, color: C.amber }}>📅 Join: {offer.joiningDate}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: C.textHint }}>Issued {offer.issuedAt}</span>
        <button onClick={() => onView(offer)}
          style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, border: "none", background: C.indigo, color: "#fff", cursor: "pointer" }}>
          View letter
        </button>
      </div>
    </div>
  );
}

function OfferLetterView({ offer, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: C.surface, borderRadius: 16, padding: "0", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 48px rgba(0,0,0,0.2)" }}>
        {/* Letter header bar */}
        <div style={{ background: C.indigo, padding: "1rem 1.5rem", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>📄 Offer Letter</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {/* Letter body */}
        <div style={{ padding: "2rem", fontFamily: "'Times New Roman', Georgia, serif", fontSize: 14, lineHeight: 1.8, color: C.text }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "1rem" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{offer.companyName}</div>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>Placement & Talent Acquisition Division</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12, textDecoration: "underline", letterSpacing: "0.05em" }}>
              OFFER OF EMPLOYMENT
            </div>
          </div>

          <p><strong>Date:</strong> {offer.issuedAt}</p>
          <p style={{ marginTop: "1rem" }}>Dear <strong>{offer.studentName}</strong>,</p>
          <p style={{ marginTop: "0.75rem" }}>
            We are delighted to offer you the position of <strong>{offer.jobTitle}</strong> at <strong>{offer.companyName}</strong>. 
            Following your successful interview process, we are confident that you will make a significant contribution to our team.
          </p>

          <div style={{ margin: "1.25rem 0", padding: "1rem 1.25rem", background: "#F9FAFB", borderRadius: 10, border: `1px solid ${C.border}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Position",        offer.jobTitle],
                  ["Annual CTC",      offer.ctc],
                  ["Work location",   offer.location],
                  ["Joining date",    offer.joiningDate],
                  ["Probation period",offer.probation],
                  ["Bond agreement",  offer.bond],
                  ...(offer.additionalPerks ? [["Additional perks", offer.additionalPerks]] : []),
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: "5px 0", fontWeight: 700, fontSize: 13, color: C.textSub, width: "40%" }}>{k}</td>
                    <td style={{ padding: "5px 0", fontSize: 13, color: C.text }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            This offer is contingent upon satisfactory completion of background verification and submission of all required documents. 
            Please confirm your acceptance of this offer within <strong>7 calendar days</strong> from the date of this letter.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            We look forward to welcoming you to the <strong>{offer.companyName}</strong> family. 
            Should you have any questions, please do not hesitate to contact us.
          </p>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}` }}>
            <p style={{ marginBottom: 4 }}>Yours sincerely,</p>
            <p style={{ fontWeight: 700 }}>HR Department</p>
            <p style={{ color: C.textSub }}>{offer.companyName}</p>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => window.print()}
            style={{ fontSize: 13, padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", color: C.text }}>
            🖨️ Print
          </button>
          <button onClick={onClose}
            style={{ fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 8, border: "none", background: C.indigo, color: "#fff", cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentOffers() {
  const { currentUser, myOffers } = useApp();
  const [viewing, setViewing] = useState(null);

  if (!currentUser) return null;
  const offers = myOffers(currentUser.id);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {viewing && <OfferLetterView offer={viewing} onClose={() => setViewing(null)} />}

      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>🎉 Offer letters</h1>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>
          {offers.length > 0 ? `You have ${offers.length} offer letter${offers.length > 1 ? "s" : ""}` : "No offer letters yet — keep applying!"}
        </p>
      </div>

      {offers.length === 0 ? (
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "4rem", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.text }}>No offers yet</p>
          <p style={{ fontSize: 13, color: C.textHint, marginTop: 6 }}>Companies will send offer letters here after your final interview round.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {offers.map(o => <OfferCard key={o.id} offer={o} onView={setViewing} />)}
        </div>
      )}
    </div>
  );
}