import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { getUser } from "../auth";
import { getUserProfile, updateUserProfile } from "../api";
import "./ProfileSection.css";

export default function ProfileSection() {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [profileOpen, setProfileOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleAccountEvent = () => setActiveMenu("account");
    const handleIntegrationsEvent = () => setActiveMenu("integrations");
    window.addEventListener("openAccountTab", handleAccountEvent);
    window.addEventListener("openIntegrationsTab", handleIntegrationsEvent);
    return () => {
      window.removeEventListener("openAccountTab", handleAccountEvent);
      window.removeEventListener("openIntegrationsTab", handleIntegrationsEvent);
    };
  }, []);

  return (
    <div className="profile-layout">
      {/* Left Sidebar */}
      <aside className="profile-sidebar">
        <nav className="profile-nav">
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setActiveMenu("profile");
              scrollToSection("profile-card-section");
            }}
            className={`profile-nav-item profile-nav-parent ${activeMenu === "profile" ? "active" : ""}`}
            aria-expanded={profileOpen}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </span>
            Profile
            <span className={`caret ${profileOpen ? "open" : ""}`} aria-hidden>
              ▾
            </span>
          </button>

          {profileOpen && (
            <div className="profile-subnav">
              <button
                onClick={() => {
                  setProfileOpen(true);
                  setActiveMenu("profile");
                  scrollToSection("profile-card-section");
                }}
                className={`profile-subnav-item ${activeMenu === "profile" ? "active" : ""}`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setProfileOpen(true);
                  setActiveMenu("profile");
                  scrollToSection("sso-card-section");
                }}
                className={`profile-subnav-item`}
              >
                Single Sign-On
              </button>
              {/* <button
                onClick={() => setActiveMenu("2step")}
                className={`profile-subnav-item ${activeMenu === "2step" ? "active" : ""}`}
              >
                2-Step Verification
              </button>
              <button
                onClick={() => setActiveMenu("notifications")}
                className={`profile-subnav-item ${activeMenu === "notifications" ? "active" : ""}`}
              >
                Notifications
              </button> */}
            </div>
          )}

          <button
            onClick={() => {
              setAccountOpen((o) => !o);
              setActiveMenu("account");
              scrollToSection("account-section");
            }}
            className={`profile-nav-item profile-nav-parent ${activeMenu === "account" ? "active" : ""}`}
            aria-expanded={accountOpen}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </span>
            Account
            <span className={`caret ${accountOpen ? "open" : ""}`} aria-hidden>
              ▾
            </span>
          </button>

          {accountOpen && (
            <div className="profile-subnav">
              <button
                onClick={() => {
                  setAccountOpen(true);
                  setActiveMenu("account");
                  scrollToSection("account-section");
                }}
                className={`profile-subnav-item ${activeMenu === "account" ? "active" : ""}`}
              >
                Account
              </button>
              {/* <button
                onClick={() => {
                  setActiveMenu("account");
                  scrollToSection("team-section");
                }}
                className={`profile-subnav-item`}
              >
                Team
              </button>
              <button
                onClick={() => {
                  setActiveMenu("account");
                  scrollToSection("security-section");
                }}
                className={`profile-subnav-item`}
              >
                Security
              </button>
              <button
                onClick={() => {
                  setActiveMenu("account");
                  scrollToSection("data-retention-section");
                }}
                className={`profile-subnav-item`}
              >
                Data Retention
              </button>
              <button
                onClick={() => {
                  setActiveMenu("account");
                  scrollToSection("authorized-apps-section");
                }}
                className={`profile-subnav-item`}
              >
                Authorized Apps
              </button> */}
            </div>
          )}

          {/* <button 
            className={`profile-nav-item ${activeMenu === "integrations" ? "active" : ""}`}
            onClick={() => setActiveMenu("integrations")}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M7 8h10M7 12h6" />
              </svg>
            </span>
            Integrations
          </button> */}

          <button 
            className={`profile-nav-item ${activeMenu === "billing" ? "active" : ""}`}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("openBillingTab"));
            }}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M3 11h18M8 3v4M16 3v4" />
              </svg>
            </span>
            Billing
          </button>

          {/* <button
            className="profile-nav-item"
            onClick={() => {
              if (window.openReferralsTab) {
                window.openReferralsTab();
              } else {
                window.dispatchEvent(new CustomEvent("openReferralsTab"));
              }
            }}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10" />
                <path d="M18 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 6-10 6-10 6 6.686 6 10Z" />
              </svg>
            </span>
            Referrals
          </button> */}

          {/* <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </span>
            Developer
          </button> */}
        </nav>
      </aside>

      {/* Main Content - Scrollable */}
      <div className="profile-content-wrapper">
        <div className="profile-content">
          {activeMenu === "profile" && (
            <>
              <ProfileCard />
              <SSOCard />
              {/* <TwoStepCard />
              <NotificationsCard /> */}
            </>
          )}
          {/* {activeMenu === "2step" && (
            <>
              <TwoStepCard />
            </>
          )}
          {activeMenu === "notifications" && <NotificationsCard />} */}
          {activeMenu === "account" && (
            <>
              <AccountCard />
              {/* <TeamCard />
              <SecurityCard />
              <DataRetentionCard />
              <AuthorizedAppsCard /> */}
            </>
          )}
          {/* {activeMenu === "integrations" && <IntegrationsCard />} */}
        </div>
      </div>
    </div>
  );
}

