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
  // Clear all token variants used across the app so route guards & bootstrap
  // logic no longer think the user is logged in.
  localStorage.removeItem(TOKEN_KEY);          // 'auth_token'
  localStorage.removeItem('access_token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');

  // Also clear cached user profile
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  // Normalize: read any of the token keys that might have been set
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    null
  );
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
