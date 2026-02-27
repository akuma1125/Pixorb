// ══════════════════════════════════════════════
// PIXORB — Main Entry
// ══════════════════════════════════════════════

import './style.css';
import { initScene } from './scene.js';
import { registerRoute, initRouter } from './router.js';
import { renderHome } from './pages/home.js';
import { renderRegister } from './pages/register.js';
import { renderConfirmation } from './pages/confirmation.js';

// Initialize Three.js 3D background
initScene();

// Register routes
registerRoute('/', renderHome);
registerRoute('/register', renderRegister);
registerRoute('/confirmation', renderConfirmation);

// Start router
initRouter();
