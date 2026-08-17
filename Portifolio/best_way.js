const fs = require('fs');
let js = fs.readFileSync('js/scroll-card-engine.js', 'utf8');

// The current triggers look like:
// start: 'top 80%', end: 'top 20%', toggleActions: 'play reverse play reverse', invalidateOnRefresh: true

// Let's replace the whole scrollTrigger block fields.
js = js.replace(/start:\s*['"]top 80%['"],\s*end:\s*['"]top 20%['"],\s*toggleActions:\s*['"]play reverse play reverse['"],\s*invalidateOnRefresh:\s*true/g, 
  "start: 'top 90%',\n            end: 'center center',\n            scrub: 1,\n            invalidateOnRefresh: true");

// For mobile triggers, they might not have toggleActions yet if I didn't update them, wait, my previous regex updated globally:
// "start:\s*['"]top 95%['"],\s*end:\s*['"]top 40%['"],\s*invalidateOnRefresh:\s*true" globally
// So all of them should have toggleActions.

// Wait, let's just do a robust regex to replace any scrollTrigger contents
js = js.replace(/scrollTrigger:\s*\{[^}]+\}/g, (match) => {
  // extract trigger name
  const triggerMatch = match.match(/trigger:\s*([^,\n]+)/);
  const trigger = triggerMatch ? triggerMatch[1] : "'#about'";
  return `scrollTrigger: {
            trigger: ${trigger},
            start: 'top 90%',
            end: 'center center',
            scrub: 1,
            invalidateOnRefresh: true
          }`;
});

// Remove any duration fields from fromTo since scrub will override them, but it doesn't hurt.
// I'll leave durations as they are, GSAP ignores them when scrubbing.

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Best scroll config applied.');
