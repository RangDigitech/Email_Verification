import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import "./App.css";
import AnimatedEmailDemo from "./AnimatedEmailDemo";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Pricing from "./Pricing";
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from './auth';
import ProtectedRoute from './ProtectedRoute'; // Import the new component

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const location = useLocation();
  const hideNavbarAndFooter =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/dashboard";

  return (
    <div className="app">
      {!hideNavbarAndFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* PROTECTED ROUTE FOR DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* You can add other protected routes here */}
        </Route>

        <Route path="/pricing" element={<Pricing />} />
      </Routes>

      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
}

function Navbar() {
  const user = getUser();

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src="/src/assets/email_logo.png" alt="Verifier Logo" className="logo" />
        <span>Buzz</span>
      </div>
      <ul className="nav-links">
        <li>Products</li>
        <li><Link to="/pricing">Pricing</Link></li>
        <li>Integrations</li>
        <li>Developers</li>
      </ul>
      <div className="nav-actions">
        {!user ? (
          <>
            <Link to="/login">
              <button className="login-btn">Login</button>
            </Link>
            <Link to="/signup">
              <button className="signup-btn">Sign Up Free</button>
            </Link>
          </>
        ) : (
          <>
            <button className="signup-btn">BUY CREDITS</button>
            <div className="user-avatar" title={user.email}>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>The Ultimate Email Verification</h1>
          <p>
            Ensure your emails reach the inbox. Our real-time verification cleans
            your lists, reduces bounces, and protects your sender reputation.
          </p>
          <AnimatedEmailDemo />
        </div>
      </section>

      {/* Bulk Verification */}
      <section className="section bulk-section">
        <div className="section-inner">
          <div className="bulk-left">
            <h2>Validate Emails in Bulk</h2>
            <p className="muted">
              Improve email deliverability and start maintaining a healthier
              mailing list with just a few clicks.
            </p>

            <ul className="bullets">
              <li>
                <strong>Improve email deliverability</strong> by up to 99%.
              </li>
              <li>
                <strong>Reduce bounces</strong> by removing invalid and risky
                emails.
              </li>
              <li>
                <strong>Customize exports</strong> and view comprehensive
                reports.
              </li>
            </ul>

            <div style={{ marginTop: 18 }}>
              <button className="primary-cta">Get Started Free</button>
            </div>
          </div>

          <div className="bulk-right">
            {(() => {
              // values mirror the right-hand legend
              const deliverable = 58.5;
              const undeliverable = 11.2;
              const risky = 21.1;
              const unknown = 6.2;
              const duplicate = 3.0;

              const total = deliverable + undeliverable + risky + unknown + duplicate;
              const d = (deliverable / total) * 360;
              const u = (undeliverable / total) * 360;
              const r = (risky / total) * 360;
              const un = (unknown / total) * 360;
              const dp = (duplicate / total) * 360;

              const gradient = `conic-gradient(
                var(--buzz-orange) 0deg ${d}deg,
                #999 ${d}deg ${d + u}deg,
                #f4a261 ${d + u}deg ${d + u + r}deg,
                #ccc ${d + u + r}deg ${d + u + r + un}deg,
                #c1b3ff ${d + u + r + un}deg ${d + u + r + un + dp}deg
              )`;

              return (
                <div className="donut-card">
                  <div className="donut-wrap" aria-hidden>
                    <div className="donut multi" style={{ background: gradient }}>
                      <div className="donut-center">
                        <div className="donut-percent">{deliverable}%</div>
                        <div className="donut-label">Deliverable</div>
                      </div>
                    </div>

                    <div className="donut-legend modern">
                      <div className="legend-row anim-slide-in" style={{ animationDelay: '40ms' }}>
                        <span className="legend-badge badge-deliverable anim-pulse-once">{deliverable}%</span>
                        <span className="legend-text">Deliverable</span>
                        <span className="legend-count">3,802</span>
                      </div>
                      <div className="legend-row anim-slide-in" style={{ animationDelay: '90ms' }}>
                        <span className="legend-badge badge-undeliverable anim-pulse-once">{undeliverable}%</span>
                        <span className="legend-text">Undeliverable</span>
                        <span className="legend-count">728</span>
                      </div>
                      <div className="legend-row anim-slide-in" style={{ animationDelay: '140ms' }}>
                        <span className="legend-badge badge-risky anim-pulse-once">{risky}%</span>
                        <span className="legend-text">Risky</span>
                        <span className="legend-count">1,372</span>
                      </div>
                      <div className="legend-row anim-slide-in" style={{ animationDelay: '190ms' }}>
                        <span className="legend-badge badge-unknown anim-pulse-once">{unknown}%</span>
                        <span className="legend-text">Unknown</span>
                        <span className="legend-count">403</span>
                      </div>
                      <div className="legend-row anim-slide-in" style={{ animationDelay: '240ms' }}>
                        <span className="legend-badge badge-duplicate anim-pulse-once">{duplicate}%</span>
                        <span className="legend-text">Duplicate</span>
                        <span className="legend-count">195</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Inbox Placements & Insights */}
      <section className="section insights-section">
        <div className="section-inner insights-grid">
          <div className="insights-media" aria-hidden>
            <div className="insights-visual">
              <img src="/src/eMAIL.png" alt="Inbox Placements Visual" className="insights-image" />
            </div>
          </div>

          <div>
            <br />
            <br />
            <h2>Inbox Placements and Insights</h2>
            <p className="muted">
              Monitor key metrics affecting your inbox placement, and learn how to improve email deliverability.
            </p>

            <ul className="bullets">
              <li><strong>Comprehensive inbox placement metrics</strong> and blacklist monitoring.</li>
              <li><strong>Identify DMARC, SPF, and DKIM</strong> authentication errors.</li>
              <li><strong>View which ESPs</strong> your emails are delivering to, and which emails are landing in spam.</li>
            </ul>

            <div style={{ marginTop: 18 }}>
              <button className="primary-cta">Get Started Free</button>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="section guarantees-section">
        <div className="section-inner">
          <h2 style={{ textAlign: "center" }}>Our Guarantees</h2>
          <p className="muted" style={{ textAlign: "center", marginTop: 6 }}>
            We are committed to providing the <strong>fastest</strong> and <strong>most accurate</strong> email verification tool.
          </p>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-number">99%</div>
              <div className="metric-title">Deliverability Guarantee</div>
              <div className="metric-desc">
                We guarantee that no more than 1% of emails verified as Deliverable will bounce upon sending.
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">✉️</div>
              <div className="metric-number">30k+</div>
              <div className="metric-title">Emails Verified per Minute</div>
              <div className="metric-desc">
                We verify emails over 8x faster than the competition, verifying 100,000 emails in under 3 minutes.
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-number">99.99%</div>
              <div className="metric-title">Platform Uptime</div>
              <div className="metric-desc">
                Our secure and robust global infrastructure provides exceptional performance to customers around the world.
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-number">24/7</div>
              <div className="metric-title">Customer Support</div>
              <div className="metric-desc">
                Our team of experts are located around the globe and are available 24 hours a day.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="section highlights-section">
        <div className="section-inner">
          <h2>Platform Highlights</h2>
          <p className="muted">
            Improve email deliverability by <strong>detecting errors, reducing risk,</strong> and <strong>enriching your data</strong> with scalable solutions.
          </p>

          {/* Data Enrichment */}
          <div className="subgroup">
            <h3>Data Enrichment</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📡</div>
                <div className="feature-title">SMTP Provider Details</div>
                <div className="feature-desc">Enriches email addresses with their SMTP Provider (ex: Google, Microsoft, Yahoo).</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">@</div>
                <div className="feature-title">Misspelled Domains</div>
                <div className="feature-desc">Enriches email addresses that have common typos in the domain with potential corrections.</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛰️</div>
                <div className="feature-title">MX Record Detection</div>
                <div className="feature-desc">Enriches email addresses with their MX record.</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <div className="feature-title">Name Detection</div>
                <div className="feature-desc">Enriches email addresses with a first and last name.</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚧</div>
                <div className="feature-title">Gender Detection</div>
                <div className="feature-desc">Enriches email addresses with the gender based on the determined name.</div>
              </div>
            </div>
          </div>

          {/* Validation & Reduce Risk */}
          <div className="subgroup">
            <h3>Validation and Verification</h3>
            <div className="features-grid three-cols">
              <div className="feature-card">
                <div className="feature-icon">📬</div>
                <div className="feature-title">SMTP Verification</div>
                <div className="feature-desc">Ensure the deliverability of an email address by connecting to the mail server.</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">(*)</div>
                <div className="feature-title">Syntax Validation</div>
                <div className="feature-desc">Ensure the email address has the proper characteristics of a legitimate email address.</div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <div className="feature-title">Domain Validation</div>
                <div className="feature-desc">Ensure that the domain hosting the email address exists and is working properly.</div>
              </div>
            </div>
          </div>

          <div className="subgroup">
            <h3>Reduce Risk</h3>
            <div className="features-grid risk-grid">
              <div className="feature-card small">
                <div className="feature-icon">🗑️</div>
                <div className="feature-title">Disposable Detection</div>
                <div className="feature-desc">Identify if an email address is provided by a disposable email service.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">✅</div>
                <div className="feature-title">Accept-All Detection</div>
                <div className="feature-desc">Identify if an email address belongs to an Accept-All mail server, which can still cause bounces.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">🆓</div>
                <div className="feature-title">Free Detection</div>
                <div className="feature-desc">Identify if an email address is provided by a free email address service.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">👥</div>
                <div className="feature-title">Role Detection</div>
                <div className="feature-desc">Identify role-based email addresses that do not belong to a person, but rather a group.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">🏷️</div>
                <div className="feature-title">Tag Detection</div>
                <div className="feature-desc">Identify email addresses with an added tag.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">📥</div>
                <div className="feature-title">Mailbox Full Detection</div>
                <div className="feature-desc">Identify email addresses that currently have a full mailbox.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">🚫</div>
                <div className="feature-title">No Reply Detection</div>
                <div className="feature-desc">Identify email addresses that should not be replied to.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">Aa</div>
                <div className="feature-title">Character Detection</div>
                <div className="feature-desc">Identify email addresses with irregular character patterns.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">☺️</div>
                <div className="feature-title">Symbol Detection</div>
                <div className="feature-desc">Identify email addresses with uncommon Unicode symbols that may reduce deliverability.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">🔐</div>
                <div className="feature-title">Secure Email Gateway Detection</div>
                <div className="feature-desc">Identify email addresses that use SEG such as Proofpoint, Mimecast, or Barracuda.</div>
              </div>

              <div className="feature-card small">
                <div className="feature-icon">🏅</div>
                <div className="feature-title">Email Quality Score</div>
                <div className="feature-desc">Every email address on your list will get a quality score from 0 to 100.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scalable Solutions (without API block) */}
      <section className="section scalable-section">
        <div className="section-inner">
          <h3>Scalable Solutions</h3>
          <div className="features-grid scalable-grid">
            <div className="feature-card">
              <div className="feature-icon">♾️</div>
              <div className="feature-title">Unlimited API Keys</div>
              <div className="feature-desc">Create private or public API keys and set them to Live or Test mode.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔌</div>
              <div className="feature-title">Integration Options</div>
              <div className="feature-desc">Verify emails from 50+ apps including ActiveCampaign, Brevo, HubSpot, Mailchimp, Salesforce and many more.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📤</div>
              <div className="feature-title">Customized Exports</div>
              <div className="feature-desc">Choose from a comprehensive list of options before exporting the most relevant contact list for your business.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <div className="feature-title">Team Accounts</div>
              <div className="feature-desc">Share credits, manage usage, and share results throughout your organization.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔑</div>
              <div className="feature-title">Account User Permissions</div>
              <div className="feature-desc">Invite users and manage their permissions with new granular account access controls.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <div className="feature-title">Anti-Greylisting Technology</div>
              <div className="feature-desc">We adhere to latest anti-greylisting protocols to ensure fast and accurate results.</div>
            </div>
          </div>
        </div>
      </section>

      {/* More helpful highlights */}
      <section className="section more-highlights">
        <div className="section-inner">
          <h2>More Helpful Highlights</h2>
          <div className="more-grid">
            <div className="feature-card">
              <div className="feature-icon">⬇️</div>
              <div className="feature-title">Email Deduplication</div>
              <div className="feature-desc">Our platform detects and removes duplicate email addresses from your lists.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔁</div>
              <div className="feature-title">Implicit MX Support</div>
              <div className="feature-desc">We properly verify email addresses that use Implicit MX records.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧩</div>
              <div className="feature-title">Anti-Greylisting Tools</div>
              <div className="feature-desc">Proprietary systems to provide the fastest and most accurate results.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Join */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <h2>Join the world's largest companies that rely on Buzz to protect their sender reputation</h2>
          <button className="primary-cta large">Get Started Free</button>
          <p className="muted small">Includes 250 free credits</p>
        </div>
      </section>
    </>
  );
}

// Demo verification UI used in hero and insights
function DemoVerify({ variant }) {
  const [email, setEmail] = React.useState("");
  const [score, setScore] = React.useState(() => Math.floor(Math.random() * 101));
  const category = React.useMemo(() => {
    if (score >= 70) return { label: "Deliverable", color: "#4CAF50" };
    if (score >= 30) return { label: "Risky", color: "#FFC107" };
    return { label: "Undeliverable", color: "#FF5252" };
  }, [score]);

  function randomize() {
    // light pseudo-verification: generate 0-100 and map to category
    const next = Math.floor(Math.random() * 101);
    setScore(next);
  }

  React.useEffect(() => {
    // Prefill with a random realistic-looking email on first load
    if (!email) {
      const names = ["victorkent", "jane.doe", "alex", "support", "maria", "sam" ];
      const domains = ["gmail.com", "yahoo.com", "outlook.com", "emailable.co", "example.org"]; 
      const seed = `${names[Math.floor(Math.random()*names.length)]}@${domains[Math.floor(Math.random()*domains.length)]}`;
      setEmail(seed);
    }
    // Trigger a quick entry animation on mount by re-setting score shortly after
    const t = setTimeout(() => setScore((s) => s), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className="verify-box" style={{ maxWidth: variant === "inline" ? 520 : 550 }}>
        <input
          type="email"
          placeholder="Enter an email to verify"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") randomize();
          }}
        />
        <button className="verify-btn" onClick={randomize}>
          Verify
        </button>
        <span className="score-badge anim-pulse-once" style={{ background: (score >= 70 ? '#e9f7ef' : score >= 30 ? '#fff6e0' : '#fde7e7'), color: category.color }}>{score}</span>
      </div>
      {true && (
        <span className="status-chip anim-slide-in" style={{ color: category.color }}>
          <span className="status-dot" /> {category.label}
        </span>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h3>📧 Buzz</h3>
          <p>The best way to verify emails.</p>
        </div>

        <div className="footer-section">
          <h4>Products</h4>
          <ul>
            <li>Bulk Verification</li>
            <li>Real-Time API</li>
            <li>Integrations</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>

      <p className="footer-copy">© 2025 Developed and Designed by Rang Digitech LLC.</p>
    </footer>
  );
}
