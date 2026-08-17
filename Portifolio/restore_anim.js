const fs = require('fs');
let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// Add toggleActions and adjust the start point so it's visible when it triggers
js = js.replace(/start:\s*['"]top 95%['"],\s*end:\s*['"]top 40%['"],\s*invalidateOnRefresh:\s*true/g, 
  "start: 'top 80%', end: 'top 20%', toggleActions: 'play reverse play reverse', invalidateOnRefresh: true");

// Increase durations so the massive 100vw travel distance doesn't finish instantly
js = js.replace(/dur:\s*0\.75/g, 'dur: 1.5');
js = js.replace(/duration:\s*0\.7/g, 'duration: 1.5');
js = js.replace(/duration:\s*0\.6/g, 'duration: 1.2');
js = js.replace(/duration:\s*1/g, 'duration: 1.5'); 

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Animation triggers adjusted.');
