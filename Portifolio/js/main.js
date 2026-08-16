/**
 * ==========================================================================
 * Portfolio Main Interactions — Premium Animation Engine
 * Author: Vamsi Reddy Bora
 *
 * 1. Physics-Driven Bidirectional Scroll & Mouse Reactive Card Engine
 * 2. Matrix Decrypt Name Scrambler (smooth, full-name, isolated)
 * 3. Role Ticker, Magnetic Buttons, Tilt, Ripple, Nav, Modals
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. SCROLL-SCRUBBED "ABOUT ME" CYLINDRICAL STICKER UNROLL (WebGL / Three.js)
  //
  // - Powered by js/about-sticker-roll.js with 64x64 subdivided mesh & custom vertex shader.
  // - Anchored permanently at BOTTOM-RIGHT corner (zero translation, constant anchor).
  // - TOP-LEFT corner is rolled inward toward the bottom-right anchor.
  // - Scrolling DOWN progressively unrolls the sticker diagonally (BOTTOM-RIGHT -> TOP-LEFT).
  // - 100% direct scroll-scrubbed (scrub: true, ease: 'none') and symmetrically reversible.
  // ==========================================================================

  // (Scrambler removed)

  // ==========================================================================
  // 3. DYNAMIC HERO ROLE TICKER
  // ==========================================================================
  const roleTitles = [
    'Electronics & Comm. Engineer',
    'Embedded Systems & Firmware Developer',
    'IoT & Microcontroller Architect',
    'RTOS & Low-Level C/C++ Specialist',
  ];

  const roleTickerEl = document.getElementById('hero-role-ticker');
  if (roleTickerEl) {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % roleTitles.length;
      roleTickerEl.innerHTML = `<span>${roleTitles[idx]}</span>`;
    }, 3200);
  }

  // ==========================================================================
  // 4. ACTIVE NAV HIGHLIGHT ON SCROLL
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = (window.scrollY || window.pageYOffset) + 200;
    sections.forEach((section) => {
      const id = section.getAttribute('id');
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { passive: true });

  // ==========================================================================
  // 5. BACK TO TOP BUTTON
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', (window.scrollY || window.pageYOffset) > 400);
    }, { passive: true });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 6. MOBILE NAV TOGGLE
  // ==========================================================================
  const navToggle = document.getElementById('nav-toggle');
  const navPillGroup = document.querySelector('.nav-pill-group');

  if (navToggle && navPillGroup) {
    navToggle.addEventListener('click', () => {
      const visible = navPillGroup.style.display === 'flex';
      if (visible) {
        navPillGroup.style.display = 'none';
      } else {
        Object.assign(navPillGroup.style, {
          display: 'flex',
          position: 'absolute',
          top: '70px',
          left: '20px',
          right: '20px',
          flexDirection: 'column',
          padding: '16px',
          borderRadius: '16px',
        });
      }
    });
  }

  // ==========================================================================
  // 7. MAGNETIC BUTTONS
  // ==========================================================================
  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.28;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ==========================================================================
  // 8. CLICK RIPPLE
  // ==========================================================================
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes _ripple { to { transform: scale(3); opacity: 0; } }
    ._ripple-span {
      position: absolute; border-radius: 50%;
      background: rgba(16, 185, 129, 0.3);
      transform: scale(0);
      animation: _ripple 0.65s linear;
      pointer-events: none;
    }
  `;
  document.head.appendChild(rippleStyle);

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn, .action-card, .pill-badge, .floating-badge');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = '_ripple-span';
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    target.style.position = target.style.position || 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(span);
    setTimeout(() => span.remove(), 700);
  });

  // ==========================================================================
  // 9. STORY ACCORDION
  // ==========================================================================
  document.querySelectorAll('.story-expandable').forEach((row) => {
    row.addEventListener('click', () => {
      const body = row.querySelector('.story-body');
      if (!body) return;
      const wasHidden = body.classList.contains('hidden');
      document.querySelectorAll('.story-body').forEach((b) => b.classList.add('hidden'));
      if (wasHidden) body.classList.remove('hidden');
    });
  });

  // ==========================================================================
  // 10. PROJECT FILTER TABS
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? 'flex' : 'none';
        if (show) card.style.animation = '_fadeCard 0.4s ease forwards';
      });
    });
  });

  const filterAnim = document.createElement('style');
  filterAnim.textContent = `@keyframes _fadeCard { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }`;
  document.head.appendChild(filterAnim);

  // ==========================================================================
  // 11. TOAST SYSTEM
  // ==========================================================================
  window.showToast = function(msg, icon = '⚡') {
    let box = document.querySelector('.toast-container');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toast-container';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity 0.4s, transform 0.4s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(20px)';
      setTimeout(() => t.remove(), 450);
    }, 3500);
  };

  // ==========================================================================
  // 12. CONTACT MODAL
  // ==========================================================================
  const contactModal = document.getElementById('contact-modal');
  document.querySelectorAll('.open-contact-modal').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.preventDefault(); contactModal?.classList.add('active'); });
  });
  document.getElementById('close-modal')?.addEventListener('click', () => {
    contactModal?.classList.remove('active');
  });
  contactModal?.addEventListener('click', (e) => {
    if (e.target === contactModal) contactModal.classList.remove('active');
  });
  document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    contactModal?.classList.remove('active');
    e.target.reset();
    window.showToast('Message transmitted successfully!', '📡');
  });

  // ==========================================================================
  // 13. NEWSLETTER
  // ==========================================================================
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('.newsletter-input')?.value;
    if (email) {
      window.showToast(`Subscribed: ${email}`, '🍃');
      e.target.reset();
    }
  });

  // ==========================================================================
  // 14. ROLE DOT HOVER
  // ==========================================================================
  document.querySelectorAll('.role-item').forEach((item) => {
    const dot = item.querySelector('.role-dot');
    if (!dot) return;
    item.addEventListener('mouseenter', () => {
      dot.style.background = '#059669';
      dot.style.boxShadow = '0 0 20px #10b981';
    });
    item.addEventListener('mouseleave', () => {
      dot.style.background = '';
      dot.style.boxShadow = '';
    });
  });

  // ==========================================================================
  // 15. SEAMLESS MULTI-TILE 5K PARALLAX SCROLL ENGINE
  // ==========================================================================
  const parallaxTrack = document.getElementById('parallax-track');
  if (parallaxTrack) {
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY || window.pageYOffset;
      // Generous, dynamic 0.45 parallax motion across the multi-tile seamless track
      parallaxTrack.style.transform = `translate3d(0, ${-(scrollY * 0.45).toFixed(2)}px, 0)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }
});
