// ══════════════════════════════════════════════
// PIXORB — Wallet Submission Page
// ══════════════════════════════════════════════

export function renderWallet(container) {
    const el = document.createElement('div');
    el.className = 'glass-panel';
    el.id = 'wallet-panel';
    el.innerHTML = `
    <h1>Pixorb</h1>
    <h2>Submit Wallet</h2>
    <p>Enter your Ethereum wallet address to join the Pixorb allowlist.</p>
    <div class="input-group">
      <label for="wallet-input">Wallet Address</label>
      <input
        type="text"
        id="wallet-input"
        class="input-field"
        placeholder="0x..."
        autocomplete="off"
        spellcheck="false"
      />
      <p class="input-error" id="wallet-error">Please enter a valid Ethereum address (0x + 40 hex characters)</p>
    </div>
    <button class="btn-primary" id="submit-wallet-btn">
      <span>Submit</span>
    </button>
  `;
    container.appendChild(el);

    const input = document.getElementById('wallet-input');
    const btn = document.getElementById('submit-wallet-btn');
    const error = document.getElementById('wallet-error');

    const ethRegex = /^0x[a-fA-F0-9]{40}$/;

    input.addEventListener('input', () => {
        input.classList.remove('error');
        error.classList.remove('visible');
    });

    btn.addEventListener('click', async () => {
        const address = input.value.trim();

        if (!ethRegex.test(address)) {
            input.classList.add('error');
            error.classList.add('visible');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span>Submitting...</span>';

        try {
            const res = await fetch('/api/wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            });

            const data = await res.json();

            if (res.ok) {
                showSuccess(container);
            } else {
                if (data.error === 'duplicate') {
                    showSuccess(container, 'This wallet is already on the allowlist!');
                } else {
                    error.textContent = data.message || 'Submission failed. Please try again.';
                    error.classList.add('visible');
                    btn.disabled = false;
                    btn.innerHTML = '<span>Submit</span>';
                }
            }
        } catch (err) {
            error.textContent = 'Network error. Please try again.';
            error.classList.add('visible');
            btn.disabled = false;
            btn.innerHTML = '<span>Submit</span>';
        }
    });
}

function showSuccess(container, message) {
    const panel = document.getElementById('wallet-panel');
    panel.classList.add('page-exit');

    setTimeout(() => {
        container.innerHTML = '';

        const el = document.createElement('div');
        el.className = 'glass-panel';
        el.innerHTML = `
      <div class="success-icon">✓</div>
      <h1>Pixorb</h1>
      <h2>You're In</h2>
      <p>${message || 'Your wallet has been added to the Pixorb allowlist. Stay tuned!'}</p>
    `;
        container.appendChild(el);
    }, 350);
}
