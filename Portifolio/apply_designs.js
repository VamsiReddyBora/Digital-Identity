const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Opt 1
html = html.replace(
  '<div class="glass-panel about-card tilt-element" id="about-dom-card">',
  '<div class="glass-panel about-card tilt-element opt1-spotlight" id="about-dom-card">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 1: Dynamic Spotlight & 3D Tilt</div>'
);

// Opt 2
html = html.replace(
  /<div class="glass-panel story-card story-expandable">/g,
  '<div class="glass-panel story-card story-expandable opt2-cyber">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 2: Cyber-Glass</div>'
);

// Opt 3
html = html.replace(
  /<div class="glass-panel skill-pillar-card tilt-element">/g,
  '<div class="glass-panel skill-pillar-card tilt-element opt3-kinetic">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 3: Kinetic Float</div>'
);
html = html.replace(
  /<div class="glass-panel dev-service-card tilt-element">/g,
  '<div class="glass-panel dev-service-card tilt-element opt3-kinetic">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 3: Kinetic Float</div>'
);

// Opt 4
html = html.replace(
  /<div class="glass-panel project-card tilt-element" data-category="(.*?)">/g,
  '<div class="glass-panel project-card tilt-element opt4-circuit" data-category="$1">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 4: Circuit Glow</div>'
);

// Opt 5
html = html.replace(
  /<div class="glass-panel testimonial-card tilt-element">/g,
  '<div class="glass-panel testimonial-card tilt-element opt5-aurora">\n              <div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">Opt 5: Aurora Glass</div>'
);

fs.writeFileSync('index.html', html);

// CSS Appending
const cssToAdd = `
/* ==========================================================================
   TEMPORARY ANIMATION OPTIONS FOR PREVIEW
   ========================================================================== */

/* Opt 1: Dynamic Spotlight & Magnetic 3D Gyro Tilt */
.opt1-spotlight {
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s;
}
.opt1-spotlight::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.25), transparent 70%);
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}
.opt1-spotlight:hover::after {
  opacity: 1;
}

/* Opt 2: Cyber-Glass Neo-Bento */
.opt2-cyber {
  position: relative;
  background: rgba(15, 23, 42, 0.8) !important;
  color: #fff !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  overflow: hidden;
  transition: scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.opt2-cyber .story-role-title, .opt2-cyber .story-desc-text, .opt2-cyber .story-date {
  color: #fff !important;
}
.opt2-cyber::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(transparent, transparent, transparent, #10b981, #0284c7);
  animation: opt2-spin 4s linear infinite;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}
.opt2-cyber::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: inherit;
  z-index: -1;
}
.opt2-cyber:hover::before {
  opacity: 1;
}
.opt2-cyber:hover {
  scale: 1.02;
}
@keyframes opt2-spin { 100% { transform: rotate(360deg); } }

/* Opt 3: Kinetic Elastic Float */
.opt3-kinetic {
  transition: translate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s;
}
.opt3-kinetic:hover {
  translate: 0 -12px;
  box-shadow: 0 25px 40px -10px rgba(16, 185, 129, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1) !important;
}

/* Opt 4: Interactive Circuit Glow */
.opt4-circuit {
  position: relative;
  border: 2px solid transparent !important;
  background-clip: padding-box !important;
  transition: scale 0.15s, box-shadow 0.3s, border-color 0.3s;
}
.opt4-circuit:hover {
  border-color: #10b981 !important;
  box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.4) !important;
}
.opt4-circuit:active {
  scale: 0.96;
}
.opt4-circuit::before, .opt4-circuit::after {
  content: ''; position: absolute; width: 15px; height: 15px; border: 2px solid #10b981; opacity: 0; transition: 0.3s; pointer-events: none; z-index: 10;
}
.opt4-circuit::before { top: -2px; left: -2px; border-right: none; border-bottom: none; border-radius: var(--radius-lg) 0 0 0; }
.opt4-circuit::after { bottom: -2px; right: -2px; border-left: none; border-top: none; border-radius: 0 0 var(--radius-lg) 0; }
.opt4-circuit:hover::before, .opt4-circuit:hover::after { opacity: 1; }

/* Opt 5: Liquid Morphic Aurora Glass */
.opt5-aurora {
  position: relative;
  backdrop-filter: blur(24px) !important;
  background: rgba(255, 255, 255, 0.6) !important;
  overflow: hidden;
  transition: scale 0.4s;
  z-index: 1;
}
.opt5-aurora::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.5), rgba(124, 58, 237, 0.4), transparent 60%);
  opacity: 0;
  transition: opacity 0.5s, transform 3s ease-out;
  z-index: -1;
  pointer-events: none;
}
.opt5-aurora:hover::before {
  opacity: 1;
  transform: scale(1.3) translate(5%, 5%);
}
.opt5-aurora:hover {
  scale: 1.03;
}
`;

fs.appendFileSync('css/style.css', cssToAdd);

// JS Appending for Opt 1 spotlight & tilt
const jsToAdd = `
// Opt 1 JS implementation
document.addEventListener('DOMContentLoaded', () => {
  const opt1Cards = document.querySelectorAll('.opt1-spotlight');
  opt1Cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', \`\${x}px\`);
      card.style.setProperty('--mouse-y', \`\${y}px\`);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      // We use !important or style.cssText to override GSAP inline styles temporarily
      card.style.cssText += \`transform: perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale3d(1.02, 1.02, 1.02) !important;\`;
    });
    
    card.addEventListener('mouseleave', () => {
      // Revert to GSAP or default
      card.style.transform = ''; 
    });
  });
});
`;

fs.appendFileSync('js/main.js', jsToAdd);

console.log("Done");
