const fs = require('fs');

let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Force GPU acceleration on all GSAP animations
if (!js.includes('gsap.config({')) {
  js = js.replace("gsap.registerPlugin(ScrollTrigger);", "gsap.registerPlugin(ScrollTrigger);\n    gsap.config({ force3D: true });");
}

// Add force3D: true to all destination objects in fromTo
js = js.replace(/opacity:\s*1,\s*\n\s*ease:/g, "opacity: 1,\n              force3D: true,\n              ease:");

// Replace ease: 'back.out(1.5)' with ease: 'power2.out' for massive travels. 
// Why? Because elastic physics over a 100vw distance means it literally swings out to -20vw and then snaps back.
// The overshoot over a massive distance feels like stuttering or weird lag to a user!
// 100vw with an elastic overshoot of 1.5 means the card shoots past the center, goes 50% further (50vw) and springs back. That feels terrible and laggy!
js = js.replace(/ease:\s*['"]back\.out\(1\.5\)['"]/g, "ease: 'power3.out'");

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Silky smooth optimizations applied.');
