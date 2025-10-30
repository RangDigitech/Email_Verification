import React from "react";
import "./InsufficientCreditsModal.css";

export default function InsufficientCreditsModal({ onClose, onBuyCredits }) {
  const handleBuyClick = () => {
    console.log("Buy Credits button clicked in modal");
    console.log("onBuyCredits function:", onBuyCredits);
    if (onBuyCredits) {
      onBuyCredits();
    } else {
      console.error("onBuyCredits function is not defined!");
    }
  };

  return (
    <div className="insufficient-credits-overlay" onClick={onClose}>
      <div className="insufficient-credits-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <h2 className="modal-title">Oops! You’re out of credits</h2>
        <p className="modal-description">
        Looks like you’ve used up your current credits. Add a few more to keep verifying emails with AI Email Verifier.
        </p>

        <div className="modal-features">
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/expiration.png" alt="Credits never expire" />
            </div>
            <div className="feature-text">Your credits never expire</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/discount.png" alt="Volume discounts" />
            </div>
            <div className="feature-text">Enjoy discounts with larger credit packs</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/icons8-no-hidden-fees-80.png" alt="No hidden costs" />
            </div>
            <div className="feature-text">No surprises, transparent pricing</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <img src="/credit-cards-payment.png" alt="Flexible billing options" />
            </div>
            <div className="feature-text">Flexible billing that fits your needs</div>
          </div>
        </div>

        <button className="buy-credits-modal-btn" onClick={handleBuyClick}>
          BUY CREDITS
        </button>
      </div>
    </div>
  );
}

