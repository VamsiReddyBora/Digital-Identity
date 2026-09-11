/**
 * Portfolio Interactive Logic
 * Lightweight, Vanilla ES6+
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  const mobileToggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.header');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyPhoneBtn = document.getElementById('copyPhoneBtn');
  const contactForm = document.getElementById('contactForm');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const toastContainer = document.getElementById('toastContainer');

  /* ==========================================
     1. Theme Management (Dark / Light)
     ========================================== */
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const setTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  };

  // Initialize theme
  setTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });

  /* ==========================================
     2. Header Scroll Effect (Hide on Down, Show on Up)
     ========================================== */
  let lastScrollY = window.scrollY;
  const scrollThreshold = 8;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Header background styling when scrolled
    if (currentScrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Keep header visible if mobile drawer is currently open
    if (navMenu && navMenu.classList.contains('open')) {
      header?.classList.remove('header-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Determine scroll direction with threshold to prevent flicker
    const scrollDifference = currentScrollY - lastScrollY;

    if (Math.abs(scrollDifference) >= scrollThreshold) {
      if (currentScrollY > 90 && scrollDifference > 0) {
        // Scrolling DOWN -> Hide Header
        header?.classList.add('header-hidden');
      } else if (scrollDifference < 0) {
        // Scrolling UP -> Show Header
        header?.classList.remove('header-hidden');
      }
      lastScrollY = Math.max(0, currentScrollY);
    }

    // Always reveal at the very top of page
    if (currentScrollY <= 20) {
      header?.classList.remove('header-hidden');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ==========================================
     3. Mobile Navigation Menu
     ========================================== */
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking nav links
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        mobileToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================
     4. Active Nav Item (ScrollSpy)
     ========================================== */
  const sections = document.querySelectorAll('section[id]');
  
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };

  const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach((section) => sectionObserver.observe(section));

  /* ==========================================
     5. Card Slide-In & Slide-Out Animation System (Horizontal Edge Slide)
        Cards slide in horizontally from the edges on scroll,
        and slide back into the edges when leaving view.
     ========================================== */
  const elementsToAnimate = [
    document.querySelector('.stats-strip'),
    document.querySelector('.about-card'),
    ...document.querySelectorAll('.skill-category-card'),
    ...document.querySelectorAll('.project-card'),
    ...document.querySelectorAll('.timeline-content'),
    ...document.querySelectorAll('.certification-card'),
    document.querySelector('.contact-info-card'),
    document.querySelector('.contact-form-card')
  ].filter(Boolean);

  // Clean up any legacy wrapper elements from carpet-roll system
  document.querySelectorAll('.yoga-roller, .carpet-roll-segments').forEach((el) => el.remove());
  document.querySelectorAll('.carpet-roll-wrapper').forEach((wrapper) => {
    const target = wrapper.querySelector('.carpet-roll-target');
    if (target) {
      target.classList.remove('carpet-roll-target');
      target.style.visibility = '';
      wrapper.parentNode.insertBefore(target, wrapper);
    }
    wrapper.remove();
  });

  // Assign edge slide directions and staggered entry delays
  elementsToAnimate.forEach((el, index) => {
    el.classList.remove('carpet-fold-card', 'carpet-fold-left', 'carpet-fold-right', 'yoga-mat-card');

    if (el.classList.contains('contact-info-card') || el.classList.contains('about-card') || el.classList.contains('stats-strip')) {
      el.classList.add('slide-card', 'slide-edge-left');
      el.dataset.delay = '0ms';
    } else if (el.classList.contains('contact-form-card')) {
      el.classList.add('slide-card', 'slide-edge-right');
      el.dataset.delay = '80ms';
    } else if (el.classList.contains('skill-category-card')) {
      el.classList.add('slide-card', 'slide-edge-right');
      el.dataset.delay = `${(index % 3) * 70}ms`;
    } else if (el.classList.contains('timeline-content')) {
      el.classList.add('slide-card', 'slide-edge-right');
      el.dataset.delay = `${(index % 2) * 60}ms`;
    } else {
      // Projects & Certifications: alternate left and right edges
      const isLeft = (index % 2 === 0);
      el.classList.add('slide-card', isLeft ? 'slide-edge-left' : 'slide-edge-right');
      el.dataset.delay = `${(index % 3) * 75}ms`;
    }
    el.style.transitionDelay = el.dataset.delay;
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Restore wave stagger delay on enter
        entry.target.style.transitionDelay = entry.target.dataset.delay || '0ms';
        entry.target.classList.add('in-view');
      } else {
        // Immediate smooth retreat into edge on exit without waiting for delay
        entry.target.style.transitionDelay = '0ms';
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  });

  elementsToAnimate.forEach((el) => slideObserver.observe(el));

  /* ==========================================
     6. Project Filtering with Edge Slide Dynamics
     ========================================== */
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card, idx) => {
        const category = card.getAttribute('data-category');
        const shouldShow = (filterValue === 'all' || category === filterValue);

        if (!shouldShow) {
          // Slide out into edges
          card.classList.add('filter-leaving');
          card.classList.remove('in-view');
          setTimeout(() => {
            card.classList.add('hidden');
            card.classList.remove('filter-leaving');
          }, 350);
        } else {
          card.classList.remove('hidden');
          card.classList.add('filter-entering');
          setTimeout(() => {
            card.classList.remove('filter-entering');
            card.classList.add('in-view');
          }, 30 + (idx % 3) * 60);
        }
      });
    });
  });

  /* ==========================================
     6. Copy Contact Details to Clipboard (Inline Feedback, No Popups)
     ========================================== */
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'vamsireddy2534@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      const labelSpan = copyEmailBtn.querySelector('span');
      if (labelSpan) {
        const orig = labelSpan.textContent;
        labelSpan.textContent = 'Copied!';
        setTimeout(() => { labelSpan.textContent = orig; }, 1800);
      }
    });
  }

  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', async () => {
      const phone = copyPhoneBtn.getAttribute('data-phone') || '8688869780';
      try {
        await navigator.clipboard.writeText(phone);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = phone;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    });
  }

  /* ==========================================
     6b. Smooth Back to Top Scroll
     ========================================== */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================
     7. Real Contact Form Submission (FormSubmit AJAX)
     ========================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Validation
      if (!name || !email || !message) {
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailInput?.focus();
        return;
      }

      const originalBtnHTML = submitBtn.innerHTML;

      // Provide responsive sending feedback
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin" style="width:15px;height:15px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Sending...
      `;

      try {
        const payload = {
          name: name,
          email: email,
          _subject: `Portfolio Message from ${name}: ${subject || 'General Inquiry'}`,
          subject: subject || 'General Inquiry',
          message: message,
          _captcha: 'false',
          _template: 'table'
        };

        const response = await fetch('https://formsubmit.co/ajax/vamsireddy2534@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        contactForm.reset();
        showToast('Message sent!');
      } catch (err) {
        console.error('Submission failed:', err);
        showToast('Failed to send. Please try again.', 3000, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  /* ==========================================
     8. Toast Notification System (Compact & Minimal)
     ========================================== */
  function showToast(message, duration = 2600, type = 'success') {
    if (!toastContainer) return;

    // Remove any previous toast for clean single display
    toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.setAttribute('role', 'alert');

    const iconSvg = type === 'error'
      ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="12" y1="8" x2="12" y2="12"></line>
           <line x1="12" y1="16" x2="12.01" y2="16"></line>
         </svg>`
      : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;">
           <polyline points="20 6 9 17 4 12"></polyline>
         </svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Trigger reveal animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, 250);
    }, duration);
  }
});
