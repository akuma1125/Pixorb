// ══════════════════════════════════════════════
// PIXORB — Three.js 3D Scene
// Smooth cyan orb with cursor-opposite glow + pixel face + headphones
// ══════════════════════════════════════════════

import * as THREE from 'three';

let scene, camera, renderer, canvas;
let orbGroup, orb, orbMaterial;
let leftPupil, rightPupil;
let glowLayers = [];
let stars = [];
let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let clock;

// ── Smooth orb shader with cursor-opposite glow hotspot ──
const orbVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const orbFragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vec3 baseCyan = vec3(0.0, 0.92, 0.82);
    vec3 deepCyan = vec3(0.0, 0.55, 0.52);
    vec3 darkSide = vec3(0.0, 0.25, 0.28);

    vec3 viewDir = normalize(-vPosition);
    vec3 n = normalize(vNormal);

    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);

    vec3 glowDir = normalize(vec3(-uMouse.x, -uMouse.y, 1.0));
    float glowDot = max(dot(n, glowDir), 0.0);
    float glowIntensity = pow(glowDot, 3.0);
    float broadGlow = pow(glowDot, 1.5) * 0.3;

    vec3 light1 = normalize(vec3(2.0, 2.5, 4.0));
    vec3 light2 = normalize(vec3(-2.5, 1.0, 3.0));
    float diff1 = max(dot(n, light1), 0.0);
    float diff2 = max(dot(n, light2), 0.0) * 0.4;
    float diffuse = diff1 + diff2;

    vec3 half1 = normalize(light1 + viewDir);
    float spec = pow(max(dot(n, half1), 0.0), 64.0) * 0.6;

    vec3 color = mix(darkSide, deepCyan, diffuse * 0.6 + 0.4);
    color = mix(color, baseCyan, diffuse * 0.5);

    vec3 glowColor = vec3(0.3, 1.0, 0.95);
    color += glowColor * glowIntensity * 0.7;
    color += vec3(0.0, 0.8, 0.7) * broadGlow;

    vec3 rimColor = vec3(0.2, 1.0, 0.9);
    color = mix(color, rimColor, fresnel * 0.45);

    color += vec3(0.5, 1.0, 0.95) * spec;

    float shimmer = sin(vUv.x * 40.0 + uTime * 1.5) * sin(vUv.y * 40.0 - uTime * 1.2);
    shimmer = smoothstep(0.7, 1.0, shimmer * 0.5 + 0.5) * 0.04;
    color += vec3(0.1, 0.5, 0.45) * shimmer;

    gl_FragColor = vec4(color, 0.96);
  }
