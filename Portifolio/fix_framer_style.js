const fs = require('fs');

let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Fix the syntax error from the broken duration replacements
js = js.replace(/duration:\s*1\.5\.\d+/g, 'duration: 1.5');
js = js.replace(/dur:\s*1\.5\.\d+/g, 'dur: 1.5');

// Now, the user explicitly wants the "Kinetic Elastic Float & Multi-Layer Depth Lift (Vercel / Framer Style)"
// This means we should stop using extreme 100vw horizontal translations, and instead use the classic Framer 3D lift from the bottom.

// Let's replace the extreme x: "100vw" or x: "-100vw" with an elegant Vercel/Framer style lift.
// For the About card:
js = js.replace(/x:\s*"-100vw",\s*y:\s*"100vh"/g, 'x: -50, y: 150');
js = js.replace(/x:\s*"-100vw",\s*y:\s*100/g, 'x: -50, y: 150');

// For story cards:
js = js.replace(/x:\s*side,\s*y:\s*"100vh"/g, 'x: side < 0 ? -50 : 50, y: 150');

// For skill cards:
js = js.replace(/x:\s*cfg\.x,\s*y:\s*cfg\.y/g, 'x: 0, y: 150');

// For contact configs:
js = js.replace(/\{ x: "-100vw", y: "100vh", rot: -8/g, '{ x: -60, y: 150, rot: -4');
js = js.replace(/\{ x: 0, y: "100vh", rot: 0/g, '{ x: 0, y: 150, rot: 0');
js = js.replace(/\{ x: "100vw", y: "100vh", rot: 8/g, '{ x: 60, y: 150, rot: 4');

// Ensure ease has an elastic/bouncy feel if scrub is ever disabled, though scrub: 1 handles the motion nicely
js = js.replace(/ease:\s*'power2\.out'/g, "ease: 'back.out(1.5)'");

// Remove the extreme x: "100vw" globally if missed
js = js.replace(/x:\s*"100vw"/g, 'x: 60');
js = js.replace(/x:\s*"-100vw"/g, 'x: -60');
js = js.replace(/y:\s*"100vh"/g, 'y: 150');

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Framer style applied and syntax fixed.');
