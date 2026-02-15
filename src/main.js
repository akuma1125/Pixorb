// ══════════════════════════════════════════════
// PIXORB — Main Entry
// ══════════════════════════════════════════════

import './style.css';
import { initScene } from './scene.js';
import { registerRoute, initRouter } from './router.js';
import { renderHome } from './pages/home.js';
import { renderTasks } from './pages/tasks.js';
import { renderWallet } from './pages/wallet.js';

// Initialize Three.js 3D background
initScene();

// Register routes
registerRoute('/', renderHome);
registerRoute('/tasks', renderTasks);
registerRoute('/wallet', renderWallet);

// Start router
initRouter();
