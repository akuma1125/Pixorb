// ══════════════════════════════════════════════
// PIXORB — Phase 2: Social Tasks (Degen Edition)
// Link must be clicked before task can be marked complete
// ══════════════════════════════════════════════

import { navigate } from '../router.js';

const tasks = [
  {
    id: 'follow',
    label: 'Follow <a href="https://twitter.com/Pixorb" target="_blank" rel="noopener">PIXORB</a>',
    icon: '👾',
  },
  {
    id: 'like',
    label: 'Like the <a href="https://x.com/pixorb/status/2024151977609891874" target="_blank" rel="noopener">pinned tweet</a>',
    icon: '❤️',
  },
  {
    id: 'quote',
    label: 'Quote the <a href="https://x.com/pixorb/status/2024151977609891874" target="_blank" rel="noopener">pinned tweet</a>',
    caption: 'caption: "pixorb degen" & tag 3 orbs',
    icon: '🔁',
    requiresUrl: true,
  },
];

export function renderTasks(container) {
  const completed = new Set();
  const linkClicked = new Set();

  const el = document.createElement('div');
  el.className = 'glass-panel';
  el.innerHTML = `
    <h1>Pixorb</h1>
    <h2>prove you're degen.</h2>
    <ul class="task-list" id="task-list">
      ${tasks
      .map(
        (task) => `
        <li class="task-item" data-id="${task.id}">
          <div class="task-checkbox">
            <span class="task-checkbox-tick">✓</span>
          </div>
          <div class="task-content">
            <span class="task-icon">${task.icon}</span>
            <span class="task-label">${task.label}</span>
            ${task.caption ? `<span class="task-caption">${task.caption}</span>` : ''}
            ${task.requiresUrl ? `<input class="quote-url-input" data-task-id="${task.id}" type="url" placeholder="paste your quote tweet link" autocomplete="off" />` : ''}
          </div>
        </li>
      `
      )
      .join('')}
    </ul>
    <p class="task-hint" id="task-hint"></p>
    <button class="btn-primary" id="continue-btn" disabled>
      <span>Continue</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  `;
  container.appendChild(el);

  const continueBtn = document.getElementById('continue-btn');
  const hintEl = document.getElementById('task-hint');
  const taskItems = document.querySelectorAll('.task-item');
  const quoteTweetUrls = {};

  function updateContinue() {
    continueBtn.disabled = completed.size < tasks.length;
  }

  function showHint(msg) {
    hintEl.textContent = msg;
    hintEl.classList.add('visible');
    clearTimeout(hintEl._timeout);
    hintEl._timeout = setTimeout(() => {
      hintEl.classList.remove('visible');
    }, 3000);
  }

  taskItems.forEach((item) => {
    const id = item.dataset.id;

    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', () => {
        linkClicked.add(id);
        item.classList.add('link-visited');
      });
    }

    const urlInput = item.querySelector('.quote-url-input');
    if (urlInput) {
      urlInput.addEventListener('click', (e) => e.stopPropagation());
      urlInput.addEventListener('input', () => {
        quoteTweetUrls[id] = urlInput.value.trim();
      });
    }

    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return;
      if (e.target.classList.contains('quote-url-input')) return;

      if (!linkClicked.has(id)) {
        showHint('click the link first, degen');
        item.classList.add('shake');
        setTimeout(() => item.classList.remove('shake'), 500);
        return;
      }

      const task = tasks.find((t) => t.id === id);
      if (task && task.requiresUrl && !quoteTweetUrls[id]) {
        showHint('paste your quote tweet link first');
        item.classList.add('shake');
        setTimeout(() => item.classList.remove('shake'), 500);
        if (urlInput) urlInput.focus();
        return;
      }

      if (completed.has(id)) {
        completed.delete(id);
        item.classList.remove('completed');
      } else {
        completed.add(id);
        item.classList.add('completed');
      }

      updateContinue();
    });
  });

  continueBtn.addEventListener('click', () => {
    if (completed.size >= tasks.length) {
      navigate('/wallet');
    }
  });
}
