
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from './auth';
import "./Dashboard.css";
import BulkVerifier from "./BulkVerifier";
import SingleVerifier from "./SingleVerifier";
import RecentEmails from "./components/RecentEmails";
import { useCredits } from "./CreditsContext";
import ProfileSection from "./components/ProfileSection";
import AccountSection from "./components/AccountSection";
import BillingSection from "./components/BillingSection";
import ReferralsSection from "./components/ReferralsSection";
import BuyCreditsModal from "./components/BuyCreditsModal";
import Help from "./Help";
import FAQs from "./FAQs";
import ContactPage from "./ContactPage";
import AboutUs from "./components/AboutUs";
import Blogs from "./Blogs";
import { isAdminEmail } from "./config/admin";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("single");
  const [showSidebar, setShowSidebar] = useState(false);
  const [resetBulkView, setResetBulkView] = useState(0);
  const { credits } = useCredits?.() ?? { credits: { remaining_credits: Number(localStorage.getItem("credits") || 0) } };
  const [bulkPanel, setBulkPanel] = useState("overview");
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  // Debug: Log when showBuyCreditsModal changes
  React.useEffect(() => {
    console.log("Dashboard - showBuyCreditsModal changed to:", showBuyCreditsModal);
  }, [showBuyCreditsModal]);

  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const displayName = (localStorage.getItem("name_email") === userEmail && localStorage.getItem("name")) || null;
  
