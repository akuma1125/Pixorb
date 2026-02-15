// ══════════════════════════════════════════════
// PIXORB — Phase 3: Wallet (Connect or Paste)
// Auto-submits after wallet connect
// ══════════════════════════════════════════════

import { navigate } from '../router.js';

export function renderWallet(container) {
    const el = document.createElement('div');
    el.className = 'glass-panel';
    el.id = 'wallet-panel';

    const hasProvider = typeof window.ethereum !== 'undefined';

    el.innerHTML = `
    <h1>Pixorb</h1>
    <p class="phase-tagline">early wallets detected.</p>

    ${hasProvider ? `
    <button class="btn-primary btn-connect" id="connect-wallet-btn">
      <span>🔗 Connect Wallet</span>
    </button>
    <div class="divider-or"><span>or</span></div>
    ` : ''}

    <div class="input-group">
      <label for="wallet-input">paste evm address</label>
      <input
        type="text"
        id="wallet-input"
        class="input-field"
        placeholder="0x..."
        autocomplete="off"
        spellcheck="false"
      />
      <p class="input-error" id="wallet-error">enter a valid evm address (0x + 40 hex chars)</p>
    </div>
    <button class="btn-primary" id="submit-wallet-btn">
      <span>Submit</span>
    </button>
  `;
    container.appendChild(el);

    const input = document.getElementById('wallet-input');
    const btn = document.getElementById('submit-wallet-btn');
    const error = document.getElementById('wallet-error');
    const connectBtn = document.getElementById('connect-wallet-btn');

    const ethRegex = /^0x[a-fA-F0-9]{40}$/;

    // ── Submit wallet to API ──
    async function submitWallet(address) {
        if (!ethRegex.test(address)) {
            input.classList.add('error');
            error.textContent = 'enter a valid evm address (0x + 40 hex chars)';
            error.classList.add('visible');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span>submitting...</span>';

        const handle = sessionStorage.getItem('pixorb_handle') || '';

        try {
            const res = await fetch('/api/wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, handle }),
            });

            const data = await res.json();

            if (res.ok || data.error === 'duplicate') {
                sessionStorage.setItem('pixorb_wallet', address);
                navigate('/confirmation');
            } else {
                error.textContent = data.message || 'submission failed. try again.';
                error.classList.add('visible');
                btn.disabled = false;
                btn.innerHTML = '<span>Submit</span>';
            }
        } catch (err) {
            error.textContent = 'network error. try again.';
            error.classList.add('visible');
            btn.disabled = false;
            btn.innerHTML = '<span>Submit</span>';
        }
    }

    // ── Connect wallet via injected provider ──
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                connectBtn.innerHTML = '<span>connecting...</span>';
                connectBtn.disabled = true;

                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });

                if (accounts && accounts.length > 0) {
                    const addr = accounts[0];
                    input.value = addr;
                    input.classList.add('connected');
                    connectBtn.innerHTML = '<span>✓ connected</span>';
                    connectBtn.classList.add('btn-success');

                    // Auto-submit after successful connection
                    await submitWallet(addr);
                }
            } catch (err) {
                connectBtn.innerHTML = '<span>🔗 Connect Wallet</span>';
                connectBtn.disabled = false;
                error.textContent = 'wallet connection rejected';
                error.classList.add('visible');
            }
        });
    }

    input.addEventListener('input', () => {
        input.classList.remove('error');
        error.classList.remove('visible');
    });

    btn.addEventListener('click', () => {
        submitWallet(input.value.trim());
    });

    // Enter key submits
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !btn.disabled) {
            btn.click();
        }
    });
}
