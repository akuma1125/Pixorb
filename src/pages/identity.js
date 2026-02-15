// ══════════════════════════════════════════════
// PIXORB — Phase 1: Identity
// "identify yourself." + X handle input
// ══════════════════════════════════════════════

import { navigate } from '../router.js';

export function renderIdentity(container) {
    const el = document.createElement('div');
    el.className = 'glass-panel';
    el.innerHTML = `
    <h1>Pixorb</h1>
    <p class="phase-tagline">identify yourself.</p>
    <div class="input-group">
      <label for="handle-input">username / x handle</label>
      <input
        type="text"
        id="handle-input"
        class="input-field"
        placeholder="@"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <button class="btn-primary" id="identity-btn" disabled>
      <span>Continue</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  `;
    container.appendChild(el);

    const input = document.getElementById('handle-input');
    const btn = document.getElementById('identity-btn');

    input.addEventListener('input', () => {
        const val = input.value.trim();
        btn.disabled = val.length < 2;
    });

    btn.addEventListener('click', () => {
        const handle = input.value.trim();
        if (handle.length >= 2) {
            // Store handle for later use
            sessionStorage.setItem('pixorb_handle', handle);
            navigate('/tasks');
        }
    });

    // Enter key submits
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !btn.disabled) {
            btn.click();
        }
    });
}
