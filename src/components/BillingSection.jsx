import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BillingSection.css";
import "./ProfileSection.css"; // reuse layout/sidebar styles

export default function BillingSection() {
  // Get user signup date or use a fallback
  const getUserSignupDate = () => {
    const signupDate = localStorage.getItem("ev_user_signup_date");
    if (signupDate) {
      return signupDate;
    }
    
    // If no signup date exists, create one (this would normally come from the backend)
    // For demo purposes, we'll use a realistic date
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() - 5); // 5 days ago
    const formattedDate = fallbackDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
    
    // Store it for future use
    localStorage.setItem("ev_user_signup_date", formattedDate);
    return formattedDate;
  };

  const [stats, setStats] = useState({
    creditBalance: Number(localStorage.getItem("credits") || 243),
    lastAdded: getUserSignupDate(),
    timeUntilDepletion: localStorage.getItem("ev_time_until_depletion") || "8 months",
  });

  const [range, setRange] = useState("10/14/2025 - 10/20/2025");
  const [interval, setInterval] = useState("Hourly");

  // Auto-refill form
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(
    localStorage.getItem("ev_auto_refill_enabled") === "true"
  );
  const [autoRefillAmount, setAutoRefillAmount] = useState(
    localStorage.getItem("ev_auto_refill_amount") || "10,000"
  );
  const [autoRefillThreshold, setAutoRefillThreshold] = useState(
    localStorage.getItem("ev_auto_refill_threshold") || "1,500"
  );
  const [savedMsg, setSavedMsg] = useState("");

  const saveAutoRefill = () => {
    localStorage.setItem("ev_auto_refill_enabled", String(autoRefillEnabled));
    localStorage.setItem("ev_auto_refill_amount", String(autoRefillAmount));
    localStorage.setItem("ev_auto_refill_threshold", String(autoRefillThreshold));
    setSavedMsg("Settings saved");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const openProfile = () => window.dispatchEvent(new CustomEvent("openProfileTab"));
  const openAccount = () => window.dispatchEvent(new CustomEvent("openAccountTab"));
  const openIntegrations = () => window.dispatchEvent(new CustomEvent("openIntegrationsTab"));

  // Billing sidebar sub-navigation
  const [activeSub, setActiveSub] = useState("usage");
  const [billingOpen] = useState(true);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="profile-layout">
      {/* Left Sidebar - reuse Profile sidebar */}
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
          <button className="profile-nav-item active">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
            </span>
            Billing
          </button>
          {billingOpen && (
            <div className="profile-subnav">
              <button
                onClick={() => { setActiveSub("usage"); scrollToSection("billing-usage"); }}
                className={`profile-subnav-item ${activeSub === "usage" ? "active" : ""}`}
              >
                Credit Usage
              </button>
              <button
                onClick={() => { setActiveSub("subscriptions"); scrollToSection("billing-subscriptions"); }}
                className={`profile-subnav-item ${activeSub === "subscriptions" ? "active" : ""}`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => { setActiveSub("autoref"); scrollToSection("billing-autoref"); }}
                className={`profile-subnav-item ${activeSub === "autoref" ? "active" : ""}`}
              >
                Auto-Refill
              </button>
              <button
                onClick={() => { setActiveSub("payments"); scrollToSection("billing-payments"); }}
                className={`profile-subnav-item ${activeSub === "payments" ? "active" : ""}`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => { setActiveSub("invoices"); scrollToSection("billing-invoices"); }}
                className={`profile-subnav-item ${activeSub === "invoices" ? "active" : ""}`}
              >
                Invoices
              </button>
            </div>
          )}
          {/* Additional items */}
          <button className="profile-nav-item" onClick={() => window.dispatchEvent(new CustomEvent("openReferralsTab"))}>
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
          <div className="billing-layout">
      {/* Top header breadcrumb */}
      <div className="billing-breadcrumb">
        <span className="dot" /> Billing
      </div>

      {/* KPI cards */}
      <div className="billing-kpis">
        <div className="kpi-card">
          <div className="kpi-label">CREDIT BALANCE</div>
          <div className="kpi-value">{stats.creditBalance.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">CREDITS LAST ADDED</div>
          <div className="kpi-value">{stats.lastAdded}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">TIME UNTIL DEPLETION</div>
          <div className="kpi-value">{stats.timeUntilDepletion}</div>
        </div>
      </div>

      {/* Credit usage */}
      <div className="billing-card" id="billing-usage">
        <div className="billing-card-header">
          <div className="billing-card-title">Credit Usage</div>
          <div className="billing-filters">
            <select value={"All"} onChange={() => {}} className="billing-select"><option>All</option></select>
            <button className="billing-range">{range}</button>
            <select value={interval} onChange={(e)=>setInterval(e.target.value)} className="billing-select">
              <option>Hourly</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>

        {/* Mini counters */}
        <div className="usage-mini">
          <div className="mini-col"><span className="mini-label">BULK</span><span className="mini-dot bulk"/>3</div>
          <div className="mini-col"><span className="mini-label">SINGLE</span><span className="mini-dot single"/>3</div>
          <div className="mini-col"><span className="mini-label">API</span><span className="mini-dot api"/>0</div>
          <div className="mini-col"><span className="mini-label">OTHER</span><span className="mini-dot other"/>0</div>
        </div>

        {/* Chart with proper axes and grid */}
        <div className="usage-chart-container">
          <div className="chart-y-axis">
            <div className="y-label">3</div>
            <div className="y-label">2</div>
            <div className="y-label">1</div>
            <div className="y-label">0</div>
          </div>
          <div className="chart-content">
            <div className="chart-grid">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            <div className="chart-bars">
              <div className="chart-bar-container">
                <div className="chart-bar" style={{height: '0%'}}></div>
                <div className="chart-date">10/15</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar single-bar" style={{height: '33%'}}></div>
                <div className="chart-date">10/16</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar bulk-bar" style={{height: '100%'}}></div>
                <div className="chart-date">10/17</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{height: '0%'}}></div>
                <div className="chart-date">10/18</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{height: '0%'}}></div>
                <div className="chart-date">10/19</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{height: '0%'}}></div>
                <div className="chart-date">10/20</div>
              </div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{height: '0%'}}></div>
                <div className="chart-date">10/21</div>
              </div>
            </div>
          </div>
        </div>
        <div className="usage-footnote">The chart above is for reporting purposes only and may not reflect exact usage.</div>
      </div>

      {/* Subscriptions */}
      <div className="billing-card" id="billing-subscriptions">
        <div className="billing-card-title">Subscriptions</div>

        <div className="sub-block">
          <div className="sub-title">Credits <span className="emoji">🧾</span></div>
          <div className="sub-desc">Purchase credits on a recurring basis to save money and have consistent billing. You can use these credits with our Bulk, Single, API, and Form products</div>
          <Link to="/signup">
            <button className="btn-primary small">GET STARTED</button>
          </Link>
        </div>

        <div className="sub-block">
          <div className="sub-title">Deliverability <span className="emoji">📫</span></div>
          <div className="sub-desc">Ensure your emails reach the inbox using our suite of deliverability tools including Inbox Reports and Blacklist Monitoring.</div>
          <Link to="/signup">
            <button className="btn-primary small">GET STARTED</button>
          </Link>
        </div>
      </div>

      {/* Auto-refill */}
      <div className="billing-card" id="billing-autoref">
        <div className="billing-card-header">
          <div className="billing-card-title">Auto-Refill</div>
          <label className="switch">
            <input type="checkbox" checked={autoRefillEnabled} onChange={()=>setAutoRefillEnabled(v=>!v)} />
            <span className="slider" />
          </label>
        </div>

        <div className="auto-grid">
          <div className="auto-field">
            <div className="auto-label">Automatically purchase <span className="help">?</span></div>
            <input className="profile-input" value={autoRefillAmount} onChange={(e)=>setAutoRefillAmount(e.target.value)} placeholder="10,000" />
          </div>
          <div className="auto-field">
            <div className="auto-label">When balance drops below <span className="help">?</span></div>
            <input className="profile-input" value={autoRefillThreshold} onChange={(e)=>setAutoRefillThreshold(e.target.value)} placeholder="1,500" />
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-primary" onClick={saveAutoRefill}>SAVE</button>
        </div>
        {savedMsg && <div className="success-message" style={{marginTop:12}}>{savedMsg}</div>}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="billing-card" id="billing-payments">
        <div className="billing-card-title">Payment Methods</div>
        <div className="sub-desc">Add and manage your payment cards and billing details.</div>
      </div>

      {/* Invoices */}
      <div className="billing-card" id="billing-invoices">
        <div className="billing-card-title">Invoices</div>
        <div className="sub-desc">View and download your invoices and billing history.</div>
      </div>
    </div>
  </div>
  );
}