// Check if current user is admin
  const isAdmin = React.useMemo(() => {
    return isAdminEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    // Check for access denied message
    const accessDenied = sessionStorage.getItem('accessDenied');
    if (accessDenied === 'true') {
      alert('Access Denied: You do not have permission to access the admin dashboard.');
      sessionStorage.removeItem('accessDenied');
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

    const handleHashChange = () => {
      const hash = window.location.hash;
      // if (hash === "#referrals") setActiveTab("referrals");
      if (hash === "#billing") setActiveTab("billing");
      else if (hash === "#account") setActiveTab("account");
      else if (hash === "#profile") setActiveTab("profile");
      else if (hash === "#help") setActiveTab("help");
      else if (hash === "#faqs") setActiveTab("faqs");
      else if (hash === "#contact") setActiveTab("contact");
      else if (hash === "#about") setActiveTab("about");
      else if (hash === "#blogs") setActiveTab("blogs");
      // else if (hash === "#integrations") setActiveTab("integrations");
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  useEffect(() => {
    const handleProfileEvent = () => setActiveTab("profile");
    const handleAccountEvent = () => setActiveTab("account");
    // const handleIntegrationsEvent = () => setActiveTab("integrations");
    const handleBillingEvent = () => setActiveTab("billing");
    // const handleReferralsEvent = () => setActiveTab("referrals");
    const handleHelpEvent = () => setActiveTab("help");
    const handleFAQsEvent = () => setActiveTab("faqs");
    const handleBuyCreditsEvent = () => setShowBuyCreditsModal(true);
    // expose helpers on window for direct calls
    // window.openReferralsTab = () => { window.location.hash = "#referrals"; setActiveTab("referrals"); };
    window.openBillingTab = () => { window.location.hash = "#billing"; setActiveTab("billing"); };
    window.openAccountTab = () => { window.location.hash = "#account"; setActiveTab("account"); };
    window.openProfileTab = () => { window.location.hash = "#profile"; setActiveTab("profile"); };
    window.openHelpTab = () => { window.location.hash = "#help"; setActiveTab("help"); };
    window.openFAQsTab = () => { window.location.hash = "#faqs"; setActiveTab("faqs"); };
    window.openContactTab = () => { window.location.hash = "#contact"; setActiveTab("contact"); };
    window.openAboutTab = () => { window.location.hash = "#about"; setActiveTab("about"); };
    window.openBlogsTab = () => { window.location.hash = "#blogs"; setActiveTab("blogs"); };
    // window.openIntegrationsTab = () => { window.location.hash = "#integrations"; setActiveTab("integrations"); };
    window.openBuyCreditsModal = () => {
      console.log("Opening Buy Credits Modal");
      setShowBuyCreditsModal(true);
    };
    window.addEventListener("openProfileTab", handleProfileEvent);
    window.addEventListener("openAccountTab", handleAccountEvent);
    // window.addEventListener("openIntegrationsTab", handleIntegrationsEvent);
    window.addEventListener("openBillingTab", handleBillingEvent);
    // window.addEventListener("openReferralsTab", handleReferralsEvent);
    window.addEventListener("openHelpTab", handleHelpEvent);
    window.addEventListener("openFAQsTab", handleFAQsEvent);
    window.addEventListener("openBuyCreditsModal", handleBuyCreditsEvent);
    return () => {
      window.removeEventListener("openProfileTab", handleProfileEvent);
      window.removeEventListener("openAccountTab", handleAccountEvent);
      // window.removeEventListener("openIntegrationsTab", handleIntegrationsEvent);
      window.removeEventListener("openBillingTab", handleBillingEvent);
      // window.removeEventListener("openReferralsTab", handleReferralsEvent);
      window.removeEventListener("openHelpTab", handleHelpEvent);
      window.removeEventListener("openFAQsTab", handleFAQsEvent);
      window.removeEventListener("openBuyCreditsModal", handleBuyCreditsEvent);
      // delete window.openReferralsTab;
      delete window.openBillingTab;
      delete window.openAccountTab;
      delete window.openProfileTab;
      delete window.openHelpTab;
      delete window.openFAQsTab;
      // delete window.openIntegrationsTab;
      delete window.openBuyCreditsModal;
    };
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
              <img src="/app_logo1.png" alt="Logo" className="logo-image" />
              <span className="logo-text">AI Email Verifier</span>
            </div>

            <nav className="dashboard-tabs">
              <button
                className={`dashboard-tab ${activeTab === "single" ? "active" : ""}`}
                onClick={() => handleTabChange("single")}
              >
                <span className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                Single
              </button>
              
              <button
                className={`dashboard-tab ${activeTab === "bulk" ? "active" : ""}`}
                onClick={() => handleTabChange("bulk")}
              >
                <span className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>                 
                </span>
                Bulk
              </button>
            </nav>
          </div>

          <div className="dashboard-actions">
            <button className="buy-credits-btn" onClick={() => setShowBuyCreditsModal(true)}>BUY CREDITS</button>
            {/* Only show Admin Dashboard button to admins */}
            {isAdmin && (
              <button 
                className="admin-dashboard-btn" 
                onClick={() => navigate('/admin')}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '12px'
                }}
              >
                Admin Dashboard
              </button>
            )}
            <UserToggle
              userEmail={userEmail}
              userInitial={userInitial}
              creditCount={credits?.remaining_credits ?? Number(localStorage.getItem("credits") || 0)}
              displayName={displayName}
              onOpenProfile={() => setActiveTab("profile")}
              onOpenAccount={() => setActiveTab("account")}
              onOpenBilling={() => setActiveTab("billing")}
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
          {activeTab === "account" && <AccountSection />}
          {/* {activeTab === "integrations" && <ProfileSection />} */}
          {activeTab === "billing" && <BillingSection />}
          {activeTab === "help" && <Help />}
          {activeTab === "faqs" && <FAQs />}
          {activeTab === "contact" && <ContactPage />}
          {activeTab === "about" && <AboutUs />}
          {activeTab === "blogs" && <Blogs />}
          {/* {activeTab === "referrals" && <ReferralsSection />} */}
        </div>
      </div>
      
      {/* Buy Credits Modal */}
      {showBuyCreditsModal && (
        <BuyCreditsModal onClose={() => setShowBuyCreditsModal(false)} />
      )}
    </div>
  );
}
function UserToggle({ userEmail, userInitial, creditCount = 0, displayName = null, onOpenProfile, onOpenAccount, onOpenBilling }) {
  const [open, setOpen] = React.useState(false);
  const [currentCreditCount, setCurrentCreditCount] = React.useState(creditCount);
  const ref = React.useRef(null);
  const navigate = useNavigate();
  const { refreshCredits, credits } = useCredits?.() ?? { refreshCredits: () => {}, credits: null };
 

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

  React.useEffect(() => {
    if (open && refreshCredits && typeof refreshCredits === 'function') {
      // Silently refresh credits in the background when dropdown opens
      Promise.resolve(refreshCredits()).catch(() => {});
    }
  }, [open, refreshCredits]);
 
  // Update credit count when credits context changes
  React.useEffect(() => {
    const newCreditCount = credits?.remaining_credits ?? Number(localStorage.getItem("credits") || 0);
    setCurrentCreditCount(newCreditCount);
  }, [credits]);
 
  // Also sync with parent's creditCount prop
  React.useEffect(() => {
    setCurrentCreditCount(creditCount);
  }, [creditCount]);

  const handleProfileClick = () => {
    setOpen(false);
    onOpenProfile?.();
  };

  const handleBillingClick = () => {
    setOpen(false);
    onOpenBilling?.();
  };

  const handleAccountClick = () => {
    setOpen(false);
    onOpenAccount?.();
  };

  const handleHelpClick = () => {
    setOpen(false);
    if (window.openHelpTab) window.openHelpTab();
  };

  const handleFAQsClick = () => {
    setOpen(false);
    if (window.openFAQsTab) window.openFAQsTab();
  };

  // New: open marketing pages as internal tabs (keep dashboard navbar)
  const handleContactClick = () => {
    setOpen(false);
    if (window.openContactTab) window.openContactTab();
  };
  const handleAboutClick = () => {
    setOpen(false);
    if (window.openAboutTab) window.openAboutTab();
  };
  const handleBlogsClick = () => {
    setOpen(false);
    if (window.openBlogsTab) window.openBlogsTab();
  };

  // const handleIntegrationsClick = () => {
  //   setOpen(false);
  //   onOpenIntegrations?.();
  // };

  // const handleReferralsClick = () => {
  //   setOpen(false);
  //   if (window.openReferralsTab) window.openReferralsTab();
  //   else window.dispatchEvent(new CustomEvent("openReferralsTab"));
  // };

  return (
    <div className="user-toggle relative" ref={ref}>
      <button className="user-toggle-btn flex items-center gap-2" onClick={() => setOpen((s) => !s)}>
        <div className="user-avatar bg-[#000000] text-white">{userInitial}</div>
        <span className={`chev ${open ? "open" : ""}`}>&#x25BE;</span>
      </button>

      {open && (
        <div className="user-panel absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-black-200 w-56 z-50">
          <div className="panel-top flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="panel-avatar bg-[#000000] text-white w-10 h-10 rounded-full grid place-items-center font-bold">
              {userInitial}
            </div>
            <div>
              <div className="panel-name font-semibold" style={{ color: '#000000' }}>{displayName || userEmail}</div>
              <div className="panel-credits text-xs text-gray-500">
                CREDIT BALANCE <strong>{currentCreditCount}</strong>
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
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleAccountClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
                  <path d="M22 22a7 7 0 0 0-14 0" />
                </svg>
              </span>
              <span>Account</span>
            </li>
            {/* <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleIntegrationsClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M7 8h10M7 12h6" />
                </svg>
              </span>
              <span>Integrations</span>
            </li> */}
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleBillingClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M3 11h18M8 3v4M16 3v4" />
                </svg>
              </span>
              <span>Billing</span>
            </li>
            {/* <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleReferralsClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 6-10 6-10 6 6.686 6 10Z" />
                </svg>
              </span>
              <span>Referrals</span>
            </li> */}
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleHelpClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span>Help</span>
            </li>
             <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleFAQsClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 9h6v6H9z" />
                  <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
                </svg>
              </span>
              <span>FAQs</span>
            </li>
            {/*<li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleContactClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>Contact Us</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleAboutClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20l-7-4V8l7-4 7 4v8l-7 4Z" />
                  <path d="M12 12v.01" />
                  <path d="M12 16v-2" />
                </svg>
              </span>
              <span>About Us</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={handleBlogsClick}>
              <span className="menu-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </span>
              <span>Blogs</span>
            </li> */}
          </ul>

          <div className="panel-footer border-t border-gray-100 p-3">
            <button
              className="w-full text-left text-[#000000] font-semibold flex items-center gap-2"
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
