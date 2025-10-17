import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
    el.innerHTML = `<h2 style="margin-top:0;color:#ff7b7b">Runtime Error</h2><pre style="white-space:pre-wrap;">${String(message)}\n\n${String(stack||'')}</pre>`;
  } catch (e) {
    console.error('Failed to render error overlay', e);
  }
}

window.addEventListener('error', (ev) => {
  console.error('Global error caught:', ev.error || ev.message, ev.error && ev.error.stack);
  renderErrorOverlay(ev.error?.message || ev.message || 'Unknown error', ev.error?.stack);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
  renderErrorOverlay(ev.reason?.message || String(ev.reason) || 'Unhandled rejection', ev.reason?.stack || '');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
