const fs = require('fs');

let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Replace x offsets with viewport widths
js = js.replace(/x:\s*-60/g, 'x: "-100vw"');
js = js.replace(/x:\s*60/g, 'x: "100vw"');
js = js.replace(/x:\s*-50/g, 'x: "-100vw"');
js = js.replace(/x:\s*50/g, 'x: "100vw"');
js = js.replace(/x:\s*side\s*<\s*0\s*\?\s*-50\s*:\s*50/g, 'x: side < 0 ? "-100vw" : "100vw"');

// Replace y offsets with viewport heights to make them come from extreme edges vertically too
js = js.replace(/y:\s*150/g, 'y: "100vh"');
js = js.replace(/y:\s*80/g, 'y: "100vh"');
js = js.replace(/y:\s*160/g, 'y: "100vh"');
js = js.replace(/y:\s*60/g, 'y: "100vh"');
js = js.replace(/y:\s*-40/g, 'y: "-100vh"');
js = js.replace(/y:\s*100/g, 'y: "100vh"'); // mainly in fallback configs like y: 100

// Make sure any zero x coordinates stay zero if they are meant to just come straight up from the bottom edge:
// Contact section config had `{ x: 0, y: 150... }`. It becomes `{ x: 0, y: "100vh"... }` which is fine (bottom edge).

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Restored extreme edge travel distances.');