// ============ Profile Card ============
function ProfileCard() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+91",
    countryFlag: "🇮🇳",
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countries = [
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+86", flag: "🇨🇳", name: "China" },
    { code: "+55", flag: "🇧🇷", name: "Brazil" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+1", flag: "🇨🇦", name: "Canada" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("ev_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      } catch (e) {
        console.error("Failed to parse ev_profile", e);
      }
    } else {
      // Default from userEmail if available
      const userEmail = localStorage.getItem("userEmail") || "";
      setProfile((prev) => ({ ...prev, email: userEmail }));
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = () => {
    const newErrors = {};
    if (!profile.firstName.trim()) newErrors.firstName = "First name is required";
    if (!profile.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(profile.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: call saveProfileAPI()
      localStorage.setItem("ev_profile", JSON.stringify(profile));
      setSuccessMsg("Profile saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <Card title="Profile" id="profile-card-section">
      {successMsg && <div className="success-message">{successMsg}</div>}
      <div className="profile-form-grid">
        <div className="form-field">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            className={`profile-input ${errors.firstName ? "error" : ""}`}
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            className={`profile-input ${errors.lastName ? "error" : ""}`}
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`profile-input ${errors.email ? "error" : ""}`}
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <div className="phone-input-wrapper">
            <div className="country-selector" onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
              <span className="country-flag">{profile.countryFlag}</span>
              <span className="country-code">{profile.countryCode}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {showCountryDropdown && (
              <div className="country-dropdown">
                {countries.map((country) => (
                  <div
                    key={country.code + country.name}
                    className="country-option"
                    onClick={() => {
                      setProfile({ ...profile, countryCode: country.code, countryFlag: country.flag });
                      setShowCountryDropdown(false);
                    }}
                  >
                    <span className="country-flag">{country.flag}</span>
                    <span className="country-code">{country.code}</span>
                    <span className="country-name">{country.name}</span>
                  </div>
                ))}
              </div>
            )}
            <input
              id="phone"
              type="tel"
              className="profile-input phone-input"
              placeholder="081234 56789"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-primary" onClick={handleSave}>
          SAVE
        </button>
      </div>
    </Card>
  );
}

// ============ Single Sign-On Card ============
function SSOCard() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ev_sso_google_enabled");
    setEnabled(stored === "true");
  }, []);

  const handleToggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    // TODO: call disableGoogleSSOAPI() or enableGoogleSSOAPI()
    localStorage.setItem("ev_sso_google_enabled", String(newVal));
  };

  return (
    <Card title="Single Sign On" id="sso-card-section">
      <div className="sso-row">
        <div className="sso-left">
          <GoogleIcon />
          <div>
            <div className="sso-title">Google</div>
            <div className="sso-subtitle">
              {enabled
                ? "You currently are using your Google account to sign in."
                : "Connect your Google account to sign in."}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={handleToggle}>
          {enabled ? "DISABLE" : "ENABLE"}
        </button>
      </div>
    </Card>
  );
}

