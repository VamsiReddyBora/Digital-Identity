/**
 * ==========================================================================
 * About Me Card — WebGL Diagonal Cylindrical Sticker Unroll Engine
 *
 * Architecture:
 * 1. SINGLE VISUAL CARD: The WebGL surface is the sole rendering representation
 *    at all scroll positions (0% -> 100% -> 0%). No duplicate cards, no crossfade.
 * 2. FIXED ANCHOR: Bottom-right corner is permanently fixed at its layout position.
 * 3. INWARD CYLINDRICAL ROLL: The top-left portion curls INWARD toward the
 *    bottom-right anchor, cresting above the page in +Z and folding back over itself.
 * 4. SCROLL PROGRESS: 100% direct scrub (scrub: true, ease: 'none').
 *    - 0%: Top-left heavily rolled inward toward bottom-right anchor.
 *    - 50%: Unrolling across the diagonal; bottom-right region flat on page.
 *    - 100%: Entire card completely flat in its exact layout position.
 * ==========================================================================
 */

(function () {
  'use strict';

  function initAboutStickerRoll() {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const aboutCard = aboutSection.querySelector('.about-card');
    if (!aboutCard) return;

    const container = aboutCard.parentElement;
    if (!container) return;

    container.style.position = 'relative';

    // Create single visual rendering canvas
    let canvas = document.getElementById('about-sticker-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'about-sticker-canvas';
      canvas.className = 'about-sticker-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '24px';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '2';
      canvas.style.display = 'block';
      canvas.style.opacity = '1';
      container.insertBefore(canvas, aboutCard);
    }

    let renderer, scene, camera, mesh, material, geometry, cardTexture;
    let cardWidth = 0;
    let cardHeight = 0;

    // Vertex Shader: INWARD Cylindrical Roll along Diagonal toward Bottom-Right Anchor
    const vertexShader = `
      uniform float uProgress;
      uniform vec2 uSize;
      uniform float uRadius;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vRollAngle;
      varying float vDelta;

      void main() {
        vUv = uv;

        float W = uSize.x;
        float H = uSize.y;
        float diagLen = length(uSize);

        // Normalized diagonal direction pointing from Bottom-Right Anchor to Top-Left
        // Top-Left is (-W/2, H/2), Bottom-Right anchor is (W/2, -H/2)
        vec2 diagDir = normalize(vec2(-W, H));

        // Anchor is fixed at Bottom-Right: (W/2, -H/2)
        vec2 anchor = vec2(W * 0.5, -H * 0.5);

        // Distance along diagonal from anchor (0 at anchor, positive towards top-left)
        vec2 fromAnchor = position.xy - anchor;
        float distFromAnchor = dot(fromAnchor, diagDir);

        // Roll Front position (progressively advances from 0 -> diagLen as uProgress goes 0 -> 1)
        float R = max(uRadius, 15.0);
        float rollFront = uProgress * (diagLen + R * 1.6);

        float delta = distFromAnchor - rollFront;
        vDelta = delta;

        vec3 transformed = position;
        vec3 computedNormal = vec3(0.0, 0.0, 1.0);
        vRollAngle = 0.0;

        if (delta > 0.0) {
          // Physical Inward Cylindrical Roll:
          // The sheet lifts up (+Z) and curves back toward the bottom-right anchor (-diagDir).
          const float PI = 3.14159265359;
          float maxArc = R * PI; // 180 degree half-cylinder arch

          float zLift = 0.0;
          float retract = 0.0;
          float theta = 0.0;

          if (delta <= maxArc) {
            // Circular cylindrical arch curling up and over toward the anchor
            theta = delta / R;
            zLift = R * (1.0 - cos(theta));
            retract = delta - R * sin(theta);
            computedNormal = normalize(vec3(-diagDir * sin(theta), cos(theta)));
          } else {
            // Tangent extension at the crest (parallel to page at height 2R, pointing toward anchor)
            theta = PI;
            float dExt = delta - maxArc;
            zLift = 2.0 * R;
            retract = maxArc + 2.0 * dExt;
            computedNormal = vec3(0.0, 0.0, -1.0);
          }

          vRollAngle = theta;

          // Displace vertex:
          // 1. Retract along diagonal toward bottom-right anchor (-diagDir * retract)
          // 2. Lift in +Z (towards viewer): +zLift
          transformed.xy -= diagDir * retract;
          transformed.z += zLift;
        }

        vNormal = normalize(normalMatrix * computedNormal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    // Fragment Shader: Direct Right-Side Up Texture & Two-Sided Physical Lighting
    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uProgress;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vRollAngle;
      varying float vDelta;

      void main() {
        // Direct UV mapping — right-side up, matches card layout exactly
        vec4 texColor = texture2D(uTexture, vUv);

        // Directional Light from Top-Right & Front
        vec3 lightDir = normalize(vec3(0.35, 0.6, 1.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        
        // Two-sided normal for smooth illumination
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) {
          N = -N;
        }

        // Diffuse & Specular Lighting on inward-curved sheet
        float diffuse = max(dot(N, lightDir), 0.0) * 0.35 + 0.65;
        vec3 halfVec = normalize(lightDir + viewDir);
        float spec = pow(max(dot(N, halfVec), 0.0), 20.0) * 0.3;

        // Soft ambient occlusion inside the inward curl
        float ao = 1.0;
        if (vDelta > 0.0) {
          ao = 0.80 + 0.20 * clamp(cos(vRollAngle * 0.5), 0.0, 1.0);
        }

        vec3 litColor = texColor.rgb * diffuse * ao + vec3(spec);
        gl_FragColor = vec4(litColor, texColor.a);
      }
    `;

    // Function to render crisp 2D vector texture of the About Me card
    function generateCardTexture(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const texCanvas = document.createElement('canvas');
      texCanvas.width = Math.round(w * dpr);
      texCanvas.height = Math.round(h * dpr);
      const ctx = texCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // 1. Card Background with Rounded Corners (24px radius)
      const radius = 24;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, radius);
      ctx.clip();

      // Glass gradient fill
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      bgGrad.addColorStop(1, 'rgba(240, 253, 244, 0.92)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle emerald inner mesh tint
      const radGrad = ctx.createRadialGradient(w * 0.1, h * 0.2, 0, w * 0.1, h * 0.2, w * 0.6);
      radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      radGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Left Column: Typography & Content
      const pad = Math.min(48, w * 0.05);
      const colWidth = (w - pad * 2 - 40) / 2;

      // "About Me" Title
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 40px "Outfit", sans-serif';
      ctx.fillText('About Me', pad, pad + 38);

      // Bio Paragraph
      ctx.fillStyle = '#475569';
      ctx.font = '400 16px "Outfit", sans-serif';
      const bioText1 = "I'm Vamsi Reddy Bora, an Electronics and Communication";
      const bioText2 = "Engineer with a deep obsession for firmware programming,";
      const bioText3 = "low-level microcontroller drivers (ARM Cortex, STM32,";
      const bioText4 = "ESP32, AVR), RTOS, and hardware-software co-design. I build";
      const bioText5 = "robust IoT ecosystems and high-speed protocol pipelines.";

      let textY = pad + 80;
      const lineH = 24;
      ctx.fillText(bioText1, pad, textY);
      ctx.fillText(bioText2, pad, textY + lineH);
      ctx.fillText(bioText3, pad, textY + lineH * 2);
      ctx.fillText(bioText4, pad, textY + lineH * 3);
      ctx.fillText(bioText5, pad, textY + lineH * 4);

      // Stats Badges (ECE, 40+, 100%)
      const statY = textY + lineH * 5 + 32;
      const statW = (colWidth - 32) / 3;

      const stats = [
        { num: 'ECE', label: 'Specialization' },
        { num: '40+', label: 'Hardware Builds' },
        { num: '100%', label: 'Firmware Focus' }
      ];

      stats.forEach((st, idx) => {
        const sx = pad + idx * (statW + 16);
        ctx.fillStyle = '#059669';
        ctx.font = '800 28px "Outfit", sans-serif';
        ctx.fillText(st.num, sx, statY);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillText(st.label, sx, statY + 20);
      });

      // 3. Right Column: Action Cards
      const rightX = pad + colWidth + 40;
      const cardBoxW = w - rightX - pad;
      const cardBoxH = (h - pad * 2 - 20) / 2;

      const actionCards = [
        {
          title: 'Embedded Firmware',
          sub: 'C/C++, STM32, ESP-IDF, RTOS, Drivers',
          iconColor: '#8b5cf6'
        },
        {
          title: 'Communication Protocols',
          sub: 'UART, SPI, I2C, CAN, BLE, MQTT, TCP/IP',
          iconColor: '#ec4899'
        }
      ];

      actionCards.forEach((ac, idx) => {
        const cy = pad + idx * (cardBoxH + 20);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(rightX, cy, cardBoxW, cardBoxH, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon circle
        ctx.beginPath();
        ctx.arc(rightX + 32, cy + cardBoxH / 2, 20, 0, Math.PI * 2);
        ctx.fillStyle = ac.iconColor + '20';
        ctx.fill();
        ctx.strokeStyle = ac.iconColor + '50';
        ctx.stroke();

        // Text
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 16px "Outfit", sans-serif';
        ctx.fillText(ac.title, rightX + 64, cy + cardBoxH / 2 - 4);

        ctx.fillStyle = '#64748b';
        ctx.font = '400 13px "JetBrains Mono", monospace';
        ctx.fillText(ac.sub, rightX + 64, cy + cardBoxH / 2 + 16);

        ctx.restore();
      });

      // 4. Clean Emerald Border around the entire card
      ctx.restore();
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, radius);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      return texture;
    }

    // Setup WebGL Scene & Renderer
    function setupScene() {
      const rect = aboutCard.getBoundingClientRect();
      cardWidth = Math.max(rect.width, 300);
      cardHeight = Math.max(rect.height, 200);

      // Position canvas directly over the About Me card area
      const parentRect = container.getBoundingClientRect();
      const leftOffset = rect.left - parentRect.left;
      const topOffset = rect.top - parentRect.top;

      canvas.style.left = `${leftOffset}px`;
      canvas.style.top = `${topOffset}px`;
      canvas.style.width = `${cardWidth}px`;
      canvas.style.height = `${cardHeight}px`;

      if (!renderer) {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      }

      renderer.setSize(cardWidth, cardHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      scene = new THREE.Scene();

      // Orthographic camera for 1:1 pixel accuracy
      camera = new THREE.OrthographicCamera(
        -cardWidth / 2,
        cardWidth / 2,
        cardHeight / 2,
        -cardHeight / 2,
        0.1,
        2000
      );
      camera.position.set(0, 0, 1000);
      camera.lookAt(0, 0, 0);

      // Subdivided plane mesh (64 x 64 for buttery-smooth cylindrical curvature)
      if (geometry) geometry.dispose();
      geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 64, 64);

      if (cardTexture) cardTexture.dispose();
      cardTexture = generateCardTexture(cardWidth, cardHeight);

      const diagLen = Math.sqrt(cardWidth * cardWidth + cardHeight * cardHeight);
      const rollRadius = diagLen * 0.14; // Physical roll cylinder radius

      material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          uTexture: { value: cardTexture },
          uProgress: { value: 0.0 },
          uSize: { value: new THREE.Vector2(cardWidth, cardHeight) },
          uRadius: { value: rollRadius }
        },
        side: THREE.DoubleSide,
        transparent: true
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }

    // Build the scene once fonts are ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setupScene();
        renderProgress(0);
      });
    } else {
      setupScene();
      renderProgress(0);
    }

    // Render WebGL frame at exact scroll progress (Sole visual representation)
    function renderProgress(progress) {
      const p = Math.max(0, Math.min(1, progress));

      if (material) {
        material.uniforms.uProgress.value = p;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      // Single Card Architecture:
      // WebGL canvas remains visible at all times (opacity: 1).
      // When flat (p >= 0.999), enable click hit-testing for contact modal triggers.
      if (p >= 0.999) {
        aboutCard.classList.add('is-interactive');
      } else {
        aboutCard.classList.remove('is-interactive');
      }
    }

    // ScrollTrigger instance for 100% direct 1:1 scroll scrub
    ScrollTrigger.create({
      trigger: aboutSection,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        renderProgress(self.progress);
      },
      onRefresh: (self) => {
        setupScene();
        renderProgress(self.progress);
      }
    });

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupScene();
        ScrollTrigger.refresh();
      }, 200);
    }, { passive: true });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutStickerRoll);
  } else {
    initAboutStickerRoll();
  }
})();
