import React, { useEffect, useRef, useState } from "react";

export default function AnimatedEmailDemo() {
  const [email, setEmail] = useState("");
  const [score, setScore] = useState(0);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  // Entrance animation: add .aed-fade initially then remove to trigger transition
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.classList.add("aed-fade");
    const t = setTimeout(() => el.classList.remove("aed-fade"), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!email) {
      setScore(0);
      return;
    }

    // simple simulated score calculation (for demo only)
    const cleaned = email.trim().toLowerCase();
    let base = 60;
    if (cleaned.includes("@gmail")) base += 12;
    if (cleaned.includes("@yahoo")) base += 6;
    if (cleaned.includes("test") || cleaned.includes("invalid")) base -= 20;
    const randomOffset = Math.floor(Math.random() * 18);
    const computed = Math.max(10, Math.min(99, base + randomOffset));
    const t = setTimeout(() => setScore(computed), 120);
    return () => clearTimeout(t);
  }, [email]);

  const dotColor = score > 80 ? "#2ecc71" : score > 65 ? "#f4a261" : "#999";

  const showBadge = focused || Boolean(email);

  return (
    <div className="aed-wrap">
      <div ref={wrapRef} className="aed-input-wrap">
        <input
          className="aed-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Try hello@company.com"
          aria-label="Email demo input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* <div className={`aed-badge ${showBadge ? "aed-badge-show" : ""}`}>
          <span className="aed-dot" style={{ background: dotColor }} />
          <div style={{ textAlign: "right" }}>
            <div className="aed-score">{score ? `${score}%` : "--"}</div>
            <div className="aed-label">Quality</div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