// ============ 2-Step Verification Card ============
// function TwoStepCard() {
//   return (
//     <Card title="2-Step Verification">
//       <TwoFactorRow
//         icon={<PhoneIcon />}
//         title="Mobile Phone"
//         subtitle="Verification codes are sent by text message."
//         storageKey="ev_2fa_sms_enabled"
//       />
//     </Card>
//   );
// }

// function TwoFactorRow({ icon, title, subtitle, storageKey }) {
//   const [enabled, setEnabled] = useState(false);

//   useEffect(() => {
//     const stored = localStorage.getItem(storageKey);
//     setEnabled(stored === "true");
//   }, [storageKey]);

//   const handleSetup = () => {
//     const newVal = !enabled;
//     setEnabled(newVal);
//     // TODO: call setup2FAAPI()
//     localStorage.setItem(storageKey, String(newVal));
//   };

//   return (
//     <div className="two-factor-row">
//       <div className="two-factor-left">
//         {icon}
//         <div>
//           <div className="two-factor-title">{title}</div>
//           <div className="two-factor-subtitle">{subtitle}</div>
//         </div>
//       </div>
//       <button className="btn-secondary" onClick={handleSetup}>
//         {enabled ? "DISABLE" : "SET UP"}
//       </button>
//     </div>
//   );
// }

// ============ Notifications Card ============
// function NotificationsCard() {
//   const [notify, setNotify] = useState({
//     accountUpdates: false,
//     bulkResults: false,
//     deliverability: false,
//     lowCredits: false,
//     lowCreditsNumber: 100,
//   });

//   useEffect(() => {
//     const stored = localStorage.getItem("ev_notify");
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         setNotify((prev) => ({ ...prev, ...parsed }));
//       } catch (e) {
//         console.error("Failed to parse ev_notify", e);
//       }
//     }
//   }, []);

//   const handleToggle = (key) => {
//     const updated = { ...notify, [key]: !notify[key] };
//     setNotify(updated);
//     // TODO: call updateNotificationPreferencesAPI()
//     localStorage.setItem("ev_notify", JSON.stringify(updated));
//   };

//   const handleCreditsChange = (val) => {
//     const num = parseInt(val, 10) || 0;
//     const updated = { ...notify, lowCreditsNumber: num };
//     setNotify(updated);
//     localStorage.setItem("ev_notify", JSON.stringify(updated));
//   };

//   return (
//     <Card title="Notifications">
//       <div className="notify-section">
//         <div className="notify-section-title">Account</div>
//         <NotifyRow
//           label="Account Updates"
//           helper="Receive updates about your account activity"
//           checked={notify.accountUpdates}
//           onChange={() => handleToggle("accountUpdates")}
//         />
//       </div>

//       <div className="notify-section">
//         <div className="notify-section-title">Bulk</div>
//         <NotifyRow
//           label="Bulk Verifier Results"
//           helper="Get notified when bulk verification completes"
//           checked={notify.bulkResults}
//           onChange={() => handleToggle("bulkResults")}
//         />
//       </div>

