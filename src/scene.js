// ══════════════════════════════════════════════
// PIXORB — Shooting Stars Background (Canvas 2D)
// No Three.js — lightweight stars-only background
// ══════════════════════════════════════════════

let canvas, ctx;
let stars = [];
let shootingStars = [];
let animId;

class Star {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.8 + 0.3;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw(ctx, t) {
        const flicker = Math.sin(t * this.twinkleSpeed * 60 + this.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 255, 238, ${this.opacity * flicker})`;
        ctx.fill();
    }
}

class ShootingStar {
    constructor(w, h) {
        this.reset(w, h);
    }

    reset(w, h) {
        // Start from top or right edge
        if (Math.random() < 0.5) {
            this.x = Math.random() * w;
            this.y = -10;
        } else {
            this.x = w + 10;
            this.y = Math.random() * h * 0.5;
        }

        const angle = Math.PI * 0.65 + (Math.random() - 0.5) * 0.6;
        const speed = 3 + Math.random() * 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 0;
        this.maxLife = 40 + Math.random() * 80;
        this.tailLength = 12 + Math.random() * 18;
        this.brightness = 0.4 + Math.random() * 0.6;
        this.trail = [];
        this.size = 1.2 + Math.random() * 1.5;
    }

    update(w, h) {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;

        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.tailLength) {
            this.trail.pop();
        }

        if (this.life > this.maxLife || this.x < -50 || this.y > h + 50) {
            this.reset(w, h);
        }
    }

    draw(ctx) {
        if (this.trail.length < 2) return;

        const fadeIn = Math.min(this.life / 10, 1);
        const fadeOut = Math.max(1 - (this.life - this.maxLife + 20) / 20, 0);
        const alpha = this.brightness * fadeIn * fadeOut;

        for (let i = 0; i < this.trail.length - 1; i++) {
            const t = 1 - i / this.trail.length;
            const p = this.trail[i];
            const p2 = this.trail[i + 1];

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 210, ${alpha * t * 0.8})`;
            ctx.lineWidth = this.size * t;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Head glow
        const head = this.trail[0];
        const headAlpha = alpha * 0.6;
        const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
        gradient.addColorStop(0, `rgba(200, 255, 245, ${headAlpha})`);
        gradient.addColorStop(1, `rgba(0, 255, 204, 0)`);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

export function initScene() {
    canvas = document.getElementById('bg-canvas');
    ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create background stars
    const count = 1800;
    for (let i = 0; i < count; i++) {
        stars.push(new Star(canvas.width, canvas.height));
    }

    // Create shooting stars
    for (let i = 0; i < 10; i++) {
        const s = new ShootingStar(canvas.width, canvas.height);
        s.life = Math.random() * s.maxLife;
        shootingStars.push(s);
    }

    animate();
}

function animate() {
    animId = requestAnimationFrame(animate);
    const t = performance.now() / 1000;
    const w = canvas.width;
    const h = canvas.height;

    // Clear with deep dark background
    ctx.fillStyle = '#020817';
    ctx.fillRect(0, 0, w, h);

    // Subtle nebula glow
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6);
    grd.addColorStop(0, 'rgba(0, 60, 70, 0.12)');
    grd.addColorStop(0.5, 'rgba(0, 30, 50, 0.06)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Draw stars
    for (const star of stars) {
        star.draw(ctx, t);
    }

    // Draw shooting stars
    for (const ss of shootingStars) {
        ss.update(w, h);
        ss.draw(ctx);
    }
}

export function destroyScene() {
    if (animId) cancelAnimationFrame(animId);
}