`;

// ── Pixel block helper ──
function createPixelBlock(w, h, d, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.1,
    });
    return new THREE.Mesh(geo, mat);
}

// ── Build pixel-art face ──
function buildPixelFace(parent) {
    const dark = 0x111122;
    const R = 2.0;

    // Left eye
    const leftEye = createPixelBlock(0.42, 0.13, 0.14, dark);
    leftEye.position.set(-0.42, 0.32, R - 0.08);
    parent.add(leftEye);

    // Right eye
    const rightEye = createPixelBlock(0.42, 0.13, 0.14, dark);
    rightEye.position.set(0.35, 0.32, R - 0.08);
    parent.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.BoxGeometry(0.12, 0.12, 0.08);
    const pupilMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0,
        metalness: 0.6,
    });

    leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.1);
    leftEye.add(leftPupil);

    rightPupil = new THREE.Mesh(pupilGeo.clone(), pupilMat.clone());
    rightPupil.position.set(0, 0, 0.1);
    rightEye.add(rightPupil);

    // Nose pixels
    const nose = createPixelBlock(0.1, 0.1, 0.1, dark);
    nose.position.set(-0.12, 0.08, R);
    parent.add(nose);

    const nose2 = createPixelBlock(0.1, 0.1, 0.1, dark);
    nose2.position.set(-0.02, 0.1, R);
    parent.add(nose2);

    // ── Face features below nose ──
    const S = 0.14;
    const faceZ = R + 0.02;

    function placePixel(x, y, z, color, size) {
        const s = size || S;
        const block = createPixelBlock(s, s, s, color);
        block.position.set(x, y, z);
        parent.add(block);
    }

    // ── Mustache — handlebar shape ──
    // Center under nose
    placePixel(-0.07, -0.05, faceZ, dark);
    placePixel(0.07, -0.05, faceZ, dark);
    // Sides out
    placePixel(-0.21, -0.05, faceZ, dark);
    placePixel(0.21, -0.05, faceZ, dark);
    // Angled outward
    placePixel(-0.35, -0.08, faceZ, dark);
    placePixel(0.35, -0.08, faceZ, dark);
    // Tips curling down
    placePixel(-0.49, -0.14, faceZ, dark);
    placePixel(0.49, -0.14, faceZ, dark);
    placePixel(-0.49, -0.25, faceZ - 0.02, dark);
    placePixel(0.49, -0.25, faceZ - 0.02, dark);

    // ── Mouth — simple thin line ──
    const mouthGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.28, -0.2, faceZ + 0.01),
        new THREE.Vector3(0.28, -0.2, faceZ + 0.01),
    ]);
    const mouthLine = new THREE.Line(mouthGeo, new THREE.LineBasicMaterial({
        color: dark,
        linewidth: 2,
    }));
    parent.add(mouthLine);

    // ── Beard — triangular pixel pattern ──
    // Top row (widest, 6 blocks)
    placePixel(-0.35, -0.38, faceZ - 0.03, dark);
    placePixel(-0.21, -0.38, faceZ - 0.03, dark);
    placePixel(-0.07, -0.38, faceZ - 0.03, dark);
    placePixel(0.07, -0.38, faceZ - 0.03, dark);
    placePixel(0.21, -0.38, faceZ - 0.03, dark);
    placePixel(0.35, -0.38, faceZ - 0.03, dark);
    // Middle row (4 blocks)
    placePixel(-0.21, -0.52, faceZ - 0.06, dark);
    placePixel(-0.07, -0.52, faceZ - 0.06, dark);
    placePixel(0.07, -0.52, faceZ - 0.06, dark);
    placePixel(0.21, -0.52, faceZ - 0.06, dark);
    // Bottom point (2 blocks)
    placePixel(-0.07, -0.66, faceZ - 0.1, dark);
    placePixel(0.07, -0.66, faceZ - 0.1, dark);

    // ── Mic boom — from right mustache tip to headphone earpiece ──
    // Earpiece center is at (1.85, -0.6, 0.5)
    const micStartX = 0.49, micStartY = -0.25;
    const micEndX = 1.65, micEndY = -0.6;
    const micSteps = 14;
    const micZStart = faceZ - 0.02;
    const micZEnd = 0.5;

    for (let i = 0; i <= micSteps; i++) {
        const t = i / micSteps;
        const x = micStartX + (micEndX - micStartX) * t;
        const y = micStartY + (micEndY - micStartY) * t - Math.sin(t * Math.PI) * 0.12;
        const z = micZStart + (micZEnd - micZStart) * t;
        placePixel(x, y, z, dark, S * 0.8);
    }
}

// ── Build pixel headphones (all box geometry) ──
function buildHeadphones(parent) {
    const hpDark = 0x0d0d14;
    const hpAccent = 0x003838;
    const S = 0.14;

    // ── Headband arc — pixel blocks along an arc path ──
    const arcSteps = 18;
    const arcRadius = 2.15;
    const arcStart = Math.PI * 0.35;
    const arcEnd = Math.PI * 0.95;

    for (let i = 0; i <= arcSteps; i++) {
        const t = i / arcSteps;
        const angle = arcStart + (arcEnd - arcStart) * t;
        const x = Math.cos(angle) * arcRadius;
        const y = Math.sin(angle) * arcRadius;
        const z = 0.25 + Math.sin(t * Math.PI) * 0.1;

        const block = createPixelBlock(S, S, S, hpDark);
        block.position.set(x, y, z);
        parent.add(block);
    }

    // ── Right earpiece — pixel cluster forming a circle ──
    const earCenterX = 1.85;
    const earCenterY = -0.6;
    const earCenterZ = 0.5;

    const earPixels = [
        [0, 0], [0, 1], [0, -1],
        [-1, 0], [-1, 1], [-1, -1],
        [1, 0], [1, 1], [1, -1],
        [0, 2], [0, -2], [-1, 2], [-1, -2],
        [2, 0], [2, 1], [2, -1],
    ];

    earPixels.forEach(([dx, dy]) => {
        const block = createPixelBlock(S, S, S * 0.7, hpDark);
        block.position.set(
            earCenterX + dx * S,
            earCenterY + dy * S,
            earCenterZ
        );
        parent.add(block);
    });

    // Earpiece inner accent
    const innerPixels = [
        [0, 0], [0, 1], [0, -1],
        [-1, 0], [1, 0],
    ];
    innerPixels.forEach(([dx, dy]) => {
        const block = createPixelBlock(S * 0.7, S * 0.7, S * 0.4, hpAccent);
        block.position.set(
            earCenterX + dx * S,
            earCenterY + dy * S,
            earCenterZ + S * 0.5
        );
        block.material.emissive = new THREE.Color(0x004a4a);
        block.material.emissiveIntensity = 0.4;
        parent.add(block);
    });

    // Center void pixel
    const voidBlock = createPixelBlock(S * 0.6, S * 0.6, S * 0.3, 0x030308);
    voidBlock.position.set(earCenterX, earCenterY, earCenterZ + S * 0.6);
    parent.add(voidBlock);
}

// ── Shooting Star ──
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        const side = Math.random();
        if (side < 0.5) {
            this.x = (Math.random() - 0.5) * 40;
            this.y = 10 + Math.random() * 5;
        } else {
            this.x = 20 + Math.random() * 5;
            this.y = (Math.random() - 0.5) * 25;
        }
        this.z = -5 - Math.random() * 15;

        const angle = Math.PI + (Math.random() - 0.5) * 1.2;
        const speed = 0.08 + Math.random() * 0.12;
        this.vx = Math.cos(angle) * speed;
        this.vy = -Math.abs(Math.sin(angle)) * speed * 0.6;

        this.life = 0;
        this.maxLife = 60 + Math.random() * 100;
        this.tailLength = 10 + Math.random() * 14;
        this.brightness = 0.4 + Math.random() * 0.6;

        const positions = new Float32Array(this.tailLength * 3);
        for (let i = 0; i < this.tailLength; i++) {
            positions[i * 3] = this.x;
            positions[i * 3 + 1] = this.y;
            positions[i * 3 + 2] = this.z;
        }

        const colors = new Float32Array(this.tailLength * 3);
        for (let i = 0; i < this.tailLength; i++) {
            const t = i / this.tailLength;
            colors[i * 3] = 0.3 * (1 - t);
            colors[i * 3 + 1] = 1.0 * (1 - t);
            colors[i * 3 + 2] = 0.9 * (1 - t);
        }

        if (this.geometry) this.geometry.dispose();
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        if (!this.material) {
            this.material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: this.brightness,
                blending: THREE.AdditiveBlending,
                linewidth: 1,
            });
        }
        this.material.opacity = this.brightness;

        if (!this.line) {
            this.line = new THREE.Line(this.geometry, this.material);
            scene.add(this.line);
        } else {
            this.line.geometry.dispose();
            this.line.geometry = this.geometry;
        }
    }

    update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;

        const pos = this.geometry.attributes.position.array;
        for (let i = (this.tailLength - 1) * 3; i >= 3; i -= 3) {
            pos[i] = pos[i - 3];
            pos[i + 1] = pos[i - 2];
            pos[i + 2] = pos[i - 1];
        }
        pos[0] = this.x;
        pos[1] = this.y;
        pos[2] = this.z;
        this.geometry.attributes.position.needsUpdate = true;

        const fadeIn = Math.min(this.life / 15, 1);
        const fadeOut = Math.max(1 - (this.life - this.maxLife + 30) / 30, 0);
        this.material.opacity = this.brightness * fadeIn * fadeOut;

        if (this.life > this.maxLife) {
            this.reset();
        }
    }
}

// ── Initialize Scene ──
export function initScene() {
    canvas = document.getElementById('bg-canvas');
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.02);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 5.8);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    // ── Background Stars ──
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2500;
    const starsPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
        starsPos[i * 3] = (Math.random() - 0.5) * 70;
        starsPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
        starsPos[i * 3 + 2] = -10 - Math.random() * 35;
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starsPos, 3));

    const starsMat = new THREE.PointsMaterial({
        color: 0x66ffee,
        size: 0.06,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // ── Orb Group ──
    orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // ── Smooth Cyan Orb ──
    const orbGeo = new THREE.SphereGeometry(2.0, 64, 64);
    orbMaterial = new THREE.ShaderMaterial({
        vertexShader: orbVertexShader,
        fragmentShader: orbFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
        },
        transparent: true,
    });
    orb = new THREE.Mesh(orbGeo, orbMaterial);
    orbGroup.add(orb);

    // ── Glow Layers ──
    const glowSizes = [2.22, 2.48, 2.8, 3.2];
    const glowColors = [0x00ffcc, 0x00eebb, 0x00ccaa, 0x009988];
    const glowOpacities = [0.07, 0.045, 0.028, 0.015];

    for (let i = 0; i < glowSizes.length; i++) {
        const gGeo = new THREE.IcosahedronGeometry(glowSizes[i], 3);
        const gMat = new THREE.MeshBasicMaterial({
            color: glowColors[i],
            transparent: true,
            opacity: glowOpacities[i],
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        const gMesh = new THREE.Mesh(gGeo, gMat);
        orbGroup.add(gMesh);
        glowLayers.push(gMesh);
    }

    // ── Pixel Face ──
    buildPixelFace(orbGroup);

    // ── Headphones ──
    buildHeadphones(orbGroup);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x335555, 1.0));

    const keyLight = new THREE.DirectionalLight(0x00ffdd, 1.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00aacc, 0.6);
    fillLight.position.set(-3, 1, 3);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0x00ffdd, 5, 20);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00ccaa, 2.5, 16);
    pointLight2.position.set(-4, -2, 4);
    scene.add(pointLight2);

    const rimLight = new THREE.PointLight(0x007766, 3, 14);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    const backLight = new THREE.PointLight(0x004466, 3, 15);
    backLight.position.set(0, 1, -5);
    scene.add(backLight);

    // ── Shooting Stars ──
    for (let i = 0; i < 12; i++) {
        const star = new ShootingStar();
        star.life = Math.random() * star.maxLife;
        stars.push(star);
    }

    // ── Events ──
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });
    window.addEventListener('resize', onResize);

    animate();
}

function onMouseMove(e) {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetMouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (targetMouse.x - mouse.x) * 0.06;
    mouse.y += (targetMouse.y - mouse.y) * 0.06;

    // Update shader uniforms
    orbMaterial.uniforms.uTime.value = t;
    orbMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Breathe
    const breathe = 1 + Math.sin(t * 1.2) * 0.012;
    orbGroup.scale.set(breathe, breathe, breathe);

    // Float
    orbGroup.position.y = Math.sin(t * 0.7) * 0.08;
    orbGroup.position.x = Math.cos(t * 0.4) * 0.05;

    // Gentle rotation
    orbGroup.rotation.y += 0.0006;
    orbGroup.rotation.y += (mouse.x * 0.1 - orbGroup.rotation.y) * 0.005;
    orbGroup.rotation.x += (-mouse.y * 0.06 - orbGroup.rotation.x) * 0.005;

    // Pupils track cursor
    if (leftPupil && rightPupil) {
        const range = 0.13;
        const tpx = mouse.x * range;
        const tpy = mouse.y * range;
        leftPupil.position.x += (tpx - leftPupil.position.x) * 0.1;
        leftPupil.position.y += (tpy - leftPupil.position.y) * 0.1;
        rightPupil.position.x += (tpx - rightPupil.position.x) * 0.1;
        rightPupil.position.y += (tpy - rightPupil.position.y) * 0.1;
    }

    // Glow layer pulse
    for (let i = 0; i < glowLayers.length; i++) {
        const base = [0.07, 0.045, 0.028, 0.015][i];
        glowLayers[i].material.opacity = base + Math.sin(t * 1.5 + i * 0.8) * base * 0.35;
    }

    // Stars
    for (const star of stars) {
        star.update();
    }

    renderer.render(scene, camera);
}

export function destroyScene() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
}
