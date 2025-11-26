// api.js - Minimal changes (ONLY bulk functions fixed)
// ✅ All auth, login, admin, blog functions kept exactly as they were

// Centralized API base URL for the frontend.
export const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export function apiUrl(path) {
  const base = BASE_URL.replace(/\/$/, "");
  const full = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    console.debug("[apiUrl]", { base, path, full });
  } catch { }
  return full;
}

// NEW: expose site key to components
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

// Public utility: quick disposable/syntax check for signup
export async function checkEmailDisposable(email) {
  const url = apiUrl(`/utils/check-email?email=${encodeURIComponent(email)}`);
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, credentials: "include" });
  const data = await res.json();
  return data;
}

// ----------------------
// Auth helpers
// ----------------------
function authHeaders(tokenOverride) {
  const token =
    tokenOverride ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
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
    if (data && typeof data.remaining_credits === "number") {
      localStorage.setItem("credits", String(data.remaining_credits));
    }
    return data;
  } catch {
    return null;
  }
}

// ----------------------
// Auth APIs (UNCHANGED)
// ----------------------

export async function submitContact(form) {
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
  localStorage.removeItem("access_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");
};


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

// --- OAUTH HELPERS (UNCHANGED) ---
export function oauthStartUrl(provider) {
  const next = encodeURIComponent(`${window.location.origin}/oauth/callback`);
  return `${apiUrl(`/oauth/${provider}/start`)}?next=${next}`;
}

export async function finishOAuthLogin(token) {
  if (!token) throw new Error("Missing token");
  localStorage.setItem("accessToken", token);
  let me = null;
  try {
    if (typeof getMe === "function") me = await getMe();
  } catch { }
  if (me?.email) {
    localStorage.setItem("userEmail", me.email);
  }
  try {
    if (typeof refreshCredits === "function") await refreshCredits();
  } catch { }
  return true;
}

export function openOAuthPopup(provider) {
  const url = oauthStartUrl(provider);
  const w = 520, h = 600;
  const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
  const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
  window.open(url, "oauth", `width=${w},height=${h},left=${x},top=${y}`);
}

// Fetch user profile data for Team section (UNCHANGED)
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

