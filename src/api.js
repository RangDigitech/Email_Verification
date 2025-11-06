// Centralized API base URL for the frontend.
// It will use the VITE_API_URL from your .env file,
// or default to your local FastAPI server address.
export const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export function apiUrl(path) {
  return `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

// NEW: expose site key to components
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";



// Public utility: quick disposable/syntax check for signup
export async function checkEmailDisposable(email) {
  const url = apiUrl(`/utils/check-email?email=${encodeURIComponent(email)}`);
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" });
  // The endpoint always returns 200 with {ok: boolean, disposable, syntax_ok...}
  const data = await res.json();
  return data;
}
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// ----------------------
// Auth helpers
// ----------------------
function authHeaders(tokenOverride) {
  const token =
    tokenOverride ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
export const login = async (email, password, captchaToken) => {
  if (!captchaToken) throw new Error("Please complete the captcha first.");

  const formData = new URLSearchParams();
  // backend accepts username/password in your current code
  formData.append("username", email);
  formData.append("password", password);
  formData.append("grant_type", "password");
  // NEW: send token
  formData.append("recaptcha_token", captchaToken);

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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.access_token);
  localStorage.setItem("userEmail", email);

  // hydrate profile & credits like you already do
  try { await getMe(); } catch {}
  try { await refreshCredits(); } catch {}

  return data;
};

// --- CONTACT: if you already post contact to backend, include token ---
// Example helper (adjust to your actual contact endpoint & payload):
export async function submitContact(form) {
  // form = { name, email, phone, subject, message, recaptcha_token }
  const res = await fetch(apiUrl("/contact/submit"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(form),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

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

// --- OAUTH HELPERS ---

export function oauthStartUrl(provider) {
  // We’ll always land back here after backend finishes
  const next = encodeURIComponent(`${window.location.origin}/oauth/callback`);
  return `${apiUrl(`/oauth/${provider}/start`)}?next=${next}`;
}

export async function finishOAuthLogin(token) {
  if (!token) throw new Error("Missing token");
  localStorage.setItem("accessToken", token);
  // Hydrate profile and credits, and persist the canonical email for UI
  let me = null;
  try {
    if (typeof getMe === "function") me = await getMe();
  } catch {}
  if (me?.email) {
    localStorage.setItem("userEmail", me.email);
  }
  try {
    if (typeof refreshCredits === "function") await refreshCredits();
  } catch {}
  return true;
}
export function openOAuthPopup(provider) {
  const url = oauthStartUrl(provider);
  const w = 520, h = 600;
  const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
  const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
  window.open(url, "oauth", `width=${w},height=${h},left=${x},top=${y}`);
}


// Fetch user profile data for Team section
export async function getUserProfile() {
  try {
    const res = await fetch(apiUrl("/me/profile"), {
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const profile = await res.json();
    return profile;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // Fallback to basic user data if profile endpoint doesn't exist
    const basicUser = await getMe();
    return basicUser ? {
      firstName: basicUser.first_name || '',
      lastName: basicUser.last_name || '',
      email: basicUser.email || '',
      phone: basicUser.phone || '',
      role: 'Account Owner',
      status: 'Active',
      twoFactor: basicUser.two_factor_enabled || false,
      joinDate: basicUser.created_at ? new Date(basicUser.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    } : null;
  }
}

//API helper to fetch one verification
export async function getVerificationById(id) {
  const res = await fetch(apiUrl(`/verifications/${id}`), {
    method: "GET",
    headers: { ... (localStorage.getItem("accessToken") ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } : {}), Accept: "application/json" },
    credentials: "include",
    cache: "no-cache",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  return await res.json();
}


// Update user profile data
export async function updateUserProfile(profileData) {
  try {
    const res = await fetch(apiUrl("/me/profile"), {
      method: "PUT",
      headers: { 
        ...authHeaders(), 
        "Content-Type": "application/json",
        Accept: "application/json" 
      },
      body: JSON.stringify(profileData),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updatedProfile = await res.json();
    return updatedProfile;
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}
export async function getBillingSummary() {
  const res = await fetch(apiUrl("/billing/summary"), {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
    cache: "no-cache",
  });
  if (!res.ok) throw new Error("unauthorized");
  return res.json();
}

export async function getBillingUsage({ startISO, endISO, interval }) {
  const params = new URLSearchParams({
    start: startISO,
    end: endISO,
    interval: (interval || "daily").toLowerCase(),
  });
  const res = await fetch(apiUrl(`/billing/usage?${params.toString()}`), {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
    cache: "no-cache",
  });
  if (!res.ok) throw new Error("unauthorized");
  return res.json();
}

// Get all users (admin only)
export async function getAllUsers() {
  try {
    const res = await fetch(apiUrl("/admin/users"), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

// Get user details by ID (admin only)
export async function getUserDetails(userId) {
  try {
    const res = await fetch(apiUrl(`/admin/users/${userId}`), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
}

// Get all users with credits (admin only)
export async function getAllUsersWithCredits() {
  try {
    const res = await fetch(apiUrl("/admin/users/credits"), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch users with credits:", error);
    throw error;
  }
}

// Get deactivated users (admin only)
export async function getDeactivatedUsers() {
  try {
    const res = await fetch(apiUrl("/admin/users/deactivated"), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch deactivated users:", error);
    throw error;
  }
}

// Deactivate/Activate user (admin only)
export async function toggleUserStatus(userId, isActive) {
  try {
    const res = await fetch(apiUrl(`/admin/users/${userId}/status`), {
      method: "PUT",
      headers: { 
        ...authHeaders(), 
        "Content-Type": "application/json",
        Accept: "application/json" 
      },
      body: JSON.stringify({ is_active: isActive }),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to update user status:", error);
    throw error;
  }
}

// Get admin dashboard stats (admin only)
export async function getAdminStats() {
  try {
    const res = await fetch(apiUrl("/admin/stats"), {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw error;
  }
}

// Check if current user is admin
export async function checkAdminStatus() {
  try {
    const res = await fetch(apiUrl("/me"), {
      headers: { ...authHeaders(), Accept: "application/json" },
      credentials: "include",
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const userData = await res.json();
    return userData.is_admin === true || false;
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}
// ----------------------
// BLOGS
// ----------------------

// Public: list published posts
export async function getPublicBlogPosts(page = 1, limit = 12, q = "") {
  const params = new URLSearchParams({ page, limit });
  if (q) params.set("q", q);
  const res = await fetch(apiUrl(`/blog-posts?${params.toString()}`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Public: fetch one post by slug
export async function getPublicBlogPostBySlug(slug) {
  const res = await fetch(apiUrl(`/blog-posts/${slug}`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Admin: list all posts (drafts + published)
export async function getAdminBlogPosts() {
  const res = await fetch(apiUrl("/admin/blog-posts"), {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Admin: create a new post
export async function createBlogPost(post) {
  const res = await fetch(apiUrl("/admin/blog-posts"), {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Admin: update existing post
export async function updateBlogPost(id, post) {
  const res = await fetch(apiUrl(`/admin/blog-posts/${id}`), {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Admin: delete post
export async function deleteBlogPost(id) {
  const res = await fetch(apiUrl(`/admin/blog-posts/${id}`), {
    method: "DELETE",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return true;
}
// api.js (add these near your other helpers)
export async function enqueueBulk(file, smtp = true, workers = 12) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("smtp", String(smtp));
  fd.append("workers", String(workers));

  const res = await fetch(apiUrl("/validate-file?source=bulk"), {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: { ...authHeaders() }, // <-- IMPORTANT
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  return res.json(); // { jobid, chunks, status }
}

export async function getBulkStatus(jobid) {
  const res = await fetch(apiUrl(`/bulk/status/${jobid}`), {
    method: "GET",
    credentials: "include",
    headers: { ...authHeaders(), Accept: "application/json" }, // <-- IMPORTANT
    cache: "no-cache",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  return res.json(); // { status, total, done, chunks, files? }
}
