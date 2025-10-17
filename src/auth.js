// Minimal client-side auth helper.
// In production this should talk to a real backend issuing signed JWTs.
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function makeToken() {
  // simple random token (not secure) - placeholder for real backend JWT
  return Math.random().toString(36).slice(2) + '.' + Date.now().toString(36);
}

export function loginUser({ email, name }) {
  const token = makeToken();
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const user = { email, name, expires };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getUser() {
  const u = localStorage.getItem(USER_KEY);
  if (!u) return null;
  try {
    const parsed = JSON.parse(u);
    if (parsed.expires && parsed.expires < Date.now()) {
      // expired
      logout();
      return null;
    }
    return parsed;
  } catch (e) {
    logout();
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

// simple export default
export default {
  loginUser,
  logout,
  getToken,
  getUser,
  isAuthenticated,
};