//       <div className="notify-section">
//         <div className="notify-section-title">Deliverability</div>
//         <NotifyRow
//           label="Deliverability Reports"
//           helper="Receive periodic deliverability insights"
//           checked={notify.deliverability}
//           onChange={() => handleToggle("deliverability")}
//         />
//         <div className="notify-row">
//           <div className="notify-row-left">
//             <div className="notify-label">Low Credits</div>
//             <div className="notify-helper">Alert me when credits fall below</div>
//           </div>
//           <div className="notify-row-right low-credits-row">
//             <Toggle
//               checked={notify.lowCredits}
//               onChange={() => handleToggle("lowCredits")}
//               id="lowCredits"
//             />
//             <input
//               type="number"
//               className="credits-input"
//               value={notify.lowCreditsNumber}
//               onChange={(e) => handleCreditsChange(e.target.value)}
//               disabled={!notify.lowCredits}
//             />
//             <span className="credits-label">CREDITS</span>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

// function NotifyRow({ label, helper, checked, onChange }) {
//   const id = `notify-${label.replace(/\s+/g, "-").toLowerCase()}`;
//   return (
//     <div className="notify-row">
//       <div className="notify-row-left">
//         <div className="notify-label">{label}</div>
//         <div className="notify-helper">{helper}</div>
//       </div>
//       <div className="notify-row-right">
//         <Toggle checked={checked} onChange={onChange} id={id} />
//       </div>
//     </div>
//   );
// }

// ============ New Integration Modal ============
// function NewIntegrationModal({ onClose }) {
//   const [selectedIntegration, setSelectedIntegration] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   // lock background scroll when open
//   useEffect(() => {
//     const originalOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = originalOverflow;
//     };
//   }, []);

//   const availableIntegrations = [
//     {
//       id: 1,
//       name: "Google Workspace",
//       description: "Connect with Gmail, Google Drive, and other Google services",
//       icon: "G",
//       category: "Email & Productivity"
//     },
//     {
//       id: 2,
//       name: "Slack",
//       description: "Send notifications and updates to your Slack channels",
//       icon: "S",
//       category: "Communication"
//     },
//     {
//       id: 3,
//       name: "Zapier",
//       description: "Automate workflows with 5000+ apps",
//       icon: "Z",
//       category: "Automation"
//     },
//     {
//       id: 4,
//       name: "HubSpot",
//       description: "Sync contacts and manage your CRM",
//       icon: "H",
//       category: "CRM"
//     },
//     {
//       id: 5,
//       name: "Mailchimp",
//       description: "Manage your email marketing campaigns",
//       icon: "M",
//       category: "Email Marketing"
//     },
//     {
//       id: 6,
//       name: "Salesforce",
//       description: "Integrate with your Salesforce CRM",
//       icon: "S",
//       category: "CRM"
//     }
//   ];

//   const filteredIntegrations = availableIntegrations.filter(integration =>
//     integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     integration.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleIntegrationSelect = (integration) => {
//     setSelectedIntegration(integration);
//   };

//   const handleConnect = () => {
//     if (selectedIntegration) {
//       // TODO: call connectIntegrationAPI(selectedIntegration.id)
//       console.log("Connecting to:", selectedIntegration.name);
//       onClose();
//     }
//   };

//   const modalEl = (
//     <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="modal-title">Connect New Integration</h2>
//           <button className="modal-close" onClick={onClose}>
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <line x1="18" y1="6" x2="6" y2="18"></line>
//               <line x1="6" y1="6" x2="18" y2="18"></line>
//             </svg>
//           </button>
//         </div>

