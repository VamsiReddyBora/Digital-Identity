/**
 * ==========================================================================
 * 3D WebGL Embedded Microcontroller & Forest Bio-Particle Engine
 * (Ultra-Optimized for Cold Laptop CPU/GPU & 60fps Mobile Performance)
 *
 * Performance Optimizations:
 * 1. Low GPU Fillrate: Clamped DPR (1.0 on mobile, 1.25 on desktop).
 * 2. Minimal Textures: Shared canvas sprites (8 curated tokens instead of 52).
 * 3. Smart Visibility: Pauses 100% when Hero section is out of viewport.
 * 4. Lightweight BufferGeometry: Fast single-draw call particles.
 * ==========================================================================
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;

  // Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.25));

  // Mouse & Scroll State
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 };
  let scrollY = 0;
  let targetScrollY = 0;

  if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
      mouse.worldX = mouse.targetX * 22;
      mouse.worldY = mouse.targetY * 16;
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  // ==========================================================================
  // 1. CLEAN ATMOSPHERIC PARTICLE MATRIX (Low draw-call points)
  // ==========================================================================
  const icGroup = new THREE.Group();
  icGroup.position.set(0, -5, -12);

  const ambientNodeCount = isMobile ? 24 : 40;
  const ambientNodeGeo = new THREE.BufferGeometry();
  const ambientNodePos = new Float32Array(ambientNodeCount * 3);
  for (let i = 0; i < ambientNodeCount; i++) {
    const angle = (i / ambientNodeCount) * Math.PI * 2;
    const r = 9 + Math.random() * 8;
    ambientNodePos[i * 3] = Math.cos(angle) * r;
    ambientNodePos[i * 3 + 1] = Math.sin(angle) * (r * 0.6) - 4;
    ambientNodePos[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  ambientNodeGeo.setAttribute('position', new THREE.BufferAttribute(ambientNodePos, 3));
  const ambientNodeMat = new THREE.PointsMaterial({ 
    size: 0.4, 
    color: 0x34d399, 
    transparent: true, 
    opacity: 0.4 
  });
  const ambientNodesMesh = new THREE.Points(ambientNodeGeo, ambientNodeMat);
  icGroup.add(ambientNodesMesh);
  scene.add(icGroup);

  // ==========================================================================
  // 2. LIGHTWEIGHT FLOATING CODE TOKENS (Desktop only, 8 curated items)
  // ==========================================================================
  const tokenSprites = [];

  if (!isMobile) {
    const curatedTokens = [
      'uint32_t *reg',
      '0xDEADBEEF',
      'ISR(TIMER1_COMPA)',
      'SPI_Transmit()',
      'RTOS_TaskCreate()',
      'ARM Cortex-M4',
      '0b10110010',
      'MCU_Clock_Init()'
    ];

    const tokenPalette = ['#059669', '#10b981', '#7c3aed', '#0284c7'];

    function createLightweightSprite(text, color) {
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 64;
      const ctx = textCanvas.getContext('2d');

      ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(textCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.75
      });

      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(5.5, 1.4, 1);
      return sprite;
    }

    curatedTokens.forEach((text, i) => {
      const color = tokenPalette[i % tokenPalette.length];
      const sprite = createLightweightSprite(text, color);

      let baseX, baseY, baseZ;
      do {
        const radius = 14 + Math.random() * 24;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        baseX = radius * Math.sin(phi) * Math.cos(theta);
        baseY = (radius * Math.sin(phi) * Math.sin(theta)) * 0.8;
        baseZ = (radius * Math.cos(phi)) - 8;
      } while (Math.abs(baseX) < 7.5 && baseY > -3 && baseY < 8.5);

      sprite.position.set(baseX, baseY, baseZ);
      sprite.userData = {
        baseX,
        baseY,
        baseZ,
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.004,
        phase: Math.random() * Math.PI * 2
      };

      scene.add(sprite);
      tokenSprites.push(sprite);
    });
  }

  // ==========================================================================
  // 3. FOREST BIO-PARTICLES (Reduced count for 0% CPU strain)
  // ==========================================================================
  const sporeCount = isMobile ? 40 : 100;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  const sporeColors = new Float32Array(sporeCount * 3);

  const c1 = new THREE.Color('#059669');
  const c2 = new THREE.Color('#10b981');
  const c3 = new THREE.Color('#34d399');

  for (let i = 0; i < sporeCount; i++) {
    const rad = 12 + Math.random() * 36;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos((Math.random() * 2) - 1);

    sporePos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
    sporePos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th);
    sporePos[i * 3 + 2] = (rad * Math.cos(ph)) - 10;

    const chosen = i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3);
    sporeColors[i * 3] = chosen.r;
    sporeColors[i * 3 + 1] = chosen.g;
    sporeColors[i * 3 + 2] = chosen.b;
  }

  sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
  sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

  const sporeMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });

  const forestSpores = new THREE.Points(sporeGeo, sporeMaterial);
  scene.add(forestSpores);

  // ==========================================================================
  // 4. ANIMATION LOOP (Pauses when Hero is offscreen)
  // ==========================================================================
  let clock = new THREE.Clock();
  let isHeroVisible = true;
  let isRunning = false;

  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
      if (isHeroVisible && !isRunning) {
        isRunning = true;
        animate();
      }
    }, { threshold: 0.02 });
    observer.observe(heroEl);
  }

  function animate() {
    if (!isHeroVisible) {
      isRunning = false;
      return;
    }
    isRunning = true;
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;
    scrollY += (targetScrollY - scrollY) * 0.05;

    // Rotate particles
    icGroup.rotation.y = elapsedTime * 0.12 + mouse.x * 0.15;
    icGroup.position.y = -5 - (scrollY * 0.01);

    forestSpores.rotation.y = elapsedTime * 0.02 + mouse.x * 0.05;
    forestSpores.position.y = -scrollY * 0.008;

    // Tokens
    if (!isMobile && tokenSprites.length > 0) {
      tokenSprites.forEach((sprite) => {
        const u = sprite.userData;
        u.baseX += u.vx;
        u.baseY += u.vy;
        if (Math.abs(u.baseX) > 26) u.vx *= -1;
        if (Math.abs(u.baseY) > 18) u.vy *= -1;

        sprite.position.x = u.baseX + Math.sin(elapsedTime * 0.6 + u.phase) * 0.5;
        sprite.position.y = u.baseY + Math.cos(elapsedTime * 0.6 + u.phase) * 0.5 - (scrollY * 0.01);
        sprite.position.z = u.baseZ;
      });
    }

    camera.position.x = mouse.x * 1.5;
    camera.position.y = mouse.y * 1.2;
    camera.lookAt(0, -scrollY * 0.004, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler (Debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.0 : 1.25));
    }, 150);
  }, { passive: true });
})();
