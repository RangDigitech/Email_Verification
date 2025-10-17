// Centralized API base URL for the frontend.
// It will use the VITE_API_URL from your .env file,
// or default to your local FastAPI server address.
export const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export function apiUrl(path) {
  return `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

// ----------------------
// Auth helpers
// ----------------------
function authHeaders() {
  const t = localStorage.getItem("accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Call this after a successful login to fetch current balance and cache it
export async function refreshCredits() {
  try {
    const res = await fetch(apiUrl("/me/credits"), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // store for quick header use; UI can still read live from your CreditsContext
    if (data && typeof data.remaining_credits === "number") {
      localStorage.setItem("credits", String(data.remaining_credits));
    }
    return data;
  } catch {
    // don't crash UI if this fails
    return null;
  }
}

// ----------------------
// Auth APIs
// ----------------------
export const register = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("first_name", userData.first_name);
    formData.append("last_name", userData.last_name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);

    const response = await fetch(apiUrl("/register"), {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    // ✅ Save the display name *bound to this email* to avoid stale names later
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("name", `${data.first_name} ${data.last_name}`);
    localStorage.setItem("name_email", data.email);

    // Credits are created server-side at signup, but /me/credits is protected,
    // so we’ll refresh them after the user logs in.
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  formData.append("grant_type", "password");

  const response = await fetch(apiUrl("/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formData.toString(),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await response.json();

  // Save token + current email
  localStorage.setItem("accessToken", data.access_token);
  localStorage.setItem("userEmail", email);

  // Hydrate profile name for this account
  await getMe();

  // Hydrate credits (and cache them)
  await refreshCredits();

  return data;
};


export const logout = () => {
  localStorage.removeItem("accessToken");
  // optional: clear cached UI bits
  // localStorage.removeItem("credits");
  // localStorage.removeItem("name");
  // localStorage.removeItem("name_email");
};

// ----------------------
// Bulk validate
// ----------------------
export async function validateBulk({ file, workers = 12, smtp_from = "noreply@example.com" }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("workers", String(workers));
  fd.append("smtp", "true");
  fd.append("smtp_from", smtp_from);

  // Tag this request as coming from the Bulk flow; many backends use this
  // to avoid inserting these items into the "recent single emails" feed.
  const res = await fetch(apiUrl("/validate-file?source=bulk"), {
    method: "POST",
    body: fd,
    cache: "no-cache",
    credentials: "include",
    headers: { ...authHeaders(), "X-Verification-Source": "bulk" }, // hint for servers that honor it
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server error ${res.status}`);
  }
  const data = await res.json();

  // Normalize to your BulkVerifier shape
  // Accept multiple back-end shapes just in case
  const resultCandidates = [
    data?.results?.results,
    data?.results,
    data?.result?.results,
    data?.items,
    data?.data?.results,
  ];
  const rawResults = resultCandidates.find((x) => Array.isArray(x)) || [];

  // Normalize individual rows so the Bulk UI always has email/state/score/reason
  const norm = rawResults.map((r) => {
    const email = r.email || r.address || r.mail || r.user_email || r.to || "";
    const stateRaw = r.state || r.status || r.result || r.verdict || r.outcome || "";
    const state = typeof stateRaw === "string" ?
      stateRaw.charAt(0).toUpperCase() + stateRaw.slice(1).toLowerCase() : "";
    const reason = r.reason || r.message || r.detail || r.error || r.cause || "";
    // prefer 0-100; allow confidence 0..1; fallback to null
    let score = r.score;
    if (typeof score === "number" && score <= 1) score = Math.round(score * 100);
    if (score == null && typeof r.confidence === "number") score = Math.round(r.confidence * 100);
    if (score == null && typeof r.risk === "number") score = Math.round(100 - r.risk * 100);
    return {
      email,
      state: state || (r.deliverable === true ? "Deliverable" : r.risky === true ? "Risky" : r.undeliverable === true ? "Undeliverable" : r.unknown === true ? "Unknown" : ""),
      score,
      reason,
      accept_all: r.accept_all ?? r.acceptAll ?? false,
      disposable: r.disposable ?? false,
      role: r.role ?? false,
    };
  });
  const total = norm.length;
  const deliverable = Math.round(
    (norm.filter((r) => r.state === "Deliverable").length / Math.max(1, total)) * 100
  );
  const undeliverable = Math.round(
    (norm.filter((r) => r.state === "Undeliverable").length / Math.max(1, total)) * 100
  );
  const risky = Math.round(
    (norm.filter((r) => r.state === "Risky").length / Math.max(1, total)) * 100
  );

  return {
    id: Date.now(),
    name: file.name.replace(".csv", ""),
    fileName: file.name,
    source: "My Computer",
    totalEmails: total,
    uploadDate: new Date().toLocaleDateString(),
    deliverable,
    undeliverable,
    risky,
    unknown: 0,
    duplicate: 0,
    files: data.files || null,
    resultsArray: norm,
    breakdown: (function buildBreakdown() {
      const b = {
        deliverable: { valid: 0, acceptAll: 0, disposable: 0, roleBased: 0 },
        undeliverable: { invalidEmail: 0, invalidDomain: 0, rejectedEmail: 0, invalidSMTP: 0 },
        risky: { lowQuality: 0, lowDeliverability: 0 },
        unknown: { noConnect: 0, timeout: 0, unavailableSMTP: 0, unexpectedError: 0 },
      };
      norm.forEach((r) => {
        if (r.state === "Deliverable") {
          b.deliverable.valid++;
          if (r.accept_all) b.deliverable.acceptAll++;
          if (r.disposable) b.deliverable.disposable++;
          if (r.role) b.deliverable.roleBased++;
        } else if (r.state === "Undeliverable") {
          if (r.reason === "REJECTED EMAIL") b.undeliverable.rejectedEmail++;
          else if (r.reason === "Invalid format") b.undeliverable.invalidEmail++;
          else b.undeliverable.invalidDomain++;
        } else if (r.state === "Risky") {
          if (r.score < 60) b.risky.lowQuality++;
          else b.risky.lowDeliverability++;
        }
      });
      return b;
    })(),
  };
}

// ----------------------
// Single validate
// ----------------------
export async function validateEmail({ email, smtp = true, smtp_from = "noreply@example.com" }) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("smtp", String(smtp));
  fd.append("smtp_from", smtp_from);

  const _hdrs = { ...authHeaders() };
  console.log("[validateEmail] sending headers:", _hdrs);

  const res = await fetch(apiUrl("/validate-email"), {
    method: "POST",
    body: fd,
    cache: "no-cache",
    credentials: "include",
    headers: _hdrs, // MUST include Authorization
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Server error ${res.status}`);
  }
  const data = await res.json();

  // After a successful verification, credits may have changed; refresh cache (non-blocking)
  refreshCredits().catch(() => {});

  return data.result || data;
}
// add under auth helpers in api.js
export async function getMe() {
  try {
    const res = await fetch(apiUrl("/me"), {
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();
    if (me?.email) {
      // bind name to the matching email to avoid stale names
      const full = [me.first_name, me.last_name].filter(Boolean).join(" ").trim();
      if (full) {
        localStorage.setItem("name", full);
        localStorage.setItem("name_email", me.email);
      } else {
        localStorage.removeItem("name");
        localStorage.removeItem("name_email");
      }
    }
    return me;
  } catch {
    return null;
  }
}
