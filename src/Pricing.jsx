import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './components/BuyCreditsModal.css';
import { USD_TO_INR_RATE } from './config';
 
function BuyCreditsModal({ onClose }) {
  const navigate = useNavigate();
  const [selectedCredits, setSelectedCredits] = useState(5000);
  const [isMonthly, setIsMonthly] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [conversionRate] = useState(USD_TO_INR_RATE); // Hardcoded exchange rate from config
  const [isFetchingRate] = useState(false); // No longer fetching from API
 
  // 🌍 Detect user's location
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code === 'IN') {
          setCurrency('INR');
        } else {
          setCurrency('USD');
        }
      })
      .catch(() => setCurrency('USD'));
  }, []);
 
  // 💱 Using hardcoded exchange rate (no API call needed)
  // Rate is managed in src/config.js for easy updates
  // Current rate: 1 USD = ${USD_TO_INR_RATE} INR (includes buffer)
 
  const creditOptions = [
    { amount: 5000, price: 11, perCreditPayg: 0.0021, perCreditMonthly: 0.001785 },
    { amount: 10000, price: 15, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 20000, price: 31, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 40000, price: 60, perCreditPayg: 0.0015, perCreditMonthly: 0.001275 },
    { amount: 80000, price: 80, perCreditPayg: 0.0010, perCreditMonthly: 0.00085 },
    { amount: 100000, price: 100, perCreditPayg: 0.0010, perCreditMonthly: 0.00085 },
    { amount: 200000, price: 180, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
    { amount: 1000000, price: 900, perCreditPayg: 0.0009, perCreditMonthly: 0.000765 },
  ];
 
  const calculatePrice = () => {
    if (selectedCredits < 5000) {
      const minOption = creditOptions[0];
      const price = isMonthly ? minOption.price * 0.85 : minOption.price;
      return price;
    }
    const option = creditOptions.find(o => o.amount === selectedCredits);
    const base = option ? option.price : selectedCredits * 0.01;
    return isMonthly ? base * 0.85 : base;
  };
 
  const getPerCreditPrice = () => {
    const price = calculatePrice();
    const effectiveCredits = selectedCredits < 5000 ? 5000 : selectedCredits;
    const perCredit = price / effectiveCredits;
    const displayPrice = currency === 'INR' ? perCredit * conversionRate : perCredit;
 
    if (displayPrice >= 0.01) return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(2)}`;
    if (displayPrice >= 0.001) return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(4)}`;
    return `${currency === 'INR' ? '₹' : '$'}${displayPrice.toFixed(6)}`;
  };
 
  const formatPrice = (p) => {
    const converted = currency === 'INR' ? p * conversionRate : p;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${Math.round(converted)}`;
  };
 
  const handleToggle = () => setIsMonthly(!isMonthly);
  const handleSelect = (amt) => setSelectedCredits(amt);
 
  const option = creditOptions.find(o => o.amount === selectedCredits);
  const basePrice = selectedCredits < 5000
    ? creditOptions[0].price
    : (option ? option.price : selectedCredits * 0.01);
  const discounted = basePrice * 0.85;
  const exceedsMax = selectedCredits > 1000000;
 
  const handleContactClick = () => {
    onClose();
    navigate('/contact?from=dashboard', {
      state: { from: 'buyCredits', requestedCredits: selectedCredits, isLoggedIn: true },
    });
  };
 
  // prevent background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);
 
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
 
        <div className="modal-header">
          <h1>Buy Credits</h1>
        </div>
 
        <div className="pricing-container">
          {/* LEFT SIDE */}
          <div className="credit-selector">
            <h2 className="section-title">CHOOSE A PACKAGE</h2>
            <div className="credit-grid">
              {creditOptions.map((option) => (
                <div
                  key={option.amount}
                  className={`credit-card ${selectedCredits === option.amount ? 'active' : ''}`}
                  onClick={() => handleSelect(option.amount)}
                >
                  {selectedCredits === option.amount && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                  <div className="credit-amount">{option.amount.toLocaleString()}</div>
                  <div className="credit-text">Credits</div>
                </div>
              ))}
            </div>
 
            <div className="custom-amount-section">
              <p className="custom-label">OR ENTER AN AMOUNT OF CREDITS</p>
              <input
                type="number"
                className="custom-input"
                placeholder="5,000"
                min="1"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) setSelectedCredits(val);
                }}
              />
            </div>
          </div>
 
          {/* RIGHT SIDE */}
          {!exceedsMax ? (
            <div className="pricing-card">
              <div className="toggle-container">
                <span className={`toggle-label ${!isMonthly ? 'active' : ''}`}>Pay-As-You-Go</span>
                <div className={`toggle-switch ${isMonthly ? 'monthly' : ''}`} onClick={handleToggle}>
                  <div className="toggle-slider"></div>
                </div>
                <span className={`toggle-label ${isMonthly ? 'active' : ''}`}>Subscription</span>
              </div>
 
              <div className="price-display">
                {isMonthly && (
                  <>
                    <div className="old-price">{formatPrice(basePrice)}</div>
                    <div className="save-badge">SAVE {formatPrice(basePrice - discounted)}</div>
                  </>
                )}
 
                <div className="new-price">
                  {formatPrice(isMonthly ? discounted : basePrice)}
                  {isMonthly && <span className="per-month">/month</span>}
                </div>
 
                <div className="per-credit">
                  COST PER CREDIT
                  <div className="per-credit-value">{getPerCreditPrice()}</div>
                </div>
              </div>
 
              <div className="price-breakdown">
                <div className="breakdown-row">
                  <span>{selectedCredits.toLocaleString()} credits</span>
                  <span>{formatPrice(isMonthly ? discounted : basePrice)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total</span>
                  <span>{formatPrice(isMonthly ? discounted : basePrice)}</span>
                </div>
              </div>
 
              <button className="cta-button">NEXT</button>
 
              <ul className="benefits">
                <li>Real-time email validation</li>
                <li>Bulk verification support</li>
                <li>API access included</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
          ) : (
            <div className="pricing-card contact-card">
              <h2>Need more than<br />1,000,000 credits?</h2>
              <p>Contact our sales team for enterprise pricing</p>
              <button className="contact-button" onClick={handleContactClick}>Contact Us</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default BuyCreditsModal;
 
 
