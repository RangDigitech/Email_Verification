import React, { useState } from "react";
import "./SingleVerifier.css";
import { validateEmail } from "./api";
import RecentEmails from "./components/RecentEmails";

export default function SingleVerifier() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const normalizeBackendResult = (r) => {
    if (!r) return null;

    const emailVal = r.email || '';
    const localPart = emailVal.split('@')[0] || '';
    const cleanName = localPart.replace(/[0-9_.+\-]/g, '');
    const fullName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    return {
      email: emailVal,
      full_name: fullName,
      score: r.score || 0,
      state: r.state || 'Undeliverable',
      reason: r.reason || 'accepted_email',
      domain: r.domain || '',
      is_free: r.free || false,
      is_role: r.role || false,
      is_disposable: r.disposable || false,
      accept_all: r.accept_all || false,
      tag: r.tag || null,
      numerical_chars: r.numerical_characters || 0,
      alphabetical_chars: r.alphabetical_characters || 0,
      unicode_symbols: r.unicode_symbols || 0,
      mailbox_full: r.mailbox_full || false,
      no_reply: r.no_reply || false,
      secure_gateway: r.secure_email_gateway || false,
      smtp_provider: r.smtp_provider || '---',
      mx_record: r.mx_record || '---',
      implicit_mx_record: r.implicit_mx_record || false,
      timestamp: new Date().toLocaleString(),
    };
  };

  const getStateBadgeStyle = (state) => {
    const stateColors = {
      'Deliverable': { bg: '#10b981', color: '#fff' },
      'Undeliverable': { bg: '#ef4444', color: '#fff' },
      'Risky': { bg: '#fb923c', color: '#fff' },
    };
    return stateColors[state] || { bg: '#6b7280', color: '#fff' };
  };

  const getScoreBadgeStyle = (score) => {
    if (score >= 80) return { bg: '#d1fae5', color: '#065f46' };
    if (score >= 50) return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#fee2e2', color: '#991b1b' };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#3ed299';
    if (score >= 10) return '#ffcb60';
    if (score >= 5) return '#ff5f7d';
    return '#549ee7';
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsVerifying(true);
    setErrorMsg("");
    setResult(null);

    validateEmail({ email, smtp: true, smtp_from: "noreply@example.com" })
      .then((data) => {
        const payload = data && data.result ? data.result : data;
        if (!payload) throw new Error("Received an invalid response from the server.");
        const normalized = normalizeBackendResult(payload);
        setResult(normalized);
      })
      .catch((err) => {
        console.error("Verification API call failed:", err);
        setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
        setResult(null);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };

  return (
    <div className="single-verifier">
      <div className="verifier-card">
        <div className="verifier-header">
          <h2>Email Verifier</h2>
        </div>

        <form onSubmit={handleVerify} className="verifier-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter an email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
              required
            />
            <button type="submit" className="verify-button" disabled={isVerifying}>
              {isVerifying ? (
                <div className="spinner"></div>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </form>
      </div>

      {errorMsg && (
        <div className="api-error">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      
      {!result && !isVerifying && (
        <div className="recent-wrapper">
          <RecentEmails limit={12} />
        </div>
      )}

      {result && (
        <div className="result-card fade-in">
          {/* Email Header with Score Badge */}
          <div 
            onClick={() => setResult(null)}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              gap: 16,
              cursor: 'pointer',
              background: '#fff',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {/* Avatar Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#fb923c',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              flexShrink: 0
            }}>
              ✓
            </div>

            {/* Email */}
            <div style={{ 
              flex: 1, 
              fontSize: 15,
              fontWeight: 500,
              color: '#111827',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {result.email}
            </div>

            {/* State Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: getStateBadgeStyle(result.state).bg,
              color: getStateBadgeStyle(result.state).color,
              fontSize: 13,
              fontWeight: 500,
              flexShrink: 0
            }}>
              {result.state === 'Undeliverable' && (
                <span style={{ fontSize: 16 }}>✕</span>
              )}
              {result.state === 'Deliverable' && (
                <span style={{ fontSize: 16 }}>✓</span>
              )}
              {result.state === 'Risky' && (
                <span style={{ fontSize: 16 }}>⚠</span>
              )}
              {result.state}
            </div>

            {/* Score Badge */}
            <div style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: result.score !== null ? getScoreBadgeStyle(result.score).bg : '#f3f4f6',
              color: result.score !== null ? getScoreBadgeStyle(result.score).color : '#6b7280',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
              minWidth: 45,
              textAlign: 'center'
            }}>
              {result.score ?? '-'}
            </div>
          </div>

          {/* Expanded Detail View */}
          <div style={{ 
            padding: '24px 20px',
            background: '#fafafa'
          }}>
            {/* Advanced Score Gauge */}
            {result.score !== null && (
              <div style={{ marginBottom: 24 }}>
                <ScoreGauge score={result.score} getScoreColor={getScoreColor} />
              </div>
            )}

            {/* General Section */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                marginBottom: 12,
                color: '#111827'
              }}>
                General
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <DetailRow label="Full Name" value={result.full_name || '—'} />
                <DetailRow 
                  label="State" 
                  value={result.state}
                  badge={true}
                  badgeStyle={getStateBadgeStyle(result.state)}
                />
                <DetailRow 
                  label="Reason" 
                  value={result.reason || 'accepted_email'}
                  pill={true}
                />
                <DetailRow 
                  label="Domain" 
                  value={result.domain || '—'}
                  link={true}
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                marginBottom: 12,
                color: '#111827'
              }}>
                Attributes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <DetailRow label="Free" value={result.is_free ? 'Yes' : 'No'} icon="💰" badge={result.is_free} />
                <DetailRow label="Role" value={result.is_role ? 'Yes' : 'No'} icon="👤" />
                <DetailRow label="Disposable" value={result.is_disposable ? 'Yes' : 'No'} icon="😊" />
                <DetailRow label="Accept All" value={result.accept_all ? 'Yes' : 'No'} icon="🔍" />
                <DetailRow label="Tag" value={result.tag || '—'} icon="🏷️" />
                <DetailRow label="Numerical Characters" value={result.numerical_chars || '0'} icon="🔢" badge={result.numerical_chars > 0} />
                <DetailRow label="Alphabetical Characters" value={result.alphabetical_chars || '0'} icon="🔤" />
                <DetailRow label="Unicode Symbols" value={result.unicode_symbols || '0'} icon="🌐" />
                <DetailRow label="Mailbox Full" value={result.mailbox_full ? 'Yes' : 'No'} icon="📧" />
                <DetailRow label="No Reply" value={result.no_reply ? 'Yes' : 'No'} icon="🚫" />
                <DetailRow label="Secure Email Gateway" value={result.secure_gateway ? 'Yes' : 'No'} icon="🔒" />
              </div>
            </div>

            {/* Mail Server Section */}
            <div>
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                marginBottom: 12,
                color: '#111827'
              }}>
                Mail Server
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <DetailRow label="SMTP Provider" value={result.smtp_provider || '---'} />
                <DetailRow label="MX Record" value={result.mx_record || '---'} />
                <DetailRow label="Implicit MX Record" value={result.implicit_mx_record ? 'Yes' : 'No'} />
                <DetailRow label="Verified On" value={result.timestamp || '—'} />
              </div>
            </div>
          </div>
        </div>
      )}
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
      {/* Color Bar */}
      <div style={{ 
        position: 'relative',
        marginBottom: 8
      }}>
        <div className="deliverability-meter">
          <div className="deliverability-meter-bar" style={{
            width: '100%',
            height: 12,
            borderRadius: 6,
            position: 'relative',
            overflow: 'visible'
          }}>
            {/* Inverted Water Drop Indicator */}
            <div style={{
              position: 'absolute',
              left: `${score}%`,
              top: '-14px',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `14px solid ${getScoreColor(score)}`,
              zIndex: 10,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
            }} />
          </div>
        </div>
      </div>

      {/* Score Markers Below Bar */}
      <div style={{ 
        position: 'relative',
        height: 24,
        marginTop: 8
      }}>
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
              color: '#6b7280'
            }}>
              {marker.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value, icon, badge, badgeStyle, pill, link }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 14
    }}>
      <div style={{ 
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div style={{ 
        color: '#111827',
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
            background: '#e0e7ff',
            color: '#4f46e5',
            fontSize: 12,
            fontWeight: 500
          }}>
            {value}
          </span>
        ) : badge && typeof badge === 'boolean' ? (
          <>
            {value}
            <span style={{
              padding: '2px 8px',
              borderRadius: 10,
              background: '#e0e7ff',
              color: '#4f46e5',
              fontSize: 11,
              fontWeight: 600
            }}>
              PAID
            </span>
          </>
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