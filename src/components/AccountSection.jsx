import React, { useState, useEffect } from "react";
import "./ProfileSection.css";

export default function AccountSection() {
  const [activeMenu, setActiveMenu] = useState("account");
  const [accountOpen, setAccountOpen] = useState(true);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="profile-layout">
      {/* Left Sidebar */}
      <aside className="profile-sidebar">
        <nav className="profile-nav">
          <button 
            className="profile-nav-item"
            onClick={() => window.dispatchEvent(new CustomEvent("openProfileTab"))}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </span>
            Profile
          </button>

          <button
            onClick={() => {
              setAccountOpen((o) => !o);
              setActiveMenu("account");
              scrollToSection("account-section");
            }}
            className={`profile-nav-item profile-nav-parent ${activeMenu === "account" || activeMenu === "team" || activeMenu === "security" || activeMenu === "data" || activeMenu === "authorized" ? "active" : ""}`}
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
                  setActiveMenu("account");
                  scrollToSection("account-section");
                }}
                className={`profile-subnav-item ${activeMenu === "account" ? "active" : ""}`}
              >
                Account
              </button>
              <button
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
              </button>
            </div>
          )}

          {/* <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M7 8h10M7 12h6" />
              </svg>
            </span>
            Integrations
          </button> */}

          <button 
            className="profile-nav-item"
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

          {/* <button className="profile-nav-item">
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
          <AccountCard />
          <TeamCard />
          <SecurityCard />
          <DataRetentionCard />
          <AuthorizedAppsCard />
        </div>
      </div>
    </div>
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
function TeamCard() {
  const [teamMembers] = useState([
    {
      id: 1,
      name: "Zeel Patel",
      email: "zeel7158@gmail.com",
      role: "OWNER",
      twoFA: false,
      avatar: "Z"
    }
  ]);

  return (
    <Card title="Team" id="team-section">
      <div className="team-header">
        <button className="btn-primary">INVITE</button>
      </div>
      
      <div className="team-table">
        <div className="team-table-header">
          <div className="team-col">Name</div>
          <div className="team-col">Role</div>
          <div className="team-col">2FA</div>
        </div>
        
        {teamMembers.map((member) => (
          <div key={member.id} className="team-row">
            <div className="team-member">
              <div className="member-avatar">{member.avatar}</div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-email">{member.email}</div>
              </div>
            </div>
            <div className="team-role">
              <span className={`role-badge ${member.role.toLowerCase()}`}>
                {member.role}
              </span>
            </div>
            <div className="team-2fa">
              <span className={`status-badge ${member.twoFA ? 'enabled' : 'disabled'}`}>
                {member.twoFA ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============ Security Card ============
function SecurityCard() {
  const [security, setSecurity] = useState({
    require2FA: false,
    requireSSO: false,
    ssoDomains: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("ev_security");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSecurity(parsed);
      } catch (e) {
        console.error("Failed to parse ev_security", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("ev_security", JSON.stringify(security));
    // TODO: call updateSecurityAPI()
  };

  const handleToggle = (key) => {
    setSecurity({ ...security, [key]: !security[key] });
  };

  return (
    <Card title="Security" id="security-section">
      <div className="security-section">
        <div className="security-row">
          <div className="security-left">
            <div className="security-title">Require 2-Step Verification</div>
            <div className="security-description">
              All users, including you, will immediately be required to configure 2-Step Verification before being able to access this account.
            </div>
          </div>
          <div className="security-right">
            <Toggle
              checked={security.require2FA}
              onChange={() => handleToggle("require2FA")}
              id="require2FA"
            />
          </div>
        </div>

        <div className="security-row">
          <div className="security-left">
            <div className="security-title">Require Single Sign-On (SSO)</div>
            <div className="security-description">
              All users, including you, will immediately be required to sign in using your organization's SSO provider before being able to access this account.
            </div>
          </div>
          <div className="security-right">
            <Toggle
              checked={security.requireSSO}
              onChange={() => handleToggle("requireSSO")}
              id="requireSSO"
            />
          </div>
        </div>

        <div className="security-row">
          <div className="security-left">
            <div className="security-title">Approved SSO Domains</div>
            <div className="security-description">
              Only users with an email address from the following domains will be able to sign in using your organization's SSO provider.
            </div>
          </div>
          <div className="security-right">
            <input
              type="text"
              className="profile-input sso-domains-input"
              placeholder="example.com, example.org"
              value={security.ssoDomains}
              onChange={(e) => setSecurity({ ...security, ssoDomains: e.target.value })}
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

// ============ Data Retention Card ============
function DataRetentionCard() {
  const [retention, setRetention] = useState({
    apiSingle: "7",
    apiBatch: "30"
  });

  useEffect(() => {
    const stored = localStorage.getItem("ev_retention");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRetention(parsed);
      } catch (e) {
        console.error("Failed to parse ev_retention", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("ev_retention", JSON.stringify(retention));
    // TODO: call updateRetentionAPI()
  };

  return (
    <Card title="Data Retention" id="data-retention-section">
      <div className="retention-description">
        Your account's data will automatically be deleted from Emailable after the amount of time specified. Changes will not impact existing data. Existing data will be deleted according to the configuration at the time the data was added.
      </div>

      <div className="retention-section">
        <div className="retention-row">
          <div className="retention-left">
            <div className="retention-title">
              API Single Verification
              <span className="help-icon" title="Help">?</span>
            </div>
          </div>
          <div className="retention-right">
            <select
              className="profile-input retention-select"
              value={retention.apiSingle}
              onChange={(e) => setRetention({ ...retention, apiSingle: e.target.value })}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        <div className="retention-row">
          <div className="retention-left">
            <div className="retention-title">
              API Batch Verification
              <span className="help-icon" title="Help">?</span>
            </div>
          </div>
          <div className="retention-right">
            <select
              className="profile-input retention-select"
              value={retention.apiBatch}
              onChange={(e) => setRetention({ ...retention, apiBatch: e.target.value })}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
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

// ============ Authorized Apps Card ============
function AuthorizedAppsCard() {
  const [authorizedApps] = useState([
    {
      id: 1,
      name: "Google Workspace",
      description: "Email verification integration",
      lastUsed: "2 days ago",
      permissions: ["Read emails", "Send verification requests"],
      status: "active"
    },
    {
      id: 2,
      name: "Slack",
      description: "Team notifications",
      lastUsed: "1 week ago",
      permissions: ["Send notifications"],
      status: "active"
    }
  ]);

  const handleRevoke = (appId) => {
    // TODO: call revokeAppAPI(appId)
    console.log("Revoking app:", appId);
  };

  return (
    <Card title="Authorized Apps" id="authorized-apps-section">
      <div className="authorized-apps-description">
        Manage applications that have access to your account. You can revoke access for any app at any time.
      </div>

      <div className="authorized-apps-list">
        {authorizedApps.map((app) => (
          <div key={app.id} className="authorized-app-item">
            <div className="app-info">
              <div className="app-icon">
                <div className="app-icon-placeholder">
                  {app.name.charAt(0)}
                </div>
              </div>
              <div className="app-details">
                <div className="app-name">{app.name}</div>
                <div className="app-description">{app.description}</div>
                <div className="app-last-used">Last used: {app.lastUsed}</div>
                <div className="app-permissions">
                  {app.permissions.map((permission, index) => (
                    <span key={index} className="permission-tag">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="app-actions">
              <span className={`app-status ${app.status}`}>
                {app.status.toUpperCase()}
              </span>
              <button 
                className="btn-ghost revoke-btn"
                onClick={() => handleRevoke(app.id)}
              >
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      {authorizedApps.length === 0 && (
        <div className="no-apps-message">
          <div className="no-apps-icon">🔒</div>
          <div className="no-apps-text">No authorized applications</div>
          <div className="no-apps-subtext">When you connect apps to your account, they will appear here.</div>
        </div>
      )}
    </Card>
  );
}

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
