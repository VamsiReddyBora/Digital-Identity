const fs = require('fs');

let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Remove scrub completely from all ScrollTrigger configs
// Wait, replacing 'scrub: 1,' or 'scrub: 1'
js = js.replace(/scrub:\s*1,?\s*/g, '');

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log("Scrub removed.");
