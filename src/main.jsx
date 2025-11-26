import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from "axios";

// make axios available globally (Login.jsx expects window.axios sometimes)
window.axios = axios;

// set header from any persisted key (auth_token, token, access_token)
const _startupToken = localStorage.getItem("auth_token") || localStorage.getItem("token") || localStorage.getItem("access_token");
if (_startupToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${_startupToken}`;
  console.info("[Startup] axios Authorization set from localStorage");
}

// keep header updated if login happens elsewhere in the app (Login.jsx dispatches auth:login)
window.addEventListener("auth:login", (ev) => {
  try {
    const t = ev?.detail?.token;
    if (t) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      console.info("[Startup] axios Authorization updated from auth:login event");
    }
  } catch (e) {
    console.warn("auth:login handler error", e);
  }
});

// Render an error overlay into the page so runtime exceptions are visible
function renderErrorOverlay(message, stack) {
  try {
    let el = document.getElementById('error-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'error-overlay';
      Object.assign(el.style, {
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '20px',
        zIndex: 999999,
        fontFamily: 'Menlo, monospace',
        overflow: 'auto'
      });
      document.body.appendChild(el);
    }
    el.innerHTML = `<h2 style="margin-top:0;color:#ff7b7b">Runtime Error</h2><pre style="white-space:pre-wrap;">${String(message)}\n\n${String(stack || '')}</pre>`;
  } catch (e) {
    console.error('Failed to render error overlay', e);
  }
}

window.addEventListener('error', (ev) => {
  // Ignore known benign errors from extensions or 3rd party scripts
  if (ev.message?.includes('message channel closed') || ev.message?.includes('Timeout (u)')) {
    console.warn('Ignored global error:', ev.message);
    return;
  }
  console.error('Global error caught:', ev.error || ev.message, ev.error && ev.error.stack);
  renderErrorOverlay(ev.error?.message || ev.message || 'Unknown error', ev.error?.stack);
});

window.addEventListener('unhandledrejection', (ev) => {
  // Ignore known benign errors
  const reason = ev.reason?.message || String(ev.reason);
  if (reason.includes('Timeout (u)') || reason.includes('message channel closed')) {
    console.warn('Ignored unhandled rejection:', reason);
    return;
  }

  console.error('Unhandled promise rejection:', ev.reason);
  renderErrorOverlay(reason || 'Unhandled rejection', ev.reason?.stack || '');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
