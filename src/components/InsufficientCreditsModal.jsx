import React from "react";
import "./InsufficientCreditsModal.css";
const expirationIcon = "/expiration.png";
const discountIcon = "/discount.png";
const noHiddenFeesIcon = "/icons8-no-hidden-fees-80.png";
const paymentIcon = "/credit-cards-payment.png";

export default function InsufficientCreditsModal({
  onClose,
  onBuyCredits,
  creditsNeeded,
  creditsAvailable,
}) {
  const handleBuyClick = () => {
    if (onBuyCredits) {
      onBuyCredits();
    }
  };

  const isInsufficientCredits =
    creditsNeeded !== undefined &&
    creditsAvailable !== undefined &&
    creditsAvailable > 0;
  const creditsShort = isInsufficientCredits
    ? Math.max(creditsNeeded - creditsAvailable, 0)
    : 0;

  return (
    <div className="insufficient-credits-overlay" onClick={onClose}>
      <div
        className="insufficient-credits-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        {isInsufficientCredits ? (
          <>
            <h2 className="modal-title">Insufficient Credits</h2>
            <p className="modal-description">
              You don't have enough credits to verify all emails in your CSV
              file. Add more credits to continue.
            </p>

            <div className="credits-info-section">
              <div className="credits-info-row">
                <span className="credits-label">Credits needed:</span>
                <span className="credits-value credits-needed">
                  {creditsNeeded}
                </span>
              </div>
              <div className="credits-info-row">
                <span className="credits-label">Credits you have:</span>
                <span className="credits-value credits-available">
                  {creditsAvailable}
                </span>
              </div>
              <div className="credits-info-row credits-short-row">
                <span className="credits-label">Additional credits needed:</span>
                <span className="credits-value credits-short">
                  {creditsShort}
                </span>
              </div>
            </div>

            <div className="modal-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={expirationIcon} alt="Credits never expire" />
                </div>
                <div className="feature-text">Your credits never expire</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={discountIcon} alt="Volume discounts" />
                </div>
                <div className="feature-text">
                  Enjoy discounts with larger credit packs
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={noHiddenFeesIcon} alt="No hidden costs" />
                </div>
                <div className="feature-text">
                  No surprises, transparent pricing
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={paymentIcon} alt="Flexible billing options" />
                </div>
                <div className="feature-text">
                  Flexible billing that fits your needs
                </div>
              </div>
            </div>

            <button className="buy-credits-modal-btn" onClick={handleBuyClick}>
              BUY CREDITS
            </button>
          </>
        ) : (
          <>
            <h2 className="modal-title">Oops! You're out of credits</h2>
            <p className="modal-description">
              Looks like you've used up your current credits. Add a few more to
              keep verifying emails with AI Email Verifier.
            </p>

            <div className="modal-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={expirationIcon} alt="Credits never expire" />
                </div>
                <div className="feature-text">Your credits never expire</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={discountIcon} alt="Volume discounts" />
                </div>
                <div className="feature-text">
                  Enjoy discounts with larger credit packs
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={noHiddenFeesIcon} alt="No hidden costs" />
                </div>
                <div className="feature-text">
                  No surprises, transparent pricing
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <img src={paymentIcon} alt="Flexible billing options" />
                </div>
                <div className="feature-text">
                  Flexible billing that fits your needs
                </div>
              </div>
            </div>

            <button className="buy-credits-modal-btn" onClick={handleBuyClick}>
              BUY CREDITS
            </button>
          </>
        )}
      </div>
    </div>
  );
}

