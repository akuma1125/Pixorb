// ══════════════════════════════════════════════
// PIXORB — Home Page (5s delay entrance)
// ══════════════════════════════════════════════

import { navigate } from '../router.js';

export function renderHome(container) {
    const el = document.createElement('div');
    el.className = 'glass-panel home-panel delayed';
    el.innerHTML = `
    <h1>Pixorb</h1>
    <p class="logo-subtitle">Enter the Orb</p>
    <button class="btn-primary" id="enter-btn">
      <span>Enter</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  `;
    container.appendChild(el);

    // 5-second delay — let users see the 3D scene first
    setTimeout(() => {
        el.classList.remove('delayed');
        el.classList.add('revealed');
    }, 5000);

    document.getElementById('enter-btn').addEventListener('click', () => {
        navigate('/tasks');
    });
}
