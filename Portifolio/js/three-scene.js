/**
 * ==========================================================================
 * 3D WebGL Embedded Microcontroller IC & Cyber-Nature C-Language Constellation
 * 
 * Features:
 * 1. 3D Rotating Microcontroller IC Chip & Circuit Pin Matrix (replacing random torus)
 * 2. Floating C Statements & Embedded Registers
 * 3. Nature & Forest Bio-Luminescent Greenery Spores / Holographic Leaf Particles
 * 4. Interactive Mouse Force Field (Repulsion/Attraction) & Scroll-Driven Parallax
 * ==========================================================================
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Mouse & Scroll State
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 };
  let scrollY = 0;
  let targetScrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    mouse.worldX = mouse.targetX * 22;
    mouse.worldY = mouse.targetY * 16;
  });

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });

  // ==========================================================================
  // ==========================================================================
  // 1. CLEAN ATMOSPHERIC PARTICLE MATRIX (No sharp geometric lines behind name)
  // ==========================================================================
  const icGroup = new THREE.Group();
  icGroup.position.set(0, -5, -12); // Kept lower and subtle with zero wireframe overlap

  // Soft ambient silicon particle cloud (pure organic points, no intersecting lines)
  const ambientNodeCount = 48;
  const ambientNodeGeo = new THREE.BufferGeometry();
  const ambientNodePos = new Float32Array(ambientNodeCount * 3);
  for (let i = 0; i < ambientNodeCount; i++) {
    const angle = (i / ambientNodeCount) * Math.PI * 2;
    const r = 9 + Math.random() * 8; // Kept at safe outer radius to never cross name or face
    ambientNodePos[i * 3] = Math.cos(angle) * r;
    ambientNodePos[i * 3 + 1] = Math.sin(angle) * (r * 0.6) - 4;
    ambientNodePos[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  ambientNodeGeo.setAttribute('position', new THREE.BufferAttribute(ambientNodePos, 3));
  const ambientNodeMat = new THREE.PointsMaterial({ 
    size: 0.35, 
    color: 0x34d399, 
    transparent: true, 
    opacity: 0.45 
  });
  const ambientNodesMesh = new THREE.Points(ambientNodeGeo, ambientNodeMat);
  icGroup.add(ambientNodesMesh);

  scene.add(icGroup);

  // ==========================================================================
  // 2. C-LANGUAGE STATEMENTS CONSTELLATION
  // ==========================================================================
  const cStatements = [
    'uint32_t *reg',
    'volatile int flag',
    '0xDEADBEEF',
    'while(1) { ... }',
    'ISR(TIMER1_COMPA)',
    'SPI_Transmit(&hspi, buf)',
    'I2C_Write(0x68, reg)',
    'GPIO_PIN_SET',
    'HAL_Delay(10)',
    'UART_Printf("Init OK\\n")',
    'RTOS_TaskCreate()',
    'CAN_FilterInit()',
    'ADC_ReadChannel(0)',
    'NVIC_EnableIRQ()',
    'PORTB |= (1 << 5)',
    'ARM Cortex-M4',
    'DMA_Start_IT()',
    'PWM_SetDuty(85%)',
    '0x40021000',
    'typedef struct { ... }',
    '__disable_irq()',
    'bit_set(DDRD, PD2)',
    'I2S_AudioStream()',
    '0b10110010',
    'FreeRTOS_vTaskDelay()',
    'MCU_Clock_Config()'
  ];

  const tokenSprites = [];
  const tokenCount = cStatements.length * 2;

  function createTextSprite(text, color) {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');

    ctx.font = 'bold 36px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = color || '#059669';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = color || 'rgba(5, 150, 105, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(6.5, 1.6, 1);
    return sprite;
  }

  // Palette blending nature forest emeralds with tech cyber tones
  const tokenPalette = ['#059669', '#10b981', '#7c3aed', '#0284c7', '#0d9488', '#d97706'];

  for (let i = 0; i < tokenCount; i++) {
    const text = cStatements[i % cStatements.length];
    const color = tokenPalette[i % tokenPalette.length];
    const sprite = createTextSprite(text, color);

    let baseX, baseY, baseZ;
    // Keep text stars away from the central portrait/face
    do {
      const radius = 14 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      baseX = radius * Math.sin(phi) * Math.cos(theta);
      baseY = (radius * Math.sin(phi) * Math.sin(theta)) * 0.85;
      baseZ = (radius * Math.cos(phi)) - 10;
    } while (Math.abs(baseX) < 7.5 && baseY > -3 && baseY < 8.5);

    sprite.position.set(baseX, baseY, baseZ);

    sprite.userData = {
      baseX,
      baseY,
      baseZ,
      vx: (Math.random() - 0.5) * 0.006,
      vy: (Math.random() - 0.5) * 0.006,
      floatSpeed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2
    };

    scene.add(sprite);
    tokenSprites.push(sprite);
  }

  // ==========================================================================
  // 3. NATURE FOREST & CYBER GREENERY SPORES (Leaf/Pollen Particles)
  // ==========================================================================
  const sporeCount = 500;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  const sporeColors = new Float32Array(sporeCount * 3);

  const forestColors = [
    new THREE.Color('#059669'), // emerald
    new THREE.Color('#10b981'), // mint green
    new THREE.Color('#34d399'), // bright leaf
    new THREE.Color('#14b8a6'), // teal
    new THREE.Color('#84cc16')  // spring lime
  ];

  for (let i = 0; i < sporeCount; i++) {
    let px, py, pz;
    do {
      const rad = 12 + Math.random() * 42;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos((Math.random() * 2) - 1);

      px = rad * Math.sin(ph) * Math.cos(th);
      py = rad * Math.sin(ph) * Math.sin(th);
      pz = (rad * Math.cos(ph)) - 12;
    } while (Math.abs(px) < 6.5 && py > -2 && py < 7.5); // Clear of face area

    sporePos[i * 3] = px;
    sporePos[i * 3 + 1] = py;
    sporePos[i * 3 + 2] = pz;

    const chosenColor = forestColors[Math.floor(Math.random() * forestColors.length)];
    sporeColors[i * 3] = chosenColor.r;
    sporeColors[i * 3 + 1] = chosenColor.g;
    sporeColors[i * 3 + 2] = chosenColor.b;
  }

  sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
  sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

  function createSporeTexture() {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(52, 211, 153, 1)');
    grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }

  const sporeMaterial = new THREE.PointsMaterial({
    size: 0.75,
    vertexColors: true,
    map: createSporeTexture(),
    transparent: true,
    opacity: 0.65,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const forestSpores = new THREE.Points(sporeGeo, sporeMaterial);
  scene.add(forestSpores);

  // ==========================================================================
  // 4. ANIMATION LOOP
  // ==========================================================================
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.06;

    // 1. Rotate & Drift Ambient Particle Matrix
    icGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.12 + mouse.y * 0.15;
    icGroup.rotation.y = elapsedTime * 0.15 + mouse.x * 0.2;
    icGroup.rotation.z = Math.cos(elapsedTime * 0.25) * 0.08;
    icGroup.position.y = -5 + Math.sin(elapsedTime * 0.4) * 0.3 - (scrollY * 0.012);

    // 2. Forest Green Spores gentle drift
    forestSpores.rotation.y = elapsedTime * 0.025 + mouse.x * 0.08;
    forestSpores.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1 + mouse.y * 0.08;
    forestSpores.position.y = -scrollY * 0.01;

    // 3. Dynamic C Statement Stars (Interactive Mouse Repulsion)
    tokenSprites.forEach((sprite) => {
      const u = sprite.userData;

      u.baseX += u.vx;
      u.baseY += u.vy;
      if (Math.abs(u.baseX) > 28) u.vx *= -1;
      if (Math.abs(u.baseY) > 20) u.vy *= -1;

      let targetX = u.baseX + Math.sin(elapsedTime * 0.8 + u.phase) * 0.6;
      let targetY = u.baseY + Math.cos(elapsedTime * 0.8 + u.phase) * 0.6 - (scrollY * 0.012);

      const dx = targetX - mouse.worldX;
      const dy = targetY - (mouse.worldY - scrollY * 0.012);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8.5) {
        const force = (8.5 - dist) / 8.5;
        targetX += (dx / dist) * force * 3.5;
        targetY += (dy / dist) * force * 3.5;
        sprite.scale.set(7.5, 1.8, 1);
      } else {
        sprite.scale.set(6.2, 1.5, 1);
      }

      sprite.position.x += (targetX - sprite.position.x) * 0.08;
      sprite.position.y += (targetY - sprite.position.y) * 0.08;
      sprite.position.z = u.baseZ + Math.sin(elapsedTime + u.phase) * 0.8;
    });

    // Camera Reactivity
    camera.position.x = mouse.x * 2.5;
    camera.position.y = mouse.y * 2;
    camera.lookAt(0, -scrollY * 0.005, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();