// API helper to fetch one verification (UNCHANGED)
export async function getVerificationById(id) {
  const res = await fetch(apiUrl(`/verifications/${id}`), {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
    cache: "no-cache",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Update user profile data (UNCHANGED)
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

// Billing (UNCHANGED)
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

// Admin functions (ALL UNCHANGED)
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
// BLOGS (ALL UNCHANGED)
// ----------------------
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

export async function getPublicBlogPostBySlug(slug) {
  const res = await fetch(apiUrl(`/blog-posts/${slug}`), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getAdminBlogPosts() {
  const res = await fetch(apiUrl("/admin/blog-posts"), {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

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

// ==================== ✅ BULK VERIFICATION (FIXED - NO REDIS) ====================

/**
 * ✅ NEW: Upload CSV for bulk verification
 * Replaces old Redis-based uploadBulkFile
 */
export async function enqueueBulk(file, smtp = false, workers = 12, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('smtp', smtp ? 'true' : 'false');
  formData.append('workers', String(workers));
  if (options && typeof options.fileHash === "string" && options.fileHash) {
    formData.append("file_hash", options.fileHash);
  }
  if (options && typeof options.fileHashHex === "string" && options.fileHashHex) {
    formData.append("file_hash_hex", options.fileHashHex);
  }
  if (options && typeof options.fileHashBase64 === "string" && options.fileHashBase64) {
    formData.append("file_hash_base64", options.fileHashBase64);
    formData.append("file_signature", options.fileHashBase64);
  }
  if (options && typeof options.dedupe !== "undefined") {
    formData.append("dedupe", options.dedupe ? "true" : "false");
  }

  const res = await fetch(apiUrl("/validate-file"), {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const err = new Error(errorBody.detail || errorBody.message || 'Upload failed');
    if (typeof errorBody.credits_needed === "number") {
      err.creditsNeeded = errorBody.credits_needed;
    }
    if (typeof errorBody.credits_required === "number") {
      err.creditsNeeded = errorBody.credits_required;
    }
    if (typeof errorBody.credits_available === "number") {
      err.creditsAvailable = errorBody.credits_available;
    }
    if (typeof errorBody.credits_remaining === "number") {
      err.creditsAvailable = errorBody.credits_remaining;
    }
    if (typeof errorBody.additional_credits_needed === "number") {
      err.additionalCreditsNeeded = errorBody.additional_credits_needed;
    }
    err.meta = errorBody;
    throw err;
  }

  return await res.json();
}

/**
 * ✅ NEW: Get bulk job status (no Redis)
 * Normalized response format for BulkVerifier
 */
export async function getBulkStatus(jobid) {
  const res = await fetch(apiUrl(`/bulk/status/${jobid}`), {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    // read body for debugging
    const body = await res.text().catch(() => '');
    console.error(`[api] getBulkStatus failed`, { jobid, status: res.status, body });
    if (res.status === 401) throw new Error('unauthorized');
    throw new Error(`Failed to fetch job status (HTTP ${res.status})`);
  }

  const data = await res.json();

  // DEBUG: Log the full response to see what backend is actually returning
  try {
    console.debug("[api] getBulkStatus response", { jobid, fullResponse: data });
  } catch { }

  // Normalize response - handle different possible response formats
  let files = null;

  if (data.files) {
    files = data.files;
  } else if (data.result_files) {
    files = data.result_files;
  } else if (data.results_json || data.results_csv) {
    files = {
      results_json: data.results_json,
      results_csv: data.results_csv,
    };
  } else if (data.download_urls) {
    files = data.download_urls;
  } else if (data.download_url) {
    files = {
      results_json: data.download_url,
      results_csv: data.download_url_csv || data.download_url.replace('.json', '.csv'),
    };
  }

  // Log what we found for debugging
  if (!files) {
    console.warn("[api] getBulkStatus: No files found in response", {
      jobid,
      availableKeys: Object.keys(data),
      status: data.status
    });
  } else {
    try {
      console.debug("[api] getBulkStatus: Found files", { jobid, files });
    } catch { }
  }

  // Normalize response
  return {
    jobid: data.jobid || jobid,
    status: data.status || 'unknown',
    total: data.total || 0,
    done: data.done || 0,
    progress: data.progress || 0,
    chunks: data.chunks || 0,
    files: files,
    // NEW: Duplicate & Refund fields
    duplicates: data.duplicates ?? 0,
    new_emails: data.new_emails ?? 0,
    total_processed: data.total_processed ?? 0,
    refunded_credits: data.refunded_credits ?? 0,
    refund_success: data.refund_success ?? false,
  };
}

export async function fetchBulkResultsJSON(files) {
  if (!files || !files.results_json) {
    console.warn("[fetchBulkResultsJSON] No results_json URL");
    return [];
  }

  // Normalize path (convert backslashes to forward slashes)
  let path = String(files.results_json).replace(/\\/g, "/").trim();

  // If backend already gave us an absolute URL, use it as-is.
  // Otherwise, treat it as an API-relative path.
  let url;
  if (/^https?:\/\//i.test(path)) {
    url = path;
  } else {
    if (!path.startsWith("/")) path = `/${path}`;
    url = apiUrl(path);
  }

  // debug
  console.debug("[fetchBulkResultsJSON] fetching", url);

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[api] fetchBulkResultsJSON failed`, { url, status: res.status, body: text });
    if (res.status === 401) throw new Error('unauthorized');
    throw new Error(`Failed to fetch results JSON (status ${res.status})`);
  }

  const data = await res.json();

  // Handle both {results: [...]} and direct array formats
  if (data && data.results && Array.isArray(data.results)) {
    return data.results;
  }

  if (Array.isArray(data)) {
    return data;
  }

  console.warn("[fetchBulkResultsJSON] Unexpected format:", data);
  return [];
}

// ==================== SINGLE EMAIL & USER INFO (UNCHANGED) ====================

export const verifySingleEmail = async (email, smtp = false) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('smtp', smtp ? 'true' : 'false');

  const response = await fetch(apiUrl("/validate-email"), {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Verification failed');
  }

  return response.json();
};

export const getUserCredits = async () => {
  const response = await fetch(apiUrl("/me/credits"), {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }

  return response.json();
};

export const getRecentEmails = async (limit = 12) => {
  const response = await fetch(apiUrl(`/me/recent-emails?limit=${limit}`), {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent emails');
  }

  return response.json();
};

// ==================== BULK JOBS LIST (UNCHANGED) ====================

export const getBulkJobs = async () => {
  const response = await fetch(apiUrl("/bulk/jobs"), {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bulk jobs');
  }

  return response.json();
};

export const getBulkJobDetails = async (jobid) => {
  const response = await fetch(apiUrl(`/bulk/jobs/${jobid}`), {
    method: 'GET',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job details');
  }

  return response.json();
};

// ==================== LOGIN/REGISTER (UNCHANGED) ====================

export const login = async (email, password, recaptchaToken) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('recaptcha_token', recaptchaToken);

  const response = await fetch(apiUrl("/login"), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Login failed');
  }

  const data = await response.json();
  // <- UNIFY TOKEN STORAGE: store under access_token so authHeaders picks it up reliably.
  localStorage.setItem('access_token', data.access_token || data.token || data.accessToken || '');
  return data;
};


export const register = async (firstName, lastName, email, password) => {
  const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('last_name', lastName);
  formData.append('email', email);
  formData.append('password', password);

  const response = await fetch(apiUrl("/register"), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
};

// ==================== EXPORT ALL (Same as before) ====================
export default {
  // Bulk (✅ UPDATED)
  enqueueBulk,
  getBulkStatus,
  fetchBulkResultsJSON,
  getBulkJobs,
  getBulkJobDetails,

  // Single
  verifySingleEmail,

  // User
  getUserCredits,
  getRecentEmails,

  // Auth
  login,
  register,
  logout,
};