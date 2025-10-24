// src/components/RecentEmails.jsx
import { useEffect, useState } from "react";
import { apiUrl } from "../api";
import "./RecentEmails.css";

export default function RecentEmails({ limit = 12 }) {
  const [rows, setRows] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => { 
    const token = localStorage.getItem("accessToken") || "";
    fetch(apiUrl(`/me/recent-emails?limit=${limit}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      cache: "no-cache",
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json().catch(() => ({})))))
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  }, [limit]);

  if (!rows.length) return null;

  // Helper function to get state badge color
  const getStateBadgeStyle = (state) => {
    const stateColors = {
      'Deliverable': { bg: '#10b981', color: '#fff' },
      'Undeliverable': { bg: '#ef4444', color: '#fff' },
      'Risky': { bg: '#fb923c', color: '#fff' },
    };
    return stateColors[state] || { bg: '#6b7280', color: '#fff' };
  };

  // Helper function to get score badge color
  const getScoreBadgeStyle = (score) => {
    if (score >= 80) return { bg: '#0d6e46', color: '#fff' };
    if (score >= 50) return { bg: '#b88b02', color: '#fff' };
    return { bg: '#993c3c', color: '#fff' };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#3ed299';
    if (score >= 10) return '#ffcb60';
    if (score >= 5) return '#ff5f7d';
    return '#549ee7';
  };

  const handleEmailClick = (email) => setSelectedEmail(email);
  const handleBackClick = () => setSelectedEmail(null);

  const displayRows = selectedEmail ? [selectedEmail] : rows;

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: 0,
          color: 'black'
        }}>
          Recent Verifications
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'black',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600
          }}>
            i
          </span>
        </h2>
        
        {selectedEmail && (
          <button
            onClick={handleBackClick}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ← Back to List
          </button>
        )}
      </div>
      
      <div style={{ 
        background: '#101010', 
        borderRadius: 12, 
        boxShadow: '0 0 10px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {displayRows.map((r, index) => {
          const originalIndex = rows.findIndex(row => row.id === r.id);
          const active = selectedEmail?.id === r.id;

          return (
            <div key={r.id}>
              {/* Email List Item */}
              <div 
                onClick={() => !selectedEmail && handleEmailClick(r)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: '1px solid #1f1f1f',
                  gap: 16,
                  cursor: selectedEmail ? 'default' : 'pointer',
                  background: active ? '#181818' : '#101010',
                  color: '#fff',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => !active && (e.currentTarget.style.background = '#181818')}
                onMouseLeave={(e) => !active && (e.currentTarget.style.background = '#101010')}
              >
                {/* Number Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'white',
                  color: 'black',
                  fontSize: 16,
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {originalIndex + 1}
                </div>

                {/* Email */}
                <div style={{ 
                  flex: 1, 
                  fontSize: 15,
                  fontWeight: 500,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#fff'
                }}>
                  {r.email}
                </div>

                {/* State Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: getStateBadgeStyle(r.state).bg,
                  color: getStateBadgeStyle(r.state).color,
                  fontSize: 13,
                  fontWeight: 500,
                  flexShrink: 0
                }}>
                  {r.state === 'Undeliverable' && <span style={{ fontSize: 16, color:'#fff' }}>✕</span>}
                  {r.state === 'Deliverable' && <span style={{ fontSize: 16, color:'#fff' }}>✓</span>}
                  {r.state === 'Risky' && <span style={{ fontSize: 16, color:'#fff' }}>⚠</span>}
                  {r.state}
                </div>

                {/* Score Badge */}
                <div style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: getScoreBadgeStyle(r.score).bg,
                  color: getScoreBadgeStyle(r.score).color,
                  fontSize: 14,
                  fontWeight: 600,
                  flexShrink: 0,
                  minWidth: 45,
                  textAlign: 'center'
                }}>
                  {r.score ?? '-'}
                </div>
              </div>

              {/* Expanded Detail View */}
              {active && (
                <div style={{ 
                  padding: '24px 20px',
                  background: '#181818',
                  color: '#fff'
                }}>
                  {/* Score Gauge */}
                  {r.score !== null && (
                    <div style={{ marginBottom: 24 }}>
                      <ScoreGauge score={r.score} getScoreColor={getScoreColor} />
                    </div>
                  )}

                  {/* General Section */}
                  <Section title="General">
                    <DetailRow label="Full Name" value={r.full_name || '—'} />
                    <DetailRow label="Gender" value={r.gender || '—'} />
                    <DetailRow label="State" value={r.state} badge={true} badgeStyle={getStateBadgeStyle(r.state)} />
                    <DetailRow label="Reason" value={r.reason || 'accepted_email'} pill={true} />
                    <DetailRow label="Domain" value={r.email?.split('@')[1] || '—'} link={true} />
                  </Section>

                  {/* Attributes Section */}
                  <Section title="Attributes">
                    <DetailRow label="Free" value={r.is_free ? 'Yes' : 'No'} icon="💰" />
                    <DetailRow label="Role" value={r.is_role ? 'Yes' : 'No'} icon="👤" />
                    <DetailRow label="Disposable" value={r.is_disposable ? 'Yes' : 'No'} icon="😊" />
                    <DetailRow label="Accept All" value={r.accept_all ? 'Yes' : 'No'} icon="🔍" />
                    <DetailRow label="Tag" value={r.tag || '—'} icon="🏷️" />
                    <DetailRow label="Numerical Characters" value={r.numerical_chars || '0'} icon="🔢" />
                    <DetailRow label="Alphabetical Characters" value={r.alphabetical_chars || '0'} icon="🔤" />
                    <DetailRow label="Unicode Symbols" value={r.unicode_symbols || '0'} icon="🌐" />
                    <DetailRow label="Mailbox Full" value={r.mailbox_full ? 'Yes' : 'No'} icon="📧" />
                    <DetailRow label="No Reply" value={r.no_reply ? 'Yes' : 'No'} icon="🚫" />
                    <DetailRow label="Secure Email Gateway" value={r.secure_gateway ? 'Yes' : 'No'} icon="🔒" />
                  </Section>

                  {/* Mail Server Section */}
                  <Section title="Mail Server">
                    <DetailRow label="SMTP Provider" value={r.smtp_provider || '---'} />
                    <DetailRow label="MX Record" value={r.mx_record || '---'} />
                    <DetailRow label="Implicit MX" value={r.implicit_mx_record ? 'Yes' : 'No'} />
                    <DetailRow label="Verified On" value={r.timestamp || '—'} />
                  </Section>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Smaller reusable section */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        marginBottom: 12,
        color: '#fff'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

// Score Gauge Component
function ScoreGauge({ score, getScoreColor }) {
  const markers = [
    { value: 0, label: '0' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 80, label: '80' },
    { value: 100, label: '100' }
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <div className="deliverability-meter">
          <div className="deliverability-meter-bar" style={{
            width: '100%',
            height: 12,
            borderRadius: 6,
            position: 'relative',
            overflow: 'visible'
          }}>
            <div style={{
              position: 'absolute',
              left: `${score}%`,
              top: '-14px',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `14px solid ${getScoreColor(score)}`
            }} />
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: 24, marginTop: 8 }}>
        {markers.map((marker) => (
          <div
            key={marker.value}
            style={{
              position: 'absolute',
              left: `${marker.value}%`,
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#aaa'
            }}>
              {marker.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// Helper detail row component
function DetailRow({ label, value, icon, badge, badgeStyle, pill, link }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 14
    }}>
      <div style={{ 
        color: '#bbb',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        {icon && <span style={{filter: 'brightness(1.7)'}}>{icon}</span>}
        {label}
      </div>

      <div style={{
        color: '#fff',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        {badge && badgeStyle ? (
          <span style={{
            padding: '4px 10px',
            borderRadius: 12,
            background: badgeStyle.bg,
            color: badgeStyle.color,
            fontSize: 12,
            fontWeight: 500
          }}>
            {value}
          </span>
        ) : pill ? (
          <span style={{
            padding: '4px 10px',
            borderRadius: 12,
            background: '#3b3c8f',
            color: '#fff',
            fontSize: 12
          }}>
            {value}
          </span>
        ) : link ? (
          <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" style={{
            color: '#fb923c',
            textDecoration: 'none'
          }}>
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