//         <div className="modal-body">
//           <div className="search-section">
//             <div className="search-input-wrapper">
//               <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8"></circle>
//                 <path d="m21 21-4.35-4.35"></path>
//               </svg>
//               <input
//                 type="text"
//                 className="search-input"
//                 placeholder="Search integrations..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="integrations-grid">
//             {filteredIntegrations.map((integration) => (
//               <div
//                 key={integration.id}
//                 className={`integration-card ${selectedIntegration?.id === integration.id ? 'selected' : ''}`}
//                 onClick={() => handleIntegrationSelect(integration)}
//               >
//                 <div className="integration-card-icon">
//                   <div className="integration-card-icon-placeholder">
//                     {integration.icon}
//                   </div>
//                 </div>
//                 <div className="integration-card-content">
//                   <div className="integration-card-name">{integration.name}</div>
//                   <div className="integration-card-category">{integration.category}</div>
//                   <div className="integration-card-description">{integration.description}</div>
//                 </div>
//                 <div className="integration-card-check">
//                   {selectedIntegration?.id === integration.id && (
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <polyline points="20 6 9 17 4 12"></polyline>
//                     </svg>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {filteredIntegrations.length === 0 && (
//             <div className="no-results">
//               <div className="no-results-icon">🔍</div>
//               <div className="no-results-text">No integrations found</div>
//               <div className="no-results-subtext">Try searching with different keywords</div>
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button className="btn-ghost" onClick={onClose}>
//             Cancel
//           </button>
//           <button 
//             className="btn-primary" 
//             onClick={handleConnect}
//             disabled={!selectedIntegration}
//           >
//             Connect {selectedIntegration?.name || 'Integration'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return ReactDOM.createPortal(modalEl, document.body);
// }

// ============ Reusable Components ============
function Card({ title, children, id }) {
  return (
    <div className="profile-card" id={id}>
      <h2 className="card-title">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch" htmlFor={id}>
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}

// ============ Icons ============
function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#E8F4FF" />
      <rect x="13" y="10" width="14" height="20" rx="2" stroke="#4A90E2" strokeWidth="2" fill="none" />
      <line x1="16" y1="27" x2="24" y2="27" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#F0E8FF" />
      <rect x="11" y="11" width="7" height="7" fill="#7C3AED" rx="1" />
      <rect x="22" y="11" width="7" height="7" fill="#7C3AED" rx="1" />
      <rect x="11" y="22" width="7" height="7" fill="#7C3AED" rx="1" />
      <rect x="22" y="22" width="3" height="3" fill="#7C3AED" />
      <rect x="26" y="26" width="3" height="3" fill="#7C3AED" />
    </svg>
  );
}

