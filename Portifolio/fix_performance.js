const fs = require('fs');
let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Scrub updates globally
js = js.replace(/scrub:\s*true/g, 'scrub: 1');

// Remove filter properties in fromTo objects
js = js.replace(/,\s*filter:\s*[`'"].*?[`'"]/g, '');

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log("Performance fixes applied.");
