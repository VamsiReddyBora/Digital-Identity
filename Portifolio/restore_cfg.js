const fs = require('fs');

let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// For storyCards
js = js.replace(/x:\s*0,\s*y:\s*"100vh",\s*\n\s*rotationZ:\s*cfg\.rot/g, 
  'x: cfg.x, y: cfg.y,\n              rotationZ: cfg.rot');

// For skillPillars
// Wait, skillPillars had x: 0, y: "100vh"
js = js.replace(/x:\s*0,\s*y:\s*"100vh",\s*\n\s*rotationZ:\s*cfg\.rot/g, 
  'x: cfg.x, y: cfg.y,\n              rotationZ: cfg.rot');

// For projectGridCards
// Wait, they had x: 0, y: "100vh"
// Let's just globally replace that pattern because it happens multiple times
js = js.replace(/x:\s*0,\s*y:\s*["']100vh["'],\s*\n\s*rotationZ:\s*cfg\.rot/g, 
  'x: cfg.x, y: cfg.y,\n              rotationZ: cfg.rot');

// For contactCards, it is on one line:
// { x: 0, y: "100vh", rotationZ: cfg.rot, scale: cfg.scale, opacity: 0 }
js = js.replace(/\{\s*x:\s*0,\s*y:\s*["']100vh["'],\s*rotationZ:\s*cfg\.rot/g, 
  '{ x: cfg.x, y: cfg.y, rotationZ: cfg.rot');

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Restored cfg.x and cfg.y');
