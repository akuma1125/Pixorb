// ══════════════════════════════════════════════
// PIXORB — Main Entry
// ══════════════════════════════════════════════

import './style.css';
import { initScene } from './scene.js';
import { registerRoute, initRouter } from './router.js';
import { renderHome } from './pages/home.js';

// Initialize Three.js 3D background
initScene();

// Register routes
registerRoute('/', renderHome);

// Start router
initRouter();
