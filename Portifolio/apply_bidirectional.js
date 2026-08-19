const fs = require('fs');

let js = `(function () {
  'use strict';

  function initScrollCardEngine() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollCardEngine: GSAP or ScrollTrigger missing.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ force3D: true });

    // Prevent horizontal overflow scrollbars from 100vw animations
    document.body.style.overflowX = 'hidden';

    const sections = [
      { id: '#about', selectors: ['.about-card', '.about-stats .stat-item', '.about-actions-list .action-card'] },
      { id: '#experience', selectors: ['.story-card'] },
      { id: '#skills', selectors: ['.skill-pillar-card', '.dev-service-card'] },
      { id: '#projects', selectors: ['.project-featured-stage', '.project-card'] },
      { id: '#testimonials', selectors: ['.testimonial-card'] },
      { id: '#contact', selectors: ['.contact-info-card'] }
    ];

    sections.forEach(sec => {
      let allElements = [];
      sec.selectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => allElements.push(el));
      });

      if (!allElements.length) return;

      allElements.forEach((el, index) => {
        // Create an individual timeline for each element mapped to its own viewport journey
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top bottom', // Timeline starts when the TOP of the card hits the BOTTOM of the screen
            end: 'bottom top',   // Timeline ends when the BOTTOM of the card hits the TOP of the screen
            scrub: 1,            // Smooth scroll tracking
            invalidateOnRefresh: true
          }
        });

        // Alternating logic (half left, half right)
        const startX = index % 2 === 0 ? "-100vw" : "100vw";
        const endX = index % 2 === 0 ? "100vw" : "-100vw";

        // Phase 1: Entry
        // Slides in from the edge and fades in
        tl.fromTo(el, 
          { x: startX, opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out', duration: 1, force3D: true }
        );

        // Phase 2: Rest
        // Stays perfectly centered and visible while scrolling through the middle of the screen
        tl.to(el, { x: 0, duration: 1.5 });

        // Phase 3: Exit
        // Slides out to the opposite edge and fades out as it leaves the top of the screen
        tl.to(el, 
          { x: endX, opacity: 0, ease: 'power2.in', duration: 1, force3D: true }
        );
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollCardEngine);
  } else {
    initScrollCardEngine();
  }
})();`;

fs.writeFileSync('js/scroll-card-engine.js', js);
console.log('Bidirectional enter-stay-exit scrub applied.');
