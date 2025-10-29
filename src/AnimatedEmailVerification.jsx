import React, { useState, useEffect, useRef } from 'react';
import './AnimatedEmailVerification.css';

const AnimatedEmailVerification = () => {
  const [displayedEmail, setDisplayedEmail] = useState('');
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('');

  // Sample emails with their scores and statuses
  const emailExamples = [
    { email: 'hello@gmail.com', score: 91, status: 'Deliverable' },
    { email: 'alia23@yahoo.co.in', score: 0, status: 'Undeliverable' },
    { email: 'support@microsoft.com', score: 70, status: 'Risky' },
    { email: 'contactus@outlook.com', score: 95, status: 'Deliverable' },
    { email: 'harry@yahoo.co', score: 15, status: 'Risky' },
  ];

  const currentEmail = emailExamples[currentEmailIndex];

  // Typing animation effect
  useEffect(() => {
    if (isTyping && charIndex < currentEmail.email.length) {
      const timeout = setTimeout(() => {
        setDisplayedEmail(currentEmail.email.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 80); // Typing speed
      return () => clearTimeout(timeout);
    } else if (charIndex >= currentEmail.email.length) {
      // Finished typing, show score and status
      setScore(currentEmail.score);
      setStatus(currentEmail.status);
      setIsTyping(false);
      
      // Wait 3 seconds, then move to next email
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayedEmail('');
        setScore(0);
        setStatus('');
        setIsTyping(true);
        setCurrentEmailIndex((currentEmailIndex + 1) % emailExamples.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, isTyping, currentEmail, currentEmailIndex, emailExamples.length]);

  // Determine colors and icons based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Deliverable':
        return {
          bgColor: '#10b981',
          textColor: '#fff',
          icon: '✓',
        };
      case 'Undeliverable':
        return {
          bgColor: '#ef4444',
          textColor: '#fff',
          icon: '×',
        };
      case 'Risky':
        return {
          bgColor: '#f59e0b',
          textColor: '#fff',
          icon: '⚠',
        };
      default:
        return {
          bgColor: '#6b7280',
          textColor: '#fff',
          icon: '?',
        };
    }
  };

  const statusStyle = getStatusStyle(status);
  const showScore = displayedEmail.length > 0;

  return (
    <div className="animated-email-container">
      <div className="email-demo-row">
        {/* Translucent input box with score inside */}
        <div className="email-input-wrapper">
          <div className="email-display-field">
            {displayedEmail}
            {isTyping && <span className="typing-cursor">|</span>}
          </div>
          
          {/* Score badge inside the input */}
          {showScore && !isTyping && (
            <div className="score-badge-inside">
              <span className="score-number">{score}</span>
            </div>
          )}
        </div>

        {/* Status badge on the RIGHT side of the box */}
        {showScore && !isTyping && status && (
          <div className="status-badge-right">
            <span className="status-icon" style={{ color: statusStyle.bgColor }}>
              {statusStyle.icon}
            </span>
            <span className="status-text">{status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedEmailVerification;

