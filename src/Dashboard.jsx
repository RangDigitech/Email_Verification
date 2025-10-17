import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from './auth';
import "./Dashboard.css";
import BulkVerifier from "./BulkVerifier";
import SingleVerifier from "./SingleVerifier";
import RecentEmails from "./components/RecentEmails";
import { useCredits } from "./CreditsContext";
import ProfileSection from "./components/ProfileSection";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("single");
  const [showSidebar, setShowSidebar] = useState(false);
  const [resetBulkView, setResetBulkView] = useState(0);
  const { credits } = useCredits?.() ?? { credits: { remaining_credits: Number(localStorage.getItem("credits") || 0) } };
  const [bulkPanel, setBulkPanel] = useState("overview");

  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const displayName = (localStorage.getItem("name_email") === userEmail && localStorage.getItem("name")) || null;

  useEffect(() => {
    if (window.location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }

    const pushOrReplaceState = (state, title, url) => {
      try {
        if (window.history && window.history.length && window.history.length > 1) {
          window.history.pushState(state, title, url);
        } else {
          window.history.replaceState(state, title, url);
        }
      } catch (e) {}
    };

    pushOrReplaceState({ pinned: true }, "", "/dashboard");

    const handlePopState = () => {
      setActiveTab("bulk");
      setBulkPanel("overview");
      setResetBulkView((prev) => prev + 1);
      pushOrReplaceState({ pinned: true }, "", "/dashboard");
      navigate("/dashboard", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  useEffect(() => {
    const handleProfileEvent = () => setActiveTab("profile");
    window.addEventListener("openProfileTab", handleProfileEvent);
    return () => window.removeEventListener("openProfileTab", handleProfileEvent);
  }, []);

  const handleLogoClick = () => {
    if (activeTab === "bulk") {
      setResetBulkView((prev) => prev + 1);
      setBulkPanel("overview");
      setShowSidebar(true);
    } else {
      setActiveTab("bulk");
      setBulkPanel("overview");
      setShowSidebar(true);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "single") setShowSidebar(false);
    else if (tab === "bulk") {
      setBulkPanel("overview");
      setShowSidebar(true);
    } else setShowSidebar(false);
  };

  return (
    <div className="dashboard-layout">
      {showSidebar && activeTab === "bulk" && (
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${bulkPanel === "overview" ? "active" : ""}`}
              onClick={() => setBulkPanel("overview")}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              Overview
            </button>

            <button
              className={`sidebar-item ${bulkPanel === "emails" ? "active" : ""}`}
              onClick={() => setBulkPanel("emails")}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              Emails
            </button>

            <button
              className={`sidebar-item ${bulkPanel === "exports" ? "active" : ""}`}
              onClick={() => setBulkPanel("exports")}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              Exports
            </button>

            <button
              className={`sidebar-item ${bulkPanel === "settings" ? "active" : ""}`}
              onClick={() => setBulkPanel("settings")}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2m10.4 0l-4.2-4.2m-2-2l-4.2-4.2" />
                </svg>
              </span>
              Settings
            </button>
          </nav>
        </aside>
      )}

      <div className={`dashboard-main ${showSidebar && activeTab === "bulk" ? "with-sidebar" : ""}`}>
        <header className="dashboard-header">
          <div className="header-left">
            <div className="dashboard-logo" onClick={handleLogoClick}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect x="30" y="60" width="140" height="100" fill="#E95729" rx="8" />
                <path
                  d="M 30 60 L 100 110 L 170 60"
                  stroke="#ffffff"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="150" cy="50" r="25" fill="#23c882" />
                <path
                  d="M 140 50 L 147 57 L 160 44"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="logo-text">Verifier</span>
            </div>

            <nav className="dashboard-tabs">
              <button
                className={`dashboard-tab ${activeTab === "bulk" ? "active" : ""}`}
                onClick={() => handleTabChange("bulk")}
              >
                <span className="tab-icon bulk-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    {/* Stacked envelopes for Bulk */}
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    <path d="M20 8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 4l-8 5-8-5v2l8 5 8-5v-2z" opacity="0.6" />
                    <path d="M20 12H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 4l-8 5-8-5v2l8 5 8-5v-2z" opacity="0.3" />
                  </svg>
                </span>
                Bulk
              </button>

              <button
                className={`dashboard-tab ${activeTab === "single" ? "active" : ""}`}
                onClick={() => handleTabChange("single")}
              >
                <span className="tab-icon single-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    {/* Single envelope */}
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                Single
              </button>
            </nav>
          </div>

          <div className="dashboard-actions">
            <button className="buy-credits-btn">BUY CREDITS</button>
            <UserToggle
              userEmail={userEmail}
              userInitial={userInitial}
              creditCount={credits?.remaining_credits ?? Number(localStorage.getItem("credits") || 0)}
              displayName={displayName}
            />
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === "bulk" && (
            <BulkVerifier
              setShowSidebar={setShowSidebar}
              resetTrigger={resetBulkView}
              panel={bulkPanel}
            />
          )}
          {activeTab === "single" && <SingleVerifier />}
          {activeTab === "profile" && <ProfileSection />}
        </div>
      </div>
    </div>
  );
}

function UserToggle({ userEmail, userInitial, creditCount = 0, displayName = null }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleProfileClick = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("openProfileTab"));
  };

  const handleBillingClick = () => {
    setOpen(false);
    // Route to pricing page from the dropdown
    navigate('/pricing');
  };

  return (
    <div className="user-toggle relative" ref={ref}>
      <button className="user-toggle-btn flex items-center gap-2" onClick={() => setOpen((s) => !s)}>
        <div className="user-avatar bg-[#E95729] text-white">{userInitial}</div>
        <span className={`chev ${open ? "open" : ""}`}>&#x25BE;</span>
      </button>

      {open && (
        <div className="user-panel absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-200 w-56 z-50">
          <div className="panel-top flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="panel-avatar bg-[#E95729] text-white w-10 h-10 rounded-full grid place-items-center font-bold">
              {userInitial}
            </div>
            <div>
              <div className="panel-name font-semibold">{displayName || userEmail}</div>
              <div className="panel-credits text-xs text-gray-500">
                CREDIT BALANCE <strong>{creditCount}</strong>
              </div>
            </div>
          </div>

          <ul className="panel-menu text-sm text-gray-700 p-2">
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleProfileClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </span>
              <span>Profile</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
                  <path d="M22 22a7 7 0 0 0-14 0" />
                </svg>
              </span>
              <span>Account</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M7 8h10M7 12h6" />
                </svg>
              </span>
              <span>Integrations</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleBillingClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M3 11h18M8 3v4M16 3v4" />
                </svg>
              </span>
              <span>Billing</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 6-10 6-10 6 6.686 6 10Z" />
                </svg>
              </span>
              <span>Referrals</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2">
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8h.01M11 12h1v4h1" />
                </svg>
              </span>
              <span>Help</span>
            </li>
          </ul>

          <div className="panel-footer border-t border-gray-100 p-3">
            <button
              className="w-full text-left text-[#E95729] font-semibold flex items-center gap-2"
              onClick={() => { logout(); window.location.href = '/'; }}
            >
              <span className="signout-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M21 3v18" />
                </svg>
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