// ============ Account Card ============
function AccountCard() {
  const [account, setAccount] = useState({
    companyName: "",
    taxIdType: "",
    taxId: "",
    currency: "USD",
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "IN",
    state: "",
    postalCode: "10001",
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ev_account");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccount(parsed);
      } catch (e) {
        console.error("Failed to parse ev_account", e);
      }
    }
  }, []);

  const handleSave = () => {
    const newErrors = {};
    if (!account.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!account.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!account.city.trim()) newErrors.city = "City is required";
    if (!account.state.trim()) newErrors.state = "State/Region is required";
    if (!account.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem("ev_account", JSON.stringify(account));
      setSuccessMsg("Account information saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <Card title="Account" id="account-section">
      {successMsg && <div className="success-message">{successMsg}</div>}
      
      {/* General Section */}
      <div className="account-section">
        <h3 className="section-title">General</h3>
        <div className="account-form-grid">
          <div className="form-field">
            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              type="text"
              className={`profile-input ${errors.companyName ? "error" : ""}`}
              placeholder="enter your company name"
              value={account.companyName}
              onChange={(e) => setAccount({ ...account, companyName: e.target.value })}
            />
            {errors.companyName && <span className="error-text">{errors.companyName}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="taxId">
              Tax ID
              <span className="help-icon" title="Help">?</span>
            </label>
            <div className="tax-id-wrapper">
              <select
                className="tax-type-select"
                value={account.taxIdType}
                onChange={(e) => setAccount({ ...account, taxIdType: e.target.value })}
              >
                <option value="">select a type</option>
                <option value="EIN">EIN</option>
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
              </select>
              <input
                id="taxId"
                type="text"
                className="profile-input tax-id-input"
                value={account.taxId}
                onChange={(e) => setAccount({ ...account, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="currency">Currency</label>
            <div className="currency-wrapper">
              <span className="country-flag">🇺🇸</span>
              <select
                id="currency"
                className="profile-input currency-select"
                value={account.currency}
                onChange={(e) => setAccount({ ...account, currency: e.target.value })}
              >
                <option value="USD">United States Dollar</option>
                <option value="EUR">Euro</option>
                <option value="GBP">British Pound</option>
                <option value="INR">Indian Rupee</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information Section */}
      <div className="account-section">
        <h3 className="section-title">Billing Information</h3>
        <div className="account-form-grid">
          <div className="form-field full-width">
            <label htmlFor="addressLine1">Address Line 1</label>
            <input
              id="addressLine1"
              type="text"
              className={`profile-input ${errors.addressLine1 ? "error" : ""}`}
              placeholder="enter your address"
              value={account.addressLine1}
              onChange={(e) => setAccount({ ...account, addressLine1: e.target.value })}
            />
            {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
          </div>

          <div className="form-field full-width">
            <label htmlFor="addressLine2">Address Line 2</label>
            <input
              id="addressLine2"
              type="text"
              className="profile-input"
              placeholder="apt, suite, building (optional)"
              value={account.addressLine2}
              onChange={(e) => setAccount({ ...account, addressLine2: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              className={`profile-input ${errors.city ? "error" : ""}`}
              placeholder="enter your city"
              value={account.city}
              onChange={(e) => setAccount({ ...account, city: e.target.value })}
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="country">Country</label>
            <div className="country-wrapper">
              <span className="country-flag">🇮🇳</span>
              <select
                id="country"
                className="profile-input country-select"
                value={account.country}
                onChange={(e) => setAccount({ ...account, country: e.target.value })}
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="state">State / Region</label>
            <input
              id="state"
              type="text"
              className={`profile-input ${errors.state ? "error" : ""}`}
              placeholder="enter your state or region"
              value={account.state}
              onChange={(e) => setAccount({ ...account, state: e.target.value })}
            />
            {errors.state && <span className="error-text">{errors.state}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="postalCode">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              className={`profile-input ${errors.postalCode ? "error" : ""}`}
              value={account.postalCode}
              onChange={(e) => setAccount({ ...account, postalCode: e.target.value })}
            />
            {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-primary" onClick={handleSave}>
          SAVE
        </button>
      </div>
    </Card>
  );
}

// ============ Team Card ============
// function TeamCard() {
//   // Follow Dashboard.jsx pattern - get user data directly from localStorage
//   const userEmail = localStorage.getItem("userEmail") || "user@example.com";
//   const displayName = (localStorage.getItem("name_email") === userEmail && localStorage.getItem("name")) || null;
//   const userInitial = userEmail.charAt(0).toUpperCase();
  
//   // Parse name from displayName or email
//   const firstName = displayName?.split(' ')[0] || userEmail.split('@')[0];
//   const lastName = displayName?.split(' ').slice(1).join(' ') || '';
  
//   const userProfile = {
//     firstName,
//     lastName,
//     email: userEmail,
//     phone: '', // Could be stored in localStorage if needed
//     role: 'Account Owner',
//     status: 'Active',
//     twoFactor: false,
//     lastActive: 'Now',
//     joinDate: new Date().toLocaleDateString()
//   };

//   const handleSaveChanges = async () => {
//     try {
//       await updateUserProfile(userProfile);
//       alert('Profile updated successfully!');
//     } catch (err) {
//       console.error('Error updating profile:', err);
//       alert('Failed to update profile. Please try again.');
//     }
//   };

//   return (
//     <Card title="Team" id="team-section">
//       <div className="team-header">
//         <button className="btn-primary">INVITE</button>
//       </div>

//         <div className="team-table">
//         <div className="team-table-header three-cols">
//           <div>Name</div>
//           <div>Role</div>
//           <div>2FA</div>
//         </div>

//         <div className="team-row three-cols">
//           <div className="team-member">
//             <div className="profile-avatar-large">
//               {userProfile.firstName.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
//             </div>
//             <div className="profile-info">
//               <h4>{`${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email.split('@')[0]}</h4>
//               <p className="profile-email">{userProfile.email}</p>
//             </div>
//           </div>

//           <div className="team-role">
//             <span className="role-badge">OWNER</span>
//           </div>
//           <div className="team-2fa">
//             <span className="status-badge disabled">DISABLED</span>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

// ============ Security Card ============
// function SecurityCard() {
//   const [ssoEnabled, setSsoEnabled] = useState(false);
//   const [ssoDomains, setSsoDomains] = useState("");

//   useEffect(() => {
//     const stored = localStorage.getItem("ev_sso_enabled");
//     const domains = localStorage.getItem("ev_sso_domains");
//     setSsoEnabled(stored === "true");
//     setSsoDomains(domains || "");
//   }, []);

//   const handleSsoToggle = () => {
//     const newVal = !ssoEnabled;
//     setSsoEnabled(newVal);
//     localStorage.setItem("ev_sso_enabled", String(newVal));
//   };

//   const handleSaveSso = () => {
//     localStorage.setItem("ev_sso_domains", ssoDomains);
//     alert("SSO settings saved!");
//   };

//   return (
//     <Card title="Security" id="security-section">
//       <div className="security-section">
//         <div className="security-row">
//           <div className="security-left">
//             <div className="security-title">Single Sign-On (SSO)</div>
//             <div className="security-description">
//               Enable SSO for your organization to manage user access centrally
//             </div>
//           </div>
//           <div className="security-right">
//             <Toggle
//               checked={ssoEnabled}
//               onChange={handleSsoToggle}
//               id="sso-toggle"
//             />
//           </div>
//         </div>

//         {ssoEnabled && (
//           <div className="security-row">
//             <div className="security-left">
//               <div className="security-title">SSO Domains</div>
//               <div className="security-description">
//                 Enter the domains that should use SSO (comma-separated)
//               </div>
//             </div>
//             <div className="security-right">
//               <input
//                 type="text"
//                 className="sso-domains-input"
//                 placeholder="example.com, company.org"
//                 value={ssoDomains}
//                 onChange={(e) => setSsoDomains(e.target.value)}
//               />
//               <button className="btn-primary" onClick={handleSaveSso}>
//                 Save SSO Settings
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// }

// ============ Data Retention Card ============
// function DataRetentionCard() {
//   const [retentionPeriod, setRetentionPeriod] = useState("90");

//   useEffect(() => {
//     const stored = localStorage.getItem("ev_data_retention");
//     if (stored) {
//       setRetentionPeriod(stored);
//     }
//   }, []);

//   const handleSave = () => {
//     localStorage.setItem("ev_data_retention", retentionPeriod);
//     alert("Data retention settings saved!");
//   };

//   return (
//     <Card title="Data Retention" id="data-retention-section">
//       <div className="retention-description">
//         <p>Configure how long we keep your verification data and results.</p>
//       </div>

//       <div className="retention-section">
//         <div className="retention-row">
//           <div className="retention-left">
//             <div className="retention-title">Data Retention Period</div>
//             <div className="retention-description">
//               Choose how long to keep your verification data
//             </div>
//           </div>
//           <div className="retention-right">
//             <select
//               className="retention-select"
//               value={retentionPeriod}
//               onChange={(e) => setRetentionPeriod(e.target.value)}
//             >
//               <option value="30">30 days</option>
//               <option value="90">90 days</option>
//               <option value="180">180 days</option>
//               <option value="365">1 year</option>
//               <option value="0">Forever</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="card-actions">
//         <button className="btn-primary" onClick={handleSave}>
//           SAVE
//         </button>
//       </div>
//     </Card>
//   );
// }

// ============ Authorized Apps Card ============
// function AuthorizedAppsCard() {
//   const [authorizedApps] = useState([
//     {
//       id: 1,
//       name: "Gmail Integration",
//       description: "Email verification via Gmail API",
//       icon: "G",
//       lastUsed: "2 hours ago",
//       permissions: ["Read emails", "Send verification requests"],
//       status: "Active"
//     },
//     {
//       id: 2,
//       name: "Slack Bot",
//       description: "Send verification results to Slack",
//       icon: "S",
//       lastUsed: "1 day ago",
//       permissions: ["Send messages", "Read channels"],
//       status: "Active"
//     }
//   ]);

//   const handleRevoke = (appId) => {
//     if (confirm("Are you sure you want to revoke access for this app?")) {
//       // TODO: Call revoke API
//       console.log("Revoking app:", appId);
//     }
//   };

//   return (
//     <Card title="Authorized Apps" id="authorized-apps-section">
//       <div className="authorized-apps-description">
//         <p>Manage applications that have access to your account.</p>
//       </div>

//       {authorizedApps.length > 0 ? (
//         <div className="authorized-apps-list">
//           {authorizedApps.map((app) => (
//             <div key={app.id} className="authorized-app-item">
//               <div className="app-info">
//                 <div className="app-icon">
//                   <div className="app-icon-placeholder">{app.icon}</div>
//                 </div>
//                 <div className="app-details">
//                   <div className="app-name">{app.name}</div>
//                   <div className="app-description">{app.description}</div>
//                   <div className="app-last-used">Last used: {app.lastUsed}</div>
//                   <div className="app-permissions">
//                     {app.permissions.map((permission, index) => (
//                       <span key={index} className="permission-tag">
//                         {permission}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="app-actions">
//                 <div className="app-status">
//                   <span className="status-badge active">{app.status}</span>
//                 </div>
//                 <button 
//                   className="revoke-btn"
//                   onClick={() => handleRevoke(app.id)}
//                 >
//                   Revoke Access
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="no-apps-message">
//           <div className="no-apps-icon">🔒</div>
//           <div className="no-apps-text">No authorized applications</div>
//           <div className="no-apps-subtext">Apps that you authorize will appear here</div>
//         </div>
//       )}
//     </Card>
//   );
// }

// ============ Integrations Card ============
// function IntegrationsCard() {
//   const [integrations] = useState([]); // Empty array to show empty state

//   const [showNewModal, setShowNewModal] = useState(false);

//   const handleDisconnect = (integrationId) => {
//     if (confirm("Are you sure you want to disconnect this integration?")) {
//       // TODO: Call disconnect API
//       console.log("Disconnecting integration:", integrationId);
//     }
//   };

//   return (
//     <>
//       <Card>
//         <div className="integrations-header">
//           <h3 className="integrations-title">Integrations</h3>
//           <button 
//             className="integrations-new-btn"
//             onClick={() => setShowNewModal(true)}
//           >
//             NEW
//           </button>
//         </div>

//         <div className="integrations-table">
//           <div className="integrations-table-header">
//             <div className="table-header-name">Name</div>
//             <div className="table-header-account">Account Name</div>
//             <div className="table-header-connected">Connected On</div>
//           </div>
          
//           {integrations.length > 0 ? (
//             integrations.map((integration) => (
//               <div key={integration.id} className="integrations-row">
//                 <div className="integration-info">
//                   <div className="integration-icon">
//                     <div className="integration-icon-placeholder">
//                       {integration.name.charAt(0)}
//                     </div>
//                   </div>
//                   <div className="integration-details">
//                     <div className="integration-name">{integration.name}</div>
//                     <div className="integration-type">{integration.type}</div>
//                   </div>
//                 </div>
//                 <div className="integration-account">{integration.account}</div>
//                 <div className="integration-date">{integration.connectedDate}</div>
//               </div>
//             ))
//           ) : (
//             <div className="integrations-empty-state">
//               <div className="empty-state-text">There are no integrations to display.</div>
//             </div>
//           )}
//         </div>
//       </Card>

//       {showNewModal && (
//         <NewIntegrationModal onClose={() => setShowNewModal(false)} />
//       )}
//       )}
//     </>
//   );
// }