import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Help.css";

const helpSections = [
  {
    id: 1,
    title: "1. Getting Started",
    content: [
      "Steps to log in or sign up using your credentials.",
      "Overview of the main dashboard and navigation menu.",
      "How to use different sections or tools available on the platform.",
      "How to update or change preferences within the web interface."
    ]
  },
  {
    id: 2,
    title: "2. Common Issues and Quick Fixes",
    subsections: [
      {
        subtitle: "Login Problems",
        points: [
          "Double-check your username and password.",
          "Ensure your internet connection is stable.",
          "Try refreshing the page or clearing browser cache."
        ]
      },
      {
        subtitle: "Page Not Loading Properly",
        points: [
          "Reload the page or log out and log in again.",
          "Clear browser cookies and cache.",
          "Try using a different browser if the issue continues."
        ]
      },
      {
        subtitle: "Slow Performance",
        points: [
          "Close unnecessary browser tabs or background processes.",
          "Clear temporary data and cache.",
          "Refresh the page or restart the browser session."
        ]
      }
    ]
  },
  {
    id: 3,
    title: "3. Using the Application Features",
    content: [
      "Step-by-step guidance on performing common actions.",
      "Explanation of major tools, buttons, or icons across the interface.",
      "Tips for smoother workflow and avoiding common mistakes.",
      "Keyboard shortcuts or quick actions (if supported)."
    ]
  },
  {
    id: 4,
    title: "4. Troubleshooting Guide",
    content: [
      "If the web page freezes, refresh or re-login.",
      "Clear browser cache and cookies to resolve most errors.",
      "Use an updated browser version for best compatibility.",
      "Try opening the site in incognito/private mode to rule out extension conflicts."
    ]
  },
  {
    id: 5,
    title: "5. Security & Privacy Tips",
    content: [
      "Never share your login credentials with anyone.",
      "Always log out after finishing your session, especially on shared devices.",
      "Use a strong password that includes a mix of letters, numbers, and symbols.",
      "Avoid saving passwords on public or shared computers."
    ]
  },
  {
    id: 6,
    title: "6. Best Practices",
    content: [
      "Keep your browser updated to ensure smooth functionality.",
      "Avoid using multiple tabs of the same session to prevent conflicts.",
      "Refresh your page after long periods of inactivity.",
      "Note down any visible error message before reporting a problem."
    ]
  },
  {
    id: 7,
    title: "7. Feedback & Support Instructions",
    content: [
      "If your issue isn't listed here:",
      "• Refresh the page and check your internet connection.",
      "• Clear cache and cookies, then try again.",
      "• If the problem continues, note the steps that caused the issue and any visible error messages before contacting support."
    ]
  }
];

export default function Help() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="help-page">
      <div className="help-container">
        <div className="help-header">
          <h1>Help Center</h1>
          <p className="help-subtitle">
            Welcome to the Help Page
          </p>
          <p className="help-intro">
            If you're facing an issue or need guidance using the web application, you're in the right place. 
            This page will help you understand how to use key features, solve common issues, and navigate the platform with ease.
          </p>
        </div>

        <div className="help-sections">
          {helpSections.map((section) => (
            <div key={section.id} className={`help-section ${openSections[section.id] ? 'open' : ''}`}>
              <div className="section-header" onClick={() => toggleSection(section.id)}>
                <h2>{section.title}</h2>
                <button className="toggle-btn">
                  <svg 

                    className={`chevron ${openSections[section.id] ? 'rotated' : ''}`}
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
              
              <div className="section-content">
                {section.content && (
                  <ul className="help-list">
                    {section.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.subsections && section.subsections.map((sub, idx) => (
                  <div key={idx} className="subsection">
                    <h3>{sub.subtitle}</h3>
                    <ul className="help-list">
                      {sub.points.map((point, pidx) => (
                        <li key={pidx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="help-footer">
          <p>Still need help? <Link to="/contact" className="contact-link">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  );
}
