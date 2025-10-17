import React, { useState, useEffect, useRef } from "react";
import "./ProfileSection.css";

export default function ProfileSection() {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [profileOpen, setProfileOpen] = useState(true);

  return (
    <div className="profile-layout">
      {/* Left Sidebar */}
      <aside className="profile-sidebar">
        <nav className="profile-nav">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className={`profile-nav-item profile-nav-parent ${activeMenu === "profile" || activeMenu === "2step" || activeMenu === "notifications" ? "active" : ""}`}
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
                onClick={() => setActiveMenu("profile")}
                className={`profile-subnav-item ${activeMenu === "profile" ? "active" : ""}`}
              >
                Profile
              </button>
              <button
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
              </button>
            </div>
          )}

          <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </span>
            Account
          </button>

          <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M7 8h10M7 12h6" />
              </svg>
            </span>
            Integrations
          </button>

          <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M3 11h18M8 3v4M16 3v4" />
              </svg>
            </span>
            Billing
          </button>

          <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10" />
                <path d="M18 14c0 3.314-2.686 6-6 6s-6-2.686-6-6 6-10 6-10 6 6.686 6 10Z" />
              </svg>
            </span>
            Referrals
          </button>

          <button className="profile-nav-item">
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </span>
            Developer
          </button>
        </nav>
      </aside>

      {/* Main Content - Scrollable */}
      <div className="profile-content-wrapper">
        <div className="profile-content">
          {activeMenu === "profile" && (
            <>
              <ProfileCard />
              <SSOCard />
              <TwoStepCard />
              <NotificationsCard />
            </>
          )}
          {activeMenu === "2step" && (
            <>
              <TwoStepCard />
            </>
          )}
          {activeMenu === "notifications" && <NotificationsCard />}
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
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

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
    <Card title="Profile">
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
            <span className="country-flag" title="Country">🇮🇳</span>
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
    <Card title="Single Sign On">
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
function TwoStepCard() {
  return (
    <Card title="2-Step Verification">
      <TwoFactorRow
        icon={<PhoneIcon />}
        title="Mobile Phone"
        subtitle="Verification codes are sent by text message."
        storageKey="ev_2fa_sms_enabled"
      />
    </Card>
  );
}

function TwoFactorRow({ icon, title, subtitle, storageKey }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setEnabled(stored === "true");
  }, [storageKey]);

  const handleSetup = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    // TODO: call setup2FAAPI()
    localStorage.setItem(storageKey, String(newVal));
  };

  return (
    <div className="two-factor-row">
      <div className="two-factor-left">
        {icon}
        <div>
          <div className="two-factor-title">{title}</div>
          <div className="two-factor-subtitle">{subtitle}</div>
        </div>
      </div>
      <button className="btn-secondary" onClick={handleSetup}>
        {enabled ? "DISABLE" : "SET UP"}
      </button>
    </div>
  );
}

// ============ Notifications Card ============
function NotificationsCard() {
  const [notify, setNotify] = useState({
    accountUpdates: false,
    bulkResults: false,
    deliverability: false,
    lowCredits: false,
    lowCreditsNumber: 100,
  });

  useEffect(() => {
    const stored = localStorage.getItem("ev_notify");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotify((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse ev_notify", e);
      }
    }
  }, []);

  const handleToggle = (key) => {
    const updated = { ...notify, [key]: !notify[key] };
    setNotify(updated);
    // TODO: call updateNotificationPreferencesAPI()
    localStorage.setItem("ev_notify", JSON.stringify(updated));
  };

  const handleCreditsChange = (val) => {
    const num = parseInt(val, 10) || 0;
    const updated = { ...notify, lowCreditsNumber: num };
    setNotify(updated);
    localStorage.setItem("ev_notify", JSON.stringify(updated));
  };

  return (
    <Card title="Notifications">
      <div className="notify-section">
        <div className="notify-section-title">Account</div>
        <NotifyRow
          label="Account Updates"
          helper="Receive updates about your account activity"
          checked={notify.accountUpdates}
          onChange={() => handleToggle("accountUpdates")}
        />
      </div>

      <div className="notify-section">
        <div className="notify-section-title">Bulk</div>
        <NotifyRow
          label="Bulk Verifier Results"
          helper="Get notified when bulk verification completes"
          checked={notify.bulkResults}
          onChange={() => handleToggle("bulkResults")}
        />
      </div>

      <div className="notify-section">
        <div className="notify-section-title">Deliverability</div>
        <NotifyRow
          label="Deliverability Reports"
          helper="Receive periodic deliverability insights"
          checked={notify.deliverability}
          onChange={() => handleToggle("deliverability")}
        />
        <div className="notify-row">
          <div className="notify-row-left">
            <div className="notify-label">Low Credits</div>
            <div className="notify-helper">Alert me when credits fall below</div>
          </div>
          <div className="notify-row-right low-credits-row">
            <Toggle
              checked={notify.lowCredits}
              onChange={() => handleToggle("lowCredits")}
              id="lowCredits"
            />
            <input
              type="number"
              className="credits-input"
              value={notify.lowCreditsNumber}
              onChange={(e) => handleCreditsChange(e.target.value)}
              disabled={!notify.lowCredits}
            />
            <span className="credits-label">CREDITS</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function NotifyRow({ label, helper, checked, onChange }) {
  const id = `notify-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="notify-row">
      <div className="notify-row-left">
        <div className="notify-label">{label}</div>
        <div className="notify-helper">{helper}</div>
      </div>
      <div className="notify-row-right">
        <Toggle checked={checked} onChange={onChange} id={id} />
      </div>
    </div>
  );
}

// ============ Reusable Components ============
function Card({ title, children }) {
  return (
    <div className="profile-card">
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