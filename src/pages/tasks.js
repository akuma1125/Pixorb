// ══════════════════════════════════════════════
// PIXORB — Twitter Tasks Page
// Link must be clicked before task can be marked complete
// ══════════════════════════════════════════════

import { navigate } from '../router.js';

const tasks = [
  {
    id: 'follow',
    label: 'Follow <a href="https://twitter.com/Pixorb" target="_blank" rel="noopener">@Pixorb</a> on Twitter',
  },
  {
    id: 'retweet',
    label: 'Retweet the <a href="https://twitter.com/Pixorb" target="_blank" rel="noopener">pinned tweet</a>',
  },
  {
    id: 'like',
    label: 'Like the <a href="https://twitter.com/Pixorb" target="_blank" rel="noopener">pinned tweet</a>',
  },
];

export function renderTasks(container) {
  const completed = new Set();
  const linkClicked = new Set(); // tracks which task links have been clicked

  const el = document.createElement('div');
  el.className = 'glass-panel';
  el.innerHTML = `
    <h1>Pixorb</h1>
    <h2>Complete Tasks</h2>
    <ul class="task-list" id="task-list">
      ${tasks
      .map(
        (task) => `
        <li class="task-item" data-id="${task.id}">
          <div class="task-checkbox">
            <span class="task-checkbox-tick">✓</span>
          </div>
          <span class="task-label">${task.label}</span>
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

    // Track link clicks within this task
    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', (e) => {
        // Let the link open normally, but mark as visited
        linkClicked.add(id);
        // Small visual hint that they can now check the box
        item.classList.add('link-visited');
      });
    }

    // Click on the task item (not the link) to toggle completion
    item.addEventListener('click', (e) => {
      // If they clicked the link itself, don't toggle — let it navigate
      if (e.target.tagName === 'A') return;

      // Must click link first
      if (!linkClicked.has(id)) {
        showHint('Click the link first to complete this task');
        // Shake animation
        item.classList.add('shake');
        setTimeout(() => item.classList.remove('shake'), 500);
        return;
      }

      // Toggle completion
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
