const fs = require('fs');

// 1. Clean index.html
let html = fs.readFileSync('index.html', 'utf8');

// Remove classes
html = html.replace(/ opt1-spotlight/g, '');
html = html.replace(/ opt2-cyber/g, '');
html = html.replace(/ opt3-kinetic/g, '');
html = html.replace(/ opt4-circuit/g, '');
html = html.replace(/ opt5-aurora/g, '');

// Remove labels
html = html.replace(/\n\s*<div style="position:absolute; top:10px; right:10px; background:#000; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; z-index:999; pointer-events:none;">.*?<\/div>/g, '');

fs.writeFileSync('index.html', html);

// 2. Clean style.css
let css = fs.readFileSync('css/style.css', 'utf8');
const cssMarker = "/* ==========================================================================\n   TEMPORARY ANIMATION OPTIONS FOR PREVIEW\n   ========================================================================== */";
const cssIndex = css.indexOf(cssMarker);
if (cssIndex !== -1) {
    fs.writeFileSync('css/style.css', css.substring(0, cssIndex));
}

// 3. Clean main.js
let js = fs.readFileSync('js/main.js', 'utf8');
const jsMarker = "// Opt 1 JS implementation";
const jsIndex = js.indexOf(jsMarker);
if (jsIndex !== -1) {
    fs.writeFileSync('js/main.js', js.substring(0, jsIndex).trim() + '\n');
}

console.log("Cleaned");
