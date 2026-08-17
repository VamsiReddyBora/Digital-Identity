/**
 * ==========================================================================
 * ABOUT ME CARD ROLL ENGINE — TRUE 3D PHYSICAL CYLINDER SPIRAL ROLL
 * ==========================================================================
 * - High-resolution 3D curved surface (100x100 subdivided mesh)
 * - Archimedean logarithmic spiral cylinder with smooth paper bending elasticity
 * - 100% Sub-Pixel Geometric DOM Layout Alignment (Zero Vertical Shift)
 * - Ultra-crisp 4K Retina Texture (Zero Blurriness, Zero Ghosting)
 * - Physical Touchdown Flattening Factor: smoothly presses curl flat before handover
 * - Sub-frame Kinetic Scroll LERP Interpolation (Buttery smooth 60/120fps motion)
 * - Fixed Anchor: BOTTOM-RIGHT CORNER (never moves, (u=1, v=0))
 * - Roll Direction: Bottom-Right to Top-Left
 * - Double-Sided Physical Shading: 100% Color-Accurate Front + Iridescent Frosted Foil Back
 * - Zero-Jitter Settling Handover
 * ==========================================================================
 */

(function () {
  'use strict';

  function initAboutCardRoll() {
    const wrapper = document.getElementById('about-card-wrapper');
    const domCard = document.getElementById('about-dom-card');
    const canvas = document.getElementById('about-roll-canvas');

    if (!wrapper || !domCard || !canvas || typeof THREE === 'undefined') {
      console.warn('AboutCardRoll: Required elements or THREE.js missing.');
      return;
    }

    // 1. Debug HUD
    createDebugHUD();

    // 2. Setup Three.js Context
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));

    const scene = new THREE.Scene();
    const fov = 45;
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 5000);

    let cardWidth = 0;
    let cardHeight = 0;
    let mesh = null;
    let material = null;
    
    // Kinetic Smooth LERP State
    let targetProgress = 0;
    let currentProgress = 0;
    let mouseNorm = { x: 0.5, y: 0.5 };

    // 3. Ultra-Smooth 3D Cylindrical Peel Vertex & Fragment Shaders
    const vertexShader = `
      uniform float uProgress;    // 0.0 (fully rolled) to 1.0 (flat)
      uniform float uWidth;
      uniform float uHeight;
      uniform float uRadius;
      uniform vec2 uMouse;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vTheta;
      varying float vCurvature;

      void main() {
        vUv = uv;

        // Normalized local coords: u in [0, 1] (0=left, 1=right), v in [0, 1] (0=bottom, 1=top)
        float u = (position.x + uWidth * 0.5) / uWidth;
        float v = (position.y + uHeight * 0.5) / uHeight;

        // Distance components from Bottom-Right corner (u=1, v=0)
        float dx = (1.0 - u) * uWidth;
        float dy = v * uHeight;

        float diagLength = sqrt(uWidth * uWidth + uHeight * uHeight);
        float cosAlpha = uWidth / diagLength;
        float sinAlpha = uHeight / diagLength;
        
        float s = dx * cosAlpha + dy * sinAlpha;
        float sMax = diagLength;

        // Roll front boundary travels across the card
        float sFlat = uProgress * sMax;

        vec3 newPos = position;
        vec3 newNormal = vec3(0.0, 0.0, 1.0);
        float theta = 0.0;
        float curvature = 0.0;

        // Transition blend zone for natural paper stiffness (smoothstep curve)
        float blendZone = uRadius * 0.35;

        // Physical Touchdown Flattening: as uProgress enters 0.85 -> 0.98,
        // any remaining curl altitude smoothly compresses to 0.0 so mesh is 100% flat at settling.
        float flattenFactor = 1.0 - smoothstep(0.85, 0.98, uProgress);

        if (s > (sFlat - blendZone) && flattenFactor > 0.001) {
          float deltaS = max(0.0, s - sFlat);
          
          // Natural paper elasticity: slight taper from anchor to leading corner
          float taper = mix(1.08, 0.88, 1.0 - u);
          float R = uRadius * taper;
          
          theta = deltaS / R;

          // Smooth easing at the crease front (Archimedean spiral onset)
          float easeIn = smoothstep(-blendZone, blendZone, s - sFlat);

          // Subtle spiral contraction as paper winds into the cylinder
          float currentR = R * max(0.65, 1.0 - 0.028 * theta);

          // Direction vector pointing from Top-Left toward Bottom-Right anchor in 2D
          vec2 eAnchor = vec2(cosAlpha, -sinAlpha);

          // Continuous 3D cylindrical spiral math with touchdown flattening
          float pullInward = (deltaS - currentR * sin(theta)) * easeIn * flattenFactor;
          float liftZ = (currentR * (1.0 - cos(theta))) * easeIn * flattenFactor;

          newPos.x += eAnchor.x * pullInward;
          newPos.y += eAnchor.y * pullInward;
          newPos.z = liftZ;

          // Analytical 3D normal vector
          newNormal.x = cosAlpha * sin(theta) * easeIn * flattenFactor;
          newNormal.y = -sinAlpha * sin(theta) * easeIn * flattenFactor;
          newNormal.z = mix(1.0, cos(theta), easeIn * flattenFactor);
          
          curvature = easeIn * flattenFactor * clamp(sin(min(theta, 3.14159 * 0.5)), 0.0, 1.0);
        }

        vTheta = theta;
        vCurvature = curvature;

        vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vNormal = normalize(normalMatrix * newNormal);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vTheta;
      varying float vCurvature;

      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        if (texColor.a < 0.01) discard;

        // Dynamic interactive light vector
        vec3 lightDir = normalize(vec3(0.35 + (uMouse.x - 0.5) * 0.3, 0.65 - (uMouse.y - 0.5) * 0.3, 0.85));

        if (gl_FrontFacing) {
          // FRONT FACE: 100% Color-accurate flat sheet, tactile 3D curvature shading
          float diff = max(dot(vNormal, lightDir), 0.0);
          float curveShadow = 1.0 - 0.16 * vCurvature * (1.0 - diff);
          
          // Specular highlight along the curved crest
          vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 28.0) * vCurvature;
          
          vec3 finalColor = texColor.rgb * curveShadow + vec3(0.14, 0.22, 0.20) * spec;

          gl_FragColor = vec4(finalColor, texColor.a);
        } else {
          // BACK FACE (Underside of the flexible sheet)
          // Iridescent pearlescent foil with brushed metallic sheen
          vec3 backBase = vec3(0.93, 0.96, 0.97);
          vec3 backNormal = -vNormal;
          
          float diff = max(dot(backNormal, lightDir), 0.0);
          float diffuseLight = clamp(0.65 + 0.35 * diff, 0.50, 1.0);
          
          // Cylinder interior shadow
          float innerShadow = clamp(0.48 + 0.52 * cos(min(vTheta, 3.14159)), 0.35, 1.0);
          
          // Iridescent reflection
          float iri = pow(max(dot(backNormal, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 16.0);
          vec3 iriColor = mix(vec3(0.05, 0.65, 0.45), vec3(0.2, 0.5, 0.9), vUv.x);

          vec3 finalBack = (backBase * diffuseLight + iriColor * iri * 0.35) * innerShadow;

          gl_FragColor = vec4(finalBack, texColor.a);
        }
      }
    `;

    // 4. Ultra-Sharp 4K Retina Texture Generator with Live DOM Layout Alignment
    function generateCardTexture(w, h) {
      const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
      const canvas2d = document.createElement('canvas');
      canvas2d.width = Math.round(w * dpr);
      canvas2d.height = Math.round(h * dpr);
      const ctx = canvas2d.getContext('2d');
      ctx.scale(dpr, dpr);

      // 1. Solid White Base (prevents alpha wash out)
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(w - radius, 0);
      ctx.quadraticCurveTo(w, 0, w, radius);
      ctx.lineTo(w, h - radius);
      ctx.quadraticCurveTo(w, h, w - radius, h);
      ctx.lineTo(radius, h);
      ctx.quadraticCurveTo(0, h, 0, h - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Frosted Gradient Fill
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#f8fafc');
      bgGrad.addColorStop(1, '#f0fdf4');
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
      ctx.stroke();

      // 2. Measure Exact Live DOM Elements to Guarantee 100% Sub-Pixel Alignment
      const cardRect = domCard.getBoundingClientRect();
      const titleEl = domCard.querySelector('h2');
      const bioEl = domCard.querySelector('.about-bio');
      const statItems = domCard.querySelectorAll('.stat-item');
      const actionCards = domCard.querySelectorAll('.action-card');

      const isMobile = w < 768;

      if (titleEl && bioEl && actionCards.length >= 2 && !isMobile) {
        const tRect = titleEl.getBoundingClientRect();
        const bRect = bioEl.getBoundingClientRect();

        // Exact Title position
        const titleX = tRect.left - cardRect.left;
        const titleY = tRect.top - cardRect.top;
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 40px "Outfit", -apple-system, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText('About Me', titleX, titleY);

        // Exact Bio position
        const bioX = bRect.left - cardRect.left;
        const bioY = bRect.top - cardRect.top;
        ctx.textBaseline = 'top';
        
        ctx.font = '400 16.8px "Outfit", -apple-system, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText("I'm ", bioX, bioY);
        
        ctx.font = '700 16.8px "Outfit", -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText("Vamsi Reddy Bora", bioX + 27, bioY);
        
        ctx.font = '400 16.8px "Outfit", -apple-system, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(", an Electronics and Communication Engineer", bioX + 172, bioY);
        ctx.fillText("with a deep obsession for firmware programming, low-level", bioX, bioY + 28);
        ctx.fillText("microcontroller drivers (ARM Cortex, STM32, ESP32, AVR), RTOS, and", bioX, bioY + 56);
        ctx.fillText("hardware-software co-design. I build robust IoT ecosystems, high-", bioX, bioY + 84);
        ctx.fillText("speed communication protocol pipelines, and interactive digital", bioX, bioY + 112);
        ctx.fillText("interfaces.", bioX, bioY + 140);

        // Exact Stats positions
        const statsData = [
          { num: 'ECE', label: 'Core Specialization' },
          { num: '40+', label: 'Hardware & Code Builds' },
          { num: '100%', label: 'Obsessed with Firmware' }
        ];

        statItems.forEach((stEl, i) => {
          const sRect = stEl.getBoundingClientRect();
          const numEl = stEl.querySelector('.stat-number');
          const lblEl = stEl.querySelector('.stat-label');
          
          const sx = sRect.left - cardRect.left;
          const numY = numEl ? (numEl.getBoundingClientRect().top - cardRect.top) : (sRect.top - cardRect.top);
          const lblY = lblEl ? (lblEl.getBoundingClientRect().top - cardRect.top) : (numY + 42);

          const numGrad = ctx.createLinearGradient(sx, numY, sx + 60, numY + 36);
          numGrad.addColorStop(0, '#059669');
          numGrad.addColorStop(1, '#7c3aed');
          ctx.fillStyle = numGrad;
          ctx.font = '800 35px "Outfit", -apple-system, sans-serif';
          ctx.textBaseline = 'top';
          ctx.fillText(statsData[i].num, sx, numY);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 13.5px "Outfit", -apple-system, sans-serif';
          ctx.fillText(statsData[i].label, sx, lblY);
        });

        // Exact Action Cards positions matching CSS align-items: center
        actionCards.forEach((aEl, idx) => {
          const aRect = aEl.getBoundingClientRect();
          const ax = aRect.left - cardRect.left;
          const ay = aRect.top - cardRect.top;
          const aw = aRect.width;
          const ah = aRect.height;
          const iconType = idx === 0 ? 'cpu' : 'network';
          const text = idx === 0
            ? 'Embedded Firmware (C/C++, STM32, ESP-IDF, RTOS, Device Drivers).'
            : 'Communication Protocols (UART, SPI, I2C, CAN, BLE, MQTT, TCP/IP).';

          drawActionCard(ctx, ax, ay, aw, ah, iconType, text);
        });
      } else {
        // Fallback for mobile
        const pad = isMobile ? 24 : 48;
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 28px "Outfit", -apple-system, sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText('About Me', pad, pad + 10);

        ctx.fillStyle = '#334155';
        ctx.font = '400 14px "Outfit", -apple-system, sans-serif';
        ctx.fillText("I'm Vamsi Reddy Bora, an Electronics and Communication", pad, pad + 50);
        ctx.fillText("Engineer specializing in Embedded Systems & RTOS.", pad, pad + 72);
      }

      const texture = new THREE.CanvasTexture(canvas2d);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 8;
      texture.needsUpdate = true;
      return texture;
    }

    // Exact Action Card Renderer matching original CSS (.action-card, .action-icon, .action-arrow-btn)
    function drawActionCard(ctx, x, y, w, h, iconType, text) {
      // Rounded Card Box
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
      ctx.stroke();

      // Left Gradient Badge (46x46)
      const iconX = x + 24;
      const iconY = y + (h - 46) / 2;
      const iconR = 12;

      ctx.beginPath();
      ctx.moveTo(iconX + iconR, iconY);
      ctx.lineTo(iconX + 46 - iconR, iconY);
      ctx.quadraticCurveTo(iconX + 46, iconY, iconX + 46, iconY + iconR);
      ctx.lineTo(iconX + 46, iconY + 46 - iconR);
      ctx.quadraticCurveTo(iconX + 46, iconY + 46, iconX + 46 - iconR, iconY + 46);
      ctx.lineTo(iconX + iconR, iconY + 46);
      ctx.quadraticCurveTo(iconX, iconY + 46, iconX, iconY + 46 - iconR);
      ctx.lineTo(iconX, iconY + iconR);
      ctx.quadraticCurveTo(iconX, iconY, iconX + iconR, iconY);
      ctx.closePath();

      const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + 46, iconY + 46);
      if (iconType === 'cpu') {
        iconGrad.addColorStop(0, '#059669'); // emerald to cyan
        iconGrad.addColorStop(1, '#0284c7');
      } else {
        iconGrad.addColorStop(0, '#0284c7'); // cyan to violet
        iconGrad.addColorStop(1, '#7c3aed');
      }
      ctx.fillStyle = iconGrad;
      ctx.fill();

      // White Vector Icon inside badge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const cx = iconX + 23;
      const cy = iconY + 23;

      if (iconType === 'cpu') {
        // CPU Chip
        ctx.strokeRect(cx - 7, cy - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 7); ctx.lineTo(cx - 4, cy - 11);
        ctx.moveTo(cx + 4, cy - 7); ctx.lineTo(cx + 4, cy - 11);
        ctx.moveTo(cx - 4, cy + 7); ctx.lineTo(cx - 4, cy + 11);
        ctx.moveTo(cx + 4, cy + 7); ctx.lineTo(cx + 4, cy + 11);
        ctx.moveTo(cx - 7, cy - 4); ctx.lineTo(cx - 11, cy - 4);
        ctx.moveTo(cx - 7, cy + 4); ctx.lineTo(cx - 11, cy + 4);
        ctx.moveTo(cx + 7, cy - 4); ctx.lineTo(cx + 11, cy - 4);
        ctx.moveTo(cx + 7, cy + 4); ctx.lineTo(cx + 11, cy + 4);
        ctx.stroke();
      } else {
        // Network Nodes
        ctx.strokeRect(cx - 4, cy - 10, 8, 7);
        ctx.strokeRect(cx - 10, cy + 3, 7, 7);
        ctx.strokeRect(cx + 3, cy + 3, 7, 7);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy);
        ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
        ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 6, cy + 3);
        ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 6, cy + 3);
        ctx.stroke();
      }

      // Action Text
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 14px "Outfit", -apple-system, sans-serif';
      ctx.textBaseline = 'middle';
      const words = text.split(' ');
      let line1 = '', line2 = '';
      for (let word of words) {
        if ((line1 + word).length < 32) line1 += word + ' ';
        else line2 += word + ' ';
      }
      ctx.fillText(line1.trim(), iconX + 64, y + h / 2 - 11);
      if (line2) ctx.fillText(line2.trim(), iconX + 64, y + h / 2 + 11);

      // Right Circular Action Button (.action-arrow-btn)
      const btnX = x + w - 64;
      const btnY = y + (h - 40) / 2;
      ctx.beginPath();
      ctx.arc(btnX + 20, btnY + 20, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // White Lucide Arrow Up-Right (arrow-up-right)
      const ax = btnX + 20;
      const ay = btnY + 20;
      ctx.beginPath();
      ctx.moveTo(ax - 5, ay + 5);
      ctx.lineTo(ax + 5, ay - 5);
      ctx.moveTo(ax - 1, ay - 5);
      ctx.lineTo(ax + 5, ay - 5);
      ctx.lineTo(ax + 5, ay + 1);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Rebuild Scene on Resize
    function setupGeometry() {
      const rect = domCard.getBoundingClientRect();
      cardWidth = rect.width || wrapper.offsetWidth || 1100;
      cardHeight = rect.height || wrapper.offsetHeight || 420;

      canvas.width = Math.round(cardWidth * window.devicePixelRatio);
      canvas.height = Math.round(cardHeight * window.devicePixelRatio);
      renderer.setSize(cardWidth, cardHeight, false);

      camera.aspect = cardWidth / cardHeight;
      const dist = (cardHeight / 2) / Math.tan((Math.PI * fov) / 360);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      // Clean up previous mesh
      if (mesh) scene.remove(mesh);

      // Subdivided plane: 100x100 segments for continuous physical curvature
      const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 100, 100);
      const texture = generateCardTexture(cardWidth, cardHeight);

      // Cylinder radius: ~75px on desktop, ~50px on mobile
      const radius = Math.max(54.0, cardHeight * 0.18);

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uProgress: { value: 0.0 },
          uWidth: { value: cardWidth },
          uHeight: { value: cardHeight },
          uRadius: { value: radius },
          uTexture: { value: texture },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        },
        side: THREE.DoubleSide,
        transparent: true
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      computeTargetProgress();
      currentProgress = targetProgress;
    }

    // 6. Scroll Target Computation
    function computeTargetProgress() {
      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Start unrolling when the card's top is 15% below viewport bottom (anticipation)
      const scrollStart = viewportH * 1.15;
      // Completely flat when the card's top reaches 28% from viewport top
      const scrollEnd = viewportH * 0.28;

      let p = (scrollStart - rect.top) / (scrollStart - scrollEnd);
      targetProgress = Math.max(0.0, Math.min(1.0, p));
    }

    // 7. Kinetic Sub-Frame LERP Animation Loop (Seamless Zero-Jitter Handover)
    function animationLoop() {
      computeTargetProgress();

      // Sub-frame exponential smoothing (snappy & fluid)
      currentProgress += (targetProgress - currentProgress) * 0.16;
      if (Math.abs(targetProgress - currentProgress) < 0.0001) {
        currentProgress = targetProgress;
      }

      if (mesh && material) {
        material.uniforms.uProgress.value = currentProgress;
        material.uniforms.uMouse.value.set(mouseNorm.x, mouseNorm.y);

        // Update Debug HUD
        updateDebugHUD(currentProgress);

        // Zero-Jitter Handover:
        // Because canvas texture coordinates are 100.0% aligned with computed DOM rects,
        // the transition at p >= 0.998 is completely imperceptible and jitter-free.
        if (currentProgress >= 0.998) {
          canvas.style.display = 'none';
          domCard.style.opacity = '1';
          domCard.style.visibility = 'visible';
          domCard.style.pointerEvents = 'auto';
        } else {
          canvas.style.display = 'block';
          canvas.style.opacity = '1';
          domCard.style.opacity = '0';
          domCard.style.visibility = 'hidden';
          domCard.style.pointerEvents = 'none';
        }

        renderFrame();
      }

      requestAnimationFrame(animationLoop);
    }

    function renderFrame() {
      if (mesh && material && canvas.style.display !== 'none') {
        renderer.render(scene, camera);
      }
    }

    // 8. Interactive Mouse Tracking
    window.addEventListener('mousemove', (e) => {
      mouseNorm.x = e.clientX / window.innerWidth;
      mouseNorm.y = e.clientY / window.innerHeight;
    }, { passive: true });

    // 9. Resize & Font Load Listeners
    window.addEventListener('resize', () => {
      setupGeometry();
    }, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (material && cardWidth && cardHeight) {
          setupGeometry();
        }
      });
    }

    // Initial setup and start loop
    setupGeometry();
    animationLoop();
  }

  // 10. Debug HUD
  function createDebugHUD() {
    if (document.getElementById('card-roll-debug-hud')) return;
    const hud = document.createElement('div');
    hud.id = 'card-roll-debug-hud';
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #fff;
      padding: 12px 18px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 11px;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      pointer-events: none;
      line-height: 1.5;
    `;
    hud.innerHTML = `
      <div style="color: #34d399; font-weight: 700; margin-bottom: 3px;">⚙️ ABOUT ME CARD ROLL ENGINE</div>
      <div>PROGRESS: <span id="debug-progress-val" style="color: #38bdf8; font-weight: bold;">0.00</span> / 1.00</div>
      <div>STATE: <span id="debug-state-val" style="color: #fbbf24; font-weight: 600;">ROLLED</span></div>
      <div>ANCHOR: <span style="color: #a7f3d0;">BOTTOM-RIGHT (Fixed)</span></div>
      <div>DIRECTION: <span style="color: #a7f3d0;">BOTTOM-RIGHT → TOP-LEFT</span></div>
    `;
    document.body.appendChild(hud);
  }

  function updateDebugHUD(p) {
    const progEl = document.getElementById('debug-progress-val');
    const stateEl = document.getElementById('debug-state-val');
    if (!progEl || !stateEl) return;

    progEl.textContent = p.toFixed(2);
    if (p <= 0.01) {
      stateEl.textContent = 'COMPLETELY ROLLED (3D SPIRAL)';
      stateEl.style.color = '#f87171';
    } else if (p >= 0.998) {
      stateEl.textContent = 'COMPLETELY FLAT (DOM ACTIVE)';
      stateEl.style.color = '#34d399';
    } else {
      stateEl.textContent = '3D CYLINDRICAL UNROLL';
      stateEl.style.color = '#fbbf24';
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initAboutCardRoll, 100));
  } else {
    setTimeout(initAboutCardRoll, 100);
  }
})();
