const fs = require('fs');
let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Scrub and Start updates globally
js = js.replace(/scrub: [0-9.]+/g, 'scrub: true');
js = js.replace(/start: 'top [0-9]+%'/g, "start: 'top 95%'");
js = js.replace(/end: 'top [0-9]+%'/g, "end: 'top 40%'");

// About Card
js = js.replace(/x: -240,/g, 'x: "-100vw",');
js = js.replace(/y: 90,/g, 'y: "100vh",');
js = js.replace(/x: 120,/g, 'x: "100vw",'); // Action cards

// Experience Stories
js = js.replace(
  /const storyConfigs = \[.*?\];/s,
  `const storyConfigs = [
          { x: "-100vw", y: 60, rot: -8, scale: 0.86, blur: 12, start: 0.00, dur: 0.75 },
          { x: "100vw", y: -40, rot: 7, scale: 0.88, blur: 10, start: 0.12, dur: 0.78 },
          { x: "-100vw", y: 160, rot: -6, scale: 0.90, blur: 8, start: 0.22, dur: 0.78 }
        ];`
);

// Skills
js = js.replace(
  /const pillarConfigs = \[.*?\];/s,
  `const pillarConfigs = [
          { x: "-100vw", y: "-100vh", rot: -14, scale: 0.82, start: 0.00, dur: 0.65 },
          { x: "-100vw", y: "100vh", rot: 12, scale: 0.84, start: 0.08, dur: 0.68 },
          { x: "100vw", y: "-100vh", rot: 14, scale: 0.82, start: 0.16, dur: 0.70 },
          { x: "100vw", y: "100vh", rot: -12, scale: 0.84, start: 0.24, dur: 0.72 }
        ];`
);

js = js.replace(/x: -220,/g, 'x: "-100vw",');
js = js.replace(/x: 220,/g, 'x: "100vw",');

// Projects
js = js.replace(/y: 120, scale: 0.90, rotationX: 10/g, 'y: "100vh", scale: 0.90, rotationX: 10');
js = js.replace(
  /const projConfigs = \[.*?\];/s,
  `const projConfigs = [
          { x: "-100vw", y: 80, rot: -10, scale: 0.85, start: 0.25, dur: 0.70 },
          { x: 0, y: "100vh", rot: 3, scale: 0.88, start: 0.35, dur: 0.68 },
          { x: "100vw", y: 80, rot: 10, scale: 0.85, start: 0.45, dur: 0.70 }
        ];`
);

// Testimonials
js = js.replace(
  /const testConfigs = \[.*?\];/s,
  `const testConfigs = [
          { x: "-100vw", y: 50, rot: -8, scale: 0.88, start: 0.00, dur: 0.75 },
          { x: 0, y: "100vh", rot: 0, scale: 0.90, start: 0.15, dur: 0.75 },
          { x: "100vw", y: 50, rot: 8, scale: 0.88, start: 0.28, dur: 0.75 }
        ];`
);

// Add Contact Section block for desktop
const contactBlock = `
      // --- F. CONTACT SECTION ---
      const contactCards = document.querySelectorAll('.contact-details-grid .contact-info-card');
      if (contactCards.length) {
        const tlContact = gsap.timeline({
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 95%',
            end: 'top 40%',
            scrub: true,
            invalidateOnRefresh: true
          }
        });

        const contactConfigs = [
          { x: "-100vw", y: 50, rot: -8, scale: 0.88, start: 0.00, dur: 0.75 },
          { x: 0, y: "100vh", rot: 0, scale: 0.90, start: 0.15, dur: 0.75 },
          { x: "100vw", y: 50, rot: 8, scale: 0.88, start: 0.28, dur: 0.75 }
        ];

        contactCards.forEach((card, i) => {
          const cfg = contactConfigs[i] || { x: 0, y: "100vh", rot: 0, scale: 0.9, start: 0.1 * i, dur: 0.7 };
          tlContact.fromTo(
            card,
            { x: cfg.x, y: cfg.y, rotationZ: cfg.rot, scale: cfg.scale, opacity: 0, filter: 'blur(10px)' },
            { x: 0, y: 0, rotationZ: 0, scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: cfg.dur },
            cfg.start
          );
        });
      }
`;

// Insert Contact block right before "}); // ========================================================================" (end of desktop block)
js = js.replace(/      }\s*\}\);\s*\/\/\s*========================================================================/s, `      }\n${contactBlock}\n    });\n\n    // ========================================================================`);

// Mobile config updates
js = js.replace(
  /const cardSections = \[.*?\];/s,
  `const cardSections = [
        { trigger: '#about', targets: '.about-card', start: 'top 95%', end: 'top 40%' },
        { trigger: '#experience', targets: '.story-card', start: 'top 95%', end: 'top 40%' },
        { trigger: '#skills', targets: '.skill-pillar-card, .dev-service-card', start: 'top 95%', end: 'top 40%' },
        { trigger: '#projects', targets: '.project-featured-stage, .project-card', start: 'top 95%', end: 'top 40%' },
        { trigger: '#testimonials', targets: '.testimonial-card', start: 'top 95%', end: 'top 40%' },
        { trigger: '#contact', targets: '.contact-info-card', start: 'top 95%', end: 'top 40%' }
      ];`
);

js = js.replace(/const side = idx % 2 === 0 \? -60 : 60;/g, 'const side = idx % 2 === 0 ? "-100vw" : "100vw";');
js = js.replace(/y: 50,/g, 'y: "100vh",');

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log("Updated scroll engine.");
