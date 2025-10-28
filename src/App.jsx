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
import AboutUs from "./components/AboutUs";
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from './auth';
import ProtectedRoute from './ProtectedRoute'; // Import the new component
import Hero from "./Hero";
import BulkPage from "./BulkPage";
import SinglePage from "./SinglePage";
import ContactPage from "./ContactPage";
import Help from "./Help";
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
    location.pathname === "/dashboard" ||
    location.pathname === "/about";

  return (
    <div className="app">
      {!hideNavbarAndFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bulk" element={<BulkPage />}/>
        <Route path="/Single" element={<SinglePage />}/>
        

        {/* PROTECTED ROUTE FOR DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* You can add other protected routes here */}
        </Route>

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<Help />} />
      </Routes>

      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
}

export function Navbar() {
  const user = getUser();
  const [showSolutionsMenu, setShowSolutionsMenu] = React.useState(false);
  const solutionsRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target)) {
        setShowSolutionsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src="/email_logo.png" alt="Verifier Logo" className="logo" />
        <span>AI Email Verifier</span>
      </Link>
      <ul className="nav-links">
        <li 
          className="solutions-dropdown" 
          ref={solutionsRef}
          onMouseEnter={() => setShowSolutionsMenu(true)}
          onMouseLeave={() => setShowSolutionsMenu(false)}
        >
          <button className="solutions-toggle">
            Solutions
            <svg 
              className={`dropdown-arrow ${showSolutionsMenu ? 'open' : ''}`} 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none"
            >
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          
          {showSolutionsMenu && (
            <div className="solutions-menu">
              <Link to="/bulk" className="solution-item">
                <div className="solution-icon bulk-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="solution-content">
                  <div className="solution-title">Bulk</div>
                  <div className="solution-desc">Verify email address lists</div>
                </div>
              </Link>

              <Link to="/single" className="solution-item">
                <div className="solution-icon verifier-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="solution-content">
                  <div className="solution-title">Single Verifier</div>
                  <div className="solution-desc">One Click One Email</div>
                </div>
              </Link>

              {/* <Link to="/api" className="solution-item">
                <div className="solution-icon api-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="solution-content">
                  <div className="solution-title">API</div>
                  <div className="solution-desc">Email Verification for Developers</div>
                </div>
              </Link>

              <Link to="/widget" className="solution-item">
                <div className="solution-icon widget-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9.75 17L9 20L8 21H16L15 20L14.25 17M3 13H21M5 17H19C20.1046 17 21 16.1046 21 15V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="solution-content">
                  <div className="solution-title">Widget</div>
                  <div className="solution-desc">Real-Time Email Validation</div>
                </div>
              </Link>

              <Link to="/deliverability" className="solution-item">
                <div className="solution-icon deliverability-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L10.89 13.26C11.5417 13.6728 12.4583 13.6728 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="solution-content">
                  <div className="solution-title">Deliverability</div>
                  <div className="solution-desc">Inbox Placement and Insights</div>
                </div>
              </Link> */}
            </div>
          )}
        </li>
        <li><Link to="/pricing">Pricing</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
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
      {/* <section className="hero">
        <div className="hero-content">
          <h1>The Ultimate Email Verification</h1>
          <p>
            Ensure your emails reach the inbox. Our real-time verification cleans
            your lists, reduces bounces, and protects your sender reputation.
            skjabsashlnaelknfLKWnlekfnlkWnlkvnwklv
          </p>
          <AnimatedEmailDemo />
        </div>
      </section> */}
      <Hero />

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
              <Link to="/signup">
                <button className="primary-cta">Get Started Free</button>
              </Link>
            </div>
            </div>
            <div className="bulk-right">
              {(() => {
                const [hoveredSegment, setHoveredSegment] = React.useState(null);

                const deliverable = 58.5;
                const undeliverable = 11.2;
                const risky = 21.1;
                const unknown = 6.2;
                const duplicate = 3.0;

                const segments = [
                  { name: 'deliverable', value: deliverable, count: 3802, color: 'var(--brand-primary)', label: 'Deliverable', colorHex: '#000000' },
                  { name: 'undeliverable', value: undeliverable, count: 728, color: '#999', label: 'Undeliverable', colorHex: '#999999' },
                  { name: 'risky', value: risky, count: 1372, color: '#f4a261', label: 'Risky', colorHex: '#f4a261' },
                  { name: 'unknown', value: unknown, count: 403, color: '#ccc', label: 'Unknown', colorHex: '#cccccc' },
                  { name: 'duplicate', value: duplicate, count: 195, color: '#c1b3ff', label: 'Duplicate', colorHex: '#c1b3ff' }
                ];

                const total = segments.reduce((sum, seg) => sum + seg.value, 0);
                
                // Calculate angles for each segment
                let currentAngle = 0;
                const segmentsWithAngles = segments.map(seg => {
                  const angle = (seg.value / total) * 360;
                  const result = { ...seg, startAngle: currentAngle, endAngle: currentAngle + angle };
                  currentAngle += angle;
                  return result;
                });

                // Build base gradient
                const baseGradient = `conic-gradient(
                  var(--brand-primary) 0deg ${segmentsWithAngles[0].endAngle}deg,
                  #999 ${segmentsWithAngles[0].endAngle}deg ${segmentsWithAngles[1].endAngle}deg,
                  #f4a261 ${segmentsWithAngles[1].endAngle}deg ${segmentsWithAngles[2].endAngle}deg,
                  #ccc ${segmentsWithAngles[2].endAngle}deg ${segmentsWithAngles[3].endAngle}deg,
                  #c1b3ff ${segmentsWithAngles[3].endAngle}deg ${segmentsWithAngles[4].endAngle}deg
                )`;

                // Helper function to calculate donut segment path (ring only, not pizza slice)
                function getDonutSegmentPath(startAngle, endAngle) {
                  const outerRadius = 50; // 50% from center
                  const innerRadius = 30; // 30% from center (creates the hole)
                  const steps = 30;
                  
                  const points = [];
                  
                  // Outer arc (clockwise)
                  for (let i = 0; i <= steps; i++) {
                    const angle = startAngle + (endAngle - startAngle) * (i / steps);
                    const rad = (angle - 90) * Math.PI / 180;
                    const x = 50 + outerRadius * Math.cos(rad);
                    const y = 50 + outerRadius * Math.sin(rad);
                    points.push(`${x}% ${y}%`);
                  }
                  
                  // Inner arc (counter-clockwise)
                  for (let i = steps; i >= 0; i--) {
                    const angle = startAngle + (endAngle - startAngle) * (i / steps);
                    const rad = (angle - 90) * Math.PI / 180;
                    const x = 50 + innerRadius * Math.cos(rad);
                    const y = 50 + innerRadius * Math.sin(rad);
                    points.push(`${x}% ${y}%`);
                  }
                  
                  return points.join(', ');
                }

                // Get current display data
                const currentSegment = hoveredSegment 
                  ? segments.find(s => s.name === hoveredSegment)
                  : segments[0];

                return (
                  <div className="donut-card">
                    <div className="donut-wrap" aria-hidden>
                      <div className="donut-container" style={{ position: 'relative', width: '200px', height: '200px' }}>
                        {/* Base donut chart */}
                        <div 
                          className="donut multi" 
                          style={{ 
                            background: baseGradient,
                            filter: hoveredSegment ? 'brightness(0.7)' : 'brightness(1)',
                            transition: 'filter 0.3s ease, transform 0.3s ease',
                            transform: hoveredSegment ? 'scale(0.98)' : 'scale(1)',
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                        </div>

                        {/* Hover overlay segments with glow effect - DONUT RING ONLY */}
                        {segmentsWithAngles.map((seg) => (
                          <div
                            key={seg.name}
                            className="donut-segment-hover"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              clipPath: `polygon(${getDonutSegmentPath(seg.startAngle, seg.endAngle)})`,
                              cursor: 'pointer',
                              pointerEvents: 'all',
                              zIndex: 2
                            }}
                            onMouseEnter={() => setHoveredSegment(seg.name)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            {/* Highlight overlay with glow */}
                            {hoveredSegment === seg.name && (
                              <>
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    background: seg.color,
                                    opacity: 0.9,
                                    animation: 'glowPulse 0.6s ease-in-out',
                                    filter: `drop-shadow(0 0 20px ${seg.colorHex})`
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: `radial-gradient(circle at center, ${seg.colorHex}88 0%, transparent 70%)`,
                                    animation: 'ripple 0.8s ease-out'
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ))}

                        {/* Center content - MUST be after hover segments to be on top */}
                        <div 
                          className="donut-center"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            pointerEvents: 'none',
                            textAlign: 'center',
                            width: '60%'
                          }}
                        >
                          <div 
                            className="donut-percent"
                            style={{
                              transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                              transform: hoveredSegment ? 'scale(1.15)' : 'scale(1)',
                              color: hoveredSegment ? currentSegment.colorHex : 'inherit',
                              fontSize: '32px',
                              fontWeight: 'bold',
                              lineHeight: '1.2'
                            }}
                          >
                            {currentSegment.value}%
                          </div>
                          <div 
                            className="donut-label"
                            style={{
                              transition: 'all 0.3s ease',
                              opacity: hoveredSegment ? 1 : 0.7,
                              fontSize: '14px',
                              marginTop: '4px',
                              color: '#696565ff'
                            }}
                          >
                            {currentSegment.label}
                          </div>
                          {hoveredSegment && (
                            <div 
                              className="donut-count"
                              style={{
                                fontSize: '12px',
                                color: '#050505ff',
                                marginTop: '4px',
                                animation: 'fadeInUp 0.3s ease'
                              }}
                            >
                              {currentSegment.count.toLocaleString()} emails
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="donut-legend modern">
                        {segments.map((seg, idx) => (
                          <div
                            key={seg.name}
                            className={`legend-row anim-slide-in ${hoveredSegment === seg.name ? 'highlighted' : ''}`}
                            style={{ 
                              animationDelay: `${40 + idx * 50}ms`,
                              transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                              opacity: hoveredSegment && hoveredSegment !== seg.name ? 0.4 : 1,
                              transform: hoveredSegment === seg.name ? 'translateX(12px) scale(1.05)' : 'translateX(0) scale(1)'
                            }}
                            onMouseEnter={() => setHoveredSegment(seg.name)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            <span 
                              className={`legend-badge badge-${seg.name} anim-pulse-once`}
                              style={{
                                transition: 'all 0.3s ease',
                                transform: hoveredSegment === seg.name ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                                boxShadow: hoveredSegment === seg.name ? `0 4px 12px ${seg.colorHex}66` : 'none'
                              }}
                            >
                              {seg.value}%
                            </span>
                            <span className="legend-text">{seg.label}</span>
                            <span 
                              className="legend-count"
                              style={{
                                transition: 'all 0.3s ease',
                                fontWeight: hoveredSegment === seg.name ? '700' : '400'
                              }}
                            >
                              {seg.count.toLocaleString()}
                            </span>
                          </div>
                        ))}
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
              <img src="/image.png" alt="Inbox Placements Visual" className="insights-image" />
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
              <Link to="/signup">
                <button className="primary-cta">Get Started Free</button>
              </Link>
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
          <h2>Join the world's largest companies that rely on AI Email Verifier to protect their sender reputation</h2>
          <Link to="/signup">
            <button className="primary-cta large">Get Started Free</button>
          </Link>
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
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          {/* <h3>AI Email Verifier</h3> */}
          {/* <p>The best way to verify emails.</p> */}
          
          {/* NEW: Tagline with different sizes */}
          <div style={{
            marginTop: '0px',
            lineHeight: '1.1',
          }}>
            <span style={{
              fontSize: '40px',
              fontWeight: '500',
              color: '#ffffff',
              margin: '0',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.3px',
            }}>
              Verify Smart,
            </span>
            <p style={{
              fontSize: '60px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '4px 0 0 0',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-1px',
              lineHeight: '1.1',
              // paddingLeft:'10px'
            }}>
              Send Confident.
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Solutions</h4>
          <ul>
            <Link to="/bulk">
              <li>Bulk Verifier</li>
            </Link>
            <Link to="/single">
              <li>Single Verifier</li>
            </Link>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/help">Help / FAQs</Link></li>
          </ul>
        </div>

        {/* Auth Buttons Section */}
        <div className="footer-section">
          {/* <h4>Get Started</h4> */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            marginTop: '16px' 
          }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  background: '#ffffff',
                  color: '#000000',
                  border: '2px solid #ffffff',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#ffffff';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#000000';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>
            </Link>

            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  background: '#ffffff',
                  color: '#000000',
                  border: '2px solid #ffffff',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#ffffff';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#000000';
                  e.target.style.borderColor = '#ffffff';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign Up Free
              </button>
            </Link>
          </div>
        </div>
      </div>

      <p className="footer-copy">
        © 2025 Developed and Designed by{' '}
        <a 
          href="https://rangdigitech.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#ffffffff', textDecoration: 'underline' }}
        >
          Rang Digitech LLC
        </a>.
      </p>
    </footer>
  );
}