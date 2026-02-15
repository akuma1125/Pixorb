// ══════════════════════════════════════════════
// PIXORB — Main Entry
// ══════════════════════════════════════════════

import './style.css';
import { initScene } from './scene.js';
import { registerRoute, initRouter } from './router.js';
import { renderHome } from './pages/home.js';
import { renderIdentity } from './pages/identity.js';
import { renderTasks } from './pages/tasks.js';
import { renderWallet } from './pages/wallet.js';
import { renderConfirmation } from './pages/confirmation.js';

// Initialize Three.js 3D background
initScene();

// Register routes
registerRoute('/', renderHome);
registerRoute('/identity', renderIdentity);
registerRoute('/tasks', renderTasks);
registerRoute('/wallet', renderWallet);
registerRoute('/confirmation', renderConfirmation);

// Start router
initRouter();
