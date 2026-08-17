(function () {
  'use strict';

  function initScrollCardEngine() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollCardEngine: GSAP or ScrollTrigger missing.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ force3D: true });

    // Define the sections and the cards within them
    const sections = [
      { id: '#about', selectors: ['.about-card', '.about-stats .stat-item', '.about-actions-list .action-card'] },
      { id: '#experience', selectors: ['.story-card'] },
      { id: '#skills', selectors: ['.skill-pillar-card', '.dev-service-card'] },
      { id: '#projects', selectors: ['.project-featured-stage', '.project-card'] },
      { id: '#testimonials', selectors: ['.testimonial-card'] },
      { id: '#contact', selectors: ['.contact-info-card'] }
    ];

    sections.forEach(sec => {
      // Gather all card elements for this section
      let allElements = [];
      sec.selectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => allElements.push(el));
      });

      if (!allElements.length) return;

      // Create a single simple scrub timeline for the section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec.id,
          start: 'top 90%',
          end: 'center center',
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // Half from left, half from right, simultaneously
      allElements.forEach((el, index) => {
        const startX = index % 2 === 0 ? "-100vw" : "100vw";
        
        // Remove any kinetic properties (scale, rotation, blur)
        // Just simple, hardware-accelerated X translation and opacity
        tl.fromTo(
          el,
          { x: startX, opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out', force3D: true },
          0 // 0 means they all start moving at the exact same time
        );
      });
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollCardEngine);
  } else {
    initScrollCardEngine();
  }
})();
