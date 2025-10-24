import React from "react";
import "./ProfileSection.css";

export default function ReferralsSection() {
  const openProfile = () => window.dispatchEvent(new CustomEvent("openProfileTab"));
  const openAccount = () => window.dispatchEvent(new CustomEvent("openAccountTab"));
  const openIntegrations = () => window.dispatchEvent(new CustomEvent("openIntegrationsTab"));
  const openBilling = () => window.dispatchEvent(new CustomEvent("openBillingTab"));

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <nav className="profile-nav">
          <button className="profile-nav-item" onClick={openProfile}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6"/></svg>
            </span>
            Profile
          </button>
          <button className="profile-nav-item" onClick={openAccount}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            </span>
            Account
          </button>
          <button className="profile-nav-item" onClick={openIntegrations}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M12 3v18"/></svg>
            </span>
            Integrations
          </button>
          <button className="profile-nav-item" onClick={openBilling}>
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
            </span>
            Billing
          </button>
          <button className="profile-nav-item active">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c4-4 8-7 8-12a8 8 0 1 0-16 0c0 5 4 8 8 12Z"/></svg>
            </span>
            Referrals
          </button>
          {/* <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
            </span>
            Developer
          </button> */}
        </nav>
      </aside>

      <div className="profile-content-wrapper">
        <div className="profile-content">
          <div className="profile-card">
            <h2 className="card-title">Referrals</h2>

            <div className="referrals-header">
              <div className="referrals-note">You have 5 invites remaining.</div>
              <div className="referrals-input-row">
                <input className="profile-input referrals-input" placeholder="enter an email address" />
                <button className="btn-primary">SEND REFERRAL</button>
              </div>
            </div>

            <div className="integrations-table">
              <div className="integrations-table-header">
                <div>Email Address</div>
                <div>Sent</div>
                <div>Status</div>
              </div>
              <div className="integrations-empty-state">
                <div className="empty-state-text">There are no referrals to display.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


