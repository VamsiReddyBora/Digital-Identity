(function () {
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

    // 1. Bidirectional global slide (excluding testimonials and projects)
    const sections = document.querySelectorAll('section, header');
    
    sections.forEach(sec => {
      const bidiCards = sec.querySelectorAll('.glass-panel:not(.testimonial-card):not(.project-card)');
      if (!bidiCards.length) return;

      bidiCards.forEach((el, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top bottom', // Starts when TOP of card hits BOTTOM of screen
            end: 'bottom top',   // Ends when BOTTOM of card hits TOP of screen
            scrub: 1
          }
        });

        // Alternating logic resets to 0 for every section, ensuring the first card is ALWAYS from the left
        const startX = index % 2 === 0 ? "-100vw" : "100vw";
        const endX = index % 2 === 0 ? "100vw" : "-100vw";

        // Phase 1: Entry
        tl.from(el, { x: startX, opacity: 0, ease: 'power2.out', duration: 1, force3D: true });

        // Phase 2: Rest (empty tween just to hold the position in the center while scrolling)
        tl.to({}, { duration: 1.5 });

        // Phase 3: Exit
        tl.to(el, { x: endX, opacity: 0, ease: 'power2.in', duration: 1, force3D: true });
      });
    });

    // 2. 3D Isometric Origami Unfold for Testimonials
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    if (testimonialsGrid && testimonials.length) {
      const isMobile = window.innerWidth < 768;
      const angle = isMobile ? -60 : -90;

      gsap.fromTo(testimonials,
        {
          opacity: 0,
          rotationX: angle,
          y: 40,
          scale: 0.9
        },
        {
          opacity: 1,
          rotationX: 0,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'back.out(1.4)',
          force3D: true,
          stagger: 0.2,
          scrollTrigger: {
            trigger: testimonialsGrid,
            start: 'top 85%', 
            toggleActions: 'play none none reverse' 
          }
        }
      );
    }

    // 3. Radial Burst (Pinwheel Expansion) for Projects
    const projectsGrid = document.querySelector('.projects-grid');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectsGrid && projectCards.length > 0) {
      const tlBurst = gsap.timeline({
        scrollTrigger: {
          trigger: projectsGrid,
          start: 'top 100%', // Begin bursting the exact millisecond the grid touches the bottom of screen
          end: 'top 65%', // Finish bursting completely much faster, by the time it reaches 35% up
          scrub: 0.1 // Ultra-low latency scrub for extremely snappy expansion
        }
      });

      const isMobile = window.innerWidth < 768;

      projectCards.forEach((card, i) => {
        let xOffset = 0;
        let yOffset = 0;
        let rot = 0;

        if (i === 0) {
          xOffset = isMobile ? 0 : "calc(100% + 24px)";
          yOffset = isMobile ? "calc(100% + 24px)" : 0;
          rot = -25;
        } else if (i === 2) {
          xOffset = isMobile ? 0 : "calc(-100% - 24px)";
          yOffset = isMobile ? "calc(-100% - 24px)" : 0;
          rot = 25;
        }

        tlBurst.fromTo(card, {
          x: xOffset,
          y: yOffset,
          rotation: rot,
          scale: 0.4,
          opacity: 0
        }, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          ease: 'back.out(1.2)', 
          duration: 1,
          force3D: true
        }, 0);
      });
    }
  }

  // Handle initialization and robust layout recalculations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollCardEngine);
  } else {
    initScrollCardEngine();
  }

  // CRITICAL FIX: If images or fonts load late and change the page height, GSAP triggers break.
  // This ensures all trigger positions are perfectly recalculated after the page is fully visually rendered.
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  });

})();